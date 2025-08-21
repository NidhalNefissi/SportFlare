import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { apiService } from '@/services';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('sportflare_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update storage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('sportflare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sportflare_user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const user = await apiService.login(email, password);
      if (user) {
        setUser(user);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login. Please try again.');
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const newUser = await apiService.register({
        name,
        email,
        password,
        role,
      });
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};