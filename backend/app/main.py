"""
MineGuard FastAPI Backend — Main Application
Start: uvicorn app.main:app --reload --port 8000
Docs:  http://localhost:8000/docs
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine, SessionLocal, Base
from .routers import auth, mines, sensors, telemetry, alerts, predictions, settings as settings_router, simulator, ws, risk

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)

    # SQLite schema migration for data_source columns
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(telemetry_points)")).fetchall()
            cols = [r[1] for r in res]
            if "data_source" not in cols and len(cols) > 0:
                conn.execute(text("ALTER TABLE telemetry_points ADD COLUMN data_source VARCHAR DEFAULT 'SIMULATED'"))
                conn.commit()

            res_sensor = conn.execute(text("PRAGMA table_info(sensor_nodes)")).fetchall()
            cols_sensor = [r[1] for r in res_sensor]
            if "data_source" not in cols_sensor and len(cols_sensor) > 0:
                conn.execute(text("ALTER TABLE sensor_nodes ADD COLUMN data_source VARCHAR DEFAULT 'SIMULATED'"))
                conn.commit()

            res_alert = conn.execute(text("PRAGMA table_info(mine_alerts)")).fetchall()
            cols_alert = [r[1] for r in res_alert]
            if "investigating_by" not in cols_alert and len(cols_alert) > 0:
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN investigating_by VARCHAR"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN investigating_at VARCHAR"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN resolved_by VARCHAR"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN resolved_at VARCHAR"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN evidence_json TEXT DEFAULT '[]'"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN dedup_count INTEGER DEFAULT 1"))
                conn.execute(text("ALTER TABLE mine_alerts ADD COLUMN last_updated_at DATETIME"))
                conn.commit()
        except Exception:
            pass

    # Seed demo data if enabled
    if settings.seed_demo_data:
        from .seed import seed_all
        db = SessionLocal()
        try:
            seed_all(db)
        finally:
            db.close()

    yield
    # (cleanup on shutdown if needed)


app = FastAPI(
    title="MineGuard API",
    description=(
        "AI-enabled mine subsidence monitoring and early warning platform "
        "for underground coal mines in India. DGMS-compliant telemetry, "
        "geotechnical analytics, and sector-level risk predictions."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router, prefix=PREFIX)
app.include_router(mines.router, prefix=PREFIX)
app.include_router(sensors.router, prefix=PREFIX)
app.include_router(telemetry.router, prefix=PREFIX)
app.include_router(alerts.router, prefix=PREFIX)
app.include_router(predictions.router, prefix=PREFIX)
app.include_router(risk.router, prefix=PREFIX)
app.include_router(settings_router.router, prefix=PREFIX)
app.include_router(simulator.router, prefix=PREFIX)
app.include_router(ws.router)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": "MineGuard API",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }


@app.get("/", include_in_schema=False)
def root():
    return {"message": "MineGuard API v2 — visit /docs for API documentation"}
