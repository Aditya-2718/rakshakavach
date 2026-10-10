import React, { useEffect, useState } from 'react';
import { useMine } from '../context/MineContext';
import { api } from '../services/api';
import { AnomalyScoreChart } from '../components/charts/AnomalyScoreChart';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Database,
  AlertOctagon,
  FileCode
} from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const { predictions } = useMine();
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [forecastState, setForecastState] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, forecastRes] = await Promise.all([
          api.getLatestPredictions(),
          api.getDisplacementForecast()
        ]);
        setLatestPrediction(latestRes);
        setForecastState(forecastRes);
      } catch (err) {
        console.error("Failed to load predictions:", err);
      }
    };
    fetchData();
  }, []);

  const predData = latestPrediction?.prediction;
  const modelInfo = latestPrediction?.model_info;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
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
            AI Geotechnical Anomaly &amp; Subsidence Predictions
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Isolation Forest multi-channel anomaly inference, feature vector analysis, and documented forecasting status
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="mg-badge mg-badge-cyan">
            <BrainCircuit size={13} /> {modelInfo?.algorithm || 'IsolationForest'} ({modelInfo?.model_version || 'v1.2.0'})
          </span>
          <span className="mg-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            14 Feature Channels
          </span>
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start'
        }}
      >
        <Info size={20} color="#60a5fa" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#93c5fd', lineHeight: 1.5 }}>
          <strong>PROTOTYPE DISCLAIMER &amp; MODEL LIMITATIONS:</strong> Isolation Forest anomaly scores reflect statistical feature vector divergence from baseline distributions. High anomaly scores do <em>not</em> constitute a guaranteed prediction of impending mine collapse or ground failure. Operational emergency procedures require qualified geotechnical review.
        </div>
      </div>

      {/* Model Availability / Status Banners */}
      {modelInfo && !modelInfo.is_available && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--risk-critical)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'flex-start'
          }}
        >
          <AlertOctagon size={20} color="var(--risk-critical)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--risk-critical)', fontSize: '0.9rem' }}>ML Model Artifact Unavailable</strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {modelInfo.error || "Trained Isolation Forest joblib artifacts not found."} Run <code>python -m app.ml.train_model</code> in backend to generate model artifacts.
            </p>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div className="mg-card" style={{ borderLeft: `3px solid ${predData?.is_anomaly ? 'var(--risk-critical)' : 'var(--risk-normal)'}` }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest Anomaly Score</div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: predData?.is_anomaly ? 'var(--risk-critical)' : 'var(--risk-normal)', margin: '0.25rem 0' }}>
            {predData ? (predData.anomaly_score * 100).toFixed(1) : '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Status: <strong>{predData?.is_anomaly ? 'STATISTICAL ANOMALY' : 'NORMAL PATTERN'}</strong>
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--cyan-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raw Decision Function</div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-bright)', margin: '0.25rem 0' }}>
            {predData?.raw_score !== undefined ? predData.raw_score : '0.000'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            IsolationForest Decision Threshold &lt; 0.0
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--teal-accent)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data Quality Status</div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--teal-accent)', margin: '0.25rem 0' }}>
            {predData?.data_quality_status || 'VALID'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Feature sanitization &amp; range validation
          </div>
        </div>

        <div className="mg-card" style={{ borderLeft: '3px solid var(--amber-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Model Version</div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '0.4rem 0' }}>
            {predData?.model_version || modelInfo?.model_version || 'v1.2.0'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Pre-trained Isolation Forest
          </div>
        </div>
      </div>

      {/* Feature Vector Inspection Table */}
      <div className="mg-card">
        <div className="mg-card-header">
          <div>
            <div className="mg-card-title">
              <Database size={18} color="var(--cyan-bright)" />
              <span>Model Feature Vector &amp; Preprocessing Mapping (14 Channels)</span>
            </div>
            <div className="mg-card-subtitle">
              Exact feature order passed into IsolationForest scaler &amp; inference pipeline
            </div>
          </div>
          <span className="mg-badge mg-badge-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
            Target: {predData?.sensor_name || 'SN-JHR-MPBX-01'}
          </span>
        </div>

        {predData?.feature_vector ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="mg-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Observed Value</th>
                  <th>Engineering Unit</th>
                  <th>Feature Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(predData.feature_vector).map(([key, value]) => (
                  <tr key={key}>
                    <td className="font-mono" style={{ color: 'var(--cyan-bright)', fontWeight: 600 }}>{key}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: '#ffffff' }}>{String(value)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {key.includes('_cm') ? 'cm' : key.includes('_mps2') ? 'm/s²' : key.includes('_dps') ? 'deg/s' : key.includes('_deg') ? 'deg' : key.includes('_C') ? '°C' : key.includes('_percent') ? '%' : key.includes('_rms') ? 'mm/s' : '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {key === 'ultrasonic_distance_cm' && 'Distance clearance to mine roof or borehole benchmark'}
                      {key.includes('accel_') && '3-Axis MEMS accelerometer dynamics'}
                      {key.includes('gyro_') && '3-Axis angular velocity change'}
                      {key.includes('tilt_') && 'Calculated vector inclination angle'}
                      {key === 'temperature_C' && 'Ambient borehole temperature'}
                      {key === 'humidity_percent' && 'Relative humidity inside sensor enclosure'}
                      {key === 'distance_change_cm' && 'Cumulative displacement transformed to cm'}
                      {key === 'vibration_rms' && 'Microseismic RMS vibration velocity'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No feature vector record available yet. Ingest telemetry to view live inference features.
          </div>
        )}
      </div>

      {/* Anomaly Timeline & Forecasting Status Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Anomaly Score Timeline */}
        <div className="mg-card">
          <div className="mg-card-header">
            <div>
              <div className="mg-card-title">
                <BrainCircuit size={18} color="var(--risk-critical)" />
                <span>AI Strata Strain Anomaly Score Timeline</span>
              </div>
              <div className="mg-card-subtitle">
                Statistical divergence scores over time (0 - 100%)
              </div>
            </div>
          </div>
          <AnomalyScoreChart />
        </div>

        {/* Subsidence Forecasting (Documented Model Unavailable State) */}
        <div className="mg-card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div className="mg-card-header">
            <div>
              <div className="mg-card-title">
                <Clock size={18} color="var(--amber-primary)" />
                <span>Time-Series Subsidence Forecasting (LSTM)</span>
              </div>
              <div className="mg-card-subtitle">
                Deep Learning multi-step trajectory prediction
              </div>
            </div>
            <span className="mg-badge mg-badge-warning mg-badge-sm">Model Unavailable</span>
          </div>

          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="var(--amber-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {forecastState?.reason || "LSTM sequence model is not configured."} To maintain strict safety compliance, future displacement trajectories are not fabricated.
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              REQUIRED TRAINING &amp; VALIDATION CRITERIA:
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(forecastState?.requirements || [
                'Minimum 30 days continuous 10-second multi-channel telemetry.',
                'Supervised ground truth subsidence survey markers for model validation.',
                'Trained PyTorch/TensorFlow LSTM model checkpoint.'
              ]).map((req: string, idx: number) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <FileCode size={13} color="var(--amber-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sector Risk & Mitigation Protocols */}
      <div className="mg-card">
        <div className="mg-card-header">
          <div>
            <div className="mg-card-title">
              <ShieldCheck size={18} color="var(--cyan-bright)" />
              <span>Sector Geotechnical Risk &amp; Recommended Mitigations</span>
            </div>
            <div className="mg-card-subtitle">
              Automated mitigations derived from risk engine rules &amp; DGMS safety regulations
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {predictions.map((sector) => (
            <div
              key={sector.sectorId}
              style={{
                background: 'rgba(15, 24, 47, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{sector.sectorName}</strong>
                <RiskBadge level={sector.riskCategory} size="sm" />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Primary Risk Factor: <strong style={{ color: 'var(--text-main)' }}>{sector.primaryRiskFactor}</strong>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                RECOMMENDED GEOTECHNICAL MITIGATIONS:
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {sector.recommendedMitigations.map((action, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} color="var(--cyan-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
