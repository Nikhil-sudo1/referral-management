"""
Reward Service
Reward management operations
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reward import Reward, RewardTier
from app.models.referral import Referral
from app.models.user import User
from app.schemas.reward import (
    RewardCreate,
    RewardApprove,
    RewardDisburse,
    RewardListResponse,
    RewardListItem,
    RewardStats,
    RewardTierResponse,
    MyRewardsSummary,
    MyRewardsResponse,
    UserBrief,
)
from app.core.exceptions import NotFoundException, ValidationException
from app.core.logging import logger
import math


class RewardService:
    """Reward service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_rewards(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        user_type: Optional[str] = None,
        user_id: Optional[UUID] = None,
        referral_id: Optional[UUID] = None,
    ) -> RewardListResponse:
        """
        Get paginated list of rewards
        """
        query = self.db.query(Reward)
        
        if status:
            query = query.filter(Reward.status == status)
        
        if user_type:
            query = query.filter(Reward.user_type == user_type)
        
        if user_id:
            query = query.filter(Reward.user_id == user_id)
        
        if referral_id:
            query = query.filter(Reward.referral_id == referral_id)
        
        total = query.count()
        
        # Get stats
        stats = self._get_reward_stats()
        
        offset = (page - 1) * limit
        rewards = query.order_by(Reward.created_at.desc()).offset(offset).limit(limit).all()
        
        items = []
        for reward in rewards:
            referral = self.db.query(Referral).filter(
                Referral.id == reward.referral_id
            ).first()
            user = self.db.query(User).filter(User.id == reward.user_id).first()
            
            items.append(RewardListItem(
                id=reward.id,
                referral_code=referral.referral_code if referral else "",
                user_name=user.full_name if user else "Unknown",
                user_type=reward.user_type,
                reward_type=reward.reward_type,
                amount=reward.amount,
                status=reward.status,
                created_at=reward.created_at,
            ))
        
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return RewardListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            stats=stats,
        )
    
    def get_reward_by_id(self, reward_id: UUID) -> Reward:
        """Get reward by ID"""
        reward = self.db.query(Reward).filter(Reward.id == reward_id).first()
        
        if not reward:
            raise NotFoundException(f"Reward not found: {reward_id}")
        
        return reward
    
    def create_reward(self, data: RewardCreate) -> Reward:
        """
        Create a new reward entry
        """
        # Verify referral exists
        referral = self.db.query(Referral).filter(
            Referral.id == data.referral_id
        ).first()
        if not referral:
            raise NotFoundException("Referral not found")
        
        # Verify user exists
        user = self.db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise NotFoundException("User not found")
        
        reward = Reward(
            referral_id=data.referral_id,
            user_id=data.user_id,
            user_type=data.user_type,
            reward_type=data.reward_type,
            amount=data.amount,
            status="pending",
        )
        
        self.db.add(reward)
        self.db.commit()
        self.db.refresh(reward)
        
        logger.info(f"Reward created for {user.email}: {data.amount}")
        return reward
    
    def approve_reward(self, reward_id: UUID, data: RewardApprove, approved_by: UUID) -> Reward:
        """
        Approve a pending reward
        """
        reward = self.get_reward_by_id(reward_id)
        
        if reward.status != "pending":
            raise ValidationException(f"Cannot approve reward with status: {reward.status}")
        
        reward.status = "approved"
        reward.approved_by = approved_by
        reward.approved_at = datetime.utcnow()
        reward.approval_notes = data.notes
        
        self.db.commit()
        self.db.refresh(reward)
        
        logger.info(f"Reward approved: {reward_id}")
        return reward
    
    def disburse_reward(self, reward_id: UUID, data: RewardDisburse, disbursed_by: UUID) -> Reward:
        """
        Disburse an approved reward
        """
        reward = self.get_reward_by_id(reward_id)
        
        if reward.status != "approved":
            raise ValidationException(f"Cannot disburse reward with status: {reward.status}")
        
        reward.status = "disbursed"
        reward.disbursed_by = disbursed_by
        reward.disbursed_at = datetime.utcnow()
        reward.disbursement_method = data.disbursement_method
        reward.transaction_reference = data.transaction_reference
        
        self.db.commit()
        self.db.refresh(reward)
        
        logger.info(f"Reward disbursed: {reward_id}")
        return reward
    
    def cancel_reward(self, reward_id: UUID, reason: str) -> Reward:
        """
        Cancel a reward
        """
        reward = self.get_reward_by_id(reward_id)
        
        if reward.status == "disbursed":
            raise ValidationException("Cannot cancel a disbursed reward")
        
        reward.status = "cancelled"
        reward.approval_notes = f"Cancelled: {reason}"
        
        self.db.commit()
        self.db.refresh(reward)
        
        logger.info(f"Reward cancelled: {reward_id}")
        return reward
    
    def get_my_rewards(self, user_id: UUID) -> MyRewardsResponse:
        """
        Get rewards for current user with summary
        """
        rewards = self.db.query(Reward).filter(
            Reward.user_id == user_id
        ).order_by(Reward.created_at.desc()).all()
        
        # Calculate summary
        total_earned = sum(r.amount for r in rewards if r.status == "disbursed")
        total_pending = sum(r.amount for r in rewards if r.status in ["pending", "approved"])
        total_withdrawn = total_earned  # Assuming all disbursed = withdrawn
        
        items = []
        for reward in rewards:
            referral = self.db.query(Referral).filter(
                Referral.id == reward.referral_id
            ).first()
            
            items.append(RewardListItem(
                id=reward.id,
                referral_code=referral.referral_code if referral else "",
                user_name="",  # Not needed for own rewards
                user_type=reward.user_type,
                reward_type=reward.reward_type,
                amount=reward.amount,
                status=reward.status,
                created_at=reward.created_at,
            ))
        
        return MyRewardsResponse(
            items=items,
            summary=MyRewardsSummary(
                total_earned=total_earned,
                total_pending=total_pending,
                total_withdrawn=total_withdrawn,
                available_for_withdrawal=total_pending,
            )
        )
    
    def get_reward_tiers(self) -> List[RewardTierResponse]:
        """
        Get reward tier configuration
        """
        tiers = self.db.query(RewardTier).filter(
            RewardTier.is_active == True
        ).order_by(RewardTier.min_referrals).all()
        
        return [RewardTierResponse.model_validate(t) for t in tiers]
    
    def create_reward_for_admission(self, referral: Referral) -> List[Reward]:
        """
        Create rewards when a referral is admitted
        """
        # Check if rewards already exist for this referral to prevent duplicates
        existing_rewards = self.db.query(Reward).filter(
            Reward.referral_id == referral.id
        ).all()
        
        if existing_rewards:
            logger.warning(f"Rewards already exist for referral {referral.referral_code}. Skipping creation.")
            return existing_rewards
        
        rewards_created = []
        
        # Reward for referrer
        if referral.referrer_id:
            referrer_reward = Reward(
                referral_id=referral.id,
                user_id=referral.referrer_id,
                user_type="referrer",
                reward_type="cashback",
                amount=referral.expected_reward or Decimal("0"),
                status="pending",
            )
            self.db.add(referrer_reward)
            rewards_created.append(referrer_reward)
        
        # Reward for counselor
        if referral.counselor_id:
            # Counselor gets a portion of the reward
            counselor_amount = (referral.expected_reward or Decimal("0")) * Decimal("0.5")
            counselor_reward = Reward(
                referral_id=referral.id,
                user_id=referral.counselor_id,
                user_type="counselor",
                reward_type="cashback",
                amount=counselor_amount,
                status="pending",
            )
            self.db.add(counselor_reward)
            rewards_created.append(counselor_reward)
        
        self.db.commit()
        
        logger.info(f"Rewards created for admission: {referral.referral_code}")
        return rewards_created
    
    def _get_reward_stats(self) -> RewardStats:
        """Get reward statistics"""
        pending = self.db.query(func.sum(Reward.amount)).filter(
            Reward.status == "pending"
        ).scalar() or Decimal("0")
        
        approved = self.db.query(func.sum(Reward.amount)).filter(
            Reward.status == "approved"
        ).scalar() or Decimal("0")
        
        disbursed = self.db.query(func.sum(Reward.amount)).filter(
            Reward.status == "disbursed"
        ).scalar() or Decimal("0")
        
        total_count = self.db.query(Reward).count()
        total_amount = self.db.query(func.sum(Reward.amount)).scalar() or Decimal("0")
        average = total_amount / total_count if total_count > 0 else Decimal("0")
        
        return RewardStats(
            total_pending=pending,
            total_approved=approved,
            total_disbursed=disbursed,
            average_reward=average,
        )

