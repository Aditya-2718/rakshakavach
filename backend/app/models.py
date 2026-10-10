"""SQLAlchemy ORM models — mirrors src/types/index.ts."""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from .database import Base
import enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class RiskLevel(str, enum.Enum):
    normal = "normal"
    moderate = "moderate"
    warning = "warning"
    critical = "critical"
    offline = "offline"


class ExtractionMethod(str, enum.Enum):
    bord_and_pillar = "Bord & Pillar"
    longwall_retreat = "Longwall Retreat"
    continuous_miner = "Continuous Miner"


class SensorType(str, enum.Enum):
    mpbx = "Borehole Extensometer (MPBX)"
    ipi = "In-Place Inclinometer (IPI)"
    crackmeter = "Vibrating Wire Crackmeter"
    geophone = "Microseismic Geophone"
    piezometer = "Piezometer"
    gnss = "Surface GNSS Station"


class AlertSeverity(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


class AlertStatus(str, enum.Enum):
    active = "active"
    investigating = "investigating"
    acknowledged = "acknowledged"
    resolved = "resolved"


class RiskCategory(str, enum.Enum):
    low = "Low"
    guarded = "Guarded"
    elevated = "Elevated"
    critical = "Critical"


class UserRole(str, enum.Enum):
    safety_officer = "safety-officer"
    geotechnical_engineer = "geotechnical-engineer"
    colliery_manager = "colliery-manager"
    dgms_inspector = "dgms-inspector"
    admin = "admin"


# ── ORM Models ────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.safety_officer, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class CoalMineSite(Base):
    __tablename__ = "mine_sites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    coalfield = Column(String, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    active_sensors = Column(Integer, default=0)
    total_sensors = Column(Integer, default=0)
    active_alerts = Column(Integer, default=0)
    overall_risk = Column(SAEnum(RiskLevel), default=RiskLevel.normal)
    current_seam = Column(String, nullable=True)
    extraction_method = Column(SAEnum(ExtractionMethod), default=ExtractionMethod.bord_and_pillar)

    sensors = relationship("SensorNode", back_populates="mine", cascade="all, delete-orphan")
    alerts = relationship("MineAlert", back_populates="mine", cascade="all, delete-orphan")
    predictions = relationship("SectorPrediction", back_populates="mine", cascade="all, delete-orphan")


class SensorNode(Base):
    __tablename__ = "sensor_nodes"

    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False)
    name = Column(String, nullable=False)
    sensor_type = Column(SAEnum(SensorType), nullable=False)
    sector = Column(String, nullable=False)
    depth_meters = Column(Float, default=0.0)
    status = Column(SAEnum(RiskLevel), default=RiskLevel.normal)
    battery_percent = Column(Float, default=100.0)
    signal_rssi_dbm = Column(Float, default=-65.0)
    last_seen = Column(String, default="Just now")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    elevation_meters = Column(Float, nullable=True)
    # Latest metrics (snapshot)
    displacement_mm = Column(Float, default=0.0)
    tilt_mm_per_m = Column(Float, default=0.0)
    vibration_mm_s = Column(Float, default=0.0)
    subsidence_velocity_mm_day = Column(Float, default=0.0)
    pore_pressure_kpa = Column(Float, default=0.0)
    # Thresholds
    warning_displacement_mm = Column(Float, default=5.0)
    critical_displacement_mm = Column(Float, default=12.0)
    firmware_version = Column(String, default="v2.4.1")
    data_source = Column(String, default="SIMULATED")  # SIMULATED | HARDWARE

    mine = relationship("CoalMineSite", back_populates="sensors")
    telemetry = relationship("TelemetryPoint", back_populates="sensor", cascade="all, delete-orphan")


