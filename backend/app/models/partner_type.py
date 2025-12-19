"""
Referral Partner Type Model
Master table for partner types (Employee, Student Referrer)
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class PartnerType(Base):
    """Referral Partner Master table"""
    
    __tablename__ = "referral_partner_master"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)  # Employee, Student Referrer
    code = Column(String(50), nullable=False, unique=True)  # employee, student_referrer
    description = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="partner_type")
    
    def __repr__(self):
        return f"<PartnerType {self.name}>"

