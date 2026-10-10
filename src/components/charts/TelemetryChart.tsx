import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import type { TelemetryPoint } from '../../types';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  metricKey?: 'displacementMm' | 'tiltMmPerM' | 'vibrationMmS' | 'subsidenceVelocityMmDay' | 'porePressureKPa';
  metricLabel?: string;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  color?: string;
  showAiForecast?: boolean;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  metricKey = 'displacementMm',
  metricLabel = 'Differential Displacement',
  unit = 'mm',
  warningThreshold = 6.0,
  criticalThreshold = 12.0,
  color = '#06b6d4',
  showAiForecast = true
}) => {
  return (
    <div style={{ width: '100%', height: 320, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="aiForecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="timeLabel"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            dy={8}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            unit={` ${unit}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const currentVal = payload[0]?.value;
                const aiVal = payload.find((p) => p.dataKey === 'predictedDisplacementMm')?.value;
                return (
                  <div
                    style={{
                      background: 'rgba(10, 16, 31, 0.95)',
                      border: '1px solid var(--border-medium)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Timestamp: {label}
                    </p>
                    {currentVal !== undefined && Number(currentVal) > 0 && (
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: color }}>
                        {metricLabel}: <span className="font-mono">{currentVal} {unit}</span>
                      </p>
                    )}
                    {showAiForecast && aiVal !== undefined && (
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginTop: '0.2rem' }}>
                        AI Model Projected: <span className="font-mono">{aiVal} {unit}</span>
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {warningThreshold && (
            <ReferenceLine
              y={warningThreshold}
              stroke="var(--risk-warning)"
              strokeDasharray="4 4"
              label={{
                value: `Warning (${warningThreshold}${unit})`,
                fill: 'var(--risk-warning)',
                fontSize: 10,
                position: 'top'
              }}
            />
          )}

          {criticalThreshold && (
            <ReferenceLine
              y={criticalThreshold}
              stroke="var(--risk-critical)"
              strokeDasharray="3 3"
              label={{
                value: `Critical DGMS (${criticalThreshold}${unit})`,
                fill: 'var(--risk-critical)',
                fontSize: 10,
                position: 'top'
              }}
            />
          )}

          {/* Actual sensor recorded line */}
          <Area
            type="monotone"
            dataKey={metricKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#metricGrad)"
            isAnimationActive={false}
          />

          {/* AI Projected area */}
          {showAiForecast && (
            <Area
              type="monotone"
              dataKey="predictedDisplacementMm"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={2}
              fillOpacity={0.8}
              fill="url(#aiForecastGrad)"
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
