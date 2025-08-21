import { createContext, useContext, ReactNode } from 'react';
import { Review } from '@/types';
import apiService from '@/services/api/apiService';

interface ReviewContextType {
  fetchReviews: (
    entityId: string,
    entityType: 'class' | 'program' | 'coach' | 'gym' | 'product'
  ) => Promise<Review[]>;
  
  createReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => Promise<Review>;
  
  updateReview: (id: string, updates: Partial<Review>) => Promise<Review | null>;
  
  deleteReview: (id: string) => Promise<boolean>;
  
  markHelpful: (id: string) => Promise<Review | null>;
  
  replyToReview: (
    id: string,
    reply: { userId: string; userName: string; content: string }
  ) => Promise<Review | null>;
  
  hasUserReviewed: (
    entityId: string,
    entityType: 'class' | 'program' | 'coach' | 'gym' | 'product',
    userId: string
  ) => Promise<boolean>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

interface ReviewProviderProps {
  children: ReactNode;
}

export function ReviewProvider({ children }: ReviewProviderProps) {
  const fetchReviews = async (
    entityId: string,
    entityType: 'class' | 'program' | 'coach' | 'gym' | 'product'
  ): Promise<Review[]> => {
    return await apiService.getReviews({ entityId, entityType });
  };

  const createReview = async (
    reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
  ): Promise<Review> => {
    return await apiService.createReview(reviewData);
  };

  const updateReview = async (
    id: string,
    updates: Partial<Review>
  ): Promise<Review | null> => {
    return await apiService.updateReview(id, updates);
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    return await apiService.deleteReview(id);
  };

  const markHelpful = async (id: string): Promise<Review | null> => {
    return await apiService.markReviewHelpful(id);
  };

  const replyToReview = async (
    id: string,
    reply: { userId: string; userName: string; content: string }
  ): Promise<Review | null> => {
    return await apiService.replyToReview(id, reply);
  };

  const hasUserReviewed = async (
    entityId: string,
    entityType: 'class' | 'program' | 'coach' | 'gym' | 'product',
    userId: string
  ): Promise<boolean> => {
    const reviews = await apiService.getReviews({
      entityId,
      entityType,
      userId,
    });
    return reviews.length > 0;
  };

  return (
    <ReviewContext.Provider
      value={{
        fetchReviews,
        createReview,
        updateReview,
        deleteReview,
        markHelpful,
        replyToReview,
        hasUserReviewed,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}