import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  badgeText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Database,
  actionText,
  onAction,
  badgeText = 'Awaiting Telemetry'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'rgba(15, 24, 47, 0.45)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-medium)'
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem'
        }}
      >
        <Icon size={26} />
      </div>

      {badgeText && (
        <span
          className="mg-badge"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '0.75rem'
          }}
        >
          {badgeText}
        </span>
      )}

      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 440, marginBottom: actionText ? '1.25rem' : 0 }}>
        {description}
      </p>

      {actionText && onAction && (
        <button onClick={onAction} className="mg-btn mg-btn-outline-cyan mg-btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
