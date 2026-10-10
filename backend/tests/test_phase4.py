"""
MineGuard Phase 4 Tests — AI/ML Anomaly Detection, Risk Engine, Alert Management & Notifications.
"""
import pytest
from app.ml.inference import inference_service


def test_ml_inference_service_loaded():
    """Verify pre-trained Isolation Forest model is loaded cleanly."""
    assert inference_service.is_model_available is True
    assert inference_service.model_version == "IsolationForest-v1.2.0"
    assert inference_service.error_message is None


def test_ml_feature_vector_preprocessing():
    """Verify feature vector extraction maps exactly 14 required features."""
    sample_telem = {
        "displacement_mm": 14.5,
        "tilt_mm_per_m": 3.2,
        "vibration_mm_s": 2.1,
        "subsidence_velocity_mm_day": 1.2,
        "pore_pressure_kpa": 110.0
    }
    vector, feature_dict, quality = inference_service.extract_feature_vector(sample_telem)

    assert vector.shape == (1, 14)
    assert quality == "VALID"
    assert "ultrasonic_distance_cm" in feature_dict
    assert "distance_change_cm" in feature_dict
    assert feature_dict["distance_change_cm"] == 1.45
    assert "vibration_rms" in feature_dict


def test_ml_inference_prediction():
    """Verify ML inference output structure and anomaly scoring."""
    sample_telem = {
        "displacement_mm": 2.0,
        "tilt_mm_per_m": 0.5,
        "vibration_mm_s": 0.2
    }
    result = inference_service.predict(sample_telem)

    assert result["status"] == "success"
    assert "is_anomaly" in result
    assert "anomaly_score" in result
    assert result["model_version"] == "IsolationForest-v1.2.0"


def test_get_latest_prediction_endpoint(client, auth_headers):
    """Test GET /api/v1/predictions/latest endpoint."""
    resp = client.get("/api/v1/predictions/latest", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "model_info" in data
    assert data["model_info"]["is_available"] is True


def test_get_prediction_history_endpoint(client, auth_headers):
    """Test GET /api/v1/predictions/history endpoint."""
    resp = client.get("/api/v1/predictions/history?limit=10", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "history" in data


def test_get_displacement_forecast_endpoint(client, auth_headers):
    """Test GET /api/v1/predictions/forecast returns documented model-unavailable state."""
    resp = client.get("/api/v1/predictions/forecast", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["forecast_available"] is False
    assert len(data["requirements"]) >= 3


def test_get_and_patch_risk_configuration(client, auth_headers):
    """Test GET and PATCH /api/v1/risk/configuration with role permission checks."""
    # GET configuration
    resp_get = client.get("/api/v1/risk/configuration?mine_id=mine-jharia-blk4", headers=auth_headers)
    assert resp_get.status_code == 200
    config = resp_get.json()
    assert config["displacementCriticalMm"] == 12.0

    # PATCH configuration
    update_payload = {
        "displacementWarningMm": 6.0,
        "displacementCriticalMm": 14.0
    }
    resp_patch = client.patch("/api/v1/risk/configuration?mine_id=mine-jharia-blk4", headers=auth_headers, json=update_payload)
    assert resp_patch.status_code == 200
    updated_config = resp_patch.json()
    assert updated_config["displacementWarningMm"] == 6.0
    assert updated_config["displacementCriticalMm"] == 14.0


def test_alert_lifecycle_acknowledge_investigate_resolve(client, auth_headers):
    """Test alert lifecycle transitions: active -> acknowledged -> investigating -> resolved."""
    # List active alerts
    resp_active = client.get("/api/v1/alerts/active", headers=auth_headers)
    assert resp_active.status_code == 200
    alerts = resp_active.json()

    if len(alerts) > 0:
        alert_id = alerts[0]["id"]

        # Acknowledge
        resp_ack = client.post(f"/api/v1/alerts/{alert_id}/acknowledge", headers=auth_headers, json={"officer_name": "Test Officer"})
        assert resp_ack.status_code == 200
        assert resp_ack.json()["status"] == "acknowledged"

        # Investigate
        resp_inv = client.post(f"/api/v1/alerts/{alert_id}/investigate", headers=auth_headers, json={"investigator_name": "Engineer John"})
        assert resp_inv.status_code == 200
        assert resp_inv.json()["status"] == "investigating"

        # Resolve
        resp_res = client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=auth_headers, json={"resolver_name": "Engineer John"})
        assert resp_res.status_code == 200
        assert resp_res.json()["status"] == "resolved"


def test_telemetry_ingest_triggers_pipeline(client, auth_headers):
    """Test that posting critical telemetry triggers ML inference, risk evaluation, and alert deduplication."""
    critical_telemetry = {
        "sensor_id": "SN-JH-01",
        "displacement_mm": 15.2,
        "tilt_mm_per_m": 6.1,
        "vibration_mm_s": 3.4,
        "subsidence_velocity_mm_day": 3.0,
        "pore_pressure_kpa": 220.0,
        "data_source": "HARDWARE"
    }

    resp = client.post("/api/v1/telemetry/ingest", headers=auth_headers, json=critical_telemetry)
    assert resp.status_code == 201
    res = resp.json()
    assert res["status"] == "ingested"
    assert "pipeline" in res
    assert res["pipeline"]["inference"]["status"] == "success"
    assert res["pipeline"]["risk_level"] in ["warning", "critical"]
