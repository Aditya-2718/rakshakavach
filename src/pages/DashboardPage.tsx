import React from 'react';
import { useMine } from '../context/MineContext';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { SubsidenceVelocityChart } from '../components/charts/SubsidenceVelocityChart';
import { AlertTable } from '../components/tables/AlertTable';
import { LoadingState } from '../components/common/LoadingState';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  Map,
  Compass,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { selectedMine, sensors, alerts, predictions, telemetry, isLoading } = useMine();

  if (isLoading) {
    return <LoadingState message="Loading colliery geotechnical telemetry..." />;
  }

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalSensors = sensors.filter((s) => s.status === 'critical');
  const maxDisplacement = Math.max(...sensors.map((s) => s.metrics.displacementMm));
  const maxSubsidenceRate = Math.max(...sensors.map((s) => s.metrics.subsidenceVelocityMmDay));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Overview Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
              Safety Command Center &bull; {selectedMine.name}
            </h1>
            <RiskBadge level={selectedMine.overallRisk} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Coalfield: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedMine.coalfield}</span> &bull; Seam: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedMine.currentSeam}</span> &bull; Method: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedMine.extractionMethod}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span
            className="mg-badge"
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid var(--border-cyan)',
              color: 'var(--cyan-bright)'
            }}
          >
            Illustrative Telemetry (Phase 1)
          </span>
          <Link to="/map" className="mg-btn mg-btn-outline-cyan mg-btn-sm">
            <Map size={14} /> Full GIS Map
          </Link>
          <Link to="/alerts" className="mg-btn mg-btn-danger mg-btn-sm">
            <AlertTriangle size={14} /> View Alarms ({activeAlerts.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Max Strata Displacement"
          value={maxDisplacement.toFixed(1)}
          unit="mm"
          change="+1.8 mm / 6h"
          trend="up"
          trendDirection="negative"
          icon={Activity}
          subtitle="Panel 4B Borehole MPBX"
          badge={<RiskBadge level="critical" size="sm" />}
        />
        <StatCard
          title="Subsidence Velocity"
          value={maxSubsidenceRate.toFixed(1)}
          unit="mm/d"
          change="+0.8 mm/d"
          trend="up"
          trendDirection="negative"
          icon={TrendingUp}
          subtitle="Empirical Threshold: 3.0"
          badge={<RiskBadge level="warning" size="sm" />}
        />
        <StatCard
          title="Active Sensor Nodes"
          value={`${selectedMine.activeSensors} / ${selectedMine.totalSensors}`}
          unit="online"
          icon={Cpu}
          subtitle="LoRa Mesh Connectivity: 98%"
          badge={<RiskBadge level="normal" size="sm" label="Mesh Online" />}
        />
        <StatCard
          title="Active DGMS Alerts"
          value={activeAlerts.length}
          unit="active"
          icon={AlertTriangle}
          subtitle={`${criticalSensors.length} require immediate SOP`}
          badge={<RiskBadge level={activeAlerts.length > 0 ? 'critical' : 'normal'} size="sm" />}
        />
      </div>

      {/* Primary Analytics Section: 2 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Real-time Telemetry Graph */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div>
              <div className="mg-card-title">
                <Activity size={18} color="var(--cyan-bright)" />
                <span>Strata Bed Separation &amp; AI Forecast Cone</span>
              </div>
              <div className="mg-card-subtitle">
                Telemetry point: MPBX-101 Borehole Extensometer (Panel 4B Depillaring Face)
              </div>
            </div>
            <span className="mg-badge mg-badge-critical mg-badge-sm">Critical Trend</span>
          </div>

          <TelemetryChart
            data={telemetry}
            metricKey="displacementMm"
            metricLabel="Displacement"
            unit="mm"
            warningThreshold={6.0}
            criticalThreshold={12.0}
            color="#06b6d4"
            showAiForecast={true}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.85rem',
              marginTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>Dotted orange line represents projected 6-hour LSTM AI subsidence path</span>
            <Link to="/monitoring" style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>
              Live Telemetry Streams &rarr;
            </Link>
          </div>
        </div>

        {/* Subsidence Velocity Histogram */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div>
              <div className="mg-card-title">
                <TrendingUp size={18} color="var(--teal-accent)" />
                <span>Subsidence Velocity Acceleration Rate</span>
              </div>
              <div className="mg-card-subtitle">
                Temporal velocity histogram (mm / day) over last 24 hours
              </div>
            </div>
            <span className="mg-badge mg-badge-warning mg-badge-sm">Accelerating</span>
          </div>

          <SubsidenceVelocityChart data={telemetry} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.85rem',
              marginTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>Red bars indicate velocities &gt; 3.0 mm/day triggering DGMS Circular 6</span>
            <Link to="/analytics" style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>
              Full Analytics &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Sector Risk Matrix Table */}
      <div className="mg-card">
        <div className="mg-card-header">
          <div>
            <div className="mg-card-title">
              <Compass size={18} color="var(--cyan-bright)" />
              <span>Colliery Sector Risk Matrix</span>
            </div>
            <div className="mg-card-subtitle">
              Zonal vulnerability assessment based on extraction stage, overburden thickness, and strata deformation
            </div>
          </div>
          <Link to="/predictions" className="mg-btn mg-btn-outline-cyan mg-btn-sm">
            <Sparkles size={13} /> Deep AI Predictions
          </Link>
        </div>

        <div className="mg-table-container">
          <table className="mg-table">
            <thead>
              <tr>
                <th>Sector Name &amp; ID</th>
                <th>Coal Seam</th>
                <th>Overburden</th>
                <th>Risk Category</th>
                <th>Predicted Subsidence Rate</th>
                <th>Time to Trough</th>
                <th>AI Confidence</th>
                <th>Primary Risk Factor</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((sector) => (
                <tr key={sector.sectorId}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {sector.sectorName}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)' }}>
                      {sector.sectorId}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {sector.seamName}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.85rem' }}>
                      {sector.overburdenDepthMeters} m
                    </span>
                  </td>
                  <td>
                    <RiskBadge level={sector.riskCategory} size="sm" />
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, color: sector.subsidenceRatePredictedMmDay > 2 ? 'var(--risk-critical)' : 'var(--text-main)' }}>
                      {sector.subsidenceRatePredictedMmDay} mm/day
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: sector.estimatedTimeToSubsidenceTroughDays <= 5 ? 'var(--risk-critical)' : 'var(--text-secondary)', fontWeight: sector.estimatedTimeToSubsidenceTroughDays <= 5 ? 700 : 400 }}>
                      {sector.estimatedTimeToSubsidenceTroughDays} days
                    </span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ color: 'var(--teal-accent)', fontWeight: 600 }}>
                      {sector.aiConfidencePercent}%
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {sector.primaryRiskFactor}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="mg-card">
        <div className="mg-card-header">
          <div>
            <div className="mg-card-title">
              <AlertTriangle size={18} color="var(--risk-critical)" />
              <span>Recent Alarms &amp; SOP Incident Log</span>
            </div>
            <div className="mg-card-subtitle">
              Active strata exceedances requiring safety officer acknowledgement
            </div>
          </div>
          <Link to="/alerts" className="mg-btn mg-btn-secondary mg-btn-sm">
            View All Incident Logs &rarr;
          </Link>
        </div>

        <AlertTable alerts={alerts.slice(0, 4)} compact={true} />
      </div>
    </div>
  );
};
