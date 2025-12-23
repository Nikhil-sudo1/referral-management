import apiClient from './client';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;  // Backend returns user_name
  name?: string;  // Keep for backward compatibility
  email?: string;  // Optional
  user_email?: string;  // Backend may return user_email
  referrer_code?: string;  // Referral code of the referrer
  total_referrals: number;
  total_admissions: number;
  total_rewards: number;
  conversion_rate: number;
  tier: string;
  avatar_url?: string;
}

export interface MyRankResponse {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  total_referrals: number;
  total_admissions: number;
  total_rewards: number;
  conversion_rate: number;
  tier: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  period: string;
  total_users: number;
  my_rank?: MyRankResponse;
}

export const leaderboardAPI = {
  // Get referrer leaderboard
  getReferrerLeaderboard: async (params?: {
    period?: 'all_time' | 'monthly' | 'weekly';
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<{ success: boolean; data: LeaderboardResponse }>('/leaderboard/referrers', { params });
    return response.data.data;
  },

  // Get leaderboard - alias for backward compatibility with StudentAdmin pages
  getLeaderboard: async (params?: {
    period?: string;
    limit?: number;
    university_id?: string;
  }): Promise<any> => {
    try {
      const backendParams: any = { limit: params?.limit || 50 };
      if (params?.period === 'week') backendParams.period = 'weekly';
      else if (params?.period === 'month') backendParams.period = 'monthly';
      else backendParams.period = 'all_time';

      const response = await apiClient.get<{ success: boolean; data: any }>('/leaderboard/referrers', { params: backendParams });
      // Transform response to match expected format
      return response.data.data?.entries || response.data.data || [];
    } catch (error) {
      console.error('Leaderboard API error:', error);
      // Return empty array on error to allow UI to show "no data" instead of crashing
      return [];
    }
  },

  // Get counselor leaderboard
  getCounselorLeaderboard: async (params?: {
    period?: 'all_time' | 'monthly' | 'weekly';
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<{ success: boolean; data: LeaderboardResponse }>('/leaderboard/counselors', { params });
    return response.data.data;
  },

  // Get my rank
  getMyRank: async (type: 'referrer' | 'counselor' = 'referrer'): Promise<MyRankResponse> => {
    const response = await apiClient.get<{ success: boolean; data: MyRankResponse }>('/leaderboard/my-rank', {
      params: { type },
    });
    return response.data.data;
  },
};

