import { Review } from '@/types';
import apiService from './apiService';

// Review service methods for adding to apiService
export const reviewServiceMethods = {
  // Review methods
  async getReviews(filters: {
    entityId?: string;
    entityType?: 'class' | 'program' | 'coach' | 'gym' | 'product';
    userId?: string;
  }): Promise<Review[]> {
    const reviews = this.loadReviews();
    
    let filteredReviews = [...reviews];
    
    if (filters.entityId) {
      filteredReviews = filteredReviews.filter(r => r.entityId === filters.entityId);
    }
    
    if (filters.entityType) {
      filteredReviews = filteredReviews.filter(r => r.entityType === filters.entityType);
    }
    
    if (filters.userId) {
      filteredReviews = filteredReviews.filter(r => r.userId === filters.userId);
    }
    
    // Sort by newest first
    filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return this.cloneWithDates(filteredReviews);
  },

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Promise<Review> {
    const reviews = this.loadReviews();
    
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
    this.saveReviews(reviews);
    
    // Update entity rating
    this.updateEntityRating(reviewData.entityId, reviewData.entityType);
    
    // Notify entity owner
    this.sendReviewNotification(newReview);
    
    return this.cloneWithDates(newReview);
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const reviews = this.loadReviews();
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return null;
    
    const updatedReview = { ...reviews[reviewIndex], ...updates, updatedAt: new Date() };
    reviews[reviewIndex] = updatedReview;
    this.saveReviews(reviews);
    
    // If rating changed, update entity rating
    if (updates.rating && reviews[reviewIndex].rating !== updates.rating) {
      this.updateEntityRating(updatedReview.entityId, updatedReview.entityType);
    }
    
    return this.cloneWithDates(updatedReview);
  },

  async deleteReview(id: string): Promise<boolean> {
    const reviews = this.loadReviews();
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return false;
    
    const deletedReview = reviews[reviewIndex];
    reviews.splice(reviewIndex, 1);
    this.saveReviews(reviews);
    
    // Update entity rating
    this.updateEntityRating(deletedReview.entityId, deletedReview.entityType);
    
    return true;
  },

  async replyToReview(id: string, reply: { userId: string, userName: string, content: string }): Promise<Review | null> {
    const reviews = this.loadReviews();
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
    this.saveReviews(reviews);
    
    // Send notification to the reviewer
    apiService.createNotification({
      userId: updatedReview.userId,
      title: 'New Reply to Your Review',
      message: `${reply.userName} has replied to your review.`,
      type: 'review',
      relatedEntityId: updatedReview.entityId,
      relatedEntityType: updatedReview.entityType,
      isRead: false,
      createdAt: new Date()
    });
    
    return this.cloneWithDates(updatedReview);
  },

  async markReviewHelpful(id: string): Promise<Review | null> {
    const reviews = this.loadReviews();
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return null;
    
    const updatedReview = { 
      ...reviews[reviewIndex], 
      helpfulCount: (reviews[reviewIndex].helpfulCount || 0) + 1 
    };
    
    reviews[reviewIndex] = updatedReview;
    this.saveReviews(reviews);
    
    return this.cloneWithDates(updatedReview);
  },

  // Helper methods
  loadReviews(): Review[] {
    try {
      const storedReviews = localStorage.getItem('sportflare_reviews');
      return storedReviews ? JSON.parse(storedReviews) : [];
    } catch (error) {
      console.error('Error loading reviews from storage', error);
      return [];
    }
  },

  saveReviews(reviews: Review[]): void {
    try {
      localStorage.setItem('sportflare_reviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Error saving reviews to storage', error);
    }
  },

  updateEntityRating(entityId: string, entityType: string): void {
    const reviews = this.loadReviews();
    const entityReviews = reviews.filter(r => r.entityId === entityId && r.entityType === entityType);
    
    if (entityReviews.length === 0) return;
    
    // Calculate average rating
    const totalRating = entityReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / entityReviews.length;
    const ratingValue = parseFloat(averageRating.toFixed(1));
    
    // Update entity rating based on type
    if (entityType === 'class') {
      apiService.updateClass(entityId, { rating: ratingValue });
    } else if (entityType === 'program') {
      // Call appropriate service method when available
      console.log('Updating program rating', entityId, ratingValue);
    } else if (entityType === 'product') {
      // Call appropriate service method when available
      console.log('Updating product rating', entityId, ratingValue);
    } else if (entityType === 'gym') {
      // Call appropriate service method when available
      console.log('Updating gym rating', entityId, ratingValue);
    }
  },

  sendReviewNotification(review: Review): void {
    // This method would handle sending notifications about new reviews
    // Implementation depends on how notifications are handled in the system
    console.log('Sending review notification for', review);
  },

  cloneWithDates<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cloneWithDates(item)) as unknown as T;
    }
    
    const result = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.cloneWithDates(obj[key]);
      }
    }
    
    return result;
  }
};

// Add these methods to apiService
export function extendApiServiceWithReviews(apiService: unknown): void {
  Object.assign(apiService, reviewServiceMethods);
}