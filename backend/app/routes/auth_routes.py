"""Authentication routes for WeLovePDF API.

Provides: signup, login, logout, forgot-password, reset-password, me (user info),
and token refresh endpoints. All endpoints use JSON request/response bodies.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Response, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.schemas.auth_schemas import (
    SignupRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    AuthResponse,
    LogoutResponse,
    ForgotPasswordResponse,
    ResetPasswordResponse,
    UserResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ProfileResponse,
)
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    set_reset_token,
    get_user_by_reset_token,
    update_user_password,
    update_user_profile,
    get_user_by_id,
)
from app.config import settings
from app.utils.rate_limit import limiter

router = APIRouter(tags=["Authentication"])
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Dependency: get current user from JWT
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """Extract and validate the current user from the Authorization header.

    Returns None if no token is provided (allows optional auth).
    Raises HTTPException(401) if token is invalid.
    """
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    user = await get_user_by_id(user_id)
    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )
    return user


async def require_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """Require a valid authenticated user. Raises 401 if missing/invalid."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    user = await get_user_by_id(user_id)
    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )
    return user


# ---------------------------------------------------------------------------
# Helper: build auth tokens
# ---------------------------------------------------------------------------

def _build_auth_tokens(user: dict, remember_me: bool = False) -> dict:
    """Create access + refresh tokens for a user and return AuthResponse data."""
    token_data = {"sub": user["id"], "email": user["email"]}

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # If remember_me, also create a longer-lived access token
    if remember_me:
        from datetime import timedelta, timezone
        from jose import jwt
        extended = token_data.copy()
        extended["exp"] = datetime.now(timezone.utc) + timedelta(days=7)
        extended["type"] = "access"
        access_token = jwt.encode(
            extended, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
        )

    return {
        "user": _sanitize(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": (
            7 * 24 * 60 * 60 if remember_me else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        ),
    }


def _sanitize(user: dict) -> dict:
    """Return safe user dict for API responses."""
    created_at = user.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "is_active": user.get("is_active", True),
        "is_verified": user.get("is_verified", False),
        "created_at": created_at,
    }


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@router.post("/auth/signup", summary="Register a new user")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def signup(request: Request, body: SignupRequest):
    """Create a new user account (no auto-login; user must log in separately)."""
    try:
        user = await create_user(
            email=body.email,
            password=body.password,
            full_name=body.full_name,
        )
        # Look up the full user record to return
        full_user = await get_user_by_email(body.email)
        if not full_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation failed. Please try again.",
            )
        return {
            "message": "Account created successfully. Please log in.",
            "user": _sanitize(full_user),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth/signup] Error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signup.",
        )


@router.post("/auth/login", response_model=AuthResponse, summary="Log in to an existing account")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(request: Request, body: LoginRequest):
    """Authenticate a user with email and password, return tokens."""
    try:
        user = await get_user_by_email(body.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated.",
            )

        if not verify_password(body.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        return _build_auth_tokens(user, body.remember_me)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth/login] Error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login.",
        )


@router.post("/auth/logout", response_model=LogoutResponse, summary="Log out the current user")
async def logout():
    """Log out the user. Client should discard tokens.

    Since we use stateless JWT tokens, logout is handled client-side
    by removing the tokens from storage. This endpoint exists for
    API completeness and future server-side token revocation.
    """
    return LogoutResponse(message="Logged out successfully")


@router.post(
    "/auth/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request a password reset link",
)
async def forgot_password(request: ForgotPasswordRequest):
    """Send a password reset link to the user's email.

    For local development: the reset token is returned in a response header
    so the developer can use it directly without email infrastructure.
    In production, the token would only be sent via email.
    """
    try:
        token = await set_reset_token(request.email)

        # In development, include the token in a response header for easy testing.
        # In production, this header would be removed and the token only sent via email.
        response = ForgotPasswordResponse()

        # For local dev: add token to response headers so frontend can test the flow
        # without actual email infrastructure
        if settings.APP_DEBUG:
            from fastapi.responses import JSONResponse
            import json
            resp_data = json.loads(response.model_dump_json())
            resp_data["_dev_reset_token"] = token
            return JSONResponse(
                content=resp_data,
                headers={"X-Dev-Reset-Token": token},
            )

        return response
    except Exception as e:
        print(f"[auth/forgot-password] Error: {type(e).__name__}: {e}")
        # Always return the same message regardless of whether the email exists
        return ForgotPasswordResponse()


@router.post(
    "/auth/reset-password",
    response_model=ResetPasswordResponse,
    summary="Complete password reset with token",
)
async def reset_password(request: ResetPasswordRequest):
    """Reset the user's password using the token from the reset link."""
    try:
        user = await get_user_by_reset_token(request.token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token.",
            )

        await update_user_password(user["id"], request.new_password)
        return ResetPasswordResponse()
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth/reset-password] Error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during password reset.",
        )


@router.post(
    "/auth/refresh",
    response_model=AuthResponse,
    summary="Refresh access token using refresh token",
)
async def refresh_token(request: RefreshTokenRequest):
    """Obtain a new access token using a valid refresh token."""
    try:
        payload = decode_refresh_token(request.refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )

        user = await get_user_by_id(user_id)
        if not user or not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive.",
            )

        return _build_auth_tokens(user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[auth/refresh] Error: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during token refresh.",
        )


@router.get("/auth/me", response_model=UserResponse, summary="Get current user info")
async def me(current_user: dict = Depends(require_current_user)):
    """Return the authenticated user's profile information."""
    return _sanitize(current_user)


@router.put("/auth/profile", response_model=ProfileResponse, summary="Update user profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(require_current_user),
):
    """Update the authenticated user's profile (full_name)."""
    if request.full_name is not None:
        updated = await update_user_profile(current_user["id"], request.full_name)
        return ProfileResponse(
            user=_sanitize(updated),
            message="Profile updated successfully",
        )
    return ProfileResponse(
        user=_sanitize(current_user),
        message="No changes made",
    )


@router.post(
    "/auth/change-password",
    response_model=ResetPasswordResponse,
    summary="Change password",
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(require_current_user),
):
    """Change the authenticated user's password (requires current password)."""
    if not verify_password(request.current_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    await update_user_password(current_user["id"], request.new_password)
    return ResetPasswordResponse(message="Password changed successfully.") 
 
