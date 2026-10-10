import React, { useState, useMemo } from 'react';
import { useMine } from '../context/MineContext';
import { SensorTable } from '../components/tables/SensorTable';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import type { SensorNode, TelemetryPoint } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Layers,
  Cpu,
  Radio,
  Play,
  Pause,
  Clock,
  AlertTriangle,
  Search,
  Activity
} from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const {
    selectedMine, sensors, telemetry, alerts, wsStatus,
    lastTelemetryTimestamp, isStale
  } = useMine();

  const [selectedSensor, setSelectedSensor] = useState<SensorNode>(sensors[0] || {
    id: 'SN-JH-01',
    name: 'Panel 1 Main Extensometer',
    type: 'Borehole Extensometer (MPBX)',
    sector: 'Panel 1',
    depthMeters: 120,
    status: 'normal',
    batteryPercent: 95,
    signalRssiDbm: -65,
    lastSeen: 'Just now',
    coordinates: { lat: 23.795, lng: 86.43, elevationMeters: -140 },
    metrics: { displacementMm: 2.1, tiltMmPerM: 0.4, vibrationMmS: 0.2, subsidenceVelocityMmDay: 0.1, porePressureKPa: 180 },
    thresholds: { warningDisplacementMm: 6, criticalDisplacementMm: 12 },
    firmwareVersion: 'v2.4.1'
  });

  const [activeMetric, setActiveMetric] = useState<'displacementMm' | 'tiltMmPerM' | 'vibrationMmS' | 'porePressureKPa'>('displacementMm');
  const [isChartPaused, setIsChartPaused] = useState<boolean>(false);
  const [frozenTelemetry, setFrozenTelemetry] = useState<TelemetryPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h' | 'all'>('1h');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'HARDWARE' | 'SIMULATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pause / Resume visualization logic
  const handleTogglePause = () => {
    if (!isChartPaused) {
      setFrozenTelemetry(telemetry);
      setIsChartPaused(true);
    } else {
      setIsChartPaused(false);
    }
  };

  const chartData = isChartPaused ? frozenTelemetry : telemetry;

  // Filtered telemetry points for chart
  const filteredTelemetry = useMemo(() => {
    let dataset = chartData;
    if (sourceFilter !== 'ALL') {
      dataset = dataset.filter((t: any) => (t.dataSource || 'SIMULATED') === sourceFilter);
    }
    const limitMap = { '15m': 15, '1h': 30, '6h': 60, '24h': 100, 'all': 500 };
    const maxPoints = limitMap[timeRange] || 50;
    return dataset.slice(-maxPoints);
  }, [chartData, sourceFilter, timeRange]);

  // Metrics summary
  const onlineSensors = sensors.filter((s) => s.status !== 'offline');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');
  const degradedSensors = sensors.filter((s) => s.status === 'warning' || s.status === 'critical');
  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  const sectorsList = useMemo(() => {
    const set = new Set(sensors.map((s) => s.sector));
    return Array.from(set);
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    return sensors.filter((s) => {
      const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
      const matchesSource = sourceFilter === 'ALL' || (s.dataSource || 'SIMULATED') === sourceFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesSource && matchesSearch;
    });
  }, [sensors, sectorFilter, sourceFilter, searchQuery]);

  const metricConfigs = {
    displacementMm: { label: 'Differential Displacement', unit: 'mm', warning: 6.0, critical: 12.0, color: '#06b6d4' },
    tiltMmPerM: { label: 'Strata Angular Tilt', unit: 'mm/m', warning: 3.0, critical: 5.0, color: '#38bdf8' },
    vibrationMmS: { label: 'Microseismic Vibration PPV', unit: 'mm/s', warning: 5.0, critical: 8.0, color: '#f59e0b' },
    porePressureKPa: { label: 'Overburden Pore Water Pressure', unit: 'kPa', warning: 350, critical: 500, color: '#10b981' }
  };

  const currentCfg = metricConfigs[activeMetric];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
            Real-Time Geotechnical Telemetry &amp; Monitoring
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Live subterranean roof strain, tilt &amp; pore pressure stream for {selectedMine.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Time-Range Filter */}
          <div style={{ display: 'flex', background: 'rgba(15, 24, 47, 0.9)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {(['15m', '1h', '6h', '24h', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`mg-btn mg-btn-sm ${timeRange === range ? 'mg-btn-outline-cyan' : ''}`}
                style={{
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  background: timeRange === range ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: timeRange === range ? 'var(--cyan-bright)' : 'var(--text-secondary)'
                }}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Pause / Resume Charting Toggle */}
          <button
            onClick={handleTogglePause}
            className={`mg-btn mg-btn-sm ${isChartPaused ? 'mg-btn-primary' : 'mg-btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isChartPaused ? <Play size={14} color="#ffffff" /> : <Pause size={14} color="var(--risk-warning)" />}
            <span>{isChartPaused ? 'Resume Chart Feed' : 'Pause Chart View'}</span>
          </button>

          {/* WebSocket Status Badge */}
          <span
            className="mg-badge"
            style={{
              background: wsStatus === 'connected' && !isStale ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
              color: wsStatus === 'connected' && !isStale ? 'var(--risk-normal)' : 'var(--risk-warning)',
              border: `1px solid ${wsStatus === 'connected' && !isStale ? 'var(--risk-normal)' : 'var(--risk-warning)'}`
            }}
          >
            <Radio size={12} className={wsStatus === 'connected' && !isStale ? 'pulse-radar' : ''} />
            {wsStatus === 'connected' && !isStale ? 'Live Telemetry Active' : isStale ? 'Stale Data Notice' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Network Health & Metrics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="mg-card" style={{ borderLeft: '3px solid var(--cyan-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sensor Network</span>
            <Cpu size={16} color="var(--cyan-bright)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0' }}>
            {sensors.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nodes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--risk-normal)' }}>{onlineSensors.length} Online</span> &bull; <span style={{ color: 'var(--text-muted)' }}>{offlineSensors.length} Offline</span>
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Degraded / Strain</span>
            <AlertTriangle size={16} color="var(--risk-warning)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: degradedSensors.length > 0 ? 'var(--risk-warning)' : '#ffffff', margin: '0.25rem 0' }}>
            {degradedSensors.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nodes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Exceeding strata warning thresholds
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-critical)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active DGMS Alarms</span>
            <Activity size={16} color="var(--risk-critical)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: activeAlertsCount > 0 ? 'var(--risk-critical)' : 'var(--risk-normal)', margin: '0.25rem 0' }}>
            {activeAlertsCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Requiring safety officer resolution
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--teal-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest Telemetry</span>
            <Clock size={16} color="var(--teal-accent)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0.4rem 0 0.2rem 0' }}>
            {lastTelemetryTimestamp ? new Date(lastTelemetryTimestamp).toLocaleTimeString('en-IN') : 'Just now'}
          </div>
          <div style={{ fontSize: '0.75rem', color: isStale ? 'var(--risk-warning)' : 'var(--risk-normal)' }}>
            {isStale ? 'Stale Data (>60s lag)' : 'Real-time WebSocket Stream'}
          </div>
        </div>
      </div>

      {/* Selected Sensor Detailed Telemetry Inspector */}
      <div
        className="mg-card"
        style={{
          border: `1.5px solid ${selectedSensor.status === 'critical' ? 'var(--risk-critical-border)' : 'var(--border-cyan)'}`,
          boxShadow: selectedSensor.status === 'critical' ? 'var(--shadow-critical)' : 'var(--shadow-cyan)'
        }}
      >
        <div className="mg-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid var(--border-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-bright)'
                }}
              >
                <Cpu size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    {selectedSensor.name}
                  </h3>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                    {selectedSensor.id}
                  </span>
                  <RiskBadge level={selectedSensor.status} size="sm" />
                  <span
                    className="mg-badge mg-badge-sm"
                    style={{
                      background: (selectedSensor as any).dataSource === 'HARDWARE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                      color: (selectedSensor as any).dataSource === 'HARDWARE' ? 'var(--risk-normal)' : 'var(--cyan-bright)'
                    }}
                  >
                    {(selectedSensor as any).dataSource || 'SIMULATED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedSensor.type} &bull; Sector: <strong style={{ color: '#ffffff' }}>{selectedSensor.sector}</strong> &bull; Depth: {selectedSensor.depthMeters} m
                </div>
              </div>
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(Object.keys(metricConfigs) as (keyof typeof metricConfigs)[]).map((key) => {
              const cfg = metricConfigs[key];
              const isCurrent = activeMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMetric(key)}
                  className={`mg-btn mg-btn-sm ${isCurrent ? 'mg-btn-primary' : 'mg-btn-secondary'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {cfg.label.split(' ')[0]} ({cfg.unit})
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Gauges Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            padding: '1rem 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Displacement</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedSensor.metrics.displacementMm > 12 ? 'var(--risk-critical)' : 'var(--text-main)' }}>
              {selectedSensor.metrics.displacementMm} <span style={{ fontSize: '0.8rem' }}>mm</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Limit: 12.0 mm</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tilt Velocity</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--cyan-bright)' }}>
              {selectedSensor.metrics.tiltMmPerM} <span style={{ fontSize: '0.8rem' }}>mm/m</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Limit: 4.0 mm/m</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vibration PPV</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedSensor.metrics.vibrationMmS > 6 ? 'var(--risk-warning)' : 'var(--text-main)' }}>
              {selectedSensor.metrics.vibrationMmS} <span style={{ fontSize: '0.8rem' }}>mm/s</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DGMS PPV Safe: &lt;5.0</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Subsidence Rate</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedSensor.metrics.subsidenceVelocityMmDay > 2 ? 'var(--risk-critical)' : 'var(--text-main)' }}>
              {selectedSensor.metrics.subsidenceVelocityMmDay} <span style={{ fontSize: '0.8rem' }}>mm/d</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Critical: &gt;3.0 mm/d</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pore Pressure</div>
            <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--teal-accent)' }}>
              {selectedSensor.metrics.porePressureKPa} <span style={{ fontSize: '0.8rem' }}>kPa</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hydrostatic Sandstone</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Temp / Humidity</div>
            <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', paddingTop: '0.2rem' }}>
              N/A (No Sensor)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Module Not Fitted</div>
          </div>
        </div>

        {/* Chart Paused Banner Notice */}
        {isChartPaused && (
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid var(--risk-warning)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: 'var(--risk-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Chart feed visualization is paused. Backend data ingestion remains active in real-time.</span>
            <button
              onClick={handleTogglePause}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Resume Live View
            </button>
          </div>
        )}

        {/* Dynamic Telemetry Graph */}
        <TelemetryChart
          data={filteredTelemetry}
          metricKey={activeMetric}
          metricLabel={currentCfg.label}
          unit={currentCfg.unit}
          warningThreshold={currentCfg.warning}
          criticalThreshold={currentCfg.critical}
          color={currentCfg.color}
          showAiForecast={activeMetric === 'displacementMm'}
        />
      </div>

      {/* Sensor Node Selection Table with Filters */}
      <div className="mg-card">
        <div className="mg-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="mg-card-title">
              <Layers size={18} color="var(--cyan-bright)" />
              <span>Colliery Sensor Network Telemetry Feed</span>
            </div>
            <div className="mg-card-subtitle">
              Click any sensor row below to switch the active real-time chart feed
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <input
                type="text"
                placeholder="Search sensor ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mg-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.8rem' }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              className="mg-select"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
            >
              <option value="ALL">All Mine Sectors</option>
              {sectorsList.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            <select
              className="mg-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
            >
              <option value="ALL">All Data Sources</option>
              <option value="HARDWARE">Physical Hardware</option>
              <option value="SIMULATED">Simulated Telemetry</option>
            </select>
          </div>
        </div>

        <SensorTable
          sensors={filteredSensors}
          onSelectSensor={(sensor) => setSelectedSensor(sensor)}
        />
      </div>
    </div>
  );
};

