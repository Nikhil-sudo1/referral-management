"""
Program Controller
Maps program requests to service calls
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.program_service import ProgramService
from app.schemas.program import ProgramCreate, ProgramUpdate, ProgramResponse
from app.schemas.common import BaseResponse


class ProgramController:
    """Program controller"""
    
    def __init__(self, db: Session):
        self.service = ProgramService(db)
    
    def get_programs(
        self,
        page: int = 1,
        limit: int = 20,
        university_id: Optional[UUID] = None,
        status: Optional[str] = None,
        reward_tier: Optional[str] = None,
    ) -> BaseResponse:
        """Get paginated programs"""
        result = self.service.get_programs(
            page=page,
            limit=limit,
            university_id=university_id,
            status=status,
            reward_tier=reward_tier,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_programs_by_university(self, university_id: UUID) -> BaseResponse:
        """Get all programs for a university"""
        programs = self.service.get_programs_by_university(university_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=[ProgramResponse.model_validate(p).model_dump() for p in programs]
        )
    
    def get_program(self, program_id: UUID) -> BaseResponse:
        """Get program by ID"""
        program = self.service.get_program_by_id(program_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=ProgramResponse.model_validate(program).model_dump()
        )
    
    def create_program(self, data: ProgramCreate) -> BaseResponse:
        """Create new program"""
        program = self.service.create_program(data)
        return BaseResponse(
            success=True,
            message="Program created successfully",
            data=ProgramResponse.model_validate(program).model_dump()
        )
    
    def update_program(self, program_id: UUID, data: ProgramUpdate) -> BaseResponse:
        """Update program"""
        program = self.service.update_program(program_id, data)
        return BaseResponse(
            success=True,
            message="Program updated successfully",
            data=ProgramResponse.model_validate(program).model_dump()
        )
    
    def delete_program(self, program_id: UUID) -> BaseResponse:
        """Delete program"""
        self.service.delete_program(program_id)
        return BaseResponse(
            success=True,
            message="Program deleted successfully"
        )

