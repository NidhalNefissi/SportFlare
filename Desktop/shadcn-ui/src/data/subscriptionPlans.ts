import { PlanTier, PlanDuration, Subscription } from '@/types';

// Base prices in TND (Tunisian Dinar)
const BASE_PRICES = {
  basic: 60,    // 60 TND/month
  plus: 90,     // 90 TND/month
  premium: 120  // 120 TND/month
} as const;

// Monthly discounts based on plan duration
const DURATION_DISCOUNTS = {
  1: 0,    // No discount for 1 month
  3: 5,    // 5 TND discount per month for 3 months
  6: 10,   // 10 TND discount per month for 6 months
  12: 15   // 15 TND discount per month for annual plan
} as const;

// Access levels for each plan tier (in minutes per month)
const ACCESS_LEVELS = {
  basic: {
    weightArea: true,
    cardioArea: true,
    gymAccessMinutes: 60,
    unlimitedGymAccess: false,
    multiGymAccess: false,
  },
  plus: {
    weightArea: true,
    cardioArea: true,
    gymAccessMinutes: 90,
    unlimitedGymAccess: false,
    multiGymAccess: true,
  },
  premium: {
    weightArea: true,
    cardioArea: true,
    gymAccessMinutes: 120,
    unlimitedGymAccess: true,
    multiGymAccess: true,
  },
} as const;

// Plan descriptions and marketing content
const PLAN_DESCRIPTIONS = {
  basic: {
    title: 'Basic',
    tagline: 'Perfect for beginners',
    description: 'Start your fitness journey with essential features',
    highlights: [
      '60 minutes gym access per month',
      'Track your workouts and progress',
      'Access to basic analytics',
      'Join our fitness community'
    ]
  },
  plus: {
    title: 'Plus',
    tagline: 'Most popular choice',
    description: 'Enhanced features for serious fitness enthusiasts',
    highlights: [
      '90 minutes gym access per month',
      'AI-powered workout guidance (5 sessions/month)',
      'Advanced analytics and insights',
      'Create and follow workout plans',
      '10% discount on marketplace purchases'
    ]
  },
  premium: {
    title: 'Premium',
    tagline: 'Ultimate fitness experience',
    description: 'Everything you need for complete fitness transformation',
    highlights: [
      '120 minutes gym access per month',
      '1-on-1 coaching sessions (2/month)',
      'Unlimited AI coaching',
      'Personalized nutrition plans',
      '20% discount on marketplace purchases',
      'Priority support',
      'Early access to new features'
    ]
  }
} as const;

// Base perks for all plans
const BASE_PERKS = {
  // Basic features
  trackWorkouts: true,
  browseClasses: true,
  basicAnalytics: true,
  communityAccess: true,
  
  // Premium features (unlocked in higher tiers)
  coachFeedback: false,
  advancedAnalytics: false,
  workoutPlanCreation: false,
  aiCoaching: false,
  oneOnOneCoaching: false,
  customNutritionPlans: false,
  prioritySupport: false,
  earlyFeatureAccess: false,
  marketplaceDiscount: 0, // percentage
} as const;

// Perks for each plan tier - mapped to the expected interface
const PLAN_PERKS = {
  basic: {
    personalizedDashboard: true,
    progressTracking: true,
    coachFeedback: false,
    attendanceStats: false,
    classPriorityBooking: false,
    advancedTracking: false,
    localChallenges: false,
    rankedTracking: false,
    exclusiveCoachFeedback: false,
    sessionSummaries: false,
    localEvents: false,
    advancedInsights: false,
    bookingFlexibility: false,
    coachMeetups: false,
    marketplaceDiscounts: false,
    guestPasses: false,
    earlyFeatureAccess: false,
    vipAccess: false,
  },
  plus: {
    personalizedDashboard: true,
    progressTracking: true,
    coachFeedback: true,
    attendanceStats: true,
    classPriorityBooking: false,
    advancedTracking: true,
    localChallenges: true,
    rankedTracking: true,
    exclusiveCoachFeedback: false,
    sessionSummaries: true,
    localEvents: false,
    advancedInsights: true,
    bookingFlexibility: false,
    coachMeetups: false,
    marketplaceDiscounts: true,
    guestPasses: false,
    earlyFeatureAccess: false,
    vipAccess: false,
  },
  premium: {
    personalizedDashboard: true,
    progressTracking: true,
    coachFeedback: true,
    attendanceStats: true,
    classPriorityBooking: true,
    advancedTracking: true,
    localChallenges: true,
    rankedTracking: true,
    exclusiveCoachFeedback: true,
    sessionSummaries: true,
    localEvents: true,
    advancedInsights: true,
    bookingFlexibility: true,
    coachMeetups: true,
    marketplaceDiscounts: true,
    guestPasses: true,
    earlyFeatureAccess: true,
    vipAccess: true,
  },
} as const;

