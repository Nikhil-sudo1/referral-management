// Disabled for competition demo
export const AuthProvider = ({ children }: { children: any }) => children;
export const useAuth = () => ({ user: null, isAuthenticated: false, isLoading: false, login: async () => true, signup: async () => true, logout: () => {} });

