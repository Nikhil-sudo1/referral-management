"""
Industry Model
For job listings organized by industry
"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class Industry(Base):
    """Industry table for job categorization"""
    
    __tablename__ = "industries"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    display_order = Column(Integer, default=0)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    companies = relationship("Company", back_populates="industry")
    
    def __repr__(self):
        return f"<Industry {self.name}>"

