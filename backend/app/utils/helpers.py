"""
Utility Helper Functions
"""
import random
import string
from decimal import Decimal
from typing import Tuple, TypeVar, Generic, List
from sqlalchemy.orm import Query


def generate_unique_code(prefix: str = "", length: int = 6) -> str:
    """
    Generate a unique alphanumeric code
    
    Args:
        prefix: Optional prefix for the code
        length: Length of the random part
    
    Returns:
        Generated code string
    """
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=length))
    
    if prefix:
        return f"{prefix}-{random_part}"
    return random_part


def format_currency(amount: Decimal, currency: str = "INR") -> str:
    """
    Format amount as currency string
    
    Args:
        amount: Decimal amount
        currency: Currency code
    
    Returns:
        Formatted currency string
    """
    if currency == "INR":
        return f"₹{amount:,.2f}"
    elif currency == "USD":
        return f"${amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def calculate_conversion_rate(total: int, converted: int) -> float:
    """
    Calculate conversion rate as percentage
    
    Args:
        total: Total count
        converted: Converted count
    
    Returns:
        Conversion rate percentage
    """
    if total == 0:
        return 0.0
    return round((converted / total) * 100, 1)


def paginate_query(
    query: Query,
    page: int,
    limit: int,
) -> Tuple[List, int, int]:
    """
    Apply pagination to SQLAlchemy query
    
    Args:
        query: SQLAlchemy query
        page: Page number (1-indexed)
        limit: Items per page
    
    Returns:
        Tuple of (items, total_count, total_pages)
    """
    import math
    
    total = query.count()
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return items, total, pages


def mask_email(email: str) -> str:
    """
    Mask email for privacy
    
    Args:
        email: Email address
    
    Returns:
        Masked email (e.g., j***n@example.com)
    """
    if "@" not in email:
        return email
    
    local, domain = email.split("@")
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"


def mask_phone(phone: str) -> str:
    """
    Mask phone number for privacy
    
    Args:
        phone: Phone number
    
    Returns:
        Masked phone (e.g., ****1234)
    """
    if len(phone) <= 4:
        return "*" * len(phone)
    
    return "*" * (len(phone) - 4) + phone[-4:]

