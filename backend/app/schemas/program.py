"""
Program Schemas
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class ProgramBase(BaseModel):
    """Base program schema"""
    name: str = Field(..., min_length=2, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    duration: Optional[str] = None
    fee_structure: Decimal = Field(..., gt=0)
    commission_rate: Decimal = Field(..., ge=0, le=100)
    reward_amount: Decimal = Field(..., ge=0)
    reward_tier: str = Field(default="bronze", pattern="^(bronze|silver|gold|platinum)$")
    eligibility_criteria: Optional[str] = None


class ProgramCreate(ProgramBase):
    """Create program schema"""
    university_id: UUID
    status: str = Field(default="active", pattern="^(active|inactive)$")


class ProgramUpdate(BaseModel):
    """Update program schema"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    duration: Optional[str] = None
    fee_structure: Optional[Decimal] = Field(None, gt=0)
    commission_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    reward_amount: Optional[Decimal] = Field(None, ge=0)
    reward_tier: Optional[str] = Field(None, pattern="^(bronze|silver|gold|platinum)$")
    eligibility_criteria: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")


class ProgramResponse(BaseModel):
    """Program response schema"""
    id: UUID
    university_id: UUID
    name: str
    code: str
    description: Optional[str] = None
    duration: Optional[str] = None
    fee_structure: Decimal
    commission_rate: Decimal
    reward_amount: Decimal
    reward_tier: str
    eligibility_criteria: Optional[str] = None
    status: str
    crm_course_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProgramListItem(BaseModel):
    """Program list item"""
    id: UUID
    university_id: UUID
    name: str
    code: str
    fee_structure: Decimal
    reward_amount: Decimal
    reward_tier: str
    status: str
    
    model_config = ConfigDict(from_attributes=True)


class ProgramListResponse(BaseModel):
    """Program list response"""
    items: List[ProgramListItem]
    total: int
    page: int
    limit: int
    pages: int

