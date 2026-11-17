"""Pydantic models for LeadPilot AI."""
from pydantic import BaseModel, Field
from typing import Optional, List


class LeadCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    company: str
    industry: Optional[str] = ""
    budget: Optional[str] = ""
    requirements: str
    status: Optional[str] = "New"
    notes: Optional[str] = ""


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[str] = None
    ai_score: Optional[int] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class Lead(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    company: str
    industry: Optional[str] = ""
    budget: Optional[str] = ""
    requirements: str
    status: str = "New"
    ai_score: Optional[int] = None
    priority: Optional[str] = None
    created_at: str
    notes: Optional[str] = ""


class QualifyRequest(BaseModel):
    name: str
    email: str
    company: str
    industry: Optional[str] = ""
    budget: Optional[str] = ""
    requirements: str
    phone: Optional[str] = ""
    notes: Optional[str] = ""
    save_to_db: Optional[bool] = False


class QualifyResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    priority: str
    reasoning: str
    next_action: str
    key_strengths: List[str]
    concerns: List[str]
    estimated_deal_size: Optional[str] = ""
    urgency_level: str


class FollowUpRequest(BaseModel):
    name: str
    company: str
    requirements: str
    priority: str
    previous_interaction: Optional[str] = ""
    next_action: Optional[str] = ""


class FollowUpResponse(BaseModel):
    subject: str
    message: str
    tone: str
    call_to_action: str


class SummarizeRequest(BaseModel):
    conversation: str
    customer_name: Optional[str] = ""
    company: Optional[str] = ""


class SummarizeResponse(BaseModel):
    summary: str
    requirements: List[str]
    pain_points: List[str]
    buying_intent: str
    next_steps: List[str]
    sentiment: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    lead_id: Optional[str] = None


class SaveLeadToolRequest(BaseModel):
    name: str
    email: str
    company: str
    requirements: str
    score: int
    priority: str
    industry: Optional[str] = ""
    budget: Optional[str] = ""


class UpdateLeadStatusRequest(BaseModel):
    lead_id: str
    status: str
