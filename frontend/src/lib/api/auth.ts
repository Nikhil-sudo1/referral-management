import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
  user_type_id: number;
  role_id: number;
  univ_id?: string;
  org_id?: number;
  bank_acc?: string;
  bank_ifsc?: string;
  bank_name?: string;
  account_holder_name?: string;
}

export interface UserInToken {
  id: string;
  email: string;
  full_name: string;
  user_type_id: number;
  role_id: number;
  user_type_name?: string;
  role_name?: string;
  referral_code?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInToken;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  mobile_number?: string;
  user_type_id: number;
  role_id: number;
  user_type_name?: string;
  role_name?: string;
  is_active: boolean;
  email_verification: boolean;
  univ_id?: string;
  org_id?: number;
  referral_code?: string;
  bank_acc?: string;
  bank_ifsc?: string;
  bank_name?: string;
  account_holder_name?: string;
  created_at: string;
}

export interface Role {
  id: number;
  user_type_id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserType {
  id: number;
  name: string;
  code: string;
  description?: string;
  roles: Role[];
}

// Auth API endpoints
export const authAPI = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/login', data);
    return response.data.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/register', data);
    return response.data.data;
  },

  // Get current user
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<{ success: boolean; data: UserResponse }>('/auth/me');
    return response.data.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string, confirmPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/resend-verification', { email });
    return response.data;
  },

  // Check verification status
  checkVerification: async (email: string): Promise<{ is_verified: boolean }> => {
    const response = await apiClient.get<{ success: boolean; data: { is_verified: boolean } }>(`/auth/check-verification?email=${encodeURIComponent(email)}`);
    return response.data.data;
  },

  // Get user types with roles
  getUserTypes: async (): Promise<UserType[]> => {
    const response = await apiClient.get<{ success: boolean; data: UserType[] }>('/auth/user-types');
    return response.data.data;
  },

  // Get roles (optionally filtered by user_type_id)
  getRoles: async (userTypeId?: number): Promise<Role[]> => {
    const url = userTypeId 
      ? `/auth/roles?user_type_id=${userTypeId}`
      : '/auth/roles';
    const response = await apiClient.get<{ success: boolean; data: Role[] }>(url);
    return response.data.data;
  },
};
