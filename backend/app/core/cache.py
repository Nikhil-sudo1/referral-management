"""
Simple In-Memory Cache
For frequently accessed data that doesn't need to be real-time
"""
import time
from functools import wraps
from typing import Any, Dict, Optional, Callable
import hashlib
import json

# Simple in-memory cache storage
_cache: Dict[str, tuple] = {}  # key -> (value, expiry_time)

# Default TTL in seconds
DEFAULT_TTL = 30  # Cache for 30 seconds


def cache_key(*args, **kwargs) -> str:
    """Generate a cache key from function arguments"""
    key_data = json.dumps({"args": str(args), "kwargs": str(kwargs)}, sort_keys=True)
    return hashlib.md5(key_data.encode()).hexdigest()


def get_cached(key: str) -> Optional[Any]:
    """Get value from cache if not expired"""
    if key in _cache:
        value, expiry = _cache[key]
        if time.time() < expiry:
            return value
        # Expired, remove it
        del _cache[key]
    return None


def set_cached(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """Set value in cache with TTL"""
    _cache[key] = (value, time.time() + ttl)


def clear_cache() -> None:
    """Clear all cached data"""
    global _cache
    _cache = {}


def cached(ttl: int = DEFAULT_TTL, prefix: str = ""):
    """
    Decorator to cache function results
    
    Usage:
        @cached(ttl=60)
        def my_function():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = f"{prefix}:{func.__name__}:{cache_key(*args[1:], **kwargs)}"  # Skip 'self' arg
            
            # Check cache
            cached_value = get_cached(key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = func(*args, **kwargs)
            set_cached(key, result, ttl)
            return result
        return wrapper
    return decorator

