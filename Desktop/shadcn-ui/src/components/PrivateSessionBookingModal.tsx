import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, CreditCard, Building2, CheckCircle } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { mockGyms } from '../pages/Gyms';
import { Calendar as ShadcnCalendar, CalendarProps } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import PaymentModal from './PaymentModal';
import { PaymentPendingModal } from './PaymentPendingModal';
import { format, addHours, addDays, isAfter, isToday, isBefore, parse, addMinutes } from 'date-fns';
import { 
  getAvailableTimeSlots, 
  isDateAvailable, 
  getNextAvailableDate, 
  blockCoachTimeSlot,
  isTimeSlotAvailable
} from '@/utils/coachAvailability';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

interface PrivateSessionBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachId: string;
    coachName: string;
    coachPrice: number;
    onSubmit: (bookingData: BookingData) => void;
}

export interface BookingData {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'private';
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:MM format
  duration: number; // in minutes
  price: number;
  currency: string;
  paymentMethod: 'card' | 'payAtGym';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  coachId: string;
  coachName: string;
  gymId: string;
  gymName: string;
  locationType: 'in_person' | 'online' | 'hybrid';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PrivateSessionBookingModal({
    isOpen,
    onClose,
    coachId,
    coachName,
    coachPrice,
    onSubmit
}: PrivateSessionBookingModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [bookingNotes, setBookingNotes] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => getNextAvailableDate());
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedGym, setSelectedGym] = useState<any>(null);
    const [duration, setDuration] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showGymSearch, setShowGymSearch] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'payAtGym'>('card');

    // Get available time slots for the selected date and coach
    const availableTimeSlots = useMemo(() => {
        if (!selectedDate) return [];
        return getAvailableTimeSlots(coachId, selectedDate);
    }, [selectedDate, coachId]);

    // Set the first available time when date changes
    useEffect(() => {
        if (selectedDate && availableTimeSlots.length > 0) {
            setSelectedTime(availableTimeSlots[0]);
        } else {
            setSelectedTime('');
        }
    }, [selectedDate, availableTimeSlots]);

    // Disable dates that are not available for booking
    const isDateDisabled = (date: Date): boolean => {
        return !isDateAvailable(coachId, date);
    };

    // Get the minimum date that can be selected (today or next available date)
    const minDate = useMemo(() => {
        return getNextAvailableDate(coachId);
    }, [coachId]);



    const filteredGyms = mockGyms.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPrice = coachPrice * duration;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !selectedGym) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields',
                variant: 'destructive',
            });
            return;
        }

        // Check if the selected time slot is still available
        if (!isTimeSlotAvailable(coachId, selectedDate, selectedTime, duration)) {
            toast({
                title: 'Time Slot Unavailable',
                description: 'This time slot is no longer available. Please select another time.',
                variant: 'destructive',
            });
            // Refresh available time slots
            const slots = getAvailableTimeSlots(coachId, selectedDate);
            setSelectedTime(slots[0] || '');
            return;
        }

        const newBookingData = {
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            gymId: selectedGym.id,
            gymName: selectedGym.name,
            duration: duration * 60, // Convert hours to minutes
            price: duration * coachPrice, // Calculate price based on duration and coach's rate
            paymentMethod: 'card', // Default, can be changed in payment modal
            notes: bookingNotes,
        } as const;
        
        // Store the booking data including the calculated price
        setBookingData({
            ...newBookingData,
            id: '', // Will be set in handlePaymentSuccess
            userId: user?.id || 'anonymous',
            userName: user?.name || 'Guest User',
            userAvatar: user?.avatar,
            type: 'private' as const,
            title: `Private Session with ${coachName}`,
            currency: 'TND',
            paymentStatus: 'pending',
            status: 'pending',
            coachId,
            coachName,
            locationType: 'in_person' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        setBookingData(newBookingData as any);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (method?: 'card' | 'payAtGym') => {
        if (!bookingData || !selectedDate) return;

        try {
            setIsLoading(true);
            
            // Create the booking data
            const bookingPayload: BookingData = {
                id: uuidv4(),
                userId: user?.id || 'anonymous',
                userName: user?.name || 'Guest User',
                userAvatar: user?.avatar,
                type: 'private',
                title: `Private Session with ${coachName}`,
                date: bookingData.date,
                time: bookingData.time,
                duration: bookingData.duration, // Already in minutes
                price: bookingData.price,
                currency: 'TND',
                paymentMethod: method || 'card',
                paymentStatus: method === 'card' ? 'completed' : 'pending',
                status: 'pending' as BookingStatus, // Will be confirmed by the coach
                coachId,
                coachName,
                gymId: selectedGym?.id || '',
                gymName: selectedGym?.name || '',
                locationType: 'in_person',
                notes: bookingData.notes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Block the time slot for this coach
            blockCoachTimeSlot(
                coachId,
                selectedDate,
                bookingData.time,
                bookingData.duration / 60, // Convert back to hours for the availability function
                bookingPayload.id
            );

            // Submit the booking
            if (onSubmit) {
                await onSubmit(bookingPayload);
            }

            // Show success message
            toast({
                title: 'Booking Request Sent',
                description: 'Your private session request has been sent to the coach. You will be notified when they respond.',
            });

            // If paying at gym, show payment pending state
            if (method === 'payAtGym') {
                setPaymentPending(true);
            } else {
                // For card payments, close the modal
                onClose();
            }

            setShowPaymentModal(false);
        } catch (error) {
            console.error('Error processing payment:', error);
            toast({
                title: 'Error',
                description: 'There was an error processing your payment. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentPendingClose = () => {
        // Close the payment pending modal
        setPaymentPending(false);

        // Close the booking modal
        onClose();
    };

    // Date picker (next 14 days)
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="text-xl">Book Private Session</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 p-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col items-center gap-1">
                        <div className="font-bold text-lg">{coachName}</div>
                        <div className="text-primary font-semibold">{coachPrice} TND/hour</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Picker */}
                        <div className="space-y-3">
                            <div className="font-medium">Select Date</div>
                            <div className="border rounded-lg p-2">
                                <ShadcnCalendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date || undefined);
                                        // Reset selected time when date changes
                                        if (date) {
                                            const slots = getAvailableTimeSlots(coachId, date);
                                            setSelectedTime(slots[0] || '');
                                        }
                                    }}
                                    disabled={(date) => isDateDisabled(date) || isBefore(date, minDate)}
                                    fromDate={minDate}
                                    toDate={addDays(minDate, 60)} // Show up to 60 days in the future
                                    className="rounded-md"
                                />
                            </div>
                        </div>
                        {/* Time Picker */}
                        <div className="space-y-3">
                            <div className="font-medium">Select Time</div>
                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                                {availableTimeSlots.length > 0 ? (
                                    availableTimeSlots.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? 'default' : 'outline'}
                                            onClick={() => setSelectedTime(time)}
                                            className="justify-center py-6"
                                        >
                                            {time}
                                        </Button>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-6 text-muted-foreground">
                                        No available time slots for this date
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Gym Selector */}
                        <div className="md:col-span-2 space-y-3">
                            <div className="font-medium">Select Gym</div>
                            <div className="relative">
                                <Input
                                    placeholder="Search gyms by name or city..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full mb-2"
                                />
                                <div className="max-h-32 overflow-y-auto border rounded divide-y">
                                    {filteredGyms.map(gym => (
                                        <div
                                            key={gym.id}
                                            className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${selectedGym?.id === gym.id ? 'bg-primary/10' : ''}`}
                                            onClick={() => setSelectedGym(gym)}
                                        >
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="font-medium text-sm">{gym.name}</div>
                                                <div className="text-xs text-muted-foreground">{gym.city}</div>
                                            </div>
                                            {selectedGym?.id === gym.id && <Badge className="ml-auto">Selected</Badge>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Duration Selector */}
                        <div className="md:col-span-2">
                            <div className="font-medium mb-1">Session Duration</div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(h => (
                                    <Button
                                        key={h}
                                        variant={duration === h ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setDuration(h)}
                                    >
                                        {h} Hour{h > 1 ? 's' : ''}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Price Summary */}
                    <div className="bg-muted p-4 rounded">
                        <div className="font-medium mb-2">Price Summary</div>
                        <div className="flex justify-between mb-1">
                            <span>{duration} hour(s) × {coachPrice} TND</span>
                            <span>{totalPrice} TND</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>{totalPrice} TND</span>
                        </div>
                    </div>
                    {/* Sticky footer for actions inside scrollable area */}
                    <div className="sticky bottom-0 left-0 right-0 bg-background pt-4 pb-6 z-10 flex flex-col md:flex-row gap-2">
                        <Button variant="outline" onClick={onClose} className="w-full md:w-auto">Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!selectedDate || !selectedTime || !selectedGym} 
                            className="w-full md:w-auto"
                        >
                            Book & Pay
                        </Button>
                    </div>
                </div>
            </DialogContent>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                    amount={totalPrice}
                    itemName={`Private Session with ${coachName}`}
                    type="coach_booking"
                />
            )}

            {paymentPending && bookingData && (
                <PaymentPendingModal
                    isOpen={paymentPending}
                    onClose={handlePaymentPendingClose}
                    notification={{
                        amount: totalPrice,
                        itemName: `Private Session with ${coachName}`,
                        gymName: selectedGym?.name || 'Selected Gym',
                        deadline: addHours(new Date(), 24).toISOString(), // 24 hours to complete payment
                        type: 'coach_booking',
                        metadata: {
                            type: 'coach_booking',
                            amount: totalPrice,
                            itemName: `Private Session with ${coachName}`,
                            gymName: selectedGym?.name || 'Selected Gym',
                            deadline: addHours(new Date(), 24).toISOString(),
                            duration: `${duration} hour${duration > 1 ? 's' : ''}`,
                            coachName
                        } as any
                    }}
                />
            )}
        </Dialog>
    );
}