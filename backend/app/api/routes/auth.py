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
from app.services.email_service import EmailService
from app.core.security import get_password_hash
from app.core.logging import logger

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
    
    Sends verification email after registration
    """
    from sqlalchemy import func
    try:
        controller = AuthController(db)
        result = controller.register(request)
        
        # Send verification email
        try:
            email_service = EmailService(db)
            # Case-insensitive email lookup
            user = db.query(User).filter(func.lower(User.email) == request.email.lower()).first()
            if user:
                token = email_service.create_verification_token(user)
                email_service.send_verification_email(user, token)
                # Also send welcome email
                email_service.send_welcome_email(user)
        except Exception as e:
            logger.error(f"Failed to send registration emails: {e}")
            # Don't fail registration if email fails
        
        return result
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
    
    Sends a password reset link to the user's email if it exists
    """
    try:
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        if user:
            # Create reset token and send email
            email_service = EmailService(db)
            token = email_service.create_password_reset_token(user)
            email_sent = email_service.send_password_reset_email(user, token)
            
            if email_sent:
                logger.info(f"Password reset email sent to {request.email}")
            else:
                logger.warning(f"Failed to send password reset email to {request.email}")
        else:
            # Don't reveal if email exists or not for security
            logger.info(f"Password reset requested for non-existent email: {request.email}")
        
        # Always return success to prevent email enumeration
        return BaseResponse(
            success=True,
            message="If an account exists with this email, you will receive password reset instructions shortly"
        )
        
    except Exception as e:
        logger.error(f"Error in forgot password: {e}")
        # Still return success to prevent information leakage
        return BaseResponse(
            success=True,
            message="If an account exists with this email, you will receive password reset instructions shortly"
        )


@router.post("/reset-password", response_model=BaseResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password with token
    
    Validates the reset token and updates the user's password
    """
    # Validate passwords match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password strength
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    try:
        email_service = EmailService(db)
        
        # Verify the reset token
        user = email_service.verify_reset_token(request.token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token. Please request a new password reset."
            )
        
        # Update password
        user.password_hash = get_password_hash(request.password)
        
        # Clear the reset token
        email_service.clear_reset_token(user)
        
        db.commit()
        
        logger.info(f"Password reset successful for user: {user.email}")
        
        return BaseResponse(
            success=True,
            message="Password reset successful! You can now login with your new password."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password. Please try again."
        )


@router.post("/verify-email", response_model=BaseResponse)
async def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Verify email address with token
    """
    try:
        email_service = EmailService(db)
        user = email_service.verify_email_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        return BaseResponse(
            success=True,
            message="Email verified successfully! You can now access all features."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying email"
        )


@router.post("/resend-verification", response_model=BaseResponse)
async def resend_verification(
    request: ForgotPasswordRequest,  # Reuse the same schema (just needs email)
    db: Session = Depends(get_db),
):
    """
    Resend verification email
    """
    from sqlalchemy import func
    try:
        # Case-insensitive email lookup
        user = db.query(User).filter(func.lower(User.email) == request.email.lower()).first()
        
        if user and not user.is_verified:
            email_service = EmailService(db)
            token = email_service.create_verification_token(user)
            email_service.send_verification_email(user, token)
            logger.info(f"Verification email resent to {request.email}")
        
        # Always return success to prevent email enumeration
        return BaseResponse(
            success=True,
            message="If an unverified account exists with this email, a verification email will be sent"
        )
        
    except Exception as e:
        logger.error(f"Error resending verification: {e}")
        return BaseResponse(
            success=True,
            message="If an unverified account exists with this email, a verification email will be sent"
        )


@router.get("/check-verification", response_model=BaseResponse)
async def check_verification(
    email: str,
    db: Session = Depends(get_db),
):
    """
    Check if a user's email has been verified (for polling from frontend)
    """
    try:
        from sqlalchemy import func
        # Case-insensitive email lookup
        user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
        
        if not user:
            return BaseResponse(
                success=True,
                message="User not found",
                data={"is_verified": False}
            )
        
        return BaseResponse(
            success=True,
            message="Verification status retrieved",
            data={
                "is_verified": user.is_verified,
                "email": user.email
            }
        )
        
    except Exception as e:
        logger.error(f"Error checking verification status: {e}")
        return BaseResponse(
            success=False,
            message="Error checking verification status",
            data={"is_verified": False}
        )
