import apiClient from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  organization?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  organization?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  organization?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const usersAPI = {
  // Get all users
  getUsers: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined,
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<User> }>('/users', { params: backendParams });
    return response.data.data;
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  // Create user
  createUser: async (data: UserCreateRequest): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User }>('/users', data);
    return response.data.data;
  },

  // Update user
  updateUser: async (id: string, data: UserUpdateRequest): Promise<User> => {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Get counselors
  getCounselors: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined,
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<User> }>('/users/counselors', { params: backendParams });
    return response.data.data;
  },

  // Get referrers
  getReferrers: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    try {
      const backendParams: any = {
        page: params?.page || 1,
        limit: params?.page_size || params?.limit || 20,
      };
      if (params?.is_active !== undefined) {
        backendParams.is_active = params.is_active;
      }
      const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<User> }>('/users/referrers', { params: backendParams });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching referrers:', error);
      // Return empty response on error
      return {
        items: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      };
    }
  },
};

