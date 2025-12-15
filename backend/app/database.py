"""
Database Configuration and Session Management
Centralized database connection handling
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.config import settings

# Create database engine with connection pooling
# OPTIMIZATION: Disabled SQL echo and pool_pre_ping for remote database performance
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,          # Increased pool size
    max_overflow=30,       # Increased overflow
    pool_pre_ping=False,   # DISABLED - causes latency on remote databases
    pool_recycle=300,      # Recycle connections every 5 min
    echo=False,            # DISABLED SQL echo for performance
    connect_args={
        "connect_timeout": 10,  # Connection timeout
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

