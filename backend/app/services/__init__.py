"""
Service Layer
All business logic is implemented here
"""
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.university_service import UniversityService
from app.services.program_service import ProgramService
from app.services.referral_service import ReferralService
from app.services.reward_service import RewardService
from app.services.leaderboard_service import LeaderboardService
from app.services.analytics_service import AnalyticsService
from app.services.notification_service import NotificationService

__all__ = [
    "AuthService",
    "UserService",
    "UniversityService",
    "ProgramService",
    "ReferralService",
    "RewardService",
    "LeaderboardService",
    "AnalyticsService",
    "NotificationService",
]

