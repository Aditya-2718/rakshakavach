"""System settings router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=schemas.SystemSettingsOut)
def get_settings(
    mine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.SystemSettings)
    if mine_id:
        q = q.filter(models.SystemSettings.mine_site_id == mine_id)
    setting = q.first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found for this mine")
    return schemas.SystemSettingsOut.from_orm_mapped(setting)


@router.put("", response_model=schemas.SystemSettingsOut)
def update_settings(
    body: schemas.SystemSettingsUpdate,
    mine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.SystemSettings)
    if mine_id:
        q = q.filter(models.SystemSettings.mine_site_id == mine_id)
    setting = q.first()
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = body.model_dump(exclude_none=True)
    field_map = {
        "telemetryIntervalSeconds": "telemetry_interval_seconds",
        "autoAcknowledgeLowRisk": "auto_acknowledge_low_risk",
        "dgmsEscalationEnabled": "dgms_escalation_enabled",
        "dgmsEmailRecipients": "dgms_email_recipients",
        "smsAlertContacts": "sms_alert_contacts",
        "displacementCriticalThresholdMm": "displacement_critical_threshold_mm",
        "subsidenceRateCriticalMmDay": "subsidence_rate_critical_mm_day",
        "tiltCriticalMmPerM": "tilt_critical_mm_per_m",
        "aiAnomalySensitivity": "ai_anomaly_sensitivity",
    }
    for camel, snake in field_map.items():
        if camel in update_data:
            setattr(setting, snake, update_data[camel])

    db.commit()
    db.refresh(setting)
    return schemas.SystemSettingsOut.from_orm_mapped(setting)
