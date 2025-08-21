import { useState } from 'react';
import { UnifiedPaymentFlow } from '@/components/payment/UnifiedPaymentFlow';

type PaymentType = 'class' | 'program' | 'coach_session' | 'product' | 'subscription';

interface UsePaymentFlowProps {
  onSuccess?: (paymentMethod: 'card' | 'payAtGym') => void;
  onClose?: () => void;
}

export function usePaymentFlow({ onSuccess, onClose }: UsePaymentFlowProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    itemName: string;
    type: PaymentType;
    gymName?: string;
    metadata?: Record<string, any>;
  } | null>(null);

  const openPayment = (data: {
    amount: number;
    itemName: string;
    type: PaymentType;
    gymName?: string;
    metadata?: Record<string, any>;
  }) => {
    setPaymentData(data);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSuccess = (paymentMethod: 'card' | 'payAtGym') => {
    onSuccess?.(paymentMethod);
    // We don't close immediately to show success state
  };

  const PaymentModal = () => {
    if (!paymentData) return null;
    
    return (
      <UnifiedPaymentFlow
        isOpen={isOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        {...paymentData}
      />
    );
  };

  return {
    openPayment,
    closePayment: handleClose,
    PaymentModal,
  };
}
