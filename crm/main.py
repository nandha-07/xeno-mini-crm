"""
Orbit CRM Service — FastAPI entry point.

Mounts all routers under /api/v1 and configures CORS,
exception handlers, and startup events.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings, supabase

logger = logging.getLogger(__name__)
from routers import (
    analytics,
    auth,
    campaigns,
    copilot,
    customers,
    feedback,
    imports,
    orders,
    receipts,
    reports,
    segments,
    semantic,
    strategist,
    tracking,
    settings as app_settings,
)


def _ping_db() -> None:
    """Lightweight query that forces the Supabase HTTP connection (DNS + TLS) open."""
    supabase.table("organizations").select("id").limit(1).execute()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # Warm the Supabase client at startup so the FIRST user request doesn't pay
    # the ~5s cold-start cost (DNS + TLS handshake + client construction).
    try:
        await asyncio.to_thread(_ping_db)
        logger.info("Supabase connection warmed.")
    except Exception as e:
        logger.warning(f"DB warmup failed (will connect lazily): {e}")

    try:
        yield
    finally:
        pass


app = FastAPI(
    title="Orbit CRM API",
    description="AI-native mini CRM backend for D2C brands.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(customers.router, prefix=PREFIX, tags=["Customers"])
app.include_router(orders.router, prefix=PREFIX, tags=["Orders"])
app.include_router(segments.router, prefix=PREFIX, tags=["Segments"])
app.include_router(campaigns.router, prefix=PREFIX, tags=["Campaigns"])
app.include_router(receipts.router, prefix=PREFIX, tags=["Receipts"])
app.include_router(analytics.router, prefix=PREFIX, tags=["Analytics"])
app.include_router(copilot.router, prefix=PREFIX, tags=["Copilot"])
app.include_router(auth.router, prefix=PREFIX, tags=["Auth"])
app.include_router(imports.router, prefix=PREFIX, tags=["Imports"])
app.include_router(feedback.router, prefix=PREFIX, tags=["Feedback"])
app.include_router(strategist.router, prefix=PREFIX, tags=["Strategist"])
app.include_router(reports.router, prefix=PREFIX, tags=["Reports"])
app.include_router(app_settings.router, prefix=PREFIX, tags=["Settings"])
app.include_router(semantic.router, prefix=PREFIX, tags=["Semantic"])
app.include_router(tracking.router, prefix=PREFIX, tags=["Tracking"])


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "service": "crm"}


@app.get(PREFIX + "/channels/status", tags=["Channels"])
async def channels_status() -> dict:
    """Proxy the channel gateway's configured-channel status for the UI."""
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.CHANNEL_SERVICE_URL}/channels/status")
            return r.json()
    except Exception:
        return {"email": False, "sms": False, "whatsapp": False, "rcs": False}
