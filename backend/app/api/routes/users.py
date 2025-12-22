"""
User Routes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.user_controller import UserController
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get paginated list of users (admin only)
    """
    try:
        controller = UserController(db)
        return controller.get_users(
            page=page,
            limit=limit,
            role=role,
            search=search,
            is_active=is_active,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("", response_model=BaseResponse, status_code=201)
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Create a new user (admin only)
    """
    try:
        controller = UserController(db)
        return controller.create_user(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/counselors", response_model=BaseResponse)
async def get_counselors(
    university_id: Optional[UUID] = None,
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get list of counselors
    """
    try:
        controller = UserController(db)
        return controller.get_counselors(
            university_id=university_id,
            is_active=is_active,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/referrers", response_model=BaseResponse)
async def get_referrers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get list of referrers (admin only)
    """
    try:
        controller = UserController(db)
        return controller.get_referrers(
            page=page,
            limit=limit,
            is_active=is_active,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/{user_id}", response_model=BaseResponse)
async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get user by ID (admin only)
    """
    try:
        controller = UserController(db)
        return controller.get_user(user_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{user_id}", response_model=BaseResponse)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Update user (admin only)
    """
    try:
        controller = UserController(db)
        return controller.update_user(user_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{user_id}", response_model=BaseResponse)
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Delete (deactivate) user (admin only)
    """
    try:
        controller = UserController(db)
        return controller.delete_user(user_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

