import os
import pathlib
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import dotenv

from deps import OrgContext, get_org

logger = logging.getLogger(__name__)

router = APIRouter()

# Define the paths to our .env files
CRM_DIR = pathlib.Path(__file__).parent.parent
ROOT_DIR = CRM_DIR.parent
CRM_ENV_FILE = CRM_DIR / ".env"
CHANNEL_ENV_FILE = ROOT_DIR / "channel" / ".env"
FRONTEND_ENV_FILE = ROOT_DIR / "frontend" / ".env.local"

class EnvSettings(BaseModel):
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    smtp_server: Optional[str] = None
    smtp_port: Optional[str] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None


@router.get("/settings/env", response_model=EnvSettings)
async def get_env_settings(org: OrgContext = Depends(get_org)):
    """Fetch current settings from .env files."""
    
    # Ensure role is admin to view keys
    if not org.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view environment settings.")

    # Read CRM env
    crm_env = dotenv.dotenv_values(CRM_ENV_FILE)
    # Read Channel env
    channel_env = dotenv.dotenv_values(CHANNEL_ENV_FILE)
    # Read Frontend env
    frontend_env = dotenv.dotenv_values(FRONTEND_ENV_FILE)

    return EnvSettings(
        supabase_url=crm_env.get("SUPABASE_URL", ""),
        supabase_service_key=crm_env.get("SUPABASE_SERVICE_KEY", ""),
        supabase_anon_key=frontend_env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
        groq_api_key=crm_env.get("GROQ_API_KEY", ""),
        twilio_account_sid=channel_env.get("TWILIO_ACCOUNT_SID", ""),
        twilio_auth_token=channel_env.get("TWILIO_AUTH_TOKEN", ""),
        twilio_phone_number=channel_env.get("TWILIO_PHONE_NUMBER", ""),
        smtp_server=channel_env.get("SMTP_SERVER", ""),
        smtp_port=channel_env.get("SMTP_PORT", ""),
        smtp_username=channel_env.get("SMTP_USERNAME", ""),
        smtp_password=channel_env.get("SMTP_PASSWORD", ""),
        smtp_from_email=channel_env.get("SMTP_FROM_EMAIL", ""),
    )


@router.put("/settings/env")
async def update_env_settings(body: EnvSettings, org: OrgContext = Depends(get_org)):
    """Update settings in .env files."""
    
    if not org.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can edit environment settings.")

    def set_key(file_path: pathlib.Path, key: str, value: Optional[str]):
        if value is not None:
            # Ensure the file exists
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.touch(exist_ok=True)
            dotenv.set_key(str(file_path), key, value)

    # CRM Env
    set_key(CRM_ENV_FILE, "SUPABASE_URL", body.supabase_url)
    set_key(CRM_ENV_FILE, "SUPABASE_SERVICE_KEY", body.supabase_service_key)
    set_key(CRM_ENV_FILE, "GROQ_API_KEY", body.groq_api_key)

    # Channel Env
    set_key(CHANNEL_ENV_FILE, "TWILIO_ACCOUNT_SID", body.twilio_account_sid)
    set_key(CHANNEL_ENV_FILE, "TWILIO_AUTH_TOKEN", body.twilio_auth_token)
    set_key(CHANNEL_ENV_FILE, "TWILIO_PHONE_NUMBER", body.twilio_phone_number)
    set_key(CHANNEL_ENV_FILE, "SMTP_SERVER", body.smtp_server)
    set_key(CHANNEL_ENV_FILE, "SMTP_PORT", body.smtp_port)
    set_key(CHANNEL_ENV_FILE, "SMTP_USERNAME", body.smtp_username)
    set_key(CHANNEL_ENV_FILE, "SMTP_PASSWORD", body.smtp_password)
    set_key(CHANNEL_ENV_FILE, "SMTP_FROM_EMAIL", body.smtp_from_email)

    # Frontend Env
    set_key(FRONTEND_ENV_FILE, "NEXT_PUBLIC_SUPABASE_URL", body.supabase_url)
    set_key(FRONTEND_ENV_FILE, "NEXT_PUBLIC_SUPABASE_ANON_KEY", body.supabase_anon_key)

    return {"message": "Environment settings updated successfully."}
