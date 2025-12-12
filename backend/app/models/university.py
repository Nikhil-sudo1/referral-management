"""
University Model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class University(Base):
    """University table model"""
    
    __tablename__ = "universities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    logo_url = Column(String(500))
    website = Column(String(255))
    description = Column(Text)
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    address = Column(Text)
    status = Column(String(20), default="active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    programs = relationship("Program", back_populates="university", cascade="all, delete-orphan")
    counselors = relationship("User", back_populates="university")
    referrals = relationship("Referral", back_populates="university")
    
    def __repr__(self):
        return f"<University {self.code}>"

