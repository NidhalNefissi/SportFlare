import { User } from './index';

export enum BookingStatus {
  DRAFT = 'draft',           // Initial state when booking is being created
  PENDING = 'pending',       // Awaiting payment/confirmation
  CONFIRMED = 'confirmed',   // Payment received, booking confirmed
  MODIFIED = 'modified',     // Details changed after confirmation
  COMPLETED = 'completed',   // Session occurred successfully
  CANCELLED = 'cancelled',   // Booking was cancelled
  REJECTED = 'rejected',     // Booking was rejected by coach/gym
  COUNTER_PROPOSED = 'counter_proposed', // Alternative time/date proposed
  EXPIRED = 'expired',       // Booking expired without payment/confirmation
  NO_SHOW = 'no_show'        // Client didn't show up
}

export type PaymentStatus = 
  | 'pending'      // Payment initiated but not completed
  | 'processing'   // Payment is being processed
  | 'completed'    // Payment successfully completed
  | 'failed'       // Payment failed
  | 'refunded'     // Payment was refunded
  | 'partially_refunded' // Partial refund issued
  | 'disputed'     // Payment is being disputed
  | 'on_hold';     // Payment is on hold (e.g., for manual review)

export interface BaseBooking {
  // Core identifiers
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  
  // Session details
  type: 'class' | 'program' | 'private';
  title: string;
  description?: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  timezone?: string;
  
  // Pricing and payment
  price: number;
  currency: string;
  paymentMethod?: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  paymentDueDate?: Date;
  
  // Status and lifecycle
  status: BookingStatus;
  autoConfirm: boolean;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationDeadline?: Date; // Last time to cancel without penalty
  
  // Participation
  maxParticipants?: number;
  currentParticipants: number;
  waitlistEnabled: boolean;
  waitlistCount: number;
  
  // Messaging and ratings
  messagingEnabled: boolean;
  messagingEnabledUntil?: Date;
  ratingEnabled: boolean;
  ratingEnabledUntil?: Date;
  ratingGiven: boolean;
  ratingId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  cancellationReason?: string;
  cancellationRequestedBy?: 'user' | 'coach' | 'system' | 'admin';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
}

export interface PrivateSessionBooking extends BaseBooking {
  type: 'private';
  
  // Coach information
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  coachRating?: number;
  coachFeedback?: string;
  
  // Location information
  gymId: string;
  gymName: string;
  gymAddress?: string;
  locationType: 'in_person' | 'online' | 'hybrid';
  meetingLink?: string; // For online sessions
  
  // Session details
  sessionType: 'single' | 'package';
  packageId?: string;
  sessionNumber?: number; // For package sessions
  totalSessions?: number; // For package sessions
  
  // Rescheduling and changes
  reschedulePolicy: {
    allowed: boolean;
    minNoticeHours: number;
    maxReschedules: number;
    rescheduleCount: number;
  };
  
  // Proposed changes (for rescheduling)
  proposedChanges?: {
    date?: Date;
    time?: string;
    gymId?: string;
    gymName?: string;
    duration?: number;
    price?: number;
    message?: string;
    proposedBy: 'user' | 'coach' | 'system';
    proposedAt: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    responseMessage?: string;
  };
  
  // Internal notes (visible to staff/coach only)
  internalNotes?: string;
}

export interface ClassBooking extends BaseBooking {
  type: 'class';
  
  // Class information
  classId: string;
  className: string;
  classDescription?: string;
  classImage?: string;
  
  // Coach information
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  coachRating?: number;
  coachFeedback?: string;
  
  // Location information
  gymId: string;
  gymName: string;
  gymAddress?: string;
  locationType: 'in_person' | 'online' | 'hybrid';
  meetingLink?: string; // For online classes
  
  // Class details
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  category: string;
  equipmentNeeded?: string[];
  
  // Attendance tracking
  attendanceTaken: boolean;
  attended?: boolean;
  
  // Recurring class details (if applicable)
  isRecurring: boolean;
  recurrencePattern?: string; // e.g., 'weekly', 'biweekly', 'monthly'
  recurrenceEndDate?: Date;
  
  // Cancellation and waitlist
  cancellationWindowHours: number;
  waitlistEnabled: boolean;
  waitlistCount: number;
  waitlistPosition?: number; // For individual users
}

export interface ProgramBooking extends BaseBooking {
  type: 'program';
  
  // Program information
  programId: string;
  programName: string;
  programDescription?: string;
  programImage?: string;
  
  // Coach information
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  coachRating?: number;
  coachFeedback?: string;
  
  // Program duration
  startDate: Date;
  endDate: Date;
  
  // Program details
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  category: string;
  totalSessions: number;
  completedSessions: number;
  
  // Sessions in this program
  sessions: Array<{
    id: string;
    title: string;
    date: Date;
    time: string;
    duration: number;
    status: BookingStatus;
    attendanceTaken: boolean;
    attended?: boolean;
    notes?: string;
    locationType: 'in_person' | 'online' | 'hybrid';
    locationDetails?: string;
    meetingLink?: string;
  }>;
  
  // Progress tracking
  progress: number; // 0-100
  lastSessionCompleted?: Date;
  nextSession?: {
    id: string;
    date: Date;
    time: string;
    title: string;
  };
  
  // Materials and resources
  resources?: Array<{
    id: string;
    title: string;
    type: 'document' | 'video' | 'link' | 'other';
    url: string;
    description?: string;
  }>;
  
  // Program-specific settings
  autoEnroll: boolean;
  requiresApproval: boolean;
  maxParticipants?: number;
  
  // Payment plan (if applicable)
  paymentPlan?: {
    totalAmount: number;
    depositAmount: number;
    installments: number;
    paymentSchedule: Array<{
      dueDate: Date;
      amount: number;
      status: PaymentStatus;
      paidAt?: Date;
    }>;
  };
}

export type Booking = PrivateSessionBooking | ClassBooking | ProgramBooking;

/**
 * Represents a proposed change to a booking
 */
export interface BookingProposal {
  id: string;
  bookingId: string;
  bookingType: 'class' | 'program' | 'private';
  
  // Who initiated the proposal
  proposedBy: 'coach' | 'user' | 'system';
  proposedById: string;
  proposedByName: string;
  
  // The proposed changes
  changes: {
    date?: Date;
    time?: string;
    duration?: number;
    price?: number;
    gymId?: string;
    gymName?: string;
    locationType?: 'in_person' | 'online' | 'hybrid';
    meetingLink?: string;
    notes?: string;
    message: string;
  };
  
  // Current status of the proposal
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  
  // Response from the other party
  responseMessage?: string;
  respondedAt?: Date;
  respondedBy?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // When this proposal expires
  
  // System metadata
  metadata?: Record<string, any>;
}

/**
 * Represents a booking notification
 */
export interface BookingNotification {
  id: string;
  userId: string;
  type: 'booking_created' | 'booking_updated' | 'booking_cancelled' | 
        'booking_reminder' | 'booking_confirmation' | 'payment_required' |
        'booking_proposed' | 'booking_accepted' | 'booking_rejected';
  
  // Reference to the booking
  bookingId: string;
  bookingType: 'class' | 'program' | 'private';
  
  // Notification content
  title: string;
  message: string;
  actionUrl?: string;
  
  // Status
  read: boolean;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
}
