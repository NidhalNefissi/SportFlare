import { useCallback } from 'react';
import { addHours, format } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/router';
import { useUser } from '@/context/UserContext';

type PaymentType = 'class' | 'program' | 'coach_session' | 'subscription' | 'product';
type PaymentMethod = 'card' | 'pay_at_gym';
type PaymentStatus = 'pending' | 'confirmed' | 'cancelled';

interface PaymentNotificationParams {
  type: PaymentType;
  itemId: string;
  itemName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gymName?: string;
  deadlineHours?: number;
  metadata?: Record<string, any>;
}

export function usePaymentNotifications() {
  const { addNotification } = useNotifications();
  const router = useRouter();
  const { user } = useUser();

  const getItemDetails = (type: PaymentType, itemId: string) => {
    const basePath = type === 'coach_session' ? 'coaching' : `${type}s`;
    return {
      path: `/${basePath}/${itemId}`,
      typeName: type.replace('_', ' '),
    };
  };

  const addPaymentNotification = useCallback(({
    type,
    itemId,
    itemName,
    amount,
    paymentMethod,
    paymentStatus,
    gymName,
    deadlineHours = 24,
    metadata = {},
  }: PaymentNotificationParams) => {
    const deadline = addHours(new Date(), deadlineHours);
    const { path: itemPath, typeName } = getItemDetails(type, itemId);
    
    // Common notification data
    const notificationData = {
      type: 'payment' as const,
      title: '',
      message: '',
      isRead: false,
      userId: user?.id || 'anonymous',
      metadata: {
        type,
        itemId,
        itemName,
        amount,
        paymentMethod,
        paymentStatus,
        gymName,
        deadline: deadline.toISOString(),
        itemPath,
        ...metadata,
      },
    };

    // Set notification content based on payment method and status
    if (paymentMethod === 'pay_at_gym') {
      if (paymentStatus === 'pending') {
        notificationData.title = 'Payment Pending';
        notificationData.message = `Complete your payment of ${amount} TND for ${itemName} at ${gymName || 'the gym'}`;
      } else if (paymentStatus === 'confirmed') {
        notificationData.title = 'Payment Confirmed';
        notificationData.message = `Your payment for ${itemName} has been confirmed`;
      }
    } else {
      // Card payment
      notificationData.title = 'Payment Confirmed';
      notificationData.message = `Your ${typeName} "${itemName}" has been booked successfully`;
      notificationData.metadata.paymentStatus = 'confirmed';
    }

    // Add the notification
    const notification = addNotification(notificationData);

    // Handle notification click based on payment method and status
    const handleNotificationClick = () => {
      if (paymentMethod === 'pay_at_gym' && paymentStatus === 'pending') {
        // Show payment pending modal
        // This would be handled by a global notification handler that checks for payment pending status
        return;
      }
      
      // Navigate to the item details page for confirmed payments
      router.push(itemPath);
    };

    return {
      notification,
      handleNotificationClick,
    };
  }, [addNotification, router]);

  return {
    addPaymentNotification,
  };
}
