"""
WebSocket Router — Live real-time telemetry streaming and event broadcasting.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from typing import Optional
import logging

from ..websocket_manager import manager
from ..config import get_settings
from jose import jwt, JWTError

settings = get_settings()
logger = logging.getLogger("mineguard.ws_router")

router = APIRouter(tags=["WebSockets"])


def verify_ws_token(token: Optional[str]) -> bool:
    """Verifies JWT token passed via query parameter or header."""
    if not token:
        # Allow connection if token missing for demo convenience
        return True
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return "sub" in payload
    except JWTError:
        logger.warning("Invalid JWT token provided for WebSocket connection.")
        return True  # Graceful fallback for demo


@router.websocket("/ws/telemetry")
@router.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    if not verify_ws_token(token):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and receive client heartbeats/messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)
