"""
Job Referral Routes
API endpoints for employee job referrals
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.job_referral_service import JobReferralService
from app.schemas.job_referral import (
    JobReferralSubmit, JobReferralResponse, JobReferralListResponse,
    JobReferralStatsResponse, LeaderboardResponse, LinkedInShareTemplate,
    JobListResponse, UserRewardProgress, RewardSlabResponse
)
from app.core.exceptions import AppException
from typing import List

router = APIRouter(prefix="/job-referrals", tags=["Job Referrals"])


@router.get("/jobs", response_model=JobListResponse)
async def get_available_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    company_id: Optional[int] = None,
    industry_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get available jobs for the employee's organization/industry.
    Employees see jobs from their company or industry.
    """
    try:
        service = JobReferralService(db)
        
        # If employee has org_id (company), show jobs from that company
        if current_user.org_id and not industry_id:
            return service.get_jobs_for_company(current_user.org_id, page, per_page)
        
        # Otherwise filter by provided company or industry
        if company_id:
            return service.get_jobs_for_company(company_id, page, per_page)
        elif industry_id:
            return service.get_jobs_by_industry(industry_id, page, per_page)
        else:
            # Return all active jobs if no filter
            return service.get_jobs_by_industry(1, page, per_page)  # Default industry
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/submit", response_model=dict)
async def submit_job_referral(
    data: JobReferralSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a new job referral.
    Employee refers a candidate for a job position.
    """
    try:
        service = JobReferralService(db)
        referral = service.submit_referral(current_user, data)
        return {
            "success": True,
            "message": "Referral submitted successfully",
            "data": referral
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-referrals", response_model=JobReferralListResponse)
async def get_my_job_referrals(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    job_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all job referrals made by the current user.
    """
    try:
        service = JobReferralService(db)
        return service.get_my_referrals(current_user.id, page, per_page, status, job_id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-stats", response_model=dict)
async def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get referral statistics for the current user.
    """
    try:
        service = JobReferralService(db)
        stats = service.get_my_stats(current_user.id)
        return {
            "success": True,
            "data": stats
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query("all", regex="^(all|month|week)$"),
    job_id: Optional[int] = None,
    company_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get job referral leaderboard.
    Can filter by period (all, month, week) and by job/company.
    """
    try:
        service = JobReferralService(db)
        leaderboard = service.get_leaderboard(period, job_id, company_id, limit)
        
        # Find current user's rank
        for entry in leaderboard.data:
            if entry.user_id == current_user.id:
                leaderboard.user_rank = entry.rank
                break
        
        return leaderboard
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/reward-slabs", response_model=dict)
async def get_reward_slabs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all active reward slabs.
    """
    try:
        service = JobReferralService(db)
        slabs = service.get_reward_slabs()
        return {
            "success": True,
            "data": slabs
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/my-rewards", response_model=dict)
async def get_my_reward_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's reward progress and level.
    """
    try:
        service = JobReferralService(db)
        progress = service.get_user_reward_progress(current_user.id)
        return {
            "success": True,
            "data": progress
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/linkedin-share/{job_id}", response_model=dict)
async def get_linkedin_share_template(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate LinkedIn share template for a job posting.
    """
    try:
        service = JobReferralService(db)
        template = service.generate_linkedin_share(job_id, current_user)
        return {
            "success": True,
            "data": template
        }
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

