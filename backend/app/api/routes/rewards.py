"""
Reward Routes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.controllers.reward_controller import RewardController
from app.schemas.reward import RewardCreate, RewardApprove, RewardDisburse
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user, get_admin_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


class CancelRequest(BaseModel):
    reason: str


@router.get("", response_model=BaseResponse)
async def get_rewards(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    user_type: Optional[str] = None,
    user_id: Optional[UUID] = None,
    referral_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get paginated list of rewards (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.get_rewards(
            page=page,
            limit=limit,
            status=status,
            user_type=user_type,
            user_id=user_id,
            referral_id=referral_id,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("", response_model=BaseResponse, status_code=201)
async def create_reward(
    data: RewardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Create a new reward entry (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.create_reward(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-rewards", response_model=BaseResponse)
async def get_my_rewards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's rewards
    """
    try:
        controller = RewardController(db)
        return controller.get_my_rewards(current_user.id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/tiers", response_model=BaseResponse)
async def get_reward_tiers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get reward tier configuration
    """
    try:
        controller = RewardController(db)
        return controller.get_reward_tiers()
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/{reward_id}", response_model=BaseResponse)
async def get_reward(
    reward_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Get reward by ID (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.get_reward(reward_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{reward_id}/approve", response_model=BaseResponse)
async def approve_reward(
    reward_id: UUID,
    data: RewardApprove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Approve a pending reward (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.approve_reward(reward_id, data, current_user.id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{reward_id}/disburse", response_model=BaseResponse)
async def disburse_reward(
    reward_id: UUID,
    data: RewardDisburse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Disburse an approved reward (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.disburse_reward(reward_id, data, current_user.id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{reward_id}/cancel", response_model=BaseResponse)
async def cancel_reward(
    reward_id: UUID,
    data: CancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """
    Cancel a reward (admin only)
    """
    try:
        controller = RewardController(db)
        return controller.cancel_reward(reward_id, data.reason)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

