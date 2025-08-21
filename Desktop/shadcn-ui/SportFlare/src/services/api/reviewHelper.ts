import { Review } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { cloneWithDates } from './mockData';

// Helper methods to add to ApiService class
export const reviewMethods = {
  // Review methods
  async getReviews(filters: {
    entityId?: string;
    entityType?: 'class' | 'program' | 'coach' | 'gym' | 'product';
    userId?: string;
  } = {}): Promise<Review[]> {
    const { entityId, entityType, userId } = filters;
    let reviews = loadFromStorage<Review>('reviews') || [];
    
    if (entityId) {
      reviews = reviews.filter(r => r.entityId === entityId);
    }
    
    if (entityType) {
      reviews = reviews.filter(r => r.entityType === entityType);
    }
    
    if (userId) {
      reviews = reviews.filter(r => r.userId === userId);
    }
    
    // Sort by newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return cloneWithDates(reviews);
  },
  
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Promise<Review> {
    const reviews = loadFromStorage<Review>('reviews') || [];
    
    // Check if user has already reviewed this entity
    const existingReview = reviews.find(
      r => r.userId === reviewData.userId && r.entityId === reviewData.entityId && r.entityType === reviewData.entityType
    );
    
    if (existingReview) {
      throw new Error('You have already reviewed this ' + reviewData.entityType);
    }
    
    const newReview: Review = {
      ...reviewData,
      id: `review_${Date.now()}`,
      createdAt: new Date(),
      helpfulCount: 0
    };
    
    reviews.push(newReview);
    saveToStorage('reviews', reviews);
    
    // Update entity rating
    this.updateEntityRating(reviewData.entityId, reviewData.entityType);
    
    return cloneWithDates(newReview);
  },
  
  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const reviews = loadFromStorage<Review>('reviews') || [];
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return null;
    
    const updatedReview = { ...reviews[reviewIndex], ...updates, updatedAt: new Date() };
    reviews[reviewIndex] = updatedReview;
    saveToStorage('reviews', reviews);
    
    // If rating changed, update entity rating
    if (updates.rating && reviews[reviewIndex].rating !== updates.rating) {
      this.updateEntityRating(updatedReview.entityId, updatedReview.entityType);
    }
    
    return cloneWithDates(updatedReview);
  },
  
  async deleteReview(id: string): Promise<boolean> {
    const reviews = loadFromStorage<Review>('reviews') || [];
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return false;
    
    const deletedReview = reviews[reviewIndex];
    reviews.splice(reviewIndex, 1);
    saveToStorage('reviews', reviews);
    
    // Update entity rating
    this.updateEntityRating(deletedReview.entityId, deletedReview.entityType);
    
    return true;
  },
  
  async replyToReview(id: string, reply: { userId: string, userName: string, content: string }): Promise<Review | null> {
    const reviews = loadFromStorage<Review>('reviews') || [];
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return null;
    
    const updatedReview = { 
      ...reviews[reviewIndex], 
      reply: { 
        ...reply, 
        timestamp: new Date() 
      } 
    };
    
    reviews[reviewIndex] = updatedReview;
    saveToStorage('reviews', reviews);
    
    // Send notification to the reviewer
    this.createNotification({
      userId: updatedReview.userId,
      title: 'New Reply to Your Review',
      message: `${reply.userName} has replied to your review.`,
      type: 'review',
      relatedEntityId: updatedReview.entityId,
      relatedEntityType: updatedReview.entityType,
      isRead: false,
      createdAt: new Date()
    });
    
    return cloneWithDates(updatedReview);
  },
  
  async markReviewHelpful(id: string): Promise<Review | null> {
    const reviews = loadFromStorage<Review>('reviews') || [];
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return null;
    
    const updatedReview = { 
      ...reviews[reviewIndex], 
      helpfulCount: (reviews[reviewIndex].helpfulCount || 0) + 1 
    };
    
    reviews[reviewIndex] = updatedReview;
    saveToStorage('reviews', reviews);
    
    return cloneWithDates(updatedReview);
  },
  
  // Helper method to update entity rating based on reviews
  updateEntityRating(entityId: string, entityType: string): void {
    const reviews = loadFromStorage<Review>('reviews') || [];
    const entityReviews = reviews.filter(r => r.entityId === entityId && r.entityType === entityType);
    
    if (entityReviews.length === 0) return;
    
    // Calculate average rating
    const totalRating = entityReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / entityReviews.length;
    const ratingValue = parseFloat(averageRating.toFixed(1));
    
    // Update entity rating based on type
    if (entityType === 'class') {
      this.updateClassRating(entityId, ratingValue);
    } else if (entityType === 'program') {
      this.updateProgramRating(entityId, ratingValue);
    } else if (entityType === 'product') {
      this.updateProductRating(entityId, ratingValue);
    } else if (entityType === 'gym') {
      this.updateGymRating(entityId, ratingValue);
    }
  },

  updateClassRating(entityId: string, rating: number): void {
    const classes = loadFromStorage<Record<string, unknown>>('classes') || [];
    const classIndex = classes.findIndex((c: Record<string, unknown>) => c.id === entityId);
    if (classIndex !== -1) {
      classes[classIndex].rating = rating;
      saveToStorage('classes', classes);
    }
  },

  updateProgramRating(entityId: string, rating: number): void {
    const programs = loadFromStorage<Record<string, unknown>>('programs') || [];
    const programIndex = programs.findIndex((p: Record<string, unknown>) => p.id === entityId);
    if (programIndex !== -1) {
      programs[programIndex].rating = rating;
      saveToStorage('programs', programs);
    }
  },

  updateProductRating(entityId: string, rating: number): void {
    const products = loadFromStorage<Record<string, unknown>>('products') || [];
    const productIndex = products.findIndex((p: Record<string, unknown>) => p.id === entityId);
    if (productIndex !== -1) {
      products[productIndex].rating = rating;
      saveToStorage('products', products);
    }
  },

  updateGymRating(entityId: string, rating: number): void {
    const gyms = loadFromStorage<Record<string, unknown>>('gyms') || [];
    const gymIndex = gyms.findIndex((g: Record<string, unknown>) => g.id === entityId);
    if (gymIndex !== -1) {
      gyms[gymIndex].rating = rating;
      saveToStorage('gyms', gyms);
    }
  }
};

// Function to extend apiService with these methods
export function extendApiServiceWithReviews(apiService: unknown): void {
  Object.assign(apiService, reviewMethods);
}