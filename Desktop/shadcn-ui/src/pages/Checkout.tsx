import React, { useState, useEffect } from 'react';
import PaymentModal from '../components/PaymentModal';

interface CartItem {
    product: {
        id: string;
        title: string;
        price: number;
        brand: { name: string };
    };
    quantity: number;
}

interface CheckoutProps {
    items: CartItem[];
    total: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function Checkout({ items, total, open, onOpenChange }: CheckoutProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPayAtGym, setIsPayAtGym] = useState(false);
    const [itemName, setItemName] = useState('');

    useEffect(() => {
        // Set the item name based on cart contents
        if (items.length === 1) {
            setItemName(items[0].product.title);
        } else if (items.length > 1) {
            setItemName('Cart Purchase');
        } else {
            setItemName('');
        }
    }, [items]);

    const handlePaymentSuccess = (paymentMethod?: 'card' | 'payAtGym') => {
        // Only set success state if payment is complete (not pending)
        if (paymentMethod === 'card') {
            setSuccess(true);
            setIsPayAtGym(false);
        } else if (paymentMethod === 'payAtGym') {
            // For pay at gym, we'll show the success state in the Checkout component
            setSuccess(true);
            setIsPayAtGym(true);
        }
        setIsPaymentOpen(false);
    };

    const handleProceedToPayment = () => {
        setIsPaymentOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
                {success ? (
                    <div className="text-center space-y-4">
                        <h2 className={`font-semibold ${isPayAtGym ? 'text-yellow-600' : 'text-green-600'}`}>
                            {isPayAtGym ? 'Payment Pending!' : 'Payment Successful!'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isPayAtGym
                                ? 'Please complete your payment at the gym counter.'
                                : 'Thank you for your purchase.'}
                        </p>
                        <button
                            className="bg-primary text-white px-4 py-2 rounded"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">Order Summary</h2>
                            <ul className="divide-y">
                                {items.map((item) => (
                                    <li key={item.product.id} className="flex justify-between py-2">
                                        <span>{item.product.title} x {item.quantity}</span>
                                        <span>{item.product.price * item.quantity} TND</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between font-bold mt-4">
                                <span>Total</span>
                                <span>{total} TND</span>
                            </div>
                        </div>
                        <button
                            className="bg-primary text-white px-4 py-2 rounded w-full mt-4"
                            onClick={handleProceedToPayment}
                        >
                            Proceed to Payment
                        </button>
                    </>
                )}
            </div>
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    // If we have a pending payment, show the success state
                    if (success && isPayAtGym) {
                        onOpenChange(true);
                    }
                }}
                onPaymentSuccess={handlePaymentSuccess}
                amount={total}
                itemName={itemName}
                type="product"
            />
        </>
    );
} 