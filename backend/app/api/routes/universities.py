"""
University Routes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.controllers.university_controller import UniversityController
from app.controllers.program_controller import ProgramController
from app.schemas.university import UniversityCreate, UniversityUpdate
from app.schemas.program import ProgramCreate
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


class StatusUpdate(BaseModel):
    status: str


@router.get("", response_model=BaseResponse)
async def get_universities(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "name",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get paginated list of universities with stats
    
    Data visibility based on role:
    - super_admin/admin: ALL universities
    - manager: Only their assigned university
    - referrer: ALL universities (for submitting referrals)
    """
    try:
        controller = UniversityController(db)
        
        # Apply role-based filtering
        university_filter_id = None
        
        # Manager only sees their assigned university
        if current_user.role == 'manager':
            if current_user.university_id:
                university_filter_id = current_user.university_id
            else:
                # No university assigned - return empty list
                return BaseResponse(
                    success=True,
                    message="No university assigned to your account",
                    data={
                        "items": [],
                        "total": 0,
                        "page": page,
                        "limit": limit,
                        "pages": 0
                    }
                )
        
        return controller.get_universities(
            page=page,
            limit=limit,
            status=status,
            search=search,
            sort_by=sort_by,
            university_id=university_filter_id,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("", response_model=BaseResponse, status_code=201)
async def create_university(
    data: UniversityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Create a new university (admin only)
    """
    try:
        controller = UniversityController(db)
        return controller.create_university(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/{university_id}", response_model=BaseResponse)
async def get_university(
    university_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get university by ID with details and stats
    """
    try:
        controller = UniversityController(db)
        return controller.get_university(university_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{university_id}", response_model=BaseResponse)
async def update_university(
    university_id: UUID,
    data: UniversityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Update university (admin only)
    """
    try:
        controller = UniversityController(db)
        return controller.update_university(university_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{university_id}", response_model=BaseResponse)
async def delete_university(
    university_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Delete university (admin only)
    Fails if has associated referrals or programs
    """
    try:
        controller = UniversityController(db)
        return controller.delete_university(university_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{university_id}/status", response_model=BaseResponse)
async def toggle_university_status(
    university_id: UUID,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Toggle university active/inactive status (admin only)
    """
    try:
        controller = UniversityController(db)
        return controller.toggle_status(university_id, data.status)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/{university_id}/programs", response_model=BaseResponse)
async def get_university_programs(
    university_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all programs for a university
    """
    try:
        controller = ProgramController(db)
        return controller.get_programs_by_university(university_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/{university_id}/programs", response_model=BaseResponse, status_code=201)
async def create_university_program(
    university_id: UUID,
    data: ProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Create a new program for university (admin only)
    """
    # Ensure university_id matches
    data.university_id = university_id
    
    try:
        controller = ProgramController(db)
        return controller.create_program(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

