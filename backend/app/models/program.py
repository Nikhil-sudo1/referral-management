"""
Program Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Program(Base):
    """Program table model"""
    
    __tablename__ = "programs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id = Column(
        UUID(as_uuid=True),
        ForeignKey("universities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text)
    duration = Column(String(50))
    fee_structure = Column(Numeric(12, 2), nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=False)
    reward_amount = Column(Numeric(12, 2), nullable=False)
    reward_tier = Column(String(50), default="bronze")
    eligibility_criteria = Column(Text)
    status = Column(String(20), default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint for university_id + code
    __table_args__ = (
        UniqueConstraint("university_id", "code", name="uq_program_university_code"),
    )
    
    # Relationships
    university = relationship("University", back_populates="programs")
    referrals = relationship("Referral", back_populates="program")
    
    def __repr__(self):
        return f"<Program {self.code}>"

