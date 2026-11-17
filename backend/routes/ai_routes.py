"""AI-powered API routes for LeadPilot AI."""
from fastapi import APIRouter, HTTPException
from models import (
    QualifyRequest,
    FollowUpRequest,
    SummarizeRequest,
    ChatRequest,
    SaveLeadToolRequest,
    UpdateLeadStatusRequest,
)
from services import ai_service, lead_service

router = APIRouter(tags=["AI"])


@router.post("/ai/qualify")
async def qualify_lead(payload: QualifyRequest):
    """AI lead qualification endpoint."""
    result = await ai_service.qualify_lead(
        name=payload.name,
        email=payload.email,
        company=payload.company,
        industry=payload.industry or "",
        budget=payload.budget or "",
        requirements=payload.requirements,
        notes=payload.notes or "",
    )

    # Optionally persist to DB with AI scores
    saved_lead = None
    if payload.save_to_db:
        lead_data = payload.model_dump(exclude={"save_to_db"})
        lead_data["ai_score"] = result.get("score")
        lead_data["priority"] = result.get("priority")
        saved_lead = lead_service.create_lead(lead_data)

    return {
        "qualification": result,
        "saved_lead": saved_lead,
        "demo_mode": result.get("_demo_mode", False),
    }


@router.post("/ai/followup")
async def generate_followup(payload: FollowUpRequest):
    """Generate a personalized follow-up email."""
    result = await ai_service.generate_followup(
        name=payload.name,
        company=payload.company,
        requirements=payload.requirements,
        priority=payload.priority,
        previous_interaction=payload.previous_interaction or "",
        next_action=payload.next_action or "",
    )
    return {
        "followup": result,
        "demo_mode": result.get("_demo_mode", False),
    }


@router.post("/ai/summarize")
async def summarize_conversation(payload: SummarizeRequest):
    """Summarize a customer conversation."""
    result = await ai_service.summarize_conversation(
        conversation=payload.conversation,
        customer_name=payload.customer_name or "",
        company=payload.company or "",
    )
    return {
        "summary": result,
        "demo_mode": result.get("_demo_mode", False),
    }


@router.post("/ai/chat")
async def chat(payload: ChatRequest):
    """AI Agent chat endpoint."""
    history = [m.model_dump() for m in (payload.history or [])]
    result = await ai_service.chat_with_agent(
        message=payload.message,
        history=history,
        lead_id=payload.lead_id,
    )
    return {
        "response": result.get("response", ""),
        "demo_mode": result.get("_demo_mode", False),
    }


# ── AI Tool Endpoints (Function Calling Backends) ─────────────────────────────

@router.post("/ai/tools/save_lead", status_code=201)
async def tool_save_lead(payload: SaveLeadToolRequest):
    """Backend tool: save a qualified lead to the database."""
    data = payload.model_dump()
    lead = lead_service.create_lead(data)
    return {"success": True, "lead": lead, "message": f"Lead '{payload.name}' saved successfully"}


@router.put("/ai/tools/update_lead_status")
async def tool_update_lead_status(payload: UpdateLeadStatusRequest):
    """Backend tool: update a lead's status."""
    valid_statuses = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )
    updated = lead_service.update_lead(payload.lead_id, {"status": payload.status})
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "lead": updated, "message": f"Status updated to '{payload.status}'"}
