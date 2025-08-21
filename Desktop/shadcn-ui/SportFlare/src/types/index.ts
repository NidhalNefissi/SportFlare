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
  createdAt?: Date;
  enrolledClasses?: Enrollment[];
  createdClasses?: Class[];
  reviews?: Review[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'pro';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

export type ClassStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'canceled' | 'active' | 'completed';

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
  endDate?: Date;
  duration: number; // in minutes
  capacity: number;
  enrolled: number;
  price: number;
  tags: string[];
  rating?: number;
  status: ClassStatus;
  reviews?: Review[];
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: Date;
  approvalStatus?: {
    gymApproved: boolean;
    adminApproved: boolean;
    rejectionReason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  user: User;
  classId: string;
  class: Class;
  status: 'booked' | 'checked-in' | 'completed' | 'canceled' | 'no-show';
  bookingDate: Date;
  attendanceDate?: Date;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  paymentAmount: number;
}

export interface ClassProposal {
  id: string;
  title: string;
  description: string;
  coachId: string;
  coach: User;
  gymId: string;
  gym: Gym;
  date: Date;
  duration: number;
  capacity: number;
  price: number;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  modificationRequests?: ClassModification[];
}

export interface ClassModification {
  id: string;
  classId: string;
  requesterId: string;
  requester: User;
  originalData: Partial<Class>;
  proposedChanges: Partial<Class>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  responseNote?: string;
  createdAt: Date;
  resolvedAt?: Date;
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
  status: 'draft' | 'active' | 'completed' | 'canceled';
  enrollments: ProgramEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramEnrollment {
  id: string;
  userId: string;
  user: User;
  programId: string;
  program: Program;
  progress: number; // percentage
  status: 'active' | 'completed' | 'canceled';
  enrollmentDate: Date;
  completionDate?: Date;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  paymentAmount: number;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  entityId: string;
  entityType: 'class' | 'program' | 'coach' | 'gym' | 'product';
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  helpfulCount: number;
  reply?: {
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
  };
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
  classApprovalRequired: boolean;
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
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
  reviews?: Review[];
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
  user: User;
  products: { product: Product; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
  shippingAddress: string;
  trackingInfo?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  content: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'class' | 'order' | 'message' | 'program' | 'review' | 'proposal';
  isRead: boolean;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
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