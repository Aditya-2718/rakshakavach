import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface AnomalyDataPoint {
  timeLabel: string;
  anomalyScore: number;
  noiseFloor: number;
  anomalyDetected: boolean;
}

const MOCK_ANOMALY_SERIES: AnomalyDataPoint[] = [
  { timeLabel: '00:00', anomalyScore: 12, noiseFloor: 15, anomalyDetected: false },
  { timeLabel: '02:00', anomalyScore: 14, noiseFloor: 15, anomalyDetected: false },
  { timeLabel: '04:00', anomalyScore: 18, noiseFloor: 15, anomalyDetected: false },
  { timeLabel: '06:00', anomalyScore: 24, noiseFloor: 15, anomalyDetected: false },
  { timeLabel: '08:00', anomalyScore: 42, noiseFloor: 15, anomalyDetected: false },
  { timeLabel: '10:00', anomalyScore: 68, noiseFloor: 15, anomalyDetected: true },
  { timeLabel: 'Now', anomalyScore: 84, noiseFloor: 15, anomalyDetected: true }
];

export const AnomalyScoreChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_ANOMALY_SERIES} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="timeLabel" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const score = Number(payload[0]?.value || 0);
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
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: score > 50 ? 'var(--risk-critical)' : 'var(--cyan-bright)' }}>
                      Anomaly Score: <span className="font-mono">{score} / 100</span>
                    </p>
                    <p style={{ fontSize: '0.75rem', color: score > 50 ? 'var(--risk-warning)' : 'var(--risk-normal)', marginTop: '0.2rem' }}>
                      {score > 75 ? 'Critical Geotechnical Departure' : score > 50 ? 'Unusual Microseismic Pattern' : 'Normal Elastic Strain'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={50}
            stroke="var(--risk-warning)"
            strokeDasharray="4 4"
            label={{ value: 'Elevated (50)', fill: 'var(--risk-warning)', fontSize: 10 }}
          />
          <ReferenceLine
            y={75}
            stroke="var(--risk-critical)"
            strokeDasharray="3 3"
            label={{ value: 'Critical Trigger (75)', fill: 'var(--risk-critical)', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="anomalyScore"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
