"""
Authentication Service
Handles login, registration, password management
Updated for new user table structure
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user_type import UserType
from app.models.role import Role
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    LoginResponse,
    UserInToken,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    UnauthorizedException,
    ValidationException,
    ConflictException,
    NotFoundException,
)
from app.core.logging import logger
from app.config import settings


class AuthService:
    """Authentication service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def login(self, request: LoginRequest) -> LoginResponse:
        """
        Authenticate user and return tokens
        
        Args:
            request: Login request with email and password
        
        Returns:
            LoginResponse with tokens and user info
        """
        # Find user by email
        user = self.db.query(User).filter(
            User.email == request.email.lower()
        ).first()
        
        if not user:
            logger.warning(f"Login failed: User not found - {request.email}")
            raise UnauthorizedException("Invalid email or password")
        
        # Verify password (field is now 'password' not 'password_hash')
        if not verify_password(request.password, user.password):
            logger.warning(f"Login failed: Invalid password - {request.email}")
            raise UnauthorizedException("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login failed: User inactive - {request.email}")
            raise UnauthorizedException("Account is deactivated")
        
        # Get user type and role names for response
        user_type = self.db.query(UserType).filter(UserType.id == user.user_type_id).first()
        role = self.db.query(Role).filter(Role.id == user.role_id).first()
        
        user_type_name = user_type.name if user_type else None
        role_name = role.name if role else None
        
        # Create tokens
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type_id": user.user_type_id,
            "role_id": user.role_id
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"User logged in successfully: {user.email}")
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserInToken(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                user_type_id=user.user_type_id,
                role_id=user.role_id,
                user_type_name=user_type_name,
                role_name=role_name,
                referral_code=user.referral_code
            )
        )
    
    def register(self, request: RegisterRequest) -> LoginResponse:
        """
        Register a new user
        
        Args:
            request: Registration data with new structure
        
        Returns:
            LoginResponse with tokens and user info
        """
        # Validate passwords match
        if request.password != request.confirm_password:
            raise ValidationException("Passwords do not match")
        
        # Check if email exists
        existing_user = self.db.query(User).filter(
            User.email == request.email.lower()
        ).first()
        
        if existing_user:
            raise ConflictException("Email already registered")
        
        # Validate user_type_id exists
        user_type = self.db.query(UserType).filter(UserType.id == request.user_type_id).first()
        if not user_type:
            raise ValidationException("Invalid user type")
        
        # Validate role_id exists and belongs to user_type
        role = self.db.query(Role).filter(
            Role.id == request.role_id,
            Role.user_type_id == request.user_type_id
        ).first()
        if not role:
            raise ValidationException("Invalid role for this user type")
        
        # Generate referral code for referral partners
        referral_code = None
        if user_type.code == "referral_partner":
            referral_code = self._generate_referral_code(request.full_name)
        
        # Validate university_id if provided (for Student Referrer role)
        univ_id = None
        if request.univ_id:
            try:
                univ_id = UUID(request.univ_id)
            except ValueError:
                raise ValidationException("Invalid university ID format")
        
        # Create user with new structure
        user = User(
            email=request.email.lower(),
            password=get_password_hash(request.password),
            full_name=request.full_name,
            mobile_number=request.mobile_number,
            user_type_id=request.user_type_id,
            role_id=request.role_id,
            univ_id=univ_id,
            org_id=request.org_id,
            referral_code=referral_code,
            bank_acc=request.bank_acc,
            bank_ifsc=request.bank_ifsc,
            bank_name=request.bank_name,
            account_holder_name=request.account_holder_name,
            is_active=True,
            email_verification=False,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"New user registered: {user.email} (Role: {role.name})")
        
        # Create tokens for automatic login
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type_id": user.user_type_id,
            "role_id": user.role_id
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserInToken(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                user_type_id=user.user_type_id,
                role_id=user.role_id,
                user_type_name=user_type.name,
                role_name=role.name,
                referral_code=user.referral_code
            )
        )
    
    def refresh_token(self, refresh_token: str) -> dict:
        """
        Refresh access token
        
        Args:
            refresh_token: Current refresh token
        
        Returns:
            New access and refresh tokens
        """
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")
        
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")
        
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type_id": user.user_type_id,
            "role_id": user.role_id
        }
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }
    
    def get_current_user(self, token: str) -> User:
        """
        Get current user from token
        
        Args:
            token: JWT access token
        
        Returns:
            Current user
        """
        payload = decode_token(token)
        
        if not payload:
            raise UnauthorizedException("Invalid token")
        
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise UnauthorizedException("User not found")
        
        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")
        
        return user
    
    def _generate_referral_code(self, name: str) -> str:
        """Generate unique referral code for user"""
        import re
        import random
        import string
        
        # Clean name and take first part
        name_parts = name.split()
        first_name = name_parts[0] if name_parts else "USER"
        clean_name = re.sub(r'[^A-Za-z]', '', first_name).upper()[:4]
        if not clean_name:
            clean_name = "REF"
        year = datetime.now().year
        
        # Generate base code
        base_code = f"{clean_name}-{year}"
        
        # Check for uniqueness and add suffix if needed
        existing = self.db.query(User).filter(
            User.referral_code.like(f"{base_code}%")
        ).count()
        
        if existing > 0:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            base_code = f"{base_code}-{suffix}"
        else:
            suffix = ''.join(random.choices(string.digits, k=3))
            base_code = f"{base_code}-{suffix}"
        
        return base_code
