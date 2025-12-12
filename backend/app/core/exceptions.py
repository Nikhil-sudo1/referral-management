"""
Custom Exception Classes
Centralized exception handling for the application
"""
from typing import Optional, List, Dict, Any


class AppException(Exception):
    """Base application exception"""
    
    def __init__(
        self,
        message: str = "An error occurred",
        status_code: int = 500,
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found exception"""
    
    def __init__(
        self,
        message: str = "Resource not found",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=404, errors=errors)


class UnauthorizedException(AppException):
    """Unauthorized access exception"""
    
    def __init__(
        self,
        message: str = "Unauthorized",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=401, errors=errors)


class ForbiddenException(AppException):
    """Forbidden access exception"""
    
    def __init__(
        self,
        message: str = "Forbidden",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=403, errors=errors)


class ValidationException(AppException):
    """Validation error exception"""
    
    def __init__(
        self,
        message: str = "Validation error",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=422, errors=errors)


class ConflictException(AppException):
    """Conflict exception (e.g., duplicate entry)"""
    
    def __init__(
        self,
        message: str = "Conflict",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=409, errors=errors)


class BadRequestException(AppException):
    """Bad request exception"""
    
    def __init__(
        self,
        message: str = "Bad request",
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        super().__init__(message=message, status_code=400, errors=errors)

