"""AI service — Gemini integration with demo fallback for LeadPilot AI.

Compatible with google-genai >= 1.0 SDK.
"""
import os
import json
import asyncio
import logging
import random
from typing import Optional, List

logger = logging.getLogger(__name__)

_gemini_client = None
_gemini_model = None
_gemini_demo = None  # None = not yet checked


def get_gemini_client():
    """Return (client, model_name, is_demo). Cached after first call."""
    global _gemini_client, _gemini_model, _gemini_demo

    if _gemini_demo is not None:
        return _gemini_client, _gemini_model, _gemini_demo

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.warning("No Gemini API key — AI running in demo mode")
        _gemini_demo = True
        return None, None, True

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        _gemini_client = client
        _gemini_model = "gemini-2.0-flash"
        _gemini_demo = False
        logger.info("Gemini client initialized with model: %s", _gemini_model)
        return client, _gemini_model, False
    except Exception as exc:
        logger.error("Gemini init failed: %s — using demo mode", exc)
        _gemini_demo = True
        return None, None, True


def _call_gemini(prompt: str) -> str:
    """Synchronous Gemini call. Returns raw text."""
    client, model, _ = get_gemini_client()
    from google import genai
    response = client.models.generate_content(model=model, contents=prompt)
    return response.text


def _extract_json(text: str) -> dict:
    """Strip markdown fences and parse JSON."""
    text = text.strip()
    if "```json" in text:
        text = text.split("```json", 1)[1].split("```", 1)[0].strip()
    elif "```" in text:
        text = text.split("```", 1)[1].split("```", 1)[0].strip()
    # Try to find JSON object if there's leading text
    start = text.find("{")
    if start > 0:
        text = text[start:]
    return json.loads(text)


# ── Lead Qualification ────────────────────────────────────────────────────────

async def qualify_lead(
    name: str, email: str, company: str, industry: str,
    budget: str, requirements: str, notes: str = "",
) -> dict:
    client, model, is_demo = get_gemini_client()

    if is_demo:
        await asyncio.sleep(1.2)
        from demo_data import DEMO_AI_RESPONSES
        result = dict(DEMO_AI_RESPONSES["qualify"])
        result["_demo_mode"] = True
        return result

    prompt = f"""You are an expert B2B sales qualification specialist. Analyze the following lead and return a structured JSON qualification report.

Lead Information:
- Name: {name}
- Company: {company}
- Industry: {industry or 'Not specified'}
- Budget: {budget or 'Not specified'}
- Requirements: {requirements}
- Additional Notes: {notes or 'None'}

Qualification Rules:
- HOT (score 75-100): Strong buying intent, specific requirements, adequate budget, clear urgency
- WARM (score 40-74): Interested but vague requirements, budget unclear, needs more engagement
- COLD (score 0-39): Low intent, insufficient information, mismatched offering

Return ONLY valid JSON with this exact structure:
{{
  "score": <integer 0-100>,
  "priority": "<HOT|WARM|COLD>",
  "reasoning": "<2-3 sentence explanation>",
  "next_action": "<specific recommended action>",
  "key_strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "concerns": ["<concern1>", "<concern2>"],
  "estimated_deal_size": "<e.g. $50,000-$100,000 or Unknown>",
  "urgency_level": "<High|Medium|Low>"
}}"""

    try:
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, _call_gemini, prompt)
        result = _extract_json(text)
        result["_demo_mode"] = False
        return result
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error qualifying lead: %s", exc)
        from demo_data import DEMO_AI_RESPONSES
        fallback = dict(DEMO_AI_RESPONSES["qualify"])
        fallback["_demo_mode"] = True
        fallback["_error"] = "AI response parsing failed — showing demo result"
        return fallback
    except Exception as exc:
        logger.error("Gemini qualify error: %s", exc)
        from demo_data import DEMO_AI_RESPONSES
        fallback = dict(DEMO_AI_RESPONSES["qualify"])
        fallback["_demo_mode"] = True
        fallback["_error"] = str(exc)
        return fallback


# ── Follow-up Generator ───────────────────────────────────────────────────────

