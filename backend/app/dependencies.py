"""
FastAPI Dependencies
Authentication and authorization dependencies
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException

# Security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )
    
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def require_roles(*roles: str):
    """
    Dependency factory to require specific roles
    
    Usage:
        @router.get("/admin-only")
        def admin_only(user: User = Depends(require_roles("super_admin", "manager"))):
            ...
    """
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}",
            )
        return current_user
    
    return role_checker


# Pre-defined role dependencies
async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require admin role (super_admin or manager)"""
    if current_user.role not in ["super_admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def get_super_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require super_admin role"""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required",
        )
    return current_user


async def get_counselor_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require counselor or admin role"""
    if current_user.role not in ["super_admin", "manager", "counselor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Counselor access required",
        )
    return current_user


async def get_referrer_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require referrer role"""
    if current_user.role != "referrer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Referrer access required",
        )
    return current_user

