"""
Partner Type Schemas
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class PartnerTypeBase(BaseModel):
    """Base partner type schema"""
    name: str
    code: str
    description: Optional[str] = None


class PartnerTypeResponse(PartnerTypeBase):
    """Partner type response schema"""
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RegionBase(BaseModel):
    """Base region schema"""
    name: str
    code: str
    description: Optional[str] = None


class RegionResponse(RegionBase):
    """Region response schema"""
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

