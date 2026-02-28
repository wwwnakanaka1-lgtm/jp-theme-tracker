"""WebSocket connection manager for real-time data push.

Manages active WebSocket connections and provides broadcast
capabilities for live theme/stock price updates.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Optional

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates.

    Tracks active connections by channel and provides
    methods to broadcast messages to all subscribers
    or specific channels.
    """

    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        channel: str = "default",
    ) -> None:
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            if channel not in self._connections:
                self._connections[channel] = []
            self._connections[channel].append(websocket)
        logger.info(
            f"WebSocket connected: channel={channel}, "
            f"total={self.connection_count(channel)}"
        )

    async def disconnect(
        self,
        websocket: WebSocket,
        channel: str = "default",
    ) -> None:
        """Remove a WebSocket connection from the manager."""
        async with self._lock:
            conns = self._connections.get(channel, [])
            if websocket in conns:
                conns.remove(websocket)
            if not conns and channel in self._connections:
                del self._connections[channel]
        logger.info(f"WebSocket disconnected: channel={channel}")

    def connection_count(self, channel: Optional[str] = None) -> int:
        """Return the number of active connections."""
        if channel:
            return len(self._connections.get(channel, []))
        return sum(len(c) for c in self._connections.values())

    async def broadcast(
        self,
        message: dict[str, Any],
        channel: str = "default",
    ) -> int:
        """Send a JSON message to all connections on a channel.

        Returns the number of successfully delivered messages.
        """
        payload = json.dumps(message, ensure_ascii=False)
        delivered = 0
        dead: list[WebSocket] = []

        for ws in self._connections.get(channel, []):
            try:
                await ws.send_text(payload)
                delivered += 1
            except (WebSocketDisconnect, RuntimeError):
                dead.append(ws)

        for ws in dead:
            await self.disconnect(ws, channel)

        return delivered

    async def send_price_update(
        self,
        theme_id: str,
        data: dict[str, Any],
    ) -> int:
        """Broadcast a price update for a specific theme."""
        message = {
            "type": "price_update",
            "theme_id": theme_id,
            "data": data,
            "timestamp": datetime.now().isoformat(),
        }
        return await self.broadcast(message, channel=f"theme:{theme_id}")


# Global singleton
ws_manager = ConnectionManager()
