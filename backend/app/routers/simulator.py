"""
Simulator Control Router — Provides authenticated REST controls for the demo telemetry simulator.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from pydantic import BaseModel

from .. import models, schemas
from ..auth import get_current_user
from ..simulator import simulator_engine

router = APIRouter(prefix="/simulator", tags=["Simulator"])


class StartSimulationParams(BaseModel):
    mine_id: Optional[str] = "mine-jharia-blk4"
    sector_id: Optional[str] = None
    scenario: str = "normal"  # normal | gradual_displacement | seismic_burst | rapid_subsidence
    interval: float = 3.0


class ScenarioParams(BaseModel):
    scenario: str


class ResetParams(BaseModel):
    confirm: bool = False


@router.get("/status")
def get_simulator_status(current_user: models.User = Depends(get_current_user)):
    return simulator_engine.get_status()


@router.post("/start")
async def start_simulator(
    body: StartSimulationParams,
    current_user: models.User = Depends(get_current_user),
):
    await simulator_engine.start(
        mine_id=body.mine_id,
        sector_id=body.sector_id,
        scenario=body.scenario,
        interval=body.interval,
    )
    return {"message": "Simulator started", "config": simulator_engine.get_status()}


@router.post("/pause")
async def pause_simulator(current_user: models.User = Depends(get_current_user)):
    await simulator_engine.pause()
    return {"message": "Simulator paused", "config": simulator_engine.get_status()}


@router.post("/resume")
async def resume_simulator(current_user: models.User = Depends(get_current_user)):
    await simulator_engine.resume()
    return {"message": "Simulator resumed", "config": simulator_engine.get_status()}


@router.post("/stop")
async def stop_simulator(current_user: models.User = Depends(get_current_user)):
    await simulator_engine.stop()
    return {"message": "Simulator stopped", "config": simulator_engine.get_status()}


@router.post("/scenario")
async def change_scenario(
    body: ScenarioParams,
    current_user: models.User = Depends(get_current_user),
):
    await simulator_engine.set_scenario(body.scenario)
    return {"message": f"Scenario changed to {body.scenario}", "config": simulator_engine.get_status()}


@router.post("/reset")
async def reset_simulator(
    body: ResetParams,
    current_user: models.User = Depends(get_current_user),
):
    if not body.confirm:
        raise HTTPException(
            status_code=400,
            detail="Explicit confirmation required. Send {'confirm': true} to reset simulated telemetry data.",
        )
    await simulator_engine.reset_demo_data()
    return {"message": "Simulated telemetry dataset reset cleanly", "config": simulator_engine.get_status()}
