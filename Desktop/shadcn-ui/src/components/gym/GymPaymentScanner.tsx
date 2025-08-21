import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { paymentService } from '@/types/payment';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QRScanner } from '@/components/QRScanner';
import { useAuth } from '@/context/AuthContext';

interface GymPaymentScannerProps {
  gymId: string;
  onPaymentProcessed?: (paymentCode: string) => void;
  onClose?: () => void;
}

export function GymPaymentScanner({ gymId, onPaymentProcessed, onClose }: GymPaymentScannerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<{
    paymentCode: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    status: string;
    message: string;
  } | null>(null);

  const handleScan = async (data: string | null) => {
    if (!data || isProcessing) return;
    
    try {
      setScannedData(null);
      setVerificationResult(null);
      setIsProcessing(true);
      
      // Parse the QR code data
      let paymentData;
      try {
        paymentData = JSON.parse(data);
      } catch (e) {
        throw new Error('Invalid QR code format');
      }
      
      if (paymentData.type !== 'gym_payment' || !paymentData.paymentCode) {
        throw new Error('Invalid payment QR code');
      }
      
      setScannedData({
        paymentCode: paymentData.paymentCode,
        amount: paymentData.amount,
        currency: paymentData.currency || 'TND',
      });
      
      // Verify the payment code
      const verification = await paymentService.verifyGymPayment(paymentData.paymentCode);
      
      if (!verification.isValid) {
        setVerificationResult({
          isValid: false,
          status: verification.status || 'invalid',
          message: verification.message || 'Invalid payment code',
        });
        return;
      }
      
      setVerificationResult({
        isValid: true,
        status: verification.status || 'valid',
        message: `Payment of ${paymentService.formatCurrency(
          verification.amount || 0, 
          verification.currency || 'TND'
        )} is ready to be processed`,
      });
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setVerificationResult({
        isValid: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process QR code',
      });
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!scannedData || !user?.id) return;
    
    try {
      setIsProcessing(true);
      
      const result = await paymentService.processGymPayment(
        scannedData.paymentCode,
        gymId,
        user.id
      );
      
      if (result.success) {
        toast({
          title: 'Payment Processed',
          description: `Successfully processed payment of ${paymentService.formatCurrency(
            scannedData.amount,
            scannedData.currency
          )}`,
        });
        onPaymentProcessed?.(scannedData.paymentCode);
      } else {
        throw new Error(result.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setVerificationResult(null);
    setIsScanning(true);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="h-6 w-6 mr-2" />
          {isScanning ? 'Scan Payment QR Code' : 'Payment Details'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isScanning ? (
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black">
            <QRScanner 
              onScan={handleScan} 
              onError={(error) => {
                console.error('QR Scanner error:', error);
                toast({
                  title: 'Scanner Error',
                  description: 'Failed to access camera. Please check permissions.',
                  variant: 'destructive',
                });
              }}
              showViewFinder={true}
              className="h-full w-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {scannedData && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Code:</span>
                  <span className="font-mono">{scannedData.paymentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {paymentService.formatCurrency(scannedData.amount, scannedData.currency)}
                  </span>
                </div>
              </div>
            )}
            
            {verificationResult && (
              <div className={`p-4 rounded-lg ${
                verificationResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.status === 'pending' 
                        ? 'Payment Pending' 
                        : verificationResult.status === 'completed'
                        ? 'Payment Already Processed'
                        : verificationResult.status === 'expired'
                        ? 'Payment Expired'
                        : 'Invalid Payment Code'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        {isScanning ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        ) : (
          <>
            <div className="flex w-full space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetScanner}
                disabled={isProcessing}
              >
                Scan Another Code
              </Button>
              
              <Button 
                className="flex-1"
                onClick={handleProcessPayment}
                disabled={!verificationResult?.isValid || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={onClose}
            >
              Close
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
