import React, { useState } from 'react';
import type { MineAlert } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { useMine } from '../../context/MineContext';
import { CheckCircle, AlertTriangle, Clock, Check, ChevronDown, ChevronUp, Eye, Send } from 'lucide-react';
import { api } from '../../services/api';

interface AlertTableProps {
  alerts: MineAlert[];
  compact?: boolean;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, compact = false }) => {
  const { acknowledgeAlert, resolveAlert } = useMine();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const handleInvestigate = async (id: string) => {
    try {
      await api.investigateAlert(id);
    } catch (err) {
      console.error("Failed to set investigating status:", err);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  return (
    <div>
      {!compact && (
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
              Severity:
            </span>
            {['all', 'critical', 'warning', 'info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`mg-btn mg-btn-sm ${filterSeverity === sev ? 'mg-btn-outline-cyan' : 'mg-btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Status:
            </span>
            {['all', 'active', 'investigating', 'acknowledged', 'resolved'].map((st) => (
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
        </div>
      )}

      <div className="mg-table-container">
        <table className="mg-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Incident &amp; Sensor</th>
              <th>Sector</th>
              <th>Metric Value</th>
              <th>Time</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No alerts matching selected criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => {
                const isExpanded = expandedAlertId === alert.id;
                return (
                  <React.Fragment key={alert.id}>
                    <tr>
                      <td>
                        <RiskBadge level={alert.severity} size="sm" />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {alert.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {alert.sensorName} <span className="font-mono">({alert.sensorId})</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {alert.sector}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {alert.currentValue}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            (Limit: {alert.thresholdValue})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {alert.timestamp}
                        </div>
                      </td>
                      <td>
                        <span
                          className="mg-badge"
                          style={{
                            background:
                              alert.status === 'active'
                                ? 'rgba(239, 68, 68, 0.12)'
                                : alert.status === 'investigating'
                                ? 'rgba(168, 85, 247, 0.12)'
                                : alert.status === 'acknowledged'
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(16, 185, 129, 0.12)',
                            color:
                              alert.status === 'active'
                                ? 'var(--risk-critical)'
                                : alert.status === 'investigating'
                                ? '#c084fc'
                                : alert.status === 'acknowledged'
                                ? 'var(--risk-moderate)'
                                : 'var(--risk-normal)',
                            border: '1px solid currentColor',
                            textTransform: 'capitalize'
                          }}
                        >
                          {alert.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {alert.status === 'active' && (
                            <>
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="mg-btn mg-btn-sm mg-btn-secondary"
                                title="Acknowledge Alert"
                              >
                                <Check size={13} /> Ack
                              </button>
                              <button
                                onClick={() => handleInvestigate(alert.id)}
                                className="mg-btn mg-btn-sm"
                                style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                                title="Mark Investigating"
                              >
                                <Eye size={13} /> Inspect
                              </button>
                            </>
                          )}
                          {alert.status !== 'resolved' && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="mg-btn mg-btn-sm mg-btn-outline-cyan"
                              title="Mark Resolved"
                            >
                              <CheckCircle size={13} /> Resolve
                            </button>
                          )}
                          <button
                            onClick={() => toggleExpand(alert.id)}
                            className="mg-btn mg-btn-sm mg-btn-secondary"
                            title="Toggle details & evidence log"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'rgba(6, 182, 212, 0.03)' }}>
                        <td colSpan={7} style={{ padding: '1rem 1.5rem' }}>
                          <div
                            style={{
                              borderLeft: '3px solid var(--cyan-primary)',
                              background: 'rgba(15, 24, 47, 0.7)',
                              padding: '1rem 1.25rem',
                              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertTriangle size={15} color="var(--risk-warning)" />
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                Directorate General of Mines Safety (DGMS) Recommended SOP Action:
                              </strong>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {alert.sopRecommendation}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                              <div>Notifications: <span style={{ color: 'var(--cyan-bright)' }}><Send size={11} style={{ display: 'inline', marginRight: '3px' }} /> In-App (Sent) &bull; Email (Simulated) &bull; SMS (Simulated)</span></div>
                              {alert.acknowledgedBy && (
                                <div>Acknowledged by: <strong style={{ color: 'var(--text-main)' }}>{alert.acknowledgedBy}</strong> at {alert.acknowledgedAt}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
