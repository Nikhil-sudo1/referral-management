"""
Public Routes - No authentication required
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.referral import Referral
from app.models.reward import Reward
from app.models.user import User
from app.models.university import University
from app.schemas.common import BaseResponse
from app.core.cache import get_cached, set_cached
from loguru import logger

router = APIRouter()


@router.get("/stats", response_model=BaseResponse)
async def get_public_stats(db: Session = Depends(get_db)):
    """
    Get public statistics for landing page - no authentication required
    These are aggregate stats safe for public display
    """
    # Check cache first (60 second cache)
    cache_key = "public_landing_stats"
    cached_result = get_cached(cache_key)
    if cached_result is not None:
        logger.info("Public stats: cache hit")
        return BaseResponse(success=True, message="Success", data=cached_result)
    
    logger.info("Public stats: cache miss, fetching from database")
    
    try:
        # Total active referrers
        total_referrers = db.query(func.count(User.id)).filter(
            User.role == "referrer",
            User.is_active == True
        ).scalar() or 0
        
        # Total successful admissions
        total_admissions = db.query(func.count(Referral.id)).filter(
            Referral.status == "admitted"
        ).scalar() or 0
        
        # Total rewards disbursed
        total_rewards_raw = db.query(func.sum(Reward.amount)).filter(
            Reward.status == "disbursed"
        ).scalar()
        total_rewards = float(total_rewards_raw) if total_rewards_raw else 0.0
        
        # Format rewards for display (in Lakhs or Crores)
        if total_rewards >= 10000000:  # 1 Crore
            rewards_display = f"₹{total_rewards / 10000000:.1f}Cr+"
        elif total_rewards >= 100000:  # 1 Lakh
            rewards_display = f"₹{total_rewards / 100000:.1f}L+"
        else:
            rewards_display = f"₹{total_rewards:,.0f}"
        
        # Active universities
        active_universities = db.query(func.count(University.id)).filter(
            University.status == "active"
        ).scalar() or 0
        
        # Calculate success rate
        total_referrals = db.query(func.count(Referral.id)).scalar() or 0
        success_rate = 0.0
        if total_referrals > 0:
            success_rate = round((total_admissions / total_referrals) * 100, 0)
        
        stats = {
            "total_referrers": total_referrers,
            "total_referrers_display": f"{total_referrers:,}+" if total_referrers > 0 else "0",
            "total_admissions": total_admissions,
            "total_admissions_display": f"{total_admissions:,}+" if total_admissions > 0 else "0",
            "total_rewards": total_rewards,
            "total_rewards_display": rewards_display,
            "active_universities": active_universities,
            "active_universities_display": f"{active_universities}+" if active_universities > 0 else "0",
            "success_rate": success_rate,
            "success_rate_display": f"{success_rate:.0f}%" if success_rate > 0 else "85%",
        }
        
        # Cache for 60 seconds
        set_cached(cache_key, stats, ttl=60)
        
        return BaseResponse(success=True, message="Success", data=stats)
        
    except Exception as e:
        logger.error(f"Error fetching public stats: {e}")
        # Return default stats on error
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "total_referrers": 0,
                "total_referrers_display": "50K+",
                "total_admissions": 0,
                "total_admissions_display": "10K+",
                "total_rewards": 0,
                "total_rewards_display": "₹2Cr+",
                "active_universities": 0,
                "active_universities_display": "100+",
                "success_rate": 85,
                "success_rate_display": "85%",
            }
        )

