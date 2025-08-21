import { User } from './index';

export interface Review {
  id: string;
  userId: string;
  user: User;
  entityId: string;
  entityType: 'class' | 'program' | 'coach' | 'gym' | 'product';
  rating: number;
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

// Add this to the main index.ts types file