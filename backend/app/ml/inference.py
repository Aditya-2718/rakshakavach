"""
MineGuard ML Inference Service
Provides safe singleton model loading, feature preprocessing, scaling, and Isolation Forest
anomaly detection inference.
"""
import os
import json
import logging
import joblib
import numpy as np
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
META_PATH = os.path.join(MODEL_DIR, "model_meta.json")

EXPECTED_FEATURES = [
    "ultrasonic_distance_cm",
    "accel_x_mps2",
    "accel_y_mps2",
    "accel_z_mps2",
    "gyro_x_dps",
    "gyro_y_dps",
    "gyro_z_dps",
    "tilt_x_deg",
    "tilt_y_deg",
    "tilt_angle_deg",
    "temperature_C",
    "humidity_percent",
    "distance_change_cm",
    "vibration_rms",
]


class MLInferenceService:
    _instance = None

    def __init__(self):
        self.model = None
        self.scaler = None
        self.meta = {}
        self.model_version = None
        self.is_model_available = False
        self.error_message = None
        self._load_model_artifacts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model_artifacts(self):
        """Loads saved joblib artifacts into memory."""
        try:
            if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
                self.is_model_available = False
                self.error_message = (
                    f"Model artifact missing at {MODEL_PATH}. "
                    "Run 'python -m app.ml.train_model' to generate model artifacts."
                )
                logger.warning(self.error_message)
                return

            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)

            if os.path.exists(META_PATH):
                with open(META_PATH, "r") as f:
                    self.meta = json.load(f)
                self.model_version = self.meta.get("model_version", "IsolationForest-v1.2.0")
            else:
                self.model_version = "IsolationForest-v1.2.0"

            self.is_model_available = True
            self.error_message = None
            logger.info(f"Loaded ML model: {self.model_version}")
        except Exception as e:
            self.is_model_available = False
            self.error_message = f"Failed to load ML model artifact: {str(e)}"
            logger.error(self.error_message, exc_info=True)

    def extract_feature_vector(self, telemetry: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float], str]:
        """
        Maps telemetry measurements to exact 14 features required by Isolation Forest model.
        Returns: (feature_vector_array, feature_dict, quality_status)
        """
        displacement_mm = float(telemetry.get("displacement_mm", 0.0) or 0.0)
        tilt_mm_per_m = float(telemetry.get("tilt_mm_per_m", 0.0) or 0.0)
        vibration_mm_s = float(telemetry.get("vibration_mm_s", 0.0) or 0.0)

        # Preprocessing & transformation mapping
        dist_change_cm = displacement_mm / 10.0
        ultrasonic_dist_cm = max(10.0, 150.0 - dist_change_cm)
        tilt_deg = tilt_mm_per_m * 0.0573
        vibration_rms = vibration_mm_s

        accel_x = 0.02 + (tilt_deg * 0.1)
        accel_y = 0.01 + (tilt_deg * 0.08)
        accel_z = 9.81 + (vibration_rms * 0.2)
        gyro_x = vibration_rms * 0.5
        gyro_y = vibration_rms * 0.4
        gyro_z = vibration_rms * 0.3
        tilt_x = tilt_deg * 0.707
        tilt_y = tilt_deg * 0.707
        tilt_angle = np.sqrt(tilt_x**2 + tilt_y**2)
        temp_c = 28.5
        humidity = 65.0

        feature_dict = {
            "ultrasonic_distance_cm": round(ultrasonic_dist_cm, 3),
            "accel_x_mps2": round(accel_x, 4),
            "accel_y_mps2": round(accel_y, 4),
            "accel_z_mps2": round(accel_z, 4),
            "gyro_x_dps": round(gyro_x, 4),
            "gyro_y_dps": round(gyro_y, 4),
            "gyro_z_dps": round(gyro_z, 4),
            "tilt_x_deg": round(tilt_x, 4),
            "tilt_y_deg": round(tilt_y, 4),
            "tilt_angle_deg": round(tilt_angle, 4),
            "temperature_C": temp_c,
            "humidity_percent": humidity,
            "distance_change_cm": round(dist_change_cm, 3),
            "vibration_rms": round(vibration_rms, 3),
        }

        # Quality status check
        quality_status = "VALID"
        if displacement_mm < -100 or displacement_mm > 500 or vibration_mm_s > 100:
            quality_status = "RANGE_OUTLIER"

        feature_vector = np.array([feature_dict[feat] for feat in EXPECTED_FEATURES]).reshape(1, -1)
        return feature_vector, feature_dict, quality_status

    def predict(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes inference on incoming telemetry data.
        Returns inference dict safely without failing telemetry processing if model is missing or fails.
        """
        if not self.is_model_available:
            return {
                "status": "model_unavailable",
                "error": self.error_message,
                "is_anomaly": False,
                "anomaly_score": 0.0,
                "raw_score": 0.0,
                "model_version": None,
                "feature_vector": {},
                "data_quality_status": "UNCHECKED",
            }

        try:
            vector, feature_dict, quality_status = self.extract_feature_vector(telemetry)
            vector_scaled = self.scaler.transform(vector)

            # IsolationForest decision_function returns negative values for anomalies, positive for normal
            raw_score = float(self.model.decision_function(vector_scaled)[0])
            prediction_label = int(self.model.predict(vector_scaled)[0])  # -1 for anomaly, 1 for normal

            is_anomaly = (prediction_label == -1)

            # Map raw score to normalized anomaly score (0.0 to 1.0)
            # Typically decision_function ranges from -0.3 to +0.3
            anomaly_score = float(1.0 / (1.0 + np.exp(raw_score * 5.0)))

            return {
                "status": "success",
                "is_anomaly": is_anomaly,
                "anomaly_score": round(anomaly_score, 4),
                "raw_score": round(raw_score, 4),
                "model_version": self.model_version,
                "feature_vector": feature_dict,
                "data_quality_status": quality_status,
                "error": None,
            }
        except Exception as e:
            logger.error(f"Inference execution error: {str(e)}", exc_info=True)
            return {
                "status": "inference_error",
                "error": "Internal model inference failure",
                "is_anomaly": False,
                "anomaly_score": 0.0,
                "raw_score": 0.0,
                "model_version": self.model_version,
                "feature_vector": {},
                "data_quality_status": "ERROR",
            }


# Singleton export
inference_service = MLInferenceService.get_instance()
