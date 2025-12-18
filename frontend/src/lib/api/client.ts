import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      // Handle different error statuses
      switch (status) {
        case 401:
          // Unauthorized - only redirect to login if user was previously logged in
          // Don't redirect for public pages (/, /login, /register, /forgot-password)
          const publicPaths = ['/', '/login', '/register', '/forgot-password', '/register/referee'];
          const currentPath = window.location.pathname;
          const isPublicPage = publicPaths.includes(currentPath);
          const hadToken = localStorage.getItem('authToken');
          
          console.error('401 Unauthorized error:', error.config?.url, data);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Only redirect if user was logged in and is not on a public page
          if (hadToken && !isPublicPage) {
            window.location.href = '/login';
            toast({
              title: 'Session Expired',
              description: 'Please login again',
              variant: 'destructive',
            });
          }
          break;
        case 403:
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to perform this action',
            variant: 'destructive',
          });
          break;
        case 404:
          toast({
            title: 'Not Found',
            description: data?.detail || 'The requested resource was not found',
            variant: 'destructive',
          });
          break;
        case 422:
          // Validation errors
          const validationErrors = data?.detail || [];
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors
              .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
              .join(', ');
            toast({
              title: 'Validation Error',
              description: errorMessages,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Validation Error',
              description: data?.detail || 'Invalid input data',
              variant: 'destructive',
            });
          }
          break;
        case 500:
          toast({
            title: 'Server Error',
            description: 'An unexpected error occurred. Please try again later.',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: data?.detail || error.message || 'An error occurred',
            variant: 'destructive',
          });
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      toast({
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your connection.',
        variant: 'destructive',
      });
    } else {
      console.error('Request error:', error.message, error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

// Named export for explicit imports
export { apiClient };

// Default export for backward compatibility
export default apiClient;

