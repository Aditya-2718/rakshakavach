"""
MineGuard Predictions Router
Provides endpoints for sector risk predictions, latest ML anomaly inference, historical
anomaly timelines, and documented forecasting status.
"""
import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..auth import get_current_user
from ..database import get_db
from ..ml.inference import inference_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("", response_model=List[schemas.SectorPredictionOut])
def list_predictions(
    mine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.SectorPrediction)
    if mine_id:
        q = q.filter(models.SectorPrediction.mine_id == mine_id)
    return [schemas.SectorPredictionOut.from_orm_mapped(p) for p in q.all()]


@router.get("/latest", response_model=dict)
def get_latest_prediction(
    sensor_id: Optional[str] = Query(None),
    mine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Returns the latest ML anomaly prediction result and model status."""
    q = db.query(models.AnomalyPrediction)
    if sensor_id:
        q = q.filter(models.AnomalyPrediction.sensor_id == sensor_id)
    if mine_id:
        q = q.filter(models.AnomalyPrediction.mine_id == mine_id)

    latest = q.order_by(models.AnomalyPrediction.timestamp.desc()).first()

    model_info = {
        "is_available": inference_service.is_model_available,
        "model_version": inference_service.model_version,
        "algorithm": "IsolationForest",
        "error": inference_service.error_message,
        "disclaimer": (
            "NOTICE: Isolation Forest anomaly scores represent statistical feature deviation. "
            "They do not constitute a deterministic prediction of mine collapse or ground failure. "
            "All operational safety decisions require qualified geotechnical evaluation."
        )
    }

    if not latest:
        return {
            "prediction": None,
            "model_info": model_info,
            "status": "no_predictions_yet"
        }

    try:
        features = json.loads(latest.feature_vector_json) if latest.feature_vector_json else {}
    except Exception:
        features = {}

    sensor = db.query(models.SensorNode).filter(models.SensorNode.id == latest.sensor_id).first()

    return {
        "prediction": {
            "id": latest.id,
            "sensor_id": latest.sensor_id,
            "sensor_name": sensor.name if sensor else latest.sensor_id,
            "sector": sensor.sector if sensor else "Unknown",
            "mine_id": latest.mine_id,
            "timestamp": latest.timestamp.isoformat(),
            "is_anomaly": latest.is_anomaly,
            "anomaly_score": latest.anomaly_score,
            "raw_score": latest.raw_score,
            "model_version": latest.model_version,
            "feature_vector": features,
            "data_quality_status": latest.data_quality_status
        },
        "model_info": model_info,
        "status": "success"
    }


@router.get("/history", response_model=dict)
def get_prediction_history(
    sensor_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Returns historical anomaly predictions for time-series timelines."""
    q = db.query(models.AnomalyPrediction)
    if sensor_id:
        q = q.filter(models.AnomalyPrediction.sensor_id == sensor_id)

    records = q.order_by(models.AnomalyPrediction.timestamp.desc()).limit(limit).all()

    items = []
    for r in records:
        try:
            feats = json.loads(r.feature_vector_json) if r.feature_vector_json else {}
        except Exception:
            feats = {}
        items.append({
            "id": r.id,
            "sensor_id": r.sensor_id,
            "mine_id": r.mine_id,
            "timestamp": r.timestamp.isoformat(),
            "is_anomaly": r.is_anomaly,
            "anomaly_score": r.anomaly_score,
            "raw_score": r.raw_score,
            "model_version": r.model_version,
            "feature_vector": feats,
            "data_quality_status": r.data_quality_status
        })

    return {
        "total": len(items),
        "history": items,
        "model_version": inference_service.model_version
    }


@router.get("/forecast", response_model=schemas.ForecastResponse)
def get_displacement_forecast(
    sensor_id: Optional[str] = Query(None),
    _: models.User = Depends(get_current_user),
):
    """
    Returns LSTM time-series forecast status.
    Documents explicitly when a pre-trained sequence forecasting model is not loaded.
    """
    return schemas.ForecastResponse(
        forecast_available=False,
        model_version=None,
        reason=(
            "Deep Learning sequence forecasting model (LSTM / Temporal Fusion Transformer) is not loaded or configured. "
            "Future displacement trajectory forecasting requires continuous sequence dataset training."
        ),
        requirements=[
            "Minimum 30 days continuous 10-second multi-channel sensor telemetry sequence.",
            "Supervised ground truth subsidence survey markers for model validation.",
            "Trained PyTorch/TensorFlow LSTM model checkpoint configured in backend/app/ml/models/lstm_subsidence.pt.",
            "Independent geotechnical back-testing verification before deployment."
        ],
        forecast_horizon_days=0,
        predictions=[]
    )
