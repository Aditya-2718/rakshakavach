import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CoalMineSite, SensorNode, MineAlert, SectorPrediction, TelemetryPoint, SystemSettingsConfig } from '../types';
import { api } from '../services/api';
import { MINE_SITES, SENSOR_NODES, MINE_ALERTS, SECTOR_PREDICTIONS, HISTORICAL_TELEMETRY_SERIES, DEFAULT_SETTINGS } from '../services/mockData';
import { useAuth } from './AuthContext';
import { wsClient } from '../services/websocket';
import type { WsConnectionStatus } from '../services/websocket';

export interface SimulatorState {
  status: 'stopped' | 'running' | 'paused';
  scenario: 'normal' | 'gradual_displacement' | 'seismic_burst' | 'rapid_subsidence';
  mine_id: string;
  sector_id?: string;
  interval_seconds: number;
  step_counter: number;
  last_run_time?: string;
}

interface MineContextType {
  mines: CoalMineSite[];
  selectedMine: CoalMineSite;
  setSelectedMine: (mine: CoalMineSite) => void;
  sensors: SensorNode[];
  alerts: MineAlert[];
  predictions: SectorPrediction[];
  telemetry: TelemetryPoint[];
  settings: SystemSettingsConfig;
  isLoading: boolean;
  backendConnected: boolean;
  wsStatus: WsConnectionStatus;
  isSimulatedMode: boolean;
  lastTelemetryTimestamp: string | null;
  isStale: boolean;
  simulatorState: SimulatorState;
  acknowledgeAlert: (alertId: string, officerName?: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  calibrateSensor: (sensorId: string) => Promise<void>;
  updateSettings: (newSettings: SystemSettingsConfig) => Promise<void>;
  createSensor: (sensorData: Record<string, any>) => Promise<SensorNode | null>;
  startSimulator: (params?: { mine_id?: string; sector_id?: string; scenario?: string; interval?: number }) => Promise<void>;
  pauseSimulator: () => Promise<void>;
  resumeSimulator: () => Promise<void>;
  stopSimulator: () => Promise<void>;
  setSimulatorScenario: (scenario: string) => Promise<void>;
  resetSimulatorData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const MineContext = createContext<MineContextType | undefined>(undefined);

export const MineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [mines, setMines] = useState<CoalMineSite[]>(MINE_SITES);
  const [selectedMine, setSelectedMine] = useState<CoalMineSite>(MINE_SITES[0]);
  const [sensors, setSensors] = useState<SensorNode[]>(SENSOR_NODES);
  const [alerts, setAlerts] = useState<MineAlert[]>(MINE_ALERTS);
  const [predictions, setPredictions] = useState<SectorPrediction[]>(SECTOR_PREDICTIONS);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(HISTORICAL_TELEMETRY_SERIES);
  const [settings, setSettings] = useState<SystemSettingsConfig>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('disconnected');
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    status: 'stopped',
    scenario: 'normal',
    mine_id: selectedMine.id,
    interval_seconds: 3.0,
    step_counter: 0,
  });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const health = await api.checkHealth();
      setBackendConnected(health.connected);
      const [minesRes, sensorsRes, alertsRes, predRes, telemRes, settingsRes, simRes] = await Promise.all([
        api.getMines(),
        api.getSensors(selectedMine.id),
        api.getAlerts(selectedMine.id),
        api.getPredictions(selectedMine.id),
        api.getTelemetry(),
        api.getSettings(selectedMine.id),
        api.getSimulatorStatus().catch(() => null)
      ]);

      if (minesRes.data && minesRes.data.length > 0) setMines(minesRes.data);
      if (sensorsRes.data) setSensors(sensorsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (predRes.data) setPredictions(predRes.data);
      if (telemRes.data && telemRes.data.length > 0) {
        setTelemetry(telemRes.data);
        const latest = telemRes.data[telemRes.data.length - 1];
        if (latest?.timestamp) {
          setLastTelemetryTimestamp(latest.timestamp);
        }
      }
      if (settingsRes.data) setSettings(settingsRes.data);
      if (simRes) setSimulatorState(simRes);
    } catch (e) {
      console.warn('Using local geotechnical cache', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMine.id]);

  // Connect WebSocket & REST refresh on reconnect
  useEffect(() => {
    refreshData();
    wsClient.setOnReconnect(() => {
      refreshData();
    });
    wsClient.connect();

    const unsubStatus = wsClient.subscribeStatus((status) => setWsStatus(status));

    // Listen to live telemetry readings
    const unsubTelemetry = wsClient.subscribe('telemetry_reading', (evt) => {
      const payload = evt.data;
      if (payload && payload.telemetry) {
        const point: TelemetryPoint = payload.telemetry;
        setLastTelemetryTimestamp(evt.timestamp || point.timestamp);
        setIsStale(false);

        setTelemetry((prev) => {
          const next = [...prev, point];
          return next.slice(-100); // Keep max 100 in memory
        });
      }

      if (payload && payload.sensorSnapshot) {
        const snap: SensorNode = payload.sensorSnapshot;
        setSensors((prev) =>
          prev.map((s) => (s.id === snap.id ? { ...s, ...snap } : s))
        );
      }
    });

    // Listen to sensor status changes
    const unsubSensorStatus = wsClient.subscribe('sensor_status_changed', (evt) => {
      const { sensorId, newStatus } = evt.data || {};
      if (sensorId && newStatus) {
        setSensors((prev) =>
          prev.map((s) => (s.id === sensorId ? { ...s, status: newStatus as any } : s))
        );
      }
    });

    // Listen to live alert events
    const unsubAlertCreated = wsClient.subscribe('alert_created', (evt) => {
      const newAlert: MineAlert = evt.data;
      if (newAlert && newAlert.id) {
        setAlerts((prev) => {
          if (prev.some((a) => a.id === newAlert.id)) return prev;
          return [newAlert, ...prev];
        });
      }
    });

    // Listen to simulation status changes
    const unsubSimStatus = wsClient.subscribe('simulation_status_changed', (evt) => {
      if (evt.data) setSimulatorState(evt.data);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubSensorStatus();
      unsubAlertCreated();
      unsubSimStatus();
    };
  }, [refreshData, token]);

  // Check telemetry staleness periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lastTelemetryTimestamp) {
        setIsStale(true);
        return;
      }
      const diffMs = Date.now() - new Date(lastTelemetryTimestamp).getTime();
      setIsStale(diffMs > 60000); // >60 seconds is stale
    }, 5000);
    return () => clearInterval(timer);
  }, [lastTelemetryTimestamp]);

  const acknowledgeAlert = async (alertId: string, officerName: string = 'Er. Rajesh Sharma (Safety Officer)') => {
    try {
      await api.acknowledgeAlert(alertId, officerName);
    } catch (e) {
      console.error('Failed to acknowledge alert on backend:', e);
    }
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? {
              ...alt,
              status: 'acknowledged',
              acknowledgedBy: officerName,
              acknowledgedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
            }
          : alt
      )
    );
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
    } catch (e) {
      console.error('Failed to resolve alert on backend:', e);
    }
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, status: 'resolved' } : alt))
    );
  };

  const calibrateSensor = async (sensorId: string) => {
    try {
      await api.calibrateSensor(sensorId);
    } catch (e) {
      console.error('Failed to calibrate sensor on backend:', e);
    }
    setSensors((prev) =>
      prev.map((s) =>
        s.id === sensorId
          ? { ...s, lastSeen: 'Just calibrated', batteryPercent: Math.min(100, s.batteryPercent + 2) }
          : s
      )
    );
  };

  const handleUpdateSettings = async (newSettings: SystemSettingsConfig) => {
    setSettings(newSettings);
    try {
      await api.updateSettings(newSettings, selectedMine.id);
    } catch (e) {
      console.error('Failed to update settings on backend:', e);
    }
  };

  const handleCreateSensor = async (sensorData: Record<string, any>): Promise<SensorNode | null> => {
    try {
      const res = await api.createSensor({
        ...sensorData,
        mine_id: selectedMine.id,
      });
      if (res.data) {
        setSensors((prev) => [...prev, res.data]);
        return res.data;
      }
    } catch (e) {
      console.error('Failed to create sensor:', e);
    }
    return null;
  };

  // Simulator Controls
  const startSimulator = async (params?: { mine_id?: string; sector_id?: string; scenario?: string; interval?: number }) => {
    const res = await api.startSimulator({ mine_id: selectedMine.id, ...params });
    if (res?.config) setSimulatorState(res.config);
  };

  const pauseSimulator = async () => {
    const res = await api.pauseSimulator();
    if (res?.config) setSimulatorState(res.config);
  };

  const resumeSimulator = async () => {
    const res = await api.resumeSimulator();
    if (res?.config) setSimulatorState(res.config);
  };

  const stopSimulator = async () => {
    const res = await api.stopSimulator();
    if (res?.config) setSimulatorState(res.config);
  };

  const setSimulatorScenario = async (scenario: string) => {
    const res = await api.setSimulatorScenario(scenario);
    if (res?.config) setSimulatorState(res.config);
  };

  const resetSimulatorData = async () => {
    const res = await api.resetSimulatorData(true);
    if (res?.config) setSimulatorState(res.config);
    await refreshData();
  };

  return (
    <MineContext.Provider
      value={{
        mines,
        selectedMine,
        setSelectedMine,
        sensors,
        alerts,
        predictions,
        telemetry,
        settings,
        isLoading,
        backendConnected,
        wsStatus,
        isSimulatedMode: !backendConnected,
        lastTelemetryTimestamp,
        isStale,
        simulatorState,
        acknowledgeAlert,
        resolveAlert,
        calibrateSensor,
        updateSettings: handleUpdateSettings,
        createSensor: handleCreateSensor,
        startSimulator,
        pauseSimulator,
        resumeSimulator,
        stopSimulator,
        setSimulatorScenario,
        resetSimulatorData,
        refreshData
      }}
    >
      {children}
    </MineContext.Provider>
  );
};

export const useMine = (): MineContextType => {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
};
