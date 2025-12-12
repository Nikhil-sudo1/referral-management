"""
Notification Service
Notification management operations
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.core.logging import logger


class NotificationService:
    """Notification service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_notifications(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 20,
        is_read: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> dict:
        """
        Get notifications for a user
        """
        query = self.db.query(Notification).filter(
            Notification.user_id == user_id
        )
        
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        
        if category:
            query = query.filter(Notification.category == category)
        
        total = query.count()
        
        offset = (page - 1) * limit
        notifications = query.order_by(
            Notification.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        import math
        pages = math.ceil(total / limit) if total > 0 else 1
        
        return {
            "items": notifications,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
        }
    
    def get_unread_count(self, user_id: UUID) -> int:
        """
        Get unread notification count
        """
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Notification:
        """
        Mark a notification as read
        """
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            from app.core.exceptions import NotFoundException
            raise NotFoundException("Notification not found")
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def mark_all_as_read(self, user_id: UUID) -> int:
        """
        Mark all notifications as read
        """
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        
        self.db.commit()
        
        logger.info(f"Marked {count} notifications as read for user {user_id}")
        return count
    
    def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        """
        Delete a notification
        """
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            from app.core.exceptions import NotFoundException
            raise NotFoundException("Notification not found")
        
        self.db.delete(notification)
        self.db.commit()
        
        return True
    
    def create_notification(
        self,
        user_id: UUID,
        title: str,
        message: str,
        type: str = "info",
        category: str = "system",
        reference_type: Optional[str] = None,
        reference_id: Optional[UUID] = None,
    ) -> Notification:
        """
        Create a new notification
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            category=category,
            reference_type=reference_type,
            reference_id=reference_id,
            is_read=False,
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        logger.info(f"Notification created for user {user_id}: {title}")
        return notification
    
    def notify_referral_submitted(self, referral, managers: List[UUID]):
        """Notify managers about new referral"""
        for manager_id in managers:
            self.create_notification(
                user_id=manager_id,
                title="New Referral Submitted",
                message=f"New referral {referral.referral_code} from {referral.referrer_name}",
                type="info",
                category="referral",
                reference_type="referral",
                reference_id=referral.id,
            )
    
    def notify_counselor_assigned(self, referral, counselor_id: UUID):
        """Notify counselor about assignment"""
        self.create_notification(
            user_id=counselor_id,
            title="New Referral Assigned",
            message=f"You have been assigned referral {referral.referral_code}",
            type="info",
            category="assignment",
            reference_type="referral",
            reference_id=referral.id,
        )
    
    def notify_status_change(self, referral, referrer_id: UUID, new_status: str):
        """Notify referrer about status change"""
        status_messages = {
            "assigned": "is being processed",
            "contacted": "student has been contacted",
            "admitted": "has been admitted! Congratulations!",
            "rejected": "was not successful",
        }
        
        message = f"Your referral {referral.referral_code} {status_messages.get(new_status, 'status updated')}"
        
        self.create_notification(
            user_id=referrer_id,
            title=f"Referral {new_status.capitalize()}",
            message=message,
            type="success" if new_status == "admitted" else "info",
            category="referral",
            reference_type="referral",
            reference_id=referral.id,
        )
    
    def notify_reward_disbursed(self, reward, user_id: UUID):
        """Notify user about reward disbursement"""
        self.create_notification(
            user_id=user_id,
            title="Reward Disbursed",
            message=f"Your reward of ₹{reward.amount:,.0f} has been disbursed",
            type="success",
            category="reward",
            reference_type="reward",
            reference_id=reward.id,
        )

