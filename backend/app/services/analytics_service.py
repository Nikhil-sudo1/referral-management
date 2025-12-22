"""
Analytics Service
Dashboard and analytics operations
"""
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, Integer, case
from app.models.referral import Referral
from app.models.university import University
from app.models.program import Program
from app.models.reward import Reward
from app.models.user import User
from app.schemas.analytics import (
    DashboardStats,
    TimeSeriesData,
    UniversityPerformance,
    ConversionFunnel,
    AnalyticsResponse,
    MyAnalyticsResponse,
)
from app.core.logging import logger
from app.core.cache import get_cached, set_cached


class AnalyticsService:
    """Analytics service class"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self, current_user: User = None) -> DashboardStats:
        """
        Get main dashboard statistics
        CACHED: Results cached for 30 seconds to reduce load on remote database
        
        Data visibility based on role:
        - super_admin/admin: ALL data
        - manager: Only their university's data
        - referrer: Only their own data (redirects to my-analytics)
        """
        # Determine university filter based on user role
        university_filter = None
        referrer_filter = None
        cache_suffix = "global"
        
        if current_user:
            if current_user.user_type_id == 1:
                # See all data
                cache_suffix = "global"
            elif current_user.user_type_id == 1:
                # See only their university's data
                if current_user.university_id:
                    university_filter = current_user.university_id
                    cache_suffix = f"univ_{university_filter}"
                else:
                    # No university assigned - return zeros
                    return DashboardStats(
                        total_referrals=0,
                        total_admissions=0,
                        total_referrers=0,
                        total_counselors=0,
                        total_rewards=0.0,
                        conversion_rate=0.0,
                        pending_referrals=0,
                        monthly_referrals=0,
                        monthly_admissions=0,
                        monthly_rewards=0.0,
                        active_universities=0,
                    )
            elif current_user.user_type_id == 2:
                # Referrers see only their own referrals
                referrer_filter = current_user.id
                cache_suffix = f"referrer_{referrer_filter}"
        
        # Check cache first - critical for remote database performance
        cache_key = f"dashboard_stats_{cache_suffix}"
        cached_result = get_cached(cache_key)
        if cached_result is not None:
            logger.info(f"Dashboard stats ({cache_suffix}): cache hit")
            return cached_result
        
        logger.info(f"Dashboard stats ({cache_suffix}): cache miss, fetching from database")
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Build base query with optional university filter
        def apply_referral_filter(query):
            if university_filter:
                query = query.filter(Referral.university_id == university_filter)
            if referrer_filter:
                query = query.filter(Referral.referrer_id == referrer_filter)
            return query
        
        def apply_reward_filter(query):
            if university_filter:
                # Filter rewards by referrals from this university
                referral_ids = self.db.query(Referral.id).filter(
                    Referral.university_id == university_filter
                ).subquery()
                query = query.filter(Reward.referral_id.in_(referral_ids))
            if referrer_filter:
                query = query.filter(Reward.user_id == referrer_filter)
            return query
        
        # Total referrals
        referral_query = self.db.query(func.count(Referral.id))
        referral_query = apply_referral_filter(referral_query)
        total_referrals = referral_query.scalar() or 0
        
        # Pending referrals
        pending_query = self.db.query(func.count(Referral.id)).filter(
            Referral.status.in_(["submitted", "assigned", "contacted"])
        )
        pending_query = apply_referral_filter(pending_query)
        pending_referrals = pending_query.scalar() or 0
        
        # Total admissions
        admissions_query = self.db.query(func.count(Referral.id)).filter(
            Referral.status == "admitted"
        )
        admissions_query = apply_referral_filter(admissions_query)
        total_admissions = admissions_query.scalar() or 0
        
        # Conversion rate
        conversion_rate = 0.0
        if total_referrals > 0:
            conversion_rate = round((total_admissions / total_referrals) * 100, 1)
        
        # Reward stats
        rewards_query = self.db.query(func.sum(Reward.amount)).filter(
            Reward.status == "disbursed"
        )
        rewards_query = apply_reward_filter(rewards_query)
        total_rewards_raw = rewards_query.scalar()
        total_rewards = float(total_rewards_raw) if total_rewards_raw else 0.0
        
        # User counts (filtered by university if applicable)
        if university_filter:
            total_referrers = self.db.query(func.count(func.distinct(Referral.referrer_id))).filter(
                Referral.university_id == university_filter
            ).scalar() or 0
            total_counselors = self.db.query(func.count(User.id)).filter(
                User.user_type_id == 1,
                User.university_id == university_filter
            ).scalar() or 0
            active_universities = 1  # They can only see their own university
        elif referrer_filter:
            total_referrers = 1  # Just themselves
            total_counselors = 0
            active_universities = 0
        else:
            total_referrers = self.db.query(func.count(User.id)).filter(User.user_type_id == 2).scalar() or 0
            total_counselors = self.db.query(func.count(User.id)).filter(User.user_type_id == 1).scalar() or 0
            active_universities = self.db.query(func.count(University.id)).filter(
                University.status == "active"
            ).scalar() or 0
        
        # Monthly stats
        monthly_ref_query = self.db.query(func.count(Referral.id)).filter(
            Referral.created_at >= month_start
        )
        monthly_ref_query = apply_referral_filter(monthly_ref_query)
        monthly_referrals = monthly_ref_query.scalar() or 0
        
        monthly_adm_query = self.db.query(func.count(Referral.id)).filter(
            Referral.status == "admitted",
            Referral.created_at >= month_start
        )
        monthly_adm_query = apply_referral_filter(monthly_adm_query)
        monthly_admissions = monthly_adm_query.scalar() or 0
        
        monthly_rewards_query = self.db.query(func.sum(Reward.amount)).filter(
            Reward.status == "disbursed",
            Reward.created_at >= month_start
        )
        monthly_rewards_query = apply_reward_filter(monthly_rewards_query)
        monthly_rewards_raw = monthly_rewards_query.scalar()
        monthly_rewards = float(monthly_rewards_raw) if monthly_rewards_raw else 0.0
        
        result = DashboardStats(
            total_referrals=total_referrals,
            total_admissions=total_admissions,
            total_referrers=total_referrers,
            total_counselors=total_counselors,
            total_rewards=total_rewards,
            conversion_rate=conversion_rate,
            pending_referrals=pending_referrals,
            monthly_referrals=monthly_referrals,
            monthly_admissions=monthly_admissions,
            monthly_rewards=monthly_rewards,
            active_universities=active_universities,
        )
        
        # Cache the result for 30 seconds - critical for performance
        set_cached(cache_key, result, ttl=30)
        logger.info(f"Dashboard stats ({cache_suffix}): cached for 30 seconds")
        return result
    
    def get_referral_analytics(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        group_by: str = "month",
    ) -> AnalyticsResponse:
        """
        Get detailed referral analytics
        """
        # Default date range: last 6 months
        if not date_to:
            date_to = datetime.utcnow()
        if not date_from:
            date_from = date_to - timedelta(days=180)
        
        # Get dashboard stats first
        dashboard_stats = self.get_dashboard_stats()
        
        # Time series data
        time_series = self._get_time_series(date_from, date_to, group_by)
        
        # By university
        university_performance = self._get_university_performance()
        
        # By status - OPTIMIZED: single query with GROUP BY
        by_status = {status: 0 for status in ["submitted", "assigned", "contacted", "admitted", "rejected"]}
        status_results = self.db.query(
            Referral.status,
            func.count(Referral.id)
        ).group_by(Referral.status).all()
        for status, count in status_results:
            if status in by_status:
                by_status[status] = count
        
        # Conversion funnel - use pre-computed by_status
        total = sum(by_status.values())
        submitted_count = total
        assigned_count = by_status["assigned"] + by_status["contacted"] + by_status["admitted"] + by_status["rejected"]
        contacted_count = by_status["contacted"] + by_status["admitted"] + by_status["rejected"]
        admitted_count = by_status["admitted"]
        
        conversion_funnel = [
            {
                "stage": "submitted",
                "count": submitted_count,
                "percentage": 100.0
            },
            {
                "stage": "assigned",
                "count": assigned_count,
                "percentage": round((assigned_count / submitted_count * 100) if submitted_count > 0 else 0, 1)
            },
            {
                "stage": "contacted",
                "count": contacted_count,
                "percentage": round((contacted_count / submitted_count * 100) if submitted_count > 0 else 0, 1)
            },
            {
                "stage": "admitted",
                "count": admitted_count,
                "percentage": round((admitted_count / submitted_count * 100) if submitted_count > 0 else 0, 1)
            }
        ]
        
        # Average conversion time
        avg_time = self._calculate_avg_conversion_time()
        
        # Peak month
        peak_month = self._get_peak_month()
        
        # Top program
        top_program = self._get_top_program()
        
        return AnalyticsResponse(
            dashboard_stats=dashboard_stats,
            time_series=time_series,
            university_performance=university_performance,
            conversion_funnel=conversion_funnel,
            by_status=by_status,
            avg_conversion_time_days=avg_time,
            peak_month=peak_month,
            top_program=top_program,
        )
    
    def get_my_analytics(self, user_id: UUID) -> MyAnalyticsResponse:
        """
        Get analytics for a specific referrer
        """
        # Basic stats
        total_referrals = self.db.query(Referral).filter(
            Referral.referrer_id == user_id
        ).count()
        
        successful_admissions = self.db.query(Referral).filter(
            Referral.referrer_id == user_id,
            Referral.status == "admitted"
        ).count()
        
        pending_referrals = self.db.query(Referral).filter(
            Referral.referrer_id == user_id,
            Referral.status.in_(["submitted", "assigned", "contacted"])
        ).count()
        
        rejected_referrals = self.db.query(Referral).filter(
            Referral.referrer_id == user_id,
            Referral.status == "rejected"
        ).count()
        
        conversion_rate = 0.0
        if total_referrals > 0:
            conversion_rate = round((successful_admissions / total_referrals) * 100, 1)
        
        # Earnings
        total_earnings = self.db.query(func.sum(Reward.amount)).filter(
            Reward.user_id == user_id,
            Reward.status == "disbursed"
        ).scalar() or Decimal("0")
        
        pending_earnings = self.db.query(func.sum(Reward.amount)).filter(
            Reward.user_id == user_id,
            Reward.status.in_(["pending", "approved"])
        ).scalar() or Decimal("0")
        
        withdrawn_earnings = total_earnings
        
        # Get user for rank/tier
        user = self.db.query(User).filter(User.id == user_id).first()
        # Determine tier based on successful admissions
        if successful_admissions >= 21:
            tier = "Platinum"
        elif successful_admissions >= 11:
            tier = "Gold"
        elif successful_admissions >= 6:
            tier = "Silver"
        else:
            tier = "Bronze"
        
        # Calculate rank
        from app.services.leaderboard_service import LeaderboardService
        leaderboard_service = LeaderboardService(self.db)
        my_rank = leaderboard_service.get_my_rank(user_id)
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        for i in range(5, -1, -1):
            month_start = datetime.utcnow().replace(day=1) - timedelta(days=i*30)
            month_end = month_start + timedelta(days=30)
            
            month_referrals = self.db.query(Referral).filter(
                Referral.referrer_id == user_id,
                Referral.submission_date >= month_start,
                Referral.submission_date < month_end
            ).count()
            
            month_admissions = self.db.query(Referral).filter(
                Referral.referrer_id == user_id,
                Referral.admission_date >= month_start,
                Referral.admission_date < month_end,
                Referral.status == "admitted"
            ).count()
            
            monthly_trend.append({
                "month": month_start.strftime("%Y-%m"),
                "referrals": month_referrals,
                "admissions": month_admissions,
            })
        
        # By university
        by_university = []
        universities = self.db.query(University).all()
        for uni in universities:
            count = self.db.query(Referral).filter(
                Referral.referrer_id == user_id,
                Referral.university_id == uni.id
            ).count()
            if count > 0:
                by_university.append({
                    "university": uni.name,
                    "count": count,
                })
        
        # Next tier info
        tier_progression = {
            "Bronze": {"name": "Silver", "required_admissions": 6},
            "Silver": {"name": "Gold", "required_admissions": 11},
            "Gold": {"name": "Platinum", "required_admissions": 21},
            "Platinum": None,
        }
        
        next_tier_info = None
        if tier_progression.get(tier):
            next_tier_data = tier_progression[tier]
            if next_tier_data:
                progress = min(100, int((successful_admissions / next_tier_data["required_admissions"]) * 100))
                next_tier_info = {
                    "name": next_tier_data["name"],
                    "required_admissions": next_tier_data["required_admissions"],
                    "current_admissions": successful_admissions,
                    "progress": progress,
                }
        
        return MyAnalyticsResponse(
            total_referrals=total_referrals,
            successful_admissions=successful_admissions,
            pending_referrals=pending_referrals,
            rejected_referrals=rejected_referrals,
            conversion_rate=conversion_rate,
            total_earnings=total_earnings,
            pending_earnings=pending_earnings,
            withdrawn_earnings=withdrawn_earnings,
            rank=my_rank.rank,
            tier=tier,
            monthly_trend=monthly_trend,
            by_university=by_university,
            next_tier=next_tier_info,
        )
    
    def _get_time_series(
        self,
        date_from: datetime,
        date_to: datetime,
        group_by: str,
    ) -> List[TimeSeriesData]:
        """Get time series data for referrals"""
        data = []
        current = date_from
        
        while current < date_to:
            if group_by == "month":
                next_date = current + timedelta(days=30)
                label = current.strftime("%Y-%m")
            elif group_by == "week":
                next_date = current + timedelta(days=7)
                label = current.strftime("%Y-W%W")
            else:  # day
                next_date = current + timedelta(days=1)
                label = current.strftime("%Y-%m-%d")
            
            referrals = self.db.query(Referral).filter(
                Referral.submission_date >= current,
                Referral.submission_date < next_date
            ).count()
            
            admissions = self.db.query(Referral).filter(
                Referral.admission_date >= current,
                Referral.admission_date < next_date,
                Referral.status == "admitted"
            ).count()
            
            data.append(TimeSeriesData(
                date=label,
                referrals=referrals,
                admissions=admissions,
            ))
            
            current = next_date
        
        return data
    
    def _get_university_performance(self) -> List[UniversityPerformance]:
        """Get performance data by university - OPTIMIZED: single query with GROUP BY"""
        # OPTIMIZATION: Single query using JOIN and GROUP BY instead of N*2 queries
        results = self.db.query(
            University.id,
            University.name,
            func.count(Referral.id).label('total_referrals'),
            func.sum(func.cast(Referral.status == "admitted", Integer)).label('admissions'),
        ).outerjoin(
            Referral, Referral.university_id == University.id
        ).group_by(
            University.id, University.name
        ).all()
        
        data = []
        for uni_id, uni_name, total, admissions in results:
            total = total or 0
            admissions = admissions or 0
            rate = round((admissions / total) * 100, 1) if total > 0 else 0.0
            
            data.append(UniversityPerformance(
                university_id=str(uni_id),
                university_name=uni_name,
                total_referrals=total,
                total_admissions=admissions,
                conversion_rate=rate,
            ))
        
        return sorted(data, key=lambda x: -x.total_referrals)
    
    def _calculate_avg_conversion_time(self) -> int:
        """Calculate average days from submission to admission"""
        admitted = self.db.query(Referral).filter(
            Referral.status == "admitted",
            Referral.admission_date.isnot(None)
        ).all()
        
        if not admitted:
            return 0
        
        total_days = 0
        for ref in admitted:
            if ref.admission_date and ref.submission_date:
                delta = ref.admission_date - ref.submission_date
                total_days += delta.days
        
        return total_days // len(admitted) if admitted else 0
    
    def _get_peak_month(self) -> str:
        """Get the month with most referrals"""
        result = self.db.query(
            extract('month', Referral.submission_date).label('month'),
            func.count(Referral.id).label('count')
        ).group_by(
            extract('month', Referral.submission_date)
        ).order_by(
            func.count(Referral.id).desc()
        ).first()
        
        if result:
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            return months[int(result.month) - 1]
        return "N/A"
    
    def _get_top_program(self) -> str:
        """Get the program with most referrals"""
        result = self.db.query(
            Program.name,
            func.count(Referral.id).label('count')
        ).join(Referral).group_by(
            Program.id, Program.name
        ).order_by(
            func.count(Referral.id).desc()
        ).first()
        
        return result.name if result else "N/A"

