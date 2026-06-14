import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import supabase
from deps import get_org, OrgContext

router = APIRouter()
logger = logging.getLogger(__name__)

class TicketCreateRequest(BaseModel):
    ticket_type: str
    impact_level: str
    duration: str
    description: str
    point_of_contact: str

@router.post("/tickets")
async def create_ticket(req: TicketCreateRequest, org: OrgContext = Depends(get_org)):
    try:
        org_id = org.require_org()
        res = supabase.table("support_tickets").insert({
            "org_id": org_id,
            "ticket_type": req.ticket_type,
            "impact_level": req.impact_level,
            "duration": req.duration,
            "description": req.description,
            "point_of_contact": req.point_of_contact,
            "status": "open"
        }).execute()
        
        if not res.data:
            raise Exception("No data returned from insert")
            
        return {"success": True, "ticket_id": res.data[0]["id"]}
    except Exception as e:
        logger.error(f"Failed to create support ticket: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit support ticket.")

@router.get("/tickets")
async def list_tickets(org: OrgContext = Depends(get_org)):
    try:
        # If admin, org.scope is a no-op, meaning it fetches all tickets.
        # If org, org.scope adds .eq("org_id", org.org_id)
        
        # We also want to join with the organizations table to get the company name
        # PostgREST syntax for joining foreign tables: `*, organizations(company_name)`
        q = supabase.table("support_tickets").select("*, organizations(company_name)")
        q = org.scope(q)
        q = q.order("created_at", desc=True)
        
        res = q.execute()
        
        # Format the result to flat out the company_name for easier frontend consumption
        tickets = []
        for row in res.data or []:
            tickets.append({
                "id": row.get("id"),
                "org_id": row.get("org_id"),
                "company_name": row.get("organizations", {}).get("company_name", "Unknown"),
                "ticket_type": row.get("ticket_type"),
                "impact_level": row.get("impact_level"),
                "duration": row.get("duration"),
                "description": row.get("description"),
                "point_of_contact": row.get("point_of_contact"),
                "status": row.get("status"),
                "created_at": row.get("created_at"),
            })
            
        return {"tickets": tickets}
    except Exception as e:
        logger.error(f"Failed to fetch tickets: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch support tickets.")
