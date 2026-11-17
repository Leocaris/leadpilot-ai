"""Lead CRUD API routes."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models import LeadCreate, LeadUpdate
from services import lead_service

router = APIRouter(tags=["Leads"])


@router.get("/leads")
async def list_leads(
    search: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    leads = lead_service.get_all_leads(
        search=search or "",
        priority=priority or "",
        status=status or "",
    )
    return {"leads": leads, "total": len(leads)}


@router.post("/leads", status_code=201)
async def create_lead(payload: LeadCreate):
    lead = lead_service.create_lead(payload.model_dump())
    return {"lead": lead, "message": "Lead created successfully"}


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str):
    lead = lead_service.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"lead": lead}


@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, payload: LeadUpdate):
    updated = lead_service.update_lead(lead_id, payload.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"lead": updated, "message": "Lead updated successfully"}


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    deleted = lead_service.delete_lead(lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}
