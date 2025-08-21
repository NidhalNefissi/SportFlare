import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, MessageSquare, X, Check, Clock as ClockIcon, Star, Zap, CheckCircle, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBooking } from '@/context/BookingContext';
import { useUser } from '@/context/UserContext';
import { BookingStatus } from '@/types/booking';

type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded' | 'failed';
import { BookingChat } from './BookingChat';

interface BookingDetailProps {
  bookingId: string;
  onBack?: () => void;
  showChat?: boolean;
}

export function BookingDetail({ bookingId, onBack, showChat = true }: BookingDetailProps) {
  const { 
    getBookingById, 
    getMessages, 
    markMessagesAsRead, 
    markSessionAsCompleted, 
    releasePayment, 
    submitRating 
  } = useBooking();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('details');
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const booking = getBookingById(bookingId);
  const messages = getMessages(bookingId);
  
  // Mark messages as read when viewing the chat
  useEffect(() => {
    if (activeTab === 'messages' && messages.some(msg => !msg.isRead)) {
      markMessagesAsRead(bookingId);
    }
  }, [activeTab, bookingId, messages, markMessagesAsRead]);
  
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested booking could not be found.</p>
        <Button variant="outline" onClick={() => onBack?.() || navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  const isCoach = user?.id === booking.coachId;
  const otherUser = isCoach 
    ? { id: booking.userId, name: booking.userName, avatar: booking.userAvatar }
    : { id: booking.coachId, name: booking.coachName, avatar: booking.coachAvatar };
    
  const getStatusBadge = (status: string) => {
    const statusMap = {
      [BookingStatus.PENDING]: { label: 'Pending', variant: 'outline' },
      [BookingStatus.CONFIRMED]: { label: 'Confirmed', variant: 'default' },
      [BookingStatus.MODIFIED]: { label: 'Modified', variant: 'outline' },
      [BookingStatus.COMPLETED]: { label: 'Completed', variant: 'secondary' },
      [BookingStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' },
      [BookingStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
      // Fallback for any unexpected status
      default: { label: status, variant: 'outline' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.default;
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
  };
  
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusMap = {
      [PaymentStatus.PENDING]: { label: 'Payment Pending', variant: 'outline' },
      [PaymentStatus.PAID]: { label: 'Paid', variant: 'default' },
      [PaymentStatus.REFUNDED]: { label: 'Refunded', variant: 'secondary' },
      [PaymentStatus.FAILED]: { label: 'Payment Failed', variant: 'destructive' },
      [PaymentStatus.HELD]: { label: 'Payment Held', variant: 'secondary' },
      [PaymentStatus.RELEASED]: { label: 'Payment Released', variant: 'default' },
    };
    
    const { label, variant } = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' };
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isCoach ? 'Session with ' : 'Your Session with '}
            <span className="text-primary">{isCoach ? booking.userName : booking.coachName}</span>
          </h2>
          <p className="text-muted-foreground">
            {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')} • {booking.time}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(booking.status)}
          {getPaymentStatusBadge(booking.paymentStatus)}
          
          {/* Action Buttons */}
          {isCoach && booking.status === 'confirmed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markSessionAsCompleted(bookingId)}
              className="ml-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}
          
          {!isCoach && booking.status === 'completed' && booking.paymentStatus === 'held' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => releasePayment(bookingId)}
              className="ml-2"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Release Payment
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          {showChat && (
            <TabsTrigger value="messages">
              Messages
              {messages.some(m => !m.isRead) && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </TabsTrigger>
          )}
          {booking.status === 'completed' && !booking.ratingGiven && (
            <TabsTrigger value="rating">Leave Feedback</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session Details</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-normal text-muted-foreground">
                    {booking.duration} min • {booking.sessionType}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}<br />
                      {booking.time} ({booking.duration} minutes)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.location || 'Online Session'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{isCoach ? 'Client' : 'Coach'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isCoach ? booking.userName : booking.coachName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {booking.notes}
                  </p>
                </div>
              )}
              
              {booking.proposal && booking.status === BookingStatus.PENDING && !isCoach && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Coach's Proposal</h4>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Your Response
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {booking.proposal.changes.date && (
                      <p>• <span className="font-medium">New Date:</span> {format(new Date(booking.proposal.changes.date), 'EEEE, MMMM d, yyyy')}</p>
                    )}
                    {booking.proposal.changes.time && (
                      <p>• <span className="font-medium">New Time:</span> {booking.proposal.changes.time}</p>
                    )}
                    {booking.proposal.changes.duration && (
                      <p>• <span className="font-medium">New Duration:</span> {booking.proposal.changes.duration} minutes</p>
                    )}
                    {booking.proposal.changes.location && (
                      <p>• <span className="font-medium">New Location:</span> {booking.proposal.changes.location}</p>
                    )}
                    {booking.proposal.message && (
                      <div className="mt-2 p-3 bg-background rounded-md">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Message from {booking.coachName}:</span> {booking.proposal.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back to List
                </Button>
              )}
              {showChat && booking.messagingEnabled && (
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('messages')}
                  className="flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {messages.some(m => !m.isRead) ? 'View New Messages' : 'Send Message'}
                </Button>
              )}
              {!booking.messagingEnabled && user?.id === booking.coachId && (
                <Button 
                  variant="outline" 
                  onClick={() => {/* TODO: Implement enable messaging */}}
                >
                  Enable Messaging
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {showChat && (
          <TabsContent value="messages" className="mt-6">
            <BookingChat 
              bookingId={bookingId}
              otherUser={{
                id: isCoach ? booking.userId : booking.coachId,
                name: isCoach ? booking.userName : booking.coachName,
                avatar: isCoach ? booking.userAvatar : booking.coachAvatar
              }}
              messages={messages}
              isMessagingEnabled={booking.messagingEnabled}
            />
          </TabsContent>
        )}
        
        {booking.status === 'completed' && !booking.ratingGiven && (
          <TabsContent value="rating" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Your Experience</CardTitle>
                <CardDescription>
                  {isCoach 
                    ? `How was your session with ${booking.userName}?`
                    : `How was your session with ${booking.coachName}?`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => !isRatingSubmitted && setRating(star)}
                        className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        disabled={isRatingSubmitted}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                      {isCoach ? 'Feedback for the user' : 'Share your experience (optional)'}
                    </label>
                    <textarea
                      id="feedback"
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      disabled={isRatingSubmitted}
                      placeholder={isCoach 
                        ? 'Share feedback about the session...' 
                        : 'What did you like about the session? Any suggestions for improvement?'
                      }
                    />
                  </div>
                  
                  {!isRatingSubmitted ? (
                    <Button 
                      onClick={async () => {
                        if (rating > 0) {
                          setIsSubmitting(true);
                          try {
                            await submitRating(bookingId, rating, feedback);
                            setIsRatingSubmitted(true);
                          } catch (error) {
                            console.error('Error submitting rating:', error);
                          } finally {
                            setIsSubmitting(false);
                          }
                        }
                      }}
                      disabled={rating === 0 || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                  ) : (
                    <div className="p-3 text-center text-green-600 bg-green-50 rounded-md">
                      <CheckCircle className="inline-block w-5 h-5 mr-2" />
                      Thank you for your feedback!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
