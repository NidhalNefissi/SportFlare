import { useCallback } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { format } from 'date-fns';
import type { Notification } from '@/types';

type PaymentType = 'class' | 'program' | 'coach_session' | 'product' | 'subscription';

interface PaymentNotificationOptions {
  amount: number;
  itemName: string;
  type: PaymentType;
  paymentMethod: 'card' | 'payAtGym';
  paymentStatus: 'pending' | 'confirmed' | 'cancelled';
  gymName?: string;
  deadline?: Date;
  metadata?: Record<string, any>;
}

export function usePaymentNotifications() {
  const { addNotification } = useNotifications();

  const addPaymentNotification = useCallback(({
    amount,
    itemName,
    type,
    paymentMethod,
    paymentStatus,
    gymName,
    deadline,
    metadata = {}
  }: PaymentNotificationOptions) => {
    const now = new Date();
    const notificationDeadline = deadline || new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24h
    
    // Create base notification with proper typing
    const createBaseNotification = (): Omit<Notification, 'id' | 'createdAt'> => ({
      userId: 'current-user', // This will be set by the context
      type: 'order', // Using 'order' as the base type for payment notifications
      title: 'Payment Update',
      message: `Status update for your ${itemName} payment.`,
      isRead: false,
      metadata: {
        ...metadata,
        type,
        amount,
        itemName,
        paymentMethod,
        paymentStatus,
        gymName,
        deadline: notificationDeadline.toISOString(),
        notificationId: `payment-${Date.now()}`
      },
      actionType: 'modal',
      actionData: {
        modalType: 'payment',
        metadata: {
          type,
          amount,
          itemName,
          paymentMethod,
          paymentStatus,
          gymName,
          deadline: notificationDeadline.toISOString()
        }
      }
    });
    
    // Create the base notification
    const baseNotification = createBaseNotification();

    // Customize notification based on payment status and method
    if (paymentStatus === 'pending' && paymentMethod === 'payAtGym') {
      const pendingMessage = type === 'coach_session' 
        ? `Please complete your payment of ${amount} TND for a private session with ${itemName} at ${gymName || 'the gym counter'} by ${format(notificationDeadline, 'PPpp')}`
        : `Please complete your payment of ${amount} TND for ${itemName} at ${gymName || 'the gym counter'} by ${format(notificationDeadline, 'PPpp')}`;
      
      addNotification({
        ...baseNotification,
        title: type === 'coach_session' ? 'Session Booking Pending' : 'Payment Pending',
        message: pendingMessage,
        priority: 'high',
        isPersistent: true
      });
    } else if (paymentStatus === 'confirmed') {
      const confirmedMessage = type === 'coach_session'
        ? `You have successfully booked a private session with ${itemName} for ${amount} TND.`
        : `Your payment of ${amount} TND for ${itemName} has been confirmed.`;
      
      addNotification({
        ...baseNotification,
        title: type === 'coach_session' ? 'Session Booked' : 'Payment Confirmed',
        message: confirmedMessage,
        priority: 'medium',
        isPersistent: false
      });
    } else if (paymentStatus === 'cancelled') {
      addNotification({
        ...baseNotification,
        title: 'Payment Cancelled',
        message: `Your payment for ${itemName} has been cancelled.`,
        priority: 'medium',
        isPersistent: false
      });
    } else {
      // Fallback for other cases
      addNotification({
        ...baseNotification,
        title: 'Payment Update',
        message: `Status update for your ${itemName} payment.`,
        priority: 'low',
        isPersistent: false
      });
    }
  }, [addNotification]);

  return {
    addPaymentNotification
  };
}

export function getPaymentNotificationMessage(
  type: PaymentType,
  paymentMethod: 'card' | 'payAtGym',
  paymentStatus: 'pending' | 'confirmed' | 'cancelled',
  itemName: string,
  amount: number,
  gymName?: string,
  deadline?: Date
): { title: string; message: string } {
  const formattedDeadline = deadline ? format(deadline, 'PPpp') : '';
  
  if (paymentStatus === 'pending' && paymentMethod === 'payAtGym') {
    return {
      title: 'Payment Pending',
      message: `Please complete your payment of ${amount} TND for ${itemName} at ${gymName || 'the gym counter'} by ${formattedDeadline}`
    };
  }
  
  if (paymentStatus === 'confirmed') {
    return {
      title: 'Payment Confirmed',
      message: `Your payment of ${amount} TND for ${itemName} has been confirmed.`
    };
  }
  
  if (paymentStatus === 'cancelled') {
    return {
      title: 'Payment Cancelled',
      message: `Your payment for ${itemName} has been cancelled.`
    };
  }
  
  // Default fallback
  return {
    title: 'Payment Update',
    message: `Status update for your ${itemName} payment.`
  };
}
