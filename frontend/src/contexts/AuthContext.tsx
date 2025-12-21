import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

interface User {
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
            email: userData.email,
            full_name: userData.full_name,
            mobile_number: userData.mobile_number,
            user_type_id: userData.user_type_id,
            role_id: userData.role_id,
            user_type_name: userData.user_type_name,
            role_name: userData.role_name,
            is_active: userData.is_active,
            email_verification: userData.email_verification,
            univ_id: userData.univ_id,
            org_id: userData.org_id,
            referral_code: userData.referral_code,
            bank_acc: userData.bank_acc,
            bank_ifsc: userData.bank_ifsc,
            bank_name: userData.bank_name,
            account_holder_name: userData.account_holder_name,
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
      
      // Store user data with new structure
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        user_type_id: response.user.user_type_id,
        role_id: response.user.role_id,
        user_type_name: response.user.user_type_name,
        role_name: response.user.role_name,
        is_active: true,
        email_verification: response.user.email_verification ?? false,
        referral_code: response.user.referral_code,
        mobile_number: response.user.mobile_number,
        bank_acc: response.user.bank_acc,
        bank_ifsc: response.user.bank_ifsc,
        bank_name: response.user.bank_name,
        account_holder_name: response.user.account_holder_name,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.full_name}!`,
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
        full_name: data.full_name,
        email: data.email,
        mobile_number: data.mobile_number,
        password: data.password,
        confirm_password: data.confirm_password,
        user_type_id: data.user_type_id,
        role_id: data.role_id,
        univ_id: data.univ_id,
        org_id: data.org_id,
        bank_acc: data.bank_acc,
        bank_ifsc: data.bank_ifsc,
        bank_name: data.bank_name,
        account_holder_name: data.account_holder_name,
      });
      
      // Store tokens
      localStorage.setItem('authToken', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
      // Store user data
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        user_type_id: response.user.user_type_id,
        role_id: response.user.role_id,
        user_type_name: response.user.user_type_name,
        role_name: response.user.role_name,
        is_active: true,
        email_verification: false,
        referral_code: response.user.referral_code,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast({
        title: 'Account Created',
        description: `Welcome to TeamLease EdTech, ${user.full_name}!`,
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
        email: userData.email,
        full_name: userData.full_name,
        mobile_number: userData.mobile_number,
        user_type_id: userData.user_type_id,
        role_id: userData.role_id,
        user_type_name: userData.user_type_name,
        role_name: userData.role_name,
        is_active: userData.is_active,
        email_verification: userData.email_verification,
        univ_id: userData.univ_id,
        org_id: userData.org_id,
        referral_code: userData.referral_code,
        bank_acc: userData.bank_acc,
        bank_ifsc: userData.bank_ifsc,
        bank_name: userData.bank_name,
        account_holder_name: userData.account_holder_name,
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
