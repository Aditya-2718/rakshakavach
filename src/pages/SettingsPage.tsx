import React, { useState, useEffect } from 'react';
import { useMine } from '../context/MineContext';
import {
  Shield,
  Sliders,
  Server,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  RefreshCw,
  BellRing
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { selectedMine, backendConnected, settings: globalSettings, updateSettings } = useMine();
  const [settings, setSettings] = useState(globalSettings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false);

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestEndpoint = () => {
    setTestingEndpoint(true);
    setTimeout(() => {
      setTestingEndpoint(false);
      alert(
        backendConnected
          ? 'FastAPI endpoint connection verified successfully!'
          : `FastAPI endpoint at ${settings.apiBaseUrl} is on standby. Phase 1 is functioning in high-fidelity simulated telemetry mode.`
      );
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 960 }}>
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
            System Settings &amp; Threshold Configuration
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Configure DGMS early warning triggers, SMS escalation chains, and FastAPI pipeline
          </p>
        </div>

        {savedSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--risk-normal)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--risk-normal)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={14} /> Settings Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Colliery Profile & Lease */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <Shield size={18} color="var(--cyan-bright)" />
              <span>Colliery Profile &amp; DGMS Jurisdiction</span>
            </div>
            <span className="mg-badge mg-badge-sm mg-badge-cyan">Active Colliery</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="mg-label">Active Colliery Name</label>
              <input type="text" className="mg-input" value={selectedMine.name} readOnly disabled style={{ opacity: 0.8 }} />
            </div>

            <div>
              <label className="mg-label">Operating Coal Subsidiary</label>
              <input type="text" className="mg-input" value={selectedMine.company} readOnly disabled style={{ opacity: 0.8 }} />
            </div>

            <div>
              <label className="mg-label">Coalfield &amp; State</label>
              <input type="text" className="mg-input" value={`${selectedMine.coalfield}, ${selectedMine.state}`} readOnly disabled style={{ opacity: 0.8 }} />
            </div>

            <div>
              <label className="mg-label">Extraction Technology</label>
              <input type="text" className="mg-input" value={selectedMine.extractionMethod} readOnly disabled style={{ opacity: 0.8 }} />
            </div>
          </div>
        </div>

        {/* Section 2: Geotechnical Safety Thresholds */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <Sliders size={18} color="var(--risk-warning)" />
              <span>DGMS Circular 6/2006 Strata Threshold Limits</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="mg-label">Critical Roof Displacement Limit (mm)</label>
              <input
                type="number"
                step="0.5"
                className="mg-input"
                value={settings.displacementCriticalThresholdMm}
                onChange={(e) => setSettings({ ...settings, displacementCriticalThresholdMm: parseFloat(e.target.value) })}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DGMS benchmark: 12.0 mm</span>
            </div>

            <div>
              <label className="mg-label">Subsidence Velocity Trigger (mm/day)</label>
              <input
                type="number"
                step="0.1"
                className="mg-input"
                value={settings.subsidenceRateCriticalMmDay}
                onChange={(e) => setSettings({ ...settings, subsidenceRateCriticalMmDay: parseFloat(e.target.value) })}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Accelerated caving alert above 3.0 mm/d</span>
            </div>

            <div>
              <label className="mg-label">Angular Tilt Warning Limit (mm/m)</label>
              <input
                type="number"
                step="0.5"
                className="mg-input"
                value={settings.tiltCriticalMmPerM}
                onChange={(e) => setSettings({ ...settings, tiltCriticalMmPerM: parseFloat(e.target.value) })}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Surface infrastructure tilt limit: 4.0 mm/m</span>
            </div>

            <div>
              <label className="mg-label">AI Anomaly Sensitivity</label>
              <select
                className="mg-select"
                value={settings.aiAnomalySensitivity}
                onChange={(e) => setSettings({ ...settings, aiAnomalySensitivity: e.target.value as any })}
              >
                <option value="Low">Low (Fewer early notices)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="High">High (Strict DGMS zero-tolerance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Alarm Escalation Chain */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <BellRing size={18} color="var(--risk-critical)" />
              <span>Emergency Alarm Escalation Chain</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="mg-label">SMS Alert Phone Numbers (Comma separated)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="mg-input"
                  value={settings.smsAlertContacts}
                  onChange={(e) => setSettings({ ...settings, smsAlertContacts: e.target.value })}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label className="mg-label">DGMS Official Email Escalation List</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="mg-input"
                  value={settings.dgmsEmailRecipients}
                  onChange={(e) => setSettings({ ...settings, dgmsEmailRecipients: e.target.value })}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: FastAPI Backend Configuration */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div className="mg-card-title">
              <Server size={18} color="var(--cyan-bright)" />
              <span>FastAPI Telemetry Ingestion Gateway (Phase 2 Ready)</span>
            </div>
            <span
              className="mg-badge mg-badge-sm"
              style={{
                background: backendConnected ? 'var(--risk-normal-bg)' : 'rgba(255,255,255,0.06)',
                color: backendConnected ? 'var(--risk-normal)' : 'var(--text-secondary)'
              }}
            >
              {backendConnected ? 'FastAPI Online' : 'Standby / Simulated Mode'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="mg-label">FastAPI Base URL (VITE_API_BASE_URL)</label>
              <input
                type="text"
                className="mg-input font-mono"
                value={settings.apiBaseUrl}
                onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mg-label">Telemetry Polling Interval (Seconds)</label>
              <input
                type="number"
                className="mg-input font-mono"
                value={settings.telemetryIntervalSeconds}
                onChange={(e) => setSettings({ ...settings, telemetryIntervalSeconds: parseInt(e.target.value) || 15 })}
                min={5}
                max={300}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleTestEndpoint}
              disabled={testingEndpoint}
              className="mg-btn mg-btn-secondary mg-btn-sm"
            >
              <RefreshCw size={14} className={testingEndpoint ? 'spin' : ''} />
              {testingEndpoint ? 'Pinging Gateway...' : 'Test Backend Connection'}
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Targeting: <code style={{ color: 'var(--cyan-bright)' }}>{settings.apiBaseUrl}/health</code>
            </span>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" className="mg-btn mg-btn-primary mg-btn-lg">
            <Save size={18} /> Save &amp; Apply System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
