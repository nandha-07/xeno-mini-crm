"""
CRM router — Authentication.

Endpoints:
  POST /auth/org/signup   — register an organization, auto-generate org_id
  POST /auth/org/login    — org_id + password
  POST /auth/admin/login  — fixed admin credentials (demo)

Passwords are hashed with PBKDF2-HMAC-SHA256 (stdlib, no extra deps).
Sessions are client-side (localStorage) — this is a demo-grade auth layer,
not production RBAC. See README §15 scale notes.
"""

from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import requests

from deps import OrgContext, get_org

from config import supabase, settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)

router = APIRouter()

PBKDF2_ITERATIONS = 200_000

# Demo admin credentials (per spec: both "admin")
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"


# ── Password hashing ─────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), PBKDF2_ITERATIONS
    ).hex()
    return f"pbkdf2${PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), salt.encode(), int(iterations)
        ).hex()
        return secrets.compare_digest(candidate, digest)
    except (ValueError, AttributeError):
        return False


def generate_org_id() -> str:
    """Human-friendly org ID like ORB-7F3K2A (unambiguous charset)."""
    alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no I/L/O/0/1
    return "ORB-" + "".join(secrets.choice(alphabet) for _ in range(6))


# ── Models ───────────────────────────────────────────────────────────────────

class OrgSignup(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    customer_size: Optional[str] = None
    turnover: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=128)


class OrgLogin(BaseModel):
    org_id: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class ProfileUpdate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=120)
    customer_size: Optional[str] = None
    turnover: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: Optional[str] = None
    new_password: str = Field(..., min_length=6, max_length=128)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/auth/org/signup", status_code=status.HTTP_201_CREATED)
async def org_signup(body: OrgSignup):
    """Register a new organization and return its generated org_id."""
    try:
        # Generate a unique org_id (retry on the rare collision)
        org_id = generate_org_id()
        for _ in range(5):
            existing = supabase.table("organizations").select("id").eq("org_id", org_id).execute()
            if not existing.data:
                break
            org_id = generate_org_id()

        payload = {
            "org_id": org_id,
            "company_name": body.company_name.strip(),
            "email": body.email.strip().lower(),
            "customer_size": body.customer_size,
            "turnover": body.turnover,
            "city": body.city,
            "country": body.country,
            "website": body.website,
            "password_hash": hash_password(body.password),
        }
        res = supabase.table("organizations").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create organization.")

        org = res.data[0]
        return {
            "org_id": org["org_id"],
            "company_name": org["company_name"],
            "message": f"Organization registered. Your login ID is {org['org_id']} — save it!",
        }

    except HTTPException:
        raise
    except Exception as e:
        msg = str(e)
        if "organizations" in msg and ("PGRST205" in msg or "schema cache" in msg):
            raise HTTPException(
                status_code=503,
                detail="The organizations table is missing. Run crm/db/migrations/002_organizations.sql in the Supabase SQL Editor.",
            )
        logger.error(f"Org signup failed: {e}")
        raise HTTPException(status_code=500, detail=msg)


