import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone, Wallet, QrCode, Banknote } from 'lucide-react';
import { paymentService, type PaymentMethod as PaymentMethodType } from '@/types/payment';

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  onPaymentMethodSelected: (method: PaymentMethodType) => void;
  onSubmit: (paymentMethod: PaymentMethodType) => Promise<void>;
  isLoading?: boolean;
  showSubmitButton?: boolean;
  buttonText?: string;
}

const PaymentMethodIcons: Record<string, React.ReactNode> = {
  edinar_smart: <CreditCard className="h-5 w-5" />,
  carte_bancaire: <CreditCard className="h-5 w-5" />,
  visa: <CreditCard className="h-5 w-5" />,
  mastercard: <CreditCard className="h-5 w-5" />,
  flouci: <Smartphone className="h-5 w-5" />,
  d17: <Smartphone className="h-5 w-5" />,
  mobiflouss: <Smartphone className="h-5 w-5" />,
  paymee: <Wallet className="h-5 w-5" />,
  tayarapay: <QrCode className="h-5 w-5" />,
  cash_at_gym: <Banknote className="h-5 w-5" />,
};

export function PaymentMethodSelector({
  amount,
  currency = 'TND',
  onPaymentMethodSelected,
  onSubmit,
  isLoading = false,
  showSubmitButton = true,
  buttonText = 'Pay Now',
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodType[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoadingMethods(true);
        // Get available payment methods for the selected currency
        const methods = paymentService.getAvailablePaymentMethods(currency);
        setAvailableMethods(methods);
        
        // Select the first method by default
        if (methods.length > 0) {
          setSelectedMethod(methods[0].type);
          onPaymentMethodSelected(methods[0].type);
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      } finally {
        setIsLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, [currency, onPaymentMethodSelected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    
    try {
      await onSubmit(selectedMethod);
    } catch (error) {
      console.error('Payment submission failed:', error);
      // Error handling would be implemented here
    }
  };

  if (isLoadingMethods) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  if (availableMethods.length === 0) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-md">
        <p className="text-yellow-700">No payment methods available for {currency}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Amount:</span>
          <span className="text-lg font-bold">
            {paymentService.formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Select Payment Method</h3>
          <RadioGroup 
            value={selectedMethod || ''} 
            onValueChange={(value) => {
              const method = value as PaymentMethodType;
              setSelectedMethod(method);
              onPaymentMethodSelected(method);
            }}
            className="space-y-3"
          >
            {availableMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3">
                <RadioGroupItem value={method.type} id={method.id} />
                <div className="flex items-center space-x-2">
                  <div className="text-muted-foreground">
                    {PaymentMethodIcons[method.type] || <CreditCard className="h-5 w-5" />}
                  </div>
                  <Label htmlFor={method.id} className="font-normal cursor-pointer">
                    <div className="flex flex-col">
                      <span>{method.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {method.description}
                      </span>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {showSubmitButton && (
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedMethod || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </Button>
        )}
      </form>
    </div>
  );
}
