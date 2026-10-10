import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { SensorTable } from '../components/tables/SensorTable';
import type { SensorNode } from '../types';
import {
  Cpu,
  Wifi,
  BatteryCharging,
  Radio,
  Search,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { selectedMine, sensors, calibrateSensor, createSensor } = useMine();
  const [selectedSensor, setSelectedSensor] = useState<SensorNode | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProvisioningOpen, setIsProvisioningOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newSensorForm, setNewSensorForm] = useState({
    id: `MP-BH-0${sensors.length + 1}`,
    name: 'Panel 3 Multi-Point Extensometer',
    type: 'Borehole Extensometer',
    sector: 'Panel 3 (Active Caving)',
    depthMeters: 140,
    warningDisplacementMm: 8.0,
    criticalDisplacementMm: 12.0,
  });

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSensor(newSensorForm);
      setIsProvisioningOpen(false);
      setNewSensorForm({
        id: `MP-BH-0${sensors.length + 2}`,
        name: '',
        type: 'Borehole Extensometer',
        sector: 'Panel 3 (Active Caving)',
        depthMeters: 140,
        warningDisplacementMm: 8.0,
        criticalDisplacementMm: 12.0,
      });
    } catch (err) {
      console.error('Error provisioning sensor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSensors = sensors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgBattery = Math.round(sensors.reduce((acc, s) => acc + s.batteryPercent, 0) / (sensors.length || 1));
  const onlineCount = sensors.filter((s) => s.status !== 'offline').length;

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
            Sensor Network &amp; Hardware Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Subterranean borehole telemetry mesh node management for {selectedMine.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsProvisioningOpen(true)}
            className="mg-btn mg-btn-primary mg-btn-sm"
          >
            <Plus size={14} /> Provision Node
          </button>
        </div>
      </div>

      {/* Sensor Mesh Health Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="mg-card" style={{ borderLeft: '3px solid var(--cyan-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Provisioned Nodes</span>
            <Cpu size={16} color="var(--cyan-bright)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0' }}>
            {sensors.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {onlineCount} reporting nominally
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--teal-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>LoRa Mesh Packet Delivery</span>
            <Wifi size={16} color="var(--teal-accent)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal-accent)', margin: '0.25rem 0' }}>
            99.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Zero packet loss in last 4 hours
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-moderate)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Node Battery</span>
            <BatteryCharging size={16} color="var(--risk-moderate)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0.25rem 0' }}>
            {avgBattery}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            LiSOCl2 Intrinsically Safe Cells
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-normal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Firmware Consensus</span>
            <Radio size={16} color="var(--risk-normal)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0.4rem 0 0.2rem 0' }}>
            v2.4.1-lora
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            All nodes synchronized
          </div>
        </div>
      </div>

      {/* Main Sensor Table with Search */}
      <div className="mg-card">
        <div className="mg-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="mg-card-title">
              <Cpu size={18} color="var(--cyan-bright)" />
              <span>Borehole &amp; Surface Telemetry Nodes</span>
            </div>
            <div className="mg-card-subtitle">
              Inspect sensor health, battery capacity, signal strength RSSI, and calibration benchmarks
            </div>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              placeholder="Search by ID, name, or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mg-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <SensorTable
          sensors={filteredSensors}
          onSelectSensor={(sensor) => setSelectedSensor(sensor)}
        />
      </div>

      {/* Sensor Calibration Inspector Modal / Drawer */}
      {selectedSensor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1.5rem'
          }}
          onClick={() => setSelectedSensor(null)}
        >
          <div
            className="mg-card"
            style={{
              width: '100%',
              maxWidth: 580,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={22} color="var(--cyan-bright)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedSensor.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSensor(null)}
                className="mg-btn mg-btn-secondary mg-btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Node Identifier</div>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--cyan-bright)' }}>{selectedSensor.id}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Firmware Build</div>
                <div className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>{selectedSensor.firmwareVersion}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Installation Depth</div>
                <div className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>{selectedSensor.depthMeters} meters</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Signal Strength (RSSI)</div>
                <div className="font-mono" style={{ fontWeight: 600, color: 'var(--teal-accent)' }}>{selectedSensor.signalRssiDbm} dBm</div>
              </div>
            </div>

            <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--border-cyan)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                Configured DGMS Strata Alert Thresholds:
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Warning Level: <strong style={{ color: 'var(--risk-warning)' }}>{selectedSensor.thresholds.warningDisplacementMm} mm</strong></span>
                <span>Critical Evacuation: <strong style={{ color: 'var(--risk-critical)' }}>{selectedSensor.thresholds.criticalDisplacementMm} mm</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  calibrateSensor(selectedSensor.id);
                  setSelectedSensor(null);
                }}
                className="mg-btn mg-btn-primary mg-btn-sm"
              >
                <RefreshCw size={13} /> Trigger Sensor Re-Zero &amp; Ping
              </button>
              <button
                onClick={() => setSelectedSensor(null)}
                className="mg-btn mg-btn-secondary mg-btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Provisioning Wizard Modal */}
      {isProvisioningOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1.5rem'
          }}
          onClick={() => setIsProvisioningOpen(false)}
        >
          <div
            className="mg-card"
            style={{
              width: '100%',
              maxWidth: 600,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={22} color="var(--cyan-bright)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Provision Intrinsically Safe Sensor Node
                </h3>
              </div>
              <button
                onClick={() => setIsProvisioningOpen(false)}
                className="mg-btn mg-btn-secondary mg-btn-sm"
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="mg-label">Sensor Hardware ID</label>
                  <input
                    type="text"
                    className="mg-input font-mono"
                    value={newSensorForm.id}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mg-label">Sensor Type</label>
                  <select
                    className="mg-select"
                    value={newSensorForm.type}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, type: e.target.value })}
                  >
                    <option value="Borehole Extensometer">Borehole Extensometer</option>
                    <option value="Tiltmeter / Inclinometer">Tiltmeter / Inclinometer</option>
                    <option value="Multi-Point Piezometer">Multi-Point Piezometer</option>
                    <option value="Geophone Microseismic Probe">Geophone Microseismic Probe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mg-label">Sensor Node Title / Location Label</label>
                <input
                  type="text"
                  className="mg-input"
                  placeholder="e.g. Panel 3 Tailgate Multi-Point Extensometer"
                  value={newSensorForm.name}
                  onChange={(e) => setNewSensorForm({ ...newSensorForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="mg-label">Mine Sector / Panel</label>
                  <input
                    type="text"
                    className="mg-input"
                    value={newSensorForm.sector}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, sector: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mg-label">Depth (Meters Below Ground)</label>
                  <input
                    type="number"
                    className="mg-input font-mono"
                    value={newSensorForm.depthMeters}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, depthMeters: parseFloat(e.target.value) || 100 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="mg-label">Warning Limit (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="mg-input font-mono"
                    value={newSensorForm.warningDisplacementMm}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, warningDisplacementMm: parseFloat(e.target.value) || 8 })}
                    required
                  />
                </div>
                <div>
                  <label className="mg-label">Critical Limit (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="mg-input font-mono"
                    value={newSensorForm.criticalDisplacementMm}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, criticalDisplacementMm: parseFloat(e.target.value) || 12 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProvisioningOpen(false)}
                  className="mg-btn mg-btn-secondary mg-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mg-btn mg-btn-primary mg-btn-sm"
                >
                  {isSubmitting ? 'Registering Node...' : 'Register & Provision Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
