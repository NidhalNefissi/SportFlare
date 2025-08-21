import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

interface SubscriptionPlanProps {
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  popular?: boolean;
  gymName?: string;
}

export function SubscriptionPlan({
  name,
  price,
  period,
  features,
  popular = false,
  gymName = 'any gym'
}: SubscriptionPlanProps) {
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      console.log(`Subscribed to ${name} plan with ${paymentMethod}`);
    },
  });

  const handleSubscribe = () => {
    openPayment({
      amount: price,
      itemName: `${name} Subscription (${period}ly)`,
      type: 'subscription',
      gymName,
      metadata: {
        planName: name,
        price,
        period,
        features
      }
    });
  };

  return (
    <div className={`relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${popular ? 'ring-2 ring-indigo-600' : ''}`}>
      {popular && (
        <p className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </p>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold tracking-tight text-gray-900">
            {price} TND
          </span>
          <span className="ml-1 text-sm font-semibold text-gray-500">
            /{period === 'month' ? 'month' : 'year'}
          </span>
        </div>
        {popular && (
          <p className="mt-2 text-sm text-gray-600">
            Billed {period === 'month' ? 'monthly' : 'annually'}, cancel anytime
          </p>
        )}
      </div>
      
      <ul className="mb-8 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-5 w-5 text-green-500" />
            <span className="ml-3 text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={handleSubscribe}
        className={`w-full ${popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
      >
        {popular && <Zap className="mr-2 h-4 w-4" />}
        Get Started
      </Button>
      
      <PaymentModal />
    </div>
  );
}
