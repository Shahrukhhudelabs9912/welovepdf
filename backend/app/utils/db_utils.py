"""MongoDB connection utility for WeLovePDF.

Provides a singleton AsyncIOMotorClient instance with lifecycle management
(connect / disconnect) suitable for FastAPI startup / shutdown events.

Usage::

   from app.utils.db_utils import get_database
   db = get_database()
   user = await db.users.find_one({"email": "test@example.com"})
"""

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

    Also ensures the ``users`` collection exists with a unique email index.
    Called once during FastAPI startup.
    """
    global _client, _db

    _client = AsyncIOMotorClient(settings.MONGO_URL)
    _db = _client[settings.MONGO_DB_NAME]

    # Ensure email uniqueness index on the users collection
    await _db.users.create_index("email", unique=True, background=True)

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