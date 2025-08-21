import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Clock, CheckCircle, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { format, addHours } from 'date-fns';

type PaymentType = 'class' | 'program' | 'coach_session' | 'product' | 'subscription';

interface PaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: 'card' | 'payAtGym') => void;
  amount: number;
  itemName: string;
  type: PaymentType;
  gymName?: string;
  metadata?: Record<string, any>;
}

export function UnifiedPaymentFlow({
  isOpen,
  onClose,
  onSuccess,
  amount,
  itemName,
  type,
  gymName = 'selected gym',
  metadata = {}
}: PaymentFlowProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'payAtGym'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { user } = useUser();
  const { addNotification } = useNotifications();

  const handlePayment = async () => {
    if (!paymentMethod) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (paymentMethod === 'payAtGym') {
        const deadline = addHours(new Date(), 24);
        
        // Add notification for pending payment
        addNotification({
          type: 'payment',
          title: 'Payment Pending',
          message: `Payment pending for ${itemName} at ${gymName}`,
          isRead: false,
          metadata: {
            type,
            amount,
            itemName,
            gymName,
            deadline: deadline.toISOString(),
            ...metadata
          },
          userId: user?.id || 'anonymous'
        });
      }
      
      setPaymentComplete(true);
      onSuccess(paymentMethod);
      
      // Auto-close after 2 seconds for better UX
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle error state
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {paymentMethod === 'payAtGym' ? 'Payment Pending' : 'Payment Successful'}
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentMethod === 'payAtGym' 
              ? `Please complete your payment of ${amount} TND at ${gymName}`
              : 'Your payment was processed successfully.'}
          </p>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center mb-2">
            Complete Payment
          </DialogTitle>
          <div className="text-center text-gray-600 mb-6">
            {itemName} - {amount} TND
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <button
              className={`w-full p-4 text-left flex items-center justify-between ${
                paymentMethod === 'card' ? 'bg-indigo-50 border-indigo-500 border-l-4' : 'border-transparent'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-indigo-600" />
                <span>Pay with Card</span>
              </div>
              {paymentMethod === 'card' && (
                <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full" />
                </div>
              )}
            </button>
            
            <div className="border-t">
              <button
                className={`w-full p-4 text-left flex items-center justify-between ${
                  paymentMethod === 'payAtGym' ? 'bg-indigo-50 border-indigo-500 border-l-4' : 'border-transparent'
                }`}
                onClick={() => setPaymentMethod('payAtGym')}
              >
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-indigo-600" />
                  <span>Pay at Gym</span>
                </div>
                {paymentMethod === 'payAtGym' && (
                  <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {paymentMethod === 'payAtGym' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You'll have 24 hours to complete your payment at {gymName}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
