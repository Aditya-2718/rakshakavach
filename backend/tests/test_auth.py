"""Tests for authentication endpoints."""
import pytest


def test_login_success(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "rajesh.sharma@bccl.gov.in",
        "password": "MineGuard2026!Sec",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "safety-officer"


def test_login_wrong_password(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "rajesh.sharma@bccl.gov.in",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nobody@example.com",
        "password": "something",
    })
    assert resp.status_code == 401


def test_register_new_user(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "new.officer@ecl.gov.in",
        "full_name": "New Officer",
        "password": "SecurePass123!",
        "role": "safety-officer",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new.officer@ecl.gov.in"
    assert "access_token" in data


def test_register_duplicate_email(client):
    payload = {
        "email": "dup@ecl.gov.in",
        "full_name": "Dup Officer",
        "password": "SecurePass123!",
        "role": "safety-officer",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 400


def test_me_requires_auth(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_with_auth(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "rajesh.sharma@bccl.gov.in"
