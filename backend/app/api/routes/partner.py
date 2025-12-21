"""
Partner Type Routes
Endpoints for fetching partner types, organizations, universities, and industries
Updated to fetch from database tables with industry-based organization filtering
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.schemas.common import BaseResponse
from app.models.university import University
from app.models.company import Company
from app.models.industry import Industry

router = APIRouter(tags=["Partner"])


class CreateOrganizationRequest(BaseModel):
    """Request to create a new organization"""
    name: str
    industry_id: int


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


@router.get("/industries", response_model=BaseResponse)
def get_industries(
    db: Session = Depends(get_db)
):
    """
    Get all active industries
    Public endpoint - no auth required for signup
    """
    industries = db.query(Industry).filter(
        Industry.is_hidden == False
    ).order_by(Industry.display_order, Industry.name).all()
    
    return BaseResponse(
        success=True,
        message="Industries retrieved successfully",
        data=[{
            "id": ind.id,
            "name": ind.name
        } for ind in industries]
    )


@router.get("/industries/{industry_id}/organizations", response_model=BaseResponse)
def get_organizations_by_industry(
    industry_id: int,
    db: Session = Depends(get_db)
):
    """
    Get organizations (companies) filtered by industry
    Public endpoint - no auth required for signup
    """
    # Verify industry exists
    industry = db.query(Industry).filter(Industry.id == industry_id).first()
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    
    companies = db.query(Company).filter(
        Company.industry_id == industry_id,
        Company.is_active == True
    ).order_by(Company.name).all()
    
    return BaseResponse(
        success=True,
        message=f"Organizations for {industry.name} retrieved successfully",
        data=[{
            "id": comp.id,
            "name": comp.name,
            "industry_id": comp.industry_id
        } for comp in companies]
    )


@router.get("/organizations", response_model=BaseResponse)
def get_organizations(
    industry_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of organizations (companies) for employee partner type
    Optionally filter by industry_id
    Public endpoint - no auth required for signup
    """
    query = db.query(Company).filter(Company.is_active == True)
    
    if industry_id:
        query = query.filter(Company.industry_id == industry_id)
    
    companies = query.order_by(Company.name).all()
    
    return BaseResponse(
        success=True,
        message="Organizations retrieved successfully",
        data=[{
            "id": comp.id,
            "name": comp.name,
            "industry_id": comp.industry_id
        } for comp in companies]
    )


@router.post("/organizations", response_model=BaseResponse)
def create_organization(
    request: CreateOrganizationRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new organization (company)
    Used when employee selects "Other" and enters a new organization name
    Public endpoint - no auth required for signup flow
    """
    # Verify industry exists
    industry = db.query(Industry).filter(Industry.id == request.industry_id).first()
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found"
        )
    
    # Check if organization already exists in the same industry
    existing = db.query(Company).filter(
        Company.name.ilike(request.name.strip()),
        Company.industry_id == request.industry_id
    ).first()
    
    if existing:
        # Return existing organization instead of creating duplicate
        return BaseResponse(
            success=True,
            message="Organization already exists",
            data={
                "id": existing.id,
                "name": existing.name,
                "industry_id": existing.industry_id
            }
        )
    
    # Create new organization
    new_org = Company(
        name=request.name.strip(),
        industry_id=request.industry_id,
        is_active=True
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return BaseResponse(
        success=True,
        message="Organization created successfully",
        data={
            "id": new_org.id,
            "name": new_org.name,
            "industry_id": new_org.industry_id
        }
    )
