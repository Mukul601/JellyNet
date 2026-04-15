"""
JellyNet — proxy_service.py
httpx-based reverse proxy that forwards requests to the supplier's upstream API.
The supplier's decrypted API key replaces the Authorization header.
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# Headers that must be stripped before forwarding to avoid conflicts
_STRIP_HEADERS = {
    "host",
    "x-payment",
    "content-length",
    "transfer-encoding",
    "connection",
}


class ProxyService:
    def __init__(self) -> None:
        # Shared async client — one instance per app lifecycle
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)

    async def forward(
        self,
        target_url: str,
        api_key: str,
        method: str,
        path: str,
        headers: dict,
        body: Optional[bytes],
        query_string: str,
    ) -> httpx.Response:
        """
        Forward a request to the supplier's upstream API.

        - Strips proxy-specific and hop-by-hop headers
        - Injects Authorization: Bearer {api_key}
        - Preserves Content-Type, Accept, and all other safe headers
        - Appends query string unchanged
        """
        # Build clean forward headers
        forward_headers = {
            k: v
            for k, v in headers.items()
            if k.lower() not in _STRIP_HEADERS
        }
        # Inject supplier key as bearer token
        forward_headers["Authorization"] = f"Bearer {api_key}"

        # Construct full upstream URL
        upstream = target_url.rstrip("/")
        if path:
            upstream = f"{upstream}/{path.lstrip('/')}"
        if query_string:
            upstream = f"{upstream}?{query_string}"

        logger.debug(f"Proxying {method} {upstream}")

        response = await self.client.request(
            method=method,
            url=upstream,
            headers=forward_headers,
            content=body,
        )
        return response

    async def close(self) -> None:
        """Close the shared httpx client. Called in FastAPI lifespan shutdown."""
        await self.client.aclose()
