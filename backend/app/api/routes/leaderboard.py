"""
Leaderboard Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.leaderboard_controller import LeaderboardController
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("/referrers", response_model=BaseResponse)
async def get_referrer_leaderboard(
    period: str = Query("all_time", pattern="^(all_time|monthly|weekly)$"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get referrer leaderboard
    
    Args:
        period: all_time, monthly, or weekly
        limit: Number of entries to return
    """
    try:
        controller = LeaderboardController(db)
        return controller.get_referrer_leaderboard(
            period=period,
            limit=limit,
            current_user_id=current_user.id if current_user.role == "referrer" else None,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/counselors", response_model=BaseResponse)
async def get_counselor_leaderboard(
    period: str = Query("all_time", pattern="^(all_time|monthly|weekly)$"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get counselor leaderboard
    """
    try:
        controller = LeaderboardController(db)
        return controller.get_counselor_leaderboard(
            period=period,
            limit=limit,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-rank", response_model=BaseResponse)
async def get_my_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's rank and statistics
    """
    try:
        controller = LeaderboardController(db)
        return controller.get_my_rank(current_user.id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

