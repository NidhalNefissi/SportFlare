import React, { useState, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Clock, MapPin, Check, X, Edit, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BookingDetailsDialog from './BookingDetailsDialog';
import { BookingStatus } from '@/types/booking';

type BookingStatus = 'pending' | 'confirmed' | 'modified' | 'completed' | 'cancelled' | 'rejected';

const CoachBookings = () => {
  const { user } = useUser();
  const { bookings, getBookingsByStatus, updateBookingStatus, submitProposal, getBookingById } = useBooking();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [proposedDuration, setProposedDuration] = useState(1);

  // Check for booking ID in URL params
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      const booking = getBookingById(bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, getBookingById]);

  const handleOpenDialog = (booking: any) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    // Update URL without page reload
    setSearchParams({ bookingId: booking.id });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBooking(null);
    // Clear booking ID from URL
    setSearchParams({});
  };

  // Get bookings by status
  const pendingBookings = getBookingsByStatus(BookingStatus.PENDING);
  const confirmedBookings = getBookingsByStatus(BookingStatus.CONFIRMED);
  const modifiedBookings = getBookingsByStatus(BookingStatus.MODIFIED);
  const completedBookings = getBookingsByStatus(BookingStatus.COMPLETED);
  const cancelledBookings = getBookingsByStatus(BookingStatus.CANCELLED);
  const rejectedBookings = getBookingsByStatus(BookingStatus.REJECTED);

  // Handle booking actions
  const handleAccept = (bookingId: string) => updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
  const handleReject = (bookingId: string) => updateBookingStatus(bookingId, BookingStatus.REJECTED);
  
  const handleStartEdit = (booking: any) => {
    setEditingBookingId(booking.id);
    setProposedDate(format(new Date(booking.date), 'yyyy-MM-dd'));
    setProposedTime(booking.time);
    setProposedDuration(booking.duration);
    setProposalMessage('I would like to suggest the following changes to your booking:');
  };

  const handleSubmitProposal = (bookingId: string) => {
    if (!proposalMessage.trim()) return;
    
    const changes: any = {};
    if (proposedDate) changes.date = new Date(proposedDate);
    if (proposedTime) changes.time = proposedTime;
    if (proposedDuration) changes.duration = proposedDuration;
    
    submitProposal(bookingId, changes, proposalMessage);
    setEditingBookingId(null);
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusMap = {
      [BookingStatus.DRAFT]: { label: 'Draft', variant: 'bg-gray-100 text-gray-800' },
      [BookingStatus.PENDING]: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
      [BookingStatus.CONFIRMED]: { label: 'Confirmed', variant: 'bg-green-100 text-green-800' },
      [BookingStatus.MODIFIED]: { label: 'Modified', variant: 'bg-blue-100 text-blue-800' },
      [BookingStatus.COMPLETED]: { label: 'Completed', variant: 'bg-purple-100 text-purple-800' },
      [BookingStatus.CANCELLED]: { label: 'Cancelled', variant: 'bg-red-100 text-red-800' },
      [BookingStatus.REJECTED]: { label: 'Rejected', variant: 'bg-gray-100 text-gray-800' },
      [BookingStatus.COUNTER_PROPOSED]: { label: 'Counter Proposed', variant: 'bg-orange-100 text-orange-800' },
      [BookingStatus.EXPIRED]: { label: 'Expired', variant: 'bg-gray-100 text-gray-800' },
      [BookingStatus.NO_SHOW]: { label: 'No Show', variant: 'bg-red-100 text-red-800' },
    } as const;
    return statusMap[status] || { label: status, variant: 'bg-gray-100 text-gray-800' };
  };

  const renderBookingCard = (booking: any) => {
    return (
      <Card 
        key={booking.id} 
        className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleOpenDialog(booking)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Session with {booking.userName || 'Client'}</CardTitle>
              <CardDescription className="mt-1">
                {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')} at {booking.time}
              </CardDescription>
            </div>
            <Badge className={`${getStatusBadge(booking.status as BookingStatus).variant} capitalize`}>
              {getStatusBadge(booking.status as BookingStatus).label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>{booking.duration} minutes</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{booking.gymName}</span>
              </div>
              <div className="flex items-center text-sm font-medium">
                {booking.price ? `${booking.price} TND` : 'Price not available'}
              </div>
            </div>
            
            {booking.proposedChanges && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Proposed Changes:</h4>
                {booking.proposedChanges.date && (
                  <p className="text-xs">Date: {format(new Date(booking.proposedChanges.date), 'MMM d, yyyy')}</p>
                )}
                {booking.proposedChanges.time && (
                  <p className="text-xs">Time: {booking.proposedChanges.time}</p>
                )}
                {booking.proposedChanges.duration && (
                  <p className="text-xs">Duration: {booking.proposedChanges.duration} minutes</p>
                )}
              </div>
            )}
          </div>

          {booking.status === 'pending' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => handleAccept(booking.id)}
              >
                <Check className="h-4 w-4 mr-2" /> Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleReject(booking.id)}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleStartEdit(booking)}
              >
                <Edit className="h-4 w-4 mr-2" /> Modify
              </Button>
            </div>
          )}

          {editingBookingId === booking.id && (
            <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Proposed Date</label>
                  <Input 
                    type="date" 
                    value={proposedDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Proposed Time</label>
                  <Input 
                    type="time" 
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
                  <Input 
                    type="number" 
                    min="30" 
                    step="30"
                    value={proposedDuration}
                    onChange={(e) => setProposedDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Message to Client</label>
                <Input 
                  type="text" 
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Explain the proposed changes..."
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingBookingId(null)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitProposal(booking.id)}
                  disabled={!proposalMessage.trim()}
                >
                  Send Proposal
                </Button>
              </div>
            </div>
          )}

          {booking.status === 'modified' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              >
                <Check className="h-4 w-4 mr-2" /> Accept Changes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => updateBookingStatus(booking.id, 'pending')}
              >
                <X className="h-4 w-4 mr-2" /> Keep Original
              </Button>
            </div>
          )}

          {(booking.status === 'confirmed' || booking.status === 'completed') && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
              {booking.status === 'confirmed' && (
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" /> Reschedule
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleSubmitProposalWrapper = (bookingId: string, changes: any, message: string) => {
    submitProposal(bookingId, changes, message);
    handleCloseDialog();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedBooking && (
        <BookingDetailsDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          booking={selectedBooking}
          onAccept={handleAccept}
          onReject={handleReject}
          onSubmitProposal={handleSubmitProposalWrapper}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">Manage your coaching sessions and availability</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
          <TabsTrigger value="modified">Modified ({modifiedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length > 0 ? (
            pendingBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending requests</h3>
              <p className="text-muted-foreground mt-1">Your pending booking requests will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No confirmed sessions</h3>
              <p className="text-muted-foreground mt-1">Your confirmed sessions will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="modified" className="mt-6">
          {modifiedBookings.length > 0 ? (
            modifiedBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/50">
              <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No modified sessions</h3>
              <p className="text-muted-foreground mt-1">Sessions with proposed changes will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachBookings;
