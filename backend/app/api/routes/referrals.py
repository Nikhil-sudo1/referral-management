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
        
        # Apply role-based filtering using new user_type_id
        # User Type 1 = Admin, User Type 2 = Referral Partner
        effective_university_id = university_id
        effective_counselor_id = counselor_id
        effective_referrer_id = referrer_id
        
        # Admin users (user_type_id = 1) see everything
        if current_user.user_type_id == 1:
            pass  # No additional filtering - admins see all
        
        # Referral Partners (user_type_id = 2) see only their own referrals
        elif current_user.user_type_id == 2:
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


@router.get("/my-referrals-crm", response_model=BaseResponse)
async def get_my_referrals_with_crm_data(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_referrer_user),
):
    """
    Get current referrer's referrals with CRM data (lead status, sub status, activity, university)
    Fetches data from CRM API for each referral
    """
    import requests
    from app.config import settings
    from app.models.referral import Referral
    
    try:
        # Get referrals from DB
        referrals = db.query(Referral).filter(
            Referral.referrer_id == current_user.id
        ).order_by(Referral.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        total = db.query(Referral).filter(Referral.referrer_id == current_user.id).count()
        
        # CRM headers
        headers = {
            "session-token": settings.CRM_SESSION_TOKEN,
            "Authorization": f"Bearer {settings.CRM_BEARER_TOKEN}",
            "Content-Type": "application/json"
        }
        
        result_items = []
        
        for referral in referrals:
            item = {
                "id": str(referral.id),
                "referral_code": referral.referral_code,
                "referee_name": referral.referee_name,
                "referee_email": referral.referee_email,
                "referee_phone": referral.referee_phone,
                "crm_lead_id": referral.crm_lead_id,
                "crm_university_id": referral.crm_university_id,
                "crm_course_id": referral.crm_course_id,
                "local_status": referral.status,
                "created_at": referral.created_at.isoformat() if referral.created_at else None,
                # CRM fields - will be populated if available
                "full_name": referral.referee_name,
                "mobile_number": referral.referee_phone,
                "email": referral.referee_email,
                "lead_status": None,
                "lead_sub_status": None,
                "university_interested": None,
                "activity_log": [],
            }
            
            # If we have a CRM lead ID, fetch data from CRM
            if referral.crm_lead_id:
                try:
                    # Fetch lead activity from CRM
                    activity_response = requests.post(
                        f"{settings.CRM_BASE_URL}/leads/lead_activity",
                        headers=headers,
                        json={"id": referral.crm_lead_id},
                        timeout=10
                    )
                    
                    if activity_response.status_code == 200:
                        activity_data = activity_response.json()
                        if isinstance(activity_data, list):
                            item["activity_log"] = activity_data
                        
                except Exception as e:
                    print(f"Error fetching CRM activity for lead {referral.crm_lead_id}: {e}")
            
            result_items.append(item)
        
        # If we have CRM lead IDs, also fetch lead list to get status info
        crm_lead_ids = [r.crm_lead_id for r in referrals if r.crm_lead_id]
        if crm_lead_ids:
            try:
                # The all_lead_list API returns recent leads - we'll match by ID
                list_response = requests.post(
                    f"{settings.CRM_BASE_URL}/leads/all_lead_list",
                    headers=headers,
                    json={},
                    timeout=15
                )
                
                if list_response.status_code == 200:
                    list_data = list_response.json()
                    leads_list = list_data.get("data", []) if isinstance(list_data, dict) else []
                    
                    # Create lookup by ID
                    leads_by_id = {lead.get("id"): lead for lead in leads_list}
                    
                    # Update result items with CRM data
                    for item in result_items:
                        if item["crm_lead_id"] and item["crm_lead_id"] in leads_by_id:
                            crm_lead = leads_by_id[item["crm_lead_id"]]
                            item["full_name"] = crm_lead.get("full_name", item["full_name"])
                            item["mobile_number"] = crm_lead.get("mobile_number", item["mobile_number"])
                            item["email"] = crm_lead.get("email", item["email"])
                            item["lead_status"] = crm_lead.get("lead_status")
                            item["lead_sub_status"] = crm_lead.get("lead_sub_status")
                            item["university_interested"] = crm_lead.get("university_interested")
                            
            except Exception as e:
                print(f"Error fetching CRM lead list: {e}")
        
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "items": result_items,
                "total": total,
                "page": page,
                "page_size": limit,
                "total_pages": (total + limit - 1) // limit,
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching referrals: {str(e)}")


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
                    "synced_at": None,
                    "activity": None,
                    "sync_error": referral.crm_sync_error
                }
            )
        
        # Get CRM activity (may fail if token expired)
        crm_service = CRMService(db)
        activity = None
        activity_error = None
        
        try:
            activity = await crm_service.get_lead_activity(referral.crm_lead_id)
            # Check if response indicates token error
            if activity and isinstance(activity, dict) and activity.get("error"):
                error_msg = activity.get("message", {})
                if isinstance(error_msg, dict) and "401006" in error_msg:
                    activity_error = "CRM token expired. Please update CRM credentials."
                    activity = None
                else:
                    activity_error = str(error_msg)
                    activity = None
        except Exception as e:
            activity_error = f"Failed to fetch CRM activity: {str(e)}"
        
        return BaseResponse(
            success=True,
            message="CRM status retrieved",
            data={
                "synced": True,
                "crm_lead_id": referral.crm_lead_id,
                "synced_at": referral.crm_synced_at.isoformat() if referral.crm_synced_at else None,
                "activity": activity,
                "activity_error": activity_error
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

