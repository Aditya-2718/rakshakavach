import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Building, User, Mail, Phone, FileText, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'Er. Rajesh Sharma',
    email: 'rajesh.sharma@bccl.gov.in',
    phone: '+91 94311 00000',
    coalfield: 'Jharia Coalfield',
    mineName: 'Block IV Underground Colliery',
    company: 'Bharat Coking Coal Limited (BCCL)',
    dgmsLicense: 'DGMS/DHN/2026/A-09',
    extractionMethod: 'Bord & Pillar'
  });
  const [submitted, setSubmitted] = useState(false);

  const { register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(formData.email, formData.fullName, 'MineGuard2026!New', 'safety-officer');
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch {
      // error is handled by AuthContext
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6, 182, 212, 0.12), transparent 70%), var(--bg-app)'
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Header */}
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
                color: 'var(--cyan-bright)'
              }}
            >
              <Shield size={24} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Mine<span style={{ color: 'var(--cyan-bright)' }}>Guard</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
            Colliery Safety Station Onboarding
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Register your underground coal extraction perimeter for telemetry monitoring
          </p>
        </div>

        <div className="mg-card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-lg)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid var(--risk-normal)',
                  color: 'var(--risk-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                Colliery Profile Registered
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Telemetry encryption keys provisioned. Redirecting to Safety Command Center...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="mg-label">Designated Safety Officer</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="mg-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <User size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="mg-label">Official Colliery Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="mg-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="mg-label">SMS Alert Escalation Phone</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="mg-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="mg-label">Coalfield Province</label>
                  <select
                    className="mg-select"
                    value={formData.coalfield}
                    onChange={(e) => setFormData({ ...formData, coalfield: e.target.value })}
                  >
                    <option value="Jharia Coalfield">Jharia Coalfield (Jharkhand - BCCL)</option>
                    <option value="Raniganj Coalfield">Raniganj Coalfield (West Bengal - ECL)</option>
                    <option value="Korba Coalfield">Korba Coalfield (Chhattisgarh - SECL)</option>
                    <option value="Singrauli Coalfield">Singrauli Coalfield (Madhya Pradesh - NCL)</option>
                    <option value="Godavari Valley">Godavari Valley (Telangana - SCCL)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="mg-label">Colliery / Mine Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="mg-input"
                      value={formData.mineName}
                      onChange={(e) => setFormData({ ...formData, mineName: e.target.value })}
                      required
                    />
                    <Building size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="mg-label">DGMS Mining Lease / License ID</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="mg-input"
                      value={formData.dgmsLicense}
                      onChange={(e) => setFormData({ ...formData, dgmsLicense: e.target.value })}
                      required
                    />
                    <FileText size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label className="mg-label">Operating Coal Subsidiary</label>
                  <input
                    type="text"
                    className="mg-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="mg-label">Extraction Method</label>
                  <select
                    className="mg-select"
                    value={formData.extractionMethod}
                    onChange={(e) => setFormData({ ...formData, extractionMethod: e.target.value })}
                  >
                    <option value="Bord & Pillar">Bord & Pillar (Depillaring with Caving)</option>
                    <option value="Longwall Retreat">Longwall Retreat with Powered Supports</option>
                    <option value="Continuous Miner">Continuous Miner with Cable Bolting</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="mg-btn mg-btn-primary mg-btn-lg" style={{ marginTop: '0.75rem' }} disabled={isLoading}>
                {isLoading ? 'Registering…' : (<>Complete Colliery Registration <ArrowRight size={18} /></>)}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Already registered colliery?{' '}
                  <Link to="/login" style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>
                    Sign In
                  </Link>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
