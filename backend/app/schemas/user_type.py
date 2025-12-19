"""
User Type and Role Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RoleResponse(BaseModel):
    """Role response schema"""
    id: int
    user_type_id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserTypeResponse(BaseModel):
    """User Type response schema"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class UserTypeListResponse(BaseModel):
    """User Type list response with roles"""
    id: int
    name: str
    code: str
    description: Optional[str] = None
    roles: List[RoleResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

