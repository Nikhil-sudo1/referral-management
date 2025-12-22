import apiClient from './client';

export interface Program {
  id: string;
  university_id: string;
  name: string;
  code: string;
  description?: string;
  duration?: string;
  duration_months?: number;
  fee_structure: number;
  commission_rate: number;
  reward_amount: number;
  reward_tier: string;
  eligibility_criteria?: string;
  status: string;
  crm_course_id?: string;
  created_at: string;
  updated_at: string;
  university?: {
    id: string;
    name: string;
  };
}

export interface ProgramCreateRequest {
  university_id: string;
  name: string;
  code: string;
  description?: string;
  duration?: string;
  fee_structure: number;
  commission_rate: number;
  reward_amount: number;
  reward_tier?: string;
  eligibility_criteria?: string;
  status?: string;
}

export interface ProgramUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  duration?: string;
  fee_structure?: number;
  commission_rate?: number;
  reward_amount?: number;
  reward_tier?: string;
  eligibility_criteria?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const programsAPI = {
  // Get all programs
  getPrograms: async (params?: {
    page?: number;
    limit?: number;
    university_id?: string;
    status?: string;
    reward_tier?: string;
  }): Promise<PaginatedResponse<Program>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Program> }>('/programs', { params });
    return response.data.data;
  },

  // Get program by ID
  getProgram: async (id: string): Promise<Program> => {
    const response = await apiClient.get<{ success: boolean; data: Program }>(`/programs/${id}`);
    return response.data.data;
  },

  // Create program
  createProgram: async (data: ProgramCreateRequest): Promise<Program> => {
    const response = await apiClient.post<{ success: boolean; data: Program }>('/programs', data);
    return response.data.data;
  },

  // Update program
  updateProgram: async (id: string, data: ProgramUpdateRequest): Promise<Program> => {
    const response = await apiClient.put<{ success: boolean; data: Program }>(`/programs/${id}`, data);
    return response.data.data;
  },

  // Delete program
  deleteProgram: async (id: string): Promise<void> => {
    await apiClient.delete(`/programs/${id}`);
  },
};

