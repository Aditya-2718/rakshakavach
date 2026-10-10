"""
MineGuard Telemetry Ingestion & Risk Evaluation Pipeline
Processes incoming telemetry through ML anomaly detection, rule-based risk evaluation,
alert deduplication, notification dispatch, and real-time WebSocket broadcasting.
"""
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ml.inference import inference_service
from .risk_engine import RiskEngine
from .notification_service import notification_service
from ..websocket_manager import manager as ws_manager

logger = logging.getLogger(__name__)


async def process_telemetry_pipeline(
    db: Session,
    sensor: models.SensorNode,
    telemetry_data: Dict[str, Any],
    point_id: int,
    data_source: str = "HARDWARE"
) -> Dict[str, Any]:
    """
    Executes end-to-end ML inference, risk engine rules, alert deduplication,
    notifications, and WebSocket broadcasts.
    """
    # 1. Execute ML Anomaly Detection
    inference_result = inference_service.predict(telemetry_data)

    # 2. Persist Anomaly Prediction Record
    anomaly_record = models.AnomalyPrediction(
        id=f"anom-{uuid.uuid4().hex[:12]}",
        telemetry_id=point_id,
        sensor_id=sensor.id,
        mine_id=sensor.mine_id,
        timestamp=datetime.now(timezone.utc),
        is_anomaly=inference_result.get("is_anomaly", False),
        anomaly_score=inference_result.get("anomaly_score", 0.0),
        raw_score=inference_result.get("raw_score", 0.0),
        model_version=inference_result.get("model_version"),
        feature_vector_json=json.dumps(inference_result.get("feature_vector", {})),
        data_quality_status=inference_result.get("data_quality_status", "VALID")
    )
    db.add(anomaly_record)

    # 3. Risk Engine Evaluation
    new_risk_level, evidence_rules, is_sensor_fault = RiskEngine.evaluate(
        db, sensor, telemetry_data, inference_result
    )

    old_status = sensor.status
    if not is_sensor_fault:
        sensor.status = new_risk_level

    # Record Risk Transition if risk level changed
    if old_status != new_risk_level:
        transition = models.RiskTransition(
            id=f"risktr-{uuid.uuid4().hex[:12]}",
            mine_id=sensor.mine_id,
            sector_id=sensor.sector,
            sensor_id=sensor.id,
            timestamp=datetime.now(timezone.utc),
            previous_risk=old_status.value if hasattr(old_status, 'value') else str(old_status),
            new_risk=new_risk_level.value if hasattr(new_risk_level, 'value') else str(new_risk_level),
            trigger_reason=f"Risk evaluated by rules and ML anomaly score ({inference_result.get('anomaly_score', 0.0)})",
            supporting_evidence_json=json.dumps(evidence_rules)
        )
        db.add(transition)

        # Broadcast sector_risk_updated event
        await ws_manager.broadcast("sector_risk_updated", {
            "mineId": sensor.mine_id,
            "sector": sensor.sector,
            "sensorId": sensor.id,
            "previousRisk": old_status.value if hasattr(old_status, 'value') else str(old_status),
            "newRisk": new_risk_level.value if hasattr(new_risk_level, 'value') else str(new_risk_level),
            "evidence": evidence_rules
        })

    # 4. Alert Generation & Deduplication Strategy
    active_alert = None
    if new_risk_level in (models.RiskLevel.warning, models.RiskLevel.critical):
        # Check if active/investigating alert already exists for this sensor
        active_alert = db.query(models.MineAlert).filter(
            models.MineAlert.sensor_id == sensor.id,
            models.MineAlert.status.in_([models.AlertStatus.active, models.AlertStatus.investigating])
        ).first()

        primary_rule = evidence_rules[0] if evidence_rules else {
            "measurement": "displacement_mm",
            "observed_value": str(telemetry_data.get("displacement_mm", 0.0)),
            "threshold_value": "5.0 mm",
            "reason": "Threshold breach detected"
        }

        severity_val = models.AlertSeverity.critical if new_risk_level == models.RiskLevel.critical else models.AlertSeverity.warning

        if active_alert:
            # Update existing alert (deduplication)
            active_alert.current_value = f"{primary_rule.get('observed_value')} ({primary_rule.get('measurement')})"
            active_alert.evidence_json = json.dumps(evidence_rules)
            active_alert.dedup_count = (active_alert.dedup_count or 1) + 1
            active_alert.last_updated_at = datetime.now(timezone.utc)
            if active_alert.severity != severity_val:
                active_alert.severity = severity_val

            db.commit()

            # Broadcast alert status/dedup update
            await ws_manager.broadcast("alert_status_changed", {
                "id": active_alert.id,
                "status": active_alert.status.value if hasattr(active_alert.status, 'value') else active_alert.status,
                "dedupCount": active_alert.dedup_count,
                "currentValue": active_alert.current_value,
                "evidence": evidence_rules
            })
        else:
            # Create new incident alert
            new_alert_id = f"ALT-INC-{uuid.uuid4().hex[:8].upper()}"
            active_alert = models.MineAlert(
                id=new_alert_id,
                mine_id=sensor.mine_id,
                title=f"{primary_rule.get('rule_name', 'Strata Risk Alert')} in {sensor.sector}",
                sensor_id=sensor.id,
                sensor_name=sensor.name,
                sector=sensor.sector,
                severity=severity_val,
                status=models.AlertStatus.active,
                timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                metric=str(primary_rule.get('measurement', 'Displacement')),
                current_value=f"{primary_rule.get('observed_value')}",
                threshold_value=f"{primary_rule.get('threshold_value')}",
                sop_recommendation=f"SOP PROTOCOL: Inspect {sensor.sector} immediately. Evacuate personnel if displacement > 12mm.",
                evidence_json=json.dumps(evidence_rules),
                dedup_count=1,
                last_updated_at=datetime.now(timezone.utc)
            )
            db.add(active_alert)
            db.commit()

            # Dispatch Notifications (In-App, Email, SMS)
            notification_service.send_alert_notifications(db, active_alert)

            # Broadcast alert_created event
            alert_out = schemas.MineAlertOut.from_orm_mapped(active_alert)
            await ws_manager.broadcast("alert_created", alert_out.model_dump())

    db.commit()

    return {
        "inference": inference_result,
        "risk_level": new_risk_level.value if hasattr(new_risk_level, 'value') else str(new_risk_level),
        "evidence": evidence_rules,
        "alert_id": active_alert.id if active_alert else None
    }
