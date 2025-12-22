"""
HR Admin Routes
API endpoints for HR Admin job management and operations
"""
from typing import Optional, List
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel, Field
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.company import Company
from app.models.industry import Industry
from app.models.job_referral import JobReferral, JobReferralReward, JobRewardSlab
from app.services.email_service import EmailService
from app.core.exceptions import AppException
from app.core.logging import logger

router = APIRouter(prefix="/hr-admin", tags=["HR Admin"])


# ==================== SCHEMAS ====================

class JobCreateRequest(BaseModel):
    """Schema for creating a new job"""
    job_title: str = Field(..., min_length=3, max_length=255)
    job_code: Optional[str] = None
    description: str = Field(..., min_length=10)
    exp_from: float = 0
    exp_to: float = 0
    ctc_from: Optional[float] = None
    ctc_to: Optional[float] = None
    hide_salary: bool = False
    vacancies: int = 1
    location: str
    pincode: Optional[str] = None
    valid_till: date
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_mobile: Optional[str] = None


class JobResponse(BaseModel):
    """Job response with referral stats"""
    id: int
    job_title: str
    job_code: Optional[str]
    company_name: str
    industry_name: str
    location: str
    vacancies: int
    exp_from: float
    exp_to: float
    ctc_from: Optional[float]
    ctc_to: Optional[float]
    hide_salary: bool
    valid_till: date
    is_active: bool
    created_at: datetime
    total_referrals: int = 0
    pending_referrals: int = 0
    hired_count: int = 0


class ReferrerInfo(BaseModel):
    """Referrer info in job listing"""
    id: str
    name: str
    email: str
    phone: str
    referral_count: int
    hired_count: int


class LeaderboardEntry(BaseModel):
    """Leaderboard entry"""
    rank: int
    user_id: str
    name: str
    email: str
    phone: str
    total_referrals: int
    successful_hires: int
    pending: int
    conversion_rate: float
    total_earnings: float
    slab_name: str


class ReferrerOperationInfo(BaseModel):
    """Referrer operation info"""
    id: str
    name: str
    email: str
    phone: str
    referral_code: str
    is_active: bool
    total_referrals: int
    successful_hires: int
    pending_earnings: float
    paid_earnings: float
    created_at: datetime
    last_referral_date: Optional[datetime]


class ReferrerRequest(BaseModel):
    """Request from referrer"""
    id: str
    referrer_id: str
    referrer_name: str
    referrer_email: str
    request_type: str
    subject: str
    message: str
    status: str
    created_at: datetime


# ==================== HELPER FUNCTIONS ====================

def send_job_notification_email(db: Session, job: Job, company: Company, hr_user: User):
    """Send job notification email to employees in the same organization"""
    try:
        # Find all employees (user_type_id=2, role_id=4) in the same organization
        employees = db.query(User).filter(
            User.user_type_id == 2,
            User.role_id == 4,
            User.org_id == hr_user.org_id,
            User.is_active == True,
            User.email_verification == True,
            User.id != hr_user.id  # Exclude the HR admin themselves
        ).all()
        
        if not employees:
            logger.info(f"No employees found in organization {hr_user.org_id} to notify")
            return
        
        email_service = EmailService(db)
        
        for employee in employees:
            try:
                html_body = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New Job Opportunity!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Refer & Earn Rewards</p>
                        </div>
                        
                        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #1f2937; margin: 0 0 20px;">{job.job_title}</h2>
                            
                            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                <p style="margin: 0 0 10px;"><strong>Company:</strong> {company.name}</p>
                                <p style="margin: 0 0 10px;"><strong>Location:</strong> {job.location}</p>
                                <p style="margin: 0 0 10px;"><strong>Experience:</strong> {job.exp_from} - {job.exp_to} years</p>
                                <p style="margin: 0 0 10px;"><strong>Vacancies:</strong> {job.vacancies}</p>
                                <p style="margin: 0;"><strong>Valid Till:</strong> {job.valid_till.strftime('%d %b %Y')}</p>
                            </div>
                            
                            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                                {job.description[:300]}{'...' if len(job.description) > 300 else ''}
                            </p>
                            
                            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <p style="color: #065f46; margin: 0;">
                                    💰 <strong>Refer candidates and earn rewards!</strong> Login to your employee portal to refer candidates for this position.
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{email_service.db}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    🚀 Refer a Candidate
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                This notification was sent because you are registered as an employee referrer at {company.name}.
                            </p>
                        </div>
                        
                        <div style="text-align: center; padding: 20px;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2024 TeamLease EdTech. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                email_service._send_email(
                    to_email=employee.email,
                    subject=f"🎯 New Job: {job.job_title} at {company.name} - Refer & Earn!",
                    html_body=html_body
                )
                logger.info(f"Job notification sent to {employee.email}")
            except Exception as e:
                logger.error(f"Failed to send job notification to {employee.email}: {e}")
        
        logger.info(f"Job notifications sent to {len(employees)} employees")
    except Exception as e:
        logger.error(f"Error sending job notifications: {e}")


