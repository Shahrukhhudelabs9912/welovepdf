"""Dashboard API routes — user history, usage statistics, activity tracking."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.routes.auth_routes import require_current_user
from app.services.auth_service import (
    get_user_by_id,
    _sanitize_user,
)
from app.utils.db_utils import get_database

logger = logging.getLogger("dashboard_routes")

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_usage_stats(user_id: str) -> dict:
    """Aggregate usage statistics for a given user."""
    db = get_database()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": "$action",
                "count": {"$sum": 1},
                "last_used": {"$max": "$timestamp"},
            }
        },
    ]
    cursor = db.user_activity.aggregate(pipeline)
    actions = {}
    total = 0
    async for doc in cursor:
        actions[doc["_id"]] = {
            "count": doc["count"],
            "last_used": doc["last_used"].isoformat() if doc.get("last_used") else None,
        }
        total += doc["count"]

    return {
        "total_actions": total,
        "actions_by_type": actions,
    }


async def _get_ai_history(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """Fetch AI analysis history for a user with pagination."""
    db = get_database()
    query = {"user_id": user_id}

    total = await db.ai_history.count_documents(query)

    cursor = (
        db.ai_history.find(query)
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )

    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "original_filename": doc.get("original_filename"),
            "title": doc.get("title"),
            "summary": doc.get("summary"),
            "key_points": doc.get("key_points", []),
            "word_count": doc.get("word_count", 0),
            "page_count": doc.get("page_count", 0),
            "reading_time": doc.get("reading_time", ""),
            "sentiment": doc.get("sentiment", "neutral"),
            "confidence": doc.get("confidence", 0),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
        })

    return results, total


async def _get_recent_activity(
    user_id: str,
    limit: int = 20,
) -> list[dict]:
    """Fetch recent user activity."""
    db = get_database()
    cursor = (
        db.user_activity.find({"user_id": user_id})
        .sort("timestamp", -1)
        .limit(limit)
    )

    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "action": doc.get("action"),
            "metadata": doc.get("metadata", {}),
            "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else None,
        })

    return results


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/overview")
async def dashboard_overview(
    current_user: dict = Depends(require_current_user),
):
    """Get dashboard overview data: usage stats, recent activity, profile."""
    user_id = current_user["id"]

    try:
        usage_stats = await _get_usage_stats(user_id)
        recent_activity = await _get_recent_activity(user_id, limit=10)
        history_count = await get_database().ai_history.count_documents({"user_id": user_id})

        return {
            "user": _sanitize_user(current_user),
            "usage": usage_stats,
            "recent_activity": recent_activity,
            "ai_history_count": history_count,
        }
    except Exception as e:
        logger.error(f"Dashboard overview failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard data.",
        )


@router.get("/history")
async def ai_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(require_current_user),
):
    """Fetch paginated AI analysis history for the authenticated user."""
    try:
        results, total = await _get_ai_history(current_user["id"], limit, offset)
        return {
            "items": results,
            "total": total,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"AI history fetch failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load history.",
        )


@router.delete("/history/{item_id}")
async def delete_history_item(
    item_id: str,
    current_user: dict = Depends(require_current_user),
):
    """Delete a single AI history entry."""
    from bson import ObjectId
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid history item ID.",
        )

    db = get_database()
    result = await db.ai_history.delete_one({"_id": oid, "user_id": current_user["id"]})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found.",
        )

    return {"message": "History item deleted successfully."}


@router.get("/activity")
async def user_activity(
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_current_user),
):
    """Fetch recent user activity (tool usage, logins, etc.)."""
    try:
        activity = await _get_recent_activity(current_user["id"], limit)
        return {"items": activity, "total": len(activity)}
    except Exception as e:
        logger.error(f"Activity fetch failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load activity.",
        )


@router.get("/stats")
async def usage_statistics(
    current_user: dict = Depends(require_current_user),
):
    """Get aggregated usage statistics for the user."""
    try:
        stats = await _get_usage_stats(current_user["id"])
        return stats
    except Exception as e:
        logger.error(f"Stats fetch failed: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load statistics.",
        )