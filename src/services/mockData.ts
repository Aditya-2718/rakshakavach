import type { CoalMineSite, SensorNode, MineAlert, SectorPrediction, TelemetryPoint, SystemSettingsConfig } from '../types';

export const MINE_SITES: CoalMineSite[] = [
  {
    id: 'mine-jharia-blk4',
    name: 'Block IV Underground Colliery',
    company: 'Bharat Coking Coal Limited (BCCL)',
    coalfield: 'Jharia Coalfield',
    state: 'Jharkhand',
    latitude: 23.7485,
    longitude: 86.4172,
    activeSensors: 42,
    totalSensors: 44,
    activeAlerts: 3,
    overallRisk: 'warning',
    currentSeam: 'Seam XI / XII Composite',
    extractionMethod: 'Bord & Pillar'
  },
  {
    id: 'mine-raniganj-sodepur',
    name: 'Sodepur Colliery (Shaft 9 & 10)',
    company: 'Eastern Coalfields Limited (ECL)',
    coalfield: 'Raniganj Coalfield',
    state: 'West Bengal',
    latitude: 23.6824,
    longitude: 86.9631,
    activeSensors: 36,
    totalSensors: 36,
    activeAlerts: 1,
    overallRisk: 'moderate',
    currentSeam: 'Dishergarh Seam',
    extractionMethod: 'Longwall Retreat'
  },
  {
    id: 'mine-korba-manikpur',
    name: 'Manikpur Deep Mine Section',
    company: 'South Eastern Coalfields (SECL)',
    coalfield: 'Korba Coalfield',
    state: 'Chhattisgarh',
    latitude: 22.3595,
    longitude: 82.7231,
    activeSensors: 28,
    totalSensors: 30,
    activeAlerts: 0,
    overallRisk: 'normal',
    currentSeam: 'Jatraj Seam Bottom',
    extractionMethod: 'Continuous Miner'
  },
  {
    id: 'mine-singrauli-jayant',
    name: 'Jayant In-Seam Depillaring Panel',
    company: 'Northern Coalfields Limited (NCL)',
    coalfield: 'Singrauli Coalfield',
    state: 'Madhya Pradesh',
    latitude: 24.1205,
    longitude: 82.6318,
    activeSensors: 24,
    totalSensors: 24,
    activeAlerts: 0,
    overallRisk: 'normal',
    currentSeam: 'Purewa Bottom Seam',
    extractionMethod: 'Bord & Pillar'
  }
];

