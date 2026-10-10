"""Telemetry router — ingest and query time-series data."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


from ..websocket_manager import manager as ws_manager


@router.get("", response_model=List[schemas.TelemetryPointOut])
def list_telemetry(
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    source: Optional[str] = Query(None, description="Filter by data source (HARDWARE | SIMULATED)"),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.TelemetryPoint)
    if sensor_id:
        q = q.filter(models.TelemetryPoint.sensor_id == sensor_id)
    if source:
        q = q.filter(models.TelemetryPoint.data_source == source)
    q = q.order_by(models.TelemetryPoint.timestamp.asc()).limit(limit)
    return [schemas.TelemetryPointOut.from_orm_mapped(t) for t in q.all()]


@router.post("/ingest", status_code=201)
async def ingest_telemetry(
    body: schemas.TelemetryIngest,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Accept a single telemetry data point from a sensor gateway or simulator."""
    sensor = db.query(models.SensorNode).filter(models.SensorNode.id == body.sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    now = datetime.now(timezone.utc)
    point = models.TelemetryPoint(
        sensor_id=body.sensor_id,
        timestamp=now,
        time_label=body.time_label or now.strftime("%H:%M:%S"),
        data_source=body.data_source or "HARDWARE",
        displacement_mm=body.displacement_mm,
        tilt_mm_per_m=body.tilt_mm_per_m,
        vibration_mm_s=body.vibration_mm_s,
        subsidence_velocity_mm_day=body.subsidence_velocity_mm_day,
        pore_pressure_kpa=body.pore_pressure_kpa,
    )
    db.add(point)

    # Update live metrics on the sensor node
    sensor.displacement_mm = body.displacement_mm
    sensor.tilt_mm_per_m = body.tilt_mm_per_m
    sensor.vibration_mm_s = body.vibration_mm_s
    sensor.subsidence_velocity_mm_day = body.subsidence_velocity_mm_day
    sensor.pore_pressure_kpa = body.pore_pressure_kpa
    sensor.last_seen = "Just now"
    sensor.data_source = body.data_source or "HARDWARE"

    db.commit()
    db.refresh(point)
    db.refresh(sensor)

    telem_dict = {
        "displacement_mm": body.displacement_mm,
        "tilt_mm_per_m": body.tilt_mm_per_m,
        "vibration_mm_s": body.vibration_mm_s,
        "subsidence_velocity_mm_day": body.subsidence_velocity_mm_day,
        "pore_pressure_kpa": body.pore_pressure_kpa,
        "signal_rssi_dbm": sensor.signal_rssi_dbm,
        "battery_percent": sensor.battery_percent
    }

    # Execute Phase 4 ML Inference, Risk Engine, Deduplication, Notification & Alert Pipeline
    from ..services.pipeline import process_telemetry_pipeline
    pipeline_res = await process_telemetry_pipeline(db, sensor, telem_dict, point.id, data_source=sensor.data_source)

    telem_out = schemas.TelemetryPointOut.from_orm_mapped(point)
    sensor_out = schemas.SensorNodeOut.from_orm_mapped(sensor)

    # Broadcast live reading to all connected WebSocket clients
    await ws_manager.broadcast("telemetry_reading", {
        "sensorId": sensor.id,
        "sensorName": sensor.name,
        "sector": sensor.sector,
        "mineId": sensor.mine_id,
        "telemetry": telem_out.model_dump(),
        "sensorSnapshot": sensor_out.model_dump(),
        "inference": pipeline_res.get("inference"),
        "riskLevel": pipeline_res.get("risk_level")
    })

    return {
        "status": "ingested",
        "sensor_id": body.sensor_id,
        "timestamp": now.isoformat(),
        "pipeline": pipeline_res
    }
