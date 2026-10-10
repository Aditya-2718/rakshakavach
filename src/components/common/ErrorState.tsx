import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Pipeline Interrupted',
  message = 'Failed to communicate with node telemetry gateway or FastAPI backend. Please check network logs.',
  onRetry
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--risk-critical-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--risk-critical-border)'
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--risk-critical)',
          marginBottom: '1rem'
        }}
      >
        <AlertOctagon size={26} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--risk-critical)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 460, marginBottom: onRetry ? '1.25rem' : 0 }}>
        {message}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="mg-btn mg-btn-secondary mg-btn-sm">
          <RotateCw size={14} /> Retry Connection
        </button>
      )}
    </div>
  );
};
