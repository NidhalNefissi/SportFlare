import React from 'react';
import { Button } from '@/components/ui/button';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

interface ClassBookingButtonProps {
  classInfo: {
    id: string;
    name: string;
    price: number;
    gymName: string;
    dateTime: Date;
    duration: number;
    spotsLeft: number;
  };
}

export function ClassBookingButton({ classInfo }: ClassBookingButtonProps) {
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      // Handle successful booking
      console.log(`Class booked with ${paymentMethod}`);
    },
  });

  const handleBookClass = () => {
    openPayment({
      amount: classInfo.price,
      itemName: classInfo.name,
      type: 'class',
      gymName: classInfo.gymName,
      metadata: {
        classId: classInfo.id,
        dateTime: classInfo.dateTime.toISOString(),
        duration: classInfo.duration,
        spotsLeft: classInfo.spotsLeft
      }
    });
  };

  return (
    <>
      <Button 
        onClick={handleBookClass}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={classInfo.spotsLeft <= 0}
      >
        {classInfo.spotsLeft > 0 ? 'Book Now' : 'Fully Booked'}
      </Button>
      <PaymentModal />
    </>
  );
}
