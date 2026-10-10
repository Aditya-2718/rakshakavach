export type RiskLevel = 'normal' | 'moderate' | 'warning' | 'critical' | 'offline';

export type SensorType = 
  | 'Borehole Extensometer (MPBX)'
  | 'In-Place Inclinometer (IPI)'
  | 'Vibrating Wire Crackmeter'
  | 'Microseismic Geophone'
  | 'Piezometer'
  | 'Surface GNSS Station';

export interface SensorNode {
  id: string;
  name: string;
  type: SensorType;
  sector: string;
  depthMeters: number;
  status: RiskLevel;
  batteryPercent: number;
  signalRssiDbm: number;
  lastSeen: string;
  dataSource?: 'SIMULATED' | 'HARDWARE';
  coordinates: {
    lat: number;
    lng: number;
    elevationMeters: number;
  };
  metrics: {
    displacementMm: number;
    tiltMmPerM: number;
    vibrationMmS: number;
    subsidenceVelocityMmDay: number;
    porePressureKPa: number;
  };
  thresholds: {
    warningDisplacementMm: number;
    criticalDisplacementMm: number;
  };
  firmwareVersion: string;
}

export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string;
  displacementMm: number;
  tiltMmPerM: number;
  vibrationMmS: number;
  subsidenceVelocityMmDay: number;
  porePressureKPa: number;
  dataSource?: 'SIMULATED' | 'HARDWARE';
  sensorId?: string;
  predictedDisplacementMm?: number;
  upperConfidenceInterval?: number;
  lowerConfidenceInterval?: number;
}

export interface MineAlert {
  id: string;
  title: string;
  sensorId: string;
  sensorName: string;
  sector: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'investigating' | 'acknowledged' | 'resolved';
  timestamp: string;
  metric: string;
  currentValue: string;
  thresholdValue: string;
  sopRecommendation: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface SectorPrediction {
  sectorId: string;
  sectorName: string;
  seamName: string;
  overburdenDepthMeters: number;
  riskScore: number; // 0 - 100
  riskCategory: 'Low' | 'Guarded' | 'Elevated' | 'Critical';
  subsidenceRatePredictedMmDay: number;
  estimatedTimeToSubsidenceTroughDays: number;
  aiConfidencePercent: number;
  primaryRiskFactor: string;
  recommendedMitigations: string[];
}

export interface CoalMineSite {
  id: string;
  name: string;
  company: string; // e.g., BCCL, ECL, SECL, SCCL
  coalfield: string; // e.g., Jharia, Raniganj, Korba, Singrauli
  state: string;
  latitude: number;
  longitude: number;
  activeSensors: number;
  totalSensors: number;
  activeAlerts: number;
  overallRisk: RiskLevel;
  currentSeam: string;
  extractionMethod: 'Bord & Pillar' | 'Longwall Retreat' | 'Continuous Miner';
}

export interface SystemSettingsConfig {
  mineSiteId: string;
  telemetryIntervalSeconds: number;
  autoAcknowledgeLowRisk: boolean;
  dgmsEscalationEnabled: boolean;
  dgmsEmailRecipients: string;
  smsAlertContacts: string;
  displacementCriticalThresholdMm: number;
  subsidenceRateCriticalMmDay: number;
  tiltCriticalMmPerM: number;
  aiAnomalySensitivity: 'Low' | 'Medium' | 'High';
  apiBaseUrl: string;
}
