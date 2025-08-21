import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import apiService from '@/services/api/apiService';
import { Class } from '@/types';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface ClassBookingFormProps {
  classData: Class;
  onBookingComplete?: () => void;
}

export default function ClassBookingForm({ classData, onBookingComplete }: ClassBookingFormProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isClassFull = classData.enrolled >= classData.capacity;
  const isUserEnrolled = user?.enrolledClasses?.some(enrollment => 
    enrollment.classId === classData.id && 
    ['booked', 'checked-in'].includes(enrollment.status)
  );

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please log in to book a class');
      navigate('/login', { state: { redirectTo: `/classes/${classData.id}` } });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createBooking({
        userId: user.id,
        userName: user.name,
        classId: classData.id,
        className: classData.title,
        coachId: classData.coachId,
        coachName: classData.coach.name,
        gymId: classData.gymId,
        gymName: classData.gym.name,
        date: classData.date,
        duration: classData.duration,
        price: classData.price,
        status: 'booked',
        paymentStatus: 'completed',
        paymentMethod: 'credit_card'
      });

      toast.success('Class booked successfully!');
      setIsOpen(false);
      
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error) {
      console.error('Error booking class:', error);
      toast.error('Failed to book the class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  const formatEndTime = (date: Date, durationMinutes: number) => {
    const endTime = new Date(new Date(date).getTime() + durationMinutes * 60000);
    return format(endTime, 'h:mm a');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={isClassFull || isUserEnrolled} 
          className="w-full"
        >
          {isClassFull ? 'Class Full' : isUserEnrolled ? 'Already Enrolled' : 'Book Now'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {classData.title}</DialogTitle>
          <DialogDescription>
            Confirm your booking for this class.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatDate(classData.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatTime(classData.date)} - {formatEndTime(classData.date, classData.duration)}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{classData.enrolled} / {classData.capacity} enrolled</span>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <Label className="block mb-1">Coach</Label>
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-2">
                {classData.coach.avatar ? (
                  <img 
                    src={classData.coach.avatar} 
                    alt={classData.coach.name} 
                    className="h-6 w-6 rounded-full" 
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {classData.coach.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <span>{classData.coach.name}</span>
            </div>
          </div>
          
          <div>
            <Label className="block mb-1">Location</Label>
            <div className="text-sm">{classData.gym.name}</div>
            <div className="text-sm text-muted-foreground">{classData.gym.address}</div>
          </div>
          
          <div>
            <Label className="block mb-1">Price</Label>
            <div className="text-xl font-bold">${classData.price.toFixed(2)}</div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}