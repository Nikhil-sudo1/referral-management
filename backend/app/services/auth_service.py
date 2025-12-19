"""
Authentication Service
Handles login, registration, password management
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
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
        
        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Login failed: Invalid password - {request.email}")
            raise UnauthorizedException("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login failed: User inactive - {request.email}")
            raise UnauthorizedException("Account is deactivated")
        
        # Validate role if specified (optional - allows any role to login if not specified)
        if request.role:
            if request.role == "admin" and user.role not in ["super_admin", "manager", "counselor"]:
                raise UnauthorizedException("Invalid credentials for admin login")
            if request.role == "referrer" and user.role != "referrer":
                raise UnauthorizedException("Invalid credentials for referrer login")
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        self.db.commit()
        
        # Create tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
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
                name=user.name,
                role=user.role,
                avatar_url=user.avatar_url
            )
        )
    
    def register(self, request: RegisterRequest) -> LoginResponse:
        """
        Register a new referrer
        
        Args:
            request: Registration data
        
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
        
        # Generate referral code
        referral_code = self._generate_referral_code(request.name)
        
        # Validate university_id if provided
        university_id = None
        if request.university_id:
            try:
                from uuid import UUID
                university_id = UUID(request.university_id)
            except ValueError:
                raise ValidationException("Invalid university ID format")
        
        # Create user
        user = User(
            email=request.email.lower(),
            password_hash=get_password_hash(request.password),
            name=request.name,
            phone=request.phone,
            role="referral_partner",  # Changed from "referrer" to "referral_partner"
            partner_type_id=request.partner_type_id,
            organization=request.organization,
            university_id=university_id,
            referral_code=referral_code,
            tier="Bronze",
            is_active=True,
            is_verified=False,
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"New referrer registered: {user.email}")
        
        # Create tokens for automatic login
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
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
                name=user.name,
                role=user.role,
                avatar_url=user.avatar_url
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
        
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
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
        clean_name = re.sub(r'[^A-Za-z]', '', name.split()[0]).upper()[:4]
        year = datetime.now().year
        
        # Generate base code
        base_code = f"{clean_name}-REF-{year}"
        
        # Check for uniqueness and add suffix if needed
        existing = self.db.query(User).filter(
            User.referral_code.like(f"{base_code}%")
        ).count()
        
        if existing > 0:
            suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=2))
            base_code = f"{base_code}-{suffix}"
        
        return base_code

