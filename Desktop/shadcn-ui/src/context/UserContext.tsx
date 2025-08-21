import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'client@example.com',
    role: 'client',
    avatar: '/assets/avatars/client.jpg',
    bio: 'Fitness enthusiast looking to improve my health and strength.',
    achievements: [
      {
        id: '1',
        title: 'First Workout',
        description: 'Completed your first workout on the platform',
        icon: '🏋️‍♂️',
        earnedAt: new Date('2023-01-01'),
      },
    ],
    subscription: {
      id: '1',
      plan: 'premium',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      autoRenew: true,
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'coach@example.com',
    role: 'coach',
    avatar: '/assets/avatars/coach.jpg',
    bio: 'Professional fitness coach with 10+ years of experience.',
    subscription: {
      id: '2',
      plan: 'pro',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      autoRenew: true,
    },
  },
  {
    id: '3',
    name: 'FitZone Gym',
    email: 'gym@example.com',
    role: 'gym',
    avatar: '/assets/avatars/gym.jpg',
    bio: 'Modern gym facility with state-of-the-art equipment.',
  },
  {
    id: '4',
    name: 'FitGear',
    email: 'brand@example.com',
    role: 'brand',
    avatar: '/assets/avatars/brand.jpg',
    bio: 'Premium fitness equipment and apparel.',
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: '/assets/avatars/admin.jpg',
  },
];

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
    // Mock login function
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    // Mock register function
    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      role,
      avatar: `/assets/avatars/${role}.jpg`,
      bio: '',
      subscription: {
        id: `${mockUsers.length + 1}`,
        plan: 'free',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        autoRenew: true,
      },
    };
    setUser(newUser);
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