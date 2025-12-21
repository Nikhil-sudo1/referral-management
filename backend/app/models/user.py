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
    """User table model - Restructured for role-based access"""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    mobile_number = Column(String(20), nullable=False)
    password = Column(String(255), nullable=False)  # Hashed password
    email_verification = Column(Boolean, default=False)
    user_type_id = Column(Integer, ForeignKey("user_type_master.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("role_master.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    univ_id = Column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="SET NULL"), nullable=True)  # For Student Referrer
    org_id = Column(Integer, nullable=True)  # For Employee
    referral_code = Column(String(50), unique=True, index=True)
    
    # Bank details for reward payouts
    bank_acc = Column(String(50))
    bank_ifsc = Column(String(20))
    bank_name = Column(String(100))
    account_holder_name = Column(String(255))
    
    # Email verification tokens (for email service)
    verification_token = Column(String(255), nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)
    
    # Password reset tokens
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_type = relationship("UserType")
    role_details = relationship("Role", back_populates="users")
    university = relationship("University", back_populates="users")
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
    job_referrals_made = relationship(
        "JobReferral",
        back_populates="referrer",
        foreign_keys="JobReferral.referrer_id"
    )
    
    def __repr__(self):
        return f"<User {self.email}>"

