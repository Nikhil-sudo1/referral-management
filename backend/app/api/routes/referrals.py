"""
Referral Routes
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.referral_controller import ReferralController
from app.schemas.referral import (
    ReferralCreate,
    ReferralSubmit,
    ReferralUpdate,
    ReferralStatusUpdate,
    ReferralAssign,
)
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user, get_referrer_user, get_counselor_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_referrals(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    university_id: Optional[UUID] = None,
    program_id: Optional[UUID] = None,
    counselor_id: Optional[UUID] = None,
    referrer_id: Optional[UUID] = None,
    search: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get paginated list of referrals with filters
    """
    try:
        controller = ReferralController(db)
        return controller.get_referrals(
            page=page,
            limit=limit,
            status=status,
            university_id=university_id,
            program_id=program_id,
            counselor_id=counselor_id,
            referrer_id=referrer_id,
            search=search,
            date_from=date_from,
            date_to=date_to,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("", response_model=BaseResponse, status_code=201)
async def create_referral(
    data: ReferralCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Create a new referral (admin only)
    """
    try:
        controller = ReferralController(db)
        return controller.create_referral(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/submit", response_model=BaseResponse, status_code=201)
async def submit_referral(
    data: ReferralSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_referrer_user),
):
    """
    Submit a referral as a referrer
    """
    try:
        controller = ReferralController(db)
        return controller.submit_referral(data, current_user)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-referrals", response_model=BaseResponse)
async def get_my_referrals(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_referrer_user),
):
    """
    Get current referrer's referrals
    """
    try:
        controller = ReferralController(db)
        return controller.get_my_referrals(
            referrer_id=current_user.id,
            page=page,
            limit=limit,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/assigned", response_model=BaseResponse)
async def get_assigned_referrals(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_counselor_user),
):
    """
    Get referrals assigned to current counselor
    """
    try:
        controller = ReferralController(db)
        return controller.get_assigned_referrals(
            counselor_id=current_user.id,
            page=page,
            limit=limit,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/stats", response_model=BaseResponse)
async def get_referral_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get referral statistics
    """
    from app.services.referral_service import ReferralService
    service = ReferralService(db)
    stats = service._get_status_stats()
    
    return BaseResponse(
        success=True,
        message="Success",
        data=stats
    )


@router.get("/{referral_id}", response_model=BaseResponse)
async def get_referral(
    referral_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get referral by ID
    """
    try:
        controller = ReferralController(db)
        return controller.get_referral(referral_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{referral_id}", response_model=BaseResponse)
async def update_referral(
    referral_id: UUID,
    data: ReferralUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Update referral (admin only)
    """
    try:
        controller = ReferralController(db)
        return controller.update_referral(referral_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{referral_id}/status", response_model=BaseResponse)
async def update_referral_status(
    referral_id: UUID,
    data: ReferralStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_counselor_user),
):
    """
    Update referral status
    """
    try:
        controller = ReferralController(db)
        return controller.update_status(referral_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/{referral_id}/assign", response_model=BaseResponse)
async def assign_counselor(
    referral_id: UUID,
    data: ReferralAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Assign counselor to referral (admin only)
    """
    try:
        controller = ReferralController(db)
        return controller.assign_counselor(referral_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

