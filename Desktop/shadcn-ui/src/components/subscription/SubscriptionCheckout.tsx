import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, QrCode } from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { GymPaymentQRCode } from '@/components/payment/GymPaymentQRCode';
import { paymentService } from '@/types/payment';
import type { PlanTier, PlanDuration } from '@/types';

interface SubscriptionCheckoutProps {
  planTier: PlanTier;
  planDuration: PlanDuration;
  price: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubscriptionCheckout({
  planTier,
  planDuration,
  price,
  onSuccess,
  onCancel,
}: SubscriptionCheckoutProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [showQRCode, setShowQRCode] = useState(false);
  const [offlinePaymentCode, setOfflinePaymentCode] = useState<string | null>(null);

  const handlePaymentMethodSelected = (method: string) => {
    setPaymentMethod(method);
  };

  const handleSubmitPayment = async (method: string) => {
    if (method === 'cash_at_gym') {
      // Handle offline payment
      try {
        setIsProcessing(true);
        const { paymentCode } = await paymentService.generateOfflinePaymentCode(
          price,
          'TND',
          { planTier, planDuration }
        );
        setOfflinePaymentCode(paymentCode);
        setPaymentStatus('success');
        toast.success('Offline payment code generated');
      } catch (error) {
        console.error('Failed to generate payment code:', error);
        toast.error('Failed to generate payment code. Please try again.');
        setPaymentStatus('error');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle online payment
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      // In a real app, this would call your backend to process the payment
      const paymentRequest = {
        amount: price,
        currency: 'TND',
        description: `Subscription: ${planTier} (${planDuration} month${planDuration > 1 ? 's' : ''})`,
        paymentMethod: method as any,
        metadata: {
          userId: 'current-user-id', // Replace with actual user ID
          subscriptionId: `sub_${Date.now()}`,
          planTier,
          planDuration,
        },
        redirectUrl: `${window.location.origin}/subscription/success`,
        callbackUrl: `${window.location.origin}/api/payment/callback`,
      };

      // Process payment
      const paymentResponse = await paymentService.processPayment(paymentRequest);
      
      if (paymentResponse.status === 'completed') {
        setPaymentStatus('success');
        toast.success('Payment successful! Your subscription is now active.');
        
        // In a real app, you would update the user's subscription status in your database
        setTimeout(() => {
          onSuccess?.();
          router.push('/dashboard/subscription');
        }, 2000);
      } else {
        setPaymentStatus('error');
        toast.error('Payment failed. Please try again or use a different payment method.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error('An error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success' && offlinePaymentCode) {
    return (
      <GymPaymentQRCode
        amount={price}
        metadata={{
          planTier,
          planDuration,
          type: 'subscription',
        }}
        onPaymentVerified={onSuccess || (() => router.push('/dashboard'))}
        onCancel={onCancel}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Subscription</CardTitle>
        <CardDescription>
          {planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan • {planDuration} Month{planDuration > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="online" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online">Online Payment</TabsTrigger>
            <TabsTrigger value="offline">Pay at Gym</TabsTrigger>
          </TabsList>
          
          <TabsContent value="online" className="mt-6">
            <PaymentMethodSelector
              amount={price}
              currency="TND"
              onPaymentMethodSelected={handlePaymentMethodSelected}
              onSubmit={handleSubmitPayment}
              isLoading={isProcessing && paymentStatus === 'processing'}
              showSubmitButton={true}
              buttonText={`Pay ${paymentService.formatCurrency(price, 'TND')}`}
            />
          </TabsContent>
          
          <TabsContent value="offline" className="mt-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Pay at Gym Counter</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Choose one of the following options to complete your payment at a gym:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                  <li>Generate a QR code to show at the gym counter</li>
                  <li>Or get a payment code to provide to the staff</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => setShowQRCode(true)}
                  disabled={isProcessing}
                >
                  <QrCode className="h-6 w-6 mb-1" />
                  <span>Show QR Code</span>
                  <span className="text-xs font-normal text-muted-foreground">For in-person payment</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-auto py-3 flex-col gap-2"
                  onClick={() => handleSubmitPayment('cash_at_gym')}
                  disabled={isProcessing}
                >
                  <span className="text-lg font-mono">#</span>
                  <span>Get Payment Code</span>
                  <span className="text-xs font-normal text-muted-foreground">For manual entry</span>
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Your subscription will be activated after the gym processes your payment
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        {paymentStatus === 'error' && (
          <p className="text-sm text-red-500">
            Payment failed. Please try again.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
