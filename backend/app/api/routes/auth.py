"""
Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.auth_controller import AuthController
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.post("/login", response_model=BaseResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Login with email and password
    
    Returns access and refresh tokens
    """
    try:
        controller = AuthController(db)
        return controller.login(request)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/register", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Register a new referrer account
    """
    try:
        controller = AuthController(db)
        return controller.register(request)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/refresh", response_model=BaseResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token
    """
    try:
        controller = AuthController(db)
        return controller.refresh_token(request.refresh_token)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/logout", response_model=BaseResponse)
async def logout(
    current_user: User = Depends(get_current_user),
):
    """
    Logout user (client should discard tokens)
    """
    return BaseResponse(
        success=True,
        message="Logged out successfully"
    )


@router.get("/me", response_model=BaseResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user profile
    """
    return BaseResponse(
        success=True,
        message="Success",
        data={
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "phone": current_user.phone,
            "role": current_user.role,
            "avatar_url": current_user.avatar_url,
            "organization": current_user.organization,
            "referral_code": current_user.referral_code,
            "tier": current_user.tier,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        }
    )


@router.post("/forgot-password", response_model=BaseResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Request password reset email
    """
    # In production, send email with reset token
    return BaseResponse(
        success=True,
        message="If email exists, password reset instructions will be sent"
    )


@router.post("/reset-password", response_model=BaseResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password with token
    """
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # In production, verify token and update password
    return BaseResponse(
        success=True,
        message="Password reset successful"
    )

