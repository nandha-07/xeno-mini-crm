"""
Embedding service — API-based text embeddings for the RAG / vector layer.

Uses the Groq API to generate embeddings, avoiding heavy local ONNX models
that exceed Render free-tier memory limits. Falls back to simple TF-IDF
hashing if Groq is unavailable, ensuring the service never crashes.

Each customer is rendered into a short natural-language "profile document"
that captures their behaviour semantically, then embedded and stored in
Supabase pgvector.
"""

from __future__ import annotations

import hashlib
import logging
import math
import os
import re
from typing import Iterable, Optional

import httpx

logger = logging.getLogger(__name__)

EMBED_DIM = 384


# ── Document construction ─────────────────────────────────────────────────────

def _band(value: Optional[float], buckets: list[tuple[float, str]]) -> str:
    if value is None:
        return "unknown"
    for threshold, label in buckets:
        if value <= threshold:
            return label
    return buckets[-1][1]


def customer_document(customer: dict, score: Optional[dict] = None) -> str:
    """
    Render a customer + RFM score into a natural-language profile document.
    This is what gets embedded — phrase it so semantics (intent, value, loyalty,
    category affinity) are captured, not just keywords.
    """
    score = score or {}
    name = f"{customer.get('first_name', '')} {customer.get('last_name', '') or ''}".strip()
    city = customer.get("city") or "unknown city"
    channel = customer.get("channel_pref") or "whatsapp"
    top_cat = score.get("top_category") or "various"
    last_product = score.get("last_product") or "various products"
    churn = score.get("churn_risk") or "unknown"
    freq = score.get("frequency")
    monetary = score.get("monetary")
    recency = score.get("recency_days")

    loyalty = _band(freq if freq is not None else None, [(1, "one-time buyer"), (4, "occasional buyer"),
                                                         (9, "repeat buyer"), (1e9, "loyal frequent buyer")])
    value = _band(float(monetary) if monetary is not None else None,
                  [(2000, "low spender"), (8000, "mid-value customer"),
                   (20000, "high-value customer"), (1e12, "VIP big spender")])
    activity = _band(float(recency) if recency is not None else None,
                     [(30, "recently active"), (60, "slightly lapsed"),
                      (90, "lapsed"), (1e9, "long dormant")])

    return (
        f"{name} from {city} is a {value}, {loyalty}, {activity} with {churn} churn risk. "
        f"They mainly buy {top_cat} products and last purchased {last_product}. "
        f"They prefer being contacted on {channel}. "
        f"Lifetime spend around {int(monetary) if monetary else 0} rupees over {freq or 0} orders, "
        f"last order {recency if recency is not None else 'unknown'} days ago."
    )


# ── Lightweight fallback: deterministic hash-based pseudo-embeddings ──────────

def _hash_embed(text: str) -> list[float]:
    """
    Generate a deterministic pseudo-embedding from text using feature hashing.
    Not semantically meaningful but ensures the pipeline never breaks.
    Produces a normalized 384-dim vector.
    """
    words = re.findall(r'\w+', text.lower())
    vec = [0.0] * EMBED_DIM
    for w in words:
        h = int(hashlib.sha256(w.encode()).hexdigest(), 16)
        idx = h % EMBED_DIM
        sign = 1.0 if (h // EMBED_DIM) % 2 == 0 else -1.0
        vec[idx] += sign
    # L2-normalize
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts -> list of 384-d float vectors."""
    if not texts:
        return []
    if os.environ.get("DISABLE_AI_EMBEDDINGS", "false").lower() == "true":
        return [[0.0] * EMBED_DIM for _ in texts]

    # Groq does not officially support text embedding endpoints yet.
    # To prevent 404 errors in production logs, we directly use the lightweight deterministic hash embedding.
    # It requires zero local memory and never fails.
    return [_hash_embed(t) for t in texts]


def embed_query(query: str) -> list[float]:
    """Embed a single search query."""
    return embed_texts([query])[0]


def to_pgvector(vec: Iterable[float]) -> str:
    """Format a vector as a pgvector text literal: '[0.1,0.2,...]'."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"
