import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Radio, Cpu, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#04070e',
        borderTop: '1px solid var(--border-subtle)',
        padding: '4.5rem 0 2rem 0',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="mg-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.1))',
                  border: '1.5px solid var(--cyan-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-bright)'
                }}
              >
                <Shield size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Mine<span style={{ color: 'var(--cyan-bright)' }}>Guard</span>
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Next-generation geotechnical early warning system combining borehole telemetry, microseismic instrumentation, and predictive deep learning to prevent coal mine subsidence disasters across India.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <MapPin size={14} color="var(--cyan-bright)" />
              <span>Tailored for Jharia, Raniganj & Korba Coalfields</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li>
                <a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How It Works (5-Step Pipeline)</a>
              </li>
              <li>
                <a href="#features" style={{ color: 'var(--text-secondary)' }}>Core Sensor Architecture</a>
              </li>
              <li>
                <a href="#tech-stack" style={{ color: 'var(--text-secondary)' }}>Technology & AI Engine</a>
              </li>
              <li>
                <a href="#benefits" style={{ color: 'var(--text-secondary)' }}>Mine Operator Benefits</a>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: 'var(--cyan-bright)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Open Safety Command Center <ExternalLink size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Modules */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Operational Modules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li><Link to="/monitoring">Live Telemetry Dashboard</Link></li>
              <li><Link to="/map">Mine GIS Contours & Satellite</Link></li>
              <li><Link to="/predictions">AI Predictive Risk Modeling</Link></li>
              <li><Link to="/alerts">DGMS Incident SOP & Alarms</Link></li>
              <li><Link to="/sensors">Sensor Network Topology</Link></li>
              <li><Link to="/analytics">Subsidence Rate Analytics</Link></li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Safety & Standards
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} color="var(--teal-accent)" />
                <span>DGMS Technical Circular Aligned</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} color="var(--teal-accent)" />
                <span>Intrinsically Safe Zone 1 Hardware</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="var(--teal-accent)" />
                <span>ISO 19901 Geotechnical Benchmarks</span>
              </li>
              <li>
                <span
                  className="mg-badge mg-badge-cyan"
                  style={{ marginTop: '0.5rem', display: 'inline-flex', fontSize: '0.72rem' }}
                >
                  Phase 1 Engineering Demo
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <strong>Geotechnical Engineering Notice:</strong> All data, telemetry charts, and simulated sensor values presented on this platform are calibrated illustrative demonstration models representing subterranean coal mining strata conditions in Indian coalfields. Production deployment connects to real intrinsically safe sensor hardware via FastAPI in Phase 2.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              &copy; 2026 MineGuard Platform. Built for safer underground coal mining in India.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Safety Officer Login</Link>
              <Link to="/register" style={{ color: 'var(--text-secondary)' }}>Colliery Registration</Link>
              <Link to="/settings" style={{ color: 'var(--text-secondary)' }}>System Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
