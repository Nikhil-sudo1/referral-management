"""
Authentication Schemas
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = Field(default=None, pattern="^(admin|referral_partner)$")
    admin_sub_role: Optional[str] = Field(default=None, pattern="^(human_resource|business_head)$")


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserInToken(BaseModel):
    """User data in token response"""
    id: UUID
    email: str
    name: str
    role: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInToken


class RegisterRequest(BaseModel):
    """Registration request schema"""
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    partner_type_id: int = Field(..., description="Partner type: Employee or Student Referrer")
    organization: Optional[str] = None  # For employees
    region_id: Optional[int] = None  # For student referrers
    university_id: Optional[str] = None  # For student referrers


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request"""
    token: str
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)


class UserProfileResponse(BaseModel):
    """User profile response"""
    id: UUID
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    referral_code: Optional[str] = None
    tier: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

