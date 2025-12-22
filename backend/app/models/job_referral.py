"""
Job Referral Model
For employee referrals of candidates for job positions
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class JobReferral(Base):
    """Job Referral table model - for employee referrals for jobs"""
    
    __tablename__ = "job_referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referral_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Referrer info (the employee making the referral)
    referrer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True
    )
    referrer_name = Column(String(255), nullable=False)
    referrer_email = Column(String(255), nullable=False)
    referrer_phone = Column(String(20), nullable=False)
    
    # Referee (candidate) info
    referee_name = Column(String(255), nullable=False)
    referee_email = Column(String(255), nullable=False, index=True)
    referee_phone = Column(String(20), nullable=False)
    referee_resume_url = Column(String(500))  # Optional resume link
    referee_linkedin = Column(String(500))  # Optional LinkedIn profile
    referee_experience = Column(Numeric(5, 2), default=0)  # Years of experience
    referee_current_company = Column(String(255))
    referee_current_designation = Column(String(255))
    
    # Job details
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status tracking
    status = Column(String(50), default="submitted", index=True)
    # Statuses: submitted, screening, interview_scheduled, interviewed, offered, joined, rejected
    status_notes = Column(Text)
    
    # Dates
    submission_date = Column(DateTime, default=datetime.utcnow, index=True)
    screening_date = Column(DateTime)
    interview_date = Column(DateTime)
    offer_date = Column(DateTime)
    joining_date = Column(DateTime)
    rejection_date = Column(DateTime)
    
    # Reward calculation
    slab_tier = Column(Integer, default=1)
    expected_reward = Column(Numeric(12, 2))
    actual_reward = Column(Numeric(12, 2))
    reward_status = Column(String(50), default="pending")  # pending, approved, disbursed
    
    # Metadata
    source = Column(String(100), default="employee_portal")
    notes = Column(Text)
    
    # HR tracking
    hr_assigned_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    hr_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    referrer = relationship(
        "User",
        back_populates="job_referrals_made",
        foreign_keys=[referrer_id]
    )
    hr_assigned = relationship(
        "User",
        foreign_keys=[hr_assigned_id]
    )
    job = relationship("Job", back_populates="referrals")
    company = relationship("Company", back_populates="job_referrals")
    industry = relationship("Industry", back_populates="job_referrals")
    
    def __repr__(self):
        return f"<JobReferral {self.referral_code} - {self.referee_name}>"


class JobReferralReward(Base):
    """Reward ledger for job referrals"""
    
    __tablename__ = "job_referral_rewards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_referral_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_referrals.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    reward_type = Column(String(50), nullable=False)  # bonus, incentive, slab_bonus
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="pending", index=True)  # pending, approved, disbursed
    
    # Approval tracking
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at = Column(DateTime)
    approval_notes = Column(Text)
    
    # Disbursement tracking
    disbursed_at = Column(DateTime)
    disbursement_method = Column(String(50))  # bank_transfer, upi, cheque
    transaction_reference = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job_referral = relationship("JobReferral")
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<JobReferralReward {self.id} - Rs.{self.amount}>"


class JobRewardSlab(Base):
    """Reward slab configuration for job referrals"""
    
    __tablename__ = "job_reward_slabs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slab_name = Column(String(50), nullable=False)  # Bronze, Silver, Gold, Platinum, Diamond
    min_referrals = Column(Integer, nullable=False)
    max_referrals = Column(Integer)
    reward_per_referral = Column(Numeric(12, 2), default=0)
    bonus_amount = Column(Numeric(12, 2), default=0)  # Extra bonus on reaching this slab
    level = Column(Integer, nullable=False)  # 1, 2, 3, 4, 5
    description = Column(Text)
    icon = Column(String(50))  # Icon name for UI
    color = Column(String(50))  # Color code for UI
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<JobRewardSlab {self.slab_name} - Level {self.level}>"

