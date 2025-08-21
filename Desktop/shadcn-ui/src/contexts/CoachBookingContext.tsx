import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PrivateSessionBooking, BookingStatus } from '@/types/booking';

interface CoachBookingContextType {
  bookings: PrivateSessionBooking[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  rescheduleBooking: (bookingId: string, newDate: Date, newTime: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

const CoachBookingContext = createContext<CoachBookingContextType | undefined>(undefined);

export function CoachBookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<PrivateSessionBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch coach's private session bookings
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to fetch the coach's bookings
      // const response = await fetch(`/api/coaches/${user.id}/bookings`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockBookings: PrivateSessionBooking[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          type: 'private',
          title: 'Private Training Session',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          time: '14:00',
          duration: 60,
          price: 50,
          currency: 'USD',
          paymentStatus: 'completed',
          status: 'pending',
          coachId: user.id,
          coachName: user.name || 'Coach',
          gymId: 'gym1',
          gymName: 'Fitness Center',
          locationType: 'in_person',
          notes: 'Focus on strength training',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Add more mock bookings as needed
      ];
      
      setBookings(mockBookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to update the booking status
      // await fetch(`/api/bookings/${bookingId}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status }),
      // });
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, updatedAt: new Date().toISOString() } 
          : booking
      ));
      
      // Show success message
      toast({
        title: 'Success',
        description: `Booking ${status} successfully`,
      });
      
      return true;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Reschedule a booking
  const rescheduleBooking = useCallback(async (bookingId: string, newDate: Date, newTime: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to reschedule the booking
      // await fetch(`/api/bookings/${bookingId}/reschedule`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ date: newDate.toISOString().split('T')[0], time: newTime }),
      // });
      
      // Update local state
      const dateStr = newDate.toISOString().split('T')[0];
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              date: dateStr, 
              time: newTime,
              updatedAt: new Date().toISOString() 
            } 
          : booking
      ));
      
      toast({
        title: 'Success',
        description: 'Booking rescheduled successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Failed to reschedule booking:', err);
      toast({
        title: 'Error',
        description: 'Failed to reschedule booking',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'cancelled');
  }, [updateBookingStatus]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id, fetchBookings]);

  const value = {
    bookings,
    isLoading,
    error,
    fetchBookings,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
  };

  return (
    <CoachBookingContext.Provider value={value}>
      {children}
    </CoachBookingContext.Provider>
  );
}

export const useCoachBookings = (): CoachBookingContextType => {
  const context = useContext(CoachBookingContext);
  if (context === undefined) {
    throw new Error('useCoachBookings must be used within a CoachBookingProvider');
  }
  return context;
};
