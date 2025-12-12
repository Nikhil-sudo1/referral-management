"""
Program Routes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.controllers.program_controller import ProgramController
from app.schemas.program import ProgramCreate, ProgramUpdate
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_programs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    university_id: Optional[UUID] = None,
    status: Optional[str] = None,
    reward_tier: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get paginated list of programs
    """
    try:
        controller = ProgramController(db)
        return controller.get_programs(
            page=page,
            limit=limit,
            university_id=university_id,
            status=status,
            reward_tier=reward_tier,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/{program_id}", response_model=BaseResponse)
async def get_program(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get program by ID
    """
    try:
        controller = ProgramController(db)
        return controller.get_program(program_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.put("/{program_id}", response_model=BaseResponse)
async def update_program(
    program_id: UUID,
    data: ProgramUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Update program (admin only)
    """
    try:
        controller = ProgramController(db)
        return controller.update_program(program_id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{program_id}", response_model=BaseResponse)
async def delete_program(
    program_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Delete program (admin only)
    Fails if has associated referrals
    """
    try:
        controller = ProgramController(db)
        return controller.delete_program(program_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

