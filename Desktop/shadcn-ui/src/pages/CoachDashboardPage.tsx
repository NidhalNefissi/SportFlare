import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CoachDashboard } from '@/components/coach/CoachDashboard';
import { useCoachBookings } from '@/contexts/CoachBookingContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    bookings, 
    isLoading, 
    error, 
    fetchBookings, 
    updateBookingStatus, 
    rescheduleBooking 
  } = useCoachBookings();

  // Redirect if not a coach
  useEffect(() => {
    if (user && user.role !== 'coach') {
      toast({
        title: 'Access Denied',
        description: 'This page is only available to coaches.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status as any);
      // Refresh the bookings list
      fetchBookings();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const handleReschedule = async (bookingId: string, newDate: Date, newTime: string) => {
    try {
      await rescheduleBooking(bookingId, newDate, newTime);
      // Refresh the bookings list
      fetchBookings();
    } catch (err) {
      console.error('Failed to reschedule booking:', err);
    }
  };

  if (!user || user.role !== 'coach') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your private session requests and schedule
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/coach/availability')}>
              Manage Availability
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      <CoachDashboard 
        coachId={user.id}
        bookings={bookings}
        onStatusChange={handleStatusChange}
        onReschedule={handleReschedule}
      />
    </div>
  );
}
