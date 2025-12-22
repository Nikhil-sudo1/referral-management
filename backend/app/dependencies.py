"""
FastAPI Dependencies
Authentication and authorization dependencies
Updated for new user_type_id and role_id structure
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.cache import get_cached, set_cached

security = HTTPBearer(auto_error=False)
USER_CACHE_TTL = 300
USER_TYPE_ADMIN = 1
USER_TYPE_REFERRAL_PARTNER = 2
ROLE_HR = 1
ROLE_BUSINESS_HEAD = 2
ROLE_STUDENT_ADMIN = 3
ROLE_EMPLOYEE = 4
ROLE_STUDENT_REFERRER = 5
ADMIN_ROLE_IDS = [ROLE_HR, ROLE_BUSINESS_HEAD, ROLE_STUDENT_ADMIN]
REFERRAL_PARTNER_ROLE_IDS = [ROLE_EMPLOYEE, ROLE_STUDENT_REFERRER]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token", headers={"WWW-Authenticate": "Bearer"})
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    cache_key = f"user:{user_id}"
    cached_user = get_cached(cache_key)
    if cached_user is not None:
        return cached_user
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is deactivated")
    
    set_cached(cache_key, user, ttl=USER_CACHE_TTL)
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def is_admin_user(user: User) -> bool:
    return user.user_type_id == USER_TYPE_ADMIN


def is_referral_partner(user: User) -> bool:
    return user.user_type_id == USER_TYPE_REFERRAL_PARTNER


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def get_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role_id != ROLE_HR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR Admin access required")
    return current_user


async def get_manager_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


get_counselor_user = get_manager_or_admin


async def get_referrer_user(current_user: User = Depends(get_current_user)) -> User:
    if not is_referral_partner(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Referral partner access required")
    return current_user


async def get_student_referrer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role_id != ROLE_STUDENT_REFERRER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student referrer access required")
    return current_user


async def get_employee_referrer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role_id != ROLE_EMPLOYEE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employee referrer access required")
    return current_user


async def get_student_admin(current_user: User = Depends(get_current_user)) -> User:
    """Get student admin user - for payout approval"""
    if current_user.role_id != ROLE_STUDENT_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student Admin access required")
    return current_user


async def get_account_team_user(current_user: User = Depends(get_current_user)) -> User:
    """Get account team user - for final payout approval"""
    # Account team can be HR Admin or Business Head
    if current_user.role_id not in [ROLE_HR, ROLE_BUSINESS_HEAD]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account Team access required (HR Admin or Business Head)")
    return current_user