@router.post("/auth/org/login")
async def org_login(body: OrgLogin):
    """Authenticate an organization by org_id + password."""
    try:
        login_val = body.org_id.strip()
        login_val_upper = login_val.upper()
        login_val_lower = login_val.lower()

        res = (
            supabase.table("organizations")
            .select("*")
            .or_(f"org_id.eq.{login_val_upper},email.eq.{login_val_lower}")
            .execute()
        )
        if not res.data or not verify_password(body.password, res.data[0]["password_hash"]):
            # Same message for unknown org / wrong password (no user enumeration)
            raise HTTPException(status_code=401, detail="Invalid org ID or password.")

        org = res.data[0]
        supabase.table("organizations").update(
            {"last_login_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", org["id"]).execute()

        return {
            "role": "organization",
            "org_id": org["org_id"],
            "org_uuid": org["id"],          # used as X-Org-Id for data scoping
            "company_name": org["company_name"],
            "city": org.get("city"),
            "country": org.get("country"),
            "website": org.get("website"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Org login failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auth/admin/login")
async def admin_login(body: AdminLogin):
    """Authenticate the platform admin (fixed demo credentials)."""
    if body.username == ADMIN_USERNAME and body.password == ADMIN_PASSWORD:
        return {"role": "admin", "username": "admin", "company_name": "Orbit Platform Admin"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials.")

class GoogleLogin(BaseModel):
    token: str

@router.post("/auth/google")
async def google_login(body: GoogleLogin):
    """Authenticate via Google OAuth token."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured on the server.")
    try:
        # JWTs always have exactly two dots (header.payload.signature)
        if body.token.count(".") == 2:
            id_info = id_token.verify_oauth2_token(
                body.token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=3600
            )
            email = id_info.get("email")
            google_id = id_info.get("sub")
            name = id_info.get("name", "Unknown Company")
        else:
            # Handle Access Token
            user_info_response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {body.token}"}
            )
            if not user_info_response.ok:
                raise HTTPException(status_code=400, detail="Invalid Google access token.")
            
            id_info = user_info_response.json()
            email = id_info.get("email")
            google_id = id_info.get("sub")
            name = id_info.get("name", "Unknown Company")
            
        if not email or not google_id:
            raise HTTPException(status_code=400, detail="Invalid Google token payload.")
            
        # Check if user exists by google_id or email
        res = supabase.table("organizations").select("*").eq("email", email).execute()
        
        if res.data:
            org = res.data[0]
            # Update google_id if not set
            if not org.get("google_id"):
                supabase.table("organizations").update({"google_id": google_id}).eq("id", org["id"]).execute()
        else:
            # Create new organization
            org_id = generate_org_id()
            payload = {
                "org_id": org_id,
                "company_name": name,
                "email": email,
                "google_id": google_id,
                # password_hash is no longer required due to our migration
            }
            create_res = supabase.table("organizations").insert(payload).execute()
            if not create_res.data:
                raise HTTPException(status_code=500, detail="Failed to provision organization via Google Auth.")
            org = create_res.data[0]
            
        supabase.table("organizations").update(
            {"last_login_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", org["id"]).execute()

        return {
            "role": "organization",
            "org_id": org["org_id"],
            "org_uuid": org["id"],
            "company_name": org["company_name"],
            "city": org.get("city"),
            "country": org.get("country"),
            "website": org.get("website"),
            "email": org.get("email"),
        }

    except Exception as e:
        logger.error(f"Google login failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google token or user setup failed.")


@router.get("/auth/profile")
async def get_profile(org: OrgContext = Depends(get_org)):
    """Get the current organization's profile details."""
    if org.is_admin:
        # Admin doesn't have a real org, return the first org or a mock
        res = supabase.table("organizations").select(
            "company_name, customer_size, turnover, city, country, website"
        ).limit(1).execute()
        if not res.data:
            return {"company_name": "SISA (Admin)"}
        return res.data[0]

    res = supabase.table("organizations").select(
        "company_name, customer_size, turnover, city, country, website, password_hash"
    ).eq("id", org.org_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    data = res.data[0]
    data["has_password"] = bool(data.pop("password_hash", None))
    return data


@router.put("/auth/profile")
async def update_profile(body: ProfileUpdate, org: OrgContext = Depends(get_org)):
    """Update the current organization's profile details."""
    if org.is_admin:
        # For admin, update the first org
        orgs = supabase.table("organizations").select("id").limit(1).execute()
        if not orgs.data:
            raise HTTPException(status_code=404, detail="No organizations exist to update")
        target_id = orgs.data[0]["id"]
    else:
        target_id = org.org_id

    res = supabase.table("organizations").update({
        "company_name": body.company_name.strip(),
        "customer_size": body.customer_size,
        "turnover": body.turnover,
        "city": body.city,
        "country": body.country,
        "website": body.website,
    }).eq("id", target_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Organization not found or update failed")
    return res.data[0]


@router.post("/auth/password")
async def update_password(body: PasswordUpdate, org: OrgContext = Depends(get_org)):
    """Change the organization's password."""
    if org.is_admin:
        raise HTTPException(status_code=400, detail="Cannot change admin password here")

    # Verify current password
    res = supabase.table("organizations").select("password_hash").eq("id", org.org_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    stored_hash = res.data[0].get("password_hash")
    
    if stored_hash:
        if not body.current_password or not verify_password(body.current_password, stored_hash):
            raise HTTPException(status_code=401, detail="Incorrect current password")
    else:
        # User has no password set (Google OAuth). They can set it without current_password.
        pass
        
    # Update with new password
    new_hash = hash_password(body.new_password)
    update_res = supabase.table("organizations").update({
        "password_hash": new_hash
    }).eq("id", org.org_id).execute()
    
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update password")
        
    return {"message": "Password updated successfully"}


@router.get("/auth/organizations")
async def get_all_organizations(org: OrgContext = Depends(get_org)):
    """Admin only: list all registered organizations."""
    if not org.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    
    res = supabase.table("organizations").select("id, org_id, company_name, city, country").execute()
    return res.data


@router.delete("/auth/organizations/{org_uuid}")
async def delete_organization(org_uuid: str, org: OrgContext = Depends(get_org)):
    """Admin only: delete an organization and all of its tenant data."""
    if not org.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    found = supabase.table("organizations").select("id, company_name").eq("id", org_uuid).execute()
    if not found.data:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Remove tenant-owned rows before the org itself. Deleting customers cascades
    # to their orders / scores / communications; campaigns and segments are
    # scoped by org_id. Each is best-effort so a missing table/column (e.g. a
    # table without org_id) doesn't abort the whole deletion.
    for table in ("communications", "campaigns", "segments", "customers"):
        try:
            supabase.table(table).delete().eq("org_id", org_uuid).execute()
        except Exception as e:
            logger.warning(f"Cleanup of {table} for org {org_uuid} failed: {e}")

    supabase.table("organizations").delete().eq("id", org_uuid).execute()
    logger.info(f"Deleted organization {org_uuid} ({found.data[0].get('company_name')}).")
    return {"deleted": True, "id": org_uuid}


class ContactRequest(BaseModel):
    email: str

@router.post("/auth/contact")
async def contact_request(body: ContactRequest):
    """Save a contact request and email the admin."""
    import uuid
    from services.campaign_sender import send_message
    
    # Try sending an email via channel service
    try:
        await send_message(
            communication_id=str(uuid.uuid4()),
            campaign_id="contact-form",
            customer_id="anonymous",
            channel="email",
            recipient_phone=None,
            recipient_email="nandhakumar0242@gmail.com",
            message=f"New contact request from {body.email}",
            subject="New Lead from Xeno CRM",
            idempotency_key=str(uuid.uuid4()),
            html_body=f"<h3>New Contact Request</h3><p>Someone wants to reach out to you!</p><p>Email: <b>{body.email}</b></p>"
        )
    except Exception as e:
        logger.error(f"Failed to send contact email: {e}")

    # Also save as an organization in Supabase so the admin can see it in the DB
    try:
        payload = {
            "org_id": "LEAD-" + secrets.token_hex(4).upper(),
            "company_name": "CONTACT REQUEST",
            "email": body.email,
        }
        supabase.table("organizations").insert(payload).execute()
    except Exception as e:
        logger.error(f"Failed to save lead to db: {e}")

    return {"message": "Success"}
