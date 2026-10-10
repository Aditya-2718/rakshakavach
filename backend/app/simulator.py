"""
Demo Telemetry Simulator Engine for MineGuard backend.
Generates bounded, reproducible geotechnical telemetry data for underground coal mines.
Persists generated readings to SQLite DB with data_source = "SIMULATED"
and broadcasts events to WebSocket clients in real-time.
"""
import asyncio
import random
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session
from .database import SessionLocal
from . import models, schemas
from .websocket_manager import manager as ws_manager

logger = logging.getLogger("mineguard.simulator")


class SensorSimulatorEngine:
    def __init__(self):
        self.status: str = "stopped"  # "stopped" | "running" | "paused"
        self.scenario: str = "normal"  # "normal" | "gradual_displacement" | "seismic_burst" | "rapid_subsidence"
        self.mine_id: str = "mine-jharia-blk4"
        self.sector_id: Optional[str] = None
        self.interval_seconds: float = 3.0
        self._task: Optional[asyncio.Task] = None
        self._step_counter: int = 0
        self.last_run_time: Optional[str] = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "scenario": self.scenario,
            "mine_id": self.mine_id,
            "sector_id": self.sector_id,
            "interval_seconds": self.interval_seconds,
            "step_counter": self._step_counter,
            "last_run_time": self.last_run_time,
        }

    async def start(self, mine_id: Optional[str] = None, sector_id: Optional[str] = None, scenario: str = "normal", interval: float = 3.0):
        if mine_id:
            self.mine_id = mine_id
        if sector_id:
            self.sector_id = sector_id
        self.scenario = scenario
        self.interval_seconds = max(1.0, interval)

        if self.status == "running":
            logger.info("Simulator already running; updated configuration.")
            await self._notify_status_change()
            return

        self.status = "running"
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._simulation_loop())
        
        await self._notify_status_change()
        logger.info(f"Simulator started for mine {self.mine_id}, scenario '{self.scenario}'")

    async def pause(self):
        if self.status == "running":
            self.status = "paused"
            await self._notify_status_change()
            logger.info("Simulator paused.")

    async def resume(self):
        if self.status == "paused":
            self.status = "running"
            await self._notify_status_change()
            logger.info("Simulator resumed.")

    async def stop(self):
        self.status = "stopped"
        if self._task and not self._task.done():
            self._task.cancel()
            self._task = None
        await self._notify_status_change()
        logger.info("Simulator stopped.")

    async def set_scenario(self, scenario: str):
        self.scenario = scenario
        await self._notify_status_change()
        logger.info(f"Simulator scenario updated to {scenario}")

    async def reset_demo_data(self):
        """Resets telemetry simulation counter and seeds base data."""
        self._step_counter = 0
        db: Session = SessionLocal()
        try:
            db.query(models.TelemetryPoint).filter(models.TelemetryPoint.data_source == "SIMULATED").delete()
            db.commit()
            logger.info("Reset simulated telemetry points in database.")
        finally:
            db.close()
        await self._notify_status_change()

    async def _notify_status_change(self):
        await ws_manager.broadcast("simulation_status_changed", self.get_status())

    async def _simulation_loop(self):
        logger.info("Simulator loop worker initiated.")
        while self.status != "stopped":
            try:
                if self.status == "running":
                    self._step_counter += 1
                    self.last_run_time = datetime.now(timezone.utc).isoformat()
                    await self._generate_and_process_tick()

                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}", exc_info=True)
                await asyncio.sleep(2.0)
        
        self.status = "stopped"
        logger.info("Simulator loop worker terminated.")

    async def _generate_and_process_tick(self):
        db: Session = SessionLocal()
        try:
            # Query sensors for target mine/sector
            q = db.query(models.SensorNode)
            if self.mine_id:
                q = q.filter(models.SensorNode.mine_id == self.mine_id)
            if self.sector_id:
                q = q.filter(models.SensorNode.sector == self.sector_id)
            
            sensors = q.all()
            if not sensors:
                return

            now = datetime.now(timezone.utc)
            time_label = now.strftime("%H:%M:%S")

            for sensor in sensors:
                # Calculate synthetic sensor drift based on scenario
                disp_delta = 0.0
                tilt_delta = 0.0
                vib_val = round(random.uniform(0.1, 0.8), 2)
                pore_val = round(sensor.pore_pressure_kpa + random.uniform(-0.5, 0.5), 1)

                if self.scenario == "normal":
                    disp_delta = round(random.uniform(-0.05, 0.08), 2)
                    tilt_delta = round(random.uniform(-0.02, 0.02), 2)
                elif self.scenario == "gradual_displacement":
                    disp_delta = round(random.uniform(0.2, 0.6), 2)
                    tilt_delta = round(random.uniform(0.05, 0.15), 2)
                    pore_val += round(random.uniform(1.0, 3.0), 1)
                elif self.scenario == "seismic_burst":
                    disp_delta = round(random.uniform(0.1, 0.3), 2)
                    tilt_delta = round(random.uniform(0.2, 0.5), 2)
                    vib_val = round(random.uniform(4.5, 14.2), 2)
                elif self.scenario == "rapid_subsidence":
                    disp_delta = round(random.uniform(0.8, 1.8), 2)
                    tilt_delta = round(random.uniform(0.3, 0.8), 2)
                    vib_val = round(random.uniform(2.0, 6.0), 2)

                new_disp = round(max(0.0, sensor.displacement_mm + disp_delta), 2)
                new_tilt = round(max(0.0, sensor.tilt_mm_per_m + tilt_delta), 2)
                new_velocity = round(max(0.0, disp_delta * 4.0), 2)

                # Determine status
                old_status = sensor.status
                if new_disp >= sensor.critical_displacement_mm or new_tilt >= 8.0:
                    new_status = models.RiskLevel.critical
                elif new_disp >= sensor.warning_displacement_mm or new_tilt >= 4.0:
                    new_status = models.RiskLevel.warning
                elif new_disp >= 3.0:
                    new_status = models.RiskLevel.moderate
                else:
                    new_status = models.RiskLevel.normal

                # Save telemetry point
                telem_point = models.TelemetryPoint(
                    sensor_id=sensor.id,
                    timestamp=now,
                    time_label=time_label,
                    data_source="SIMULATED",
                    displacement_mm=new_disp,
                    tilt_mm_per_m=new_tilt,
                    vibration_mm_s=vib_val,
                    subsidence_velocity_mm_day=new_velocity,
                    pore_pressure_kpa=pore_val,
                )
                db.add(telem_point)

                # Update live snapshot on sensor
                sensor.displacement_mm = new_disp
                sensor.tilt_mm_per_m = new_tilt
                sensor.vibration_mm_s = vib_val
                sensor.subsidence_velocity_mm_day = new_velocity
                sensor.pore_pressure_kpa = pore_val
                sensor.last_seen = "Just now"

                db.commit()
                db.refresh(telem_point)
                db.refresh(sensor)

                telem_dict = {
                    "displacement_mm": new_disp,
                    "tilt_mm_per_m": new_tilt,
                    "vibration_mm_s": vib_val,
                    "subsidence_velocity_mm_day": new_velocity,
                    "pore_pressure_kpa": pore_val,
                    "signal_rssi_dbm": sensor.signal_rssi_dbm,
                    "battery_percent": sensor.battery_percent
                }

                # Execute Phase 4 ML Inference, Risk Engine, Deduplication, Notification & Alert Pipeline
                from .services.pipeline import process_telemetry_pipeline
                pipeline_res = await process_telemetry_pipeline(db, sensor, telem_dict, telem_point.id, data_source="SIMULATED")

                # Broadcast live telemetry event
                telem_out = schemas.TelemetryPointOut.from_orm_mapped(telem_point)
                await ws_manager.broadcast("telemetry_reading", {
                    "sensorId": sensor.id,
                    "sensorName": sensor.name,
                    "sector": sensor.sector,
                    "mineId": sensor.mine_id,
                    "telemetry": telem_out.model_dump(),
                    "sensorSnapshot": schemas.SensorNodeOut.from_orm_mapped(sensor).model_dump(),
                    "inference": pipeline_res.get("inference"),
                    "riskLevel": pipeline_res.get("risk_level")
                })

        finally:
            db.close()


simulator_engine = SensorSimulatorEngine()
