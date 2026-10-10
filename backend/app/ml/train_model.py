"""
MineGuard ML Model Generator & Preprocessing Pipeline
Generates mine_subsidence_synthetic_training_data.csv and trains the IsolationForest
model + StandardScaler pipeline saving artifacts to backend/app/ml/models/.
"""
import os
import json
import joblib
import numpy as np

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "mine_subsidence_synthetic_training_data.csv")

FEATURE_NAMES = [
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

MODEL_VERSION = "IsolationForest-v1.2.0"


def generate_synthetic_dataset(n_samples=2000, anomaly_ratio=0.08):
    """Generates synthetic geotechnical dataset matching sensor telemetry patterns."""
    np.random.seed(42)
    n_anomalies = int(n_samples * anomaly_ratio)
    n_normals = n_samples - n_anomalies

    # Normal distributions
    ultrasonic_distance = np.random.normal(loc=150.0, scale=2.5, size=n_normals)
    accel_x = np.random.normal(loc=0.02, scale=0.05, size=n_normals)
    accel_y = np.random.normal(loc=0.01, scale=0.05, size=n_normals)
    accel_z = np.random.normal(loc=9.81, scale=0.10, size=n_normals)
    gyro_x = np.random.normal(loc=0.0, scale=0.1, size=n_normals)
    gyro_y = np.random.normal(loc=0.0, scale=0.1, size=n_normals)
    gyro_z = np.random.normal(loc=0.0, scale=0.1, size=n_normals)
    tilt_x = np.random.normal(loc=0.1, scale=0.05, size=n_normals)
    tilt_y = np.random.normal(loc=0.1, scale=0.05, size=n_normals)
    tilt_angle = np.sqrt(tilt_x**2 + tilt_y**2)
    temp = np.random.normal(loc=28.5, scale=3.0, size=n_normals)
    humidity = np.random.normal(loc=65.0, scale=8.0, size=n_normals)
    dist_change = np.random.normal(loc=0.02, scale=0.05, size=n_normals)
    vibration_rms = np.random.normal(loc=0.15, scale=0.08, size=n_normals)

    normals = np.column_stack([
        ultrasonic_distance, accel_x, accel_y, accel_z,
        gyro_x, gyro_y, gyro_z, tilt_x, tilt_y, tilt_angle,
        temp, humidity, dist_change, vibration_rms
    ])

    # Anomaly distributions (simulating roof instability, microseismic shifts, subsidence)
    ultrasonic_distance_anom = np.random.normal(loc=120.0, scale=15.0, size=n_anomalies)
    accel_x_anom = np.random.normal(loc=1.5, scale=0.8, size=n_anomalies)
    accel_y_anom = np.random.normal(loc=1.2, scale=0.7, size=n_anomalies)
    accel_z_anom = np.random.normal(loc=12.5, scale=2.0, size=n_anomalies)
    gyro_x_anom = np.random.normal(loc=3.0, scale=1.5, size=n_anomalies)
    gyro_y_anom = np.random.normal(loc=2.8, scale=1.4, size=n_anomalies)
    gyro_z_anom = np.random.normal(loc=2.5, scale=1.2, size=n_anomalies)
    tilt_x_anom = np.random.normal(loc=2.8, scale=1.2, size=n_anomalies)
    tilt_y_anom = np.random.normal(loc=2.5, scale=1.0, size=n_anomalies)
    tilt_angle_anom = np.sqrt(tilt_x_anom**2 + tilt_y_anom**2)
    temp_anom = np.random.normal(loc=35.0, scale=5.0, size=n_anomalies)
    humidity_anom = np.random.normal(loc=85.0, scale=10.0, size=n_anomalies)
    dist_change_anom = np.random.normal(loc=3.5, scale=1.5, size=n_anomalies)
    vibration_rms_anom = np.random.normal(loc=2.5, scale=1.1, size=n_anomalies)

    anomalies = np.column_stack([
        ultrasonic_distance_anom, accel_x_anom, accel_y_anom, accel_z_anom,
        gyro_x_anom, gyro_y_anom, gyro_z_anom, tilt_x_anom, tilt_y_anom, tilt_angle_anom,
        temp_anom, humidity_anom, dist_change_anom, vibration_rms_anom
    ])

    X = np.vstack([normals, anomalies])

    # Shuffle
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    X = X[indices]
    return X


def train_and_save_model():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Generating synthetic geotechnical training dataset...")
    X = generate_synthetic_dataset()

    # Save CSV
    header = ",".join(FEATURE_NAMES)
    np.savetxt(DATASET_PATH, X, delimiter=",", header=header, comments="")
    print(f"Saved synthetic dataset to: {DATASET_PATH}")

    # Scale & train Isolation Forest
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_scaled)

    # Save joblib artifacts
    model_path = os.path.join(MODEL_DIR, "isolation_forest.joblib")
    scaler_path = os.path.join(MODEL_DIR, "scaler.joblib")
    meta_path = os.path.join(MODEL_DIR, "model_meta.json")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    metadata = {
        "model_version": MODEL_VERSION,
        "algorithm": "IsolationForest",
        "n_estimators": 100,
        "contamination": 0.08,
        "feature_names": FEATURE_NAMES,
        "feature_count": len(FEATURE_NAMES),
        "decision_threshold": 0.0,
        "description": "Pre-trained Isolation Forest anomaly detector trained on synthetic geotechnical sensor telemetry.",
        "feature_mapping_notes": {
            "ultrasonic_distance_cm": "Mapped from sensor depth or surface clearance (cm). Default 150.0 cm.",
            "distance_change_cm": "Derived from live displacement_mm / 10.0 (cm).",
            "vibration_rms": "Derived from live vibration_mm_s (mm/s).",
            "tilt_angle_deg": "Calculated vector magnitude of tilt_x_deg and tilt_y_deg."
        }
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model successfully saved to {model_path}")
    print(f"Scaler successfully saved to {scaler_path}")
    print(f"Metadata saved to {meta_path}")


if __name__ == "__main__":
    train_and_save_model()