export const SENSOR_NODES: SensorNode[] = [
  {
    id: 'SN-JH-01',
    name: 'Extensometer MPBX-101',
    type: 'Borehole Extensometer (MPBX)',
    sector: 'Panel 4B Depillaring Zone',
    depthMeters: 145,
    status: 'critical',
    batteryPercent: 88,
    signalRssiDbm: -72,
    lastSeen: '1 min ago',
    coordinates: { lat: 23.7512, lng: 86.4195, elevationMeters: 218 },
    metrics: {
      displacementMm: 14.8,
      tiltMmPerM: 4.6,
      vibrationMmS: 6.2,
      subsidenceVelocityMmDay: 3.4,
      porePressureKPa: 312
    },
    thresholds: { warningDisplacementMm: 6.0, criticalDisplacementMm: 12.0 },
    firmwareVersion: 'v2.4.1-lora'
  },
  {
    id: 'SN-JH-02',
    name: 'Inclinometer IPI-204',
    type: 'In-Place Inclinometer (IPI)',
    sector: 'North Return Airway Barrier',
    depthMeters: 92,
    status: 'warning',
    batteryPercent: 74,
    signalRssiDbm: -68,
    lastSeen: '2 mins ago',
    coordinates: { lat: 23.7498, lng: 86.4152, elevationMeters: 224 },
    metrics: {
      displacementMm: 7.2,
      tiltMmPerM: 3.8,
      vibrationMmS: 2.1,
      subsidenceVelocityMmDay: 1.6,
      porePressureKPa: 245
    },
    thresholds: { warningDisplacementMm: 5.0, criticalDisplacementMm: 10.0 },
    firmwareVersion: 'v2.4.1-lora'
  },
  {
    id: 'SN-JH-03',
    name: 'Surface GNSS Station GS-01',
    type: 'Surface GNSS Station',
    sector: 'Overlying PWD Road Corridor',
    depthMeters: 0,
    status: 'warning',
    batteryPercent: 96,
    signalRssiDbm: -55,
    lastSeen: 'Just now',
    coordinates: { lat: 23.7534, lng: 86.4218, elevationMeters: 230 },
    metrics: {
      displacementMm: 8.5,
      tiltMmPerM: 2.1,
      vibrationMmS: 0.8,
      subsidenceVelocityMmDay: 1.9,
      porePressureKPa: 101
    },
    thresholds: { warningDisplacementMm: 5.0, criticalDisplacementMm: 10.0 },
    firmwareVersion: 'v3.1.0-cellular'
  },
  {
    id: 'SN-JH-04',
    name: 'Vibrating Wire Crackmeter CM-12',
    type: 'Vibrating Wire Crackmeter',
    sector: 'Subsidence Trough Rim (Village Perimeter)',
    depthMeters: 2,
    status: 'moderate',
    batteryPercent: 82,
    signalRssiDbm: -79,
    lastSeen: '4 mins ago',
    coordinates: { lat: 23.7461, lng: 86.4239, elevationMeters: 227 },
    metrics: {
      displacementMm: 3.4,
      tiltMmPerM: 1.2,
      vibrationMmS: 0.4,
      subsidenceVelocityMmDay: 0.6,
      porePressureKPa: 110
    },
    thresholds: { warningDisplacementMm: 4.0, criticalDisplacementMm: 8.0 },
    firmwareVersion: 'v2.3.8-lora'
  },
  {
    id: 'SN-JH-05',
    name: 'Microseismic Geophone MS-08',
    type: 'Microseismic Geophone',
    sector: 'Main Goaf Caving Boundary',
    depthMeters: 178,
    status: 'critical',
    batteryPercent: 91,
    signalRssiDbm: -63,
    lastSeen: '30 secs ago',
    coordinates: { lat: 23.7479, lng: 86.4131, elevationMeters: 215 },
    metrics: {
      displacementMm: 11.2,
      tiltMmPerM: 2.9,
      vibrationMmS: 8.9,
      subsidenceVelocityMmDay: 2.8,
      porePressureKPa: 290
    },
    thresholds: { warningDisplacementMm: 6.0, criticalDisplacementMm: 10.0 },
    firmwareVersion: 'v2.4.1-lora'
  },
  {
    id: 'SN-JH-06',
    name: 'Piezometer PZ-03',
    type: 'Piezometer',
    sector: 'Overburden Sandstone Aquifer',
    depthMeters: 65,
    status: 'normal',
    batteryPercent: 65,
    signalRssiDbm: -81,
    lastSeen: '6 mins ago',
    coordinates: { lat: 23.7548, lng: 86.4119, elevationMeters: 235 },
    metrics: {
      displacementMm: 0.8,
      tiltMmPerM: 0.3,
      vibrationMmS: 0.2,
      subsidenceVelocityMmDay: 0.1,
      porePressureKPa: 420
    },
    thresholds: { warningDisplacementMm: 4.0, criticalDisplacementMm: 8.0 },
    firmwareVersion: 'v2.3.5-lora'
  },
  {
    id: 'SN-JH-07',
    name: 'Extensometer MPBX-102',
    type: 'Borehole Extensometer (MPBX)',
    sector: 'Incline No. 2 Haulage Drift',
    depthMeters: 120,
    status: 'normal',
    batteryPercent: 92,
    signalRssiDbm: -70,
    lastSeen: '3 mins ago',
    coordinates: { lat: 23.7445, lng: 86.4182, elevationMeters: 221 },
    metrics: {
      displacementMm: 1.5,
      tiltMmPerM: 0.5,
      vibrationMmS: 0.7,
      subsidenceVelocityMmDay: 0.2,
      porePressureKPa: 185
    },
    thresholds: { warningDisplacementMm: 6.0, criticalDisplacementMm: 12.0 },
    firmwareVersion: 'v2.4.1-lora'
  },
  {
    id: 'SN-JH-08',
    name: 'Inclinometer IPI-205',
    type: 'In-Place Inclinometer (IPI)',
    sector: 'Railway Siding Protection Pillar',
    depthMeters: 110,
    status: 'normal',
    batteryPercent: 89,
    signalRssiDbm: -66,
    lastSeen: '5 mins ago',
    coordinates: { lat: 23.7562, lng: 86.4255, elevationMeters: 232 },
    metrics: {
      displacementMm: 1.1,
      tiltMmPerM: 0.4,
      vibrationMmS: 0.5,
      subsidenceVelocityMmDay: 0.15,
      porePressureKPa: 210
    },
    thresholds: { warningDisplacementMm: 5.0, criticalDisplacementMm: 10.0 },
    firmwareVersion: 'v2.4.1-lora'
  }
];

