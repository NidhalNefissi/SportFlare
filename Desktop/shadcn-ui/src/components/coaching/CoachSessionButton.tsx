import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface CoachSessionButtonProps {
  coach: {
    id: string;
    name: string;
    rate: number;
    gyms: Array<{
      id: string;
      name: string;
      address: string;
    }>;
  };
}

export function CoachSessionButton({ coach }: CoachSessionButtonProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(1);
  const [selectedGym, setSelectedGym] = useState(coach.gyms[0]);
  const [isOpen, setIsOpen] = useState(false);
  
  const { openPayment, PaymentModal } = usePaymentFlow({
    onSuccess: (paymentMethod) => {
      // Handle successful coach session booking
      console.log(`Booked session with ${coach.name} using ${paymentMethod}`);
      setIsOpen(false);
    },
  });

  const handleBookSession = () => {
    const totalAmount = coach.rate * duration;
    
    openPayment({
      amount: totalAmount,
      itemName: `Private Session with ${coach.name}`,
      type: 'coach_session',
      gymName: selectedGym.name,
      metadata: {
        coachId: coach.id,
        coachName: coach.name,
        dateTime: date?.toISOString(),
        duration,
        gym: selectedGym
      }
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        Book & Pay
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Private Session</DialogTitle>
            <DialogDescription>
              Schedule a session with {coach.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Select Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label>Session Duration (hours)</Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label>Select Gym</Label>
              <select
                value={selectedGym.id}
                onChange={(e) => {
                  const gym = coach.gyms.find(g => g.id === e.target.value);
                  if (gym) setSelectedGym(gym);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {coach.gyms.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{(coach.rate * duration).toFixed(2)} TND</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {duration} hour session @ {coach.rate} TND/hour
              </p>
            </div>
            
            <Button 
              onClick={handleBookSession}
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
            >
              Book & Pay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <PaymentModal />
    </>
  );
}

// Add missing Dialog components
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ children, className }: any) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

function DialogHeader({ children }: any) {
  return (
    <div className="mb-6">
      {children}
    </div>
  );
}

function DialogTitle({ children }: any) {
  return (
    <h3 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h3>
  );
}

function DialogDescription({ children }: any) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}
