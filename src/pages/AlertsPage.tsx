import React from 'react';
import { useMine } from '../context/MineContext';
import { AlertTable } from '../components/tables/AlertTable';
import {
  BellRing,
  AlertTriangle,
  CheckCircle,
  PhoneCall,
  ShieldAlert,
  Clock,
  Radio
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { selectedMine, alerts } = useMine();

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

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
            Alerts &amp; DGMS Incident Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Directorate General of Mines Safety Circular 6/2006 compliance log for {selectedMine.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="mg-badge mg-badge-critical">
            {activeAlerts.length} Unresolved Alarms
          </span>
          <span className="mg-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Escalation: SMS &bull; Siren &bull; Email
          </span>
        </div>
      </div>

      {/* Alarm Status Counts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-critical)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Critical Alarms</span>
            <AlertTriangle size={16} color="var(--risk-critical)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--risk-critical)', margin: '0.25rem 0' }}>
            {criticalAlerts.filter((a) => a.status === 'active').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Requires immediate face evacuation
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-moderate)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acknowledged Alarms</span>
            <Clock size={16} color="var(--risk-moderate)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--risk-moderate)', margin: '0.25rem 0' }}>
            {acknowledgedAlerts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Safety Officer on-site verification logged
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--risk-normal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved Incidents</span>
            <CheckCircle size={16} color="var(--risk-normal)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--risk-normal)', margin: '0.25rem 0' }}>
            {resolvedAlerts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Stabilized after strata reinforcement
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--cyan-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escalation Protocol</span>
            <Radio size={16} color="var(--cyan-bright)" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: '0.5rem 0 0.25rem 0' }}>
            Level 3 Active
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Colliery GM &amp; DGMS Regional notified
          </div>
        </div>
      </div>

      {/* DGMS Escalation & SOP Notice Banner */}
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--risk-critical-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={26} color="var(--risk-critical)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
              DGMS Circular No. 6 Standard Operating Procedure Enforced
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              When differential roof bed separation exceeds 12.0 mm, all extraction personnel must withdraw to the main outbye intake split.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => alert('Emergency dispatch ping sent to Colliery Rescue Team (Simulated).')}
            className="mg-btn mg-btn-danger mg-btn-sm"
          >
            <PhoneCall size={13} /> Dispatch Rescue Alert
          </button>
        </div>
      </div>

      {/* Alerts Table Component */}
      <div className="mg-card">
        <div className="mg-card-header">
          <div>
            <div className="mg-card-title">
              <BellRing size={18} color="var(--cyan-bright)" />
              <span>Colliery Incident &amp; Alarm Log</span>
            </div>
            <div className="mg-card-subtitle">
              Filter by severity and status. Expand any incident to inspect regulatory SOP recommendations and digital sign-off.
            </div>
          </div>
        </div>

        <AlertTable alerts={alerts} compact={false} />
      </div>
    </div>
  );
};
