import React, { useState } from 'react';
import { useBooking } from '@/context/BookingContext';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Clock, MapPin, MessageSquare, ChevronRight, X, Check } from 'lucide-react';
import { BookingStatus } from '@/types/booking';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BookingDetail } from '../booking/BookingDetail';

export default function UserBookings() {
  const { user } = useUser();
  const { bookings, getBookingsByStatus, respondToProposal, cancelBooking } = useBooking();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Get bookings by status
  const pendingBookings = getBookingsByStatus('pending').filter(
    booking => booking.type === 'private' || booking.type === 'class'
  );
  const confirmedBookings = getBookingsByStatus('confirmed');
  const modifiedBookings = getBookingsByStatus('modified');
  const upcomingBookings = [...confirmedBookings, ...modifiedBookings]
    .filter(booking => booking.type === 'private' || booking.type === 'class')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedBookings = getBookingsByStatus('completed').filter(
    booking => booking.type === 'private' || booking.type === 'class'
  );
  const cancelledBookings = getBookingsByStatus('cancelled').filter(
    booking => booking.type === 'private' || booking.type === 'class'
  );

  // Handle booking actions
  const handleAcceptProposal = (proposalId: string) => {
    respondToProposal(proposalId, true);
    setActiveTab('upcoming');
  };
  
  const handleRejectProposal = (proposalId: string) => {
    respondToProposal(proposalId, false);
    setActiveTab('upcoming');
  };
  
  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(bookingId, 'User cancelled the booking');
      setActiveTab('cancelled');
    }
  };
  
  const handleOpenBooking = (bookingId: string) => {
    setSelectedBooking(bookingId);
  };
  
  const handleCloseBooking = () => {
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: BookingStatus) => ({
    pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    confirmed: { label: 'Confirmed', variant: 'bg-green-100 text-green-800 hover:bg-green-100' },
    modified: { label: 'Modification Requested', variant: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    completed: { label: 'Completed', variant: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    cancelled: { label: 'Cancelled', variant: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    rejected: { label: 'Rejected', variant: 'bg-red-100 text-red-800 hover:bg-red-100' },
  }[status] || { label: status, variant: 'bg-gray-100 text-gray-800 hover:bg-gray-100' });

  const renderBookingCard = (booking: any) => {
    const statusInfo = getStatusBadge(booking.status as BookingStatus);
    const isUpcoming = ['confirmed', 'modified'].includes(booking.status);
    const isPast = ['completed', 'cancelled', 'rejected'].includes(booking.status);
    
    // For private sessions, show coach name in the title
    const getBookingTitle = () => {
      if (booking.type === 'private') {
        return `Private Session with ${booking.coachName || 'Coach'}`;
      }
      return booking.className || 'Session';
    };
    
    return (
      <Card 
        key={booking.id} 
        className="mb-4 hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => handleOpenBooking(booking.id)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {getBookingTitle()}
                </CardTitle>
                <div className="flex items-center">
                  {booking.unreadCount > 0 && (
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <CardDescription className="mt-1 flex items-center">
                <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')} at {booking.time}</span>
                {booking.messagingEnabled && booking.unreadCount > 0 && (
                  <span className="ml-2 flex items-center text-sm text-primary">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {booking.unreadCount} new
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge className={`${statusInfo.variant} capitalize`}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}</span>
            </div>
            {booking.gymName && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{booking.gymName}</span>
              </div>
            )}
            <div className="flex items-center text-sm font-medium">
              ${typeof booking.price === 'number' ? booking.price.toFixed(2) : booking.price}
            </div>
            </div>
            <div className="space-y-2">
              {booking.type === 'class' || booking.type === 'program' ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">Type:</span>
                  <span className="ml-1 capitalize">
                    {booking.type === 'private' ? 'Private Session' : booking.type}
                  </span>
                </div>
              ) : booking.coachName && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">Coach:</span>
                  <span className="ml-1">{booking.coachName}</span>
                </div>
              )}
              {booking.proposedChanges && booking.status === 'modified' && (
                <div 
                  className="bg-blue-50 p-3 rounded-md border border-blue-100"
                  onClick={e => e.stopPropagation()}
                >
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Coach's Proposed Changes:</h4>
                  <div className="space-y-1">
                    {booking.proposedChanges.date && (
                      <p className="text-xs">
                        <span className="font-medium">New Date:</span> {format(new Date(booking.proposedChanges.date), 'MMM d, yyyy')}
                      </p>
                    )}
                    {booking.proposedChanges.time && (
                      <p className="text-xs"><span className="font-medium">New Time:</span> {booking.proposedChanges.time}</p>
                    )}
                    {booking.proposedChanges.duration && (
                      <p className="text-xs">
                        <span className="font-medium">New Duration:</span> {booking.proposedChanges.duration} hours
                      </p>
                    )}
                    {booking.proposedChanges.message && (
                      <p className="text-xs mt-2 italic border-t border-blue-100 pt-2">
                        "{booking.proposedChanges.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectProposal(booking.id);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" /> Reject Changes
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptProposal(booking.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Booking ID: {booking.id.slice(0, 8)}...
          </div>
          <div className="space-x-2">
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(booking.id);
                }}
              >
                {booking.status === 'pending' ? 'Cancel Request' : 'Cancel Booking'}
              </Button>
            )}
            {booking.messagingEnabled ? (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBooking(booking.id);
                  // Auto-open messages tab when clicking message button
                  setTimeout(() => {
                    const messagesTab = document.querySelector('[data-value="messages"]') as HTMLElement;
                    messagesTab?.click();
                  }, 100);
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Message
              </Button>
            ) : booking.status === 'confirmed' && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle enable messaging
                  // This would be implemented in the BookingDetail component
                  handleOpenBooking(booking.id);
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Enable Messaging
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <BookingDetail 
              bookingId={selectedBooking} 
              onBack={() => setSelectedBooking(null)} 
              showChat={true} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No upcoming bookings</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No pending bookings</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            completedBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No completed bookings</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map(renderBookingCard)
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No cancelled bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
