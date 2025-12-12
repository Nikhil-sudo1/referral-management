"""
Pydantic Schemas
Request/Response validation models
"""
from app.schemas.common import (
    BaseResponse,
    PaginatedResponse,
    PaginationParams,
)
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
)
from app.schemas.university import (
    UniversityCreate,
    UniversityUpdate,
    UniversityResponse,
    UniversityListResponse,
    UniversityStatsResponse,
)
from app.schemas.program import (
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
    ProgramListResponse,
)
from app.schemas.referral import (
    ReferralCreate,
    ReferralSubmit,
    ReferralUpdate,
    ReferralStatusUpdate,
    ReferralAssign,
    ReferralResponse,
    ReferralListResponse,
    ReferralStatsResponse,
)
from app.schemas.reward import (
    RewardCreate,
    RewardResponse,
    RewardListResponse,
    RewardApprove,
    RewardDisburse,
    RewardTierResponse,
)
from app.schemas.leaderboard import (
    LeaderboardEntry,
    LeaderboardResponse,
)
from app.schemas.analytics import (
    DashboardStats,
    AnalyticsResponse,
)

__all__ = [
    # Common
    "BaseResponse",
    "PaginatedResponse",
    "PaginationParams",
    # Auth
    "LoginRequest",
    "LoginResponse",
    "RegisterRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    # University
    "UniversityCreate",
    "UniversityUpdate",
    "UniversityResponse",
    "UniversityListResponse",
    "UniversityStatsResponse",
    # Program
    "ProgramCreate",
    "ProgramUpdate",
    "ProgramResponse",
    "ProgramListResponse",
    # Referral
    "ReferralCreate",
    "ReferralSubmit",
    "ReferralUpdate",
    "ReferralStatusUpdate",
    "ReferralAssign",
    "ReferralResponse",
    "ReferralListResponse",
    "ReferralStatsResponse",
    # Reward
    "RewardCreate",
    "RewardResponse",
    "RewardListResponse",
    "RewardApprove",
    "RewardDisburse",
    "RewardTierResponse",
    # Leaderboard
    "LeaderboardEntry",
    "LeaderboardResponse",
    # Analytics
    "DashboardStats",
    "AnalyticsResponse",
]

