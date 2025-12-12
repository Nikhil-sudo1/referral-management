"""
Analytics Schemas
"""
from typing import Optional, List, Dict
from decimal import Decimal
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_referrals: int
    pending_assignment: int
    total_admissions: int
    conversion_rate: float
    total_rewards: Decimal
    active_universities: int


class TimeSeriesData(BaseModel):
    """Time series data point"""
    date: str
    referrals: int
    admissions: int


class UniversityPerformance(BaseModel):
    """University performance data"""
    university_id: str
    university_name: str
    total_referrals: int
    total_admissions: int
    conversion_rate: float


class ConversionFunnel(BaseModel):
    """Conversion funnel data"""
    submitted: int
    assigned: int
    contacted: int
    admitted: int


class AnalyticsResponse(BaseModel):
    """Analytics response"""
    time_series: List[TimeSeriesData]
    by_university: List[UniversityPerformance]
    by_status: Dict[str, int]
    conversion_funnel: ConversionFunnel
    avg_conversion_time_days: int
    peak_month: str
    top_program: str


class MyAnalyticsResponse(BaseModel):
    """Referrer's analytics response"""
    total_referrals: int
    successful_admissions: int
    pending_referrals: int
    rejected_referrals: int
    conversion_rate: float
    total_earnings: Decimal
    pending_earnings: Decimal
    withdrawn_earnings: Decimal
    rank: int
    tier: str
    monthly_trend: List[Dict]
    by_university: List[Dict]
    next_tier: Optional[Dict] = None

