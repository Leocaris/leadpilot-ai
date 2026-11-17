"""Lead CRUD service — works with MongoDB or in-memory demo data."""
import uuid
import copy
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# In-memory mutable demo store (populated lazily)
_demo_store: Optional[list] = None


def _get_demo_store():
    global _demo_store
    if _demo_store is None:
        from demo_data import DEMO_LEADS
        _demo_store = copy.deepcopy(DEMO_LEADS)
    return _demo_store


def _now_iso():
    return datetime.utcnow().isoformat() + "Z"


def _mongo_doc_to_dict(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


# ── Public API ────────────────────────────────────────────────────────────────


def get_all_leads(search: str = "", priority: str = "", status: str = "") -> list:
    from database import get_leads_collection

    col, use_demo = get_leads_collection()

    if use_demo:
        leads = _get_demo_store()
        result = []
        for lead in leads:
            if search:
                s = search.lower()
                haystack = " ".join(
                    str(lead.get(f, ""))
                    for f in ("name", "email", "company", "requirements")
                ).lower()
                if s not in haystack:
                    continue
            if priority and lead.get("priority", "").upper() != priority.upper():
                continue
            if status and lead.get("status", "").lower() != status.lower():
                continue
            result.append(copy.copy(lead))
        return result

    # MongoDB path
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
            {"requirements": {"$regex": search, "$options": "i"}},
        ]
    if priority:
        query["priority"] = priority.upper()
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}

    docs = list(col.find(query).sort("created_at", -1))
    return [_mongo_doc_to_dict(d) for d in docs]


def get_lead_by_id(lead_id: str) -> Optional[dict]:
    from database import get_leads_collection

    col, use_demo = get_leads_collection()

    if use_demo:
        for lead in _get_demo_store():
            if lead["id"] == lead_id:
                return copy.copy(lead)
        return None

    from bson import ObjectId

    try:
        doc = col.find_one({"_id": ObjectId(lead_id)})
    except Exception:
        doc = col.find_one({"id": lead_id})
    if not doc:
        return None
    return _mongo_doc_to_dict(doc)


def create_lead(data: dict) -> dict:
    from database import get_leads_collection

    col, use_demo = get_leads_collection()
    data.setdefault("status", "New")
    data.setdefault("ai_score", None)
    data.setdefault("priority", None)
    data["created_at"] = _now_iso()

    if use_demo:
        data["id"] = "lead-" + str(uuid.uuid4())[:8]
        _get_demo_store().insert(0, data)
        return copy.copy(data)

    result = col.insert_one(data)
    data["id"] = str(result.inserted_id)
    if "_id" in data:
        del data["_id"]
    return data


def update_lead(lead_id: str, update_data: dict) -> Optional[dict]:
    from database import get_leads_collection

    col, use_demo = get_leads_collection()
    update_data = {k: v for k, v in update_data.items() if v is not None}

    if use_demo:
        store = _get_demo_store()
        for i, lead in enumerate(store):
            if lead["id"] == lead_id:
                store[i].update(update_data)
                return copy.copy(store[i])
        return None

    from bson import ObjectId

    try:
        oid = ObjectId(lead_id)
    except Exception:
        return None
    result = col.find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        return None
    return _mongo_doc_to_dict(result)


def delete_lead(lead_id: str) -> bool:
    from database import get_leads_collection

    col, use_demo = get_leads_collection()

    if use_demo:
        store = _get_demo_store()
        for i, lead in enumerate(store):
            if lead["id"] == lead_id:
                store.pop(i)
                return True
        return False

    from bson import ObjectId

    try:
        oid = ObjectId(lead_id)
    except Exception:
        return False
    result = col.delete_one({"_id": oid})
    return result.deleted_count > 0
