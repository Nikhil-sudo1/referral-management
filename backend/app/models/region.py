"""
Region Model
For grouping universities by region
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Region(Base):
    """Region table for university grouping"""
    
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)  # North, South, East, West, Central
    code = Column(String(50), nullable=False, unique=True)  # north, south, east, west, central
    description = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    universities = relationship("University", back_populates="region")
    
    def __repr__(self):
        return f"<Region {self.name}>"

