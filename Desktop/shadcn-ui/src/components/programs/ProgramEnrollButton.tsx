import React from 'react';
import { Button } from '@/components/ui/button';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

interface ProgramEnrollButtonProps {
  program: {
    id: string;
    title: string;
    price: number;
    instructor: string;
    duration: string;
    spotsLeft: number;
    gymName: string;
  };
}

export function ProgramEnrollButton({ program }: ProgramEnrollButtonProps) {
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      // Handle successful program enrollment
      console.log(`Enrolled in program with ${paymentMethod}`);
    },
  });

  const handleEnroll = () => {
    openPayment({
      amount: program.price,
      itemName: program.title,
      type: 'program',
      gymName: program.gymName,
      metadata: {
        programId: program.id,
        instructor: program.instructor,
        duration: program.duration,
        spotsLeft: program.spotsLeft
      }
    });
  };

  return (
    <>
      <Button 
        onClick={handleEnroll}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={program.spotsLeft <= 0}
      >
        {program.spotsLeft > 0 ? 'Enroll Now' : 'Program Full'}
      </Button>
      <PaymentModal />
    </>
  );
}
