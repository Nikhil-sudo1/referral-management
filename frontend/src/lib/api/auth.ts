import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
  role?: string; // Optional: "admin" or "referrer", defaults to "admin" on backend
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  organization?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    organization?: string;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
}

// Auth API endpoints
export const authAPI = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/login', data);
    return response.data.data; // Backend wraps response in { success, data, message }
  },

  // Register
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/register', data);
    return response.data.data; // Backend wraps response in { success, data, message }
  },

  // Get current user
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<{ success: boolean; data: UserResponse }>('/auth/me');
    return response.data.data; // Backend wraps response in { success, data, message }
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
};

