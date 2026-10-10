"""
MineGuard Geotechnical Risk Configuration Router
Endpoints to view and update rule-based risk thresholds with permission enforcement and audit records.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..services.risk_engine import DEFAULT_CONFIG

router = APIRouter(prefix="/risk", tags=["Risk Engine"])


@router.get("/configuration", response_model=schemas.RiskConfigOut)
def get_risk_configuration(
    mine_id: str = "site-jharia-01",
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Returns current geotechnical threshold configuration for a mine site."""
    cfg = db.query(models.RiskConfiguration).filter(models.RiskConfiguration.mine_id == mine_id).first()
    if not cfg:
        return schemas.RiskConfigOut(
            mineId=mine_id,
            displacementWarningMm=DEFAULT_CONFIG["displacement_warning_mm"],
            displacementCriticalMm=DEFAULT_CONFIG["displacement_critical_mm"],
            tiltCriticalMmPerM=DEFAULT_CONFIG["tilt_critical_mm_per_m"],
            vibrationCriticalMmS=DEFAULT_CONFIG["vibration_critical_mm_s"],
            porePressureCriticalKPa=DEFAULT_CONFIG["pore_pressure_critical_kpa"],
            subsidenceRateCriticalMmDay=DEFAULT_CONFIG["subsidence_rate_critical_mm_day"],
            anomalyPersistenceThreshold=DEFAULT_CONFIG["anomaly_persistence_threshold"],
            hysteresisRecoveryPoints=DEFAULT_CONFIG["hysteresis_recovery_points"],
            updatedBy="System Default",
            updatedAt=datetime.now(timezone.utc).isoformat()
        )

    return schemas.RiskConfigOut(
        mineId=cfg.mine_id,
        displacementWarningMm=cfg.displacement_warning_mm,
        displacementCriticalMm=cfg.displacement_critical_mm,
        tiltCriticalMmPerM=cfg.tilt_critical_mm_per_m,
        vibrationCriticalMmS=cfg.vibration_critical_mm_s,
        porePressureCriticalKPa=cfg.pore_pressure_critical_kpa,
        subsidenceRateCriticalMmDay=cfg.subsidence_rate_critical_mm_day,
        anomalyPersistenceThreshold=cfg.anomaly_persistence_threshold,
        hysteresisRecoveryPoints=cfg.hysteresis_recovery_points,
        updatedBy=cfg.updated_by or "Administrator",
        updatedAt=cfg.updated_at.isoformat() if cfg.updated_at else datetime.now(timezone.utc).isoformat()
    )


@router.patch("/configuration", response_model=schemas.RiskConfigOut)
def update_risk_configuration(
    body: schemas.RiskConfigUpdate,
    mine_id: str = "site-jharia-01",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Updates risk threshold configuration.
    Enforces role permissions (Admin, Geotechnical Engineer, Colliery Manager required).
    """
    allowed_roles = [
        models.UserRole.admin,
        models.UserRole.geotechnical_engineer,
        models.UserRole.colliery_manager,
        models.UserRole.safety_officer
    ]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Updating risk thresholds requires Geotechnical Engineer or Admin privileges."
        )

    cfg = db.query(models.RiskConfiguration).filter(models.RiskConfiguration.mine_id == mine_id).first()
    if not cfg:
        cfg = models.RiskConfiguration(
            mine_id=mine_id,
            displacement_warning_mm=DEFAULT_CONFIG["displacement_warning_mm"],
            displacement_critical_mm=DEFAULT_CONFIG["displacement_critical_mm"],
            tilt_critical_mm_per_m=DEFAULT_CONFIG["tilt_critical_mm_per_m"],
            vibration_critical_mm_s=DEFAULT_CONFIG["vibration_critical_mm_s"],
            pore_pressure_critical_kpa=DEFAULT_CONFIG["pore_pressure_critical_kpa"],
            subsidence_rate_critical_mm_day=DEFAULT_CONFIG["subsidence_rate_critical_mm_day"],
            anomaly_persistence_threshold=DEFAULT_CONFIG["anomaly_persistence_threshold"],
            hysteresis_recovery_points=DEFAULT_CONFIG["hysteresis_recovery_points"],
        )
        db.add(cfg)

    # Apply updates
    if body.displacementWarningMm is not None:
        cfg.displacement_warning_mm = body.displacementWarningMm
    if body.displacementCriticalMm is not None:
        cfg.displacement_critical_mm = body.displacementCriticalMm
    if body.tiltCriticalMmPerM is not None:
        cfg.tilt_critical_mm_per_m = body.tiltCriticalMmPerM
    if body.vibrationCriticalMmS is not None:
        cfg.vibration_critical_mm_s = body.vibrationCriticalMmS
    if body.porePressureCriticalKPa is not None:
        cfg.pore_pressure_critical_kpa = body.porePressureCriticalKPa
    if body.subsidenceRateCriticalMmDay is not None:
        cfg.subsidence_rate_critical_mm_day = body.subsidenceRateCriticalMmDay
    if body.anomalyPersistenceThreshold is not None:
        cfg.anomaly_persistence_threshold = body.anomalyPersistenceThreshold
    if body.hysteresisRecoveryPoints is not None:
        cfg.hysteresis_recovery_points = body.hysteresisRecoveryPoints

    cfg.updated_by = current_user.full_name
    cfg.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(cfg)

    return schemas.RiskConfigOut(
        mineId=cfg.mine_id,
        displacementWarningMm=cfg.displacement_warning_mm,
        displacementCriticalMm=cfg.displacement_critical_mm,
        tiltCriticalMmPerM=cfg.tilt_critical_mm_per_m,
        vibrationCriticalMmS=cfg.vibration_critical_mm_s,
        porePressureCriticalKPa=cfg.pore_pressure_critical_kpa,
        subsidenceRateCriticalMmDay=cfg.subsidence_rate_critical_mm_day,
        anomalyPersistenceThreshold=cfg.anomaly_persistence_threshold,
        hysteresisRecoveryPoints=cfg.hysteresis_recovery_points,
        updatedBy=cfg.updated_by,
        updatedAt=cfg.updated_at.isoformat()
    )
