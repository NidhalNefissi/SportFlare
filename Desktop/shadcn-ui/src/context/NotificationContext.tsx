import { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Notification } from '@/types';
import { useUser } from './UserContext';

interface Reminder {
  hoursBefore: number;
  message: string;
  timeoutId?: NodeJS.Timeout;
  isSent?: boolean;
  sentAt?: Date;
}

export interface ExtendedNotification extends Omit<Notification, 'id' | 'createdAt' | 'metadata'> {
  expiresAt?: Date;
  reminders?: Reminder[];
  priority?: 'low' | 'medium' | 'high';
  isPersistent?: boolean;
  metadata?: {
    type?: string;
    itemId?: string;
    itemName?: string;
    amount?: number;
    paymentMethod?: 'card' | 'pay_at_gym';
    paymentStatus?: 'pending' | 'confirmed' | 'cancelled';
    gymName?: string;
    deadline?: string;
    itemPath?: string;
    [key: string]: any;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addClassBookingNotification: (classTitle: string, classId: string, gymName?: string) => void;
  addProgramEnrollmentNotification: (programTitle: string, programId: string) => void;
  addProductPurchaseNotification: (productTitle: string, orderId: string, productId: string) => void;
  addCoachBookingNotification: (coachName: string, coachId: string, sessionDate?: string) => void;
  addPaymentNotification: (amount: number, itemName: string, type: string, gymName?: string, deadline?: string) => void;
  addBookingModificationNotification: (bookingId: string, bookingTitle: string, changes: any, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUser();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addClassBookingNotification = useCallback((classTitle: string, classId: string, gymName?: string) => {
    addNotification({
      userId: user?.id || '1',
      title: 'Class Booking Confirmed',
      message: `Your booking for ${classTitle}${gymName ? ` at ${gymName}` : ''} has been confirmed.`,
      type: 'booking',
      isRead: false,
      actionType: 'navigate',
      actionData: {
        route: `/classes/${classId}`,
        metadata: { classId, classTitle, gymName }
      }
    });
  }, [addNotification, user?.id]);

  const addProgramEnrollmentNotification = useCallback((programTitle: string, programId: string) => {
    addNotification({
      userId: user?.id || '1',
      title: 'Program Enrollment Successful',
      message: `You have successfully enrolled in ${programTitle}. Your fitness journey begins now!`,
      type: 'program',
      isRead: false,
      actionType: 'navigate',
      actionData: {
        route: `/programs/${programId}`,
        metadata: { programId, programTitle }
      }
    });
  }, [addNotification, user?.id]);

  const addProductPurchaseNotification = useCallback((productTitle: string, orderId: string, productId: string) => {
    addNotification({
      userId: user?.id || '1',
      title: 'Order Confirmed',
      message: `Your order for ${productTitle} has been confirmed and will be processed shortly.`,
      type: 'order',
      isRead: false,
      actionType: 'navigate',
      actionData: {
        route: `/orders/${orderId}`,
        metadata: { orderId, productId, productTitle }
      }
    });
  }, [addNotification, user?.id]);

  const addCoachBookingNotification = useCallback((coachName: string, coachId: string, sessionDate?: string) => {
    addNotification({
      userId: user?.id || '1',
      title: 'Coach Session Booked',
      message: `Your private session with ${coachName}${sessionDate ? ` is scheduled for ${sessionDate}` : ' has been booked'}.`,
      type: 'booking',
      isRead: false,
      actionType: 'navigate',
      actionData: {
        route: `/coaches/${coachId}`,
        metadata: { coachId, coachName, sessionDate }
      }
    });
  }, [addNotification, user?.id]);

  const addPaymentNotification = useCallback((amount: number, itemName: string, type: string, gymName?: string, deadline?: string) => {
    const notificationId = Date.now().toString();
    const deadlineHours = type === 'class' ? 24 : 48;
    const now = new Date();
    const expiresAt = deadline ? new Date(deadline) : new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);

    const gymInfo = gymName ? ` at ${gymName}` : '';
    const message = `You have ${deadlineHours} hours to complete your payment of ${amount} TND${gymInfo}.`;

    // Create the base notification with the ID and proper action data
    const baseNotification: Omit<Notification, 'id' | 'createdAt' | 'actionData'> & {
      id: string;
      actionData: {
        route: string;
        metadata: Record<string, any>;
      };
    } = {
      id: notificationId,
      userId: user?.id || '1',
      title: `Payment Pending: ${itemName}`,
      message,
      type: 'payment',
      isRead: false,
      priority: 'high',
      isPersistent: true,
      actionType: 'navigate',
      actionData: {
        route: `/${type}s/${itemName.toLowerCase().replace(/\s+/g, '-')}`,
        metadata: { type, amount, itemName, deadline: expiresAt.toISOString() }
      }
    };

    const notification: Notification = {
      ...baseNotification,
      id: notificationId,
      createdAt: new Date(),
      expiresAt,
      reminders: [
        {
          hoursBefore: 6,
          message: `Final reminder: Only 6 hours left to complete your payment for ${itemName}${gymInfo}.`,
          isSent: false
        },
        {
          hoursBefore: 12,
          message: `Reminder: Don't forget to complete your payment for ${itemName}${gymInfo}.`,
          isSent: false
        }
      ]
    };

    // Add the notification to state with the ID and proper action data
    const notificationToAdd: Notification = {
      ...notification,
      actionType: 'navigate',
      actionData: {
        route: `/${type}s/${itemName.toLowerCase().replace(/\s+/g, '-')}`,
        metadata: {
          paymentPending: true,
          amount,
          itemName,
          type,
          gymName,
          deadline: expiresAt.toISOString(),
          notificationId: notificationId
        }
      }
    };

    setNotifications(prev => [notificationToAdd, ...prev]);

    const timeoutIds: NodeJS.Timeout[] = [];

    // Schedule reminders
    notification.reminders?.forEach((reminder, index) => {
      const reminderTime = new Date(expiresAt.getTime() - (reminder.hoursBefore * 60 * 60 * 1000));

      if (reminderTime > now) {
        const timeout = reminderTime.getTime() - now.getTime();

        const timeoutId = setTimeout(() => {
          // Mark reminder as sent
          const updatedReminders = [...(notification.reminders || [])];
          updatedReminders[index] = { ...reminder, isSent: true, sentAt: new Date() };

          setNotifications(prev =>
            prev.map(n =>
              n.id === notificationId
                ? { ...n, reminders: updatedReminders }
                : n
            )
          );

          // Show system notification if permission is granted
          if (window.Notification && Notification.permission === 'granted') {
            new Notification(`Reminder: ${notification.title}`, {
              body: reminder.message,
              icon: '/logo.png',
              requireInteraction: true
            });
          }

          // Add a new notification for the reminder
          const reminderNotification: Omit<Notification, 'id' | 'createdAt'> = {
            userId: user?.id || '1',
            title: `Reminder: ${notification.title}`,
            message: reminder.message,
            type: 'reminder',
            isRead: false,
            priority: 'high',
            isPersistent: false,
            actionType: 'navigate',
            actionData: notification.actionData
          };

          setNotifications(prev => [
            {
              ...reminderNotification,
              id: `${notificationId}-reminder-${Date.now()}`,
              createdAt: new Date()
            },
            ...prev
          ]);

        }, timeout);

        timeoutIds.push(timeoutId);
      }
    });

    // Cleanup function to clear all timeouts
    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [user?.id]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addClassBookingNotification,
    addProgramEnrollmentNotification,
    addProductPurchaseNotification,
    addCoachBookingNotification,
    addPaymentNotification,
  }), [
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addClassBookingNotification,
    addProgramEnrollmentNotification,
    addProductPurchaseNotification,
    addCoachBookingNotification,
    addPaymentNotification,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
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