async def generate_followup(
    name: str, company: str, requirements: str,
    priority: str, previous_interaction: str, next_action: str,
) -> dict:
    client, model, is_demo = get_gemini_client()

    if is_demo:
        await asyncio.sleep(0.9)
        from demo_data import DEMO_AI_RESPONSES
        result = dict(DEMO_AI_RESPONSES["followup"])
        result["message"] = result["message"].replace("[Name]", name).replace("[Company]", company)
        result["_demo_mode"] = True
        return result

    tone_map = {
        "HOT": "urgent, enthusiastic, and action-oriented",
        "WARM": "friendly, informative, and nurturing",
        "COLD": "professional, educational, and low-pressure",
    }
    tone = tone_map.get(priority.upper(), "professional")

    prompt = f"""You are an expert B2B sales writer. Write a personalized follow-up email.

Customer: {name} at {company}
Requirements: {requirements}
Lead Priority: {priority}
Previous Interaction: {previous_interaction or 'First contact — no prior conversation'}
Recommended Next Action: {next_action or 'Schedule a product demo'}
Email Tone: {tone}

Return ONLY valid JSON:
{{
  "subject": "<compelling email subject line>",
  "message": "<full professional email body — include greeting, value proposition, CTA, sign-off; use \\n for line breaks>",
  "tone": "<tone description>",
  "call_to_action": "<specific CTA phrase>"
}}"""

    try:
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, _call_gemini, prompt)
        result = _extract_json(text)
        result["_demo_mode"] = False
        return result
    except Exception as exc:
        logger.error("Gemini followup error: %s", exc)
        from demo_data import DEMO_AI_RESPONSES
        fallback = dict(DEMO_AI_RESPONSES["followup"])
        fallback["_demo_mode"] = True
        fallback["_error"] = str(exc)
        return fallback


# ── Conversation Summarizer ───────────────────────────────────────────────────

async def summarize_conversation(
    conversation: str, customer_name: str, company: str
) -> dict:
    client, model, is_demo = get_gemini_client()

    if is_demo:
        await asyncio.sleep(0.9)
        from demo_data import DEMO_AI_RESPONSES
        result = dict(DEMO_AI_RESPONSES["summarize"])
        result["_demo_mode"] = True
        return result

    prompt = f"""You are a CRM analyst. Analyze the following customer conversation and extract structured insights.

Customer: {customer_name or 'Unknown'} from {company or 'Unknown Company'}
Conversation:
---
{conversation}
---

Return ONLY valid JSON:
{{
  "summary": "<2-3 sentence executive summary>",
  "requirements": ["<requirement1>", "<requirement2>", "<requirement3>"],
  "pain_points": ["<pain_point1>", "<pain_point2>"],
  "buying_intent": "<High|Medium|Low>",
  "next_steps": ["<step1>", "<step2>", "<step3>"],
  "sentiment": "<Positive|Neutral|Negative>"
}}"""

    try:
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, _call_gemini, prompt)
        result = _extract_json(text)
        result["_demo_mode"] = False
        return result
    except Exception as exc:
        logger.error("Gemini summarize error: %s", exc)
        from demo_data import DEMO_AI_RESPONSES
        fallback = dict(DEMO_AI_RESPONSES["summarize"])
        fallback["_demo_mode"] = True
        fallback["_error"] = str(exc)
        return fallback


# ── AI Agent Chat ─────────────────────────────────────────────────────────────

DEMO_CHAT_REPLIES = [
    "I'm running in **demo mode** (no Gemini API key configured). In production I can: qualify leads in real-time, retrieve and update CRM data, generate personalized follow-up emails, and summarize customer conversations. Add your `GEMINI_API_KEY` to the backend `.env` file to unlock full AI capabilities.",
    "Demo mode active. I can help you qualify leads, update statuses, generate follow-ups, and extract insights from conversations. Configure your Gemini API key to enable live AI responses.",
    "This is a demo response. With a live Gemini key I'd analyze your request, call the appropriate CRM tools (save_lead, update_lead_status, generate_followup), and return actionable insights specific to your data.",
]


def _call_gemini_chat(contents: list, system: str) -> str:
    """Synchronous Gemini chat call."""
    from google import genai
    from google.genai import types
    client, model, _ = get_gemini_client()
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=1024,
        ),
    )
    return response.text


async def chat_with_agent(
    message: str, history: List[dict], lead_id: Optional[str] = None
) -> dict:
    client, model, is_demo = get_gemini_client()

    if is_demo:
        await asyncio.sleep(0.8)
        return {"response": random.choice(DEMO_CHAT_REPLIES), "_demo_mode": True}

    system_instruction = """You are LeadPilot AI, an intelligent CRM assistant for B2B sales teams.

You help with:
1. Qualifying leads — analyze requirements, budget, intent and give a score + priority (HOT/WARM/COLD)
2. Retrieving and summarizing lead information
3. Generating personalized follow-up emails
4. Summarizing customer conversations
5. Providing actionable sales strategy recommendations

Be concise, professional, and actionable. Use markdown formatting for readability."""

    contents = []
    for msg in (history or [])[-12:]:
        role = msg.get("role", "user")
        if role not in ("user", "model"):
            role = "user" if role == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    try:
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, _call_gemini_chat, contents, system_instruction)
        return {"response": text, "_demo_mode": False}
    except Exception as exc:
        logger.error("Gemini chat error: %s", exc)
        return {
            "response": f"⚠️ AI error: {exc}. Please verify your API key configuration.",
            "_demo_mode": False,
            "_error": str(exc),
        }
