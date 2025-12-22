import apiClient from './client';

export interface Referral {
  id: string;
  referrer_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  university_id: string;
  program_id: string;
  status: string;
  counselor_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // CRM Integration fields
  crm_lead_id?: number;
  crm_synced_at?: string;
  crm_sync_error?: string;
  referrer?: {
    id: string;
    name: string;
    email: string;
  };
  university?: {
    id: string;
    name: string;
  };
  program?: {
    id: string;
    name: string;
  };
  counselor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CRMActivityResponse {
  synced: boolean;
  crm_lead_id: number | null;
  synced_at: string | null;
  activity: any;
  sync_error?: string;
  activity_error?: string;
}

export interface ReferralCreateRequest {
  referrer_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  university_id: string;
  program_id: string;
  notes?: string;
}

export interface ReferralSubmitRequest {
  referee_name: string;
  referee_email: string;
  referee_phone: string;
  crm_university_id: number;
  crm_course_id: number;
  university_id?: string;
  program_id?: string;
  notes?: string;
}

export interface ReferralUpdateRequest {
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  university_id?: string;
  program_id?: string;
  status?: string;
  counselor_id?: string;
  notes?: string;
}

export interface ReferralStats {
  total: number;
  pending: number;
  contacted: number;
  admitted: number;
  rejected: number;
  conversion_rate: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const referralsAPI = {
  // Get all referrals (with filters)
  getReferrals: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    status?: string;
    university_id?: string;
    referrer_id?: string;
    counselor_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Referral>> => {
    // Backend uses 'limit' not 'page_size'
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined, // Remove page_size
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Referral> }>('/referrals', { params: backendParams });
    return response.data.data; // Backend wraps in { success, data }
  },

  // Get referral by ID
  getReferral: async (id: string): Promise<Referral> => {
    const response = await apiClient.get<{ success: boolean; data: Referral }>(`/referrals/${id}`);
    return response.data.data;
  },

  // Create referral (admin)
  createReferral: async (data: ReferralCreateRequest): Promise<Referral> => {
    const response = await apiClient.post<{ success: boolean; data: Referral }>('/referrals', data);
    return response.data.data;
  },

  // Submit referral (referrer)
  submitReferral: async (data: ReferralSubmitRequest): Promise<Referral> => {
    const response = await apiClient.post<{ success: boolean; data: Referral }>('/referrals/submit', data);
    return response.data.data;
  },

  // Get my referrals (referrer)
  getMyReferrals: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Referral>> => {
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined,
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Referral> }>('/referrals/my-referrals', { params: backendParams });
    return response.data.data;
  },

  // Get assigned referrals (counselor)
  getAssignedReferrals: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Referral>> => {
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined,
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Referral> }>('/referrals/assigned', { params: backendParams });
    return response.data.data;
  },

  // Get referral statistics
  getReferralStats: async (): Promise<ReferralStats> => {
    const response = await apiClient.get<{ success: boolean; data: ReferralStats }>('/referrals/stats');
    return response.data.data;
  },

  // Update referral
  updateReferral: async (id: string, data: ReferralUpdateRequest): Promise<Referral> => {
    const response = await apiClient.put<{ success: boolean; data: Referral }>(`/referrals/${id}`, data);
    return response.data.data;
  },

  // Update referral status
  updateReferralStatus: async (id: string, status: string): Promise<Referral> => {
    const response = await apiClient.patch<{ success: boolean; data: Referral }>(`/referrals/${id}/status`, { status });
    return response.data.data;
  },

  // Assign counselor to referral
  assignCounselor: async (id: string, counselorId: string): Promise<Referral> => {
    const response = await apiClient.post<{ success: boolean; data: Referral }>(`/referrals/${id}/assign`, { counselor_id: counselorId });
    return response.data.data;
  },

  // Get CRM activity for a referral
  getCRMActivity: async (id: string): Promise<CRMActivityResponse> => {
    const response = await apiClient.get<{ success: boolean; data: CRMActivityResponse }>(`/referrals/${id}/crm-activity`);
    return response.data.data;
  },

  // Manually sync referral to CRM
  syncToCRM: async (id: string): Promise<{ crm_lead_id: number; synced_at: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { crm_lead_id: number; synced_at: string } }>(`/referrals/${id}/sync-crm`);
    return response.data.data;
  },
};

