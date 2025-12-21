"""
Notification Service
Notification management operations
NOTE: Notification model was removed, this service now returns empty data
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.logging import logger


class NotificationService:
    """Notification service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_notifications(self, user_id: UUID, page: int = 1, limit: int = 20, is_read: Optional[bool] = None, category: Optional[str] = None) -> dict:
        return {"items": [], "total": 0, "page": page, "limit": limit, "pages": 1}
    
    def get_unread_count(self, user_id: UUID) -> int:
        return 0
    
    def mark_as_read(self, notification_id: UUID, user_id: UUID):
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Notification not found")
    
    def mark_all_as_read(self, user_id: UUID) -> int:
        return 0
    
    def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("Notification not found")
    
    def create_notification(self, user_id: UUID, title: str, message: str, type: str = "info", category: str = "system", reference_type: Optional[str] = None, reference_id: Optional[UUID] = None):
        logger.info(f"Notification creation skipped for user {user_id}: {title}")
        return None
    
    def notify_referral_submitted(self, referral, managers: List[UUID]):
        pass
    
    def notify_counselor_assigned(self, referral, counselor_id: UUID):
        pass
    
    def notify_status_change(self, referral, referrer_id: UUID, new_status: str):
        pass
    
    def notify_reward_disbursed(self, reward, user_id: UUID):
        pass
