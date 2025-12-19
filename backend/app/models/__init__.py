"""
SQLAlchemy Models
Database table definitions
"""
from app.models.user import User
from app.models.university import University
from app.models.program import Program
from app.models.referral import Referral
from app.models.reward import Reward, RewardTier
from app.models.notification import Notification
from app.models.settings import Settings
from app.models.audit import AuditLog
from app.models.partner_type import PartnerType
from app.models.region import Region

__all__ = [
    "User",
    "University",
    "Program",
    "Referral",
    "Reward",
    "RewardTier",
    "Notification",
    "Settings",
    "AuditLog",
    "PartnerType",
    "Region",
]

