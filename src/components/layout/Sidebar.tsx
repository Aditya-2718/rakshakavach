import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Map,
  Sparkles,
  BellRing,
  Cpu,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield
} from 'lucide-react';
import { useMine } from '../../context/MineContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navGroups = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard',       path: '/dashboard',  icon: LayoutDashboard },
      { label: 'Live Monitoring', path: '/monitoring', icon: Activity },
      { label: 'GIS Map',         path: '/map',        icon: Map },
    ]
  },
  {
    section: 'Intelligence',
    items: [
      { label: 'AI Predictions',  path: '/predictions', icon: Sparkles },
      { label: 'Alerts',          path: '/alerts',      icon: BellRing, hasBadge: true },
      { label: 'Analytics',       path: '/analytics',   icon: BarChart3 },
    ]
  },
  {
    section: 'Management',
    items: [
      { label: 'Sensors',         path: '/sensors',  icon: Cpu },
      { label: 'Settings',        path: '/settings', icon: Settings },
    ]
  }
];

const riskMap: Record<string, string> = {
  critical: '#8B0000',
  warning:  '#B8860B',
  moderate: '#8B6914',
  normal:   '#1A5C1A',
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed, onToggleCollapse, mobileOpen, onCloseMobile
}) => {
  const { alerts = [], selectedMine } = useMine();
  const activeAlertsCount = alerts?.filter((a) => a.status === 'active').length || 0;
  const riskColor = riskMap[selectedMine?.overallRisk] ?? '#1A5C1A';

  return (
    <>
      {mobileOpen && (
        <div className="mg-sidebar-backdrop" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`mg-sidebar ${collapsed ? 'mg-sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Application navigation"
      >
        {/* Brand */}
        <div style={{
          padding: collapsed ? '1rem 0' : '1rem 1rem',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 72,
        }}>
          {!collapsed ? (
            <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37, #A8881C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 0 12px rgba(212,175,55,0.3)'
              }}>
                <Shield size={20} color="#0A2347" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFBF0', letterSpacing: '-0.01em', fontFamily: 'Literata, serif' }}>
                  Rakshakavach
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,251,240,0.5)', lineHeight: 1.2, marginTop: '1px' }}>
                  Mine Safety System
                </div>
              </div>
            </NavLink>
          ) : (
            <NavLink to="/" title="Rakshakavach">
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37, #A8881C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color="#0A2347" />
              </div>
            </NavLink>
          )}

          {!collapsed && (
            <button onClick={onToggleCollapse} className="mg-btn mg-btn-secondary mg-btn-sm"
              style={{ padding: '0.3rem', background: 'transparent', border: '1px solid rgba(255,251,240,0.15)', color: 'rgba(255,251,240,0.6)' }}
              title="Collapse sidebar" aria-label="Collapse sidebar">
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <button onClick={onToggleCollapse} className="mg-btn mg-btn-sm"
              style={{ padding: '0.3rem', background: 'transparent', border: '1px solid rgba(255,251,240,0.15)', color: 'rgba(255,251,240,0.6)' }}
              title="Expand sidebar" aria-label="Expand sidebar">
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Mine status ribbon */}
        {!collapsed && selectedMine && (
          <div style={{
            margin: '0.65rem 0.75rem 0.25rem',
            padding: '0.6rem 0.85rem',
            background: 'rgba(255,251,240,0.06)',
            borderRadius: 4,
            borderLeft: `3px solid ${riskColor}`,
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFBF0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedMine.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,251,240,0.55)' }}>{selectedMine.coalfield}</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: riskColor, textTransform: 'uppercase' }}>
                {selectedMine.overallRisk}
              </span>
            </div>
          </div>
        )}

        {/* Nav Groups */}
        <nav style={{ flex: 1, padding: '0.35rem 0', overflowY: 'auto' }}>
          {navGroups.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <div className="mg-nav-section">{group.section}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const badge = (item as any).hasBadge && activeAlertsCount > 0 ? activeAlertsCount : undefined;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) => `mg-nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={{ justifyContent: collapsed ? 'center' : undefined, padding: collapsed ? '0.65rem 0' : undefined }}
                    aria-label={item.label}
                  >
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && badge !== undefined && (
                      <span style={{
                        background: '#8B0000', color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                        minWidth: 18, height: 18, borderRadius: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                      }} aria-label={`${badge} active alerts`}>
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0.65rem', borderTop: '1px solid rgba(212,175,55,0.15)', background: 'rgba(0,0,0,0.15)' }}>
          <NavLink
            to="/"
            className="mg-nav-item"
            style={{ justifyContent: collapsed ? 'center' : undefined, margin: 0, padding: collapsed ? '0.5rem 0' : '0.5rem 0.5rem' }}
            title="Home"
          >
            <Home size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: '0.8rem' }}>Home</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
