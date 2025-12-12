"""
University Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class UniversityBase(BaseModel):
    """Base university schema"""
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=20, pattern="^[A-Z0-9]+$")
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None


class UniversityCreate(UniversityBase):
    """Create university schema"""
    status: str = Field(default="active", pattern="^(active|inactive)$")


class UniversityUpdate(BaseModel):
    """Update university schema"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")


class UniversityStats(BaseModel):
    """University statistics"""
    total_programs: int = 0
    total_referrals: int = 0
    total_admissions: int = 0
    conversion_rate: float = 0.0


class UniversityResponse(BaseModel):
    """University response schema"""
    id: UUID
    name: str
    code: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    stats: Optional[UniversityStats] = None
    
    model_config = ConfigDict(from_attributes=True)


class UniversityListItem(BaseModel):
    """University list item"""
    id: UUID
    name: str
    code: str
    logo_url: Optional[str] = None
    status: str
    created_at: datetime
    stats: UniversityStats
    
    model_config = ConfigDict(from_attributes=True)


class UniversityListResponse(BaseModel):
    """University list response"""
    items: List[UniversityListItem]
    total: int
    page: int
    limit: int
    pages: int


class UniversityStatsResponse(BaseModel):
    """University stats response"""
    id: UUID
    name: str
    code: str
    stats: UniversityStats

