import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  HardHat,
  ChevronDown,
  Menu,
  ExternalLink,
  LogOut,
  Radio
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    mines, selectedMine, setSelectedMine, alerts,
    wsStatus, isStale, simulatorState, startSimulator, pauseSimulator,
    resumeSimulator, stopSimulator, setSimulatorScenario
  } = useMine();
  const [showMineDropdown, setShowMineDropdown] = useState<boolean>(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <header className="mg-top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="mg-btn mg-btn-secondary mg-btn-sm"
          style={{ display: 'flex' }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Mine Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMineDropdown(!showMineDropdown)}
            className="mg-btn mg-btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid var(--border-medium)',
              background: 'rgba(15, 24, 47, 0.9)'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedMine.overallRisk === 'critical' ? 'var(--risk-critical)' : 'var(--cyan-bright)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {selectedMine.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {selectedMine.coalfield} &bull; {selectedMine.state}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showMineDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setShowMineDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: 320,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Select Coal Mining Colliery
                </div>
                {mines.map((mine) => (
                  <button
                    key={mine.id}
                    onClick={() => {
                      setSelectedMine(mine);
                      setShowMineDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'left',
                      background: mine.id === selectedMine.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                      border: mine.id === selectedMine.id ? '1px solid var(--border-cyan)' : '1px solid transparent',
                      marginBottom: '0.25rem',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {mine.name}
                      </span>
                      <span className="mg-badge mg-badge-sm" style={{ textTransform: 'capitalize' }}>
                        {mine.overallRisk}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {mine.company} ({mine.coalfield})
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Action Icons & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* WebSocket Real-time Status Indicator Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            background: wsStatus === 'connected' && !isStale
              ? 'rgba(16, 185, 129, 0.12)'
              : wsStatus === 'reconnecting' || isStale
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${
              wsStatus === 'connected' && !isStale
                ? 'var(--risk-normal)'
                : wsStatus === 'reconnecting' || isStale
                ? 'var(--risk-warning)'
                : 'var(--risk-critical)'
            }`,
            fontSize: '0.75rem',
            fontWeight: 600
          }}
          title={
            wsStatus === 'connected' && !isStale
              ? 'Connected to live WebSocket telemetry stream'
              : isStale
              ? 'Telemetry readings are stale (>60s since last payload)'
              : 'WebSocket disconnected — attempting automatic backoff reconnection'
          }
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background:
                wsStatus === 'connected' && !isStale
                  ? 'var(--risk-normal)'
                  : wsStatus === 'reconnecting' || isStale
                  ? 'var(--risk-warning)'
                  : 'var(--risk-critical)',
              animation: wsStatus === 'connected' && !isStale ? 'pulse-radar 1.5s infinite' : 'none'
            }}
          />
          <span
            style={{
              color:
                wsStatus === 'connected' && !isStale
                  ? 'var(--risk-normal)'
                  : wsStatus === 'reconnecting' || isStale
                  ? 'var(--risk-warning)'
                  : 'var(--risk-critical)'
            }}
          >
            {wsStatus === 'connected' && !isStale
              ? 'Live WebSocket'
              : isStale
              ? 'Stale Telemetry'
              : wsStatus === 'reconnecting'
              ? 'Reconnecting...'
              : 'Offline'}
          </span>
        </div>

        {/* Demo Simulator Toolbar Button/Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sim:</span>
          {simulatorState.status === 'running' ? (
            <button
              onClick={() => pauseSimulator()}
              className="mg-btn mg-btn-secondary mg-btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--risk-warning)' }}
            >
              Pause
            </button>
          ) : simulatorState.status === 'paused' ? (
            <button
              onClick={() => resumeSimulator()}
              className="mg-btn mg-btn-primary mg-btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
            >
              Resume
            </button>
          ) : (
            <button
              onClick={() => startSimulator({ scenario: 'gradual_displacement' })}
              className="mg-btn mg-btn-primary mg-btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
            >
              Start Demo
            </button>
          )}

          {simulatorState.status !== 'stopped' && (
            <button
              onClick={() => stopSimulator()}
              className="mg-btn mg-btn-secondary mg-btn-sm"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem', color: 'var(--risk-critical)' }}
            >
              Stop
            </button>
          )}

          <select
            value={simulatorState.scenario}
            onChange={(e) => setSimulatorScenario(e.target.value)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--cyan-bright)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.72rem',
              padding: '0.15rem 0.35rem'
            }}
          >
            <option value="normal">Normal Baseline</option>
            <option value="gradual_displacement">Gradual Sag (Warning)</option>
            <option value="seismic_burst">Seismic Burst (Spike)</option>
            <option value="rapid_subsidence">Rapid Subsidence (Critical)</option>
          </select>
        </div>

        {/* Notifications / Alerts Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="mg-btn mg-btn-secondary"
            style={{ padding: '0.5rem', position: 'relative', borderRadius: 'var(--radius-md)' }}
            aria-label="View Active Alerts"
          >
            <Bell size={18} />
            {activeAlerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--risk-critical)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-app)'
                }}
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setShowAlertsDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: 340,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 100
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Active Alarms ({activeAlerts.length})
                  </span>
                  <Link
                    to="/alerts"
                    onClick={() => setShowAlertsDropdown(false)}
                    style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)' }}
                  >
                    View All &rarr;
                  </Link>
                </div>
                {activeAlerts.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '1rem 0', textAlign: 'center' }}>
                    All ground movement levels nominal.
                  </p>
                ) : (
                  activeAlerts.slice(0, 3).map((alt) => (
                    <div
                      key={alt.id}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderLeft: '3px solid var(--risk-critical)',
                        marginBottom: '0.4rem'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {alt.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {alt.sensorName} &bull; {alt.sector}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--cyan-primary), #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060a14',
                fontWeight: 700
              }}
            >
              <HardHat size={18} />
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Er. Rajesh Sharma
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Chief Safety Officer &bull; DGMS
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showUserDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                onClick={() => setShowUserDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: 220,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.4rem',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    BCCL Colliery Desk
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    License: DGMS/DHN/2026/A-09
                  </div>
                </div>

                <Link
                  to="/"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <ExternalLink size={14} /> Back to Landing Page
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Radio size={14} /> Telemetry Settings
                </Link>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--risk-critical)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} /> Sign Out (Demo)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
