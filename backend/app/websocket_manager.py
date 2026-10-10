"""
WebSocket Manager — Handles client connection lifecycle and real-time JSON event broadcasting.
"""
from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone
import json
import logging

logger = logging.getLogger("mineguard.websocket")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcast structured JSON event to all connected clients.
        Event schema:
        {
            "type": event_type,
            "timestamp": ISO-8601 UTC string,
            "data": payload
        }
        """
        if not self.active_connections:
            return

        payload = {
            "type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        message = json.dumps(payload)

        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Error sending WebSocket message: {e}")
                disconnected_clients.append(connection)

        for client in disconnected_clients:
            self.disconnect(client)


manager = ConnectionManager()
