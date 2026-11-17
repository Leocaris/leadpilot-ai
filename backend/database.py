"""Database connection manager for LeadPilot AI."""
import os
import logging

logger = logging.getLogger(__name__)

_client = None
_db = None
_use_demo = None


def get_database():
    """Return (db, use_demo). Caches the connection."""
    global _client, _db, _use_demo

    if _use_demo is not None:
        return _db, _use_demo

    mongodb_uri = os.getenv("MONGODB_URI", "")
    db_name = os.getenv("DATABASE_NAME", "leadpilot")

    if (
        not mongodb_uri
        or mongodb_uri == "mongodb+srv://username:password@cluster.mongodb.net/leadpilot"
    ):
        logger.warning("No valid MongoDB URI — running in demo mode")
        _use_demo = True
        return None, True

    try:
        from pymongo import MongoClient

        _client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")
        _db = _client[db_name]
        logger.info("Connected to MongoDB: %s", db_name)
        _use_demo = False
        return _db, False
    except Exception as exc:
        logger.error("MongoDB connection failed: %s — falling back to demo mode", exc)
        _use_demo = True
        return None, True


def get_leads_collection():
    """Return (collection, use_demo)."""
    db, use_demo = get_database()
    if use_demo:
        return None, True
    return db["leads"], False
