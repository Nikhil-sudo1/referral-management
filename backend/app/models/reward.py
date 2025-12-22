"""
Reward and RewardTier Models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Reward(Base):
    """Reward ledger table model"""
    
    __tablename__ = "rewards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referral_id = Column(
        UUID(as_uuid=True),
        ForeignKey("referrals.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    user_type = Column(String(50), nullable=False, index=True)  # referrer, counselor, referee
    reward_type = Column(String(50), nullable=False)  # voucher, points, cashback
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="pending", index=True)
    
    # Approval tracking (legacy - for backward compatibility)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime)
    approval_notes = Column(Text)
    
    # Student-Admin approval tracking
    student_admin_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    student_admin_approved_at = Column(DateTime)
    student_admin_approval_notes = Column(Text)
    
    # Account Team approval tracking
    account_team_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    account_team_approved_at = Column(DateTime)
    account_team_approval_notes = Column(Text)
    
    # Disbursement tracking
    disbursed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    disbursed_at = Column(DateTime)
    disbursement_method = Column(String(50))
    transaction_reference = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    referral = relationship("Referral", back_populates="rewards")
    user = relationship("User", back_populates="rewards", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<Reward {self.id} - {self.amount}>"


class RewardTier(Base):
    """Reward tier configuration table model"""
    
    __tablename__ = "reward_tiers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tier_name = Column(String(50), nullable=False)
    min_referrals = Column(Integer, nullable=False)
    max_referrals = Column(Integer)
    multiplier = Column(Numeric(4, 2), default=1.00)
    bonus_amount = Column(Numeric(12, 2), default=0)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<RewardTier {self.tier_name}>"

