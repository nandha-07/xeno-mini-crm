"""
Celery tasks for RFM scoring.

Tasks:
  score_single_customer(customer_id) — triggered after order insert / customer create
  batch_score_customers(customer_ids) — triggered after bulk customer import or order bulk uploads
  batch_score_all_customers()        — nightly Celery Beat job (re-calculates everything)
"""

from __future__ import annotations

import logging
import pandas as pd

from celery_app import app
from config import supabase
from services.rfm_scorer import compute_rfm_scores

logger = logging.getLogger(__name__)


def _fill_org_ids(rows: list[dict], customer_ids: list[str]) -> None:
    """
    Stamp the authoritative org_id onto each score row, looked up from the
    customers table. RFM computation only carries org_id through when a customer
    has completed orders; customers imported without orders would otherwise get
    org_id=None and become invisible to org-scoped dashboard/customer queries.
    """
    org_by_customer: dict[str, str] = {}
    chunk = 200
    for i in range(0, len(customer_ids), chunk):
        ids = customer_ids[i : i + chunk]
        res = supabase.table("customers").select("id, org_id").in_("id", ids).execute()
        for c in (res.data or []):
            if c.get("org_id"):
                org_by_customer[c["id"]] = c["org_id"]
    for r in rows:
        oid = org_by_customer.get(r.get("customer_id"))
        if oid:
            r["org_id"] = oid


def score_customers_sync(customer_ids: list[str]) -> int:
    """
    Compute and upsert RFM scores for a specific list of customers, synchronously.

    This is the single source of truth for scoring a batch. It is safe to call
    directly from a request-side background thread (no Celery broker required)
    and is also what the Celery tasks delegate to. Returns the number of rows
    upserted.
    """
    if not customer_ids:
        return 0

    # Fetch all completed/any orders for these customers (paginated by id chunks)
    orders: list[dict] = []
    cust_chunk_size = 200
    for i in range(0, len(customer_ids), cust_chunk_size):
        chunk_ids = customer_ids[i : i + cust_chunk_size]
        res = supabase.table("orders").select("*").in_("customer_id", chunk_ids).execute()
        if res.data:
            orders.extend(res.data)

    df_orders = pd.DataFrame(orders)
    df_customers = pd.DataFrame([{"id": cid} for cid in customer_ids])

    scores = compute_rfm_scores(df_customers, df_orders)
    if scores.empty:
        return 0

    rows = scores.to_dict(orient="records")
    for r in rows:
        for k, v in r.items():
            if pd.isna(v):
                r[k] = None
            elif k in ("recency_days", "frequency") and r[k] is not None:
                r[k] = int(v)

    # Ensure every row carries the correct org_id (authoritative, from customers).
    _fill_org_ids(rows, customer_ids)

    chunk = 500
    for i in range(0, len(rows), chunk):
        supabase.table("customer_scores").upsert(rows[i : i + chunk], on_conflict="customer_id").execute()
    logger.info(f"Scored {len(rows)} customers (sync).")
    return len(rows)


def fetch_all_rows(table_name: str, select_fields: str = "*", chunk_size: int = 1000) -> list[dict]:
    """
    Fetch all rows from a Supabase table by paginating via range requests.
    Prevents missing data due to PostgREST's default max row limits (usually 1000).
    """
    offset = 0
    all_data: list[dict] = []
    while True:
        try:
            res = (
                supabase.table(table_name)
                .select(select_fields)
                .range(offset, offset + chunk_size - 1)
                .execute()
            )
            data = res.data
            if not data:
                break
            all_data.extend(data)
            if len(data) < chunk_size:
                break
            offset += chunk_size
        except Exception as e:
            logger.error(f"Error paginating table {table_name} at offset {offset}: {e}")
            raise e
    return all_data


@app.task(name="tasks.score_customers.score_single_customer", bind=True, max_retries=3)
def score_single_customer(self, customer_id: str) -> None:
    """Recompute RFM score for a single customer and upsert into customer_scores."""
    try:
        score_customers_sync([customer_id])
        logger.info(f"Successfully re-scored customer {customer_id}.")
    except Exception as exc:
        logger.error(f"Failed to score customer {customer_id}: {exc}")
        raise self.retry(exc=exc, countdown=30)


@app.task(name="tasks.score_customers.batch_score_customers", bind=True, max_retries=3)
def batch_score_customers(self, customer_ids: list[str]) -> None:
    """Recompute RFM scores for a specific list of customers and upsert."""
    if not customer_ids:
        return
    try:
        logger.info(f"Running batch scoring for {len(customer_ids)} customers...")
        score_customers_sync(customer_ids)
    except Exception as exc:
        logger.error(f"Failed batch scoring customers: {exc}")
        raise self.retry(exc=exc, countdown=30)


@app.task(name="tasks.score_customers.batch_score_all_customers", bind=True, max_retries=3)
def batch_score_all_customers(self) -> None:
    """
    Score all customers in bulk. Runs nightly via Celery Beat.
    Fetches all customers + orders from Supabase (paginated), computes RFM, bulk upserts.
    """
    try:
        logger.info("Starting nightly batch scoring for all customers...")
        
        # Paginate to fetch all database records
        customers_data = fetch_all_rows("customers", select_fields="id")
        orders_data = fetch_all_rows("orders", select_fields="*")

        df_customers = pd.DataFrame(customers_data)
        df_orders = pd.DataFrame(orders_data)

        if df_customers.empty or df_orders.empty:
            logger.info("Customers or orders table is empty. Skipping batch scoring.")
            return

        scores = compute_rfm_scores(df_customers, df_orders)

        if scores.empty:
            logger.info("No active scores computed.")
            return

        rows = scores.to_dict(orient="records")
        for r in rows:
            for k, v in r.items():
                if pd.isna(v):
                    r[k] = None
                elif k in ("recency_days", "frequency") and r[k] is not None:
                    r[k] = int(v)

        # Ensure every row carries the correct org_id (authoritative, from customers).
        _fill_org_ids(rows, [r["customer_id"] for r in rows])

        # Upsert in chunks of 500 to avoid payload size constraints on Supabase
        chunk_size = 500
        for i in range(0, len(rows), chunk_size):
            chunk = rows[i : i + chunk_size]
            supabase.table("customer_scores").upsert(chunk, on_conflict="customer_id").execute()

        logger.info(f"Nightly batch scoring complete. Upserted {len(rows)} customer scores.")

    except Exception as exc:
        logger.error(f"Failed nightly batch scoring: {exc}")
        raise self.retry(exc=exc, countdown=60)
