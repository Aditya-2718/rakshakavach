import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendDirection?: 'positive' | 'negative' | 'neutral'; // whether 'up' is good or bad
  icon: LucideIcon;
  subtitle?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  change,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  subtitle,
  badge
}) => {
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'var(--text-muted)';
    if (trendDirection === 'negative') {
      return trend === 'up' ? 'var(--risk-critical)' : 'var(--risk-normal)';
    }
    return trend === 'up' ? 'var(--risk-normal)' : 'var(--risk-critical)';
  };

  return (
    <div className="mg-stat-card">
      <div className="mg-stat-header">
        <span className="mg-stat-title">{title}</span>
        <div className="mg-stat-icon-wrapper">
          <Icon size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span className="mg-stat-value">{value}</span>
        {unit && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{unit}</span>}
      </div>

      <div className="mg-stat-footer">
        {change && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontWeight: 600,
              color: getTrendColor()
            }}
          >
            {trend === 'up' && <TrendingUp size={13} />}
            {trend === 'down' && <TrendingDown size={13} />}
            {trend === 'neutral' && <Minus size={13} />}
            {change}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
        {badge && <div style={{ marginLeft: 'auto' }}>{badge}</div>}
      </div>
    </div>
  );
};
