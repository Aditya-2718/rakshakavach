"""
MineGuard Geotechnical Risk Engine
Evaluates telemetry readings, sensor health, ML anomaly predictions, and historical persistence
to determine risk level (NORMAL, WATCH, WARNING, CRITICAL) with evidence auditing and hysteresis recovery.
"""
import logging
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from .. import models

logger = logging.getLogger(__name__)

# Default prototype thresholds (Requires geotechnical calibration)
DEFAULT_CONFIG = {
    "displacement_warning_mm": 5.0,
    "displacement_critical_mm": 12.0,
    "tilt_critical_mm_per_m": 5.0,
    "vibration_critical_mm_s": 2.0,
    "pore_pressure_critical_kpa": 200.0,
    "subsidence_rate_critical_mm_day": 2.5,
    "anomaly_persistence_threshold": 3,
    "hysteresis_recovery_points": 3,
}


class RiskEngine:
    """Configurable rule-based geotechnical risk engine."""

    @staticmethod
    def get_effective_config(db: Session, mine_id: str) -> Dict[str, Any]:
        """Fetches active risk configuration for mine or returns prototype defaults."""
        db_config = db.query(models.RiskConfiguration).filter(
            models.RiskConfiguration.mine_id == mine_id
        ).first()

        if not db_config:
            return DEFAULT_CONFIG

        return {
            "displacement_warning_mm": db_config.displacement_warning_mm,
            "displacement_critical_mm": db_config.displacement_critical_mm,
            "tilt_critical_mm_per_m": db_config.tilt_critical_mm_per_m,
            "vibration_critical_mm_s": db_config.vibration_critical_mm_s,
            "pore_pressure_critical_kpa": db_config.pore_pressure_critical_kpa,
            "subsidence_rate_critical_mm_day": db_config.subsidence_rate_critical_mm_day,
            "anomaly_persistence_threshold": db_config.anomaly_persistence_threshold,
            "hysteresis_recovery_points": db_config.hysteresis_recovery_points,
        }

    @classmethod
    def evaluate(
        cls,
        db: Session,
        sensor: models.SensorNode,
        telemetry: Dict[str, Any],
        inference_result: Dict[str, Any]
    ) -> Tuple[models.RiskLevel, List[Dict[str, Any]], bool]:
        """
        Evaluates risk for sensor telemetry.
        Returns: (new_risk_level, evidence_triggered_rules, is_sensor_fault)
        """
        config = cls.get_effective_config(db, sensor.mine_id)

        evidence_rules = []
        is_sensor_fault = False

        # 1. Sensor Fault / Data Quality Check
        signal_rssi = float(telemetry.get("signal_rssi_dbm", -65.0) or -65.0)
        battery = float(telemetry.get("battery_percent", 100.0) or 100.0)
        data_quality = inference_result.get("data_quality_status", "VALID")

        if sensor.status == models.RiskLevel.offline or signal_rssi < -110 or battery < 5.0 or data_quality == "RANGE_OUTLIER":
            is_sensor_fault = True
            evidence_rules.append({
                "rule_name": "Sensor Data Fault / Connectivity Loss",
                "measurement": "Signal RSSI / Battery / Sensor Quality",
                "observed_value": f"RSSI: {signal_rssi} dBm, Batt: {battery}%, Quality: {data_quality}",
                "threshold_value": "RSSI > -110 dBm, Batt > 5.0%",
                "unit": "dBm / %",
                "severity": "info",
                "reason": "Communication or hardware sensor fault detected. Does not indicate ground deformation."
            })
            return models.RiskLevel.offline, evidence_rules, True

        # Extract telemetry metrics
        displacement = float(telemetry.get("displacement_mm", 0.0) or 0.0)
        tilt = float(telemetry.get("tilt_mm_per_m", 0.0) or 0.0)
        vibration = float(telemetry.get("vibration_mm_s", 0.0) or 0.0)
        velocity = float(telemetry.get("subsidence_velocity_mm_day", 0.0) or 0.0)
        pore_pressure = float(telemetry.get("pore_pressure_kpa", 0.0) or 0.0)

        critical_triggers = 0
        warning_triggers = 0

        # Rule 1: Critical Displacement
        if displacement >= config["displacement_critical_mm"]:
            critical_triggers += 1
            evidence_rules.append({
                "rule_name": "Critical Ground Displacement Threshold",
                "measurement": "displacement_mm",
                "observed_value": displacement,
                "threshold_value": config["displacement_critical_mm"],
                "unit": "mm",
                "severity": "critical",
                "reason": f"Roof displacement of {displacement} mm exceeds critical limit ({config['displacement_critical_mm']} mm)."
            })
        elif displacement >= config["displacement_warning_mm"]:
            warning_triggers += 1
            evidence_rules.append({
                "rule_name": "Warning Ground Displacement Threshold",
                "measurement": "displacement_mm",
                "observed_value": displacement,
                "threshold_value": config["displacement_warning_mm"],
                "unit": "mm",
                "severity": "warning",
                "reason": f"Displacement of {displacement} mm crossed warning threshold ({config['displacement_warning_mm']} mm)."
            })

        # Rule 2: Subsidence Velocity
        if velocity >= config["subsidence_rate_critical_mm_day"]:
            critical_triggers += 1
            evidence_rules.append({
                "rule_name": "Accelerated Subsidence Velocity",
                "measurement": "subsidence_velocity_mm_day",
                "observed_value": velocity,
                "threshold_value": config["subsidence_rate_critical_mm_day"],
                "unit": "mm/day",
                "severity": "critical",
                "reason": f"Subsidence rate of {velocity} mm/day exceeds safe threshold ({config['subsidence_rate_critical_mm_day']} mm/day)."
            })

        # Rule 3: Tilt Angle
        if tilt >= config["tilt_critical_mm_per_m"]:
            critical_triggers += 1
            evidence_rules.append({
                "rule_name": "Critical Pillar Tilt Rate",
                "measurement": "tilt_mm_per_m",
                "observed_value": tilt,
                "threshold_value": config["tilt_critical_mm_per_m"],
                "unit": "mm/m",
                "severity": "critical",
                "reason": f"Inclinometer tilt of {tilt} mm/m indicates structural inclination anomaly."
            })

        # Rule 4: Microseismic Vibration
        if vibration >= config["vibration_critical_mm_s"]:
            warning_triggers += 1
            evidence_rules.append({
                "rule_name": "Elevated Strata Vibration",
                "measurement": "vibration_mm_s",
                "observed_value": vibration,
                "threshold_value": config["vibration_critical_mm_s"],
                "unit": "mm/s",
                "severity": "warning",
                "reason": f"Vibration level of {vibration} mm/s detected by geophone."
            })

        # Rule 5: Pore Water Pressure
        if pore_pressure >= config["pore_pressure_critical_kpa"]:
            warning_triggers += 1
            evidence_rules.append({
                "rule_name": "High Hydrological Pore Pressure",
                "measurement": "pore_pressure_kpa",
                "observed_value": pore_pressure,
                "threshold_value": config["pore_pressure_critical_kpa"],
                "unit": "kPa",
                "severity": "warning",
                "reason": f"Piezometer pressure of {pore_pressure} kPa indicates groundwater accumulation."
            })

        # Rule 6: ML Anomaly Persistence & Spikes
        is_ml_anomaly = inference_result.get("is_anomaly", False)
        anomaly_score = inference_result.get("anomaly_score", 0.0)

        if is_ml_anomaly:
            # Check recent anomaly history for persistence
            recent_anomalies = db.query(models.AnomalyPrediction).filter(
                models.AnomalyPrediction.sensor_id == sensor.id,
                models.AnomalyPrediction.is_anomaly == True
            ).order_by(models.AnomalyPrediction.timestamp.desc()).limit(5).all()

            persistence_count = len(recent_anomalies) + 1

            if persistence_count >= config["anomaly_persistence_threshold"]:
                warning_triggers += 1
                evidence_rules.append({
                    "rule_name": "Persistent ML Anomaly Window",
                    "measurement": "IsolationForest Anomaly Score",
                    "observed_value": f"{anomaly_score} ({persistence_count} consecutive anomalies)",
                    "threshold_value": f">= {config['anomaly_persistence_threshold']} repeated anomalies",
                    "unit": "anomaly_count",
                    "severity": "warning",
                    "reason": f"ML model detected {persistence_count} repeated statistical anomalies in sensor feature vector."
                })
            else:
                evidence_rules.append({
                    "rule_name": "Isolated ML Anomaly Spike",
                    "measurement": "IsolationForest Anomaly Score",
                    "observed_value": anomaly_score,
                    "threshold_value": "> 0.50 (Model Score)",
                    "unit": "score",
                    "severity": "info",
                    "reason": "Single isolated ML anomaly spike detected. Monitoring for persistence before escalating."
                })

        # 3. Determine Risk Category
        if critical_triggers > 0:
            eval_risk = models.RiskLevel.critical
        elif warning_triggers >= 2 or (warning_triggers >= 1 and is_ml_anomaly):
            eval_risk = models.RiskLevel.warning
        elif warning_triggers == 1 or is_ml_anomaly:
            eval_risk = models.RiskLevel.moderate
        else:
            eval_risk = models.RiskLevel.normal

        # 4. Apply Hysteresis Recovery Rules
        # To downgrade risk from WARNING/CRITICAL back to NORMAL, require N consecutive normal points
        if sensor.status in (models.RiskLevel.critical, models.RiskLevel.warning) and eval_risk == models.RiskLevel.normal:
            recent_normal_points = db.query(models.TelemetryPoint).filter(
                models.TelemetryPoint.sensor_id == sensor.id
            ).order_by(models.TelemetryPoint.timestamp.desc()).limit(config["hysteresis_recovery_points"]).all()

            is_fully_recovered = True
            for pt in recent_normal_points:
                if pt.displacement_mm >= config["displacement_warning_mm"] or pt.vibration_mm_s >= config["vibration_critical_mm_s"]:
                    is_fully_recovered = False
                    break

            if not is_fully_recovered and len(recent_normal_points) < config["hysteresis_recovery_points"]:
                eval_risk = models.RiskLevel.moderate
                evidence_rules.append({
                    "rule_name": "Hysteresis Hold",
                    "measurement": "Recovery Stability Window",
                    "observed_value": f"{len(recent_normal_points)} normal points",
                    "threshold_value": f"{config['hysteresis_recovery_points']} consecutive normal points",
                    "unit": "count",
                    "severity": "info",
                    "reason": "Risk reduction held in WATCH status pending hysteresis stability confirmation."
                })

        return eval_risk, evidence_rules, False
