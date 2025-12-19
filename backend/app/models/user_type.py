"""
User Type Master Model
Defines main user categories: Admin, Referral Partner
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class UserType(Base):
    """User Type Master table"""
    
    __tablename__ = "user_type_master"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)  # Admin, Referral Partner
    code = Column(String(50), nullable=False, unique=True)  # admin, referral_partner
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    roles = relationship("Role", back_populates="user_type")
    
    def __repr__(self):
        return f"<UserType {self.name}>"

