"""Authentication service for WeLovePDF API.

Provides JWT token generation, password hashing, user CRUD operations,
and persistent MongoDB-based user storage.

All database-facing functions are async and use Motor (async MongoDB driver).
Password hashing and JWT utilities remain synchronous (CPU-bound).
"""

import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.config import settings
from app.utils.db_utils import get_database

# Password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Password Utilities (synchronous — CPU-bound, no I/O)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_strength(password: str) -> None:
    """Validate password strength. Raises HTTPException(400) if weak."""
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter.",
        )
    if not any(c.islower() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter.",
        )
    if not any(c.isdigit() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one digit.",
        )


# ---------------------------------------------------------------------------
# JWT Token Utilities (synchronous — CPU-bound, no I/O)
# ---------------------------------------------------------------------------

def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a signed JWT refresh token (longer-lived)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate an access token. Raises HTTPException(401) if invalid."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )


def decode_refresh_token(token: str) -> dict:
    """Decode and validate a refresh token. Raises HTTPException(401) if invalid."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )


# ---------------------------------------------------------------------------
# MongoDB User Collection helpers
# ---------------------------------------------------------------------------

def _users_collection():
    """Return the MongoDB users collection."""
    return get_database().users


def _sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    """Return a safe copy of the user dict without sensitive fields."""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "is_active": user.get("is_active", True),
        "is_verified": user.get("is_verified", False),
        "created_at": user.get("created_at"),
        # Subscription / usage fields
        "subscription_plan": user.get("subscription_plan", "free"),
        "subscription_status": user.get("subscription_status", "inactive"),
        "daily_usage": user.get("daily_usage", {}),
        "max_free_daily_analyses": user.get("max_free_daily_analyses", 3),
        "max_free_reports": user.get("max_free_reports", 1),
        "trial_ends_at": user.get("trial_ends_at"),
    }


def _user_from_db(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a MongoDB document to internal user dict (with 'id' for backward compat)."""
    doc["id"] = str(doc["_id"])
    return doc


# ---------------------------------------------------------------------------
# User CRUD Operations (async — MongoDB I/O)
# ---------------------------------------------------------------------------

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Look up a user by email (case-insensitive)."""
    email_lower = email.lower().strip()
    doc = await _users_collection().find_one({"email": email_lower})
    if doc is None:
        return None
    return _user_from_db(doc)


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Look up a user by their MongoDB _id string."""
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    doc = await _users_collection().find_one({"_id": oid})
    if doc is None:
        return None
    return _user_from_db(doc)


async def create_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
    """Create a new user and persist to MongoDB.

    Args:
        email: User's email address
        password: Plain-text password (will be hashed)
        full_name: User's display name

    Returns:
        Sanitized user dictionary (without password hash)

    Raises:
        HTTPException(409) if email already registered
    """
    email = email.lower().strip()

    # Check for existing user
    existing = await _users_collection().find_one({"email": email})
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    validate_password_strength(password)

    now = datetime.now(timezone.utc)
    hashed = hash_password(password)

    doc = {
        "email": email,
        "password_hash": hashed,
        "full_name": full_name.strip(),
        "is_active": True,
        "is_verified": False,
        "created_at": now,
        "updated_at": now,
        "reset_token": None,
        "reset_token_expires": None,
        # Subscription / usage tracking fields
        "subscription_plan": "free",
        "subscription_status": "active",
        "daily_usage": {
            "ai_analyses": 0,
            "reports": 0,
            "date": now.strftime("%Y-%m-%d"),
        },
        "max_free_daily_analyses": 3,
        "max_free_reports": 1,
        "trial_ends_at": None,
    }

    result = await _users_collection().insert_one(doc)
    doc["_id"] = result.inserted_id

    return _sanitize_user(doc)


