"""
University Controller
Maps university requests to service calls
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.university_service import UniversityService
from app.schemas.university import UniversityCreate, UniversityUpdate, UniversityResponse
from app.schemas.common import BaseResponse


class UniversityController:
    """University controller"""
    
    def __init__(self, db: Session):
        self.service = UniversityService(db)
    
    def get_universities(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "name",
    ) -> BaseResponse:
        """Get paginated universities"""
        result = self.service.get_universities(
            page=page,
            limit=limit,
            status=status,
            search=search,
            sort_by=sort_by,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_university(self, university_id: UUID) -> BaseResponse:
        """Get university by ID"""
        university = self.service.get_university_by_id(university_id)
        stats = self.service._get_university_stats(university_id)
        
        response = UniversityResponse.model_validate(university)
        response.stats = stats
        
        return BaseResponse(
            success=True,
            message="Success",
            data=response.model_dump()
        )
    
    def create_university(self, data: UniversityCreate) -> BaseResponse:
        """Create new university"""
        university = self.service.create_university(data)
        return BaseResponse(
            success=True,
            message="University created successfully",
            data=UniversityResponse.model_validate(university).model_dump()
        )
    
    def update_university(self, university_id: UUID, data: UniversityUpdate) -> BaseResponse:
        """Update university"""
        university = self.service.update_university(university_id, data)
        return BaseResponse(
            success=True,
            message="University updated successfully",
            data=UniversityResponse.model_validate(university).model_dump()
        )
    
    def delete_university(self, university_id: UUID) -> BaseResponse:
        """Delete university"""
        self.service.delete_university(university_id)
        return BaseResponse(
            success=True,
            message="University deleted successfully"
        )
    
    def toggle_status(self, university_id: UUID, status: str) -> BaseResponse:
        """Toggle university status"""
        university = self.service.toggle_status(university_id, status)
        return BaseResponse(
            success=True,
            message=f"University status changed to {status}",
            data=UniversityResponse.model_validate(university).model_dump()
        )

