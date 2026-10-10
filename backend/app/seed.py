"""Demo data seeder — inserts realistic Indian coal mine data on first run."""
from datetime import datetime, timedelta
import json
import uuid
from sqlalchemy.orm import Session
from . import models
from .auth import hash_password


def seed_all(db: Session):
    """Idempotent: only seeds if tables are empty."""
    if db.query(models.CoalMineSite).count() > 0:
        return  # Already seeded

    print("--- Seeding MineGuard demo data ---")

    # ── Users ──────────────────────────────────────────────────────────────────
    users = [
        models.User(
            id="usr-demo-safety01",
            email="rajesh.sharma@bccl.gov.in",
            full_name="Er. Rajesh Sharma",
            role=models.UserRole.safety_officer,
            hashed_password=hash_password("MineGuard2026!Sec"),
            is_active=True,
            created_at=datetime.utcnow(),
        ),
        models.User(
            id="usr-demo-geotech01",
            email="priya.nair@ecl.gov.in",
            full_name="Dr. Priya Nair",
            role=models.UserRole.geotechnical_engineer,
            hashed_password=hash_password("MineGuard2026!Geo"),
            is_active=True,
            created_at=datetime.utcnow(),
        ),
        models.User(
            id="usr-demo-admin01",
            email="admin@mineguard.in",
            full_name="MineGuard Administrator",
            role=models.UserRole.admin,
            hashed_password=hash_password("MineGuard2026!Admin"),
            is_active=True,
            created_at=datetime.utcnow(),
        ),
    ]
    db.add_all(users)

    # ── Mine Sites ─────────────────────────────────────────────────────────────
    mines = [
        models.CoalMineSite(
            id="mine-jharia-blk4",
            name="Block IV Underground Colliery",
            company="Bharat Coking Coal Limited (BCCL)",
            coalfield="Jharia Coalfield",
            state="Jharkhand",
            latitude=23.7485,
            longitude=86.4172,
            active_sensors=42,
            total_sensors=44,
            active_alerts=3,
            overall_risk=models.RiskLevel.warning,
            current_seam="Seam XI / XII Composite",
            extraction_method=models.ExtractionMethod.bord_and_pillar,
        ),
        models.CoalMineSite(
            id="mine-raniganj-sodepur",
            name="Sodepur Colliery (Shaft 9 & 10)",
            company="Eastern Coalfields Limited (ECL)",
            coalfield="Raniganj Coalfield",
            state="West Bengal",
            latitude=23.6824,
            longitude=86.9631,
            active_sensors=36,
            total_sensors=36,
            active_alerts=1,
            overall_risk=models.RiskLevel.moderate,
            current_seam="Dishergarh Seam",
            extraction_method=models.ExtractionMethod.longwall_retreat,
        ),
        models.CoalMineSite(
            id="mine-korba-manikpur",
            name="Manikpur Deep Mine Section",
            company="South Eastern Coalfields (SECL)",
            coalfield="Korba Coalfield",
            state="Chhattisgarh",
            latitude=22.3595,
            longitude=82.7231,
            active_sensors=28,
            total_sensors=30,
            active_alerts=0,
            overall_risk=models.RiskLevel.normal,
            current_seam="Jatraj Seam Bottom",
            extraction_method=models.ExtractionMethod.continuous_miner,
        ),
        models.CoalMineSite(
            id="mine-singrauli-jayant",
            name="Jayant In-Seam Depillaring Panel",
            company="Northern Coalfields Limited (NCL)",
            coalfield="Singrauli Coalfield",
            state="Madhya Pradesh",
            latitude=24.1205,
            longitude=82.6318,
            active_sensors=24,
            total_sensors=24,
            active_alerts=0,
            overall_risk=models.RiskLevel.normal,
            current_seam="Purewa Bottom Seam",
            extraction_method=models.ExtractionMethod.bord_and_pillar,
        ),
    ]
    db.add_all(mines)

    # ── Sensors ────────────────────────────────────────────────────────────────
    sensors = [
        models.SensorNode(
            id="SN-JH-01", mine_id="mine-jharia-blk4",
            name="Extensometer MPBX-101",
            sensor_type=models.SensorType.mpbx,
            sector="Panel 4B Depillaring Zone",
            depth_meters=145, status=models.RiskLevel.critical,
            battery_percent=88, signal_rssi_dbm=-72, last_seen="1 min ago",
            lat=23.7512, lng=86.4195, elevation_meters=218,
            displacement_mm=14.8, tilt_mm_per_m=4.6, vibration_mm_s=1.2,
            subsidence_velocity_mm_day=3.1, pore_pressure_kpa=182.4,
            warning_displacement_mm=5.0, critical_displacement_mm=12.0,
            firmware_version="v2.4.1",
        ),
        models.SensorNode(
            id="SN-JH-02", mine_id="mine-jharia-blk4",
            name="Inclinometer IPI-204",
            sensor_type=models.SensorType.ipi,
            sector="Main Return Airway",
            depth_meters=98, status=models.RiskLevel.warning,
            battery_percent=72, signal_rssi_dbm=-68, last_seen="3 min ago",
            lat=23.7498, lng=86.4183, elevation_meters=225,
            displacement_mm=7.3, tilt_mm_per_m=2.8, vibration_mm_s=0.6,
            subsidence_velocity_mm_day=1.4, pore_pressure_kpa=145.0,
            warning_displacement_mm=5.0, critical_displacement_mm=12.0,
            firmware_version="v2.4.1",
        ),
        models.SensorNode(
            id="SN-JH-03", mine_id="mine-jharia-blk4",
            name="Geophone MG-312",
            sensor_type=models.SensorType.geophone,
            sector="Pillar Recovery Zone A",
            depth_meters=162, status=models.RiskLevel.normal,
            battery_percent=95, signal_rssi_dbm=-61, last_seen="Just now",
            lat=23.7522, lng=86.4201, elevation_meters=210,
            displacement_mm=1.2, tilt_mm_per_m=0.4, vibration_mm_s=0.3,
            subsidence_velocity_mm_day=0.2, pore_pressure_kpa=98.5,
            warning_displacement_mm=5.0, critical_displacement_mm=12.0,
            firmware_version="v2.4.1",
        ),
        models.SensorNode(
            id="SN-RG-01", mine_id="mine-raniganj-sodepur",
            name="Crackmeter CVM-501",
            sensor_type=models.SensorType.crackmeter,
            sector="Longwall Face 7 Tailgate",
            depth_meters=220, status=models.RiskLevel.warning,
            battery_percent=61, signal_rssi_dbm=-79, last_seen="5 min ago",
            lat=23.6831, lng=86.9643, elevation_meters=195,
            displacement_mm=8.9, tilt_mm_per_m=3.2, vibration_mm_s=0.9,
            subsidence_velocity_mm_day=1.8, pore_pressure_kpa=167.2,
            warning_displacement_mm=6.0, critical_displacement_mm=15.0,
            firmware_version="v2.3.8",
        ),
        models.SensorNode(
            id="SN-RG-02", mine_id="mine-raniganj-sodepur",
            name="Piezometer PZ-108",
            sensor_type=models.SensorType.piezometer,
            sector="Shaft Bottom Inset",
            depth_meters=310, status=models.RiskLevel.normal,
            battery_percent=93, signal_rssi_dbm=-55, last_seen="2 min ago",
            lat=23.6820, lng=86.9625, elevation_meters=188,
            displacement_mm=0.8, tilt_mm_per_m=0.2, vibration_mm_s=0.1,
            subsidence_velocity_mm_day=0.1, pore_pressure_kpa=312.0,
            warning_displacement_mm=6.0, critical_displacement_mm=15.0,
            firmware_version="v2.3.8",
        ),
        models.SensorNode(
            id="SN-KO-01", mine_id="mine-korba-manikpur",
            name="GNSS Station CORS-07",
            sensor_type=models.SensorType.gnss,
            sector="Surface Subsidence Grid S-A",
            depth_meters=0, status=models.RiskLevel.normal,
            battery_percent=100, signal_rssi_dbm=-48, last_seen="Just now",
            lat=22.3601, lng=82.7239, elevation_meters=285,
            displacement_mm=0.3, tilt_mm_per_m=0.1, vibration_mm_s=0.0,
            subsidence_velocity_mm_day=0.05, pore_pressure_kpa=0.0,
            warning_displacement_mm=4.0, critical_displacement_mm=10.0,
            firmware_version="v3.1.0",
        ),
    ]
    db.add_all(sensors)

    # ── Alerts ─────────────────────────────────────────────────────────────────
    alerts = [
        models.MineAlert(
            id="ALT-JH-001", mine_id="mine-jharia-blk4",
            title="Critical Displacement Threshold Exceeded — MPBX-101",
            sensor_id="SN-JH-01", sensor_name="Extensometer MPBX-101",
            sector="Panel 4B Depillaring Zone",
            severity=models.AlertSeverity.critical, status=models.AlertStatus.active,
            timestamp="Today, 06:42 IST",
            metric="Cumulative Displacement (MPBX Anchor 3)",
            current_value="14.8 mm", threshold_value="12.0 mm",
            sop_recommendation=(
                "IMMEDIATE ACTION REQUIRED: Halt all depillaring in Panel 4B. "
                "Evacuate personnel from the affected zone. Notify Mine Manager and DGMS. "
                "Initiate emergency ground support installation per CMR Regulation 176."
            ),
        ),
        models.MineAlert(
            id="ALT-JH-002", mine_id="mine-jharia-blk4",
            title="Elevated Tilt Detected — Inclinometer IPI-204",
            sensor_id="SN-JH-02", sensor_name="Inclinometer IPI-204",
            sector="Main Return Airway",
            severity=models.AlertSeverity.warning, status=models.AlertStatus.acknowledged,
            timestamp="Today, 05:18 IST",
            metric="Tilt Rate (IPI Sensor Array)",
            current_value="2.8 mm/m", threshold_value="2.0 mm/m",
            sop_recommendation=(
                "Reduce extraction rate by 30%. Deploy additional rock bolt support "
                "at affected rib locations. Increase monitoring frequency to 15-min intervals. "
                "Geotechnical engineer to assess roof condition within 4 hours."
            ),
            acknowledged_by="Er. Rajesh Sharma (Safety Officer)",
            acknowledged_at="05:35 IST",
        ),
        models.MineAlert(
            id="ALT-RG-001", mine_id="mine-raniganj-sodepur",
            title="Subsidence Velocity Increasing — Longwall Face 7",
            sensor_id="SN-RG-01", sensor_name="Crackmeter CVM-501",
            sector="Longwall Face 7 Tailgate",
            severity=models.AlertSeverity.warning, status=models.AlertStatus.active,
            timestamp="Today, 04:55 IST",
            metric="Subsidence Velocity",
            current_value="1.8 mm/day", threshold_value="1.5 mm/day",
            sop_recommendation=(
                "Monitor subsidence velocity trends for next 2 hours. "
                "Review longwall advance rate and adjust if velocity exceeds 2.0 mm/day. "
                "Conduct visual inspection of surface structures in grid sector S-7. "
                "Notify surface structure owners if velocity persists."
            ),
        ),
    ]
    db.add_all(alerts)

    # ── Predictions ────────────────────────────────────────────────────────────
    predictions = [
        models.SectorPrediction(
            mine_id="mine-jharia-blk4",
            sector_id="JH-BLK4-4B",
            sector_name="Panel 4B — Active Depillaring",
            seam_name="Seam XI/XII Composite",
            overburden_depth_meters=145,
            risk_score=87.3,
            risk_category=models.RiskCategory.critical,
            subsidence_rate_predicted_mm_day=3.4,
            estimated_time_to_subsidence_trough_days=18,
            ai_confidence_percent=91.2,
            primary_risk_factor="High displacement velocity combined with progressive pillar failure sequence",
            recommended_mitigations=json.dumps([
                "Halt extraction and install emergency cogs at Panel 4B cross-cuts",
                "Deploy grouting program for fractured pillars in Zone B",
                "Increase MPBX monitoring to 5-minute intervals",
                "Submit DGMS Form-G emergency incident report within 6 hours"
            ]),
        ),
        models.SectorPrediction(
            mine_id="mine-jharia-blk4",
            sector_id="JH-BLK4-MRA",
            sector_name="Main Return Airway Corridor",
            seam_name="Seam XII",
            overburden_depth_meters=98,
            risk_score=62.5,
            risk_category=models.RiskCategory.elevated,
            subsidence_rate_predicted_mm_day=1.6,
            estimated_time_to_subsidence_trough_days=45,
            ai_confidence_percent=78.4,
            primary_risk_factor="Tilt acceleration pattern indicative of localised roof beam failure",
            recommended_mitigations=json.dumps([
                "Install additional roof support (rock bolts + W-straps) at 50m intervals",
                "Reduce airway width by installing yield pillar ribs",
                "Conduct weekly geotechnical mapping of roof condition",
                "Review ventilation plan to maintain escape routes"
            ]),
        ),
        models.SectorPrediction(
            mine_id="mine-raniganj-sodepur",
            sector_id="RG-SOD-LW7",
            sector_name="Longwall Face 7 — Tailgate",
            seam_name="Dishergarh Seam",
            overburden_depth_meters=220,
            risk_score=48.7,
            risk_category=models.RiskCategory.guarded,
            subsidence_rate_predicted_mm_day=1.9,
            estimated_time_to_subsidence_trough_days=32,
            ai_confidence_percent=82.1,
            primary_risk_factor="Longwall goaf consolidation creating differential settlement",
            recommended_mitigations=json.dumps([
                "Maintain minimum 2.0m hydraulic prop density at face",
                "Monitor surface trough development weekly with GNSS survey",
                "Coordinate with surface to protect Damodar Valley structures",
                "Adjust longwall advance rate to ≤ 6m/day"
            ]),
        ),
        models.SectorPrediction(
            mine_id="mine-korba-manikpur",
            sector_id="KO-MAN-CM1",
            sector_name="Continuous Miner Heading CM-1",
            seam_name="Jatraj Seam Bottom",
            overburden_depth_meters=175,
            risk_score=18.2,
            risk_category=models.RiskCategory.low,
            subsidence_rate_predicted_mm_day=0.3,
            estimated_time_to_subsidence_trough_days=120,
            ai_confidence_percent=94.5,
            primary_risk_factor="Normal extraction-induced deformation within acceptable bounds",
            recommended_mitigations=json.dumps([
                "Maintain current monitoring schedule (30-min intervals)",
                "Conduct monthly pillar condition assessment",
                "Continue standard rock bolt support pattern",
                "Review annually per DGMS strata control guidelines"
            ]),
        ),
    ]
    db.add_all(predictions)

    # ── Telemetry (last 24 data points per sensor) ─────────────────────────────
    base_time = datetime.utcnow() - timedelta(hours=24)
    telemetry_rows = []
    for i in range(24):
        ts = base_time + timedelta(hours=i)
        label = ts.strftime("%H:%M")
        # SN-JH-01 (critical, rising)
        telemetry_rows.append(models.TelemetryPoint(
            sensor_id="SN-JH-01", timestamp=ts, time_label=label,
            displacement_mm=8.0 + i * 0.28,
            tilt_mm_per_m=2.5 + i * 0.085,
            vibration_mm_s=0.4 + (i % 3) * 0.15,
            subsidence_velocity_mm_day=1.8 + i * 0.055,
            pore_pressure_kpa=150.0 + i * 1.4,
            predicted_displacement_mm=8.2 + i * 0.30,
            upper_confidence_interval=8.8 + i * 0.35,
            lower_confidence_interval=7.6 + i * 0.25,
        ))
        # SN-JH-02 (warning)
        telemetry_rows.append(models.TelemetryPoint(
            sensor_id="SN-JH-02", timestamp=ts, time_label=label,
            displacement_mm=4.0 + i * 0.14,
            tilt_mm_per_m=1.5 + i * 0.055,
            vibration_mm_s=0.2 + (i % 4) * 0.1,
            subsidence_velocity_mm_day=0.8 + i * 0.025,
            pore_pressure_kpa=120.0 + i * 1.0,
        ))
        # SN-RG-01
        telemetry_rows.append(models.TelemetryPoint(
            sensor_id="SN-RG-01", timestamp=ts, time_label=label,
            displacement_mm=5.0 + i * 0.17,
            tilt_mm_per_m=1.8 + i * 0.06,
            vibration_mm_s=0.3 + (i % 5) * 0.12,
            subsidence_velocity_mm_day=1.0 + i * 0.035,
            pore_pressure_kpa=140.0 + i * 1.2,
        ))

    db.add_all(telemetry_rows)

    # ── System Settings ────────────────────────────────────────────────────────
    settings_rows = [
        models.SystemSettings(
            mine_site_id="mine-jharia-blk4",
            telemetry_interval_seconds=30,
            auto_acknowledge_low_risk=False,
            dgms_escalation_enabled=True,
            dgms_email_recipients="dgms-jharkhand@gov.in",
            sms_alert_contacts="+91-9801XXXXXX",
            displacement_critical_threshold_mm=12.0,
            subsidence_rate_critical_mm_day=2.5,
            tilt_critical_mm_per_m=5.0,
            ai_anomaly_sensitivity="Medium",
            api_base_url="http://localhost:8000/api/v1",
        ),
    ]
    db.add_all(settings_rows)

    db.commit()
    print("✅  Demo data seeded successfully.")
