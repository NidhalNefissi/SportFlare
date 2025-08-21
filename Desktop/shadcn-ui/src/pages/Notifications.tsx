import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { Notification } from '@/types';
import { PaymentPendingModal } from '@/components/PaymentPendingModal';
import { useBooking } from '@/context/BookingContext';
import { BookingStatus } from '@/types/booking';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BellRing,
  Check,
  CheckCheck,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Clock,
  Info,
  Trash,
  Dumbbell,
  Filter,
  CreditCard,
  UserCheck,
  ExternalLink,
  X,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CoachProfileDialog from '@/components/CoachProfileDialog';
import { mockCoaches } from './Coaches';
import PrivateSessionBookingModal from '@/components/PrivateSessionBookingModal';

export default function NotificationsPage() {
  const { notifications, markAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'class' | 'order' | 'message' | 'program' | 'booking' | 'payment'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Modal states for actionable notifications
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [paymentNotification, setPaymentNotification] = useState<{
    isOpen: boolean;
    amount: number;
    itemName: string;
    gymName: string;
    deadline: string;
  } | null>(null);

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'read' && !notification.isRead) return false;
    if (filter === 'unread' && notification.isRead) return false;

    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    return true;
  });

  const { getBookingById } = useBooking();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Handle dialog open/close
  const handleOpenDialog = useCallback((booking: any) => {
    setSelectedBooking(booking);
    setIsBookingDialogOpen(true);
    // Update URL with booking ID for deep linking
    setSearchParams({ booking: booking.id });
  }, [setSearchParams]);

  const handleCloseDialog = useCallback(() => {
    setIsBookingDialogOpen(false);
    setSelectedBooking(null);
    // Clear booking ID from URL
    setSearchParams({});
  }, [setSearchParams]);

  // Handle notification click for actionable notifications
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle booking-related notifications
    if (notification.type === 'booking' && notification.actionData?.metadata?.bookingId) {
      try {
        const booking = getBookingById(notification.actionData.metadata.bookingId);
        if (!booking) {
          console.warn('Booking not found for notification:', notification);
          return;
        }

        const metadata = notification.actionData.metadata || {};
        const isPrivateSession = booking.type === 'private' || metadata.bookingType === 'private';
        
        // Always open the booking dialog for private sessions
        if (isPrivateSession) {
          const bookingWithContext = {
            ...booking,
            isModificationRequest: metadata.status === 'modification_requested',
            proposedChanges: metadata.changes || {},
            message: metadata.message || '',
            status: metadata.status || booking.status,
            // Ensure we have the latest status from the notification
            ...(metadata.status && { status: metadata.status })
          };
          
          setSelectedBooking(bookingWithContext);
          setIsBookingDialogOpen(true);
          
          // Show appropriate toast based on status
          if (metadata.status === 'accepted') {
            toast({
              title: 'Booking Confirmed',
              description: metadata.message || 'Your booking has been confirmed!',
              variant: 'default',
            });
          } else if (metadata.status === 'rejected') {
            // Show the booking dialog first with rejection details
            setIsBookingDialogOpen(true);
            
            // Then show the toast with the option to book again
            setTimeout(() => {
              toast({
                title: 'Booking Rejected',
                description: metadata.message || 'Your booking request has been rejected.',
                variant: 'destructive',
                action: (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const coach = mockCoaches.find(c => c.id === booking.coachId);
                      if (coach) {
                        setSelectedCoach(coach);
                        setIsCoachDialogOpen(true);
                      }
                    }}
                  >
                    Book Again
                  </Button>
                )
              });
            }, 100); // Small delay to ensure dialog is open first
          } else if (metadata.status === 'modification_requested') {
            // No need for a toast here as the dialog will show the modification request
          }
          return;
        }
        
        // Handle non-private session bookings or fallback
        if (metadata.status) {
          switch (metadata.status) {
            case 'modification_requested':
              setSelectedBooking({
                ...booking,
                isModificationRequest: true,
                proposedChanges: metadata.changes || {},
                message: metadata.message || ''
              });
              setIsBookingDialogOpen(true);
              break;
              
            case 'accepted':
              toast({
                title: 'Booking Confirmed',
                description: metadata.message || 'Your booking has been confirmed!',
                variant: 'default',
              });
              setSelectedBooking(booking);
              setIsBookingDialogOpen(true);
              break;
              
            case 'rejected':
              toast({
                title: 'Booking Rejected',
                description: metadata.message || 'Your booking request has been rejected.',
                variant: 'destructive',
                action: (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const coach = mockCoaches.find(c => c.id === booking.coachId);
                      if (coach) {
                        setSelectedCoach(coach);
                        setIsCoachDialogOpen(true);
                      }
                    }}
                  >
                    Book Again
                  </Button>
                )
              });
              break;
              
            default:
              setSelectedBooking(booking);
              setIsBookingDialogOpen(true);
          }
        } else {
          // Default behavior for booking notifications without a specific status
          setSelectedBooking(booking);
          setIsBookingDialogOpen(true);
        }
        return;
      } catch (error) {
        console.error('Error handling booking notification:', error);
        toast({
          title: 'Error',
          description: 'Failed to load booking details.',
          variant: 'destructive',
        });
      }
    }

    // Handle payment pending notifications
    if (notification.type === 'payment' || notification.actionData?.metadata?.type === 'payment_pending') {
      const metadata = notification.actionData?.metadata || {};
      const { amount, itemName, gymName, deadline } = metadata;

      // Set the payment notification state to open the modal
      setPaymentNotification({
        isOpen: true,
        amount: amount ? (typeof amount === 'string' ? parseFloat(amount) : amount) : 0,
        itemName: itemName || 'your purchase',
        gymName: gymName || 'the gym',
        deadline: deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      return;
    }

    // Handle other action types
    if (notification.actionType === 'navigate' && notification.actionData?.route) {
      navigate(notification.actionData.route);
    } else if (notification.actionType === 'modal' && notification.actionData?.modalType) {
      switch (notification.actionData.modalType) {
        case 'coach':
          const coach = mockCoaches.find(c => c.id === notification.actionData.entityId);
          if (coach) {
            setSelectedCoach(coach);
            setIsCoachDialogOpen(true);
          }
          break;
        // Add more modal types as needed
        default:
          console.log('Unknown modal type:', notification.actionData.modalType);
      }
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'class':
        return <Dumbbell className="h-4 w-4 text-green-500" />;
      case 'program':
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      case 'booking':
        return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-purple-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default:
        return <BellRing className="h-4 w-4" />;
    }
  };

  // Get notification badge variant based on type
  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return "default";
      case 'class':
        return "secondary";
      case 'program':
        return "secondary";
      case 'booking':
        return "default";
      case 'order':
        return "outline";
      case 'payment':
        return "outline";
      case 'message':
        return "destructive";
      default:
        return "outline";
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    filteredNotifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });

    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read."
    });
  };

  // Handle clear all notifications
  const handleClearAll = () => {
    clearAllNotifications();
    setShowClearDialog(false);

    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your fitness journey</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={!filteredNotifications.some(n => !n.isRead)}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={filteredNotifications.length === 0}>
                <Trash className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your current notifications.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge className="ml-2 bg-primary" variant="secondary">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="hidden md:flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="text-sm border-0 bg-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'system' | 'class' | 'order' | 'message' | 'program' | 'booking' | 'payment')}
          >
            <option value="all">All types</option>
            <option value="system">System</option>
            <option value="class">Classes</option>
            <option value="program">Programs</option>
            <option value="booking">Bookings</option>
            <option value="order">Orders</option>
            <option value="payment">Payments</option>
            <option value="message">Messages</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all cursor-pointer hover:shadow-md ${notification.isRead ? 'bg-card' : 'bg-muted/20 border-l-4 border-l-primary'} ${notification.actionType !== 'none' ? 'hover:bg-muted/10' : ''}`}
              onClick={(e) => {
                // Don't trigger card click if clicking on buttons, links, or other interactive elements
                const target = e.target as HTMLElement;
                const isInteractive = 
                  target instanceof HTMLButtonElement || 
                  target.closest('button') ||
                  target instanceof HTMLAnchorElement ||
                  target.closest('a');
                
                if (!isInteractive) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNotificationClick(notification);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className={`h-10 w-10 ${!notification.isRead ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <AvatarFallback>
                      {getNotificationIcon(notification.type)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
                            {notification.title}
                          </p>
                          {notification.actionType && notification.actionType !== 'none' && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant={getNotificationBadgeVariant(notification.type)}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(new Date(notification.createdAt))}
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No notifications</CardTitle>
            <CardDescription>
              {filter === 'all' && typeFilter === 'all'
                ? "You don't have any notifications yet."
                : "No notifications match your current filters."
              }
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedBooking.type === 'private' 
                  ? `Session with ${selectedBooking.coachName || 'Coach'}`
                  : selectedBooking.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedBooking.date), 'EEEE, MMMM d, yyyy')} at {selectedBooking.time}
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration</span>
                  <span className="text-sm">{selectedBooking.duration} minutes</span>
                </div>
                {selectedBooking.gymName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-sm">{selectedBooking.gymName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-sm">{selectedBooking.price ? `${selectedBooking.price} TND` : 'Price not available'}</span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.proposedChanges && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Proposed Changes:</h4>
                  {selectedBooking.proposedChanges.date && (
                    <p className="text-xs">
                      <span className="font-medium">Date:</span> {format(new Date(selectedBooking.proposedChanges.date), 'MMM d, yyyy')}
                    </p>
                  )}
                  {selectedBooking.proposedChanges.time && (
                    <p className="text-xs">
                      <span className="font-medium">Time:</span> {selectedBooking.proposedChanges.time}
                    </p>
                  )}
                  {selectedBooking.proposedChanges.duration && (
                    <p className="text-xs">
                      <span className="font-medium">Duration:</span> {selectedBooking.proposedChanges.duration} minutes
                    </p>
                  )}
                  {selectedBooking.proposedChanges.message && (
                    <div className="mt-2 p-2 bg-white rounded border text-xs">
                      <p className="font-medium text-yellow-800">Message:</p>
                      <p className="text-muted-foreground">{selectedBooking.proposedChanges.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedBooking.status === BookingStatus.PENDING && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Handle reject action
                      handleCloseDialog();
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      // Handle accept action
                      handleCloseDialog();
                    }}
                  >
                    Accept
                  </Button>
                </>
              )}
              {selectedBooking.status === BookingStatus.MODIFIED && selectedBooking.proposedChanges && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Handle reject changes
                      handleCloseDialog();
                    }}
                  >
                    Reject Changes
                  </Button>
                  <Button 
                    onClick={() => {
                      // Handle accept changes
                      handleCloseDialog();
                    }}
                  >
                    Accept Changes
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile filter */}
      <div className="md:hidden">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Filter by type</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <select
              className="w-full p-2 border rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'system' | 'class' | 'order' | 'message' | 'program' | 'booking' | 'payment')}
            >
              <option value="all">All types</option>
              <option value="system">System</option>
              <option value="class">Classes</option>
              <option value="program">Programs</option>
              <option value="booking">Bookings</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="message">Messages</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Modal Components for Actionable Notifications */}
      <CoachProfileDialog
        coach={selectedCoach}
        open={isCoachDialogOpen}
        onOpenChange={setIsCoachDialogOpen}
        onBookSession={() => {
          setIsCoachDialogOpen(false);
          setIsBookingModalOpen(true);
        }}
      />

      {selectedCoach && (
        <PrivateSessionBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          coachId={selectedCoach?.id || ''}
          coachName={selectedCoach?.name || 'the coach'}
          coachPrice={selectedCoach?.hourlyRate || 0}
          onSubmit={() => {
            setIsBookingModalOpen(false);
            toast({
              title: 'Session booked!',
              description: 'Your private session has been booked successfully.'
            });
          }}
        />
      )}

      {paymentNotification && (
        <PaymentPendingModal
          isOpen={paymentNotification.isOpen}
          onClose={() => setPaymentNotification(null)}
          notification={{
            amount: paymentNotification.amount,
            itemName: paymentNotification.itemName,
            gymName: paymentNotification.gymName,
            deadline: paymentNotification.deadline
          }}
        />
      )}
    </div>
  );
}