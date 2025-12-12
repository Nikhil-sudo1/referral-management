"""
User Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(..., pattern="^(super_admin|manager|counselor|referrer)$")
    organization: Optional[str] = None
    university_id: Optional[UUID] = None


class UserCreate(UserBase):
    """Create user schema"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Update user schema"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    organization: Optional[str] = None
    university_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    organization: Optional[str] = None
    university_id: Optional[UUID] = None
    referral_code: Optional[str] = None
    tier: Optional[str] = None
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserListItem(BaseModel):
    """User list item schema"""
    id: UUID
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    """User list response"""
    items: List[UserListItem]
    total: int
    page: int
    limit: int
    pages: int

