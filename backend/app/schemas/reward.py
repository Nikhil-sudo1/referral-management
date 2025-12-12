"""
Reward Schemas
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class RewardCreate(BaseModel):
    """Create reward schema"""
    referral_id: UUID
    user_id: UUID
    user_type: str = Field(..., pattern="^(referrer|counselor|referee)$")
    reward_type: str = Field(..., pattern="^(voucher|points|cashback)$")
    amount: Decimal = Field(..., gt=0)


class RewardApprove(BaseModel):
    """Approve reward schema"""
    notes: Optional[str] = None


class RewardDisburse(BaseModel):
    """Disburse reward schema"""
    disbursement_method: str = Field(..., max_length=50)
    transaction_reference: Optional[str] = None


class RewardCancel(BaseModel):
    """Cancel reward schema"""
    reason: str


class UserBrief(BaseModel):
    """User brief info"""
    id: UUID
    name: str
    type: str


class RewardResponse(BaseModel):
    """Reward response schema"""
    id: UUID
    referral_code: str
    user: UserBrief
    reward_type: str
    amount: Decimal
    status: str
    approved_at: Optional[datetime] = None
    disbursed_at: Optional[datetime] = None
    disbursement_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RewardListItem(BaseModel):
    """Reward list item"""
    id: UUID
    referral_code: str
    user_name: str
    user_type: str
    reward_type: str
    amount: Decimal
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RewardStats(BaseModel):
    """Reward statistics"""
    total_pending: Decimal
    total_approved: Decimal
    total_disbursed: Decimal
    average_reward: Decimal


class RewardListResponse(BaseModel):
    """Reward list response"""
    items: List[RewardListItem]
    total: int
    page: int
    limit: int
    pages: int
    stats: RewardStats


class RewardTierResponse(BaseModel):
    """Reward tier response"""
    tier_name: str
    min_referrals: int
    max_referrals: Optional[int] = None
    multiplier: Decimal
    bonus_amount: Decimal
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class MyRewardsSummary(BaseModel):
    """User's rewards summary"""
    total_earned: Decimal
    total_pending: Decimal
    total_withdrawn: Decimal
    available_for_withdrawal: Decimal


class MyRewardsResponse(BaseModel):
    """User's rewards response"""
    items: List[RewardListItem]
    summary: MyRewardsSummary

