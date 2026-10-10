"""Sensors router."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/sensors", tags=["Sensors"])


@router.get("", response_model=List[schemas.SensorNodeOut])
def list_sensors(
    mine_id: Optional[str] = Query(None, description="Filter by mine ID"),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.SensorNode)
    if mine_id:
        q = q.filter(models.SensorNode.mine_id == mine_id)
    return [schemas.SensorNodeOut.from_orm_mapped(s) for s in q.all()]


@router.get("/{sensor_id}", response_model=schemas.SensorNodeOut)
def get_sensor(
    sensor_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    sensor = db.query(models.SensorNode).filter(models.SensorNode.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return schemas.SensorNodeOut.from_orm_mapped(sensor)


@router.post("/{sensor_id}/calibrate", status_code=200)
def calibrate_sensor(
    sensor_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sensor = db.query(models.SensorNode).filter(models.SensorNode.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    sensor.last_seen = "Just calibrated"
    sensor.battery_percent = min(100.0, sensor.battery_percent + 2.0)
    db.commit()
    return {"message": f"Sensor {sensor_id} calibrated", "operator": current_user.full_name}


@router.post("", response_model=schemas.SensorNodeOut, status_code=201)
def create_sensor(
    body: schemas.SensorCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    existing = db.query(models.SensorNode).filter(models.SensorNode.id == body.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sensor ID already exists")

    try:
        s_type = models.SensorType(body.type)
    except ValueError:
        s_type = models.SensorType.mpbx

    sensor = models.SensorNode(
        id=body.id,
        name=body.name,
        sensor_type=s_type,
        sector=body.sector,
        mine_id=body.mine_id,
        depth_meters=body.depthMeters,
        status=models.RiskLevel.normal,
        battery_percent=100.0,
        signal_rssi_dbm=-75.0,
        last_seen="Just provisioned",
        lat=body.lat,
        lng=body.lng,
        elevation_meters=body.elevationMeters,
        displacement_mm=0.0,
        tilt_mm_per_m=0.0,
        vibration_mm_s=0.0,
        subsidence_velocity_mm_day=0.0,
        pore_pressure_kpa=100.0,
        warning_displacement_mm=body.warningDisplacementMm,
        critical_displacement_mm=body.criticalDisplacementMm,
        firmware_version=body.firmwareVersion,
    )
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return schemas.SensorNodeOut.from_orm_mapped(sensor)

