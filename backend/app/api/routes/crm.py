"""
CRM Routes
Endpoints for fetching master data from Digivarsity CRM
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.common import BaseResponse
from app.services.crm_service import CRMService
from app.core.exceptions import AppException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/universities", response_model=BaseResponse)
async def get_crm_universities(
    db: Session = Depends(get_db),
):
    """
    Get universities from CRM master data
    Uses POST /common/get_master_dd with identifier: ["university"]
    """
    try:
        crm_service = CRMService(db)
        universities = await crm_service.get_master_data(identifier=["university"])
        
        return BaseResponse(
            success=True,
            message="Universities retrieved successfully",
            data=universities
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Error fetching CRM universities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching universities: {str(e)}")


@router.post("/courses", response_model=BaseResponse)
async def get_crm_courses(
    university_id: int = Query(..., description="University ID (parent_id)"),
    db: Session = Depends(get_db),
):
    """
    Get courses from CRM master data for a specific university
    Uses POST /common/get_master_dd with identifier: ["course"], status: 1, parent_id: university_id
    """
    try:
        crm_service = CRMService(db)
        courses = await crm_service.get_master_data(
            identifier=["course"],
            status=1,
            parent_id=university_id
        )
        
        return BaseResponse(
            success=True,
            message="Courses retrieved successfully",
            data=courses
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Error fetching CRM courses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