export const MINE_ALERTS: MineAlert[] = [
  {
    id: 'ALT-2026-049',
    title: 'Critical Bed Separation Detected',
    sensorId: 'SN-JH-01',
    sensorName: 'Extensometer MPBX-101',
    sector: 'Panel 4B Depillaring Zone',
    severity: 'critical',
    status: 'active',
    timestamp: '2026-10-10 11:42:15 IST',
    metric: 'Differential Displacement',
    currentValue: '14.8 mm',
    thresholdValue: '12.0 mm',
    sopRecommendation: 'Enforce DGMS Circular No. 6. Evacuate personnel from depillaring face 4B. Halt continuous miner advance. Inspect support density immediately.'
  },
  {
    id: 'ALT-2026-048',
    title: 'High Microseismic Energy Release',
    sensorId: 'SN-JH-05',
    sensorName: 'Microseismic Geophone MS-08',
    sector: 'Main Goaf Caving Boundary',
    severity: 'critical',
    status: 'active',
    timestamp: '2026-10-10 10:15:30 IST',
    metric: 'Vibration PPV',
    currentValue: '8.9 mm/s',
    thresholdValue: '6.0 mm/s',
    sopRecommendation: 'Potential main roof hanging failure (air blast risk). Restrict access to return airway. Verify tell-tale indicators.'
  },
  {
    id: 'ALT-2026-047',
    title: 'Surface Subsidence Rate Acceleration',
    sensorId: 'SN-JH-03',
    sensorName: 'Surface GNSS Station GS-01',
    sector: 'Overlying PWD Road Corridor',
    severity: 'warning',
    status: 'acknowledged',
    timestamp: '2026-10-10 08:30:00 IST',
    metric: 'Subsidence Velocity',
    currentValue: '1.9 mm/day',
    thresholdValue: '1.5 mm/day',
    sopRecommendation: 'Alert District PWD Sub-Division. Place continuous speed restrictions on roadway overhead. Deploy visual crack patrol.',
    acknowledgedBy: 'Er. Rajesh Sharma (Safety Officer)',
    acknowledgedAt: '2026-10-10 08:45:00 IST'
  },
  {
    id: 'ALT-2026-046',
    title: 'Strata Tilt Exceeding Permissible Slope',
    sensorId: 'SN-JH-02',
    sensorName: 'Inclinometer IPI-204',
    sector: 'North Return Airway Barrier',
    severity: 'warning',
    status: 'active',
    timestamp: '2026-10-10 06:12:44 IST',
    metric: 'Strata Angular Tilt',
    currentValue: '3.8 mm/m',
    thresholdValue: '3.0 mm/m',
    sopRecommendation: 'Check standing pillar spalling. Install additional rope stitches and quick-setting resin bolts.'
  },
  {
    id: 'ALT-2026-045',
    title: 'Surface Crackmeter Widening Strain',
    sensorId: 'SN-JH-04',
    sensorName: 'Crackmeter CM-12',
    sector: 'Subsidence Trough Rim',
    severity: 'info',
    status: 'resolved',
    timestamp: '2026-10-09 18:22:10 IST',
    metric: 'Crack Aperture Expansion',
    currentValue: '3.4 mm',
    thresholdValue: '3.0 mm',
    sopRecommendation: 'Routine geotechnical survey required within 24 hours. Fill surface fissures with bentonite-clay slurry to prevent monsoonal water ingress into old workings.',
    acknowledgedBy: 'Dr. P. Mukherjee (Rock Mechanics Head)',
    acknowledgedAt: '2026-10-09 19:00:00 IST'
  }
];

