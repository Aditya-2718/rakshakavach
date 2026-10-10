import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, HardHat, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('rajesh.sharma@bccl.gov.in');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('safety-officer');
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // error is set in AuthContext
    }
  };

  const handleFillDemo = () => {
    setEmail('rajesh.sharma@bccl.gov.in');
    setPassword('MineGuard2026!Sec');
    setRole('safety-officer');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6, 182, 212, 0.12), transparent 70%), var(--bg-app)'
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(14, 165, 233, 0.15))',
                border: '1.5px solid var(--cyan-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan-bright)',
                boxShadow: '0 0 16px var(--cyan-glow)'
              }}
            >
              <Shield size={24} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Mine<span style={{ color: 'var(--cyan-bright)' }}>Guard</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
            Colliery Safety Portal Sign In
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Authorized DGMS and Colliery Personnel Access Only
          </p>
        </div>

        {/* Login Card */}
        <div className="mg-card" style={{ padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          {error && (
            <div
              style={{
                background: 'var(--risk-critical-bg)',
                border: '1px solid var(--risk-critical-border)',
                color: 'var(--risk-critical)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="mg-label">Role Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mg-select"
              >
                <option value="safety-officer">Mine Safety Officer (DGMS Certified)</option>
                <option value="geotechnical-engineer">Geotechnical / Rock Mechanics Engineer</option>
                <option value="colliery-manager">Colliery General Manager (BCCL/ECL)</option>
                <option value="dgms-inspector">DGMS Regional Inspector</option>
              </select>
            </div>

            <div>
              <label className="mg-label">Colliery Email ID</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@coal.gov.in"
                  className="mg-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="mg-label" style={{ marginBottom: 0 }}>Password</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', cursor: 'pointer' }}>Forgot Password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mg-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="mg-btn mg-btn-primary mg-btn-lg" style={{ marginTop: '0.5rem' }} disabled={isLoading}>
              {isLoading ? 'Authenticating…' : (<>Access Safety Dashboard <ArrowRight size={18} /></>)}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              className="mg-btn mg-btn-secondary mg-btn-sm"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <HardHat size={14} color="var(--cyan-bright)" /> Use Pre-filled Safety Officer Demo
            </button>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              New colliery or need station credentials?{' '}
              <Link to="/register" style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>
                Register Colliery
              </Link>
            </p>
          </div>
        </div>

        {/* Integration notice */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <Info size={16} color="var(--cyan-bright)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Phase 2 Backend Active:</strong> JWT authentication via FastAPI. Demo: <code>rajesh.sharma@bccl.gov.in</code> / <code>MineGuard2026!Sec</code>
          </span>
        </div>
      </div>
    </div>
  );
};
