"""Pydantic schemas for request / response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import json

# ── Auth ───────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "safety-officer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Mine Sites ─────────────────────────────────────────────────────────────────

class MineSiteOut(BaseModel):
    id: str
    name: str
    company: str
    coalfield: str
    state: str
    latitude: float
    longitude: float
    activeSensors: int
    totalSensors: int
    activeAlerts: int
    overallRisk: str
    currentSeam: Optional[str] = None
    extractionMethod: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_mapped(cls, obj):
        return cls(
            id=obj.id,
            name=obj.name,
            company=obj.company,
            coalfield=obj.coalfield,
            state=obj.state,
            latitude=obj.latitude,
            longitude=obj.longitude,
            activeSensors=obj.active_sensors,
            totalSensors=obj.total_sensors,
            activeAlerts=obj.active_alerts,
            overallRisk=obj.overall_risk.value if hasattr(obj.overall_risk, 'value') else obj.overall_risk,
            currentSeam=obj.current_seam,
            extractionMethod=obj.extraction_method.value if hasattr(obj.extraction_method, 'value') else obj.extraction_method,
        )


# ── Sensors ────────────────────────────────────────────────────────────────────

class SensorCoordinates(BaseModel):
    lat: float
    lng: float
    elevationMeters: float


class SensorMetrics(BaseModel):
    displacementMm: float
    tiltMmPerM: float
    vibrationMmS: float
    subsidenceVelocityMmDay: float
    porePressureKPa: float


class SensorThresholds(BaseModel):
    warningDisplacementMm: float
    criticalDisplacementMm: float


class SensorNodeOut(BaseModel):
    id: str
    name: str
    type: str
    sector: str
    depthMeters: float
    status: str
    batteryPercent: float
    signalRssiDbm: float
    lastSeen: str
    coordinates: SensorCoordinates
    metrics: SensorMetrics
    thresholds: SensorThresholds
    firmwareVersion: str
    dataSource: str = "SIMULATED"

    @classmethod
    def from_orm_mapped(cls, obj):
        return cls(
            id=obj.id,
            name=obj.name,
            type=obj.sensor_type.value if hasattr(obj.sensor_type, 'value') else obj.sensor_type,
            sector=obj.sector,
            depthMeters=obj.depth_meters,
            status=obj.status.value if hasattr(obj.status, 'value') else obj.status,
            batteryPercent=obj.battery_percent,
            signalRssiDbm=obj.signal_rssi_dbm,
            lastSeen=obj.last_seen,
            coordinates=SensorCoordinates(
                lat=obj.lat or 0.0,
                lng=obj.lng or 0.0,
                elevationMeters=obj.elevation_meters or 0.0,
            ),
            metrics=SensorMetrics(
                displacementMm=obj.displacement_mm,
                tiltMmPerM=obj.tilt_mm_per_m,
                vibrationMmS=obj.vibration_mm_s,
                subsidenceVelocityMmDay=obj.subsidence_velocity_mm_day,
                porePressureKPa=obj.pore_pressure_kpa,
            ),
            thresholds=SensorThresholds(
                warningDisplacementMm=obj.warning_displacement_mm,
                criticalDisplacementMm=obj.critical_displacement_mm,
            ),
            firmwareVersion=obj.firmware_version,
            dataSource=getattr(obj, 'data_source', 'SIMULATED') or 'SIMULATED',
        )


class SensorCreate(BaseModel):
    id: str
    name: str
    type: str = "Borehole Extensometer"
    sector: str = "Panel 1"
    mine_id: str = "BCCL-JHR-01"
    depthMeters: float = 120.0
    lat: float = 23.795
    lng: float = 86.430
    elevationMeters: float = -140.0
    warningDisplacementMm: float = 8.0
    criticalDisplacementMm: float = 12.0
    firmwareVersion: str = "v2.4.1-lora"
    dataSource: str = "SIMULATED"


# ── Telemetry ──────────────────────────────────────────────────────────────────

class TelemetryPointOut(BaseModel):
    timestamp: str
    timeLabel: str
    displacementMm: float
    tiltMmPerM: float
    vibrationMmS: float
    subsidenceVelocityMmDay: float
    porePressureKPa: float
    dataSource: str = "SIMULATED"
    sensorId: Optional[str] = None
    predictedDisplacementMm: Optional[float] = None
    upperConfidenceInterval: Optional[float] = None
    lowerConfidenceInterval: Optional[float] = None

    @classmethod
    def from_orm_mapped(cls, obj):
        return cls(
            timestamp=obj.timestamp.isoformat() if isinstance(obj.timestamp, datetime) else str(obj.timestamp),
            timeLabel=obj.time_label or "",
            displacementMm=obj.displacement_mm,
            tiltMmPerM=obj.tilt_mm_per_m,
            vibrationMmS=obj.vibration_mm_s,
            subsidenceVelocityMmDay=obj.subsidence_velocity_mm_day,
            porePressureKPa=obj.pore_pressure_kpa,
            dataSource=getattr(obj, 'data_source', 'SIMULATED') or 'SIMULATED',
            sensorId=getattr(obj, 'sensor_id', None),
            predictedDisplacementMm=obj.predicted_displacement_mm,
            upperConfidenceInterval=obj.upper_confidence_interval,
            lowerConfidenceInterval=obj.lower_confidence_interval,
        )


class TelemetryIngest(BaseModel):
    sensor_id: str
    displacement_mm: float = 0.0
    tilt_mm_per_m: float = 0.0
    vibration_mm_s: float = 0.0
    subsidence_velocity_mm_day: float = 0.0
    pore_pressure_kpa: float = 0.0
    time_label: Optional[str] = None
    data_source: str = "SIMULATED"


# ── Alerts ─────────────────────────────────────────────────────────────────────

class MineAlertOut(BaseModel):
    id: str
    title: str
    sensorId: str
    sensorName: str
    sector: str
    severity: str
    status: str
    timestamp: str
    metric: str
    currentValue: str
    thresholdValue: str
    sopRecommendation: str
    acknowledgedBy: Optional[str] = None
    acknowledgedAt: Optional[str] = None

    @classmethod
    def from_orm_mapped(cls, obj):
        return cls(
            id=obj.id,
            title=obj.title,
            sensorId=obj.sensor_id,
            sensorName=obj.sensor_name,
            sector=obj.sector,
            severity=obj.severity.value if hasattr(obj.severity, 'value') else obj.severity,
            status=obj.status.value if hasattr(obj.status, 'value') else obj.status,
            timestamp=obj.timestamp,
            metric=obj.metric,
            currentValue=obj.current_value,
            thresholdValue=obj.threshold_value,
            sopRecommendation=obj.sop_recommendation,
            acknowledgedBy=obj.acknowledged_by,
            acknowledgedAt=obj.acknowledged_at,
        )


class AlertAcknowledge(BaseModel):
    officer_name: str = "Safety Officer"


# ── Predictions ────────────────────────────────────────────────────────────────

class SectorPredictionOut(BaseModel):
    sectorId: str
    sectorName: str
    seamName: str
    overburdenDepthMeters: float
    riskScore: float
    riskCategory: str
    subsidenceRatePredictedMmDay: float
    estimatedTimeToSubsidenceTroughDays: int
    aiConfidencePercent: float
    primaryRiskFactor: str
    recommendedMitigations: list[str]

    @classmethod
    def from_orm_mapped(cls, obj):
        try:
            mitigations = json.loads(obj.recommended_mitigations) if obj.recommended_mitigations else []
        except Exception:
            mitigations = []
        return cls(
            sectorId=obj.sector_id,
            sectorName=obj.sector_name,
            seamName=obj.seam_name,
            overburdenDepthMeters=obj.overburden_depth_meters,
            riskScore=obj.risk_score,
            riskCategory=obj.risk_category.value if hasattr(obj.risk_category, 'value') else obj.risk_category,
            subsidenceRatePredictedMmDay=obj.subsidence_rate_predicted_mm_day,
            estimatedTimeToSubsidenceTroughDays=obj.estimated_time_to_subsidence_trough_days,
            aiConfidencePercent=obj.ai_confidence_percent,
            primaryRiskFactor=obj.primary_risk_factor,
            recommendedMitigations=mitigations,
        )


# ── System Settings ────────────────────────────────────────────────────────────

class SystemSettingsOut(BaseModel):
    mineSiteId: str
    telemetryIntervalSeconds: int
    autoAcknowledgeLowRisk: bool
    dgmsEscalationEnabled: bool
    dgmsEmailRecipients: str
    smsAlertContacts: str
    displacementCriticalThresholdMm: float
    subsidenceRateCriticalMmDay: float
    tiltCriticalMmPerM: float
    aiAnomalySensitivity: str
    apiBaseUrl: str

    @classmethod
    def from_orm_mapped(cls, obj):
        return cls(
            mineSiteId=obj.mine_site_id,
            telemetryIntervalSeconds=obj.telemetry_interval_seconds,
            autoAcknowledgeLowRisk=obj.auto_acknowledge_low_risk,
            dgmsEscalationEnabled=obj.dgms_escalation_enabled,
            dgmsEmailRecipients=obj.dgms_email_recipients,
            smsAlertContacts=obj.sms_alert_contacts,
            displacementCriticalThresholdMm=obj.displacement_critical_threshold_mm,
            subsidenceRateCriticalMmDay=obj.subsidence_rate_critical_mm_day,
            tiltCriticalMmPerM=obj.tilt_critical_mm_per_m,
            aiAnomalySensitivity=obj.ai_anomaly_sensitivity,
            apiBaseUrl=obj.api_base_url,
        )


class SystemSettingsUpdate(BaseModel):
    telemetryIntervalSeconds: Optional[int] = None
    autoAcknowledgeLowRisk: Optional[bool] = None
    dgmsEscalationEnabled: Optional[bool] = None
    dgmsEmailRecipients: Optional[str] = None
    smsAlertContacts: Optional[str] = None
    displacementCriticalThresholdMm: Optional[float] = None
    subsidenceRateCriticalMmDay: Optional[float] = None
    tiltCriticalMmPerM: Optional[float] = None
    aiAnomalySensitivity: Optional[str] = None


# ── Phase 4 AI/ML & Risk Engine Schemas ───────────────────────────────────────

class RiskConfigOut(BaseModel):
    mineId: str
    displacementWarningMm: float
    displacementCriticalMm: float
    tiltCriticalMmPerM: float
    vibrationCriticalMmS: float
    porePressureCriticalKPa: float
    subsidenceRateCriticalMmDay: float
    anomalyPersistenceThreshold: int
    hysteresisRecoveryPoints: int
    updatedBy: Optional[str] = None
    updatedAt: Optional[str] = None


class RiskConfigUpdate(BaseModel):
    displacementWarningMm: Optional[float] = None
    displacementCriticalMm: Optional[float] = None
    tiltCriticalMmPerM: Optional[float] = None
    vibrationCriticalMmS: Optional[float] = None
    porePressureCriticalKPa: Optional[float] = None
    subsidenceRateCriticalMmDay: Optional[float] = None
    anomalyPersistenceThreshold: Optional[int] = None
    hysteresisRecoveryPoints: Optional[int] = None


class AnomalyPredictionOut(BaseModel):
    id: str
    sensorId: str
    mineId: str
    timestamp: str
    isAnomaly: bool
    anomalyScore: float
    rawScore: float
    modelVersion: Optional[str] = None
    featureVector: dict
    dataQualityStatus: str


class AlertInvestigateRequest(BaseModel):
    investigator_name: Optional[str] = "Safety Officer"
    notes: Optional[str] = None


class AlertResolveRequest(BaseModel):
    resolver_name: Optional[str] = "Safety Officer"
    resolution_notes: Optional[str] = "Inspection complete. Field site safe."


class ForecastResponse(BaseModel):
    forecast_available: bool
    model_version: Optional[str] = None
    reason: Optional[str] = None
    requirements: list[str] = []
    forecast_horizon_days: int = 0
    predictions: list[dict] = []

