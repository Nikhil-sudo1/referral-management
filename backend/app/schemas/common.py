"""
Common Schemas
Base response models and pagination
"""
from typing import Any, Optional, List, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    errors: Optional[List[dict]] = None
    
    model_config = ConfigDict(from_attributes=True)


class PaginationParams(BaseModel):
    """Pagination query parameters"""
    page: int = 1
    limit: int = 20
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    success: bool = True
    message: str = "Success"
    data: dict  # Contains items and pagination meta
    
    model_config = ConfigDict(from_attributes=True)


class ErrorDetail(BaseModel):
    """Error detail schema"""
    field: Optional[str] = None
    message: str

