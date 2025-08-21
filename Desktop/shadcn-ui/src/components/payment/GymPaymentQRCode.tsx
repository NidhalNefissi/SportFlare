import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RotateCw, CheckCircle } from 'lucide-react';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { paymentService } from '@/types/payment';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface GymPaymentQRCodeProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
  onPaymentVerified?: () => void;
  onCancel?: () => void;
}

export function GymPaymentQRCode({
  amount,
  currency = 'TND',
  metadata = {},
  onPaymentVerified,
  onCancel,
}: GymPaymentQRCodeProps) {
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  // Generate QR code data
  useEffect(() => {
    const generatePaymentCode = async () => {
      try {
        setIsLoading(true);
        const { paymentCode, expiresAt } = await paymentService.generateGymPaymentCode(
          amount,
          currency,
          metadata
        );
        
        setPaymentCode(paymentCode);
        setExpiresAt(expiresAt);
        setTimeLeft(Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      } catch (error) {
        console.error('Failed to generate payment code:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate payment code. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    generatePaymentCode();
  }, [amount, currency, metadata, toast]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // Verify payment status
  const verifyPayment = async () => {
    if (!paymentCode) return;

    try {
      setIsVerifying(true);
      const isPaid = await paymentService.verifyGymPayment(paymentCode);
      
      if (isPaid) {
        setIsVerified(true);
        toast({
          title: 'Payment Verified',
          description: 'Your payment has been successfully processed!',
        });
        onPaymentVerified?.();
      } else {
        toast({
          title: 'Payment Pending',
          description: 'The payment has not been processed yet.',
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!paymentCode) return;
    
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `payment-${paymentCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Generating payment QR code...</p>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Payment Verified!</h3>
        <p className="text-muted-foreground">
          Your payment of {paymentService.formatCurrency(amount, currency)} has been processed successfully.
        </p>
        <Button onClick={onPaymentVerified} className="mt-4">
          Continue
        </Button>
      </div>
    );
  }

  if (!paymentCode || !expiresAt) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Failed to generate payment code.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          <RotateCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Pay at Gym Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-2xl font-bold">{paymentService.formatCurrency(amount, currency)}</p>
          <p className="text-sm text-muted-foreground">
            Show this QR code at the gym counter
          </p>
        </div>

        <div className="flex justify-center">
          <div className="border-4 border-primary rounded-lg p-4 bg-white">
            <QRCodeComponent
              value={paymentCode}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin={false}
              imageSettings={{
                src: '/logo.png',
                height: 20,
                width: 20,
                excavate: true,
              }}
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">Payment Code:</span>
            <span className="font-mono font-bold">{paymentCode}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-muted-foreground">Expires in:</span>
            <span className={`font-medium ${timeLeft < 300 ? 'text-red-600' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            The gym staff will scan this code to process your payment
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <div className="flex space-x-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={downloadQRCode}
            disabled={timeLeft <= 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Save QR Code
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={verifyPayment}
            disabled={timeLeft <= 0 || isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="mr-2 h-4 w-4" />
            )}
            Check Payment
          </Button>
        </div>
        
        {timeLeft <= 0 ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Generate New Code
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
