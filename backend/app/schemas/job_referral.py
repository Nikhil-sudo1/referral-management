"""
Job Referral Schemas
For employee job referral operations
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from decimal import Decimal


# Job Schemas
class JobBase(BaseModel):
    id: int
    job_title: str
    job_code: Optional[str] = None
    company_id: int
    industry_id: int
    exp_from: Optional[Decimal] = None
    exp_to: Optional[Decimal] = None
    ctc_from: Optional[Decimal] = None
    ctc_to: Optional[Decimal] = None
    hide_salary: bool = False
    description: Optional[str] = None
    vacancies: int = 1
    location: Optional[str] = None
    valid_till: Optional[datetime] = None
    status: bool = True
    
    model_config = ConfigDict(from_attributes=True)


class JobWithCompany(JobBase):
    company_name: Optional[str] = None
    industry_name: Optional[str] = None


class JobListResponse(BaseModel):
    success: bool = True
    data: List[JobWithCompany]
    total: int
    page: int
    per_page: int


# Job Referral Schemas
class JobReferralSubmit(BaseModel):
    """Schema for submitting a job referral"""
    referee_name: str
    referee_email: EmailStr
    referee_phone: str
    referee_linkedin: Optional[str] = None
    referee_resume_url: Optional[str] = None
    referee_experience: Optional[Decimal] = None
    referee_current_company: Optional[str] = None
    referee_current_designation: Optional[str] = None
    job_id: int
    notes: Optional[str] = None


class JobReferralResponse(BaseModel):
    """Schema for job referral response"""
    id: UUID
    referral_code: str
    referrer_id: Optional[UUID] = None
    referrer_name: str
    referrer_email: str
    referee_name: str
    referee_email: str
    referee_phone: str
    referee_linkedin: Optional[str] = None
    referee_experience: Optional[Decimal] = None
    referee_current_company: Optional[str] = None
    referee_current_designation: Optional[str] = None
    job_id: int
    job_title: Optional[str] = None
    company_id: int
    company_name: Optional[str] = None
    industry_id: int
    industry_name: Optional[str] = None
    status: str
    status_notes: Optional[str] = None
    submission_date: datetime
    expected_reward: Optional[Decimal] = None
    actual_reward: Optional[Decimal] = None
    reward_status: str = "pending"
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class JobReferralListResponse(BaseModel):
    success: bool = True
    data: List[JobReferralResponse]
    total: int
    page: int
    per_page: int


class JobReferralStatsResponse(BaseModel):
    """Statistics for job referrals"""
    total_referrals: int
    submitted: int
    screening: int
    interviewed: int
    offered: int
    joined: int
    rejected: int
    total_earnings: Decimal
    pending_earnings: Decimal
    current_month_referrals: int
    current_week_referrals: int


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    user_id: UUID
    user_name: str
    referral_count: int
    successful_referrals: int
    total_earnings: Decimal
    current_slab: str
    current_level: int
    
    model_config = ConfigDict(from_attributes=True)


class LeaderboardResponse(BaseModel):
    success: bool = True
    data: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    total_participants: int


# Reward Slab Schemas
class RewardSlabResponse(BaseModel):
    id: UUID
    slab_name: str
    min_referrals: int
    max_referrals: Optional[int] = None
    reward_per_referral: Decimal
    bonus_amount: Decimal
    level: int
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


class UserRewardProgress(BaseModel):
    """User's reward progress"""
    total_referrals: int
    successful_referrals: int
    current_slab: RewardSlabResponse
    next_slab: Optional[RewardSlabResponse] = None
    referrals_to_next_slab: int
    progress_percentage: float
    total_earned: Decimal
    pending_earnings: Decimal
    level: int
    level_name: str
    rewards_history: List[dict]


# LinkedIn Share Template
class LinkedInShareTemplate(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    location: Optional[str] = None
    experience_range: str
    salary_range: Optional[str] = None
    referral_link: str
    share_text: str

