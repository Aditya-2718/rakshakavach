import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import type { TelemetryPoint } from '../../types';

interface SubsidenceVelocityChartProps {
  data: TelemetryPoint[];
}

export const SubsidenceVelocityChart: React.FC<SubsidenceVelocityChartProps> = ({ data }) => {
  const getBarColor = (val: number) => {
    if (val >= 3.0) return 'var(--risk-critical)';
    if (val >= 1.5) return 'var(--risk-warning)';
    if (val >= 0.8) return 'var(--risk-moderate)';
    return 'var(--risk-normal)';
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timeLabel" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit=" mm/d" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const val = Number(payload[0]?.value || 0);
                return (
                  <div
                    style={{
                      background: 'rgba(10, 16, 31, 0.95)',
                      border: '1px solid var(--border-medium)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: getBarColor(val) }}>
                      Velocity: <span className="font-mono">{val} mm/day</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="subsidenceVelocityMmDay" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.subsidenceVelocityMmDay)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
