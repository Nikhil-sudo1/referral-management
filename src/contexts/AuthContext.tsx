import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  password: string;
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
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock user data - In production, this would come from your API
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'Super Admin',
        organization: 'TeamLease EdTech',
      };

      // Mock token
      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', mockToken);
      
      setUser(mockUser);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${mockUser.name}!`,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock user data
      const mockUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: 'User',
        organization: data.organization,
      };

      // Mock token
      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', mockToken);
      
      setUser(mockUser);
      
      toast({
        title: 'Account Created',
        description: `Welcome to TeamLease EdTech, ${mockUser.name}!`,
      });

      return true;
    } catch (error) {
      toast({
        title: 'Signup Failed',
        description: 'Could not create account. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    
    setUser(null);
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

