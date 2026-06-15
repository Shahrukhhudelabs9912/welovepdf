"""MongoDB connection utility for WeLovePDF.

Provides a singleton AsyncIOMotorClient instance with lifecycle management
(connect / disconnect) suitable for FastAPI startup / shutdown events.

Usage::

   from app.utils.db_utils import get_database
   db = get_database()
   user = await db.users.find_one({"email": "test@example.com"})
"""

# ---------------------------------------------------------------------------
# Force dnspython to use public DNS resolvers so that mongodb+srv:// SRV
# resolution works even when the local / corporate DNS is not compatible
# with dnspython's internal resolver (a known edge-case with pymongo).
# ---------------------------------------------------------------------------
import dns.resolver as _dns_resolver

_default_resolver = _dns_resolver.get_default_resolver()
_default_resolver.nameservers = ["8.8.8.8", "8.8.4.4"]
# ---------------------------------------------------------------------------

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

__all__ = ["get_database", "connect_to_mongo", "close_mongo_connection"]

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the current MongoDB database handle.

    Raises RuntimeError if :func:`connect_to_mongo` hasn't been called yet.
    """
    if _db is None:
        raise RuntimeError(
            "MongoDB is not connected. Call connect_to_mongo() during startup."
        )
    return _db


async def connect_to_mongo() -> None:
    """Create the Motor client and connect to the configured database.

    Also ensures indexes on core collections.
    Called once during FastAPI startup.
    """
    global _client, _db

    _client = AsyncIOMotorClient(settings.MONGO_URL)
    _db = _client[settings.MONGO_DB_NAME]

    # Ensure email uniqueness index on the users collection
    await _db.users.create_index("email", unique=True, background=True)

    # AI history collection indexes
    await _db.ai_history.create_index([("user_id", 1), ("created_at", -1)], background=True)

    # User activity / usage tracking indexes
    await _db.user_activity.create_index([("user_id", 1), ("timestamp", -1)], background=True)
    await _db.user_activity.create_index(
        [("user_id", 1), ("action", 1), ("timestamp", -1)], background=True
    )

    # Ping to verify connectivity
    await _client.admin.command("ping")
    print(f"[MongoDB] Connected to '{settings.MONGO_DB_NAME}' at {settings.MONGO_URL}")


async def close_mongo_connection() -> None:
    """Gracefully close the MongoDB connection.

    Called once during FastAPI shutdown.
    """
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("[MongoDB] Connection closed.")