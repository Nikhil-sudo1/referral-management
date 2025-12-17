"""
Analytics Controller
Maps analytics requests to service calls
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.analytics_service import AnalyticsService
from app.schemas.common import BaseResponse
from app.models.user import User


class AnalyticsController:
    """Analytics controller"""
    
    def __init__(self, db: Session):
        self.service = AnalyticsService(db)
    
    def get_dashboard_stats(self, current_user: User = None) -> BaseResponse:
        """Get dashboard statistics filtered by user role"""
        stats = self.service.get_dashboard_stats(current_user)
        return BaseResponse(
            success=True,
            message="Success",
            data=stats.model_dump()
        )
    
    def get_referral_analytics(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        group_by: str = "month",
    ) -> BaseResponse:
        """Get detailed referral analytics"""
        result = self.service.get_referral_analytics(
            date_from=date_from,
            date_to=date_to,
            group_by=group_by,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_my_analytics(self, user_id: UUID) -> BaseResponse:
        """Get analytics for current referrer"""
        result = self.service.get_my_analytics(user_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )

