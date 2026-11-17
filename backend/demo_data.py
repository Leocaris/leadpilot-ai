"""Demo data for LeadPilot AI — used when MongoDB is unavailable."""
from datetime import datetime, timedelta
import random

def _dt(days_ago=0):
    return (datetime.utcnow() - timedelta(days=days_ago)).isoformat() + "Z"

DEMO_LEADS = [
    {
        "id": "demo-001",
        "name": "Sarah Mitchell",
        "email": "sarah.mitchell@techcorp.io",
        "phone": "+1-555-0101",
        "company": "TechCorp Solutions",
        "industry": "SaaS / Technology",
        "budget": "$50,000 - $100,000",
        "requirements": "We need an enterprise CRM with AI-powered lead scoring, Salesforce migration support, and custom reporting dashboards. Looking to deploy within Q1 next year.",
        "status": "Qualified",
        "ai_score": 92,
        "priority": "HOT",
        "created_at": _dt(2),
        "notes": "Decision maker confirmed. Budget approved. Needs demo with technical team."
    },
    {
        "id": "demo-002",
        "name": "James Okonkwo",
        "email": "james@growthventures.co",
        "phone": "+1-555-0202",
        "company": "Growth Ventures",
        "industry": "Venture Capital",
        "budget": "$20,000 - $50,000",
        "requirements": "Portfolio management system with investor relations tracking and automated reporting for 15 portfolio companies.",
        "status": "Contacted",
        "ai_score": 78,
        "priority": "HOT",
        "created_at": _dt(5),
        "notes": "Follow-up scheduled for next Tuesday. Very interested."
    },
    {
        "id": "demo-003",
        "name": "Priya Sharma",
        "email": "priya.sharma@retail360.in",
        "phone": "+91-98765-43210",
        "company": "Retail360 India",
        "industry": "Retail / E-commerce",
        "budget": "$10,000 - $25,000",
        "requirements": "Customer loyalty program integration with our existing e-commerce platform. Need AI-powered product recommendations and customer segmentation.",
        "status": "New",
        "ai_score": 65,
        "priority": "WARM",
        "created_at": _dt(1),
        "notes": "Referred by existing customer. Evaluating 3 vendors."
    },
    {
        "id": "demo-004",
        "name": "Michael Torres",
        "email": "m.torres@constructpro.com",
        "phone": "+1-555-0303",
        "company": "ConstructPro LLC",
        "industry": "Construction",
        "budget": "$5,000 - $15,000",
        "requirements": "Project management and client communication platform. Field team needs mobile access.",
        "status": "Proposal",
        "ai_score": 58,
        "priority": "WARM",
        "created_at": _dt(8),
        "notes": "Proposal sent. Waiting for board approval."
    },
    {
        "id": "demo-005",
        "name": "Emily Chen",
        "email": "echen@healthbridge.org",
        "phone": "+1-555-0404",
        "company": "HealthBridge NGO",
        "industry": "Healthcare / Non-profit",
        "budget": "Under $5,000",
        "requirements": "Simple donor management and volunteer coordination tool for our small team.",
        "status": "New",
        "ai_score": 32,
        "priority": "COLD",
        "created_at": _dt(3),
        "notes": "Limited budget. May qualify for non-profit discount."
    },
    {
        "id": "demo-006",
        "name": "David Blackwood",
        "email": "david@blackwoodfinancial.com",
        "phone": "+44-20-7946-0123",
        "company": "Blackwood Financial",
        "industry": "Finance / Banking",
        "budget": "$100,000+",
        "requirements": "Fully compliant CRM with GDPR, FCA regulations support. Need audit trails, role-based access, encrypted data storage, and integration with Bloomberg terminal.",
        "status": "Qualified",
        "ai_score": 95,
        "priority": "HOT",
        "created_at": _dt(10),
        "notes": "High-value enterprise deal. Legal review in progress."
    },
    {
        "id": "demo-007",
        "name": "Fatima Al-Rashid",
        "email": "fatima@dubaiprops.ae",
        "phone": "+971-50-123-4567",
        "company": "Dubai Properties Group",
        "industry": "Real Estate",
        "budget": "$25,000 - $75,000",
        "requirements": "Multi-language CRM (English/Arabic) for property sales tracking, virtual tours integration, and automated WhatsApp follow-ups.",
        "status": "Contacted",
        "ai_score": 71,
        "priority": "WARM",
        "created_at": _dt(6),
        "notes": "Interested in demo. Prefers Arabic UI option."
    },
    {
        "id": "demo-008",
        "name": "Liam O'Brien",
        "email": "liam@startuplab.ie",
        "phone": "+353-1-555-0987",
        "company": "StartupLab Ireland",
        "industry": "Startup / Accelerator",
        "budget": "$2,000 - $5,000",
        "requirements": "Basic CRM for startup mentoring program. Tracking 50 startups and 20 mentors.",
        "status": "New",
        "ai_score": 28,
        "priority": "COLD",
        "created_at": _dt(14),
        "notes": "Early stage inquiry. Budget very limited."
    },
    {
        "id": "demo-009",
        "name": "Ana Rodriguez",
        "email": "ana.r@marketingpulse.mx",
        "phone": "+52-55-1234-5678",
        "company": "Marketing Pulse Agency",
        "industry": "Marketing / Advertising",
        "budget": "$15,000 - $30,000",
        "requirements": "Client campaign tracking, ROI reporting, and automated monthly client reports with white-label option for reselling to our clients.",
        "status": "Won",
        "ai_score": 84,
        "priority": "HOT",
        "created_at": _dt(20),
        "notes": "Closed! Contract signed. Onboarding starts next week."
    },
    {
        "id": "demo-010",
        "name": "Raj Patel",
        "email": "raj@manufact.co.in",
        "phone": "+91-80-2345-6789",
        "company": "Manufact Industries",
        "industry": "Manufacturing",
        "budget": "$30,000 - $60,000",
        "requirements": "Supply chain CRM with vendor management, procurement tracking, and integration with SAP ERP system.",
        "status": "Contacted",
        "ai_score": 67,
        "priority": "WARM",
        "created_at": _dt(4),
        "notes": "Technical evaluation pending. SAP integration is a must-have."
    },
]

