"""
Partner Type and Region Routes
Endpoints for fetching partner types, regions, and related data
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.base import BaseResponse
from app.schemas.partner_type import PartnerTypeResponse, RegionResponse
from app.models.partner_type import PartnerType
from app.models.region import Region
from app.models.university import University

router = APIRouter(prefix="/partner", tags=["Partner"])


@router.get("/types", response_model=BaseResponse)
def get_partner_types(
    db: Session = Depends(get_db)
):
    """
    Get all active partner types (Employee, Student Referrer)
    Public endpoint - no auth required for signup
    """
    partner_types = db.query(PartnerType).filter(
        PartnerType.is_active == True
    ).all()
    
    return BaseResponse(
        success=True,
        message="Partner types retrieved successfully",
        data=[PartnerTypeResponse.model_validate(pt) for pt in partner_types]
    )


@router.get("/regions", response_model=BaseResponse)
def get_regions(
    db: Session = Depends(get_db)
):
    """
    Get all active regions
    Public endpoint - no auth required for signup
    """
    regions = db.query(Region).filter(
        Region.is_active == True
    ).all()
    
    return BaseResponse(
        success=True,
        message="Regions retrieved successfully",
        data=[RegionResponse.model_validate(r) for r in regions]
    )


@router.get("/regions/{region_id}/universities", response_model=BaseResponse)
def get_universities_by_region(
    region_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all active universities in a specific region
    Public endpoint - no auth required for signup
    """
    universities = db.query(University).filter(
        University.region_id == region_id,
        University.status == "active"
    ).all()
    
    return BaseResponse(
        success=True,
        message="Universities retrieved successfully",
        data=[{
            "id": str(uni.id),
            "name": uni.name,
            "code": uni.code,
            "logo_url": uni.logo_url
        } for uni in universities]
    )


@router.get("/organizations", response_model=BaseResponse)
def get_organizations(
    db: Session = Depends(get_db)
):
    """
    Get list of organizations
    For employee partner type
    Public endpoint - no auth required for signup
    """
    # This could be from a separate organizations table or hardcoded list
    # For now, returning a default list
    organizations = [
        {"id": "teamlease", "name": "TeamLease EdTech"},
        {"id": "partner1", "name": "Partner Organization 1"},
        {"id": "partner2", "name": "Partner Organization 2"},
        {"id": "other", "name": "Other Organization"},
    ]
    
    return BaseResponse(
        success=True,
        message="Organizations retrieved successfully",
        data=organizations
    )

