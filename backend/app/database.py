"""
Database Configuration and Session Management
Centralized database connection handling
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.config import settings

# Create database engine with connection pooling
# OPTIMIZATION: Enable pool_pre_ping to handle dropped connections gracefully
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,          # Moderate pool size
    max_overflow=20,       # Allow overflow for burst traffic
    pool_pre_ping=True,    # ENABLED - checks if connection is alive before using
    pool_recycle=180,      # Recycle connections every 3 min to avoid stale connections
    pool_timeout=30,       # Wait up to 30 seconds for a connection
    echo=False,            # DISABLED SQL echo for performance
    connect_args={
        "connect_timeout": 10,      # Connection timeout
        "keepalives": 1,            # Enable TCP keepalives
        "keepalives_idle": 30,      # Start keepalive after 30s idle
        "keepalives_interval": 10,  # Keepalive interval
        "keepalives_count": 5,      # Number of keepalive retries
    }
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Database session dependency
    Yields a database session and ensures cleanup
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

