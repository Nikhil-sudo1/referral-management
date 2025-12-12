import apiClient from './client';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  email: string;
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
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard/referrers', { params });
    return response.data;
  },

  // Get counselor leaderboard
  getCounselorLeaderboard: async (params?: {
    period?: 'all_time' | 'monthly' | 'weekly';
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard/counselors', { params });
    return response.data;
  },

  // Get my rank
  getMyRank: async (type: 'referrer' | 'counselor' = 'referrer'): Promise<MyRankResponse> => {
    const response = await apiClient.get<MyRankResponse>('/leaderboard/my-rank', {
      params: { type },
    });
    return response.data;
  },
};

