"""
Referral Schemas
"""
from typing import Optional, List, Dict
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from datetime import datetime


class ReferrerInfo(BaseModel):
    """Referrer information"""
    id: Optional[UUID] = None
    name: str
    email: str
    phone: str


class RefereeInfo(BaseModel):
    """Referee (student) information"""
    name: str
    email: str
    phone: str


class UniversityInfo(BaseModel):
    """University brief info"""
    id: UUID
    name: str
    code: str


class ProgramInfo(BaseModel):
    """Program brief info"""
    id: UUID
    name: str
    code: str


class CounselorInfo(BaseModel):
    """Counselor brief info"""
    id: UUID
    name: str


class ReferralCreate(BaseModel):
    """Create referral schema (admin)"""
    referrer_name: str = Field(..., min_length=2, max_length=255)
    referrer_email: EmailStr
    referrer_phone: str = Field(..., min_length=10, max_length=20)
    referee_name: str = Field(..., min_length=2, max_length=255)
    referee_email: EmailStr
    referee_phone: str = Field(..., min_length=10, max_length=20)
    university_id: UUID
    program_id: UUID
    source: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None


class ReferralSubmit(BaseModel):
    """Submit referral schema (referrer)"""
    referee_name: str = Field(..., min_length=2, max_length=255)
    referee_email: EmailStr
    referee_phone: str = Field(..., min_length=10, max_length=20)
    university_id: UUID
    program_id: UUID


class ReferralUpdate(BaseModel):
    """Update referral schema"""
    referee_name: Optional[str] = Field(None, min_length=2, max_length=255)
    referee_email: Optional[EmailStr] = None
    referee_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    status_notes: Optional[str] = None


class ReferralStatusUpdate(BaseModel):
    """Update referral status"""
    status: str = Field(..., pattern="^(submitted|assigned|contacted|admitted|rejected)$")
    notes: Optional[str] = None


class ReferralAssign(BaseModel):
    """Assign counselor to referral"""
    counselor_id: UUID


class ReferralResponse(BaseModel):
    """Referral response schema"""
    id: UUID
    referral_code: str
    referrer: ReferrerInfo
    referee: RefereeInfo
    university: UniversityInfo
    program: ProgramInfo
    counselor: Optional[CounselorInfo] = None
    status: str
    status_notes: Optional[str] = None
    submission_date: datetime
    contacted_date: Optional[datetime] = None
    admission_date: Optional[datetime] = None
    rejection_date: Optional[datetime] = None
    expected_reward: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    # CRM Integration fields
    crm_lead_id: Optional[int] = None
    crm_synced_at: Optional[datetime] = None
    crm_sync_error: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class ReferralListItem(BaseModel):
    """Referral list item"""
    id: UUID
    referral_code: str
    referee_name: str
    referee_email: str
    referrer_name: str
    university_code: str
    program_code: str
    counselor_name: Optional[str] = None
    status: str
    submission_date: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ReferralListResponse(BaseModel):
    """Referral list response"""
    items: List[ReferralListItem]
    total: int
    page: int
    limit: int
    pages: int
    stats: Optional[Dict[str, int]] = None


class ReferralStatsResponse(BaseModel):
    """Referral statistics"""
    total_referrals: int
    pending_assignment: int
    total_admissions: int
    conversion_rate: float
    total_rewards: Decimal
    by_status: Dict[str, int]
    by_university: List[Dict]
    by_month: List[Dict]

