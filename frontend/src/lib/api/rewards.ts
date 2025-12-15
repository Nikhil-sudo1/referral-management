import apiClient from './client';

export interface Reward {
  id: string;
  referral_id?: string;
  referral_code?: string;
  user_id?: string;
  user_name?: string;
  user_type?: string;
  amount: number;
  reward_type: string;
  status: string;
  tier_multiplier?: number;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  created_at: string;
  updated_at?: string;
  referral?: {
    id: string;
    student_name: string;
    student_email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RewardTier {
  id: string;
  name: string;
  min_referrals: number;
  max_referrals?: number;
  multiplier: number;
  benefits: string[];
}

export interface RewardCreateRequest {
  referral_id: string;
  user_id: string;
  amount: number;
  reward_type: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const rewardsAPI = {
  // Get all rewards
  getRewards: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    reward_type?: string;
  }): Promise<PaginatedResponse<Reward>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Reward> }>('/rewards', { params });
    return response.data.data;
  },

  // Get reward by ID
  getReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.get<{ success: boolean; data: Reward }>(`/rewards/${id}`);
    return response.data.data;
  },

  // Create reward
  createReward: async (data: RewardCreateRequest): Promise<Reward> => {
    const response = await apiClient.post<{ success: boolean; data: Reward }>('/rewards', data);
    return response.data.data;
  },

  // Get my rewards (referrer)
  getMyRewards: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Reward>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Reward> }>('/rewards/my-rewards', { params });
    return response.data.data;
  },

  // Get reward tiers
  getRewardTiers: async (): Promise<RewardTier[]> => {
    const response = await apiClient.get<{ success: boolean; data: RewardTier[] }>('/rewards/tiers');
    return response.data.data;
  },

  // Approve reward
  approveReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<{ success: boolean; data: Reward }>(`/rewards/${id}/approve`);
    return response.data.data;
  },

  // Disburse reward
  disburseReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<{ success: boolean; data: Reward }>(`/rewards/${id}/disburse`);
    return response.data.data;
  },

  // Cancel reward
  cancelReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<{ success: boolean; data: Reward }>(`/rewards/${id}/cancel`);
    return response.data.data;
  },
};

