"""
TeamLease EdTech Referral Portal - FastAPI Application
Main entry point for the backend API
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text
from app.config import settings
from app.database import init_db, SessionLocal
from app.api import router as api_router
from app.core.exceptions import AppException
from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize database tables (only in development)
    if settings.DEBUG:
        try:
            logger.info("Initializing database tables...")
            init_db()
            logger.info("Database tables initialized successfully")
        except Exception as e:
            logger.warning(f"Could not initialize database: {e}")
            logger.warning("Server will start without database. Ensure database is available.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## TeamLease EdTech Referral Portal API
    
    A comprehensive referral management system for educational institutions.
    
    ### Features:
    - **Authentication**: JWT-based secure authentication
    - **User Management**: Manage admins, counselors, and referrers
    - **University & Programs**: Manage partner universities and their programs
    - **Referrals**: Submit, track, and manage referrals
    - **Rewards**: Automated reward calculation and disbursement
    - **Analytics**: Comprehensive reporting and analytics
    - **Leaderboard**: Track top performers
    
    ### API Documentation:
    - **Swagger UI**: /docs
    - **ReDoc**: /redoc
    """,
    docs_url="/docs" if settings.DEBUG or settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.DEBUG or settings.ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json" if settings.DEBUG or settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle custom application exceptions"""
    logger.warning(f"AppException: {exc.message} - {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "errors": exc.errors,
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation error: {exc.errors()} - {request.url}")
    
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors,
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {exc} - {request.url}", exc_info=True)
    
    # In production, don't expose internal errors
    message = str(exc) if settings.DEBUG else "An unexpected error occurred"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": message,
            "errors": [],
        }
    )


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Health check endpoint (for ALB)
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for AWS ALB
    Returns 200 OK if service is healthy
    """
    health_status = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {
            "api": "ok",
            "database": "ok"
        }
    }
    
    # Check database connectivity
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"Health check - Database connection failed: {e}")
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = "failed"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    
    return health_status


# Simple health check (for container health check - no DB dependency)
@app.get("/health/live", tags=["Health"])
async def liveness_check():
    """
    Liveness probe - checks if the application is running
    Used by container orchestrators
    """
    return {"status": "alive"}


# Readiness check (for ALB target group)
@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """
    Readiness probe - checks if the application is ready to receive traffic
    Used by load balancers
    """
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ready"}
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "reason": "database_unavailable"}
        )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=80,
        reload=settings.DEBUG,
    )

