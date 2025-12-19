"""
Authentication Schemas
Updated for new user table structure with user_type_id and role_id
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str = Field(..., min_length=6)


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
    full_name: str
    user_type_id: int
    role_id: int
    user_type_name: Optional[str] = None
    role_name: Optional[str] = None
    referral_code: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInToken


class RegisterRequest(BaseModel):
    """Registration request schema with new user table structure"""
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    mobile_number: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    user_type_id: int = Field(..., description="User type: 1=Admin, 2=Referral Partner")
    role_id: int = Field(..., description="Role based on user type")
    univ_id: Optional[str] = None  # For Student Referrer (role_id=5)
    org_id: Optional[int] = None  # For Employee (role_id=4)
    # Bank details (optional at signup)
    bank_acc: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None


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
    full_name: str
    mobile_number: Optional[str] = None
    user_type_id: int
    role_id: int
    user_type_name: Optional[str] = None
    role_name: Optional[str] = None
    is_active: bool
    email_verification: bool
    univ_id: Optional[UUID] = None
    org_id: Optional[int] = None
    referral_code: Optional[str] = None
    bank_acc: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Role and User Type schemas
class RoleResponse(BaseModel):
    """Role response for dropdowns"""
    id: int
    user_type_id: int
    name: str
    code: str
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserTypeResponse(BaseModel):
    """User type response with roles"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class OrganizationResponse(BaseModel):
    """Organization/Company response"""
    id: int
    name: str
    
    model_config = ConfigDict(from_attributes=True)
