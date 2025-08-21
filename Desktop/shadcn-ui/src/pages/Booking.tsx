import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { Class } from '@/types';
import PaymentModal from '../components/PaymentModal';

interface BookingProps {
    classItem: Class;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBooked?: () => void;
}

export default function Booking({ classItem, open, onOpenChange, onBooked }: BookingProps) {
    const [isBooking, setIsBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleBooking = () => {
        setIsBooking(true);
        setTimeout(() => {
            setIsBooking(false);
            setSuccess(true);
            if (onBooked) onBooked();
        }, 1200);
    };

    const handlePaymentSuccess = (paymentMethod?: 'card' | 'payAtGym') => {
        if (paymentMethod === 'payAtGym') {
            // For pay at gym, show success with pending state
            setPaymentSuccess(true);
            // Don't call handleBooking here as it will be called after the payment pending modal is closed
        } else {
            // For card payments, show regular success
            setPaymentSuccess(false);
            handleBooking();
        }
        // Don't close the payment modal here, let the PaymentPendingModal handle it
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Book Class</DialogTitle>
                    <DialogDescription>
                        Confirm your booking for the following class:
                    </DialogDescription>
                </DialogHeader>
                {success ? (
                    <div className="space-y-4 text-center">
                        <h3 className={`font-medium ${paymentSuccess ? 'text-yellow-600' : 'text-green-600'}`}>
                            {paymentSuccess ? 'Payment Pending' : 'Booking Confirmed!'}
                        </h3>
                        {paymentSuccess ? (
                            <div className="space-y-2">
                                <p className="text-muted-foreground">
                                    Your payment proposal has been received. Please complete your payment at the gym counter.
                                </p>
                                <div className="p-4 bg-yellow-50 rounded-md text-left space-y-2">
                                    <p className="text-sm">
                                        You have <span className="font-bold">23:59:59</span> to complete your payment of {classItem.price} TND for {classItem.title} at FitZone Gym
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Deadline: {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-US', { 
                                            month: 'long', 
                                            day: 'numeric', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-yellow-100">
                                        <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Reminder Settings
                                        </h4>
                                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                                            <li className="flex items-start">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 mr-2"></span>
                                                <span>You'll receive reminders every 6 hours</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 mr-2"></span>
                                                <span>Final reminder 6 hours before deadline</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">You have successfully booked <b>{classItem.title}</b>.</p>
                        )}
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="border rounded-md p-4">
                                <h3 className="font-medium">{classItem.title}</h3>
                                <p className="text-sm text-muted-foreground">{classItem.description}</p>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{new Date(classItem.date).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{classItem.duration} minutes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{classItem.enrolled} / {classItem.capacity} enrolled</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm">{classItem.coach.name}</span>
                                    <Badge>{classItem.price} TND</Badge>
                                </div>
                            </div>
                            <div className="flex items-center border rounded-md p-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Spots Available</p>
                                    <p className="text-xs text-muted-foreground">
                                        {classItem.capacity - classItem.enrolled} spots left
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-between mt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBooking}>Cancel</Button>
                            <Button onClick={() => setIsPaymentOpen(true)} disabled={isBooking}>
                                Proceed to Payment
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
            {isPaymentOpen && (
                <div style={{ position: 'fixed', zIndex: 1001, left: 0, top: 0, width: '100vw', height: '100vh' }}>
                    <PaymentModal
                        isOpen={isPaymentOpen}
                        onClose={() => setIsPaymentOpen(false)}
                        onPaymentSuccess={handlePaymentSuccess}
                        amount={classItem.price}
                        itemName={classItem.title}
                        type="class"
                    />
                </div>
            )}
        </Dialog>
    );
} 