import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from '@/hooks/use-toast';

// ------------------------------------------------------------------
// API Base URL
// - Do NOT include /api or /api/v1 in env vars
// - This file owns `/api/v1`
// ------------------------------------------------------------------
const RAW_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://devreferralapi.tledtech.com';

// Remove trailing slash if present
const API_BASE_URL = `${RAW_BASE_URL.replace(/\/$/, '')}/api/v1`;

// ------------------------------------------------------------------
// Axios instance
// ------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ------------------------------------------------------------------
// Request interceptor – attach JWT token
// ------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ------------------------------------------------------------------
// Response interceptor – global error handling
// ------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - only redirect to login if user was previously logged in
          // Don't redirect for public pages (/, /login, /register, /forgot-password)
          const publicPaths = ['/', '/login', '/register', '/forgot-password', '/register/referee'];
          const currentPath = window.location.pathname;
          const isPublicPage = publicPaths.includes(currentPath);
          const hadToken = localStorage.getItem('authToken');
          
          console.error('401 Unauthorized:', error.config?.url, data);
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
          if (Array.isArray(data?.detail)) {
            const message = data.detail
              .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
              .join(', ');
            toast({
              title: 'Validation Error',
              description: message,
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
            description: 'Something went wrong. Please try again later.',
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
      console.error('Network error:', error.request);
      toast({
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your connection.',
        variant: 'destructive',
      });
    } else {
      console.error('Axios error:', error.message);
      toast({
        title: 'Error',
        description: error.message || 'Unexpected error',
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