DEMO_AI_RESPONSES = {
    "qualify": {
        "score": 82,
        "priority": "HOT",
        "reasoning": "This lead demonstrates strong buying intent with specific, well-defined requirements and a clear budget range that aligns with our offering. The company size and industry suggest a high-value, long-term relationship opportunity. Urgency indicators in the requirements suggest an active evaluation cycle.",
        "next_action": "Schedule a 30-minute discovery call within 48 hours. Prepare a customized demo focused on their specific use case and send a capability overview document beforehand.",
        "key_strengths": [
            "Clear and specific requirements provided",
            "Adequate budget range mentioned",
            "Decision-maker appears to be engaged",
            "Defined timeline indicates active buying cycle"
        ],
        "concerns": [
            "Competitive evaluation likely in progress",
            "Integration complexity may require technical pre-sales support"
        ],
        "estimated_deal_size": "$50,000 - $80,000",
        "urgency_level": "High",
        "_demo_mode": True
    },
    "followup": {
        "subject": "Following Up: Custom CRM Solution for [Company] – Next Steps",
        "message": "Hi [Name],\n\nThank you for taking the time to discuss your requirements with us. I wanted to follow up on our conversation and share how LeadPilot AI can specifically address your needs.\n\nBased on what you shared, I believe our platform can deliver exactly what your team needs:\n\n✅ AI-powered lead qualification that reduces manual scoring by 80%\n✅ Automated follow-up workflows tailored to your sales process\n✅ Real-time analytics and conversion tracking\n\nI'd love to schedule a personalized demo at your convenience. I have availability this Thursday 2-4 PM or Friday morning. Would either of those work for you?\n\nIn the meantime, I've attached a one-pager with our enterprise feature overview and a case study from a similar company in your industry.\n\nLooking forward to showing you what's possible!\n\nBest regards,\nThe LeadPilot AI Team\nsales@leadpilot.ai | +1-555-LEADS",
        "tone": "Professional and enthusiastic",
        "call_to_action": "Schedule a personalized demo this week",
        "_demo_mode": True
    },
    "summarize": {
        "summary": "The customer expressed strong interest in an AI-powered CRM solution, primarily driven by their current manual lead tracking inefficiencies. They have a defined budget and a Q1 implementation timeline, indicating an active purchase decision.",
        "requirements": [
            "AI lead scoring and qualification automation",
            "Integration with existing email marketing tools",
            "Custom reporting and analytics dashboard",
            "Mobile app for field sales team",
            "GDPR-compliant data handling"
        ],
        "pain_points": [
            "Current spreadsheet-based tracking is error-prone and time-consuming",
            "Sales team lacks visibility into lead quality before calls",
            "No automated follow-up system leading to missed opportunities"
        ],
        "buying_intent": "High",
        "next_steps": [
            "Send product demo recording by EOD",
            "Schedule live demo with technical team next week",
            "Provide custom pricing proposal based on their team size",
            "Connect them with a reference customer in their industry"
        ],
        "sentiment": "Positive",
        "_demo_mode": True
    }
}
