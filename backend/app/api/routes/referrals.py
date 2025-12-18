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
    
    Data visibility based on role:
    - super_admin: ALL referrals
    - admin: ALL referrals  
    - manager: Only referrals from their assigned university
    - referrer: Only their own referrals (use /my-referrals endpoint instead)
    """
    try:
        controller = ReferralController(db)
        
        # Apply role-based filtering
        effective_university_id = university_id
        effective_counselor_id = counselor_id
        effective_referrer_id = referrer_id
        
        # Super Admin and Admin see everything
        if current_user.role in ['super_admin', 'admin']:
            pass  # No additional filtering
        
        # Manager sees only their university's referrals
        elif current_user.role == 'manager':
            if current_user.university_id:
                effective_university_id = current_user.university_id
            # If no university assigned, they see nothing
            else:
                return BaseResponse(
                    success=True,
                    message="No university assigned to your account",
                    data={
                        "items": [],
                        "total": 0,
                        "page": page,
                        "limit": limit,
                        "pages": 0,
                        "stats": None
                    }
                )
        
        # Referrer should use /my-referrals endpoint
        elif current_user.role == 'referrer':
            effective_referrer_id = current_user.id
        
        return controller.get_referrals(
            page=page,
            limit=limit,
            status=status,
            university_id=effective_university_id,
            program_id=program_id,
            counselor_id=effective_counselor_id,
            referrer_id=effective_referrer_id,
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


@router.get("/{referral_id}/crm-activity", response_model=BaseResponse)
async def get_referral_crm_activity(
    referral_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get CRM activity for a referral
    Returns activity history from Digivarsity CRM
    """
    from app.services.crm_service import CRMService
    from app.services.referral_service import ReferralService
    
    try:
        # Get referral first
        referral_service = ReferralService(db)
        referral = referral_service.get_referral_by_id(referral_id)
        
        if not referral.crm_lead_id:
            return BaseResponse(
                success=True,
                message="Referral not synced to CRM yet",
                data={
                    "synced": False,
                    "crm_lead_id": None,
                    "activity": None,
                    "sync_error": referral.crm_sync_error
                }
            )
        
        # Get CRM activity
        crm_service = CRMService(db)
        activity = await crm_service.get_lead_activity(referral.crm_lead_id)
        
        return BaseResponse(
            success=True,
            message="CRM activity retrieved",
            data={
                "synced": True,
                "crm_lead_id": referral.crm_lead_id,
                "synced_at": referral.crm_synced_at.isoformat() if referral.crm_synced_at else None,
                "activity": activity
            }
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching CRM activity: {str(e)}")


@router.post("/{referral_id}/sync-crm", response_model=BaseResponse)
async def sync_referral_to_crm(
    referral_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Manually sync a referral to CRM (admin only)
    Use this to retry failed syncs or sync older referrals
    """
    from app.services.crm_service import CRMService
    from app.services.referral_service import ReferralService
    
    try:
        # Get referral
        referral_service = ReferralService(db)
        referral = referral_service.get_referral_by_id(referral_id)
        
        # Sync to CRM
        crm_service = CRMService(db)
        crm_lead_id = await crm_service.create_lead(referral)
        
        if crm_lead_id:
            return BaseResponse(
                success=True,
                message="Referral synced to CRM successfully",
                data={
                    "crm_lead_id": crm_lead_id,
                    "synced_at": referral.crm_synced_at.isoformat() if referral.crm_synced_at else None
                }
            )
        else:
            return BaseResponse(
                success=False,
                message="Failed to sync referral to CRM",
                data={
                    "error": referral.crm_sync_error
                }
            )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing to CRM: {str(e)}")


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

