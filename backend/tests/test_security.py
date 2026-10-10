"""
MineGuard Security & Authorization Test Suite
Verifies 401 Unauthorized handling, JWT token validation, CORS headers,
Pydantic input schema validation, and endpoint authorization checks.
"""
import pytest


def test_protected_routes_require_authentication(client):
    """Verify that unauthenticated requests to protected endpoints return HTTP 401."""
    protected_endpoints = [
        ("GET", "/api/v1/mines"),
        ("GET", "/api/v1/sensors"),
        ("POST", "/api/v1/telemetry/ingest"),
        ("GET", "/api/v1/predictions/latest"),
        ("GET", "/api/v1/alerts/active"),
        ("GET", "/api/v1/risk/configuration"),
        ("POST", "/api/v1/simulator/start"),
    ]

    for method, path in protected_endpoints:
        if method == "GET":
            resp = client.get(path)
        else:
            resp = client.post(path, json={})
        assert resp.status_code == 401, f"Endpoint {path} failed to reject unauthenticated request."


def test_invalid_jwt_token_rejected(client):
    """Verify that requests with tampered JWT tokens return 401 Unauthorized."""
    bad_headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"}
    resp = client.get("/api/v1/mines", headers=bad_headers)
    assert resp.status_code == 401


def test_cors_headers_present(client):
    """Verify CORS preflight response headers."""
    resp = client.options(
        "/api/v1/mines",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert resp.status_code in [200, 204]
    assert "access-control-allow-origin" in resp.headers


def test_telemetry_ingest_schema_validation(client, auth_headers):
    """Verify Pydantic input validation rejects malformed body."""
    invalid_payload = {
        "sensor_id": "SN-JH-01",
        "displacement_mm": "invalid_string_instead_of_float"
    }
    resp = client.post("/api/v1/telemetry/ingest", headers=auth_headers, json=invalid_payload)
    assert resp.status_code == 422
