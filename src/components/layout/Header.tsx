import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  HardHat,
  ChevronDown,
  Menu,
  LogOut,
  Radio,
  Sliders,
  ChevronUp,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

/* Indian tricolour SVG flag strip (symbolic, not official seal) */
const IndiaFlagIcon: React.FC = () => (
  <svg width="28" height="20" viewBox="0 0 28 20" style={{ borderRadius: 2, flexShrink: 0, border: '1px solid rgba(15,52,96,0.15)' }}>
    <rect width="28" height="6.67" y="0"    fill="#FF9933"/>
    <rect width="28" height="6.67" y="6.67" fill="#FFFFFF"/>
    <rect width="28" height="6.67" y="13.33" fill="#138808"/>
    <circle cx="14" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.7"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    mines, selectedMine, setSelectedMine, alerts,
    wsStatus, isStale, simulatorState,
    startSimulator, pauseSimulator, resumeSimulator, stopSimulator, setSimulatorScenario
  } = useMine();

  const [showMineDropdown, setShowMineDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const navigate = useNavigate();

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const wsConnected = wsStatus === 'connected' && !isStale;
  const wsWarn = wsStatus === 'reconnecting' || isStale;
  const wsColor = wsConnected ? '#1A5C1A' : wsWarn ? '#B8860B' : '#8B0000';

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    background: '#FFFBF0',
    border: '1px solid rgba(15,52,96,0.18)',
    borderRadius: 6,
    boxShadow: '0 8px 24px rgba(15,52,96,0.15)',
    zIndex: 100,
    fontFamily: 'Satoshi, sans-serif',
  };

  return (
    <header className="mg-top-header">
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile menu */}
        <button onClick={onToggleMobileSidebar} className="mg-btn mg-btn-secondary mg-btn-sm" aria-label="Toggle navigation">
          <Menu size={17} />
        </button>

        {/* Flag + Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <IndiaFlagIcon />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Literata, serif', letterSpacing: '-0.01em' }}>
              Rakshakavach
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              AI-Enabled Mine Safety Monitoring
            </span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'var(--border-light)' }} />

        {/* Mine Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMineDropdown(!showMineDropdown)}
            className="mg-btn mg-btn-secondary mg-btn-sm"
            style={{ gap: '0.5rem' }}
            aria-haspopup="listbox" aria-expanded={showMineDropdown} aria-label={`Mine: ${selectedMine.name}`}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: selectedMine.overallRisk === 'critical' ? 'var(--risk-critical)' : selectedMine.overallRisk === 'warning' ? 'var(--risk-warning)' : 'var(--risk-normal)'
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>{selectedMine.name}</span>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {showMineDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowMineDropdown(false)} aria-hidden="true" />
              <div style={{ ...dropdownStyle, left: 0, width: 300, padding: '0.5rem' }} role="listbox">
                <div style={{ padding: '0.3rem 0.6rem', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
                  Select Colliery
                </div>
                {mines.map((mine) => (
                  <button key={mine.id} onClick={() => { setSelectedMine(mine); setShowMineDropdown(false); }}
                    role="option" aria-selected={mine.id === selectedMine.id}
                    style={{
                      width: '100%', padding: '0.55rem 0.7rem', borderRadius: 4, display: 'flex', flexDirection: 'column', textAlign: 'left',
                      background: mine.id === selectedMine.id ? 'rgba(15,52,96,0.08)' : 'transparent',
                      border: mine.id === selectedMine.id ? '1px solid rgba(15,52,96,0.25)' : '1px solid transparent',
                      marginBottom: '0.2rem', cursor: 'pointer'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--navy)' }}>{mine.name}</span>
                      <span className={`mg-badge mg-badge-sm mg-badge-${mine.overallRisk}`}>{mine.overallRisk}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mine.company} · {mine.coalfield}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* WS Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.28rem 0.6rem', borderRadius: 4,
          background: wsConnected ? 'rgba(26,92,26,0.08)' : wsWarn ? 'rgba(184,134,11,0.10)' : 'rgba(139,0,0,0.08)',
          border: `1px solid ${wsColor}55`,
          fontSize: '0.72rem', fontWeight: 700, color: wsColor, letterSpacing: '0.03em'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: wsColor, flexShrink: 0,
            animation: wsConnected ? 'pulse-radar 1.5s infinite' : 'none' }} />
          {wsConnected ? 'Live' : wsWarn ? (isStale ? 'Stale' : 'Reconnecting') : 'Offline'}
        </div>

        {/* Simulator */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSimulator(!showSimulator)} className="mg-btn mg-btn-secondary mg-btn-sm"
            title="Demo simulator" aria-label="Simulator controls" aria-expanded={showSimulator}
            style={{ gap: '0.35rem' }}>
            <Sliders size={14} />
            <span style={{ fontSize: '0.75rem' }}>Sim</span>
            {simulatorState.status === 'running' && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--risk-normal)', animation: 'pulse-radar 1.5s infinite' }} />
            )}
            {showSimulator ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showSimulator && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowSimulator(false)} aria-hidden="true" />
              <div style={{ ...dropdownStyle, right: 0, width: 250, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                  Demo Simulator
                </div>
                <div style={{ marginBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Scenario</div>
                  <select value={simulatorState.scenario} onChange={(e) => setSimulatorScenario(e.target.value)}
                    className="mg-select" style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}>
                    <option value="normal">Normal Baseline</option>
                    <option value="gradual_displacement">Gradual Sag (Warning)</option>
                    <option value="seismic_burst">Seismic Burst (Spike)</option>
                    <option value="rapid_subsidence">Rapid Subsidence (Critical)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {simulatorState.status === 'running' ? (
                    <button onClick={() => { pauseSimulator(); setShowSimulator(false); }} className="mg-btn mg-btn-secondary mg-btn-sm" style={{ color: 'var(--risk-warning)' }}>Pause</button>
                  ) : simulatorState.status === 'paused' ? (
                    <button onClick={() => { resumeSimulator(); setShowSimulator(false); }} className="mg-btn mg-btn-primary mg-btn-sm">Resume</button>
                  ) : (
                    <button onClick={() => { startSimulator({ scenario: 'gradual_displacement' }); setShowSimulator(false); }} className="mg-btn mg-btn-primary mg-btn-sm">Start Demo</button>
                  )}
                  {simulatorState.status !== 'stopped' && (
                    <button onClick={() => { stopSimulator(); setShowSimulator(false); }} className="mg-btn mg-btn-secondary mg-btn-sm" style={{ color: 'var(--risk-critical)' }}>Stop</button>
                  )}
                </div>
                <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Status: <span style={{ fontWeight: 700, textTransform: 'capitalize', color: simulatorState.status === 'running' ? 'var(--risk-normal)' : 'var(--text-secondary)' }}>{simulatorState.status}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alerts Bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowAlertsDropdown(!showAlertsDropdown)} className="mg-btn mg-btn-secondary mg-btn-sm"
            style={{ padding: '0.4rem', position: 'relative' }} aria-label={`Alerts: ${activeAlerts.length} active`}>
            <Bell size={16} />
            {activeAlerts.length > 0 && (
              <span style={{ position: 'absolute', top: -3, right: -3, background: '#8B0000', color: '#fff', fontSize: '0.6rem', fontWeight: 800, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFBF0' }}>
                {activeAlerts.length}
              </span>
            )}
          </button>
          {showAlertsDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowAlertsDropdown(false)} aria-hidden="true" />
              <div style={{ ...dropdownStyle, right: 0, width: 310, padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>Active Alerts ({activeAlerts.length})</span>
                  <Link to="/alerts" onClick={() => setShowAlertsDropdown(false)} style={{ fontSize: '0.75rem', color: 'var(--navy)', fontWeight: 600 }}>View all →</Link>
                </div>
                {activeAlerts.length === 0
                  ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem 0', textAlign: 'center' }}>No active incidents.</p>
                  : activeAlerts.slice(0, 3).map((alt) => (
                    <div key={alt.id} style={{ padding: '0.5rem 0.6rem', borderRadius: 4, background: 'rgba(139,0,0,0.06)', borderLeft: '3px solid #8B0000', marginBottom: '0.35rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>{alt.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{alt.sector} · {alt.timestamp}</div>
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.6rem', borderRadius: 4, background: 'var(--surface-card)', border: '1px solid var(--border-light)', cursor: 'pointer' }}
            aria-haspopup="true" aria-expanded={showUserDropdown}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFBF0', flexShrink: 0 }}>
              <HardHat size={15} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.2 }}>Safety Officer</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>DGMS</div>
            </div>
            <ChevronDown size={11} color="var(--text-muted)" />
          </button>
          {showUserDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowUserDropdown(false)} aria-hidden="true" />
              <div style={{ ...dropdownStyle, right: 0, width: 210, padding: '0.4rem' }}>
                <div style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.3rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>Er. Rajesh Sharma</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chief Safety Officer · DGMS</div>
                </div>
                <Link to="/" onClick={() => setShowUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.7rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderRadius: 4 }}>
                  <ExternalLink size={13} /> Landing Page
                </Link>
                <Link to="/settings" onClick={() => setShowUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.7rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderRadius: 4 }}>
                  <Radio size={13} /> Settings
                </Link>
                <button onClick={() => { setShowUserDropdown(false); navigate('/login'); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.7rem', fontSize: '0.8rem', color: 'var(--risk-critical)', borderRadius: 4, textAlign: 'left', cursor: 'pointer' }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
