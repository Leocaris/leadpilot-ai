import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import httpx
from main import app

async def run_async_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("Testing /health...")
        r = await client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print("  -> Health:", r.json())

        print("Testing /api/leads GET...")
        r = await client.get("/api/leads")
        assert r.status_code == 200, f"Get leads failed: {r.text}"
        leads = r.json().get("leads", [])
        print(f"  -> Total initial leads: {len(leads)}")
        assert len(leads) >= 10, "Expected at least 10 demo leads"

        print("Testing /api/leads POST (Create Lead)...")
        new_lead = {
            "name": "Alex Mercer",
            "email": "alex@mercertech.io",
            "phone": "+1-555-9876",
            "company": "Mercer Technologies",
            "industry": "FinTech",
            "budget": "$75,000",
            "requirements": "Real-time AI lead routing and scoring platform",
            "status": "New",
            "notes": "Urgent timeline"
        }
        r = await client.post("/api/leads", json=new_lead)
        assert r.status_code == 201, f"Create lead failed: {r.text}"
        created = r.json().get("lead")
        created_id = created["id"]
        print(f"  -> Created lead id: {created_id}")

        print("Testing /api/leads/{id} GET...")
        r = await client.get(f"/api/leads/{created_id}")
        assert r.status_code == 200, f"Get lead by id failed: {r.text}"
        assert r.json()["lead"]["name"] == "Alex Mercer"
        print("  -> Found created lead successfully")

        print("Testing /api/leads/{id} PUT (Update Lead)...")
        r = await client.put(f"/api/leads/{created_id}", json={"status": "Qualified", "notes": "Approved for demo"})
        assert r.status_code == 200, f"Update lead failed: {r.text}"
        assert r.json()["lead"]["status"] == "Qualified"
        print("  -> Updated lead status successfully")

        print("Testing /api/ai/qualify...")
        r = await client.post("/api/ai/qualify", json={
            "name": "Alex Mercer",
            "email": "alex@mercertech.io",
            "company": "Mercer Technologies",
            "industry": "FinTech",
            "budget": "$75,000",
            "requirements": "Real-time AI lead routing and scoring platform",
            "notes": "Urgent timeline"
        })
        assert r.status_code == 200, f"Qualify failed: {r.text}"
        qual = r.json().get("qualification", {})
        print(f"  -> Qualification Score: {qual.get('score')}, Priority: {qual.get('priority')}")

        print("Testing /api/ai/followup...")
        r = await client.post("/api/ai/followup", json={
            "name": "Alex Mercer",
            "company": "Mercer Technologies",
            "requirements": "Real-time AI lead routing and scoring platform",
            "priority": "HOT",
            "previous_interaction": "Initial discovery discussion",
            "next_action": "Schedule live architecture review"
        })
        assert r.status_code == 200, f"Followup failed: {r.text}"
        followup = r.json().get("followup", {})
        print(f"  -> Followup Subject: {followup.get('subject')}")

        print("Testing /api/ai/summarize...")
        r = await client.post("/api/ai/summarize", json={
            "conversation": "Client needs CRM AI scoring. Pain point: manual work. Budget is 50k. Wants demo Friday.",
            "customer_name": "Alex",
            "company": "Mercer Technologies"
        })
        assert r.status_code == 200, f"Summarize failed: {r.text}"
        summary = r.json().get("summary", {})
        print(f"  -> Buying Intent: {summary.get('buying_intent')}")

        print("Testing /api/ai/chat...")
        r = await client.post("/api/ai/chat", json={
            "message": "Can you summarize what you can do as a CRM AI assistant?",
            "history": []
        })
        assert r.status_code == 200, f"Chat failed: {r.text}"
        print(f"  -> Chat response received ({len(r.json().get('response', ''))} chars)")

        print("Testing /api/leads/{id} DELETE...")
        r = await client.delete(f"/api/leads/{created_id}")
        assert r.status_code == 200, f"Delete failed: {r.text}"
        print("  -> Lead deleted successfully")

        print("\n==========================================")
        print("ALL BACKEND API TESTS PASSED SUCCESSFULLY! 🚀")
        print("==========================================")

if __name__ == "__main__":
    asyncio.run(run_async_tests())
