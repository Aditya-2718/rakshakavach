import React from 'react';
import type { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, WifiOff } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  label,
  size = 'md',
  showIcon = true
}) => {
  const normalizedLevel = level.toLowerCase();

  let badgeClass = 'mg-badge-normal';
  let defaultLabel = 'Normal';
  let Icon = ShieldCheck;

  switch (normalizedLevel) {
    case 'critical':
      badgeClass = 'mg-badge-critical';
      defaultLabel = 'Critical Risk';
      Icon = AlertCircle;
      break;
    case 'warning':
    case 'elevated':
      badgeClass = 'mg-badge-warning';
      defaultLabel = 'Warning';
      Icon = AlertTriangle;
      break;
    case 'moderate':
    case 'guarded':
      badgeClass = 'mg-badge-moderate';
      defaultLabel = 'Moderate';
      Icon = AlertTriangle;
      break;
    case 'offline':
      badgeClass = 'mg-badge-offline';
      defaultLabel = 'Offline';
      Icon = WifiOff;
      break;
    default:
      badgeClass = 'mg-badge-normal';
      defaultLabel = 'Stable';
      Icon = ShieldCheck;
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`mg-badge ${badgeClass} mg-badge-${size}`}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{label || defaultLabel}</span>
    </span>
  );
};