// Calculate plan price with duration discount
export const calculatePlanPrice = (tier: PlanTier, duration: PlanDuration): number => {
  const basePrice = BASE_PRICES[tier];
  const discount = DURATION_DISCOUNTS[duration];
  return (basePrice - discount) * duration;
};

// Get plan features by tier and duration
export const getPlanFeatures = (tier: PlanTier, duration: PlanDuration) => {
  const price = calculatePlanPrice(tier, duration);
  const monthlyPrice = price / duration;
  const discount = DURATION_DISCOUNTS[duration];
  
  return {
    ...PLAN_DESCRIPTIONS[tier],
    tier,
    duration,
    price,
    monthlyPrice,
    discount,
    isDiscounted: discount > 0,
    ...ACCESS_LEVELS[tier],
    ...PLAN_PERKS[tier],
    features: [
      ...PLAN_DESCRIPTIONS[tier].highlights,
      ...(tier === 'plus' || tier === 'premium' ? [
        'Access to all basic features',
        'Multi-gym access'
      ] : []),
      ...(tier === 'premium' ? [
        'Unlimited gym access',
        'Priority booking for classes',
        'Exclusive member events'
      ] : [])
    ]
  };
};

// Generate a subscription object
export const createSubscription = (
  userId: string,
  tier: PlanTier,
  duration: PlanDuration,
  gymIds: string[] = [],
  startDate: Date = new Date()
): Subscription => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + duration);
  
  const price = calculatePlanPrice(tier, duration);
  const discount = DURATION_DISCOUNTS[duration] * duration;
  
  return {
    id: `sub_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planTier: tier,
    planDuration: duration,
    startDate,
    endDate,
    autoRenew: true,
    status: 'active',
    paymentMethod: 'credit_card',
    lastPaymentDate: new Date(),
    nextBillingDate: endDate,
    price,
    discount,
    totalPaid: price,
    accessLevel: { ...ACCESS_LEVELS[tier] },
    perks: { ...PLAN_PERKS[tier] },
    gymAccess: gymIds.map(gymId => ({
      gymId,
      name: `Gym ${gymId}`,
      accessType: tier === 'basic' ? 'weight' : tier === 'plus' ? 'both' : 'both',
      checkIns: 0,
    })),
    usageStats: {
      monthlyCheckIns: 0,
      classesAttended: 0,
      coachSessions: 0,
      challengesCompleted: 0,
    },
  };
};

// Get all available plans
export const getAllPlans = () => {
  const durations: PlanDuration[] = [1, 3, 6, 12];
  const tiers: PlanTier[] = ['basic', 'plus', 'premium'];
  
  return durations.map(duration => ({
    duration,
    plans: tiers.map(tier => getPlanFeatures(tier, duration)),
  }));
};

// Check if a user can access a gym with their subscription
export const canAccessGym = (
  subscription: Subscription | undefined,
  gymId: string,
  accessType: 'weight' | 'cardio' | 'both' = 'weight'
): boolean => {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  
  const today = new Date();
  if (today < new Date(subscription.startDate) || today > new Date(subscription.endDate)) {
    return false;
  }
  
  const gymAccess = subscription.gymAccess.find(g => g.gymId === gymId);
  
  if (!gymAccess && !subscription.accessLevel.multiGymAccess) {
    return false; // No access to this gym and no multi-gym access
  }
  
  if (accessType === 'both') {
    return subscription.accessLevel.weightArea && subscription.accessLevel.cardioArea;
  }
  
  return subscription.accessLevel[accessType === 'weight' ? 'weightArea' : 'cardioArea'];
};

// Get the best plan for a user based on their usage
export const getRecommendedPlan = (usage: {
  monthlyVisits: number;
  usesCardio: boolean;
  usesWeights: boolean;
  attendsClasses: boolean;
  wantsCoachAccess: boolean;
}): PlanTier => {
  const { monthlyVisits, usesCardio, usesWeights, attendsClasses, wantsCoachAccess } = usage;
  
  if (monthlyVisits > 12 || (usesCardio && usesWeights) || attendsClasses || wantsCoachAccess) {
    return 'premium';
  }
  
  if (monthlyVisits > 4 || usesCardio || usesWeights) {
    return 'plus';
  }
  
  return 'basic';
};

// Calculate savings for a plan compared to monthly
// ... (rest of the code remains the same)