class TelemetryPoint(Base):
    __tablename__ = "telemetry_points"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String, ForeignKey("sensor_nodes.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    time_label = Column(String, nullable=True)
    data_source = Column(String, default="SIMULATED")  # SIMULATED | HARDWARE
    displacement_mm = Column(Float, default=0.0)
    tilt_mm_per_m = Column(Float, default=0.0)
    vibration_mm_s = Column(Float, default=0.0)
    subsidence_velocity_mm_day = Column(Float, default=0.0)
    pore_pressure_kpa = Column(Float, default=0.0)
    predicted_displacement_mm = Column(Float, nullable=True)
    upper_confidence_interval = Column(Float, nullable=True)
    lower_confidence_interval = Column(Float, nullable=True)

    sensor = relationship("SensorNode", back_populates="telemetry")


class MineAlert(Base):
    __tablename__ = "mine_alerts"

    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False)
    title = Column(String, nullable=False)
    sensor_id = Column(String, nullable=False)
    sensor_name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    severity = Column(SAEnum(AlertSeverity), default=AlertSeverity.warning)
    status = Column(SAEnum(AlertStatus), default=AlertStatus.active)
    timestamp = Column(String, nullable=False)
    metric = Column(String, nullable=False)
    current_value = Column(String, nullable=False)
    threshold_value = Column(String, nullable=False)
    sop_recommendation = Column(Text, nullable=False)
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(String, nullable=True)
    investigating_by = Column(String, nullable=True)
    investigating_at = Column(String, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(String, nullable=True)
    evidence_json = Column(Text, default="[]")
    dedup_count = Column(Integer, default=1)
    last_updated_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("CoalMineSite", back_populates="alerts")


class AnomalyPrediction(Base):
    __tablename__ = "anomaly_predictions"

    id = Column(String, primary_key=True, index=True)
    telemetry_id = Column(Integer, ForeignKey("telemetry_points.id"), nullable=True)
    sensor_id = Column(String, ForeignKey("sensor_nodes.id"), nullable=False)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_anomaly = Column(Boolean, default=False, index=True)
    anomaly_score = Column(Float, default=0.0)
    raw_score = Column(Float, default=0.0)
    model_version = Column(String, nullable=True)
    feature_vector_json = Column(Text, default="{}")
    data_quality_status = Column(String, default="VALID")


class RiskTransition(Base):
    __tablename__ = "risk_transitions"

    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False)
    sector_id = Column(String, nullable=False)
    sensor_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    previous_risk = Column(String, nullable=False)
    new_risk = Column(String, nullable=False)
    trigger_reason = Column(String, nullable=False)
    supporting_evidence_json = Column(Text, default="[]")


class RiskConfiguration(Base):
    __tablename__ = "risk_configurations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False, unique=True)
    displacement_warning_mm = Column(Float, default=5.0)
    displacement_critical_mm = Column(Float, default=12.0)
    tilt_critical_mm_per_m = Column(Float, default=5.0)
    vibration_critical_mm_s = Column(Float, default=2.0)
    pore_pressure_critical_kpa = Column(Float, default=200.0)
    subsidence_rate_critical_mm_day = Column(Float, default=2.5)
    anomaly_persistence_threshold = Column(Integer, default=3)
    hysteresis_recovery_points = Column(Integer, default=3)
    updated_by = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)


class NotificationAttempt(Base):
    __tablename__ = "notification_attempts"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("mine_alerts.id"), nullable=False)
    channel = Column(String, nullable=False)
    recipient = Column(String, nullable=False)
    status = Column(String, nullable=False)
    response_payload = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow)


class SectorPrediction(Base):
    __tablename__ = "sector_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String, ForeignKey("mine_sites.id"), nullable=False)
    sector_id = Column(String, nullable=False)
    sector_name = Column(String, nullable=False)
    seam_name = Column(String, nullable=False)
    overburden_depth_meters = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(SAEnum(RiskCategory), default=RiskCategory.low)
    subsidence_rate_predicted_mm_day = Column(Float, default=0.0)
    estimated_time_to_subsidence_trough_days = Column(Integer, default=30)
    ai_confidence_percent = Column(Float, default=80.0)
    primary_risk_factor = Column(String, nullable=False)
    recommended_mitigations = Column(Text, default="[]")  # JSON array stored as text

    mine = relationship("CoalMineSite", back_populates="predictions")


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_site_id = Column(String, nullable=False)
    telemetry_interval_seconds = Column(Integer, default=30)
    auto_acknowledge_low_risk = Column(Boolean, default=False)
    dgms_escalation_enabled = Column(Boolean, default=True)
    dgms_email_recipients = Column(String, default="dgms-jharkhand@gov.in")
    sms_alert_contacts = Column(String, default="+91-9801XXXXXX")
    displacement_critical_threshold_mm = Column(Float, default=12.0)
    subsidence_rate_critical_mm_day = Column(Float, default=2.5)
    tilt_critical_mm_per_m = Column(Float, default=5.0)
    ai_anomaly_sensitivity = Column(String, default="Medium")
    api_base_url = Column(String, default="http://localhost:8000/api/v1")
