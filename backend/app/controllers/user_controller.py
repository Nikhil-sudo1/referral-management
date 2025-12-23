"""
User Controller
Maps user requests to service calls
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.common import BaseResponse


class UserController:
    """User controller"""
    
    def __init__(self, db: Session):
        self.service = UserService(db)
    
    def get_users(
        self,
        page: int = 1,
        limit: int = 20,
        role: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> BaseResponse:
        """Get paginated users"""
        # Convert role string to role_id if provided (for backward compatibility)
        role_id = None
        if role:
            # Try to map role name to role_id
            # This is a simple mapping - you may need to query the database
            role_mapping = {
                "hr_admin": 1,
                "business_head": 2,
                "student_admin": 3,
                "employee": 4,
                "student": 5,
            }
            role_id = role_mapping.get(role.lower())
        
        result = self.service.get_users(
            page=page,
            limit=limit,
            role_id=role_id,
            search=search,
            is_active=is_active,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )
    
    def get_user(self, user_id: UUID) -> BaseResponse:
        """Get user by ID"""
        user = self.service.get_user_by_id(user_id)
        return BaseResponse(
            success=True,
            message="Success",
            data=UserResponse.model_validate(user).model_dump()
        )
    
    def create_user(self, data: UserCreate) -> BaseResponse:
        """Create new user"""
        user = self.service.create_user(data)
        return BaseResponse(
            success=True,
            message="User created successfully",
            data=UserResponse.model_validate(user).model_dump()
        )
    
    def update_user(self, user_id: UUID, data: UserUpdate) -> BaseResponse:
        """Update user"""
        user = self.service.update_user(user_id, data)
        return BaseResponse(
            success=True,
            message="User updated successfully",
            data=UserResponse.model_validate(user).model_dump()
        )
    
    def delete_user(self, user_id: UUID) -> BaseResponse:
        """Delete user"""
        self.service.delete_user(user_id)
        return BaseResponse(
            success=True,
            message="User deactivated successfully"
        )
    
    def get_counselors(
        self,
        university_id: Optional[UUID] = None,
        is_active: bool = True,
    ) -> BaseResponse:
        """Get list of counselors"""
        counselors = self.service.get_counselors(
            university_id=university_id,
            is_active=is_active,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=[UserResponse.model_validate(c).model_dump() for c in counselors]
        )
    
    def get_referrers(
        self,
        page: int = 1,
        limit: int = 20,
        is_active: Optional[bool] = None,
    ) -> BaseResponse:
        """Get list of referrers with pagination"""
        result = self.service.get_referrers(
            page=page,
            limit=limit,
            is_active=is_active,
        )
        return BaseResponse(
            success=True,
            message="Success",
            data=result.model_dump()
        )

