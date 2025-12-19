"""
Job Model
Job opportunities and listings
"""
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, Numeric, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Job(Base):
    """Job table for opportunity listings"""
    
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True)
    external_job_id = Column(Integer, nullable=True, index=True)  # From optara
    job_code = Column(String(100))
    job_title = Column(String(255), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    
    # Experience and salary
    exp_from = Column(Numeric(5, 2), default=0)
    exp_to = Column(Numeric(5, 2), default=0)
    ctc_from = Column(Numeric(12, 2))
    ctc_to = Column(Numeric(12, 2))
    hide_salary = Column(Boolean, default=False)
    
    # Job details
    description = Column(Text)
    vacancies = Column(Integer, default=1)
    gender = Column(String(1))  # M, F, or null for any
    location = Column(String(255))
    pincode = Column(String(20))
    
    # Validity
    valid_till = Column(Date, nullable=False, index=True)
    
    # Additional fields
    job_url = Column(String(500))
    website_url = Column(String(500))
    seo_title = Column(String(255))
    seo_description = Column(Text)
    
    # Contact information
    recruiter_name = Column(String(255))
    recruiter_email = Column(String(255))
    recruiter_mobile = Column(String(20))
    spoc = Column(String(255))
    
    # Status
    status = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    # Metadata
    source = Column(String(100))
    fetched_on = Column(DateTime)
    modified_on = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    industry = relationship("Industry")
    
    def __repr__(self):
        return f"<Job {self.job_title}>"

