import apiClient from './client';

export interface Program {
  id: string;
  university_id: string;
  name: string;
  code: string;
  description?: string;
  duration?: string;
  fee?: number;
  reward_amount?: number;
  status: string;
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
  fee?: number;
  reward_amount?: number;
}

export interface ProgramUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  duration?: string;
  fee?: number;
  reward_amount?: number;
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
    page_size?: number;
    university_id?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Program>> => {
    const response = await apiClient.get<PaginatedResponse<Program>>('/programs', { params });
    return response.data;
  },

  // Get program by ID
  getProgram: async (id: string): Promise<Program> => {
    const response = await apiClient.get<Program>(`/programs/${id}`);
    return response.data;
  },

  // Update program
  updateProgram: async (id: string, data: ProgramUpdateRequest): Promise<Program> => {
    const response = await apiClient.put<Program>(`/programs/${id}`, data);
    return response.data;
  },

  // Delete program
  deleteProgram: async (id: string): Promise<void> => {
    await apiClient.delete(`/programs/${id}`);
  },
};

