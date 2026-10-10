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
  Shield,
  Layers,
  Home
} from 'lucide-react';
import { useMine } from '../../context/MineContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { alerts = [], selectedMine } = useMine();
  const activeAlertsCount = alerts?.filter((a) => a.status === 'active').length || 0;


  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Monitoring', path: '/monitoring', icon: Activity },
    { label: 'Mine GIS Map', path: '/map', icon: Map },
    { label: 'AI Predictions', path: '/predictions', icon: Sparkles },
    { label: 'Alerts & Incidents', path: '/alerts', icon: BellRing, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { label: 'Sensor Network', path: '/sensors', icon: Cpu },
    { label: 'Historical Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'System Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="mg-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`mg-sidebar ${collapsed ? 'mg-sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 1.25rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))',
                border: '1.5px solid var(--cyan-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-bright)',
                flexShrink: 0,
                boxShadow: '0 0 12px var(--cyan-glow)'
              }}
            >
              <Shield size={20} />
            </div>

            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                    Mine<span style={{ color: 'var(--cyan-bright)' }}>Guard</span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--cyan-light)',
                      border: '1px solid var(--border-cyan)',
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 700
                    }}
                  >
                    PHASE 1
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Underground Telemetry
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="mg-btn mg-btn-secondary"
              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <button
              onClick={onToggleCollapse}
              className="mg-btn mg-btn-secondary"
              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Selected Mine Status Ribbon */}
        {!collapsed && (
          <div
            style={{
              padding: '0.75rem 1rem',
              margin: '0.75rem 0.75rem 0.25rem 0.75rem',
              background: 'rgba(15, 24, 47, 0.8)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={12} color="var(--cyan-bright)" /> {selectedMine?.coalfield}
              </span>
              <span className={`mg-badge mg-badge-sm mg-badge-${selectedMine?.overallRisk}`}>
                {selectedMine?.overallRisk}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              Seam: <span style={{ color: 'var(--text-main)' }}>{selectedMine?.currentSeam}</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `mg-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.75rem 0' : '0.7rem 1rem'
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    style={{
                      background: 'var(--risk-critical)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Link to Landing */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(6, 10, 20, 0.6)'
          }}
        >
          <NavLink
            to="/"
            className="mg-btn mg-btn-secondary"
            style={{
              width: '100%',
              fontSize: '0.8rem',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '0.5rem'
            }}
            title="Public Landing Page"
          >
            <Home size={16} />
            {!collapsed && <span>Public Landing Page</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
