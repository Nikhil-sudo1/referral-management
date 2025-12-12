"""
Referral Controller
Maps referral requests to service calls
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.referral_service import ReferralService
from app.models.user import User
from app.schemas.referral import (
    ReferralCreate,
    ReferralSubmit,
    ReferralUpdate,
    ReferralStatusUpdate,
    ReferralAssign,
)
from app.schemas.common import BaseResponse


class ReferralController:
    """Referral controller"""
    
    def __init__(self, db: Session):
        self.service = ReferralService(db)
    
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
    ) -> BaseResponse:
        """Get paginated referrals"""
        result = self.service.get_referrals(
            page=page,
            limit=limit,
            status=status,
            university_id=university_id,
            program_id=program_id,
            counselor_id=counselor_id,
            referrer_id=referrer_id,
            search=search,
            date_from=date_from,
            date_to=date_to,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_referral(self, referral_id: UUID) -> BaseResponse:
        """Get referral by ID"""
        referral = self.service.get_referral_by_id(referral_id)
        response = self.service.get_referral_response(referral)
        return BaseResponse(
            success=True,
            message="Success",
            data=response.model_dump()
        )
    
    def create_referral(self, data: ReferralCreate) -> BaseResponse:
        """Create new referral (admin)"""
        referral = self.service.create_referral(data)
        return BaseResponse(
            success=True,
            message="Referral created successfully",
            data={
                "id": str(referral.id),
                "referral_code": referral.referral_code,
                "status": referral.status,
                "expected_reward": float(referral.expected_reward) if referral.expected_reward else None,
            }
        )
    
    def submit_referral(self, data: ReferralSubmit, referrer: User) -> BaseResponse:
        """Submit referral (referrer)"""
        referral = self.service.submit_referral(data, referrer)
        return BaseResponse(
            success=True,
            message="Referral submitted successfully",
            data={
                "id": str(referral.id),
                "referral_code": referral.referral_code,
                "status": referral.status,
                "expected_reward": float(referral.expected_reward) if referral.expected_reward else None,
            }
        )
    
    def update_referral(self, referral_id: UUID, data: ReferralUpdate) -> BaseResponse:
        """Update referral"""
        referral = self.service.update_referral(referral_id, data)
        response = self.service.get_referral_response(referral)
        return BaseResponse(
            success=True,
            message="Referral updated successfully",
            data=response.model_dump()
        )
    
    def update_status(self, referral_id: UUID, data: ReferralStatusUpdate) -> BaseResponse:
        """Update referral status"""
        referral = self.service.update_status(referral_id, data)
        response = self.service.get_referral_response(referral)
        return BaseResponse(
            success=True,
            message=f"Referral status updated to {data.status}",
            data=response.model_dump()
        )
    
    def assign_counselor(self, referral_id: UUID, data: ReferralAssign) -> BaseResponse:
        """Assign counselor to referral"""
        referral = self.service.assign_counselor(referral_id, data)
        response = self.service.get_referral_response(referral)
        return BaseResponse(
            success=True,
            message="Counselor assigned successfully",
            data=response.model_dump()
        )
    
    def get_my_referrals(
        self,
        referrer_id: UUID,
        page: int = 1,
        limit: int = 20,
    ) -> BaseResponse:
        """Get current referrer's referrals"""
        result = self.service.get_my_referrals(referrer_id, page, limit)
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_assigned_referrals(
        self,
        counselor_id: UUID,
        page: int = 1,
        limit: int = 20,
    ) -> BaseResponse:
        """Get referrals assigned to counselor"""
        result = self.service.get_assigned_referrals(counselor_id, page, limit)
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )

