import React, { useEffect, useState, useCallback } from 'react';
import { format, differenceInHours, formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, ExternalLink, BellRing } from 'lucide-react';
import { useUniversalGymDialog } from '@/hooks/useUniversalGymDialog';
import { mockGyms } from '@/pages/Gyms';

interface PaymentPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id?: string;
    amount: number;
    itemName: string;
    gymName: string;
    deadline: string;
    type?: string;
    metadata?: {
      type?: string;
      amount?: number;
      itemName?: string;
      gymName?: string;
      deadline?: string;
      notificationId?: string;
    };
  };
}

export function PaymentPendingModal({ isOpen, onClose, notification }: PaymentPendingModalProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const { handleViewGym, GymDialogComponents } = useUniversalGymDialog();

  // Extract data from notification or its metadata
  const paymentData = notification.metadata || notification;
  const {
    amount,
    itemName,
    gymName,
    type = 'item',
    deadline: deadlineStr = notification.deadline
  } = paymentData;

  const deadline = new Date(deadlineStr);
  const deadlineFormatted = format(deadline, 'PPPpp');
  const hoursLeft = differenceInHours(deadline, new Date());

  // Calculate time left
  useEffect(() => {
    if (!isOpen) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const diffMs = deadline.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((diffMs % (1000 * 60)) / 1000));

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isOpen, deadline]);

  const [selectedGym, setSelectedGym] = useState<any>(null);

  // Find the gym by name from mockGyms
  useEffect(() => {
    const findGymByName = () => {
      const gym = mockGyms.find(gym => gym.name === gymName) || null;
      if (gym) {
        setSelectedGym(gym);
      } else {
        // Create a minimal gym object if not found
        setSelectedGym({
          id: 'unknown',
          name: gymName,
          address: 'Gym location',
          image: '/placeholder-gym.jpg'
        });
      }
    };

    findGymByName();
  }, [gymName]);

  const handleGymClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedGym) {
      handleViewGym(selectedGym);
    }
  }, [handleViewGym, selectedGym]);

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  if (!selectedGym) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md z-[1002]" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Payment Pending</span>
            </DialogTitle>
            <DialogDescription>
              Your payment proposal has been received. Please complete your payment at the gym counter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Payment Pending</h4>
                  <p className="text-sm text-yellow-700">
                    You have <span className="font-bold">{timeLeft}</span> to complete your payment of {amount} TND for {itemName} at
                    <button
                      onClick={handleGymClick}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center ml-1"
                    >
                      {selectedGym.name}
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Deadline: {format(deadline, "PPPpp")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 flex items-center">
                <BellRing className="h-4 w-4 mr-2" />
                Reminder Settings
              </h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2"></span>
                  <span>You'll receive reminders every 6 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2"></span>
                  <span>Final reminder 6 hours before deadline</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <Button
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render gym dialog components in a stable container */}
      <div style={{ position: 'fixed', zIndex: 1003, pointerEvents: 'none' }}>
        <GymDialogComponents />
      </div>
    </>
  );
}
