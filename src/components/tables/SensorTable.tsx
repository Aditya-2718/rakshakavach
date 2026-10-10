import React, { useState } from 'react';
import type { SensorNode } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { useMine } from '../../context/MineContext';
import { Battery, BatteryCharging, BatteryWarning, Wifi, RefreshCw, Cpu, Layers } from 'lucide-react';

interface SensorTableProps {
  sensors: SensorNode[];
  onSelectSensor?: (sensor: SensorNode) => void;
}

export const SensorTable: React.FC<SensorTableProps> = ({ sensors, onSelectSensor }) => {
  const { calibrateSensor } = useMine();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [calibratingId, setCalibratingId] = useState<string | null>(null);

  const filteredSensors = sensors.filter((s) => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const handleCalibrate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCalibratingId(id);
    setTimeout(() => {
      calibrateSensor(id);
      setCalibratingId(null);
    }, 800);
  };

  const getBatteryIcon = (percent: number) => {
    if (percent > 80) return <BatteryCharging size={14} color="var(--risk-normal)" />;
    if (percent > 30) return <Battery size={14} color="var(--risk-moderate)" />;
    return <BatteryWarning size={14} color="var(--risk-critical)" />;
  };

  const getSignalStrengthColor = (rssi: number) => {
    if (rssi > -70) return 'var(--risk-normal)';
    if (rssi > -85) return 'var(--risk-moderate)';
    return 'var(--risk-critical)';
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Status:
          </span>
          {['all', 'critical', 'warning', 'moderate', 'normal'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`mg-btn mg-btn-sm ${filterStatus === st ? 'mg-btn-outline-cyan' : 'mg-btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Type:
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="mg-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Sensor Types</option>
            <option value="Borehole Extensometer (MPBX)">Extensometer (MPBX)</option>
            <option value="In-Place Inclinometer (IPI)">Inclinometer (IPI)</option>
            <option value="Vibrating Wire Crackmeter">Crackmeter</option>
            <option value="Microseismic Geophone">Microseismic Geophone</option>
            <option value="Surface GNSS Station">Surface GNSS</option>
            <option value="Piezometer">Piezometer</option>
          </select>
        </div>
      </div>

      <div className="mg-table-container">
        <table className="mg-table">
          <thead>
            <tr>
              <th>Node ID & Name</th>
              <th>Type</th>
              <th>Sector & Depth</th>
              <th>Current Reading</th>
              <th>Battery & Signal</th>
              <th>Status</th>
              <th>Last Ping</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSensors.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No sensor nodes match the filter.
                </td>
              </tr>
            ) : (
              filteredSensors.map((sensor) => (
                <tr
                  key={sensor.id}
                  onClick={() => onSelectSensor && onSelectSensor(sensor)}
                  style={{ cursor: onSelectSensor ? 'pointer' : 'default' }}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      {sensor.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {sensor.id}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Cpu size={13} color="var(--text-muted)" /> {sensor.type}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{sensor.sector}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={11} /> Depth: {sensor.depthMeters} m
                    </div>
                  </td>
                  <td>
                    <div className="font-mono" style={{ fontWeight: 700, color: sensor.metrics.displacementMm > sensor.thresholds.warningDisplacementMm ? 'var(--risk-critical)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                      {sensor.metrics.displacementMm} mm
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Tilt: {sensor.metrics.tiltMmPerM} mm/m
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}>
                        {getBatteryIcon(sensor.batteryPercent)}
                        <span className="font-mono">{sensor.batteryPercent}%</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.78rem',
                          color: getSignalStrengthColor(sensor.signalRssiDbm)
                        }}
                      >
                        <Wifi size={13} />
                        <span className="font-mono">{sensor.signalRssiDbm} dBm</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RiskBadge level={sensor.status} size="sm" />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {sensor.lastSeen}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleCalibrate(sensor.id, e)}
                      disabled={calibratingId === sensor.id}
                      className="mg-btn mg-btn-sm mg-btn-secondary"
                      title="Ping and Calibrate Sensor Node"
                    >
                      <RefreshCw size={12} className={calibratingId === sensor.id ? 'spin' : ''} />
                      {calibratingId === sensor.id ? 'Syncing...' : 'Calibrate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};