export const SECTOR_PREDICTIONS: SectorPrediction[] = [
  {
    sectorId: 'SEC-4B',
    sectorName: 'Panel 4B Depillaring Face',
    seamName: 'Seam XI (Thickness: 4.8m)',
    overburdenDepthMeters: 145,
    riskScore: 84,
    riskCategory: 'Critical',
    subsidenceRatePredictedMmDay: 3.8,
    estimatedTimeToSubsidenceTroughDays: 3,
    aiConfidencePercent: 93.4,
    primaryRiskFactor: 'Dynamic Roof Cantilever Failure & Goaf Compaction',
    recommendedMitigations: [
      'Stop depillaring extraction immediately',
      'Increase hydraulic prop density along breaker line to 45 tons/m²',
      'Issue DGMS early advisory for overlying surface sector',
      'Verify continuous air quality and methane monitors'
    ]
  },
  {
    sectorId: 'SEC-NR',
    sectorName: 'North Return Airway Barrier',
    seamName: 'Seam XI / XII Barrier Pillar',
    overburdenDepthMeters: 92,
    riskScore: 68,
    riskCategory: 'Elevated',
    subsidenceRatePredictedMmDay: 1.8,
    estimatedTimeToSubsidenceTroughDays: 14,
    aiConfidencePercent: 88.2,
    primaryRiskFactor: 'Pillar Stress Concentration & Rib Spalling',
    recommendedMitigations: [
      'Deploy electronic extensometers at 15m intervals',
      'Apply high-tensile wire mesh with cable anchors',
      'Reduce ventilation pressure differentials across regulator'
    ]
  },
  {
    sectorId: 'SEC-PWD',
    sectorName: 'Overlying PWD Highway Corridor',
    seamName: 'Surface Ground Zone above Panel 4',
    overburdenDepthMeters: 145,
    riskScore: 62,
    riskCategory: 'Elevated',
    subsidenceRatePredictedMmDay: 2.1,
    estimatedTimeToSubsidenceTroughDays: 18,
    aiConfidencePercent: 91.0,
    primaryRiskFactor: 'Tensile Strain Developing at Subsidence Trough Margin',
    recommendedMitigations: [
      'Implement 20 km/h speed barrier on roadway',
      'Daily GNSS kinematic survey at 6-hour intervals',
      'Alert local civil administration liaison office'
    ]
  },
  {
    sectorId: 'SEC-RS',
    sectorName: 'Railway Siding Protection Pillar',
    seamName: 'Seam XII Protection Zone',
    overburdenDepthMeters: 110,
    riskScore: 24,
    riskCategory: 'Low',
    subsidenceRatePredictedMmDay: 0.18,
    estimatedTimeToSubsidenceTroughDays: 95,
    aiConfidencePercent: 96.5,
    primaryRiskFactor: 'Stable Core Support — Normal Background Creep',
    recommendedMitigations: [
      'Continue scheduled weekly LoRa telemetry audit',
      'Routine visual verification of track cant and gauge'
    ]
  }
];

