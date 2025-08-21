import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

export function CartCheckout() {
  const { items, clearCart } = useCart();
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      if (paymentMethod === 'card') {
        // Handle successful card payment
        clearCart();
      }
      // For 'payAtGym', the notification is already handled by the payment flow
    },
    onClose: () => {
      // Any cleanup when modal is closed
    }
  });

  const handleCheckout = () => {
    openPayment({
      amount: total,
      itemName: items.length === 1 
        ? items[0].name 
        : `${items.length} items in cart`,
      type: 'product',
      metadata: {
        cartItems: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    });
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
        <p>Total</p>
        <p>{total.toFixed(2)} TND</p>
      </div>
      
      <Button
        onClick={handleCheckout}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={items.length === 0}
      >
        Proceed to Payment
      </Button>
      
      <PaymentModal />
    </div>
  );
}
