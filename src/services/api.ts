/**
 * MineGuard API Client
 * 
 * Automatically uses the FastAPI backend when available.
 * Falls back to mock data (local cache) if the backend is unreachable.
 * All authenticated endpoints include the JWT from localStorage.
 */
import type {
  CoalMineSite, SensorNode, MineAlert, SectorPrediction,
  TelemetryPoint, SystemSettingsConfig
} from '../types';
import {
  MINE_SITES, SENSOR_NODES, MINE_ALERTS, SECTOR_PREDICTIONS,
  HISTORICAL_TELEMETRY_SERIES, DEFAULT_SETTINGS
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'mg_access_token';

export interface ApiResponse<T> {
  data: T;
  isSimulated: boolean;
  message?: string;
  source: 'fastapi' | 'mineguard-local-cache';
}

class MineGuardApiClient {
  private baseUrl: string;
  private backendAvailable: boolean = false;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public isConnected(): boolean {
    return this.backendAvailable;
  }

  /** Build headers including auth token if present. */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  /** Generic fetch wrapper with 3-second timeout. */
  private async apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: { ...this.getHeaders(), ...(options?.headers ?? {}) },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async checkHealth(): Promise<{ status: string; connected: boolean; url: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.backendAvailable = true;
        return { connected: true, url: this.baseUrl, status: 'online' };
      }
    } catch {
      this.backendAvailable = false;
    }
    return { status: 'standby (Simulated Telemetry)', connected: false, url: this.baseUrl };
  }

  public async getMines(): Promise<ApiResponse<CoalMineSite[]>> {
    try {
      if (this.backendAvailable) {
        const data = await this.apiFetch<CoalMineSite[]>('/mines');
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: MINE_SITES, isSimulated: true, source: 'mineguard-local-cache', message: 'Using demo dataset' };
  }

  public async getSensors(mineId?: string): Promise<ApiResponse<SensorNode[]>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/sensors?mine_id=${mineId}` : '/sensors';
        const data = await this.apiFetch<SensorNode[]>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: SENSOR_NODES, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async getAlerts(mineId?: string): Promise<ApiResponse<MineAlert[]>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/alerts?mine_id=${mineId}` : '/alerts';
        const data = await this.apiFetch<MineAlert[]>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: MINE_ALERTS, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async getTelemetry(sensorId?: string): Promise<ApiResponse<TelemetryPoint[]>> {
    try {
      if (this.backendAvailable) {
        const path = sensorId ? `/telemetry?sensor_id=${sensorId}` : '/telemetry';
        const data = await this.apiFetch<TelemetryPoint[]>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: HISTORICAL_TELEMETRY_SERIES, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async getPredictions(mineId?: string): Promise<ApiResponse<SectorPrediction[]>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/predictions?mine_id=${mineId}` : '/predictions';
        const data = await this.apiFetch<SectorPrediction[]>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: SECTOR_PREDICTIONS, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async getSettings(mineId?: string): Promise<ApiResponse<SystemSettingsConfig>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/settings?mine_id=${mineId}` : '/settings';
        const data = await this.apiFetch<SystemSettingsConfig>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: DEFAULT_SETTINGS, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async calibrateSensor(sensorId: string): Promise<void> {
    if (this.backendAvailable) {
      await this.apiFetch(`/sensors/${sensorId}/calibrate`, { method: 'POST' });
    }
  }

  public async updateSettings(settings: SystemSettingsConfig, mineId?: string): Promise<ApiResponse<SystemSettingsConfig>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/settings?mine_id=${mineId}` : '/settings';
        const data = await this.apiFetch<SystemSettingsConfig>(path, {
          method: 'PUT',
          body: JSON.stringify(settings),
        });
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch (e) {
      console.error('Failed to update settings on FastAPI backend:', e);
    }
    return { data: settings, isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async createSensor(sensorData: Record<string, any>): Promise<ApiResponse<SensorNode>> {
    try {
      if (this.backendAvailable) {
        const data = await this.apiFetch<SensorNode>('/sensors', {
          method: 'POST',
          body: JSON.stringify(sensorData),
        });
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch (e) {
      console.error('Failed to create sensor on FastAPI backend:', e);
    }
    const mockNewSensor: SensorNode = {
      id: sensorData.id,
      name: sensorData.name,
      type: sensorData.type || 'Borehole Extensometer',
      sector: sensorData.sector || 'Panel 1',
      depthMeters: sensorData.depthMeters || 120,
      status: 'normal',
      batteryPercent: 100,
      signalRssiDbm: -75,
      lastSeen: 'Just provisioned',
      coordinates: {
        lat: sensorData.lat || 23.795,
        lng: sensorData.lng || 86.430,
        elevationMeters: sensorData.elevationMeters || -140
      },
      metrics: { displacementMm: 0, tiltMmPerM: 0, vibrationMmS: 0, subsidenceVelocityMmDay: 0, porePressureKPa: 100 },
      thresholds: {
        warningDisplacementMm: sensorData.warningDisplacementMm || 8,
        criticalDisplacementMm: sensorData.criticalDisplacementMm || 12
      },
      firmwareVersion: sensorData.firmwareVersion || 'v2.4.1-lora',
    };
    return { data: mockNewSensor, isSimulated: true, source: 'mineguard-local-cache' };
  }

  // ── Simulator Controls ───────────────────────────────────────────────────────
  public async getSimulatorStatus(): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/status');
    }
    return { status: 'stopped', scenario: 'normal', mine_id: 'mine-jharia-blk4' };
  }

  public async startSimulator(params: { mine_id?: string; sector_id?: string; scenario?: string; interval?: number }): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/start', { method: 'POST', body: JSON.stringify(params) });
    }
  }

  public async pauseSimulator(): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/pause', { method: 'POST' });
    }
  }

  public async resumeSimulator(): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/resume', { method: 'POST' });
    }
  }

  public async stopSimulator(): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/stop', { method: 'POST' });
    }
  }

  public async setSimulatorScenario(scenario: string): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/scenario', { method: 'POST', body: JSON.stringify({ scenario }) });
    }
  }

  public async resetSimulatorData(confirm: boolean = true): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch('/simulator/reset', { method: 'POST', body: JSON.stringify({ confirm }) });
    }
  }

  // ── Phase 4 AI/ML & Risk Engine Methods ─────────────────────────────────────

  public async getLatestPredictions(sensorId?: string, mineId?: string): Promise<any> {
    if (this.backendAvailable) {
      let path = '/predictions/latest';
      const params = new URLSearchParams();
      if (sensorId) params.append('sensor_id', sensorId);
      if (mineId) params.append('mine_id', mineId);
      if (params.toString()) path += `?${params.toString()}`;
      return this.apiFetch(path);
    }
    return {
      status: 'success',
      model_info: {
        is_available: true,
        model_version: 'IsolationForest-v1.2.0',
        algorithm: 'IsolationForest',
        disclaimer: 'Isolation Forest anomaly scores represent statistical feature deviation, not collapse probability.'
      },
      prediction: {
        id: 'anom-demo-01',
        sensor_id: sensorId || 'SN-JHR-MPBX-01',
        sensor_name: 'Borehole Extensometer #1',
        sector: 'Panel 1 (North-West)',
        mine_id: mineId || 'site-jharia-01',
        timestamp: new Date().toISOString(),
        is_anomaly: false,
        anomaly_score: 0.12,
        raw_score: 0.24,
        model_version: 'IsolationForest-v1.2.0',
        feature_vector: {
          ultrasonic_distance_cm: 150.0,
          accel_x_mps2: 0.02,
          accel_y_mps2: 0.01,
          accel_z_mps2: 9.81,
          gyro_x_dps: 0.0,
          gyro_y_dps: 0.0,
          gyro_z_dps: 0.0,
          tilt_x_deg: 0.01,
          tilt_y_deg: 0.01,
          tilt_angle_deg: 0.014,
          temperature_C: 28.5,
          humidity_percent: 65.0,
          distance_change_cm: 0.0,
          vibration_rms: 0.15
        },
        data_quality_status: 'VALID'
      }
    };
  }

  public async getPredictionHistory(sensorId?: string, limit: number = 50): Promise<any> {
    if (this.backendAvailable) {
      const path = sensorId ? `/predictions/history?sensor_id=${sensorId}&limit=${limit}` : `/predictions/history?limit=${limit}`;
      return this.apiFetch(path);
    }
    return { total: 0, history: [], model_version: 'IsolationForest-v1.2.0' };
  }

  public async getDisplacementForecast(sensorId?: string): Promise<any> {
    if (this.backendAvailable) {
      const path = sensorId ? `/predictions/forecast?sensor_id=${sensorId}` : '/predictions/forecast';
      return this.apiFetch(path);
    }
    return {
      forecast_available: false,
      reason: 'Deep Learning sequence forecasting model (LSTM) not configured.',
      requirements: [
        'Minimum 30 days continuous 10-second multi-channel telemetry.',
        'Supervised ground truth subsidence survey markers for model validation.',
        'Trained PyTorch/TensorFlow LSTM model checkpoint.'
      ],
      forecast_horizon_days: 0,
      predictions: []
    };
  }

  public async getActiveAlerts(mineId?: string): Promise<ApiResponse<MineAlert[]>> {
    try {
      if (this.backendAvailable) {
        const path = mineId ? `/alerts/active?mine_id=${mineId}` : '/alerts/active';
        const data = await this.apiFetch<MineAlert[]>(path);
        return { data, isSimulated: false, source: 'fastapi' };
      }
    } catch { /* fallback */ }
    return { data: MINE_ALERTS.filter(a => a.status !== 'resolved'), isSimulated: true, source: 'mineguard-local-cache' };
  }

  public async getAlertsHistory(mineId?: string, limit: number = 50): Promise<any> {
    if (this.backendAvailable) {
      const path = mineId ? `/alerts/history?mine_id=${mineId}&limit=${limit}` : `/alerts/history?limit=${limit}`;
      return this.apiFetch(path);
    }
    return { total: MINE_ALERTS.length, alerts: MINE_ALERTS };
  }

  public async acknowledgeAlert(alertId: string, officerName?: string): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch(`/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ officer_name: officerName || 'Safety Officer' })
      });
    }
    const target = MINE_ALERTS.find(a => a.id === alertId);
    if (target) {
      target.status = 'acknowledged';
      target.acknowledgedBy = officerName || 'Safety Officer';
      target.acknowledgedAt = 'Just now';
    }
    return { message: 'Alert acknowledged', alert_id: alertId };
  }

  public async investigateAlert(alertId: string, investigatorName?: string, notes?: string): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch(`/alerts/${alertId}/investigate`, {
        method: 'POST',
        body: JSON.stringify({ investigator_name: investigatorName || 'Safety Officer', notes })
      });
    }
    const target = MINE_ALERTS.find(a => a.id === alertId);
    if (target) {
      target.status = 'investigating' as any;
    }
    return { message: 'Alert set to investigating', alert_id: alertId };
  }

  public async resolveAlert(alertId: string, resolverName?: string, notes?: string): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch(`/alerts/${alertId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolver_name: resolverName || 'Safety Officer', resolution_notes: notes })
      });
    }
    const target = MINE_ALERTS.find(a => a.id === alertId);
    if (target) {
      target.status = 'resolved';
    }
    return { message: 'Alert resolved', alert_id: alertId };
  }

  public async getRiskConfiguration(mineId: string = 'site-jharia-01'): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch(`/risk/configuration?mine_id=${mineId}`);
    }
    return {
      mineId,
      displacementWarningMm: 5.0,
      displacementCriticalMm: 12.0,
      tiltCriticalMmPerM: 5.0,
      vibrationCriticalMmS: 2.0,
      porePressureCriticalKPa: 200.0,
      subsidenceRateCriticalMmDay: 2.5,
      anomalyPersistenceThreshold: 3,
      hysteresisRecoveryPoints: 3,
      updatedBy: 'Prototype Default',
      updatedAt: new Date().toISOString()
    };
  }

  public async updateRiskConfiguration(configData: any, mineId: string = 'site-jharia-01'): Promise<any> {
    if (this.backendAvailable) {
      return this.apiFetch(`/risk/configuration?mine_id=${mineId}`, {
        method: 'PATCH',
        body: JSON.stringify(configData)
      });
    }
    return { ...configData, mineId, updatedBy: 'Safety Officer', updatedAt: new Date().toISOString() };
  }
}

export const api = new MineGuardApiClient();
