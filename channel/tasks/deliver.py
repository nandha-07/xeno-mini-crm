"""
Celery task — Dual-Mode message delivery.

Can either simulate the full lifecycle of a message (for testing) or 
actually send the message via SMTP / Twilio (for production).
"""

from __future__ import annotations

import logging
import random
import time
from datetime import datetime, timezone

import httpx

from celery_app import app
from config import settings
from senders import send_email, send_twilio

logger = logging.getLogger(__name__)


def _fire_receipt(payload: dict, status: str, reason: str | None = None) -> None:
    base_key = payload["idempotency_key"]
    data = {
        "communication_id": payload["communication_id"],
        "campaign_id": payload["campaign_id"],
        "idempotency_key": f"{base_key}_{status}",
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if reason:
        data["failure_reason"] = reason
    try:
        httpx.post(settings.CRM_RECEIPT_URL, json=data, timeout=15).raise_for_status()
    except Exception as e:  # noqa: BLE001
        logger.warning("Receipt callback failed for %s (%s): %s", payload["communication_id"], status, e)


@app.task(name="tasks.deliver.fire_simulated_event", bind=True, max_retries=2, default_retry_delay=10)
def fire_simulated_event(self, payload: dict, status: str) -> None:
    """Fires a delayed simulated event (opened, clicked)."""
    logger.info(f"Firing simulated {status} for {payload['communication_id']}")
    _fire_receipt(payload, status)


@app.task(name="tasks.deliver.deliver_message", bind=True, max_retries=2, default_retry_delay=20)
def deliver_message(self, payload: dict) -> None:
    """Execute dual-mode delivery: either simulate or send for real."""
    channel = payload.get("channel", "email")
    is_simulated = payload.get("is_simulated", False)
    
    if is_simulated:
        # --- SIMULATED DELIVERY ---
        time.sleep(random.uniform(0.1, 0.3))
        if random.random() < 0.95:
            ok, reason = True, None
        else:
            ok, reason = False, "simulated bounce or blocked number"
            
        _fire_receipt(payload, "delivered" if ok else "failed", reason)
        
        if ok:
            if random.random() < 0.60:
                open_delay = random.uniform(5.0, 15.0)
                fire_simulated_event.apply_async(args=[payload, "opened"], countdown=open_delay)
                if random.random() < 0.30:
                    click_delay = open_delay + random.uniform(5.0, 15.0)
                    fire_simulated_event.apply_async(args=[payload, "clicked"], countdown=click_delay)
    else:
        # --- REAL DELIVERY ---
        if channel == "email":
            ok, reason = send_email(
                to_addr=payload.get("recipient_email") or "",
                subject=payload.get("subject") or "A message for you",
                html_body=payload.get("html_body") or payload.get("message") or "",
                text_body=payload.get("message"),
            )
        elif channel in ("sms", "whatsapp", "rcs"):
            ok, reason = send_twilio(
                channel=channel,
                to_number=payload.get("recipient_phone") or "",
                body=payload.get("message") or "",
            )
        else:
            ok, reason = False, f"unsupported channel: {channel}"

        _fire_receipt(payload, "delivered" if ok else "failed", None if ok else reason)
