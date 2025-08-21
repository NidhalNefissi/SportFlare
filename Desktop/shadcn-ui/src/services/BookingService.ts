import { v4 as uuidv4 } from 'uuid';
import { addHours, addDays, isBefore, isAfter, differenceInHours, parseISO } from 'date-fns';
import { Booking, BookingStatus, BookingNotification, BookingProposal, PaymentStatus } from '@/types/booking';
import { MessageType, ConversationType } from '@/types/messaging';
import { Rating, RatingType } from '@/types/rating';
import { Order, OrderStatus } from '@/types/product';

class BookingService {
  private static instance: BookingService;
  
  // In-memory storage (replace with API calls in production)
  private bookings: Booking[] = [];
  private notifications: BookingNotification[] = [];
  
  private constructor() {}
  
  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }
  
  // ==================== Booking CRUD ====================
  
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> {
    const now = new Date();
    const booking: Booking = {
      ...bookingData,
      id: uuidv4(),
      status: bookingData.paymentStatus === 'completed' ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    
    this.bookings.push(booking);
    
    // Create notification
    await this.createNotification({
      userId: booking.userId,
      type: 'booking_created',
      bookingId: booking.id,
      bookingType: booking.type,
      title: 'Booking Created',
      message: `Your ${booking.type} booking for ${new Date(booking.date).toLocaleDateString()} has been created.`,
      read: false,
      createdAt: now,
    });
    
    return booking;
  }
  
  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.find(booking => booking.id === id);
  }
  
  async getBookingsByUser(userId: string, options: { status?: BookingStatus[]; type?: string } = {}): Promise<Booking[]> {
    let result = this.bookings.filter(booking => booking.userId === userId);
    
    if (options.status?.length) {
      result = result.filter(booking => options.status?.includes(booking.status));
    }
    
    if (options.type) {
      result = result.filter(booking => booking.type === options.type);
    }
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getBookingsByCoach(coachId: string, options: { status?: BookingStatus[]; type?: string } = {}): Promise<Booking[]> {
    let result = this.bookings.filter(booking => 
      (booking as any).coachId === coachId || // For private sessions
      (booking.type === 'class' && (booking as any).coachId === coachId) || // For classes
      (booking.type === 'program' && (booking as any).coachId === coachId) // For programs
    );
    
    if (options.status?.length) {
      result = result.filter(booking => options.status?.includes(booking.status));
    }
    
    if (options.type) {
      result = result.filter(booking => booking.type === options.type);
    }
    
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = this.bookings.findIndex(booking => booking.id === id);
    
    if (index === -1) return null;
    
    const updatedBooking = {
      ...this.bookings[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.bookings[index] = updatedBooking;
    
    // Create notification for status changes
    if (updates.status && updates.status !== this.bookings[index].status) {
      await this.createNotification({
        userId: updatedBooking.userId,
        type: `booking_${updates.status}` as any,
        bookingId: updatedBooking.id,
        bookingType: updatedBooking.type,
        title: `Booking ${updates.status.charAt(0).toUpperCase() + updates.status.slice(1)}`,
        message: `Your ${updatedBooking.type} booking for ${new Date(updatedBooking.date).toLocaleDateString()} has been ${updates.status}.`,
        read: false,
        createdAt: new Date(),
      });
    }
    
    return updatedBooking;
  }
  
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<boolean> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return false;
    
    // Check if cancellation is allowed
    if (!this.canCancelBooking(booking, userId)) {
      throw new Error('Cancellation is not allowed for this booking');
    }
    
    // Update booking status
    await this.updateBooking(bookingId, {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
      cancellationRequestedBy: userId === booking.userId ? 'user' : 'coach',
      cancelledAt: new Date(),
    });
    
    return true;
  }
  
  // ==================== Booking Proposals ====================
  
  async createBookingProposal(proposalData: Omit<BookingProposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<BookingProposal> {
    const now = new Date();
    const proposal: BookingProposal = {
      ...proposalData,
      id: uuidv4(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      expiresAt: addDays(now, 2), // Proposals expire in 2 days
    };
    
    // In a real app, save to database
    // await api.post('/booking-proposals', proposal);
    
    // Create notification
    const booking = await this.getBookingById(proposal.bookingId);
    if (booking) {
      await this.createNotification({
        userId: proposal.proposedBy === 'coach' ? booking.userId : (booking as any).coachId,
        type: 'booking_proposed',
        bookingId: booking.id,
        bookingType: booking.type as any,
        title: 'Booking Change Proposed',
        message: `A change has been proposed for your ${booking.type} booking.`,
        actionUrl: `/bookings/${booking.id}/proposals/${proposal.id}`,
        read: false,
        createdAt: now,
      });
    }
    
    return proposal;
  }
  
  async respondToProposal(proposalId: string, response: { status: 'accepted' | 'rejected'; message?: string }, userId: string): Promise<boolean> {
    // In a real app, fetch from API
    // const proposal = await api.get(`/booking-proposals/${proposalId}`);
    const proposal: BookingProposal = {
      id: proposalId,
      bookingId: 'mock-booking-id',
      bookingType: 'private',
      proposedBy: 'coach',
      proposedById: 'mock-coach-id',
      proposedByName: 'Mock Coach',
      changes: { message: 'Mock changes' },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: addDays(new Date(), 1),
    };
    
    if (!proposal) return false;
    
    // Update proposal status
    proposal.status = response.status;
    proposal.respondedAt = new Date();
    proposal.respondedBy = userId;
    proposal.responseMessage = response.message;
    
    // If accepted, update the booking
    if (response.status === 'accepted') {
      const booking = await this.getBookingById(proposal.bookingId);
      if (booking) {
        await this.updateBooking(booking.id, {
          ...proposal.changes,
          status: 'modified',
        });
      }
    }
    
    // Create notification
    const booking = await this.getBookingById(proposal.bookingId);
    if (booking) {
      await this.createNotification({
        userId: proposal.proposedBy === 'coach' ? booking.userId : (booking as any).coachId,
        type: `booking_${response.status}` as any,
        bookingId: booking.id,
        bookingType: booking.type as any,
        title: `Proposal ${response.status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message: `Your proposed changes have been ${response.status}.`,
        read: false,
        createdAt: new Date(),
      });
    }
    
    return true;
  }
  
  // ==================== Messaging ====================
  
  async getMessagingRules(bookingId: string, userId: string): Promise<{
    canMessage: boolean;
    canInitiate: boolean;
    canReply: boolean;
    remainingMessages?: number;
    reason?: string;
    autoCloseAt?: Date;
  }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      return {
        canMessage: false,
        canInitiate: false,
        canReply: false,
        reason: 'Booking not found',
      };
    }
    
    const now = new Date();
    const sessionEndTime = this.getSessionEndTime(booking);
    const messagingWindowEnd = addHours(sessionEndTime, 24); // 24 hours after session ends
    const isWithinMessagingWindow = isBefore(now, messagingWindowEnd);
    
    // Check if messaging is enabled for this booking
    if (!booking.messagingEnabled) {
      return {
        canMessage: false,
        canInitiate: false,
        canReply: false,
        reason: 'Messaging is not enabled for this booking',
      };
    }
    
    // Check if messaging window has passed
    if (!isWithinMessagingWindow) {
      return {
        canMessage: false,
        canInitiate: false,
        canReply: false,
        reason: 'Messaging window has closed',
        autoCloseAt: messagingWindowEnd,
      };
    }
    
    // Check if user is part of this booking
    const isParticipant = [
      booking.userId,
      (booking as any).coachId,
      (booking as any).gymId
    ].includes(userId);
    
    if (!isParticipant) {
      return {
        canMessage: false,
        canInitiate: false,
        canReply: false,
        reason: 'You are not a participant in this booking',
      };
    }
    
    // Check if user has reached message limit (if applicable)
    const remainingMessages = this.getRemainingMessages(bookingId, userId);
    const hasMessageLimit = remainingMessages !== undefined;
    const canSendMoreMessages = !hasMessageLimit || (remainingMessages as number) > 0;
    
    return {
      canMessage: true,
      canInitiate: true,
      canReply: true,
      remainingMessages: remainingMessages,
      reason: canSendMoreMessages ? undefined : 'Daily message limit reached',
      autoCloseAt: messagingWindowEnd,
    };
  }
  
  // ==================== Ratings ====================
  
  async canRateBooking(bookingId: string, userId: string): Promise<{
    canRate: boolean;
    reason?: string;
    ratingWindowEnd?: Date;
  }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      return { canRate: false, reason: 'Booking not found' };
    }
    
    // Check if user is the client who made the booking
    if (booking.userId !== userId) {
      return { canRate: false, reason: 'Only the client can rate this booking' };
    }
    
    // Check if booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      return { canRate: false, reason: 'Can only rate completed bookings' };
    }
    
    // Check if rating was already given
    if (booking.ratingGiven) {
      return { canRate: false, reason: 'You have already rated this booking' };
    }
    
    // Check if rating window is still open (5 days after completion)
    const ratingWindowEnd = addDays(booking.completedAt || new Date(), 5);
    const now = new Date();
    
    if (isAfter(now, ratingWindowEnd)) {
      return { 
        canRate: false, 
        reason: 'Rating window has closed',
        ratingWindowEnd,
      };
    }
    
    return { 
      canRate: true,
      ratingWindowEnd,
    };
  }
  
  async submitRating(ratingData: {
    bookingId: string;
    userId: string;
    rating: number;
    comment?: string;
    ratingType: 'coach' | 'gym' | 'class' | 'program';
    isAnonymous?: boolean;
  }): Promise<Rating> {
    const booking = await this.getBookingById(ratingData.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Check if user can rate this booking
    const { canRate, reason } = await this.canRateBooking(ratingData.bookingId, ratingData.userId);
    if (!canRate) {
      throw new Error(reason || 'You cannot rate this booking');
    }
    
    // In a real app, save to database
    const newRating: Rating = {
      id: uuidv4(),
      type: ratingData.ratingType as any,
      raterId: ratingData.userId,
      raterName: 'Current User', // Would come from user service
      rating: ratingData.rating,
      comment: ratingData.comment,
      isAnonymous: ratingData.isAnonymous || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Type-specific fields
      ...(ratingData.ratingType === 'coach' && {
        coachId: (booking as any).coachId,
        bookingId: booking.id,
        sessionType: booking.type,
      }),
      ...(ratingData.ratingType === 'gym' && {
        gymId: (booking as any).gymId,
        bookingId: booking.id,
      }),
      ...(ratingData.ratingType === 'class' && {
        classId: (booking as any).classId,
        coachId: (booking as any).coachId,
        gymId: (booking as any).gymId,
        bookingId: booking.id,
      }),
      ...(ratingData.ratingType === 'program' && {
        programId: (booking as any).programId,
        coachId: (booking as any).coachId,
        gymId: (booking as any).gymId,
        bookingId: booking.id,
      }),
    };
    
    // Mark rating as given for this booking
    await this.updateBooking(booking.id, { 
      ratingGiven: true,
      ratingId: newRating.id,
    });
    
    return newRating;
  }
  
  // ==================== Notifications ====================
  
  async createNotification(notificationData: Omit<BookingNotification, 'id'>): Promise<BookingNotification> {
    const notification: BookingNotification = {
      ...notificationData,
      id: uuidv4(),
    };
    
    this.notifications.push(notification);
    return notification;
  }
  
  async getUnreadNotifications(userId: string): Promise<BookingNotification[]> {
    return this.notifications.filter(
      n => n.userId === userId && !n.read
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;
    
    notification.read = true;
    notification.readAt = new Date();
    return true;
  }
  
  // ==================== Helper Methods ====================
  
  private canCancelBooking(booking: Booking, userId: string): boolean {
    const now = new Date();
    const sessionTime = new Date(`${booking.date}T${booking.time}`);
    const hoursUntilSession = differenceInHours(sessionTime, now);
    
    // Check if user is authorized to cancel
    const isClient = booking.userId === userId;
    const isCoach = (booking as any).coachId === userId;
    const isAdmin = false; // Would check user role in a real app
    
    if (!isClient && !isCoach && !isAdmin) {
      return false;
    }
    
    // Check cancellation policy
    if (booking.cancellationPolicy === 'strict' && hoursUntilSession < 48) {
      return isAdmin; // Only admin can cancel with less than 48h notice
    }
    
    if (booking.cancellationPolicy === 'moderate' && hoursUntilSession < 24) {
      return isAdmin; // Only admin can cancel with less than 24h notice
    }
    
    return true;
  }
  
  private getSessionEndTime(booking: Booking): Date {
    const startTime = new Date(`${booking.date}T${booking.time}`);
    return addHours(startTime, booking.duration / 60); // Convert minutes to hours
  }
  
  private getRemainingMessages(bookingId: string, userId: string): number | undefined {
    // In a real app, this would check the message count for today
    // and return the remaining messages based on the user's plan/limit
    return undefined; // No limit by default
  }
}

export const bookingService = BookingService.getInstance();
