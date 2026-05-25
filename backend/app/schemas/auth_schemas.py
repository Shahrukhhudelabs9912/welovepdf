"""Pydantic schemas for authentication request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class SignupRequest(BaseModel):
    """Request schema for user registration."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(
        ..., min_length=8, max_length=128, description="Password (8-128 chars)"
    )
    full_name: str = Field(
        ..., min_length=1, max_length=100, description="User's full name"
    )


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
    remember_me: bool = Field(False, description="Whether to extend session")


class ForgotPasswordRequest(BaseModel):
    """Request schema for password reset initiation."""
    email: EmailStr = Field(..., description="Email address to send reset link")


class ResetPasswordRequest(BaseModel):
    """Request schema for completing password reset."""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(
        ..., min_length=8, max_length=128, description="New password"
    )


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing access token."""
    refresh_token: str = Field(..., description="Refresh token")


class UserResponse(BaseModel):
    """Safe user data returned in API responses (no password hash)."""
    id: str
    email: str
    full_name: str
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[str] = None


class AuthResponse(BaseModel):
    """Response schema for successful login/signup."""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiry in seconds")


class LogoutResponse(BaseModel):
    """Response schema for logout."""
    message: str = "Logged out successfully"


class ForgotPasswordResponse(BaseModel):
    """Response schema for forgot password (does not reveal if email exists)."""
    message: str = "If an account with that email exists, a password reset link has been sent."


class ResetPasswordResponse(BaseModel):
    """Response schema for password reset completion."""
    message: str = "Password has been reset successfully. You can now log in."


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="New full name")


class ChangePasswordRequest(BaseModel):
    """Request schema for changing password (when already logged in)."""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")


class ProfileResponse(BaseModel):
    """Extended user profile with message."""
    user: UserResponse
    message: str = "Profile updated successfully"


class AuthErrorResponse(BaseModel):
    """Standardized auth error response."""
    detail: str
    error_code: Optional[str] = None