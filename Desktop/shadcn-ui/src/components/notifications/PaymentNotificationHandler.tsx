import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '@/context/NotificationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

type PaymentNotification = {
  id: string;
  metadata: {
    type: string;
    itemId: string;
    itemName: string;
    amount: number;
    paymentMethod: 'card' | 'pay_at_gym';
    paymentStatus: 'pending' | 'confirmed' | 'cancelled';
    gymName?: string;
    deadline?: string;
    itemPath: string;
  };
};

export function PaymentNotificationHandler() {
  const { notifications, markAsRead } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<PaymentNotification | null>(null);
  const router = useRouter();

  // Find the first unread payment notification that requires UI attention
  useEffect(() => {
    const paymentNotification = notifications.find(
      (n): n is PaymentNotification =>
        n.type === 'payment' &&
        !n.isRead &&
        n.metadata?.paymentMethod === 'pay_at_gym' &&
        n.metadata?.paymentStatus === 'pending'
    );

    if (paymentNotification) {
      setActiveNotification(paymentNotification);
    }
  }, [notifications]);

  const handleClose = () => {
    if (activeNotification) {
      markAsRead(activeNotification.id);
      setActiveNotification(null);
    }
  };

  const handleViewDetails = () => {
    if (activeNotification) {
      router.push(activeNotification.metadata.itemPath);
      handleClose();
    }
  };

  if (!activeNotification) return null;

  const { itemName, amount, gymName, deadline, paymentStatus } = activeNotification.metadata;
  const deadlineDate = deadline ? new Date(deadline) : null;
  const timeLeft = deadlineDate ? formatDistanceToNow(deadlineDate, { addSuffix: true }) : '';

  return (
    <Dialog open={!!activeNotification} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center mt-4">
            Payment Pending
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 text-center">
          <p className="text-gray-700 mb-4">
            Your payment of <span className="font-semibold">{amount} TND</span> for {itemName}
            {gymName && ` at ${gymName}`} is pending.
          </p>

          {deadlineDate && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Complete your payment {timeLeft}.
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Deadline: {format(deadlineDate, 'PPPpp')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            <Button
              onClick={handleViewDetails}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              View {activeNotification.metadata.type.replace('_', ' ')} details
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