# ==================== ROUTES ====================

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get HR Admin dashboard statistics"""
    # Verify HR Admin role
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        # Get company for the HR admin
        company = db.query(Company).filter(Company.id == current_user.org_id).first()
        
        # Total jobs posted by this organization
        total_jobs = db.query(Job).filter(
            Job.company_id == current_user.org_id,
            Job.is_active == True
        ).count()
        
        # Active jobs (not expired)
        active_jobs = db.query(Job).filter(
            Job.company_id == current_user.org_id,
            Job.is_active == True,
            Job.valid_till >= date.today()
        ).count()
        
        # Total referrals for organization's jobs
        total_referrals = db.query(JobReferral).filter(
            JobReferral.company_id == current_user.org_id
        ).count()
        
        # Pending referrals
        pending_referrals = db.query(JobReferral).filter(
            JobReferral.company_id == current_user.org_id,
            JobReferral.status.in_(['submitted', 'screening', 'interviewing'])
        ).count()
        
        # Successful hires
        successful_hires = db.query(JobReferral).filter(
            JobReferral.company_id == current_user.org_id,
            JobReferral.status == 'joined'
        ).count()
        
        # Total employees (referrers)
        total_referrers = db.query(User).filter(
            User.user_type_id == 2,
            User.role_id == 4,
            User.org_id == current_user.org_id,
            User.is_active == True
        ).count()
        
        # Month-wise stats (last 6 months)
        monthly_stats = []
        for i in range(5, -1, -1):
            month_start = datetime.now().replace(day=1) - timedelta(days=i*30)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            referrals = db.query(JobReferral).filter(
                JobReferral.company_id == current_user.org_id,
                JobReferral.submission_date >= month_start,
                JobReferral.submission_date <= month_end
            ).count()
            
            hires = db.query(JobReferral).filter(
                JobReferral.company_id == current_user.org_id,
                JobReferral.status == 'joined',
                JobReferral.joining_date >= month_start,
                JobReferral.joining_date <= month_end
            ).count()
            
            monthly_stats.append({
                "month": month_start.strftime("%b"),
                "referrals": referrals,
                "hires": hires
            })
        
        return {
            "success": True,
            "data": {
                "company_name": company.name if company else "Unknown",
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "total_referrals": total_referrals,
                "pending_referrals": pending_referrals,
                "successful_hires": successful_hires,
                "total_referrers": total_referrers,
                "conversion_rate": round((successful_hires / total_referrals * 100) if total_referrals > 0 else 0, 1),
                "monthly_stats": monthly_stats
            }
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs")
async def create_job(
    job_data: JobCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new job posting and notify employees"""
    # Verify HR Admin role
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    if not current_user.org_id:
        raise HTTPException(status_code=400, detail="User not associated with any organization")
    
    try:
        # Get company and industry
        company = db.query(Company).filter(Company.id == current_user.org_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Generate job code if not provided
        job_code = job_data.job_code
        if not job_code:
            existing_count = db.query(Job).filter(Job.company_id == company.id).count()
            job_code = f"{company.name[:3].upper()}-{existing_count + 1:04d}"
        
        # Create job
        job = Job(
            job_title=job_data.job_title,
            job_code=job_code,
            company_id=company.id,
            industry_id=company.industry_id,
            description=job_data.description,
            exp_from=job_data.exp_from,
            exp_to=job_data.exp_to,
            ctc_from=job_data.ctc_from,
            ctc_to=job_data.ctc_to,
            hide_salary=job_data.hide_salary,
            vacancies=job_data.vacancies,
            location=job_data.location,
            pincode=job_data.pincode,
            valid_till=job_data.valid_till,
            recruiter_name=job_data.recruiter_name or current_user.full_name,
            recruiter_email=job_data.recruiter_email or current_user.email,
            recruiter_mobile=job_data.recruiter_mobile or current_user.mobile_number,
            is_active=True,
            status=True,
            source="hr_portal"
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Send email notifications to employees in background
        background_tasks.add_task(send_job_notification_email, db, job, company, current_user)
        
        logger.info(f"Job created: {job.job_title} by {current_user.email}")
        
        return {
            "success": True,
            "message": "Job created successfully. Notifications will be sent to employees.",
            "data": {
                "id": job.id,
                "job_title": job.job_title,
                "job_code": job.job_code,
                "company_name": company.name,
                "location": job.location,
                "valid_till": job.valid_till.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def get_jobs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of jobs for HR Admin's organization with referral stats"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        query = db.query(Job).filter(Job.company_id == current_user.org_id)
        
        # Apply filters
        if status == "active":
            query = query.filter(Job.is_active == True, Job.valid_till >= date.today())
        elif status == "expired":
            query = query.filter(Job.valid_till < date.today())
        elif status == "inactive":
            query = query.filter(Job.is_active == False)
        
        if search:
            query = query.filter(
                or_(
                    Job.job_title.ilike(f"%{search}%"),
                    Job.job_code.ilike(f"%{search}%"),
                    Job.location.ilike(f"%{search}%")
                )
            )
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        # Get company info
        company = db.query(Company).filter(Company.id == current_user.org_id).first()
        industry = db.query(Industry).filter(Industry.id == company.industry_id).first() if company else None
        
        # Build response with referral stats
        result = []
        for job in jobs:
            # Get referral stats for this job
            total_refs = db.query(JobReferral).filter(JobReferral.job_id == job.id).count()
            pending_refs = db.query(JobReferral).filter(
                JobReferral.job_id == job.id,
                JobReferral.status.in_(['submitted', 'screening', 'interviewing'])
            ).count()
            hired = db.query(JobReferral).filter(
                JobReferral.job_id == job.id,
                JobReferral.status == 'joined'
            ).count()
            
            result.append({
                "id": job.id,
                "job_title": job.job_title,
                "job_code": job.job_code,
                "company_name": company.name if company else "Unknown",
                "industry_name": industry.name if industry else "Unknown",
                "location": job.location,
                "vacancies": job.vacancies,
                "exp_from": float(job.exp_from or 0),
                "exp_to": float(job.exp_to or 0),
                "ctc_from": float(job.ctc_from) if job.ctc_from else None,
                "ctc_to": float(job.ctc_to) if job.ctc_to else None,
                "hide_salary": job.hide_salary,
                "valid_till": job.valid_till.isoformat() if job.valid_till else None,
                "is_active": job.is_active and (job.valid_till >= date.today() if job.valid_till else True),
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "total_referrals": total_refs,
                "pending_referrals": pending_refs,
                "hired_count": hired
            })
        
        return {
            "success": True,
            "data": result,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        }
    except Exception as e:
        logger.error(f"Error getting jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}/referrals")
async def get_job_referrals(
    job_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get referrals for a specific job with referrer details"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        # Verify job belongs to HR's organization
        job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.org_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        query = db.query(JobReferral).filter(JobReferral.job_id == job_id)
        
        if status:
            query = query.filter(JobReferral.status == status)
        
        total = query.count()
        referrals = query.order_by(JobReferral.submission_date.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        result = []
        for ref in referrals:
            result.append({
                "id": str(ref.id),
                "referral_code": ref.referral_code,
                "candidate_name": ref.referee_name,
                "candidate_email": ref.referee_email,
                "candidate_phone": ref.referee_phone,
                "candidate_experience": ref.referee_experience,
                "candidate_current_company": ref.referee_current_company,
                "referrer_name": ref.referrer_name,
                "referrer_email": ref.referrer_email,
                "referrer_phone": ref.referrer_phone,
                "status": ref.status,
                "submission_date": ref.submission_date.isoformat() if ref.submission_date else None,
                "expected_reward": float(ref.expected_reward) if ref.expected_reward else None
            })
        
        return {
            "success": True,
            "data": {
                "job": {
                    "id": job.id,
                    "title": job.job_title,
                    "code": job.job_code
                },
                "referrals": result
            },
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job referrals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/jobs/{job_id}/toggle-status")
async def toggle_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle job active status"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        job = db.query(Job).filter(Job.id == job_id, Job.company_id == current_user.org_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job.is_active = not job.is_active
        db.commit()
        
        return {
            "success": True,
            "message": f"Job {'activated' if job.is_active else 'deactivated'} successfully",
            "data": {"id": job.id, "is_active": job.is_active}
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error toggling job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard(
    period: str = Query("all", regex="^(all|month|week)$"),
    job_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leaderboard for referrers in the organization"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        # Build date filter
        date_filter = None
        if period == "month":
            date_filter = datetime.now() - timedelta(days=30)
        elif period == "week":
            date_filter = datetime.now() - timedelta(days=7)
        
        # Get all referrers in the organization
        referrers = db.query(User).filter(
            User.user_type_id == 2,
            User.role_id == 4,
            User.org_id == current_user.org_id,
            User.is_active == True
        ).all()
        
        leaderboard = []
        for referrer in referrers:
            # Build referral query
            ref_query = db.query(JobReferral).filter(
                JobReferral.referrer_id == referrer.id,
                JobReferral.company_id == current_user.org_id
            )
            
            if date_filter:
                ref_query = ref_query.filter(JobReferral.submission_date >= date_filter)
            
            if job_id:
                ref_query = ref_query.filter(JobReferral.job_id == job_id)
            
            total_referrals = ref_query.count()
            successful = ref_query.filter(JobReferral.status == 'joined').count()
            pending = ref_query.filter(JobReferral.status.in_(['submitted', 'screening', 'interviewing', 'offered'])).count()
            
            # Get earnings
            earnings = db.query(func.sum(JobReferralReward.amount)).filter(
                JobReferralReward.user_id == referrer.id,
                JobReferralReward.status == 'disbursed'
            ).scalar() or 0
            
            # Get slab
            slab = db.query(JobRewardSlab).filter(
                JobRewardSlab.min_referrals <= total_referrals,
                or_(JobRewardSlab.max_referrals >= total_referrals, JobRewardSlab.max_referrals == None)
            ).order_by(JobRewardSlab.level.desc()).first()
            
            leaderboard.append({
                "user_id": str(referrer.id),
                "name": referrer.full_name,
                "email": referrer.email,
                "phone": referrer.mobile_number,
                "total_referrals": total_referrals,
                "successful_hires": successful,
                "pending": pending,
                "conversion_rate": round((successful / total_referrals * 100) if total_referrals > 0 else 0, 1),
                "total_earnings": float(earnings),
                "slab_name": slab.slab_name if slab else "Bronze"
            })
        
        # Sort by total referrals
        leaderboard.sort(key=lambda x: x["total_referrals"], reverse=True)
        
        # Add ranks
        for i, entry in enumerate(leaderboard[:limit]):
            entry["rank"] = i + 1
        
        return {
            "success": True,
            "data": leaderboard[:limit],
            "period": period,
            "total_referrers": len(referrers)
        }
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/operations/referrers")
async def get_referrers_operations(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of referrers for operations management"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        query = db.query(User).filter(
            User.user_type_id == 2,
            User.role_id == 4,
            User.org_id == current_user.org_id
        )
        
        if status == "active":
            query = query.filter(User.is_active == True)
        elif status == "inactive":
            query = query.filter(User.is_active == False)
        
        if search:
            query = query.filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                    User.referral_code.ilike(f"%{search}%")
                )
            )
        
        total = query.count()
        referrers = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        result = []
        for referrer in referrers:
            # Get referral stats
            total_refs = db.query(JobReferral).filter(JobReferral.referrer_id == referrer.id).count()
            successful = db.query(JobReferral).filter(
                JobReferral.referrer_id == referrer.id,
                JobReferral.status == 'joined'
            ).count()
            
            # Get last referral date
            last_ref = db.query(JobReferral).filter(
                JobReferral.referrer_id == referrer.id
            ).order_by(JobReferral.submission_date.desc()).first()
            
            # Get earnings
            pending_earnings = db.query(func.sum(JobReferralReward.amount)).filter(
                JobReferralReward.user_id == referrer.id,
                JobReferralReward.status == 'pending'
            ).scalar() or 0
            
            paid_earnings = db.query(func.sum(JobReferralReward.amount)).filter(
                JobReferralReward.user_id == referrer.id,
                JobReferralReward.status == 'disbursed'
            ).scalar() or 0
            
            result.append({
                "id": str(referrer.id),
                "name": referrer.full_name,
                "email": referrer.email,
                "phone": referrer.mobile_number,
                "referral_code": referrer.referral_code,
                "is_active": referrer.is_active,
                "total_referrals": total_refs,
                "successful_hires": successful,
                "pending_earnings": float(pending_earnings),
                "paid_earnings": float(paid_earnings),
                "created_at": referrer.created_at.isoformat() if referrer.created_at else None,
                "last_referral_date": last_ref.submission_date.isoformat() if last_ref else None
            })
        
        return {
            "success": True,
            "data": result,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": (total + per_page - 1) // per_page
            }
        }
    except Exception as e:
        logger.error(f"Error getting referrers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/operations/referrers/{referrer_id}/toggle-status")
async def toggle_referrer_status(
    referrer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle referrer active status (affects login and referral code)"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        referrer = db.query(User).filter(
            User.id == referrer_id,
            User.org_id == current_user.org_id
        ).first()
        
        if not referrer:
            raise HTTPException(status_code=404, detail="Referrer not found")
        
        referrer.is_active = not referrer.is_active
        db.commit()
        
        status_text = "activated" if referrer.is_active else "deactivated"
        
        return {
            "success": True,
            "message": f"Referrer {status_text} successfully. {'Login enabled and referral code active.' if referrer.is_active else 'Login restricted and referral code disabled.'}",
            "data": {
                "id": str(referrer.id),
                "is_active": referrer.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error toggling referrer status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests")
async def get_referrer_requests(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get requests from referrers (placeholder - would need a requests table)"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    # Since there's no requests table yet, return sample data
    # In production, this would query a requests table
    return {
        "success": True,
        "data": [],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": 0,
            "pages": 0
        },
        "message": "Request centre coming soon"
    }


@router.get("/company-info")
async def get_company_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get HR Admin's company information"""
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Access denied. HR Admin only.")
    
    try:
        company = db.query(Company).filter(Company.id == current_user.org_id).first()
        industry = db.query(Industry).filter(Industry.id == company.industry_id).first() if company else None
        
        return {
            "success": True,
            "data": {
                "company_id": company.id if company else None,
                "company_name": company.name if company else None,
                "industry_id": industry.id if industry else None,
                "industry_name": industry.name if industry else None
            }
        }
    except Exception as e:
        logger.error(f"Error getting company info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

