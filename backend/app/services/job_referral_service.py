"""
Job Referral Service
Business logic for employee job referrals
"""
import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, extract
from decimal import Decimal

from app.models.job_referral import JobReferral, JobReferralReward, JobRewardSlab
from app.models.job import Job
from app.models.company import Company
from app.models.industry import Industry
from app.models.user import User
from app.schemas.job_referral import (
    JobReferralSubmit, JobReferralResponse, JobReferralStatsResponse,
    LeaderboardEntry, LeaderboardResponse, RewardSlabResponse, UserRewardProgress,
    JobWithCompany, LinkedInShareTemplate
)
from app.core.exceptions import AppException


class JobReferralService:
    def __init__(self, db: Session):
        self.db = db
    
    def _generate_referral_code(self) -> str:
        """Generate unique job referral code"""
        while True:
            code = f"JR-{secrets.token_hex(4).upper()}"
            existing = self.db.query(JobReferral).filter(
                JobReferral.referral_code == code
            ).first()
            if not existing:
                return code
    
    def get_jobs_for_company(self, company_id: int, page: int = 1, per_page: int = 10) -> dict:
        """Get active jobs for a specific company"""
        query = self.db.query(Job).filter(
            Job.company_id == company_id,
            Job.is_active == True,
            Job.status == True,
            Job.valid_till >= datetime.utcnow().date()
        )
        
        total = query.count()
        jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        job_list = []
        for job in jobs:
            company = self.db.query(Company).filter(Company.id == job.company_id).first()
            industry = self.db.query(Industry).filter(Industry.id == job.industry_id).first()
            
            job_list.append(JobWithCompany(
                id=job.id,
                job_title=job.job_title,
                job_code=job.job_code,
                company_id=job.company_id,
                industry_id=job.industry_id,
                exp_from=job.exp_from,
                exp_to=job.exp_to,
                ctc_from=job.ctc_from,
                ctc_to=job.ctc_to,
                hide_salary=job.hide_salary,
                description=job.description,
                vacancies=job.vacancies,
                location=job.location,
                valid_till=job.valid_till,
                status=job.status,
                company_name=company.name if company else None,
                industry_name=industry.name if industry else None
            ))
        
        return {
            "success": True,
            "data": job_list,
            "total": total,
            "page": page,
            "per_page": per_page
        }
    
    def get_jobs_by_industry(self, industry_id: int, page: int = 1, per_page: int = 10) -> dict:
        """Get active jobs for a specific industry"""
        query = self.db.query(Job).filter(
            Job.industry_id == industry_id,
            Job.is_active == True,
            Job.status == True,
            Job.valid_till >= datetime.utcnow().date()
        )
        
        total = query.count()
        jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        job_list = []
        for job in jobs:
            company = self.db.query(Company).filter(Company.id == job.company_id).first()
            industry = self.db.query(Industry).filter(Industry.id == job.industry_id).first()
            
            job_list.append(JobWithCompany(
                id=job.id,
                job_title=job.job_title,
                job_code=job.job_code,
                company_id=job.company_id,
                industry_id=job.industry_id,
                exp_from=job.exp_from,
                exp_to=job.exp_to,
                ctc_from=job.ctc_from,
                ctc_to=job.ctc_to,
                hide_salary=job.hide_salary,
                description=job.description,
                vacancies=job.vacancies,
                location=job.location,
                valid_till=job.valid_till,
                status=job.status,
                company_name=company.name if company else None,
                industry_name=industry.name if industry else None
            ))
        
        return {
            "success": True,
            "data": job_list,
            "total": total,
            "page": page,
            "per_page": per_page
        }
    
    def submit_referral(self, referrer: User, data: JobReferralSubmit) -> JobReferralResponse:
        """Submit a new job referral"""
        # Get job details
        job = self.db.query(Job).filter(Job.id == data.job_id).first()
        if not job:
            raise AppException("Job not found", 404)
        
        if not job.is_active or not job.status:
            raise AppException("This job is no longer active", 400)
        
        if job.valid_till and job.valid_till < datetime.utcnow().date():
            raise AppException("This job has expired", 400)
        
        # Check for duplicate referral
        existing = self.db.query(JobReferral).filter(
            JobReferral.referee_email == data.referee_email,
            JobReferral.job_id == data.job_id
        ).first()
        if existing:
            raise AppException("A referral for this candidate already exists for this job", 400)
        
        # Get company and industry
        company = self.db.query(Company).filter(Company.id == job.company_id).first()
        industry = self.db.query(Industry).filter(Industry.id == job.industry_id).first()
        
        # Get expected reward from slab
        referral_count = self.db.query(JobReferral).filter(
            JobReferral.referrer_id == referrer.id,
            JobReferral.status.in_(["joined"])
        ).count()
        
        slab = self.db.query(JobRewardSlab).filter(
            JobRewardSlab.is_active == True,
            JobRewardSlab.min_referrals <= referral_count + 1,
            or_(
                JobRewardSlab.max_referrals >= referral_count + 1,
                JobRewardSlab.max_referrals == None
            )
        ).first()
        
        expected_reward = slab.reward_per_referral if slab else Decimal("5000")
        
        # Create referral
        referral = JobReferral(
            referral_code=self._generate_referral_code(),
            referrer_id=referrer.id,
            referrer_name=referrer.full_name,
            referrer_email=referrer.email,
            referrer_phone=referrer.mobile_number or "",
            referee_name=data.referee_name,
            referee_email=data.referee_email,
            referee_phone=data.referee_phone,
            referee_linkedin=data.referee_linkedin,
            referee_resume_url=data.referee_resume_url,
            referee_experience=data.referee_experience,
            referee_current_company=data.referee_current_company,
            referee_current_designation=data.referee_current_designation,
            job_id=job.id,
            company_id=job.company_id,
            industry_id=job.industry_id,
            status="submitted",
            slab_tier=slab.level if slab else 1,
            expected_reward=expected_reward,
            notes=data.notes
        )
        
        self.db.add(referral)
        self.db.commit()
        self.db.refresh(referral)
        
        return JobReferralResponse(
            id=referral.id,
            referral_code=referral.referral_code,
            referrer_id=referral.referrer_id,
            referrer_name=referral.referrer_name,
            referrer_email=referral.referrer_email,
            referee_name=referral.referee_name,
            referee_email=referral.referee_email,
            referee_phone=referral.referee_phone,
            referee_linkedin=referral.referee_linkedin,
            referee_experience=referral.referee_experience,
            referee_current_company=referral.referee_current_company,
            referee_current_designation=referral.referee_current_designation,
            job_id=referral.job_id,
            job_title=job.job_title,
            company_id=referral.company_id,
            company_name=company.name if company else None,
            industry_id=referral.industry_id,
            industry_name=industry.name if industry else None,
            status=referral.status,
            submission_date=referral.submission_date,
            expected_reward=referral.expected_reward,
            reward_status=referral.reward_status,
            created_at=referral.created_at,
            updated_at=referral.updated_at
        )
    
    def get_my_referrals(
        self, 
        user_id: uuid.UUID, 
        page: int = 1, 
        per_page: int = 10,
        status: Optional[str] = None,
        job_id: Optional[int] = None
    ) -> dict:
        """Get referrals made by a user"""
        query = self.db.query(JobReferral).filter(JobReferral.referrer_id == user_id)
        
        if status:
            query = query.filter(JobReferral.status == status)
        if job_id:
            query = query.filter(JobReferral.job_id == job_id)
        
        total = query.count()
        referrals = query.order_by(JobReferral.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        referral_list = []
        for referral in referrals:
            job = self.db.query(Job).filter(Job.id == referral.job_id).first()
            company = self.db.query(Company).filter(Company.id == referral.company_id).first()
            industry = self.db.query(Industry).filter(Industry.id == referral.industry_id).first()
            
            referral_list.append(JobReferralResponse(
                id=referral.id,
                referral_code=referral.referral_code,
                referrer_id=referral.referrer_id,
                referrer_name=referral.referrer_name,
                referrer_email=referral.referrer_email,
                referee_name=referral.referee_name,
                referee_email=referral.referee_email,
                referee_phone=referral.referee_phone,
                referee_linkedin=referral.referee_linkedin,
                referee_experience=referral.referee_experience,
                referee_current_company=referral.referee_current_company,
                referee_current_designation=referral.referee_current_designation,
                job_id=referral.job_id,
                job_title=job.job_title if job else None,
                company_id=referral.company_id,
                company_name=company.name if company else None,
                industry_id=referral.industry_id,
                industry_name=industry.name if industry else None,
                status=referral.status,
                status_notes=referral.status_notes,
                submission_date=referral.submission_date,
                expected_reward=referral.expected_reward,
                actual_reward=referral.actual_reward,
                reward_status=referral.reward_status,
                created_at=referral.created_at,
                updated_at=referral.updated_at
            ))
        
        return {
            "success": True,
            "data": referral_list,
            "total": total,
            "page": page,
            "per_page": per_page
        }
    
    def get_my_stats(self, user_id: uuid.UUID) -> JobReferralStatsResponse:
        """Get referral statistics for a user"""
        # Base query
        base_query = self.db.query(JobReferral).filter(JobReferral.referrer_id == user_id)
        
        # Total referrals
        total = base_query.count()
        
        # Status counts
        submitted = base_query.filter(JobReferral.status == "submitted").count()
        screening = base_query.filter(JobReferral.status == "screening").count()
        interviewed = base_query.filter(JobReferral.status.in_(["interview_scheduled", "interviewed"])).count()
        offered = base_query.filter(JobReferral.status == "offered").count()
        joined = base_query.filter(JobReferral.status == "joined").count()
        rejected = base_query.filter(JobReferral.status == "rejected").count()
        
        # Earnings
        total_earnings = self.db.query(func.sum(JobReferral.actual_reward)).filter(
            JobReferral.referrer_id == user_id,
            JobReferral.reward_status == "disbursed"
        ).scalar() or Decimal("0")
        
        pending_earnings = self.db.query(func.sum(JobReferral.expected_reward)).filter(
            JobReferral.referrer_id == user_id,
            JobReferral.status == "joined",
            JobReferral.reward_status.in_(["pending", "approved"])
        ).scalar() or Decimal("0")
        
        # Current month/week referrals
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        current_month = base_query.filter(JobReferral.created_at >= start_of_month).count()
        current_week = base_query.filter(JobReferral.created_at >= start_of_week).count()
        
        return JobReferralStatsResponse(
            total_referrals=total,
            submitted=submitted,
            screening=screening,
            interviewed=interviewed,
            offered=offered,
            joined=joined,
            rejected=rejected,
            total_earnings=total_earnings,
            pending_earnings=pending_earnings,
            current_month_referrals=current_month,
            current_week_referrals=current_week
        )
    
    def get_leaderboard(
        self, 
        period: str = "all",  # all, month, week
        job_id: Optional[int] = None,
        company_id: Optional[int] = None,
        limit: int = 50
    ) -> LeaderboardResponse:
        """Get leaderboard of top referrers"""
        query = self.db.query(
            JobReferral.referrer_id,
            User.full_name,
            func.count(JobReferral.id).label("referral_count"),
            func.sum(
                func.case(
                    (JobReferral.status == "joined", 1),
                    else_=0
                )
            ).label("successful_referrals"),
            func.coalesce(func.sum(JobReferral.actual_reward), 0).label("total_earnings")
        ).join(
            User, User.id == JobReferral.referrer_id
        ).filter(
            User.is_active == True
        )
        
        # Apply period filter
        now = datetime.utcnow()
        if period == "month":
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(JobReferral.created_at >= start_of_month)
        elif period == "week":
            start_of_week = now - timedelta(days=now.weekday())
            start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(JobReferral.created_at >= start_of_week)
        
        # Apply filters
        if job_id:
            query = query.filter(JobReferral.job_id == job_id)
        if company_id:
            query = query.filter(JobReferral.company_id == company_id)
        
        query = query.group_by(JobReferral.referrer_id, User.full_name)
        query = query.order_by(desc("referral_count"), desc("successful_referrals"))
        results = query.limit(limit).all()
        
        leaderboard = []
        for rank, row in enumerate(results, 1):
            # Get user's current slab
            slab = self._get_user_slab(row.successful_referrals or 0)
            
            leaderboard.append(LeaderboardEntry(
                rank=rank,
                user_id=row.referrer_id,
                user_name=row.full_name,
                referral_count=row.referral_count,
                successful_referrals=row.successful_referrals or 0,
                total_earnings=Decimal(str(row.total_earnings or 0)),
                current_slab=slab.slab_name if slab else "Bronze",
                current_level=slab.level if slab else 1
            ))
        
        total_participants = self.db.query(
            func.count(func.distinct(JobReferral.referrer_id))
        ).scalar() or 0
        
        return LeaderboardResponse(
            success=True,
            data=leaderboard,
            total_participants=total_participants
        )
    
    def _get_user_slab(self, successful_referrals: int) -> Optional[JobRewardSlab]:
        """Get the reward slab for given number of referrals"""
        return self.db.query(JobRewardSlab).filter(
            JobRewardSlab.is_active == True,
            JobRewardSlab.min_referrals <= successful_referrals,
            or_(
                JobRewardSlab.max_referrals >= successful_referrals,
                JobRewardSlab.max_referrals == None
            )
        ).order_by(JobRewardSlab.level.desc()).first()
    
    def get_reward_slabs(self) -> List[RewardSlabResponse]:
        """Get all active reward slabs"""
        slabs = self.db.query(JobRewardSlab).filter(
            JobRewardSlab.is_active == True
        ).order_by(JobRewardSlab.level).all()
        
        return [
            RewardSlabResponse(
                id=slab.id,
                slab_name=slab.slab_name,
                min_referrals=slab.min_referrals,
                max_referrals=slab.max_referrals,
                reward_per_referral=slab.reward_per_referral,
                bonus_amount=slab.bonus_amount,
                level=slab.level,
                description=slab.description,
                icon=slab.icon,
                color=slab.color,
                is_active=slab.is_active
            )
            for slab in slabs
        ]
    
    def get_user_reward_progress(self, user_id: uuid.UUID) -> UserRewardProgress:
        """Get user's reward progress and level"""
        # Count successful referrals
        successful = self.db.query(JobReferral).filter(
            JobReferral.referrer_id == user_id,
            JobReferral.status == "joined"
        ).count()
        
        total = self.db.query(JobReferral).filter(
            JobReferral.referrer_id == user_id
        ).count()
        
        # Get current and next slab
        current_slab = self._get_user_slab(successful)
        next_slab = self.db.query(JobRewardSlab).filter(
            JobRewardSlab.is_active == True,
            JobRewardSlab.min_referrals > successful
        ).order_by(JobRewardSlab.level).first()
        
        # Calculate progress
        referrals_to_next = (next_slab.min_referrals - successful) if next_slab else 0
        progress_pct = 0.0
        if current_slab and next_slab:
            range_size = next_slab.min_referrals - current_slab.min_referrals
            progress_in_range = successful - current_slab.min_referrals
            progress_pct = (progress_in_range / range_size * 100) if range_size > 0 else 100
        elif not next_slab:
            progress_pct = 100.0
        
        # Get earnings
        total_earned = self.db.query(func.sum(JobReferral.actual_reward)).filter(
            JobReferral.referrer_id == user_id,
            JobReferral.reward_status == "disbursed"
        ).scalar() or Decimal("0")
        
        pending_earnings = self.db.query(func.sum(JobReferral.expected_reward)).filter(
            JobReferral.referrer_id == user_id,
            JobReferral.reward_status.in_(["pending", "approved"])
        ).scalar() or Decimal("0")
        
        # Get rewards history
        rewards = self.db.query(JobReferralReward).filter(
            JobReferralReward.user_id == user_id
        ).order_by(JobReferralReward.created_at.desc()).limit(10).all()
        
        rewards_history = [
            {
                "id": str(r.id),
                "amount": float(r.amount),
                "status": r.status,
                "type": r.reward_type,
                "date": r.created_at.isoformat()
            }
            for r in rewards
        ]
        
        level_names = ["Starter", "Bronze", "Silver", "Gold", "Platinum", "Diamond"]
        level = current_slab.level if current_slab else 1
        
        return UserRewardProgress(
            total_referrals=total,
            successful_referrals=successful,
            current_slab=RewardSlabResponse(
                id=current_slab.id if current_slab else uuid.uuid4(),
                slab_name=current_slab.slab_name if current_slab else "Bronze",
                min_referrals=current_slab.min_referrals if current_slab else 0,
                max_referrals=current_slab.max_referrals if current_slab else 5,
                reward_per_referral=current_slab.reward_per_referral if current_slab else Decimal("5000"),
                bonus_amount=current_slab.bonus_amount if current_slab else Decimal("0"),
                level=level,
                description=current_slab.description if current_slab else None,
                icon=current_slab.icon if current_slab else "bronze",
                color=current_slab.color if current_slab else "#CD7F32",
                is_active=True
            ),
            next_slab=RewardSlabResponse(
                id=next_slab.id,
                slab_name=next_slab.slab_name,
                min_referrals=next_slab.min_referrals,
                max_referrals=next_slab.max_referrals,
                reward_per_referral=next_slab.reward_per_referral,
                bonus_amount=next_slab.bonus_amount,
                level=next_slab.level,
                description=next_slab.description,
                icon=next_slab.icon,
                color=next_slab.color,
                is_active=next_slab.is_active
            ) if next_slab else None,
            referrals_to_next_slab=referrals_to_next,
            progress_percentage=progress_pct,
            total_earned=total_earned,
            pending_earnings=pending_earnings,
            level=level,
            level_name=level_names[min(level, len(level_names) - 1)],
            rewards_history=rewards_history
        )
    
    def generate_linkedin_share(self, job_id: int, referrer: User) -> LinkedInShareTemplate:
        """Generate LinkedIn share template for a job"""
        job = self.db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise AppException("Job not found", 404)
        
        company = self.db.query(Company).filter(Company.id == job.company_id).first()
        
        # Format experience range
        exp_from = float(job.exp_from or 0)
        exp_to = float(job.exp_to or 0)
        experience_range = f"{int(exp_from)}-{int(exp_to)} years" if exp_to > exp_from else f"{int(exp_from)}+ years"
        
        # Format salary range
        salary_range = None
        if job.ctc_from and job.ctc_to and not job.hide_salary:
            salary_range = f"₹{float(job.ctc_from):.1f}L - ₹{float(job.ctc_to):.1f}L"
        
        # Generate referral link
        referral_link = f"https://referrals.teamlease.com/apply/{job.id}?ref={referrer.referral_code}"
        
        # Generate share text
        company_name = company.name if company else "our company"
        location = job.location or "Multiple Locations"
        
        share_text = f"""🚀 We're Hiring! {job.job_title} at {company_name}

📍 Location: {location}
💼 Experience: {experience_range}
{"💰 Salary: " + salary_range if salary_range else ""}

Looking for talented professionals to join our team! If you or someone you know fits this role, apply now.

✅ {job.description[:200]}... 

Apply here 👉 {referral_link}

#hiring #jobs #{job.job_title.replace(' ', '')} #careers #jobopening"""

        return LinkedInShareTemplate(
            job_id=job.id,
            job_title=job.job_title,
            company_name=company_name,
            location=location,
            experience_range=experience_range,
            salary_range=salary_range,
            referral_link=referral_link,
            share_text=share_text
        )

