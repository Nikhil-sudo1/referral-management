"""
User Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """User table model"""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    role_id = Column(Integer, ForeignKey("role_master.id", ondelete="SET NULL"), nullable=True, index=True)
    # Legacy role field for backward compatibility - keep as string for now
    role = Column(String(50), nullable=True, index=True)
    avatar_url = Column(String(500))
    organization = Column(String(255))
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="SET NULL"))
    referral_code = Column(String(50), unique=True, index=True)
    tier = Column(String(50), default="Bronze")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Email verification tokens
    verification_token = Column(String(255), nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)
    
    # Password reset tokens
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    
    # Relationships
    # Note: role_details is the relationship, role is the legacy string column
    role_details = relationship("Role", back_populates="users")
    university = relationship("University", back_populates="counselors")
    referrals_made = relationship(
        "Referral",
        back_populates="referrer",
        foreign_keys="Referral.referrer_id"
    )
    assigned_referrals = relationship(
        "Referral",
        back_populates="counselor",
        foreign_keys="Referral.counselor_id"
    )
    rewards = relationship("Reward", back_populates="user", foreign_keys="Reward.user_id")
    
    def __repr__(self):
        return f"<User {self.email}>"

