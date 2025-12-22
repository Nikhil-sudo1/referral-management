"""
Reward Controller
Maps reward requests to service calls
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.reward_service import RewardService
from app.schemas.reward import RewardCreate, RewardApprove, RewardDisburse
from app.schemas.common import BaseResponse


class RewardController:
    """Reward controller"""
    
    def __init__(self, db: Session):
        self.service = RewardService(db)
    
    def get_rewards(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        user_type: Optional[str] = None,
        user_id: Optional[UUID] = None,
        referral_id: Optional[UUID] = None,
    ) -> BaseResponse:
        """Get paginated rewards"""
        result = self.service.get_rewards(
            page=page,
            limit=limit,
            status=status,
            user_type=user_type,
            user_id=user_id,
            referral_id=referral_id,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_reward(self, reward_id: UUID) -> BaseResponse:
        """Get reward by ID"""
        reward = self.service.get_reward_by_id(reward_id)
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "id": str(reward.id),
                "referral_id": str(reward.referral_id),
                "user_id": str(reward.user_id),
                "user_type": reward.user_type,
                "reward_type": reward.reward_type,
                "amount": float(reward.amount),
                "status": reward.status,
                "created_at": reward.created_at.isoformat(),
            }
        )
    
    def create_reward(self, data: RewardCreate) -> BaseResponse:
        """Create new reward"""
        reward = self.service.create_reward(data)
        return BaseResponse(
            success=True,
            message="Reward created successfully",
            data={
                "id": str(reward.id),
                "amount": float(reward.amount),
                "status": reward.status,
            }
        )
    
    def approve_reward(self, reward_id: UUID, data: RewardApprove, approved_by: UUID) -> BaseResponse:
        """Approve reward"""
        reward = self.service.approve_reward(reward_id, data, approved_by)
        return BaseResponse(
            success=True,
            message="Reward approved successfully",
            data={
                "id": str(reward.id),
                "status": reward.status,
                "approved_at": reward.approved_at.isoformat() if reward.approved_at else None,
            }
        )
    
    def disburse_reward(self, reward_id: UUID, data: RewardDisburse, disbursed_by: UUID) -> BaseResponse:
        """Disburse reward"""
        reward = self.service.disburse_reward(reward_id, data, disbursed_by)
        return BaseResponse(
            success=True,
            message="Reward disbursed successfully",
            data={
                "id": str(reward.id),
                "status": reward.status,
                "disbursed_at": reward.disbursed_at.isoformat() if reward.disbursed_at else None,
                "transaction_reference": reward.transaction_reference,
            }
        )
    
    def cancel_reward(self, reward_id: UUID, reason: str) -> BaseResponse:
        """Cancel reward"""
        reward = self.service.cancel_reward(reward_id, reason)
        return BaseResponse(
            success=True,
            message="Reward cancelled",
            data={
                "id": str(reward.id),
                "status": reward.status,
            }
        )
    
    def get_my_rewards(self, user_id: UUID) -> BaseResponse:
        """Get current user's rewards"""
        result = self.service.get_my_rewards(user_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_reward_tiers(self) -> BaseResponse:
        """Get reward tier configuration"""
        tiers = self.service.get_reward_tiers()
        return BaseResponse(
            success=True,
            message="Success",
            data=[t.model_dump() for t in tiers]
        )
    
    def approve_by_student_admin(self, reward_id: UUID, data: RewardApprove, approved_by: UUID) -> BaseResponse:
        """Approve reward by student-admin (first level)"""
        reward = self.service.approve_by_student_admin(reward_id, data, approved_by)
        return BaseResponse(
            success=True,
            message="Reward approved by student-admin and sent to account team",
            data={
                "id": str(reward.id),
                "status": reward.status,
                "student_admin_approved_at": reward.student_admin_approved_at.isoformat() if reward.student_admin_approved_at else None,
            }
        )
    
    def approve_by_account_team(self, reward_id: UUID, data: RewardApprove, approved_by: UUID) -> BaseResponse:
        """Approve reward by account team (second level)"""
        reward = self.service.approve_by_account_team(reward_id, data, approved_by)
        return BaseResponse(
            success=True,
            message="Reward approved by account team. Ready for disbursement.",
            data={
                "id": str(reward.id),
                "status": reward.status,
                "account_team_approved_at": reward.account_team_approved_at.isoformat() if reward.account_team_approved_at else None,
            }
        )

