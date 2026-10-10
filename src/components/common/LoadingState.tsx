import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Retrieving geotechnical telemetry...',
  subtext = 'Interfacing with wireless sensor network nodes'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'rgba(15, 24, 47, 0.4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '3px solid rgba(6, 182, 212, 0.15)',
          borderTopColor: 'var(--cyan-bright)',
          animation: 'spin 1s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <Activity size={24} color="var(--cyan-bright)" />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {message}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{subtext}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
