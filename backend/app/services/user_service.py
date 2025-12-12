"""
User Service
User management operations
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserListResponse, UserListItem
from app.core.security import get_password_hash
from app.core.exceptions import NotFoundException, ConflictException, ValidationException
from app.core.logging import logger
import math


class UserService:
    """User service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_users(
        self,
        page: int = 1,
        limit: int = 20,
        role: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> UserListResponse:
        """
        Get paginated list of users
        
        Args:
            page: Page number
            limit: Items per page
            role: Filter by role
            search: Search by name/email
            is_active: Filter by active status
        
        Returns:
            Paginated user list
        """
        query = self.db.query(User)
        
        # Apply filters
        if role:
            query = query.filter(User.role == role)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
        
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return UserListResponse(
            items=[UserListItem.model_validate(u) for u in users],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )
    
    def get_user_by_id(self, user_id: UUID) -> User:
        """Get user by ID"""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise NotFoundException(f"User not found: {user_id}")
        
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email.lower()).first()
    
    def create_user(self, data: UserCreate) -> User:
        """
        Create a new user
        
        Args:
            data: User creation data
        
        Returns:
            Created user
        """
        # Check if email exists
        existing = self.get_user_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")
        
        # Generate referral code for referrers
        referral_code = None
        if data.role == "referrer":
            referral_code = self._generate_referral_code(data.name)
        
        user = User(
            email=data.email.lower(),
            password_hash=get_password_hash(data.password),
            name=data.name,
            phone=data.phone,
            role=data.role,
            organization=data.organization,
            university_id=data.university_id,
            referral_code=referral_code,
            tier="Bronze" if data.role == "referrer" else None,
            is_active=True,
            is_verified=False,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"User created: {user.email}")
        return user
    
    def update_user(self, user_id: UUID, data: UserUpdate) -> User:
        """
        Update user
        
        Args:
            user_id: User ID
            data: Update data
        
        Returns:
            Updated user
        """
        user = self.get_user_by_id(user_id)
        
        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"User updated: {user.email}")
        return user
    
    def delete_user(self, user_id: UUID) -> bool:
        """
        Soft delete user
        
        Args:
            user_id: User ID
        
        Returns:
            Success status
        """
        user = self.get_user_by_id(user_id)
        user.is_active = False
        self.db.commit()
        
        logger.info(f"User deactivated: {user.email}")
        return True
    
    def get_counselors(
        self,
        university_id: Optional[UUID] = None,
        is_active: bool = True,
    ) -> List[User]:
        """Get list of counselors"""
        query = self.db.query(User).filter(User.role == "counselor")
        
        if university_id:
            query = query.filter(User.university_id == university_id)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.all()
    
    def get_referrers(self, is_active: bool = True) -> List[User]:
        """Get list of referrers"""
        query = self.db.query(User).filter(User.role == "referrer")
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.order_by(User.created_at.desc()).all()
    
    def _generate_referral_code(self, name: str) -> str:
        """Generate unique referral code"""
        import re
        import random
        import string
        from datetime import datetime
        
        clean_name = re.sub(r'[^A-Za-z]', '', name.split()[0]).upper()[:4]
        year = datetime.now().year
        base_code = f"{clean_name}-REF-{year}"
        
        existing = self.db.query(User).filter(
            User.referral_code.like(f"{base_code}%")
        ).count()
        
        if existing > 0:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=2))
            base_code = f"{base_code}-{suffix}"
        
        return base_code

