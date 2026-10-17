import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { SubsidenceVelocityChart } from '../components/charts/SubsidenceVelocityChart';
import { LoadingState } from '../components/common/LoadingState';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Cpu,
  Map,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Activity,
  Check,
  Eye,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

/* ─── Helpers ─────────────────────────────────────────────────── */
const riskColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  normal:   { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.35)',  text: '#10b981', dot: '#10b981' },
  moderate: { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.35)',  text: '#f59e0b', dot: '#f59e0b' },
  warning:  { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.40)',  text: '#f97316', dot: '#f97316' },
  critical: { bg: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.45)',   text: '#ef4444', dot: '#ef4444' },
  elevated: { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.40)',  text: '#f97316', dot: '#f97316' },
  low:      { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.35)',  text: '#10b981', dot: '#10b981' },
  guarded:  { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.35)',  text: '#f59e0b', dot: '#f59e0b' },
};

function getRisk(level: string) {
  return riskColors[level?.toLowerCase()] ?? riskColors.normal;
}

const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };

/* ─── Sub-components ──────────────────────────────────────────── */

/** Large, prominent safety status banner at the top */
function SafetyStatusBanner({ riskLevel, mineName }: { riskLevel: string; mineName: string }) {
  const r = getRisk(riskLevel);
  const isCritical = riskLevel === 'critical';
  const isWarning  = riskLevel === 'warning';

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${r.border}`,
        background: r.bg,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isCritical ? `0 0 24px rgba(239,68,68,0.18)` : isWarning ? `0 0 18px rgba(249,115,22,0.14)` : 'none',
      }}
      role="status"
      aria-live="polite"
      aria-label={`Mine safety status: ${riskLevel}`}
    >
      {/* Animated background pulse for critical */}
      {isCritical && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 10% 50%, rgba(239,68,68,0.08) 0%, transparent 70%)',
          animation: 'pulse-critical-bg 2.5s ease-in-out infinite'
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: r.bg, border: `2px solid ${r.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 16px ${r.border}`
      }}>
        {isCritical || isWarning
          ? <ShieldAlert size={28} color={r.text} />
          : <ShieldCheck size={28} color={r.text} />
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            {mineName}
          </span>
          <span style={{
            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: r.text,
            background: r.bg, border: `1px solid ${r.border}`,
            padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-pill)'
          }}>
            {riskLevel === 'normal' ? '✓ Safe' : riskLevel === 'moderate' ? '⚠ Moderate Risk' : riskLevel === 'warning' ? '⚠ Elevated Risk' : '🚨 Critical Risk'}
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {isCritical
            ? 'Immediate safety officer attention required. Check active alerts below.'
            : isWarning
            ? 'Elevated ground movement detected. Monitor alerts and follow SOP.'
            : 'All monitored sectors within safe operating parameters.'}
        </p>
      </div>

      {/* CTA */}
      <Link to="/map" className="mg-btn mg-btn-outline-cyan mg-btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        <Map size={14} /> View Map
      </Link>
    </div>
  );
}

/** Single KPI card */
function KpiCard({
  label, value, unit, sublabel, icon: Icon, riskLevel, href
}: {
  label: string; value: string | number; unit?: string;
  sublabel?: string; icon: React.ElementType; riskLevel?: string; href?: string;
}) {
  const r = riskLevel ? getRisk(riskLevel) : null;
  const content = (
    <div
      className="mg-stat-card"
      style={{
        borderColor: r ? r.border : undefined,
        background: r ? r.bg : undefined,
        cursor: href ? 'pointer' : 'default',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div className="mg-stat-header">
        <span className="mg-stat-title" style={{ fontSize: '0.78rem' }}>{label}</span>
        <div className="mg-stat-icon-wrapper" style={{ background: r ? r.bg : undefined, borderColor: r ? r.border : undefined, color: r ? r.text : undefined }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.5rem 0 0.4rem' }}>
        <span className="mg-stat-value" style={{ color: r ? r.text : undefined, fontSize: '2rem' }}>{value}</span>
        {unit && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{unit}</span>}
      </div>
      {sublabel && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sublabel}</p>}
    </div>
  );

  return href ? <Link to={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

/** Sector risk visual grid */
function SectorRiskGrid({ predictions }: { predictions: any[] }) {
  const sorted = [...predictions].sort((a, b) => {
    const order: Record<string, number> = { Critical: 0, Elevated: 1, Guarded: 2, Low: 3 };
    return (order[a.riskCategory] ?? 9) - (order[b.riskCategory] ?? 9);
  });

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.75rem' }}>
        {[
          { label: 'Critical', color: riskColors.critical },
          { label: 'Elevated', color: riskColors.warning },
          { label: 'Moderate', color: riskColors.moderate },
          { label: 'Safe', color: riskColors.normal },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color.text, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {sorted.map((sector) => {
          const lvl = sector.riskCategory?.toLowerCase() === 'low' ? 'normal'
            : sector.riskCategory?.toLowerCase() === 'guarded' ? 'moderate'
            : sector.riskCategory?.toLowerCase();
          const r = getRisk(lvl);
          return (
            <div
              key={sector.sectorId}
              style={{
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${r.border}`,
                background: r.bg,
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
              aria-label={`Sector ${sector.sectorName}: ${sector.riskCategory} risk`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', lineHeight: 1.2 }}>
                    {sector.sectorName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Seam: {sector.seamName} · {sector.overburdenDepthMeters}m depth
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  color: r.text, background: r.bg, border: `1px solid ${r.border}`,
                  padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  {sector.riskCategory}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Subsidence rate</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: r.text, fontFamily: 'var(--font-mono)' }}>
                    {sector.subsidenceRatePredictedMmDay} mm/d
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AI Confidence</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {sector.aiConfidencePercent}%
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem' }}>
                ⚠ {sector.primaryRiskFactor}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Alert card — shows one alert with recommended action */
function AlertCard({ alert }: { alert: any }) {
  const [expanded, setExpanded] = useState(false);
  const { acknowledgeAlert, resolveAlert } = useMine();

  const r = getRisk(alert.severity);

  const handleInvestigate = async () => {
    try { await api.investigateAlert(alert.id); } catch { /* graceful */ }
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${r.border}`,
        background: r.bg,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
      role="article"
      aria-label={`Alert: ${alert.title}`}
    >
      {/* Main row */}
      <div style={{ padding: '0.9rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {/* Severity dot */}
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.text, flexShrink: 0, marginTop: 5,
          boxShadow: alert.severity === 'critical' ? `0 0 8px ${r.text}` : 'none',
          animation: alert.severity === 'critical' ? 'pulse-critical 2s infinite' : 'none'
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{alert.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={11} />
                <span>{alert.sector}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{alert.timestamp}</span>
              </div>
            </div>

            {/* Status badge */}
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', flexShrink: 0,
              padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)',
              background: alert.status === 'active' ? 'rgba(239,68,68,0.15)' : alert.status === 'resolved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: alert.status === 'active' ? '#ef4444' : alert.status === 'resolved' ? '#10b981' : '#f59e0b',
              border: `1px solid currentColor`
            }}>
              {alert.status}
            </span>
          </div>

          {/* Quick metric */}
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Reading: <span style={{ fontWeight: 700, color: r.text, fontFamily: 'var(--font-mono)' }}>{alert.currentValue}</span>
            <span style={{ color: 'var(--text-muted)' }}> (threshold: {alert.thresholdValue})</span>
          </div>
        </div>

        {/* Actions + expand */}
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
          {alert.status === 'active' && (
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="mg-btn mg-btn-sm mg-btn-secondary"
              title="Acknowledge this alert"
              aria-label="Acknowledge alert"
            >
              <Check size={13} /> Ack
            </button>
          )}
          {alert.status === 'active' && (
            <button
              onClick={handleInvestigate}
              className="mg-btn mg-btn-sm"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}
              title="Mark as investigating"
              aria-label="Mark as investigating"
            >
              <Eye size={13} />
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button
              onClick={() => resolveAlert(alert.id)}
              className="mg-btn mg-btn-sm mg-btn-outline-cyan"
              title="Mark as resolved"
              aria-label="Resolve alert"
            >
              <CheckCircle size={13} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mg-btn mg-btn-sm mg-btn-secondary"
            aria-label={expanded ? 'Hide recommended action' : 'Show recommended action'}
            title="Show recommended SOP action"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded: recommended action */}
      {expanded && alert.sopRecommendation && (
        <div style={{
          padding: '0.85rem 1rem',
          borderTop: `1px solid ${r.border}`,
          background: 'rgba(0,0,0,0.18)',
          display: 'flex', gap: '0.65rem', alignItems: 'flex-start'
        }}>
          <AlertTriangle size={15} color="var(--risk-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Action (DGMS SOP)
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
              {alert.sopRecommendation}
            </p>
            {alert.acknowledgedBy && (
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                ✓ Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const { selectedMine, sensors, alerts, predictions, telemetry, isLoading } = useMine();
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false);

  if (isLoading) {
    return <LoadingState message="Loading mine safety dashboard..." />;
  }

  const activeAlerts  = alerts.filter((a) => a.status === 'active');
  const onlineSensors = sensors.filter((s) => s.status !== 'offline').length;
  const highRiskSectors = predictions.filter((p) =>
    ['critical', 'elevated'].includes(p.riskCategory?.toLowerCase())
  ).length;

  // Sort alerts: critical first, then by timestamp descending
  const sortedAlerts = [...alerts]
    .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
  const dashboardAlerts = sortedAlerts.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* 1. Safety Status Banner */}
      <SafetyStatusBanner riskLevel={selectedMine.overallRisk} mineName={selectedMine.name} />

      {/* 2. KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard
          label="Mine Safety Status"
          value={selectedMine.overallRisk.charAt(0).toUpperCase() + selectedMine.overallRisk.slice(1)}
          sublabel={`${selectedMine.coalfield} · ${selectedMine.currentSeam}`}
          icon={ShieldCheck}
          riskLevel={selectedMine.overallRisk}
        />
        <KpiCard
          label="Active Alerts"
          value={activeAlerts.length}
          unit={activeAlerts.length === 1 ? 'alert' : 'alerts'}
          sublabel={activeAlerts.length === 0 ? 'No active incidents' : 'Require attention'}
          icon={AlertTriangle}
          riskLevel={activeAlerts.length > 0 ? 'critical' : 'normal'}
          href="/alerts"
        />
        <KpiCard
          label="Online Sensors"
          value={`${onlineSensors} / ${sensors.length}`}
          sublabel="Sensor network coverage"
          icon={Cpu}
          riskLevel={onlineSensors < sensors.length * 0.8 ? 'warning' : 'normal'}
          href="/sensors"
        />
        <KpiCard
          label="High-Risk Sectors"
          value={highRiskSectors}
          unit={highRiskSectors === 1 ? 'sector' : 'sectors'}
          sublabel={highRiskSectors === 0 ? 'All sectors normal' : 'Need monitoring'}
          icon={Layers}
          riskLevel={highRiskSectors > 0 ? 'warning' : 'normal'}
        />
      </div>

      {/* 3. Sector Risk Map */}
      <div className="mg-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="mg-card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="mg-card-title" style={{ fontSize: '1rem' }}>
              <Map size={17} color="var(--cyan-bright)" />
              Sector Risk Overview
            </div>
            <div className="mg-card-subtitle" style={{ fontSize: '0.8rem' }}>
              AI-assessed risk for each mine sector — click any sector for details
            </div>
          </div>
          <Link to="/predictions" className="mg-btn mg-btn-outline-cyan mg-btn-sm">
            Full AI Predictions →
          </Link>
        </div>
        <SectorRiskGrid predictions={predictions} />
      </div>

      {/* 4. Critical Alerts */}
      <div className="mg-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="mg-card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="mg-card-title" style={{ fontSize: '1rem' }}>
              <AlertTriangle size={17} color="var(--risk-critical)" />
              Recent Alerts
              {activeAlerts.length > 0 && (
                <span style={{
                  marginLeft: '0.35rem', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(239,68,68,0.18)', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.4)',
                  padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-pill)'
                }}>
                  {activeAlerts.length} active
                </span>
              )}
            </div>
            <div className="mg-card-subtitle" style={{ fontSize: '0.8rem' }}>
              Expand any alert to see the recommended safety action
            </div>
          </div>
          <Link to="/alerts" className="mg-btn mg-btn-secondary mg-btn-sm">
            All Alerts →
          </Link>
        </div>

        {dashboardAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={32} color="var(--risk-normal)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--risk-normal)' }}>All Clear</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No active alerts at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {dashboardAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>

      {/* 5. Advanced Telemetry — Expandable */}
      <div className="mg-card" style={{ padding: '1.25rem 1.5rem' }}>
        <button
          onClick={() => setShowAdvancedCharts(!showAdvancedCharts)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0
          }}
          aria-expanded={showAdvancedCharts}
          aria-controls="advanced-telemetry-section"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={17} color="var(--cyan-bright)" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Advanced Telemetry Charts
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Strata displacement & subsidence velocity
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.8rem' }}>{showAdvancedCharts ? 'Collapse' : 'Expand'}</span>
            {showAdvancedCharts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showAdvancedCharts && (
          <div
            id="advanced-telemetry-section"
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {/* Displacement chart */}
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4', display: 'inline-block', flexShrink: 0 }} />
                  Strata Displacement (mm)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  MPBX-101 Borehole · AI forecast shown as dashed orange line
                </div>
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
              <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <Link to="/monitoring" style={{ fontSize: '0.78rem', color: 'var(--cyan-bright)' }}>
                  Live Telemetry Streams →
                </Link>
              </div>
            </div>

            {/* Subsidence velocity */}
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#14b8a6', display: 'inline-block', flexShrink: 0 }} />
                  Subsidence Velocity (mm/day)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Red bars = above 3.0 mm/day DGMS threshold
                </div>
              </div>
              <SubsidenceVelocityChart data={telemetry} />
              <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <Link to="/analytics" style={{ fontSize: '0.78rem', color: 'var(--cyan-bright)' }}>
                  Full Analytics →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
