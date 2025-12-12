import apiClient from './client';

export interface Reward {
  id: string;
  referral_id: string;
  user_id: string;
  amount: number;
  reward_type: string;
  status: string;
  tier_multiplier?: number;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  created_at: string;
  updated_at: string;
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
    page_size?: number;
    status?: string;
    user_id?: string;
    reward_type?: string;
  }): Promise<PaginatedResponse<Reward>> => {
    const response = await apiClient.get<PaginatedResponse<Reward>>('/rewards', { params });
    return response.data;
  },

  // Get reward by ID
  getReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.get<Reward>(`/rewards/${id}`);
    return response.data;
  },

  // Create reward
  createReward: async (data: RewardCreateRequest): Promise<Reward> => {
    const response = await apiClient.post<Reward>('/rewards', data);
    return response.data;
  },

  // Get my rewards (referrer)
  getMyRewards: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaginatedResponse<Reward>> => {
    const response = await apiClient.get<PaginatedResponse<Reward>>('/rewards/my-rewards', { params });
    return response.data;
  },

  // Get reward tiers
  getRewardTiers: async (): Promise<RewardTier[]> => {
    const response = await apiClient.get<RewardTier[]>('/rewards/tiers');
    return response.data;
  },

  // Approve reward
  approveReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<Reward>(`/rewards/${id}/approve`);
    return response.data;
  },

  // Disburse reward
  disburseReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<Reward>(`/rewards/${id}/disburse`);
    return response.data;
  },

  // Cancel reward
  cancelReward: async (id: string): Promise<Reward> => {
    const response = await apiClient.patch<Reward>(`/rewards/${id}/cancel`);
    return response.data;
  },
};

