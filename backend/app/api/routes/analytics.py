"""
Analytics Routes
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.analytics_controller import AnalyticsController
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user, get_referrer_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("/dashboard", response_model=BaseResponse)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get main dashboard statistics
    
    Data visibility based on role:
    - super_admin/admin: ALL data
    - manager/counselor: Only their university's data
    - referrer: Only their own data
    """
    try:
        controller = AnalyticsController(db)
        return controller.get_dashboard_stats(current_user)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/referrals", response_model=BaseResponse)
async def get_referral_analytics(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    group_by: str = Query("month", pattern="^(day|week|month)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get detailed referral analytics (admin only)
    """
    try:
        controller = AnalyticsController(db)
        return controller.get_referral_analytics(
            date_from=date_from,
            date_to=date_to,
            group_by=group_by,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-analytics", response_model=BaseResponse)
async def get_my_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_referrer_user),
):
    """
    Get analytics for current referrer
    """
    try:
        controller = AnalyticsController(db)
        return controller.get_my_analytics(current_user.id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