// Deterministic 24-hour telemetry points (hourly)
export const HISTORICAL_TELEMETRY_SERIES: TelemetryPoint[] = [
  { timestamp: '2026-10-09T12:00:00Z', timeLabel: '12:00', displacementMm: 4.2, tiltMmPerM: 1.4, vibrationMmS: 1.1, subsidenceVelocityMmDay: 0.8, porePressureKPa: 240, predictedDisplacementMm: 4.3, upperConfidenceInterval: 4.8, lowerConfidenceInterval: 3.8 },
  { timestamp: '2026-10-09T14:00:00Z', timeLabel: '14:00', displacementMm: 4.5, tiltMmPerM: 1.5, vibrationMmS: 1.2, subsidenceVelocityMmDay: 0.9, porePressureKPa: 242, predictedDisplacementMm: 4.6, upperConfidenceInterval: 5.1, lowerConfidenceInterval: 4.1 },
  { timestamp: '2026-10-09T16:00:00Z', timeLabel: '16:00', displacementMm: 4.8, tiltMmPerM: 1.6, vibrationMmS: 1.4, subsidenceVelocityMmDay: 0.95, porePressureKPa: 246, predictedDisplacementMm: 4.9, upperConfidenceInterval: 5.5, lowerConfidenceInterval: 4.3 },
  { timestamp: '2026-10-09T18:00:00Z', timeLabel: '18:00', displacementMm: 5.2, tiltMmPerM: 1.8, vibrationMmS: 1.7, subsidenceVelocityMmDay: 1.1, porePressureKPa: 252, predictedDisplacementMm: 5.3, upperConfidenceInterval: 6.0, lowerConfidenceInterval: 4.7 },
  { timestamp: '2026-10-09T20:00:00Z', timeLabel: '20:00', displacementMm: 5.8, tiltMmPerM: 2.1, vibrationMmS: 2.1, subsidenceVelocityMmDay: 1.3, porePressureKPa: 260, predictedDisplacementMm: 5.9, upperConfidenceInterval: 6.6, lowerConfidenceInterval: 5.2 },
  { timestamp: '2026-10-09T22:00:00Z', timeLabel: '22:00', displacementMm: 6.4, tiltMmPerM: 2.3, vibrationMmS: 2.5, subsidenceVelocityMmDay: 1.5, porePressureKPa: 268, predictedDisplacementMm: 6.6, upperConfidenceInterval: 7.4, lowerConfidenceInterval: 5.8 },
  { timestamp: '2026-10-10T00:00:00Z', timeLabel: '00:00', displacementMm: 7.3, tiltMmPerM: 2.6, vibrationMmS: 3.1, subsidenceVelocityMmDay: 1.7, porePressureKPa: 275, predictedDisplacementMm: 7.4, upperConfidenceInterval: 8.2, lowerConfidenceInterval: 6.6 },
  { timestamp: '2026-10-10T02:00:00Z', timeLabel: '02:00', displacementMm: 8.1, tiltMmPerM: 2.9, vibrationMmS: 3.8, subsidenceVelocityMmDay: 2.0, porePressureKPa: 282, predictedDisplacementMm: 8.3, upperConfidenceInterval: 9.3, lowerConfidenceInterval: 7.4 },
  { timestamp: '2026-10-10T04:00:00Z', timeLabel: '04:00', displacementMm: 9.2, tiltMmPerM: 3.2, vibrationMmS: 4.2, subsidenceVelocityMmDay: 2.3, porePressureKPa: 289, predictedDisplacementMm: 9.5, upperConfidenceInterval: 10.6, lowerConfidenceInterval: 8.4 },
  { timestamp: '2026-10-10T06:00:00Z', timeLabel: '06:00', displacementMm: 10.6, tiltMmPerM: 3.6, vibrationMmS: 5.1, subsidenceVelocityMmDay: 2.6, porePressureKPa: 295, predictedDisplacementMm: 10.8, upperConfidenceInterval: 12.0, lowerConfidenceInterval: 9.6 },
  { timestamp: '2026-10-10T08:00:00Z', timeLabel: '08:00', displacementMm: 12.3, tiltMmPerM: 4.1, vibrationMmS: 6.8, subsidenceVelocityMmDay: 2.9, porePressureKPa: 304, predictedDisplacementMm: 12.5, upperConfidenceInterval: 13.9, lowerConfidenceInterval: 11.1 },
  { timestamp: '2026-10-10T10:00:00Z', timeLabel: '10:00', displacementMm: 13.9, tiltMmPerM: 4.4, vibrationMmS: 7.9, subsidenceVelocityMmDay: 3.2, porePressureKPa: 310, predictedDisplacementMm: 14.1, upperConfidenceInterval: 15.6, lowerConfidenceInterval: 12.6 },
  { timestamp: '2026-10-10T12:00:00Z', timeLabel: 'Now', displacementMm: 14.8, tiltMmPerM: 4.6, vibrationMmS: 6.2, subsidenceVelocityMmDay: 3.4, porePressureKPa: 312, predictedDisplacementMm: 15.0, upperConfidenceInterval: 16.8, lowerConfidenceInterval: 13.4 },
  // AI Future Forecast Points
  { timestamp: '2026-10-10T14:00:00Z', timeLabel: '+2h (AI)', displacementMm: 0, tiltMmPerM: 0, vibrationMmS: 0, subsidenceVelocityMmDay: 3.6, porePressureKPa: 0, predictedDisplacementMm: 15.8, upperConfidenceInterval: 17.8, lowerConfidenceInterval: 14.0 },
  { timestamp: '2026-10-10T16:00:00Z', timeLabel: '+4h (AI)', displacementMm: 0, tiltMmPerM: 0, vibrationMmS: 0, subsidenceVelocityMmDay: 3.8, porePressureKPa: 0, predictedDisplacementMm: 16.7, upperConfidenceInterval: 18.9, lowerConfidenceInterval: 14.7 },
  { timestamp: '2026-10-10T18:00:00Z', timeLabel: '+6h (AI)', displacementMm: 0, tiltMmPerM: 0, vibrationMmS: 0, subsidenceVelocityMmDay: 4.0, porePressureKPa: 0, predictedDisplacementMm: 17.6, upperConfidenceInterval: 20.1, lowerConfidenceInterval: 15.3 }
];

export const DEFAULT_SETTINGS: SystemSettingsConfig = {
  mineSiteId: 'mine-jharia-blk4',
  telemetryIntervalSeconds: 15,
  autoAcknowledgeLowRisk: false,
  dgmsEscalationEnabled: true,
  dgmsEmailRecipients: 'safety.dgms@coal.gov.in, colliery.manager@bccl.gov.in',
  smsAlertContacts: '+91 94311 00000, +91 98322 00000',
  displacementCriticalThresholdMm: 12.0,
  subsidenceRateCriticalMmDay: 3.0,
  tiltCriticalMmPerM: 4.0,
  aiAnomalySensitivity: 'High',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
};
