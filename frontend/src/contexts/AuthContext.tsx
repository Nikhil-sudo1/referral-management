import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  password: string;
  confirmPassword?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Verify token and get current user
          console.log('Verifying token on mount...');
          const userData = await authAPI.getMe();
          console.log('User data received:', userData);
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            organization: userData.organization,
            phone: userData.phone,
          };
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('User authenticated successfully');
        } catch (error) {
          // Token invalid or expired
          console.error('Error verifying auth:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      
      // Store tokens
      localStorage.setItem('authToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
      // Store user data
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        organization: response.user.organization,
        phone: response.user.phone,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });

      return true;
    } catch (error: any) {
      // Error toast is handled by API interceptor
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirmPassword || data.password, // Use confirmPassword if provided, otherwise use password
        organization: data.organization,
      });
      
      // Store tokens
      localStorage.setItem('authToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
      // Store user data
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        organization: response.user.organization,
        phone: response.user.phone,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: 'Account Created',
        description: `Welcome to TeamLease EdTech, ${user.name}!`,
      });

      return true;
    } catch (error: any) {
      // Error toast is handled by API interceptor
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getMe();
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        organization: userData.organization,
        phone: userData.phone,
      };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

