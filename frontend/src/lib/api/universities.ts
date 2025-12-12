import apiClient from './client';

export interface University {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  website?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  status: string;
  created_at: string;
  updated_at: string;
  stats?: {
    total_referrals: number;
    total_admissions: number;
    conversion_rate: number;
  };
}

export interface UniversityCreateRequest {
  name: string;
  code: string;
  logo_url?: string;
  website?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export interface UniversityUpdateRequest {
  name?: string;
  code?: string;
  logo_url?: string;
  website?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const universitiesAPI = {
  // Get all universities
  getUniversities: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<University>> => {
    // Backend uses 'limit' not 'page_size'
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined,
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<University> }>('/universities', { params: backendParams });
    return response.data.data;
  },

  // Get university by ID
  getUniversity: async (id: string): Promise<University> => {
    const response = await apiClient.get<{ success: boolean; data: University }>(`/universities/${id}`);
    return response.data.data;
  },

  // Create university
  createUniversity: async (data: UniversityCreateRequest): Promise<University> => {
    const response = await apiClient.post<{ success: boolean; data: University }>('/universities', data);
    return response.data.data;
  },

  // Update university
  updateUniversity: async (id: string, data: UniversityUpdateRequest): Promise<University> => {
    const response = await apiClient.put<{ success: boolean; data: University }>(`/universities/${id}`, data);
    return response.data.data;
  },

  // Delete university
  deleteUniversity: async (id: string): Promise<void> => {
    await apiClient.delete(`/universities/${id}`);
  },

  // Toggle university status
  toggleStatus: async (id: string): Promise<University> => {
    const response = await apiClient.patch<{ success: boolean; data: University }>(`/universities/${id}/status`);
    return response.data.data;
  },

  // Get university programs
  getUniversityPrograms: async (id: string): Promise<any[]> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/universities/${id}/programs`);
    return response.data.data;
  },

  // Create program for university
  createUniversityProgram: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/universities/${id}/programs`, data);
    return response.data.data;
  },
};

