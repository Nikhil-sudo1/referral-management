"""
University Service
University management operations
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.university import University
from app.models.program import Program
from app.models.referral import Referral
from app.schemas.university import (
    UniversityCreate,
    UniversityUpdate,
    UniversityListResponse,
    UniversityListItem,
    UniversityStats,
)
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.core.logging import logger
import math


class UniversityService:
    """University service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_universities(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "name",
    ) -> UniversityListResponse:
        """
        Get paginated list of universities with stats
        """
        query = self.db.query(University)
        
        # Apply filters
        if status:
            query = query.filter(University.status == status)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    University.name.ilike(search_term),
                    University.code.ilike(search_term)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_by == "code":
            query = query.order_by(University.code)
        elif sort_by == "date":
            query = query.order_by(University.created_at.desc())
        else:
            query = query.order_by(University.name)
        
        # Apply pagination
        offset = (page - 1) * limit
        universities = query.offset(offset).limit(limit).all()
        
        # Get stats for each university
        items = []
        for uni in universities:
            stats = self._get_university_stats(uni.id)
            items.append(UniversityListItem(
                id=uni.id,
                name=uni.name,
                code=uni.code,
                logo_url=uni.logo_url,
                status=uni.status,
                created_at=uni.created_at,
                stats=stats,
            ))
        
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return UniversityListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )
    
    def get_university_by_id(self, university_id: UUID) -> University:
        """Get university by ID"""
        university = self.db.query(University).filter(
            University.id == university_id
        ).first()
        
        if not university:
            raise NotFoundException(f"University not found: {university_id}")
        
        return university
    
    def get_university_by_code(self, code: str) -> Optional[University]:
        """Get university by code"""
        return self.db.query(University).filter(
            University.code == code.upper()
        ).first()
    
    def create_university(self, data: UniversityCreate) -> University:
        """
        Create a new university
        """
        # Check if code exists
        existing = self.get_university_by_code(data.code)
        if existing:
            raise ConflictException(f"University code already exists: {data.code}")
        
        university = University(
            name=data.name,
            code=data.code.upper(),
            logo_url=data.logo_url,
            website=data.website,
            description=data.description,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            address=data.address,
            status=data.status,
        )
        
        self.db.add(university)
        self.db.commit()
        self.db.refresh(university)
        
        logger.info(f"University created: {university.code}")
        return university
    
    def update_university(self, university_id: UUID, data: UniversityUpdate) -> University:
        """
        Update university
        """
        university = self.get_university_by_id(university_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(university, field, value)
        
        self.db.commit()
        self.db.refresh(university)
        
        logger.info(f"University updated: {university.code}")
        return university
    
    def delete_university(self, university_id: UUID) -> bool:
        """
        Delete university (fails if has referrals or programs)
        """
        university = self.get_university_by_id(university_id)
        
        # Check for associated data
        referral_count = self.db.query(Referral).filter(
            Referral.university_id == university_id
        ).count()
        
        program_count = self.db.query(Program).filter(
            Program.university_id == university_id
        ).count()
        
        if referral_count > 0 or program_count > 0:
            raise ValidationException(
                "Cannot delete university with associated referrals or programs. "
                "Please deactivate it instead."
            )
        
        self.db.delete(university)
        self.db.commit()
        
        logger.info(f"University deleted: {university.code}")
        return True
    
    def toggle_status(self, university_id: UUID, status: str) -> University:
        """Toggle university active/inactive status"""
        university = self.get_university_by_id(university_id)
        university.status = status
        self.db.commit()
        self.db.refresh(university)
        
        logger.info(f"University status changed: {university.code} -> {status}")
        return university
    
    def _get_university_stats(self, university_id: UUID) -> UniversityStats:
        """Get statistics for a university"""
        # Count programs
        program_count = self.db.query(Program).filter(
            Program.university_id == university_id
        ).count()
        
        # Count referrals
        referral_count = self.db.query(Referral).filter(
            Referral.university_id == university_id
        ).count()
        
        # Count admissions
        admission_count = self.db.query(Referral).filter(
            Referral.university_id == university_id,
            Referral.status == "admitted"
        ).count()
        
        # Calculate conversion rate
        conversion_rate = 0.0
        if referral_count > 0:
            conversion_rate = round((admission_count / referral_count) * 100, 1)
        
        return UniversityStats(
            total_programs=program_count,
            total_referrals=referral_count,
            total_admissions=admission_count,
            conversion_rate=conversion_rate,
        )

