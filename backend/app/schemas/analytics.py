"""
Analytics Schemas
"""
from typing import Optional, List, Dict
from decimal import Decimal
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_referrals: int
    total_admissions: int
    total_referrers: int = 0
    total_counselors: int = 0
    total_rewards: float
    conversion_rate: float
    pending_referrals: int
    monthly_referrals: int
    monthly_admissions: int
    monthly_rewards: float
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v)
        }


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
    dashboard_stats: DashboardStats
    time_series: List[TimeSeriesData]
    university_performance: List[UniversityPerformance]
    conversion_funnel: List[Dict]
    by_status: Optional[Dict[str, int]] = None
    avg_conversion_time_days: Optional[int] = None
    peak_month: Optional[str] = None
    top_program: Optional[str] = None


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

