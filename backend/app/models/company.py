"""
Company Model
Companies that post job opportunities
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Company(Base):
    """Company table for job postings"""
    
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text)
    website_url = Column(String(500))
    logo_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    industry = relationship("Industry", back_populates="companies")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    job_referrals = relationship("JobReferral", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company {self.name}>"

