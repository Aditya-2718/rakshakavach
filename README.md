# MineGuard — AI/ML, Geotechnical Risk Engine & Early Warning Platform

MineGuard is an enterprise full-stack IoT platform for real-time subsidence monitoring, microseismic hazard assessment, and early warning in underground coal mines.

---

## 1. System Architecture

```text
[ Field Sensors / Hardware Ingress ]   OR   [ Controllable Physics Simulator ]
                  │                                         │
                  └────────────────────┬────────────────────┘
                                       ▼
                  [ FastAPI Ingestion Engine (/api/v1/telemetry/ingest) ]
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
     [ ML Inference Service ]  [ Geotechnical Risk Engine ] [ Notification Service ]
     (IsolationForest v1.2.0)   (Rules & Hysteresis Hold)   (In-App, Email, SMS)
                  │                    │                    │
                  └────────────────────┼────────────────────┘
                                       ▼
                      [ WebSocket Event Broadcast /ws/telemetry ]
                                       │
                                       ▼
                       [ React + TypeScript Dashboard ]
```

---

## 2. ML Anomaly Detection Model Configuration

- **Model Type**: Pre-trained **Isolation Forest** (`IsolationForest-v1.2.0`).
- **Artifact Files**:
  - `backend/app/ml/models/isolation_forest.joblib`
  - `backend/app/ml/models/scaler.joblib`
  - `backend/app/ml/models/model_meta.json`
- **Training Dataset Generator**: `python -m app.ml.train_model` generates `backend/app/ml/mine_subsidence_synthetic_training_data.csv` (2,000 synthetic multi-channel geotechnical samples with 8% contamination).
- **Exact Feature Vector Order (14 Channels)**:
  1. `ultrasonic_distance_cm`: Distance clearance to mine roof or borehole benchmark.
  2. `accel_x_mps2`: X-axis MEMS acceleration dynamics.
  3. `accel_y_mps2`: Y-axis MEMS acceleration dynamics.
  4. `accel_z_mps2`: Z-axis MEMS acceleration dynamics.
  5. `gyro_x_dps`: X-axis angular rate change.
  6. `gyro_y_dps`: Y-axis angular rate change.
  7. `gyro_z_dps`: Z-axis angular rate change.
  8. `tilt_x_deg`: X-component vector inclination angle.
  9. `tilt_y_deg`: Y-component vector inclination angle.
  10. `tilt_angle_deg`: Resultant vector tilt angle ($\sqrt{\text{tilt}_x^2 + \text{tilt}_y^2}$).
  11. `temperature_C`: Borehole ambient temperature.
  12. `humidity_percent`: Relative enclosure humidity.
  13. `distance_change_cm`: Cumulative displacement converted to cm.
  14. `vibration_rms`: Microseismic RMS vibration velocity.

---

## 3. Geotechnical Risk Engine & Rule Definitions

Evaluates sensor telemetry against configurable rules to classify risk into **NORMAL**, **WATCH**, **WARNING**, or **CRITICAL**.

### Default Prototype Thresholds
- `displacement_warning_mm`: 5.0 mm
- `displacement_critical_mm`: 12.0 mm (DGMS Circular No. 6 limit)
- `tilt_critical_mm_per_m`: 5.0 mm/m
- `vibration_critical_mm_s`: 2.0 mm/s
- `pore_pressure_critical_kpa`: 200.0 kPa
- `subsidence_rate_critical_mm_day`: 2.5 mm/day
- `anomaly_persistence_threshold`: 3 repeated anomalies in recent window
- `hysteresis_recovery_points`: 3 consecutive normal readings required before clearing alert hold

> **Geotechnical Notice**: Default thresholds are prototype initial values requiring mine-specific calibration by qualified geotechnical engineers.

---

## 4. Alert Management & Deduplication Strategy

- **Incident Deduplication**: If an incident alert is already `active` or `investigating` for a sensor, subsequent threshold breaches update the current value, append evidence, and increment `dedup_count` without spamming duplicate alerts.
- **Status Lifecycle**: `active` ➔ `acknowledged` ➔ `investigating` ➔ `resolved`.
- **Notification Attempts**: Logged in `notification_attempts` table across `in_app`, `email` (SMTP), and `sms` channels with provider status tracking (`sent`, `simulated`, `failed`).

---

## 5. Subsidence Forecasting Status (LSTM)

- **Status**: **Explicitly Unavailable** (`forecast_available: false`).
- **Requirements**: Multi-step sequence forecasting requires continuous sequence dataset training (minimum 30 days continuous 10-second multi-channel telemetry) and supervised ground-truth subsidence survey markers. In accordance with safety rules, future displacement values are never manufactured.

---

## 6. Development & Testing Commands

### Backend (FastAPI + Python)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
python -m pytest
python -m app.ml.train_model
```

### Frontend (React + Vite)
```bash
npm run dev
npm run build
```

---

## 7. Safety & Regulatory Disclaimers

> **IMPORTANT**: MineGuard is an engineering prototype platform. Isolation Forest anomaly scores represent statistical feature vector divergence, not a deterministic guarantee of ground collapse. Operational emergency evacuations and safety protocols require qualified geotechnical review and DGMS regulatory compliance.
