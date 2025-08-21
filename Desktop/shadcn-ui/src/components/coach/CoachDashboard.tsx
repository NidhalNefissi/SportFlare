import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { PrivateSessionBooking } from '@/types/booking';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

interface CoachDashboardProps {
  coachId: string;
  bookings: PrivateSessionBooking[];
  onStatusChange: (bookingId: string, status: BookingStatus) => Promise<void>;
  onReschedule: (bookingId: string, newDate: Date, newTime: string) => Promise<void>;
}

export function CoachDashboard({
  coachId,
  bookings,
  onStatusChange,
  onReschedule
}: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toast } = useToast();

  // Filter bookings based on status
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && 
    isAfter(new Date(`${booking.date}T${booking.time}`), new Date())
  );

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    (booking.status === 'confirmed' && isBefore(new Date(`${booking.date}T${booking.time}`), new Date()))
  );

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await onStatusChange(bookingId, status);
      toast({
        title: 'Success',
        description: `Booking ${status} successfully`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Private Session Requests</h2>
        <Badge variant="outline" className="px-3 py-1">
          {bookings.length} total sessions
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No upcoming sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No past sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BookingCardProps {
  booking: PrivateSessionBooking;
  onStatusChange: (bookingId: string, status: BookingStatus) => Promise<void>;
}

function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const sessionDate = new Date(`${booking.date}T${booking.time}`);
  const isPast = isBefore(sessionDate, new Date());
  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const isCompleted = booking.status === 'completed';

  const handleStatusUpdate = async (status: BookingStatus) => {
    setIsLoading(true);
    try {
      await onStatusChange(booking.id, status);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {booking.userName}'s Session
            </CardTitle>
            <CardDescription className="text-sm">
              {format(sessionDate, 'PPP')} • {booking.time}
            </CardDescription>
          </div>
          <Badge 
            variant={
              isPending ? 'outline' : 
              isConfirmed ? 'default' : 
              isCompleted ? 'secondary' : 'destructive'
            }
          >
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {booking.duration} min • {booking.locationType}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {booking.gymName || 'Online Session'}
            </span>
          </div>
          {booking.notes && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Notes:</span> {booking.notes}
              </p>
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={isLoading}
            >
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isLoading}
            >
              Reject
            </Button>
          </div>
        )}

        {isConfirmed && !isPast && (
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              className="w-full"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isLoading}
            >
              Mark as Completed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
