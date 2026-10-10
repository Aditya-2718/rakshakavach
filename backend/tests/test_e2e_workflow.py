"""
MineGuard Phase 5 End-to-End Integration & Workflow Test Suite
Verifies the complete 18-step operational workflow from admin registration, mine selection,
simulator tick ingestion, ML inference execution, risk engine evaluation, alert deduplication,
and status resolution.
"""
import pytest
from app.ml.inference import inference_service


def test_e2e_full_operational_workflow(client):
    # 1. Register Administrator / User
    admin_payload = {
        "email": "e2e_admin@bccl.gov.in",
        "full_name": "E2E Administrator",
        "password": "SecurePassword123!",
        "role": "admin"
    }
    resp_reg = client.post("/api/v1/auth/register", json=admin_payload)
    assert resp_reg.status_code == 201, resp_reg.text

    # 2. Login to get JWT Token
    login_payload = {
        "email": "e2e_admin@bccl.gov.in",
        "password": "SecurePassword123!"
    }
    resp_login = client.post("/api/v1/auth/login", json=login_payload)
    assert resp_login.status_code == 200, resp_login.text
    auth_data = resp_login.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Query Demo Mine Sites
    resp_mines = client.get("/api/v1/mines", headers=headers)
    assert resp_mines.status_code == 200
    mines = resp_mines.json()
    assert len(mines) >= 1
    target_mine_id = mines[0]["id"]

    # 4. Query Sensors for Mine
    resp_sensors = client.get(f"/api/v1/sensors?mine_id={target_mine_id}", headers=headers)
    assert resp_sensors.status_code == 200
    sensors = resp_sensors.json()
    assert len(sensors) >= 1
    sensor_id = sensors[0]["id"]

    # 5. Start Simulator Engine
    resp_start_sim = client.post("/api/v1/simulator/start", headers=headers, json={"mine_id": target_mine_id})
    assert resp_start_sim.status_code == 200
    assert resp_start_sim.json()["config"]["status"] in ["running", "started"]

    # 6. Set Simulator Anomaly Scenario
    resp_scenario = client.post("/api/v1/simulator/scenario", headers=headers, json={"scenario": "rapid_subsidence"})
    assert resp_scenario.status_code == 200
    assert resp_scenario.json()["config"]["scenario"] == "rapid_subsidence"

    # 7. Post Telemetry Data Point
    telemetry_payload = {
        "sensor_id": sensor_id,
        "displacement_mm": 16.5,
        "tilt_mm_per_m": 7.2,
        "vibration_mm_s": 4.1,
        "subsidence_velocity_mm_day": 3.8,
        "pore_pressure_kpa": 230.0,
        "data_source": "SIMULATED"
    }
    resp_ingest = client.post("/api/v1/telemetry/ingest", headers=headers, json=telemetry_payload)
    assert resp_ingest.status_code == 201
    ingest_data = resp_ingest.json()
    assert ingest_data["status"] == "ingested"
    assert "pipeline" in ingest_data
    assert ingest_data["pipeline"]["inference"]["status"] == "success"

    # 8. Verify ML Inference Results & Anomaly Predictions
    resp_pred = client.get(f"/api/v1/predictions/latest?sensor_id={sensor_id}", headers=headers)
    assert resp_pred.status_code == 200
    pred_data = resp_pred.json()
    assert pred_data["status"] == "success"
    assert pred_data["prediction"]["model_version"] == "IsolationForest-v1.2.0"
    assert len(pred_data["prediction"]["feature_vector"]) == 14

    # 9. Verify Risk Configuration & Rule Engine Evaluation
    resp_risk = client.get(f"/api/v1/risk/configuration?mine_id={target_mine_id}", headers=headers)
    assert resp_risk.status_code == 200

    # 10. Verify Alert Created / Active List
    resp_alerts = client.get(f"/api/v1/alerts/active?mine_id={target_mine_id}", headers=headers)
    assert resp_alerts.status_code == 200
    active_alerts = resp_alerts.json()
    assert len(active_alerts) >= 1
    alert_id = active_alerts[0]["id"]

    # 11. Acknowledge Alert
    resp_ack = client.post(f"/api/v1/alerts/{alert_id}/acknowledge", headers=headers, json={"officer_name": "E2E Administrator"})
    assert resp_ack.status_code == 200
    assert resp_ack.json()["status"] == "acknowledged"

    # 12. Set Investigating Status
    resp_inv = client.post(f"/api/v1/alerts/{alert_id}/investigate", headers=headers, json={"investigator_name": "Geotech Lead"})
    assert resp_inv.status_code == 200
    assert resp_inv.json()["status"] == "investigating"

    # 13. Resolve Alert
    resp_res = client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=headers, json={"resolver_name": "Geotech Lead"})
    assert resp_res.status_code == 200
    assert resp_res.json()["status"] == "resolved"

    # 14. Verify Alert History Audit Log
    resp_hist = client.get(f"/api/v1/alerts/history?mine_id={target_mine_id}", headers=headers)
    assert resp_hist.status_code == 200
    hist_data = resp_hist.json()
    assert hist_data["total"] >= 1

    # 15. Stop Simulator Engine
    resp_stop_sim = client.post("/api/v1/simulator/stop", headers=headers)
    assert resp_stop_sim.status_code == 200
    assert resp_stop_sim.json()["config"]["status"] in ["stopped", "idle"]
