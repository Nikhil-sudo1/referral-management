"""
User Service
Business logic for user management
Updated for new user_type_id and role_id structure
"""
import math
import secrets
import string
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User
from app.models.user_type import UserType
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate, UserListItem, UserListResponse
from app.core.security import get_password_hash
from app.core.exceptions import NotFoundException, ConflictException


class UserService:
    """Service for user management operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_users(
        self,
        page: int = 1,
        limit: int = 20,
        role_id: Optional[int] = None,
        user_type_id: Optional[int] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> UserListResponse:
        """
        Get paginated list of users with filters
        Updated to use user_type_id and role_id
        """
        query = self.db.query(User)
        
        # Apply filters
        if role_id:
            query = query.filter(User.role_id == role_id)
        
        if user_type_id:
            query = query.filter(User.user_type_id == user_type_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
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
        Updated for new schema
        """
        # Check if email exists
        existing = self.get_user_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")
        
        # Generate referral code for referral partners (user_type_id = 2)
        referral_code = None
        if data.user_type_id == 2:  # Referral Partner
            referral_code = self._generate_referral_code(data.full_name)
        
        user = User(
            email=data.email.lower(),
            password=get_password_hash(data.password),
            full_name=data.full_name,
            mobile_number=data.mobile_number,
            user_type_id=data.user_type_id,
            role_id=data.role_id,
            univ_id=data.univ_id,
            org_id=data.org_id,
            referral_code=referral_code,
            is_active=True,
            email_verification=False,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def update_user(self, user_id: UUID, data: UserUpdate) -> User:
        """Update user"""
        user = self.get_user_by_id(user_id)
        
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = None  # Trigger auto-update
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def delete_user(self, user_id: UUID) -> None:
        """Delete user (soft delete by deactivating)"""
        user = self.get_user_by_id(user_id)
        user.is_active = False
        self.db.commit()
    
    def activate_user(self, user_id: UUID) -> User:
        """Activate a user account"""
        user = self.get_user_by_id(user_id)
        user.is_active = True
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def deactivate_user(self, user_id: UUID) -> User:
        """Deactivate a user account"""
        user = self.get_user_by_id(user_id)
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def _generate_referral_code(self, full_name: str) -> str:
        """Generate unique referral code based on name"""
        # Take first 4 chars of name (uppercase)
        prefix = ''.join(c for c in full_name.upper() if c.isalpha())[:4]
        if len(prefix) < 4:
            prefix = prefix + 'X' * (4 - len(prefix))
        
        # Add random alphanumeric suffix
        suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        
        code = f"{prefix}{suffix}"
        
        # Ensure uniqueness
        while self.db.query(User).filter(User.referral_code == code).first():
            suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
            code = f"{prefix}{suffix}"
        
        return code
    
    def get_referrers(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        is_active: Optional[bool] = True,
    ) -> UserListResponse:
        """
        Get list of referral partners (user_type_id = 2)
        """
        query = self.db.query(User).filter(User.user_type_id == 2)
        
        # Filter by active status if specified
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.referral_code.ilike(search_term)
                )
            )
        
        total = query.count()
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
    
    def get_counselors(
        self,
        page: int = 1,
        limit: int = 20,
        university_id: Optional[UUID] = None,
    ) -> UserListResponse:
        """
        Get list of admin users (user_type_id = 1)
        Optionally filter by university
        """
        query = self.db.query(User).filter(User.user_type_id == 1, User.is_active == True)
        
        if university_id:
            query = query.filter(User.univ_id == university_id)
        
        total = query.count()
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
