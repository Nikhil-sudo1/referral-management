"""
Program Service
Program management operations
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.program import Program
from app.models.university import University
from app.models.referral import Referral
from app.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramListResponse,
    ProgramListItem,
)
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.core.logging import logger
import math


class ProgramService:
    """Program service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_programs(
        self,
        page: int = 1,
        limit: int = 20,
        university_id: Optional[UUID] = None,
        status: Optional[str] = None,
        reward_tier: Optional[str] = None,
    ) -> ProgramListResponse:
        """
        Get paginated list of programs
        """
        query = self.db.query(Program)
        
        if university_id:
            query = query.filter(Program.university_id == university_id)
        
        if status:
            query = query.filter(Program.status == status)
        
        if reward_tier:
            query = query.filter(Program.reward_tier == reward_tier)
        
        total = query.count()
        
        offset = (page - 1) * limit
        programs = query.order_by(Program.name).offset(offset).limit(limit).all()
        
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return ProgramListResponse(
            items=[ProgramListItem.model_validate(p) for p in programs],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )
    
    def get_program_by_id(self, program_id: UUID) -> Program:
        """Get program by ID"""
        program = self.db.query(Program).filter(Program.id == program_id).first()
        
        if not program:
            raise NotFoundException(f"Program not found: {program_id}")
        
        return program
    
    def get_programs_by_university(self, university_id: UUID) -> List[Program]:
        """Get all programs for a university"""
        return self.db.query(Program).filter(
            Program.university_id == university_id
        ).order_by(Program.name).all()
    
    def create_program(self, data: ProgramCreate) -> Program:
        """
        Create a new program
        """
        # Verify university exists
        university = self.db.query(University).filter(
            University.id == data.university_id
        ).first()
        
        if not university:
            raise NotFoundException(f"University not found: {data.university_id}")
        
        # Check for duplicate code in same university
        existing = self.db.query(Program).filter(
            Program.university_id == data.university_id,
            Program.code == data.code.upper()
        ).first()
        
        if existing:
            raise ConflictException(
                f"Program code {data.code} already exists for this university"
            )
        
        program = Program(
            university_id=data.university_id,
            name=data.name,
            code=data.code.upper(),
            description=data.description,
            duration=data.duration,
            fee_structure=data.fee_structure,
            commission_rate=data.commission_rate,
            reward_amount=data.reward_amount,
            reward_tier=data.reward_tier,
            eligibility_criteria=data.eligibility_criteria,
            status=data.status,
        )
        
        self.db.add(program)
        self.db.commit()
        self.db.refresh(program)
        
        logger.info(f"Program created: {program.code} for {university.code}")
        return program
    
    def update_program(self, program_id: UUID, data: ProgramUpdate) -> Program:
        """
        Update program
        """
        program = self.get_program_by_id(program_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(program, field, value)
        
        self.db.commit()
        self.db.refresh(program)
        
        logger.info(f"Program updated: {program.code}")
        return program
    
    def delete_program(self, program_id: UUID) -> bool:
        """
        Delete program (fails if has referrals)
        """
        program = self.get_program_by_id(program_id)
        
        # Check for associated referrals
        referral_count = self.db.query(Referral).filter(
            Referral.program_id == program_id
        ).count()
        
        if referral_count > 0:
            raise ValidationException(
                "Cannot delete program with associated referrals. "
                "Please deactivate it instead."
            )
        
        self.db.delete(program)
        self.db.commit()
        
        logger.info(f"Program deleted: {program.code}")
        return True

