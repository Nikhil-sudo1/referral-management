"""
Partner Type Routes
Endpoints for fetching partner types, organizations, and universities
Updated to fetch from database tables
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.common import BaseResponse
from app.models.university import University
from app.models.company import Company

router = APIRouter(tags=["Partner"])


@router.get("/universities", response_model=BaseResponse)
def get_all_universities(
    db: Session = Depends(get_db)
):
    """
    Get all active universities
    Public endpoint - no auth required for signup
    """
    universities = db.query(University).filter(
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
    Get list of organizations (companies) for employee partner type
    Public endpoint - no auth required for signup
    """
    companies = db.query(Company).filter(
        Company.is_active == True
    ).all()
    
    return BaseResponse(
        success=True,
        message="Organizations retrieved successfully",
        data=[{
            "id": comp.id,
            "name": comp.name
        } for comp in companies]
    )
