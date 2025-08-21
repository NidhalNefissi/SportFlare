import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PrivateSessionBooking, BookingProposal, BookingStatus, PaymentStatus, Booking, ClassBooking, ProgramBooking } from '@/types/booking';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';

export interface BookingMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface BookingContextType {
  bookings: Booking[];
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'messagingEnabled' | 'ratingGiven' | 'createdAt' | 'updatedAt'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  submitProposal: (bookingId: string, changes: BookingProposal['changes'], message: string) => void;
  respondToProposal: (proposalId: string, accept: boolean, message?: string) => void;
  markSessionAsCompleted: (bookingId: string) => void;
  releasePayment: (bookingId: string) => void;
  submitRating: (bookingId: string, rating: number, feedback: string) => void;
  getMessages: (bookingId: string) => BookingMessage[];
  sendMessage: (bookingId: string, content: string) => Promise<void>;
  toggleMessaging: (bookingId: string, enabled: boolean) => Promise<void>;
  markMessagesAsRead: (bookingId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper function to get bookings from localStorage
const getStoredBookings = (userId: string): Booking[] => {
  try {
    const stored = localStorage.getItem(`bookings_${userId}`);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert string dates back to Date objects
    return parsed.map((booking: any) => ({
      ...booking,
      date: new Date(booking.date),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      ...(booking.type === 'program' ? {
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        sessions: booking.sessions?.map((session: any) => ({
          ...session,
          date: new Date(session.date)
        })) || []
      } : {})
    }));
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    return [];
  }
};

// Helper function to get messages from localStorage
const getStoredMessages = (userId: string): BookingMessage[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`sportflare_booking_messages_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save bookings to localStorage
const saveBookings = (userId: string, bookings: Booking[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Convert Date objects to ISO strings for storage
    const serializedBookings = bookings.map(booking => {
      const base = {
        ...booking,
        date: booking.date.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };

      if (booking.type === 'program') {
        return {
          ...base,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          sessions: booking.sessions.map(session => ({
            ...session,
            date: session.date.toISOString()
          }))
        };
      }
      return base;
    });

    localStorage.setItem(`bookings_${userId}`, JSON.stringify(serializedBookings));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
};

// Helper function to save messages to localStorage
const saveMessages = (userId: string, messages: BookingMessage[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`sportflare_booking_messages_${userId}`, JSON.stringify(messages));
  }
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookings and messages from localStorage when user changes
  useEffect(() => {
    if (user?.id) {
      const storedBookings = getStoredBookings(user.id);
      const storedMessages = getStoredMessages(user.id);
      setBookings(storedBookings);
      setMessages(storedMessages);
    } else {
      setBookings([]);
      setMessages([]);
    }
  }, [user?.id]);

  // Save bookings and messages to localStorage when they change
  useEffect(() => {
    if (user?.id) {
      saveBookings(user.id, bookings);
      saveMessages(user.id, messages);
    }
  }, [bookings, messages, user?.id]);

  // Helper to update a booking by ID
  const updateBooking = useCallback((bookingId: string, updates: Partial<PrivateSessionBooking>) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date() }
          : booking
      )
    );
  }, []);

  // Check if a booking can be auto-confirmed
  const canAutoConfirm = (booking: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'messagingEnabled' | 'ratingGiven' | 'createdAt' | 'updatedAt'>) => {
    // If autoConfirm is explicitly set to false, don't auto-confirm
    if (booking.autoConfirm === false) return false;

    // For classes and programs, check if there are available spots
    if ('maxParticipants' in booking && 'currentParticipants' in booking) {
      return booking.currentParticipants < (booking.maxParticipants || Infinity);
    }

    // For private sessions, check if payment is not required or already processed
    if ('requiresPayment' in booking) {
      // Since we're in the creation phase, we can assume payment is pending
      // unless the booking type explicitly doesn't require payment
      return !booking.requiresPayment;
    }

    // Default to not auto-confirming if we can't determine
    return false;
  };

  // Create a new booking
  const createBooking = useCallback((bookingData: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'messagingEnabled' | 'ratingGiven' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in to create a booking');

    const now = new Date();
    const shouldAutoConfirm = canAutoConfirm(bookingData);

    // Create the base booking object
    const newBooking: Booking = {
      ...bookingData,
      id: uuidv4(),
      status: shouldAutoConfirm ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      paymentStatus: 'pending',
      messagingEnabled: true,
      ratingGiven: false,
      currentParticipants: (bookingData.currentParticipants || 0) + (shouldAutoConfirm ? 1 : 0),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setBookings(prev => [...prev, newBooking]);

    // Notify relevant parties based on booking type and status
    // For private session bookings, always notify the coach
    if ('coachId' in newBooking && newBooking.type === 'private') {
      try {
        // Format the date and time for the notification
        const bookingDate = newBooking.date ? format(new Date(newBooking.date), 'MMMM do, yyyy') : 'a future date';
        const bookingTime = newBooking.time || 'a specific time';
        const gymName = (newBooking as any).gymName || 'the gym';
        const memberName = user?.name || 'a member';
        const notificationTitle = shouldAutoConfirm ? 'New Booking' : 'New Booking Request';
        const notificationMessage = shouldAutoConfirm 
          ? `${memberName} has booked a private session with you on ${bookingDate} at ${bookingTime} at ${gymName}.`
          : `You have a new booking request from ${memberName} for a private session on ${bookingDate} at ${bookingTime} at ${gymName}.`;

        // Send notification to coach
        addNotification({
          userId: newBooking.coachId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'coach_booking',
          isRead: false,
          actionType: 'modal',
          actionData: {
            modalType: 'coach',
            entityId: newBooking.coachId,
            metadata: {
              bookingId: newBooking.id,
              sessionDate: bookingDate,
              sessionTime: bookingTime,
              gymName: gymName,
              userName: memberName,
              status: shouldAutoConfirm ? 'confirmed' : 'pending'
            }
          }
        });

        // Notify user of their booking status
        addNotification({
          userId: newBooking.userId,
          title: shouldAutoConfirm ? 'Booking Confirmed' : 'Booking Request Sent',
          message: shouldAutoConfirm 
            ? `Your private session has been confirmed for ${newBooking.date ? format(newBooking.date, 'MMMM do, yyyy') : 'the scheduled date'} at ${newBooking.time || 'the scheduled time'}.`
            : 'Your booking request has been sent. You will be notified when the coach responds.',
          type: 'booking',
          isRead: false,
          actionType: 'navigate',
          actionData: { route: `/bookings/${newBooking.id}` }
        });
      } catch (error) {
        console.error('Error sending booking notifications:', error);
      }
    }

    return newBooking;
  }, [user, addNotification]);

  // Update booking status
  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    updateBooking(bookingId, { status });

    // Notify the other party about status change
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const targetUserId = booking.userId === user?.id ? booking.coachId : booking.userId;
    const statusMessage = {
      [BookingStatus.CONFIRMED]: 'has been confirmed',
      [BookingStatus.CANCELLED]: 'has been cancelled',
      [BookingStatus.COMPLETED]: 'has been marked as completed',
      [BookingStatus.REJECTED]: 'has been rejected',
    }[status as BookingStatus] || 'has been updated';

    addNotification({
      userId: targetUserId,
      title: 'Booking Update',
      message: `Your session ${statusMessage}.`,
      type: 'coach_booking',
      isRead: false,
      actionType: 'modal',
      actionData: {
        modalType: 'coach', // Using 'coach' as the modal type since it's the closest match
        entityId: booking.coachId,
        metadata: { bookingId, status }
      }
    });
  }, [updateBooking, bookings, user, addNotification]);

  // Cancel a booking
  const cancelBooking = useCallback((bookingId: string, reason?: string) => {
    updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    // TODO: Handle payment refund if needed
  }, [updateBookingStatus]);

  // Submit a proposal to modify a booking
  const submitProposal = useCallback((bookingId: string, changes: BookingProposal['changes'], message: string) => {
    if (!user) throw new Error('User must be logged in to submit a proposal');

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const proposal: BookingProposal = {
      id: uuidv4(),
      bookingId,
      proposedBy: user.id === booking.userId ? 'user' : 'coach',
      changes: {
        ...changes,
        message,
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update booking with the proposal
    updateBooking(bookingId, {
      status: BookingStatus.MODIFIED,
      proposedChanges: {
        ...changes,
        message,
      },
    });

    // Notify the other party
    const targetUserId = user.id === booking.userId ? booking.coachId : booking.userId;
    addNotification({
      userId: targetUserId,
      title: 'Booking Modification Request',
      message: `You have a modification request for your session.`,
      type: 'booking' as NotificationType,
      isRead: false,
      actionType: 'modal',
      actionData: {
        modalType: 'coach', // Using 'coach' as the modal type since it's the closest match
        entityId: user.id === booking.userId ? booking.coachId : booking.userId,
        metadata: { bookingId, proposal: true }
      }
    });

    return proposal;
  }, [user, bookings, updateBooking, addNotification]);

  // Respond to a proposal
  const respondToProposal = useCallback((proposalId: string, accept: boolean, message?: string) => {
    // Implementation depends on your UI/UX for handling proposals
    // This is a simplified version
    console.log(`Proposal ${proposalId} ${accept ? 'accepted' : 'rejected'}`, message);
  }, []);

  // Mark a session as completed
  const markSessionAsCompleted = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    updateBooking(bookingId, {
      status: BookingStatus.COMPLETED,
      paymentStatus: 'held', // Payment is now held until released
      updatedAt: new Date()
    });

    // Notify the user
    addNotification({
      userId: booking.userId,
      title: 'Session Completed',
      message: `Your session with ${booking.coachName || 'your coach'} has been marked as completed.`,
      type: 'booking' as NotificationType,
      isRead: false,
      actionType: 'navigate',
      actionData: { route: `/bookings/${bookingId}` }
    });

    // Also notify the coach
    addNotification({
      userId: booking.coachId,
      title: 'Session Completed',
      message: `Your session with ${user?.name || 'the user'} has been marked as completed.`,
      type: 'booking' as NotificationType,
      isRead: false,
      actionType: 'navigate',
      actionData: { route: `/coach/bookings/${bookingId}` }
    });
  }, [bookings, updateBooking, addNotification, user?.name]);

  // Release payment to the coach
  const releasePayment = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    updateBooking(bookingId, {
      paymentStatus: 'released',
      updatedAt: new Date()
    });

    // Notify the coach
    addNotification({
      userId: booking.coachId,
      title: 'Payment Released',
      message: `Payment of $${booking.price} for your session has been released to your account.`,
      type: 'payment' as NotificationType,
      isRead: false,
      actionType: 'navigate',
      actionData: { route: '/coach/earnings' }
    });

    // Notify the user
    addNotification({
      userId: booking.userId,
      title: 'Payment Processed',
      message: `Payment for your session with ${booking.coachName || 'your coach'} has been processed.`,
      type: 'payment' as NotificationType,
      isRead: false,
      actionType: 'navigate',
      actionData: { route: `/bookings/${bookingId}` }
    });
  }, [bookings, updateBooking, addNotification]);

  // Submit a rating for a completed session
  const submitRating = useCallback((bookingId: string, rating: number, feedback: string) => {
    if (!user) throw new Error('User must be logged in to submit a rating');

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const isCoach = user.id === booking.coachId;
    const updates: Partial<PrivateSessionBooking> = {
      updatedAt: new Date()
    };

    // Type guard to check if booking has coachRating property
    const hasCoachRating = (b: Booking): b is PrivateSessionBooking | ClassBooking => {
      return 'coachRating' in b;
    };

    if (isCoach) {
      if (hasCoachRating(booking)) {
        updates.coachRating = rating;
        updates.coachFeedback = feedback;
      }
    } else {
      updates.userRating = rating;
      updates.userFeedback = feedback;

      // If user is rating and coach has already rated, release payment
      if (hasCoachRating(booking) && booking.coachRating !== undefined) {
        releasePayment(bookingId);
      }
    }

    // Check if both parties have rated
    const bothRated = (isCoach && booking.userRating !== undefined) ||
      (!isCoach && hasCoachRating(booking) && booking.coachRating !== undefined);

    if (bothRated) {
      updates.ratingGiven = true;

      // Notify both parties
      const notificationTitle = 'Session Feedback Complete';
      const notificationMessage = 'Both you and your coach have rated the session. Thank you!';

      [booking.userId, booking.coachId].forEach(userId => {
        if (userId !== user.id) {
          addNotification({
            userId,
            title: notificationTitle,
            message: notificationMessage,
            type: 'system' as NotificationType,
            isRead: false,
            actionType: 'navigate',
            actionData: { route: `/bookings/${bookingId}` }
          });
        }
      });
    }

    updateBooking(bookingId, updates);
  }, [user, bookings, updateBooking, addNotification, releasePayment]);

  // Helper to get bookings by status
  const getBookingsByStatus = useCallback((status: BookingStatus | string) => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  // Get a single booking by ID
  const getBookingById = useCallback((id: string) => {
    return bookings.find(booking => booking.id === id);
  }, [bookings]);

  // Get messages for a booking
  const getMessages = useCallback((bookingId: string): BookingMessage[] => {
    return messages.filter((msg): msg is BookingMessage => msg.bookingId === bookingId);
  }, [messages]);

  const sendMessage = useCallback(async (bookingId: string, content: string) => {
    if (!user) return;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const newMessage: BookingMessage = {
      id: uuidv4(),
      bookingId,
      senderId: user.id,
      senderName: user.name || 'Unknown',
      senderAvatar: user.avatar,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Notify the other user
    const recipientId = user.id === booking.userId ? booking.coachId : booking.userId;
    if (recipientId) {
      addNotification({
        id: uuidv4(),
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message about your booking with ${user.id === booking.userId ? booking.coachName : booking.userName}`,
        read: false,
        timestamp: new Date().toISOString(),
        link: `/my-bookings?bookingId=${bookingId}`
      });
    }
  }, [user, bookings, addNotification]);

  const toggleMessaging = useCallback(async (bookingId: string, enabled: boolean) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, messagingEnabled: enabled }
          : booking
      )
    );

    // Notify the other user
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && user) {
      const recipientId = user.id === booking.userId ? booking.coachId : booking.userId;
      if (recipientId) {
        const otherPartyName = user.id === booking.userId ? 'the coach' : 'the user';
        addNotification({
          userId: recipientId,
          type: 'booking',
          title: 'Messaging ' + (enabled ? 'Enabled' : 'Disabled'),
          message: `Messaging has been ${enabled ? 'enabled' : 'disabled'} for your booking with ${otherPartyName}`,
          isRead: false,
          actionType: 'navigate',
          actionData: {
            route: `/my-bookings?bookingId=${bookingId}`,
            metadata: { bookingId }
          }
        });
      }
    }
  }, [bookings, user, addNotification]);

  const markMessagesAsRead = useCallback((bookingId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.bookingId === bookingId && !msg.isRead
          ? { ...msg, isRead: true }
          : msg
      )
    );
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        getBookingsByStatus,
        getBookingById,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        submitProposal,
        respondToProposal,
        markSessionAsCompleted,
        releasePayment,
        submitRating,
        getMessages,
        sendMessage,
        toggleMessaging,
        markMessagesAsRead,
        isLoading,
        error: error || null,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
