import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';
import apiService from '@/services/api/apiService';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();

  // Load notifications when user changes
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setNotifications([]);
        return;
      }
      
      try {
        const userNotifications = await apiService.getNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    
    loadNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newNotification = await apiService.createNotification({
        ...notification,
        userId: user.id
      });
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const markAsRead = (id: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      
      // Update in backend (no need to await)
      apiService.markNotificationAsRead(id).catch(error => {
        console.error('Failed to mark notification as read:', error);
        // Revert local state if API call fails
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
        );
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    try {
      // Update local state immediately for better UX
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Update in backend (no need to await)
      apiService.markAllNotificationsAsRead(user.id).catch(error => {
        console.error('Failed to mark all notifications as read:', error);
        // Could revert local state if API call fails, but that might be confusing
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = (id: string) => {
    try {
      // Update local state immediately
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Delete from backend
      apiService.deleteNotification(id).catch(error => {
        console.error('Failed to delete notification:', error);
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = () => {
    if (!user) return;
    
    try {
      // Clear local state immediately
      setNotifications([]);
      
      // Clear from backend
      apiService.clearAllNotifications(user.id).catch(error => {
        console.error('Failed to clear all notifications:', error);
      });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};