import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { MineGisMap } from '../components/map/MineGisMap';
import type { SensorNode } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Compass,
  Layers,
  MapPin,
  AlertCircle
} from 'lucide-react';

export const GisMapPage: React.FC = () => {
  const { selectedMine, sensors, predictions } = useMine();
  const [selectedSensor, setSelectedSensor] = useState<SensorNode | null>(sensors[0] || null);

  // Validate coordinates
  const validSensors = sensors.filter(
    (s) =>
      s.coordinates &&
      typeof s.coordinates.lat === 'number' &&
      typeof s.coordinates.lng === 'number' &&
      s.coordinates.lat >= -90 &&
      s.coordinates.lat <= 90 &&
      s.coordinates.lng >= -180 &&
      s.coordinates.lng <= 180
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
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
            Interactive GIS Mine &amp; Strata Risk Map
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Geospatial subterranean borehole node overlay &bull; {selectedMine.name} ({selectedMine.coalfield})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="mg-badge mg-badge-cyan">
            <Compass size={12} /> Datum: WGS84 / UTM 45N
          </span>
          <span className="mg-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Map Nodes: {validSensors.length} / {sensors.length} Valid
          </span>
        </div>
      </div>

      {/* Illustrative Demonstration Disclaimer Banner */}
      <div
        style={{
          padding: '0.65rem 1rem',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid var(--border-cyan)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}
      >
        <AlertCircle size={16} color="var(--cyan-bright)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Geospatial Notice:</strong> Map coordinates and sector polygons represent calibrated illustrative demonstration models for Indian coalfields. Physical sensor hardware binds to exact subterranean borehole GPS surveys in production.
        </span>
      </div>

      {/* Main Map Component */}
      <div className="mg-card" style={{ padding: '0.75rem', position: 'relative' }}>
        <MineGisMap
          sensors={validSensors}
          predictions={predictions}
          onSelectSensor={(sensor) => setSelectedSensor(sensor)}
          height={580}
        />
      </div>

      {/* Zonal Analysis & Selected Node Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Selected Sensor Node Details */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <MapPin size={18} color="var(--cyan-bright)" />
              <span>Inspected Sensor Node Coordinates</span>
            </div>
            {selectedSensor && <RiskBadge level={selectedSensor.status} size="sm" />}
          </div>

          {selectedSensor ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{selectedSensor.name}</div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--cyan-bright)' }}>{selectedSensor.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sector: {selectedSensor.sector}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Depth: {selectedSensor.depthMeters}m</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Latitude</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>{selectedSensor.coordinates?.lat?.toFixed(5) || 'N/A'}° N</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Longitude</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>{selectedSensor.coordinates?.lng?.toFixed(5) || 'N/A'}° E</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Surface Elevation</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>{selectedSensor.coordinates?.elevationMeters || 0} m MSL</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Subsidence Velocity</span>
                  <div className="font-mono" style={{ fontWeight: 700, color: selectedSensor.metrics.subsidenceVelocityMmDay > 2 ? 'var(--risk-critical)' : 'var(--cyan-bright)' }}>
                    {selectedSensor.metrics.subsidenceVelocityMmDay} mm/day
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--border-cyan)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>DGMS Circular 6/2006 Warning:</strong> If differential displacement between anchoring points exceeds {selectedSensor.thresholds.warningDisplacementMm} mm, stop extraction within a 60m radius of this node.
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Click any node on the map to inspect its spatial and geotechnical details.</p>
          )}
        </div>

        {/* Subsidence Risk Zones Overview */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <Layers size={18} color="var(--teal-accent)" />
              <span>Identified Subsidence Zones</span>
            </div>
            <span className="mg-badge mg-badge-sm mg-badge-warning">Active Depillaring</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid var(--risk-critical)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>Zone A: Panel 4B Subsidence Trough</strong>
                <RiskBadge level="critical" size="sm" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Area: 48,000 m² &bull; Overburden: 145m Sandstone &bull; High tensile strain developing along rim. Continuous monitoring required.
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.08)', borderLeft: '3px solid var(--risk-warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>Zone B: PWD Highway Corridor Buffer</strong>
                <RiskBadge level="warning" size="sm" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Buffer margin along Dhanbad-Katras road. Angle of draw calculated at 28.5°. Ground tilt currently 2.1 mm/m.
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid var(--risk-normal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>Zone C: Incline Haulage Protection Barrier</strong>
                <RiskBadge level="normal" size="sm" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Solid coal barrier intact. Zero anomalous strata creep detected over 90-day observation window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
