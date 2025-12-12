"""
Authentication Controller
Maps auth requests to service calls
"""
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserProfileResponse,
)
from app.schemas.common import BaseResponse


class AuthController:
    """Authentication controller"""
    
    def __init__(self, db: Session):
        self.service = AuthService(db)
    
    def login(self, request: LoginRequest) -> BaseResponse:
        """Handle login request"""
        result = self.service.login(request)
        return BaseResponse(
            success=True,
            message="Login successful",
            data=result.model_dump()
        )
    
    def register(self, request: RegisterRequest) -> BaseResponse:
        """Handle registration request"""
        result = self.service.register(request)
        return BaseResponse(
            success=True,
            message="Registration successful",
            data=result.model_dump()
        )
    
    def refresh_token(self, refresh_token: str) -> BaseResponse:
        """Handle token refresh"""
        result = self.service.refresh_token(refresh_token)
        return BaseResponse(
            success=True,
            message="Token refreshed",
            data=result
        )
    
    def get_profile(self, token: str) -> BaseResponse:
        """Get current user profile"""
        user = self.service.get_current_user(token)
        return BaseResponse(
            success=True,
            message="Success",
            data=UserProfileResponse.model_validate(user).model_dump()
        )

