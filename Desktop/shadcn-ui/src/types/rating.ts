import { User } from './index';

export enum RatingType {
  COACH = 'coach',
  GYM = 'gym',
  CLASS = 'class',
  PROGRAM = 'program',
  PRODUCT = 'product',
  BRAND = 'brand',
  CLIENT = 'client' // For internal coach ratings of clients
}

export interface BaseRating {
  id: string;
  type: RatingType;
  raterId: string; // ID of the user giving the rating
  raterName: string;
  raterAvatar?: string;
  rating: number; // 1-5
  comment?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CoachRating extends BaseRating {
  type: RatingType.COACH;
  coachId: string;
  bookingId?: string;
  sessionType?: 'class' | 'program' | 'private';
}

export interface GymRating extends BaseRating {
  type: RatingType.GYM;
  gymId: string;
  bookingId?: string;
}

export interface ClassRating extends BaseRating {
  type: RatingType.CLASS;
  classId: string;
  coachId: string;
  gymId: string;
  bookingId: string;
}

export interface ProgramRating extends BaseRating {
  type: RatingType.PROGRAM;
  programId: string;
  coachId: string;
  gymId: string;
  bookingId: string;
}

export interface ProductRating extends BaseRating {
  type: RatingType.PRODUCT;
  productId: string;
  brandId: string;
  orderId: string;
}

export interface BrandRating extends BaseRating {
  type: RatingType.BRAND;
  brandId: string;
  orderId: string;
}

export interface ClientRating extends BaseRating {
  type: RatingType.CLIENT;
  clientId: string;
  bookingId: string;
  isInternal: boolean; // If true, only visible to coach/gym
}

export type Rating = 
  | CoachRating 
  | GymRating 
  | ClassRating 
  | ProgramRating 
  | ProductRating 
  | BrandRating 
  | ClientRating;

export interface RatingStats {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface RatingWithUser extends Rating {
  rater: Pick<User, 'id' | 'name' | 'avatar'>;
}
