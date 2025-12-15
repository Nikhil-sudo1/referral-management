import apiClient from './client';

export interface DashboardStats {
  total_referrals: number;
  total_admissions: number;
  total_referrers: number;
  total_counselors: number;
  total_rewards: number;
  conversion_rate: number;
  pending_referrals: number;
  monthly_referrals: number;
  monthly_admissions: number;
  monthly_rewards: number;
}

export interface TimeSeriesData {
  date: string;
  referrals: number;
  admissions: number;
  rewards: number;
}

export interface UniversityPerformance {
  university_id: string;
  university_name: string;
  total_referrals: number;
  total_admissions: number;
  conversion_rate: number;
  total_rewards: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
}

export interface AnalyticsResponse {
  dashboard_stats: DashboardStats;
  time_series?: TimeSeriesData[];
  university_performance?: UniversityPerformance[];
  conversion_funnel?: ConversionFunnel[];
}

export interface MyAnalyticsResponse {
  total_referrals: number;
  total_admissions: number;
  total_rewards: number;
  conversion_rate: number;
  monthly_referrals: number;
  monthly_admissions: number;
  monthly_rewards: number;
  time_series?: TimeSeriesData[];
}

export const analyticsAPI = {
  // Get basic dashboard stats (fast, for dashboard page)
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/analytics/dashboard');
    return response.data.data;
  },

  // Get full dashboard analytics (slower, includes time series, etc.)
  getDashboardAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AnalyticsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsResponse }>('/analytics/referrals', { params });
    console.log('🔍 Raw API Response:', response.data);
    console.log('🔍 Extracted data:', response.data.data);
    console.log('🔍 Dashboard stats:', response.data.data.dashboard_stats);
    console.log('🔍 total_referrals value:', response.data.data.dashboard_stats.total_referrals, 'type:', typeof response.data.data.dashboard_stats.total_referrals);
    console.log('🔍 total_admissions value:', response.data.data.dashboard_stats.total_admissions, 'type:', typeof response.data.data.dashboard_stats.total_admissions);
    return response.data.data;
  },

  // Get referral analytics
  getReferralAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    university_id?: string;
  }): Promise<AnalyticsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsResponse }>('/analytics/referrals', { params });
    return response.data.data;
  },

  // Get my analytics (referrer)
  getMyAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<MyAnalyticsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: MyAnalyticsResponse }>('/analytics/my-analytics', { params });
    return response.data.data;
  },
};

