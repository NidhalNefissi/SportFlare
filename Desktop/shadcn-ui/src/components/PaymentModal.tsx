import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, Search, MapPin, Clock, AlertCircle, Clock as ClockIcon, BellRing, ExternalLink } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNotifications } from '@/context/NotificationContext';
import type { Notification } from '@/types';
import { useUser } from '@/context/UserContext';
import { useUniversalGymDialog } from '@/hooks/useUniversalGymDialog';
import { format } from 'date-fns';
import { mockGyms } from '@/pages/Gyms';
import { usePaymentNotifications } from '@/utils/paymentNotifications';

// Mock gym data - in a real app, this would come from an API
const gyms = mockGyms.map(gym => ({
    id: gym.id,
    name: gym.name,
    address: gym.address,
    distance: '0.5 km' // Default distance for demo
}));

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (paymentMethod?: 'card' | 'payAtGym') => void;
    amount: number;
    itemName: string;
    type: 'class' | 'product' | 'subscription' | 'program' | 'coach_booking';
}

function PaymentModal({
    isOpen,
    onClose,
    onPaymentSuccess,
    amount,
    itemName,
    type
}: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'payAtGym'>('card');
    const [selectedGym, setSelectedGym] = useState<any>(gyms[0]); // Default to first gym for demo
    const { handleViewGym, GymDialogComponents } = useUniversalGymDialog();
    const [searchQuery, setSearchQuery] = useState('');
    const [showGymList, setShowGymList] = useState(false);
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Create a proper gym object with all required properties
    const getGymWithRequiredProps = React.useCallback((gym: any) => ({
        ...gym,
        id: gym?.id || 'default-id',
        name: gym?.name || 'Unknown Gym',
        address: gym?.address || 'No address provided',
        city: gym?.city || 'Tunis',
        rating: gym?.rating || 4.5,
        ratingCount: gym?.ratingCount || 100,
        image: gym?.image || '/placeholder-gym.jpg',
        amenities: gym?.amenities || [],
        description: gym?.description || 'A great place to work out!',
    }), []);

    // Memoize the selected gym to prevent unnecessary re-renders
    const selectedGymWithProps = React.useMemo(() =>
        selectedGym ? getGymWithRequiredProps(selectedGym) : null,
        [selectedGym, getGymWithRequiredProps]
    );

    // Handle gym view click
    const handleGymClick = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedGymWithProps) {
            // Use requestAnimationFrame to ensure the click is fully processed
            requestAnimationFrame(() => {
                handleViewGym(selectedGymWithProps);
            });
        }
    }, [handleViewGym, selectedGymWithProps]);

    const { user } = useUser();
    const { addNotification } = useNotifications();
    const { addPaymentNotification } = usePaymentNotifications();

    // Calculate time left for payment
    useEffect(() => {
        if (!deadline) return;

        const updateTimeLeft = () => {
            const now = new Date();
            const diffMs = deadline.getTime() - now.getTime();

            if (diffMs <= 0) {
                setTimeLeft('Expired');
                return;
            }

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    // Handle payment pending modal close
    const handlePaymentPendingClose = () => {
        // Close the payment pending modal
        setPaymentPending(false);

        // Close the payment modal
        onClose();

        // Notify parent component of successful payment proposal
        onPaymentSuccess('payAtGym');
    };

    // Handle payment success
    const handlePaymentSuccess = (paymentMethod?: 'card' | 'payAtGym') => {
        if (paymentMethod === 'payAtGym') {
            // For pay at gym, show payment pending state
            setPaymentPending(true);

            // Set deadline to 24 hours from now
            const newDeadline = new Date();
            newDeadline.setHours(newDeadline.getHours() + 24);
            setDeadline(newDeadline);

            // Add payment notification using the unified notification system
            addPaymentNotification({
                amount,
                itemName,
                type: type as any, // Cast to any to match the PaymentType
                paymentMethod: 'payAtGym',
                paymentStatus: 'pending',
                gymName: selectedGym.name,
                deadline,
                metadata: {
                    gymId: selectedGym.id,
                    type,
                    amount,
                    itemName,
                    gymName: selectedGym.name,
                    deadline: deadline.toISOString()
                }
            });
        } else {
            // For card payments, send success notification and close
            addPaymentNotification({
                amount,
                itemName,
                type: type as any, // Cast to any to match the PaymentType
                paymentMethod: 'card',
                paymentStatus: 'confirmed',
                metadata: {
                    type,
                    amount,
                    itemName,
                    paymentMethod: 'card',
                    paymentStatus: 'confirmed',
                    timestamp: new Date().toISOString()
                }
            });

            // Notify parent component of successful payment
            onPaymentSuccess(paymentMethod);
        }
    };

    // Handle payment
    const handlePayment = async () => {
        if (!paymentMethod) {
            addNotification({
                userId: user?.id || 'anonymous',
                type: 'system',
                title: 'Payment Method Not Selected',
                message: 'Please select a payment method to continue.',
                isRead: false,
                metadata: {}
            });
            return;
        }

        if (paymentMethod === 'payAtGym' && !selectedGym) {
            addNotification({
                type: 'system',
                title: 'Gym Selection Required',
                message: 'Please select a gym',
                isRead: false,
                metadata: {}
            });
            return;
        }

        try {
            setIsProcessing(true);

            if (paymentMethod === 'payAtGym') {
                // For pay at gym, show payment pending state
                setPaymentPending(true);

                // Set deadline to 24 hours from now
                const deadline = new Date();
                deadline.setHours(deadline.getHours() + 24);
                setDeadline(deadline);

                // Add notification with payment details
                const now = new Date();
                const notification: Omit<Notification, 'id' | 'createdAt'> = {
                    userId: user?.id || 'anonymous',
                    title: 'Payment Pending',
                    message: `Payment pending for ${itemName} at ${selectedGym.name}. Please complete your payment at the gym counter.`,
                    type: 'payment',
                    isRead: false,
                    metadata: {
                        type: type,
                        amount: amount,
                        itemName: itemName,
                        gymName: selectedGym.name,
                        deadline: deadline.toISOString(),
                        notificationId: `payment-${Date.now()}`
                    },
                    actionType: 'modal',
                    actionData: {
                        modalType: 'gym',
                        entityId: selectedGym.id,
                        metadata: {
                            type: type,
                            amount: amount,
                            itemName: itemName,
                            gymName: selectedGym.name,
                            deadline: deadline.toISOString()
                        }
                    }
                };
                addNotification(notification);

                // Set up reminders
                const reminderInterval = setInterval(() => {
                    const now = new Date();
                    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

                    // Send reminder every 6 hours
                    if (hoursUntilDeadline % 6 < 0.1) {
                        addNotification({
                            userId: user?.id || 'anonymous',
                            title: 'Payment Reminder',
                            message: `Reminder: Complete your payment for ${itemName} at ${selectedGym.name}`,
                            type: 'reminder',
                            isRead: false,
                            metadata: {
                                type: type,
                                amount: amount,
                                itemName: itemName,
                                gymName: selectedGym.name,
                                deadline: deadline.toISOString()
                            },
                            actionType: 'modal',
                            actionData: {
                                modalType: 'gym',
                                entityId: selectedGym.id,
                                metadata: {
                                    type: type,
                                    amount: amount,
                                    itemName: itemName,
                                    gymName: selectedGym.name,
                                    deadline: deadline.toISOString()
                                }
                            }
                        });
                    }

                    // Final reminder 6 hours before deadline
                    if (hoursUntilDeadline < 6.1 && hoursUntilDeadline > 5.9) {
                        addNotification({
                            userId: user?.id || 'anonymous',
                            title: 'Final Payment Reminder',
                            message: `Final reminder: Complete your payment for ${itemName} at ${selectedGym.name} within 6 hours`,
                            type: 'reminder',
                            isRead: false,
                            metadata: {
                                type: type,
                                amount: amount,
                                itemName: itemName,
                                gymName: selectedGym.name,
                                deadline: deadline.toISOString()
                            },
                            actionType: 'modal',
                            actionData: {
                                modalType: 'gym',
                                entityId: selectedGym.id,
                                metadata: {
                                    type: type,
                                    amount: amount,
                                    itemName: itemName,
                                    gymName: selectedGym.name,
                                    deadline: deadline.toISOString()
                                }
                            },
                            priority: 'high'
                        });
                    }
                }, 60 * 60 * 1000); // Check every hour

                // Don't close the modal yet, let the user see the pending state
                return;
            } else {
                // Process card payment
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                setPaymentComplete(true);
                handlePaymentSuccess('card');
            }
        } catch (error) {
            console.error('Payment error:', error);
            addNotification('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getPaymentMessage = () => {
        switch (type) {
            case 'class':
                return 'Coach and Gym will be paid only after attendance is confirmed.';
            case 'product':
                return 'Your order will be processed immediately.';
            case 'subscription':
                return 'Your subscription will be activated immediately.';
            case 'program':
                return 'Your program enrollment will be processed immediately.';
            default:
                return 'Payment will be processed securely.';
        }
    };

    const getDeadlineHours = () => {
        switch (type) {
            case 'class': return 24; // 24 hours for classes
            case 'program': return 72; // 72 hours for programs
            case 'product': return 48; // 48 hours for products
            case 'subscription': return 24; // 24 hours for subscriptions
            default: return 48; // Default 48 hours
        }
    };

    const getActionText = () => {
        switch (type) {
            case 'class': return 'confirm your class booking';
            case 'program': return 'confirm your program enrollment';
            case 'product': return 'complete your purchase';
            case 'subscription': return 'activate your subscription';
            default: return 'complete your action';
        }
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (paymentMethod === 'payAtGym' && !selectedGym) {
            setSelectedGym(gyms[0]); // Auto-select first gym
        }
    }, [paymentMethod]);

    // Payment pending view - Show PaymentPendingModal
    if (paymentPending && paymentMethod === 'payAtGym' && deadline && selectedGym) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md z-[1002]" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <span>Payment Pending</span>
                        </DialogTitle>
                        <DialogDescription>
                            Your payment proposal has been received. Please complete your payment at the gym counter.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">Payment Pending</h4>
                                    <p className="text-sm text-yellow-700">
                                        You have <span className="font-bold">{timeLeft}</span> to complete your payment of {amount} TND for {itemName} at
                                        <button
                                            onClick={handleGymClick}
                                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center ml-1"
                                        >
                                            {selectedGym.name}
                                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                        </button>
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Deadline: {format(deadline, "PPPpp")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 flex items-center">
                                <BellRing className="h-4 w-4 mr-2" />
                                Reminder Settings
                            </h4>
                            <ul className="mt-2 text-sm text-blue-700 space-y-1">
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2"></span>
                                    <span>You'll receive reminders every 6 hours</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2"></span>
                                    <span>Final reminder 6 hours before deadline</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6">
                            <Button
                                className="w-full"
                                onClick={handlePaymentPendingClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
                {/* Render gym dialog components in a stable container */}
                <div style={{ position: 'fixed', zIndex: 1003, pointerEvents: 'none' }}>
                    <GymDialogComponents />
                </div>
            </Dialog>
        );
    }

    // Regular payment view
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md z-[1002]" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Payment</span>
                    </DialogTitle>
                </DialogHeader>

                {paymentComplete ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {paymentMethod === 'payAtGym' ? 'Payment Pending!' : 'Payment Successful!'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {paymentMethod === 'payAtGym'
                                ? 'Please complete your payment at the gym counter.'
                                : getPaymentMessage()}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900">{itemName}</h3>
                            <p className="text-2xl font-bold text-green-600">{amount} TND</p>
                        </div>

                        <div className="space-y-4">
                            <RadioGroup value={paymentMethod} onValueChange={value => setPaymentMethod(value as 'card' | 'payAtGym')} className="flex gap-4 mb-4">
                                <RadioGroupItem value="card" id="card">
                                    <Label htmlFor="card">Pay by Card</Label>
                                </RadioGroupItem>
                                <RadioGroupItem value="payAtGym" id="payAtGym">
                                    <Label htmlFor="payAtGym">Pay at Gym</Label>
                                </RadioGroupItem>
                            </RadioGroup>
                            {paymentMethod === 'card' && (
                                <>
                                    <div>
                                        <Label htmlFor="cardNumber">Card Number</Label>
                                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="expiry">Expiry Date</Label>
                                            <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                                        </div>
                                        <div>
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" placeholder="123" maxLength={3} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                                        <Input id="cardholderName" placeholder="John Doe" />
                                    </div>
                                </>
                            )}
                            {paymentMethod === 'payAtGym' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search for a gym..."
                                            className="pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setShowGymList(true)}
                                        />
                                    </div>

                                    {showGymList && (
                                        <div className="border rounded-lg max-h-60 overflow-y-auto">
                                            {filteredGyms.map(gym => (
                                                <div
                                                    key={gym.id}
                                                    className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedGym?.id === gym.id ? 'bg-blue-50' : ''}`}
                                                    onClick={() => {
                                                        setSelectedGym(gym);
                                                        setShowGymList(false);
                                                    }}
                                                >
                                                    <div className="font-medium">{gym.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <MapPin className="h-3.5 w-3.5 mr-1" />
                                                        {gym.address} • {gym.distance} away
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedGym && !showGymList && (
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="font-medium">{selectedGym.name}</div>
                                            <div className="text-sm text-gray-600">{selectedGym.address}</div>
                                            <div className="text-sm text-gray-600 flex items-center mt-1">
                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                You have {getDeadlineHours()} hours to pay at the counter
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                                        <p>To {getActionText()}, you have {getDeadlineHours()} hours to pay at {selectedGym?.name || 'the selected gym'} counter in cash.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700">
                                <Lock className="h-4 w-4" />
                                <span className="text-sm font-medium">Secure Payment</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">{getPaymentMessage()}</p>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handlePayment}
                                disabled={isProcessing || (paymentMethod === 'payAtGym' && !selectedGym)}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    paymentMethod === 'payAtGym' ? 'Send Payment Proposal' : `Pay ${amount} TND`
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default PaymentModal; 