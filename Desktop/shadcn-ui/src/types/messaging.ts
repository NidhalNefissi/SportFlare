import { User } from './index';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  BOOKING_UPDATE = 'booking_update',
  PAYMENT_UPDATE = 'payment_update',
  RATING_REMINDER = 'rating_reminder'
}

export enum ConversationType {
  CLIENT_COACH = 'client_coach',
  CLIENT_GYM = 'client_gym',
  COACH_GYM = 'coach_gym',
  CLIENT_BRAND = 'client_brand'
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[]; // Array of user IDs
  title: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  relatedEntity?: {
    type: 'booking' | 'product';
    id: string;
    status?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface MessagingRules {
  canMessage: boolean;
  canInitiate: boolean;
  canReply: boolean;
  remainingMessages?: number;
  reason?: string;
  autoCloseAt?: Date;
}

export interface SendMessageParams {
  conversationId?: string;
  recipientIds: string[];
  content: string;
  type?: MessageType;
  metadata?: Record<string, any>;
}
