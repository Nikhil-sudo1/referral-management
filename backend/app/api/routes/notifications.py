"""
Notification Routes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.notification_service import NotificationService
from app.schemas.common import BaseResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.core.exceptions import AppException

router = APIRouter()


@router.get("", response_model=BaseResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get notifications for current user
    """
    try:
        service = NotificationService(db)
        result = service.get_notifications(
            user_id=current_user.id,
            page=page,
            limit=limit,
            is_read=is_read,
            category=category,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data={
                "items": [
                    {
                        "id": str(n.id),
                        "title": n.title,
                        "message": n.message,
                        "type": n.type,
                        "category": n.category,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat() if n.created_at else None,
                    }
                    for n in result["items"]
                ],
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "pages": result["pages"],
            }
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/unread-count", response_model=BaseResponse)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get unread notification count
    """
    try:
        service = NotificationService(db)
        count = service.get_unread_count(current_user.id)
        return BaseResponse(
            success=True,
            message="Success",
            data={"count": count}
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/{notification_id}/read", response_model=BaseResponse)
async def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark notification as read
    """
    try:
        service = NotificationService(db)
        service.mark_as_read(notification_id, current_user.id)
        return BaseResponse(
            success=True,
            message="Notification marked as read"
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.patch("/read-all", response_model=BaseResponse)
async def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark all notifications as read
    """
    try:
        service = NotificationService(db)
        count = service.mark_all_as_read(current_user.id)
        return BaseResponse(
            success=True,
            message=f"Marked {count} notifications as read"
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete("/{notification_id}", response_model=BaseResponse)
async def delete_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a notification
    """
    try:
        service = NotificationService(db)
        service.delete_notification(notification_id, current_user.id)
        return BaseResponse(
            success=True,
            message="Notification deleted"
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

