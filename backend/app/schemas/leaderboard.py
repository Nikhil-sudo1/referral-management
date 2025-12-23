"""
Leaderboard Schemas
"""
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class LeaderboardEntry(BaseModel):
    """Leaderboard entry schema"""
    rank: int
    user_id: UUID
    user_name: str
    referrer_code: Optional[str] = None  # Referral code of the referrer
    avatar_url: Optional[str] = None
    total_referrals: int
    total_admissions: int
    conversion_rate: float
    total_rewards: Decimal
    tier: Optional[str] = None
    growth_rate: float = 0.0
    
    model_config = ConfigDict(from_attributes=True)


class CurrentUserRank(BaseModel):
    """Current user's rank info"""
    rank: int
    user_id: UUID
    total_referrals: int
    total_admissions: int


class LeaderboardResponse(BaseModel):
    """Leaderboard response"""
    entries: List[LeaderboardEntry]
    current_user: Optional[CurrentUserRank] = None
    period: str
    updated_at: datetime


class MyRankResponse(BaseModel):
    """Current user's rank response"""
    rank: int
    total_referrers: int
    total_referrals: int
    total_admissions: int
    conversion_rate: float
    total_rewards: Decimal
    tier: str
    next_tier: Optional[str] = None
    referrals_to_next_tier: Optional[int] = None

