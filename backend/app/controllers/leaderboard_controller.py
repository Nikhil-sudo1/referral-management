"""
Leaderboard Controller
Maps leaderboard requests to service calls
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.leaderboard_service import LeaderboardService
from app.schemas.common import BaseResponse


class LeaderboardController:
    """Leaderboard controller"""
    
    def __init__(self, db: Session):
        self.service = LeaderboardService(db)
    
    def get_referrer_leaderboard(
        self,
        period: str = "all_time",
        limit: int = 10,
        current_user_id: Optional[UUID] = None,
    ) -> BaseResponse:
        """Get referrer leaderboard"""
        result = self.service.get_referrer_leaderboard(
            period=period,
            limit=limit,
            current_user_id=current_user_id,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "entries": [e.model_dump() for e in result.entries],
                "current_user": result.current_user.model_dump() if result.current_user else None,
                "period": result.period,
                "updated_at": result.updated_at.isoformat(),
            }
        )
    
    def get_counselor_leaderboard(
        self,
        period: str = "all_time",
        limit: int = 10,
    ) -> BaseResponse:
        """Get counselor leaderboard"""
        result = self.service.get_counselor_leaderboard(
            period=period,
            limit=limit,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "entries": [e.model_dump() for e in result.entries],
                "period": result.period,
                "updated_at": result.updated_at.isoformat(),
            }
        )
    
    def get_my_rank(self, user_id: UUID) -> BaseResponse:
        """Get current user's rank"""
        result = self.service.get_my_rank(user_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )

