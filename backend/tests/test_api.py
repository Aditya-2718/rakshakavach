"""Tests for mines, sensors, alerts, telemetry, predictions."""
import pytest


# ── Mines ──────────────────────────────────────────────────────────────────────

def test_list_mines_requires_auth(client):
    resp = client.get("/api/v1/mines")
    assert resp.status_code == 401


def test_list_mines(client, auth_headers):
    resp = client.get("/api/v1/mines", headers=auth_headers)
    assert resp.status_code == 200
    mines = resp.json()
    assert isinstance(mines, list)
    assert len(mines) >= 4
    mine = mines[0]
    assert "id" in mine
    assert "activeSensors" in mine
    assert "overallRisk" in mine


def test_get_mine_by_id(client, auth_headers):
    resp = client.get("/api/v1/mines/mine-jharia-blk4", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "mine-jharia-blk4"
    assert data["coalfield"] == "Jharia Coalfield"


def test_get_mine_not_found(client, auth_headers):
    resp = client.get("/api/v1/mines/nonexistent", headers=auth_headers)
    assert resp.status_code == 404


# ── Sensors ────────────────────────────────────────────────────────────────────

def test_list_sensors(client, auth_headers):
    resp = client.get("/api/v1/sensors", headers=auth_headers)
    assert resp.status_code == 200
    sensors = resp.json()
    assert len(sensors) >= 1
    s = sensors[0]
    assert "coordinates" in s
    assert "metrics" in s
    assert "thresholds" in s


def test_filter_sensors_by_mine(client, auth_headers):
    resp = client.get("/api/v1/sensors?mine_id=mine-jharia-blk4", headers=auth_headers)
    assert resp.status_code == 200
    sensors = resp.json()
    assert all(s["id"].startswith("SN-JH") for s in sensors)


def test_calibrate_sensor(client, auth_headers):
    resp = client.post("/api/v1/sensors/SN-JH-01/calibrate", headers=auth_headers)
    assert resp.status_code == 200
    assert "calibrated" in resp.json()["message"]


def test_create_sensor(client, auth_headers):
    resp = client.post(
        "/api/v1/sensors",
        headers=auth_headers,
        json={
            "id": "SN-NEW-01",
            "name": "Panel 4 Borehole Extensometer",
            "type": "Borehole Extensometer",
            "sector": "Panel 4",
            "mine_id": "mine-jharia-blk4",
            "depthMeters": 150.0,
            "warningDisplacementMm": 8.0,
            "criticalDisplacementMm": 12.0,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == "SN-NEW-01"
    assert data["name"] == "Panel 4 Borehole Extensometer"



# ── Telemetry ──────────────────────────────────────────────────────────────────

def test_list_telemetry(client, auth_headers):
    resp = client.get("/api/v1/telemetry?sensor_id=SN-JH-01", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    point = data[0]
    assert "displacementMm" in point
    assert "timestamp" in point


def test_ingest_telemetry(client, auth_headers):
    resp = client.post("/api/v1/telemetry/ingest", headers=auth_headers, json={
        "sensor_id": "SN-JH-01",
        "displacement_mm": 15.2,
        "tilt_mm_per_m": 4.8,
        "vibration_mm_s": 1.5,
        "subsidence_velocity_mm_day": 3.5,
        "pore_pressure_kpa": 190.0,
        "time_label": "12:00",
    })
    assert resp.status_code == 201
    assert resp.json()["sensor_id"] == "SN-JH-01"


def test_ingest_unknown_sensor(client, auth_headers):
    resp = client.post("/api/v1/telemetry/ingest", headers=auth_headers, json={
        "sensor_id": "SN-UNKNOWN-999",
        "displacement_mm": 1.0,
    })
    assert resp.status_code == 404


# ── Alerts ─────────────────────────────────────────────────────────────────────

def test_list_alerts(client, auth_headers):
    resp = client.get("/api/v1/alerts", headers=auth_headers)
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) >= 1
    a = alerts[0]
    assert "severity" in a
    assert "sopRecommendation" in a


def test_acknowledge_alert(client, auth_headers):
    resp = client.post(
        "/api/v1/alerts/ALT-JH-001/acknowledge",
        headers=auth_headers,
        json={"officer_name": "Er. Test Officer"},
    )
    assert resp.status_code == 200


def test_resolve_alert(client, auth_headers):
    resp = client.post("/api/v1/alerts/ALT-RG-001/resolve", headers=auth_headers)
    assert resp.status_code == 200


def test_alert_not_found(client, auth_headers):
    resp = client.post("/api/v1/alerts/ALT-FAKE/acknowledge", headers=auth_headers, json={})
    assert resp.status_code == 404


# ── Predictions ────────────────────────────────────────────────────────────────

def test_list_predictions(client, auth_headers):
    resp = client.get("/api/v1/predictions", headers=auth_headers)
    assert resp.status_code == 200
    preds = resp.json()
    assert len(preds) >= 1
    p = preds[0]
    assert "riskScore" in p
    assert "recommendedMitigations" in p
    assert isinstance(p["recommendedMitigations"], list)


def test_filter_predictions_by_mine(client, auth_headers):
    resp = client.get("/api/v1/predictions?mine_id=mine-jharia-blk4", headers=auth_headers)
    assert resp.status_code == 200


# ── Simulator Controls ───────────────────────────────────────────────────────

def test_simulator_status(client, auth_headers):
    resp = client.get("/api/v1/simulator/status", headers=auth_headers)
    assert resp.status_code == 200
    assert "status" in resp.json()


def test_simulator_start_and_stop(client, auth_headers):
    resp = client.post(
        "/api/v1/simulator/start",
        headers=auth_headers,
        json={"scenario": "normal", "interval": 1.0},
    )
    assert resp.status_code == 200
    assert resp.json()["config"]["status"] == "running"

    resp_stop = client.post("/api/v1/simulator/stop", headers=auth_headers)
    assert resp_stop.status_code == 200
    assert resp_stop.json()["config"]["status"] == "stopped"


def test_simulator_reset_confirmation(client, auth_headers):
    resp_bad = client.post("/api/v1/simulator/reset", headers=auth_headers, json={"confirm": False})
    assert resp_bad.status_code == 400

    resp_good = client.post("/api/v1/simulator/reset", headers=auth_headers, json={"confirm": True})
    assert resp_good.status_code == 200
    assert "Simulated telemetry" in resp_good.json()["message"]


# ── Health ─────────────────────────────────────────────────────────────────────

def test_health_check(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"
