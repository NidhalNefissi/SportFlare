// This file contains review-related methods to be added to apiService
// Import this file and use it in apiService.ts

import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { cloneWithDates } from './mockData';

export const reviewMethods = {
  async getReviews(filters = {}) {
    const { entityId, entityType, userId } = filters;
    let reviews = loadFromStorage('reviews') || [];
    
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
  
  async createReview(reviewData) {
    const reviews = loadFromStorage('reviews') || [];
    
    // Check if user has already reviewed this entity
    const existingReview = reviews.find(
      r => r.userId === reviewData.userId && r.entityId === reviewData.entityId && r.entityType === reviewData.entityType
    );
    
    if (existingReview) {
      throw new Error('You have already reviewed this ' + reviewData.entityType);
    }
    
    const newReview = {
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
  
  async updateReview(id, updates) {
    const reviews = loadFromStorage('reviews') || [];
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
  
  async deleteReview(id) {
    const reviews = loadFromStorage('reviews') || [];
    const reviewIndex = reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) return false;
    
    const deletedReview = reviews[reviewIndex];
    reviews.splice(reviewIndex, 1);
    saveToStorage('reviews', reviews);
    
    // Update entity rating
    this.updateEntityRating(deletedReview.entityId, deletedReview.entityType);
    
    return true;
  },
  
  async replyToReview(id, reply) {
    const reviews = loadFromStorage('reviews') || [];
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
  
  async markReviewHelpful(id) {
    const reviews = loadFromStorage('reviews') || [];
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
  updateEntityRating(entityId, entityType) {
    const reviews = loadFromStorage('reviews') || [];
    const entityReviews = reviews.filter(r => r.entityId === entityId && r.entityType === entityType);
    
    if (entityReviews.length === 0) return;
    
    // Calculate average rating
    const totalRating = entityReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / entityReviews.length;
    const ratingValue = parseFloat(averageRating.toFixed(1));
    
    // Update entity rating based on type
    switch (entityType) {
      case 'class':
        const classes = loadFromStorage('classes') || [];
        const classIndex = classes.findIndex(c => c.id === entityId);
        if (classIndex !== -1) {
          classes[classIndex].rating = ratingValue;
          saveToStorage('classes', classes);
        }
        break;
      case 'program':
        const programs = loadFromStorage('programs') || [];
        const programIndex = programs.findIndex(p => p.id === entityId);
        if (programIndex !== -1) {
          programs[programIndex].rating = ratingValue;
          saveToStorage('programs', programs);
        }
        break;
      case 'product':
        const products = loadFromStorage('products') || [];
        const productIndex = products.findIndex(p => p.id === entityId);
        if (productIndex !== -1) {
          products[productIndex].rating = ratingValue;
          saveToStorage('products', products);
        }
        break;
      case 'gym':
        const gyms = loadFromStorage('gyms') || [];
        const gymIndex = gyms.findIndex(g => g.id === entityId);
        if (gymIndex !== -1) {
          gyms[gymIndex].rating = ratingValue;
          saveToStorage('gyms', gyms);
        }
        break;
    }
  }
};

// Function to extend apiService with these methods
export function addReviewMethodsToApiService(apiService) {
  Object.assign(apiService, reviewMethods);
}