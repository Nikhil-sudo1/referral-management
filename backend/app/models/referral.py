"""
Referral Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Referral(Base):
    """Referral table model"""
    
    __tablename__ = "referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referral_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Referrer info
    referrer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True
    )
    referrer_name = Column(String(255), nullable=False)
    referrer_email = Column(String(255), nullable=False)
    referrer_phone = Column(String(20), nullable=False)
    
    # Referee (student) info
    referee_name = Column(String(255), nullable=False)
    referee_email = Column(String(255), nullable=False, index=True)
    referee_phone = Column(String(20), nullable=False)
    
    # Program details
    university_id = Column(
        UUID(as_uuid=True),
        ForeignKey("universities.id"),
        nullable=False,
        index=True
    )
    program_id = Column(
        UUID(as_uuid=True),
        ForeignKey("programs.id"),
        nullable=False,
        index=True
    )
    
    # Assignment
    counselor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True
    )
    assigned_at = Column(DateTime)
    
    # Status tracking
    status = Column(String(50), default="submitted", index=True)
    status_notes = Column(Text)
    
    # Dates
    submission_date = Column(DateTime, default=datetime.utcnow, index=True)
    contacted_date = Column(DateTime)
    admission_date = Column(DateTime)
    rejection_date = Column(DateTime)
    
    # Reward calculation
    slab_tier = Column(Integer, default=1)
    expected_reward = Column(Numeric(12, 2))
    
    # Metadata
    source = Column(String(100))
    utm_campaign = Column(String(255))
    utm_source = Column(String(255))
    utm_medium = Column(String(255))
    
    # CRM Integration
    crm_lead_id = Column(Integer, nullable=True, index=True)  # Digivarsity CRM Lead ID
    crm_synced_at = Column(DateTime, nullable=True)  # When the referral was synced to CRM
    crm_sync_error = Column(Text, nullable=True)  # Error message if sync failed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    referrer = relationship(
        "User",
        back_populates="referrals_made",
        foreign_keys=[referrer_id]
    )
    counselor = relationship(
        "User",
        back_populates="assigned_referrals",
        foreign_keys=[counselor_id]
    )
    university = relationship("University", back_populates="referrals")
    program = relationship("Program", back_populates="referrals")
    rewards = relationship("Reward", back_populates="referral", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Referral {self.referral_code}>"

