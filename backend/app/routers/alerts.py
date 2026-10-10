"""
MineGuard Alerts Router — Incident management, status transitions, evidence auditing, and WebSocket broadcasts.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..websocket_manager import manager as ws_manager

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[schemas.MineAlertOut])
def list_alerts(
    mine_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="active | investigating | acknowledged | resolved"),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.MineAlert)
    if mine_id:
        q = q.filter(models.MineAlert.mine_id == mine_id)
    if status:
        try:
            s = models.AlertStatus(status)
            q = q.filter(models.MineAlert.status == s)
        except ValueError:
            pass
    return [schemas.MineAlertOut.from_orm_mapped(a) for a in q.all()]


@router.get("/active", response_model=List[schemas.MineAlertOut])
def list_active_alerts(
    mine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Returns only active or investigating alerts requiring operator attention."""
    q = db.query(models.MineAlert).filter(
        models.MineAlert.status.in_([models.AlertStatus.active, models.AlertStatus.investigating])
    )
    if mine_id:
        q = q.filter(models.MineAlert.mine_id == mine_id)
    return [schemas.MineAlertOut.from_orm_mapped(a) for a in q.all()]


@router.get("/history", response_model=dict)
def get_alerts_history(
    mine_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Returns historical resolved or acknowledged alerts with audit evidence."""
    q = db.query(models.MineAlert)
    if mine_id:
        q = q.filter(models.MineAlert.mine_id == mine_id)

    alerts = q.order_by(models.MineAlert.last_updated_at.desc()).limit(limit).all()

    items = []
    for a in alerts:
        try:
            evidence = json.loads(a.evidence_json) if a.evidence_json else []
        except Exception:
            evidence = []

        notifs = db.query(models.NotificationAttempt).filter(models.NotificationAttempt.alert_id == a.id).all()

        items.append({
            "id": a.id,
            "mine_id": a.mine_id,
            "title": a.title,
            "sensor_id": a.sensor_id,
            "sensor_name": a.sensor_name,
            "sector": a.sector,
            "severity": a.severity.value if hasattr(a.severity, 'value') else a.severity,
            "status": a.status.value if hasattr(a.status, 'value') else a.status,
            "timestamp": a.timestamp,
            "metric": a.metric,
            "current_value": a.current_value,
            "threshold_value": a.threshold_value,
            "sop_recommendation": a.sop_recommendation,
            "acknowledged_by": a.acknowledged_by,
            "acknowledged_at": a.acknowledged_at,
            "investigating_by": a.investigating_by,
            "investigating_at": a.investigating_at,
            "resolved_by": a.resolved_by,
            "resolved_at": a.resolved_at,
            "evidence": evidence,
            "dedup_count": a.dedup_count or 1,
            "notifications_count": len(notifs)
        })

    return {"total": len(items), "alerts": items}


@router.post("/{alert_id}/acknowledge", status_code=200)
async def acknowledge_alert(
    alert_id: str,
    body: Optional[schemas.AlertAcknowledge] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Marks alert as acknowledged by safety officer."""
    alert = db.query(models.MineAlert).filter(models.MineAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = models.AlertStatus.acknowledged
    alert.acknowledged_by = (body.officer_name if body and body.officer_name else current_user.full_name)
    now = datetime.now(timezone.utc)
    alert.acknowledged_at = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    alert.last_updated_at = now

    db.commit()

    # Broadcast WebSocket alert update
    await ws_manager.broadcast("alert_status_changed", {
        "id": alert.id,
        "status": "acknowledged",
        "acknowledgedBy": alert.acknowledged_by,
        "acknowledgedAt": alert.acknowledged_at
    })

    return {
        "message": "Alert acknowledged successfully",
        "alert_id": alert_id,
        "status": "acknowledged",
        "acknowledged_by": alert.acknowledged_by
    }


@router.post("/{alert_id}/investigate", status_code=200)
async def investigate_alert(
    alert_id: str,
    body: Optional[schemas.AlertInvestigateRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Marks alert as currently under investigation by geotechnical team."""
    alert = db.query(models.MineAlert).filter(models.MineAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = models.AlertStatus.investigating
    alert.investigating_by = (body.investigator_name if body and body.investigator_name else current_user.full_name)
    now = datetime.now(timezone.utc)
    alert.investigating_at = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    alert.last_updated_at = now

    db.commit()

    await ws_manager.broadcast("alert_status_changed", {
        "id": alert.id,
        "status": "investigating",
        "investigatingBy": alert.investigating_by,
        "investigatingAt": alert.investigating_at
    })

    return {
        "message": "Alert set to investigating",
        "alert_id": alert_id,
        "status": "investigating",
        "investigating_by": alert.investigating_by
    }


@router.post("/{alert_id}/resolve", status_code=200)
async def resolve_alert(
    alert_id: str,
    body: Optional[schemas.AlertResolveRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Resolves an alert after field inspection and clearance."""
    alert = db.query(models.MineAlert).filter(models.MineAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = models.AlertStatus.resolved
    alert.resolved_by = (body.resolver_name if body and body.resolver_name else current_user.full_name)
    now = datetime.now(timezone.utc)
    alert.resolved_at = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    alert.last_updated_at = now

    db.commit()

    await ws_manager.broadcast("alert_status_changed", {
        "id": alert.id,
        "status": "resolved",
        "resolvedBy": alert.resolved_by,
        "resolvedAt": alert.resolved_at
    })

    return {
        "message": "Alert resolved successfully",
        "alert_id": alert_id,
        "status": "resolved",
        "resolved_by": alert.resolved_by
    }