async def update_user_password(user_id: str, new_password: str) -> Dict[str, Any]:
    """Update a user's password. Returns sanitized user dict."""
    from bson import ObjectId

    validate_password_strength(new_password)

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    now = datetime.now(timezone.utc)
    result = await _users_collection().find_one_and_update(
        {"_id": oid},
        {
            "$set": {
                "password_hash": hash_password(new_password),
                "reset_token": None,
                "reset_token_expires": None,
                "updated_at": now,
            }
        },
        return_document=True,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return _sanitize_user(result)


async def set_reset_token(email: str) -> str:
    """Generate and store a password reset token for a user. Returns the token."""
    email = email.lower().strip()

    token = _generate_reset_token()
    # Token valid for 1 hour
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    result = await _users_collection().find_one_and_update(
        {"email": email, "is_active": True},
        {"$set": {"reset_token": token, "reset_token_expires": expires}},
    )

    # Don't reveal whether the email exists — always return a token
    if result is None:
        # Generate a dummy token to prevent email enumeration
        return _generate_reset_token()

    return token


async def get_user_by_reset_token(token: str) -> Optional[Dict[str, Any]]:
    """Find a user by their valid (non-expired) reset token."""
    now = datetime.now(timezone.utc)

    doc = await _users_collection().find_one({"reset_token": token})

    if doc is None:
        return None

    expires = doc.get("reset_token_expires")
    if expires is not None:
        # MongoDB stores datetimes without timezone — make offset-aware for comparison
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if now >= expires:
            # Token expired — clear it
            await _users_collection().update_one(
                {"_id": doc["_id"]},
                {"$set": {"reset_token": None, "reset_token_expires": None}},
            )
            return None

    return _user_from_db(doc)


async def update_user_profile(user_id: str, full_name: str) -> Dict[str, Any]:
    """Update a user's full_name. Returns sanitized user dict."""
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    now = datetime.now(timezone.utc)
    result = await _users_collection().find_one_and_update(
        {"_id": oid},
        {"$set": {"full_name": full_name.strip(), "updated_at": now}},
        return_document=True,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return _user_from_db(result)


# ---------------------------------------------------------------------------
# Subscription / Daily Usage Helpers
# ---------------------------------------------------------------------------


async def get_daily_usage(user_id: str) -> dict:
    """Get the current daily usage counters for a user.

    Resets counters automatically if the stored date doesn't match today.
    """
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return {"ai_analyses": 0, "reports": 0}

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user = await _users_collection().find_one({"_id": oid})

    if user is None:
        return {"ai_analyses": 0, "reports": 0}

    daily_usage = user.get("daily_usage", {})
    stored_date = daily_usage.get("date")

    if stored_date != today:
        # Reset counters for the new day
        daily_usage = {"ai_analyses": 0, "reports": 0, "date": today}
        await _users_collection().update_one(
            {"_id": oid},
            {"$set": {"daily_usage": daily_usage}},
        )

    return daily_usage


async def increment_daily_usage(
    user_id: str,
    usage_type: str = "ai_analyses",
) -> dict:
    """Increment a daily usage counter for a user.

    Args:
        user_id: The user's MongoDB ObjectId string.
        usage_type: One of ``"ai_analyses"`` or ``"reports"``.

    Returns:
        The updated ``daily_usage`` dict.
    """
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return {"ai_analyses": 0, "reports": 0}

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user = await _users_collection().find_one({"_id": oid})

    if user is None:
        return {"ai_analyses": 0, "reports": 0}

    daily_usage = user.get("daily_usage", {})
    stored_date = daily_usage.get("date")

    if stored_date != today:
        # Reset and set to 1
        daily_usage = {"ai_analyses": 0, "reports": 0, "date": today}
        daily_usage[usage_type] = 1
    else:
        daily_usage[usage_type] = daily_usage.get(usage_type, 0) + 1

    await _users_collection().update_one(
        {"_id": oid},
        {"$set": {"daily_usage": daily_usage}},
    )

    return daily_usage


async def check_usage_limit(
    user_id: str,
    usage_type: str = "ai_analyses",
) -> bool:
    """Check if a user has remaining daily usage for the given type.

    Returns ``True`` if the user can proceed (within limit),
    ``False`` if the limit is exceeded.
    """
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return False

    user = await _users_collection().find_one({"_id": oid})
    if user is None:
        return False

    subscription_plan = user.get("subscription_plan", "free")

    # Pro plans have no daily limit
    if subscription_plan in ("pro", "pro_yearly", "enterprise"):
        return True

    daily_usage = await get_daily_usage(user_id)
    max_free = user.get("max_free_daily_analyses", 3) if usage_type == "ai_analyses" else user.get("max_free_reports", 1)

    current = daily_usage.get(usage_type, 0)
    return current < max_free


async def get_usage_remaining(user_id: str) -> dict:
    """Return remaining usage for each type for the current user."""
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return {"ai_analyses": 0, "reports": 0, "plan": "free"}

    user = await _users_collection().find_one({"_id": oid})
    if user is None:
        return {"ai_analyses": 0, "reports": 0, "plan": "free"}

    subscription_plan = user.get("subscription_plan", "free")
    if subscription_plan in ("pro", "pro_yearly", "enterprise"):
        return {"ai_analyses": -1, "reports": -1, "plan": subscription_plan}  # -1 = unlimited

    daily_usage = await get_daily_usage(user_id)
    max_analyses = user.get("max_free_daily_analyses", 3)
    max_reports = user.get("max_free_reports", 1)

    return {
        "ai_analyses": max(0, max_analyses - daily_usage.get("ai_analyses", 0)),
        "reports": max(0, max_reports - daily_usage.get("reports", 0)),
        "plan": subscription_plan,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_reset_token() -> str:
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(32)