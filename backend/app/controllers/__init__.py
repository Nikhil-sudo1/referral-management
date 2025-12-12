"""
Controllers
Handle request/response mapping - no business logic
"""
from app.controllers.auth_controller import AuthController
from app.controllers.user_controller import UserController
from app.controllers.university_controller import UniversityController
from app.controllers.program_controller import ProgramController
from app.controllers.referral_controller import ReferralController
from app.controllers.reward_controller import RewardController
from app.controllers.leaderboard_controller import LeaderboardController
from app.controllers.analytics_controller import AnalyticsController

__all__ = [
    "AuthController",
    "UserController",
    "UniversityController",
    "ProgramController",
    "ReferralController",
    "RewardController",
    "LeaderboardController",
    "AnalyticsController",
]

