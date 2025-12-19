"""
API Routes
Aggregates all route modules
"""
from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    universities,
    programs,
    referrals,
    rewards,
    leaderboard,
    analytics,
    notifications,
    public,
    partner,
)

router = APIRouter()

# Public routes (no authentication required)
router.include_router(public.router, prefix="/public", tags=["Public"])
router.include_router(partner.router, prefix="/partner", tags=["Partner"])

# Include all route modules
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(universities.router, prefix="/universities", tags=["Universities"])
router.include_router(programs.router, prefix="/programs", tags=["Programs"])
router.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
router.include_router(rewards.router, prefix="/rewards", tags=["Rewards"])
router.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

__all__ = ["router"]

