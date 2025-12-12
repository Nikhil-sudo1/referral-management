"""
Leaderboard Service
Leaderboard and ranking operations
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.referral import Referral
from app.models.reward import Reward
from app.schemas.leaderboard import (
    LeaderboardEntry,
    LeaderboardResponse,
    CurrentUserRank,
    MyRankResponse,
)
from app.core.logging import logger


class LeaderboardService:
    """Leaderboard service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_referrer_leaderboard(
        self,
        period: str = "all_time",
        limit: int = 10,
        current_user_id: Optional[UUID] = None,
    ) -> LeaderboardResponse:
        """
        Get referrer leaderboard
        
        Args:
            period: all_time, monthly, weekly
            limit: Number of entries to return
            current_user_id: Current user for ranking
        """
        # Get all referrers with their stats
        referrers = self.db.query(User).filter(
            User.role == "referrer",
            User.is_active == True
        ).all()
        
        entries = []
        for referrer in referrers:
            # Count referrals
            referral_query = self.db.query(Referral).filter(
                Referral.referrer_id == referrer.id
            )
            
            # Apply period filter
            if period == "monthly":
                start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
                referral_query = referral_query.filter(
                    Referral.submission_date >= start_of_month
                )
            elif period == "weekly":
                from datetime import timedelta
                start_of_week = datetime.utcnow() - timedelta(days=7)
                referral_query = referral_query.filter(
                    Referral.submission_date >= start_of_week
                )
            
            total_referrals = referral_query.count()
            total_admissions = referral_query.filter(
                Referral.status == "admitted"
            ).count()
            
            # Get total rewards
            total_rewards = self.db.query(func.sum(Reward.amount)).filter(
                Reward.user_id == referrer.id,
                Reward.status == "disbursed"
            ).scalar() or Decimal("0")
            
            conversion_rate = 0.0
            if total_referrals > 0:
                conversion_rate = round((total_admissions / total_referrals) * 100, 1)
            
            entries.append({
                "user_id": referrer.id,
                "user_name": referrer.name,
                "avatar_url": referrer.avatar_url,
                "tier": referrer.tier,
                "total_referrals": total_referrals,
                "total_admissions": total_admissions,
                "conversion_rate": conversion_rate,
                "total_rewards": total_rewards,
            })
        
        # Sort by admissions (primary) and referrals (secondary)
        entries.sort(key=lambda x: (-x["total_admissions"], -x["total_referrals"]))
        
        # Assign ranks and calculate growth
        leaderboard_entries = []
        for i, entry in enumerate(entries[:limit], 1):
            leaderboard_entries.append(LeaderboardEntry(
                rank=i,
                user_id=entry["user_id"],
                user_name=entry["user_name"],
                avatar_url=entry["avatar_url"],
                total_referrals=entry["total_referrals"],
                total_admissions=entry["total_admissions"],
                conversion_rate=entry["conversion_rate"],
                total_rewards=entry["total_rewards"],
                tier=entry["tier"],
                growth_rate=0.0,  # Would need historical data
            ))
        
        # Get current user rank
        current_user = None
        if current_user_id:
            for i, entry in enumerate(entries, 1):
                if entry["user_id"] == current_user_id:
                    current_user = CurrentUserRank(
                        rank=i,
                        user_id=entry["user_id"],
                        total_referrals=entry["total_referrals"],
                        total_admissions=entry["total_admissions"],
                    )
                    break
        
        return LeaderboardResponse(
            entries=leaderboard_entries,
            current_user=current_user,
            period=period,
            updated_at=datetime.utcnow(),
        )
    
    def get_counselor_leaderboard(
        self,
        period: str = "all_time",
        limit: int = 10,
    ) -> LeaderboardResponse:
        """
        Get counselor leaderboard
        """
        counselors = self.db.query(User).filter(
            User.role == "counselor",
            User.is_active == True
        ).all()
        
        entries = []
        for counselor in counselors:
            referral_query = self.db.query(Referral).filter(
                Referral.counselor_id == counselor.id
            )
            
            if period == "monthly":
                start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
                referral_query = referral_query.filter(
                    Referral.submission_date >= start_of_month
                )
            
            total_referrals = referral_query.count()
            total_admissions = referral_query.filter(
                Referral.status == "admitted"
            ).count()
            
            total_rewards = self.db.query(func.sum(Reward.amount)).filter(
                Reward.user_id == counselor.id,
                Reward.status == "disbursed"
            ).scalar() or Decimal("0")
            
            conversion_rate = 0.0
            if total_referrals > 0:
                conversion_rate = round((total_admissions / total_referrals) * 100, 1)
            
            entries.append({
                "user_id": counselor.id,
                "user_name": counselor.name,
                "avatar_url": counselor.avatar_url,
                "tier": None,
                "total_referrals": total_referrals,
                "total_admissions": total_admissions,
                "conversion_rate": conversion_rate,
                "total_rewards": total_rewards,
            })
        
        entries.sort(key=lambda x: (-x["total_admissions"], -x["total_referrals"]))
        
        leaderboard_entries = []
        for i, entry in enumerate(entries[:limit], 1):
            leaderboard_entries.append(LeaderboardEntry(
                rank=i,
                user_id=entry["user_id"],
                user_name=entry["user_name"],
                avatar_url=entry["avatar_url"],
                total_referrals=entry["total_referrals"],
                total_admissions=entry["total_admissions"],
                conversion_rate=entry["conversion_rate"],
                total_rewards=entry["total_rewards"],
                tier=entry["tier"],
                growth_rate=0.0,
            ))
        
        return LeaderboardResponse(
            entries=leaderboard_entries,
            current_user=None,
            period=period,
            updated_at=datetime.utcnow(),
        )
    
    def get_my_rank(self, user_id: UUID) -> MyRankResponse:
        """
        Get current user's rank and statistics
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            from app.core.exceptions import NotFoundException
            raise NotFoundException("User not found")
        
        # Get user stats
        total_referrals = self.db.query(Referral).filter(
            Referral.referrer_id == user_id
        ).count()
        
        total_admissions = self.db.query(Referral).filter(
            Referral.referrer_id == user_id,
            Referral.status == "admitted"
        ).count()
        
        total_rewards = self.db.query(func.sum(Reward.amount)).filter(
            Reward.user_id == user_id,
            Reward.status == "disbursed"
        ).scalar() or Decimal("0")
        
        conversion_rate = 0.0
        if total_referrals > 0:
            conversion_rate = round((total_admissions / total_referrals) * 100, 1)
        
        # Calculate rank
        leaderboard = self.get_referrer_leaderboard(limit=1000, current_user_id=user_id)
        rank = leaderboard.current_user.rank if leaderboard.current_user else 0
        total_referrers = self.db.query(User).filter(
            User.role == "referrer",
            User.is_active == True
        ).count()
        
        # Determine next tier
        tier_progression = {
            "Bronze": ("Silver", 6),
            "Silver": ("Gold", 11),
            "Gold": ("Platinum", 21),
            "Platinum": (None, None),
        }
        
        current_tier = user.tier or "Bronze"
        next_tier, required = tier_progression.get(current_tier, (None, None))
        referrals_to_next = None
        if required:
            referrals_to_next = max(0, required - total_admissions)
        
        return MyRankResponse(
            rank=rank,
            total_referrers=total_referrers,
            total_referrals=total_referrals,
            total_admissions=total_admissions,
            conversion_rate=conversion_rate,
            total_rewards=total_rewards,
            tier=current_tier,
            next_tier=next_tier,
            referrals_to_next_tier=referrals_to_next,
        )

