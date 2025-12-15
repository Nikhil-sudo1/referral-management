"""
Referral Service
Referral management operations - core business logic
"""
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.referral import Referral
from app.models.reward import Reward
from app.models.user import User
from app.models.university import University
from app.models.program import Program
from app.schemas.referral import (
    ReferralCreate,
    ReferralSubmit,
    ReferralUpdate,
    ReferralStatusUpdate,
    ReferralAssign,
    ReferralListResponse,
    ReferralListItem,
    ReferralResponse,
    ReferrerInfo,
    RefereeInfo,
    UniversityInfo,
    ProgramInfo,
    CounselorInfo,
)
from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.logging import logger
import math
import random
import string


class ReferralService:
    """Referral service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_referrals(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        university_id: Optional[UUID] = None,
        program_id: Optional[UUID] = None,
        counselor_id: Optional[UUID] = None,
        referrer_id: Optional[UUID] = None,
        search: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> ReferralListResponse:
        """
        Get paginated list of referrals with filters
        OPTIMIZED: Uses bulk loading instead of N+1 queries
        """
        query = self.db.query(Referral)
        
        # Apply filters
        if status:
            query = query.filter(Referral.status == status)
        
        if university_id:
            query = query.filter(Referral.university_id == university_id)
        
        if program_id:
            query = query.filter(Referral.program_id == program_id)
        
        if counselor_id:
            query = query.filter(Referral.counselor_id == counselor_id)
        
        if referrer_id:
            query = query.filter(Referral.referrer_id == referrer_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Referral.referee_name.ilike(search_term),
                    Referral.referrer_name.ilike(search_term),
                    Referral.referral_code.ilike(search_term),
                    Referral.referee_email.ilike(search_term),
                )
            )
        
        if date_from:
            query = query.filter(Referral.submission_date >= date_from)
        
        if date_to:
            query = query.filter(Referral.submission_date <= date_to)
        
        total = query.count()
        
        # Get stats using optimized single query
        stats = self._get_status_stats()
        
        # Apply pagination
        offset = (page - 1) * limit
        referrals = query.order_by(
            Referral.submission_date.desc()
        ).offset(offset).limit(limit).all()
        
        # OPTIMIZATION: Pre-load all universities, programs, and counselors in bulk
        # instead of querying for each referral (N+1 problem fix)
        university_ids = {ref.university_id for ref in referrals if ref.university_id}
        program_ids = {ref.program_id for ref in referrals if ref.program_id}
        counselor_ids = {ref.counselor_id for ref in referrals if ref.counselor_id}
        
        # Bulk load all related data in 3 queries instead of N*3 queries
        universities_map = {}
        if university_ids:
            universities = self.db.query(University).filter(University.id.in_(university_ids)).all()
            universities_map = {u.id: u for u in universities}
        
        programs_map = {}
        if program_ids:
            programs = self.db.query(Program).filter(Program.id.in_(program_ids)).all()
            programs_map = {p.id: p for p in programs}
        
        counselors_map = {}
        if counselor_ids:
            counselors = self.db.query(User).filter(User.id.in_(counselor_ids)).all()
            counselors_map = {c.id: c.name for c in counselors}
        
        # Build response items using pre-loaded data
        items = []
        for ref in referrals:
            university = universities_map.get(ref.university_id)
            program = programs_map.get(ref.program_id)
            counselor_name = counselors_map.get(ref.counselor_id)
            
            items.append(ReferralListItem(
                id=ref.id,
                referral_code=ref.referral_code,
                referee_name=ref.referee_name,
                referee_email=ref.referee_email,
                referrer_name=ref.referrer_name,
                university_code=university.code if university else "",
                program_code=program.code if program else "",
                counselor_name=counselor_name,
                status=ref.status,
                submission_date=ref.submission_date,
            ))
        
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return ReferralListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            stats=stats,
        )
    
    def get_referral_by_id(self, referral_id: UUID) -> Referral:
        """Get referral by ID"""
        referral = self.db.query(Referral).filter(
            Referral.id == referral_id
        ).first()
        
        if not referral:
            raise NotFoundException(f"Referral not found: {referral_id}")
        
        return referral
    
    def get_referral_response(self, referral: Referral) -> ReferralResponse:
        """Build full referral response with related data"""
        university = self.db.query(University).filter(
            University.id == referral.university_id
        ).first()
        program = self.db.query(Program).filter(
            Program.id == referral.program_id
        ).first()
        
        counselor = None
        if referral.counselor_id:
            counselor_user = self.db.query(User).filter(
                User.id == referral.counselor_id
            ).first()
            if counselor_user:
                counselor = CounselorInfo(
                    id=counselor_user.id,
                    name=counselor_user.name
                )
        
        return ReferralResponse(
            id=referral.id,
            referral_code=referral.referral_code,
            referrer=ReferrerInfo(
                id=referral.referrer_id,
                name=referral.referrer_name,
                email=referral.referrer_email,
                phone=referral.referrer_phone,
            ),
            referee=RefereeInfo(
                name=referral.referee_name,
                email=referral.referee_email,
                phone=referral.referee_phone,
            ),
            university=UniversityInfo(
                id=university.id,
                name=university.name,
                code=university.code,
            ) if university else None,
            program=ProgramInfo(
                id=program.id,
                name=program.name,
                code=program.code,
            ) if program else None,
            counselor=counselor,
            status=referral.status,
            status_notes=referral.status_notes,
            submission_date=referral.submission_date,
            contacted_date=referral.contacted_date,
            admission_date=referral.admission_date,
            rejection_date=referral.rejection_date,
            expected_reward=referral.expected_reward,
            created_at=referral.created_at,
            updated_at=referral.updated_at,
        )
    
    def create_referral(self, data: ReferralCreate, referrer_user: Optional[User] = None) -> Referral:
        """
        Create a new referral (admin/manager)
        """
        # Validate university and program
        university = self.db.query(University).filter(
            University.id == data.university_id
        ).first()
        if not university:
            raise NotFoundException("University not found")
        
        program = self.db.query(Program).filter(
            Program.id == data.program_id,
            Program.university_id == data.university_id
        ).first()
        if not program:
            raise NotFoundException("Program not found for this university")
        
        # Generate referral code
        referral_code = self._generate_referral_code(university.code, program.code)
        
        # Find referrer user if exists
        referrer_id = None
        if referrer_user:
            referrer_id = referrer_user.id
        else:
            existing_referrer = self.db.query(User).filter(
                User.email == data.referrer_email.lower()
            ).first()
            if existing_referrer:
                referrer_id = existing_referrer.id
        
        referral = Referral(
            referral_code=referral_code,
            referrer_id=referrer_id,
            referrer_name=data.referrer_name,
            referrer_email=data.referrer_email.lower(),
            referrer_phone=data.referrer_phone,
            referee_name=data.referee_name,
            referee_email=data.referee_email.lower(),
            referee_phone=data.referee_phone,
            university_id=data.university_id,
            program_id=data.program_id,
            status="submitted",
            submission_date=datetime.utcnow(),
            expected_reward=program.reward_amount,
            source=data.source,
            utm_campaign=data.utm_campaign,
            utm_source=data.utm_source,
            utm_medium=data.utm_medium,
        )
        
        self.db.add(referral)
        self.db.commit()
        self.db.refresh(referral)
        
        logger.info(f"Referral created: {referral.referral_code}")
        return referral
    
    def submit_referral(self, data: ReferralSubmit, referrer: User) -> Referral:
        """
        Submit a referral as a referrer
        """
        # Validate university and program
        university = self.db.query(University).filter(
            University.id == data.university_id,
            University.status == "active"
        ).first()
        if not university:
            raise NotFoundException("University not found or inactive")
        
        program = self.db.query(Program).filter(
            Program.id == data.program_id,
            Program.university_id == data.university_id,
            Program.status == "active"
        ).first()
        if not program:
            raise NotFoundException("Program not found or inactive")
        
        # Generate referral code
        referral_code = self._generate_referral_code(university.code, program.code)
        
        referral = Referral(
            referral_code=referral_code,
            referrer_id=referrer.id,
            referrer_name=referrer.name,
            referrer_email=referrer.email,
            referrer_phone=referrer.phone or "",
            referee_name=data.referee_name,
            referee_email=data.referee_email.lower(),
            referee_phone=data.referee_phone,
            university_id=data.university_id,
            program_id=data.program_id,
            status="submitted",
            submission_date=datetime.utcnow(),
            expected_reward=program.reward_amount,
        )
        
        self.db.add(referral)
        self.db.commit()
        self.db.refresh(referral)
        
        logger.info(f"Referral submitted by {referrer.email}: {referral.referral_code}")
        return referral
    
    def update_referral(self, referral_id: UUID, data: ReferralUpdate) -> Referral:
        """
        Update referral details
        """
        referral = self.get_referral_by_id(referral_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "referee_email" and value:
                value = value.lower()
            setattr(referral, field, value)
        
        self.db.commit()
        self.db.refresh(referral)
        
        logger.info(f"Referral updated: {referral.referral_code}")
        return referral
    
    def update_status(self, referral_id: UUID, data: ReferralStatusUpdate) -> Referral:
        """
        Update referral status
        """
        referral = self.get_referral_by_id(referral_id)
        
        old_status = referral.status
        referral.status = data.status
        referral.status_notes = data.notes
        
        # Update relevant dates
        now = datetime.utcnow()
        if data.status == "contacted":
            referral.contacted_date = now
        elif data.status == "admitted":
            referral.admission_date = now
            # Automatically create rewards when status changes to admitted
            if old_status != "admitted":
                try:
                    from app.services.reward_service import RewardService
                    reward_service = RewardService(self.db)
                    # Check if rewards already exist to prevent duplicates
                    existing_rewards = self.db.query(Reward).filter(
                        Reward.referral_id == referral.id
                    ).first()
                    if not existing_rewards:
                        reward_service.create_reward_for_admission(referral)
                        logger.info(f"Rewards automatically created for admission: {referral.referral_code}")
                    else:
                        logger.info(f"Rewards already exist for referral: {referral.referral_code}")
                except Exception as e:
                    logger.error(f"Error creating rewards for admission: {e}")
                    # Don't fail the status update if reward creation fails
        elif data.status == "rejected":
            referral.rejection_date = now
        
        self.db.commit()
        self.db.refresh(referral)
        
        logger.info(f"Referral status changed: {referral.referral_code} {old_status} -> {data.status}")
        return referral
    
    def assign_counselor(self, referral_id: UUID, data: ReferralAssign) -> Referral:
        """
        Assign counselor to referral
        """
        referral = self.get_referral_by_id(referral_id)
        
        # Verify counselor exists
        counselor = self.db.query(User).filter(
            User.id == data.counselor_id,
            User.role == "counselor",
            User.is_active == True
        ).first()
        
        if not counselor:
            raise NotFoundException("Counselor not found or inactive")
        
        referral.counselor_id = data.counselor_id
        referral.assigned_at = datetime.utcnow()
        
        # Auto-update status to assigned if submitted
        if referral.status == "submitted":
            referral.status = "assigned"
        
        self.db.commit()
        self.db.refresh(referral)
        
        logger.info(f"Counselor {counselor.name} assigned to {referral.referral_code}")
        return referral
    
    def get_my_referrals(self, referrer_id: UUID, page: int = 1, limit: int = 20) -> ReferralListResponse:
        """Get referrals for a specific referrer"""
        return self.get_referrals(
            page=page,
            limit=limit,
            referrer_id=referrer_id,
        )
    
    def get_assigned_referrals(self, counselor_id: UUID, page: int = 1, limit: int = 20) -> ReferralListResponse:
        """Get referrals assigned to a counselor"""
        return self.get_referrals(
            page=page,
            limit=limit,
            counselor_id=counselor_id,
        )
    
    def _generate_referral_code(self, uni_code: str, prog_code: str) -> str:
        """Generate unique referral code"""
        suffix = ''.join(random.choices(string.digits, k=5))
        code = f"{uni_code}-{prog_code}-{suffix}"
        
        # Ensure uniqueness
        while self.db.query(Referral).filter(Referral.referral_code == code).first():
            suffix = ''.join(random.choices(string.digits, k=5))
            code = f"{uni_code}-{prog_code}-{suffix}"
        
        return code
    
    def _get_status_stats(self) -> Dict[str, int]:
        """Get referral count by status - OPTIMIZED: single query with GROUP BY"""
        # Initialize with all statuses at 0
        stats = {status: 0 for status in ["submitted", "assigned", "contacted", "admitted", "rejected"]}
        
        # Single query with GROUP BY instead of 5 separate COUNT queries
        results = self.db.query(
            Referral.status,
            func.count(Referral.id)
        ).group_by(Referral.status).all()
        
        for status, count in results:
            if status in stats:
                stats[status] = count
        
        return stats

