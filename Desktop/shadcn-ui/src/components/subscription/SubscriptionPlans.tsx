import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { PaymentModal } from '@/components/PaymentModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limitations: string[];
  isPopular?: boolean;
}

interface SubscriptionPlansProps {
  onPlanSelected?: (planId: string, duration: number, price: number) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onPlanSelected }) => {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<1 | 3 | 6 | 12>(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(user?.subscription?.plan || null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 60,
      description: 'Includes limited access (e.g., 60 mins)',
      features: [
        'Track workouts',
        'Browse classes and gyms',
        'Basic analytics',
        'Community access',
        '60 minutes access/month'
      ],
      limitations: [
        'Limited class bookings',
        'No AI coaching',
        'No premium content access',
        'Basic workout analytics'
      ]
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 90,
      description: 'Includes mid-level access (e.g., 90 mins)',
      isPopular: true,
      features: [
        'All Basic features',
        '90 minutes access/month',
        'AI coaching (5 sessions/month)',
        'Advanced analytics',
        'Workout plan creation',
        '10% discount on marketplace'
      ],
      limitations: [
        'Limited personal coaching',
        'Standard support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 120,
      description: 'Full access (e.g., 120 mins)',
      features: [
        'All Plus features',
        '120 minutes access/month',
        '1-on-1 coaching sessions (2/month)',
        'Unlimited AI coaching',
        'Custom nutrition plans',
        'Priority support',
        'Early access to new features',
        '20% discount on marketplace'
      ],
      limitations: []
    }
  ];

  const calculateTotal = (price: number) => {
    return price * (selectedDuration === 12 ? 10 : selectedDuration);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose a Plan</h2>
        <p className="text-muted-foreground">Select the plan that best fits your fitness journey</p>
      </div>

      <div className="flex justify-center gap-4">
        {([1, 3, 6, 12] as const).map((duration) => (
          <Button
            key={duration}
            variant={selectedDuration === duration ? 'default' : 'outline'}
            onClick={() => setSelectedDuration(duration)}
            className="capitalize"
          >
            {duration === 12 ? '1 Year' : `${duration} Month${duration > 1 ? 's' : ''}`}
            {duration === 12 && (
              <Badge variant="secondary" className="ml-2">
                Save 16%
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="flex justify-center gap-1 text-sm text-muted-foreground mb-8">
        <span>Monthly</span>
        <span className="font-semibold text-foreground">•</span>
        <span className="text-primary font-medium">Annual Save 16%</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-xl border-2 ${
              plan.isPopular ? 'border-primary' : 'border-border'
            } bg-card shadow-sm overflow-hidden`}
          >
            {plan.isPopular && (
              <div className="bg-primary text-primary-foreground text-sm font-medium py-1 text-center">
                Recommended
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.isPopular && <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
              </div>
              
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <div className="text-3xl font-bold">
                  {plan.price} TND
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {calculateTotal(plan.price)} TND for {selectedDuration} {selectedDuration === 1 ? 'Month' : 'Months'}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <h4 className="font-medium">Features</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-destructive">Limitations</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
                {selectedPlan === plan.id && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePaymentClick}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${calculateTotal(plan.price)} TND`
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <>
      {plansContent}
        }}
      />
    </>
  );
};
