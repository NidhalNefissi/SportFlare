export type UserRole = 'client' | 'coach' | 'gym' | 'brand' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  achievements?: Achievement[];
  subscription?: Subscription;
  specialties?: string[];
  rating?: number;
  hourlyRate?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export type PlanTier = 'basic' | 'plus' | 'premium';
export type PlanDuration = 1 | 3 | 6 | 12; // in months

import { PaymentMethod } from './payment';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending_payment' | 'payment_failed';

export interface Subscription {
  id: string;
  userId: string;
  planTier: PlanTier;
  planDuration: PlanDuration;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  status: SubscriptionStatus;
  paymentMethod?: PaymentMethod;
  paymentDetails?: {
    lastFour?: string; // Last 4 digits of card if applicable
    paymentMethodId: string; // ID from payment processor
    receiptUrl?: string; // URL to download receipt
  };
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  price: number; // Base price before discount
  discount: number; // Discount amount
  totalPaid: number; // Final amount paid after discount
  currency: string; // e.g., 'TND'
  billingCycle: 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  paymentHistory: Array<{
    id: string;
    date: Date;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: PaymentMethod;
    receiptUrl?: string;
  }>;
  accessLevel: {
    weightArea: boolean;
    cardioArea: boolean;
    unlimitedGymAccess: boolean;
    multiGymAccess: boolean;
  };
  perks: {
    personalizedDashboard: boolean;
    progressTracking: boolean;
    coachFeedback: boolean;
    attendanceStats: boolean;
    classPriorityBooking: boolean;
    advancedTracking: boolean;
    localChallenges: boolean;
    rankedTracking: boolean;
    exclusiveCoachFeedback: boolean;
    sessionSummaries: boolean;
    localEvents: boolean;
    advancedInsights: boolean;
    bookingFlexibility: boolean;
    coachMeetups: boolean;
    marketplaceDiscounts: boolean;
    guestPasses: boolean;
    earlyFeatureAccess: boolean;
    vipAccess: boolean;
  };
  gymAccess: {
    gymId: string;
    name: string;
    accessType: 'weight' | 'cardio' | 'both';
    checkIns: number;
    lastCheckIn?: Date;
  }[];
  usageStats: {
    monthlyCheckIns: number;
    classesAttended: number;
    coachSessions: number;
    challengesCompleted: number;
  };
}

export interface Class {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coach: User;
  gymId: string;
  gym: Gym;
  image: string;
  date: Date;
  duration: number; // in minutes
  capacity: number;
  enrolled: number;
  price: number;
  tags: string[];
  rating?: number;
  status?: 'pending' | 'confirmed' | 'rejected' | 'counter_proposed';
  gymProposal?: Partial<Omit<Class, 'id' | 'coachId' | 'coach' | 'gymId' | 'gym' | 'status' | 'gymProposal'>>;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coach: User;
  image: string;
  duration: number; // in weeks
  classes: Class[];
  price: number;
  tags: string[];
  rating?: number;
  enrolled?: number; // Number of users enrolled in the program
  capacity?: number; // Maximum capacity for the program
}

export interface Gym {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  image: string;
  amenities: string[];
  rating?: number;
  latitude: number;
  longitude: number;
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  operatingHours: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    openTime: string; // '09:00'
    closeTime: string; // '22:00'
    isOpen: boolean;
  }[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  features?: string[];
  capacity?: number;
  staffCount?: number;
  yearEstablished?: number;
  membershipPlans?: {
    id: string;
    name: string;
    price: number;
    duration: number; // in months
    features: string[];
    isPopular?: boolean;
  }[];
  analytics?: {
    totalCheckIns: number;
    activeMembers: number;
    monthlyRevenue: number;
    averageRating: number;
    lastUpdated: Date;
  };
  settings?: {
    checkInRequired: boolean;
    bookingWindowDays: number;
    cancellationPolicyHours: number;
    autoConfirmBookings: boolean;
    notifyOnNewBooking: boolean;
    notifyOnCheckIn: boolean;
    notifyOnClassFull: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brand: Brand;
  image: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
}

export interface Order {
  id: string;
  userId: string;
  products: { product: Product; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  shippingAddress: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'class' | 'order' | 'message' | 'program' | 'booking' | 'payment' | 'coach_booking' | 'reminder';
  isRead: boolean;
  isPersistent?: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt?: Date;
  actionType?: 'navigate' | 'modal' | 'none';
  actionData?: {
    // For navigation
    route?: string;
    // For modals/popups
    modalType?: 'class' | 'program' | 'coach' | 'product' | 'gym';
    entityId?: string;
    // Additional context data
    metadata?: Record<string, any>;
  };
  reminders?: Array<{
    hoursBefore: number;
    message: string;
    isSent?: boolean;
    sentAt?: Date;
  }>;
  route?: string;
  modalType?: 'class' | 'program' | 'coach' | 'product' | 'gym';
  entityId?: string;
  metadata?: Record<string, any>;
}

// Gym Dashboard Types
export interface GymAnalytics {
  // Overall Metrics
  totalCheckIns: number;
  activeMembers: number;
  newMembers: number;
  avgCheckInsPerDay: number;
  monthlyRevenue: number;
  revenueChange: number; // percentage
  
  // Class Analytics
  classAttendance: {
    classId: string;
    className: string;
    attendanceRate: number;
    totalSessions: number;
    totalAttendees: number;
    peakTime: string;
    revenue: number;
  }[];
  
  // Coach Performance
  coachPerformance: {
    coachId: string;
    coachName: string;
    rating: number;
    classesTaught: number;
    totalAttendees: number;
    revenueGenerated: number;
  }[];
  
  // Time-based Analytics
  hourlyCheckIns: { hour: string; count: number }[];
  dailyCheckIns: { day: string; count: number }[];
  weeklyCheckIns: { week: string; count: number }[];
  monthlyCheckIns: { month: string; count: number }[];
  
  // Revenue Analytics
  revenueBySource: {
    source: 'memberships' | 'classes' | 'personal_training' | 'merchandise' | 'other';
    amount: number;
    percentage: number;
  }[];
  
  // Member Demographics
  memberDemographics: {
    ageGroups: { range: string; count: number }[];
    genderDistribution: { gender: string; count: number }[];
    membershipTiers: { tier: string; count: number }[];
  };
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in minutes
  type: 'class' | 'gym' | 'event';
  classId?: string;
  className?: string;
  coachId?: string;
  coachName?: string;
  membershipTier: string;
  paymentStatus: 'paid' | 'pending' | 'free';
  revenue?: number;
  deviceId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface GymPromotion {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'free_session' | 'referral' | 'membership' | 'other';
  discountPercentage?: number;
  discountAmount?: number;
  applicableItems?: string[]; // class IDs, membership types, etc.
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  totalRedemptions: number;
  maxRedemptions?: number;
  promoCode?: string;
  conditions?: string;
  createdBy: string; // admin/gym owner ID
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}