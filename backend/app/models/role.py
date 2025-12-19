"""
Role Master Model
Defines specific roles under each user type
Admin: Human Resources, Business Head, Student Admin
Referral Partner: Employee, Student Referrer
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    """Role Master table"""
    
    __tablename__ = "role_master"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_type_id = Column(Integer, ForeignKey("user_type_master.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)  # Human Resources, Business Head, etc.
    code = Column(String(50), nullable=False, unique=True)  # human_resources, business_head, etc.
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_type = relationship("UserType", back_populates="roles")
    users = relationship("User", back_populates="role_details")
    
    def __repr__(self):
        return f"<Role {self.name}>"

