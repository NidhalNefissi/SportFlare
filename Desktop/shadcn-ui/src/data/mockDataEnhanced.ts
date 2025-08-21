import { Class, Program, Gym, User, Product, Brand, Order, Message, Notification, Booking, BookingStatus, PaymentStatus, Subscription, PlanTier, PlanDuration, Rating, RatingType, Conversation, ConversationType, Cart, CartItem, OrderStatus, ProductCategory, InventoryStatus } from '@/types';

// Remove duplicate type declarations since we're importing them from '@/types'
import { createSubscription, canAccessGym, getRecommendedPlan, getAllPlans, calculatePlanPrice } from './subscriptionPlans';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours, addMinutes, subDays, subHours, format } from 'date-fns';

// Helper function to generate dates
const today = new Date();
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 7);
const twoWeeksAgo = subDays(today, 14);
const oneHourFromNow = addHours(new Date(), 1);
const twoHoursAgo = subHours(new Date(), 2);
const yesterday = subDays(today, 1);
const lastWeek = subDays(today, 7);

// Helper to create consistent timestamps
const createTimeSlots = (baseDate: Date) => {
  const dateStr = format(baseDate, 'yyyy-MM-dd');
  return {
    morning: `${dateStr}T09:00:00`,
    afternoon: `${dateStr}T14:00:00`,
    evening: `${dateStr}T18:00:00`,
  };
};

const todaySlots = createTimeSlots(today);
const tomorrowSlots = createTimeSlots(tomorrow);
const yesterdaySlots = createTimeSlots(yesterday);

// Helper to create recurring sessions
const createRecurringSessions = (startDate: Date, count: number, daysApart: number = 7) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `sess-${uuidv4()}`,
    title: `Session ${i + 1}`,
    date: addDays(startDate, i * daysApart),
    time: '18:00',
    duration: 60,
    status: i === 0 ? 'upcoming' : i < 2 ? 'completed' : 'scheduled',
    attendanceTaken: i < 2,
    attended: i < 2 ? true : undefined,
    notes: i === 1 ? 'Great progress today!' : undefined,
    locationType: i % 2 === 0 ? 'in_person' : 'online',
    meetingLink: i % 2 !== 0 ? 'https://meet.example.com/session-' + uuidv4() : undefined,
  }));
};

// Helper to generate class schedule with proper typing
const generateClassSchedule = (startDate: Date, weeks: number, days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[], time: string) => {
  const sessions: any[] = [];
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  for (let week = 0; week < weeks; week++) {
    days.forEach(day => {
      const dayIndex = daysOfWeek.indexOf(day);
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + (week * 7) + (dayIndex - startDate.getDay() + 7) % 7);
      
      sessions.push({
        id: `sess-${uuidv4()}`,
        title: `Session ${sessions.length + 1}`,
        date: new Date(sessionDate),
        time,
        duration: 60,
        status: 'scheduled' as const,
        attendanceTaken: false,
        locationType: 'in_person' as const,
        maxParticipants: 15,
        currentParticipants: Math.floor(Math.random() * 15) + 1,
        coachId: 'coach1',
        gymId: 'gym1'
      });
    });
  }
  
  return sessions;
};

// Helper function to generate program schedule with proper typing
function generateProgramSchedule(startDate: Date, sessionsPerWeek: number, durationWeeks: number, coachId: string, programId: string) {
  const sessions: any[] = [];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (let week = 0; week < durationWeeks; week++) {
    for (let i = 0; i < sessionsPerWeek; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + (week * 7) + i);
      
      sessions.push({
        id: `sess-${uuidv4()}`,
        title: `Session ${sessions.length + 1}`,
        date: new Date(sessionDate),
        time: '18:00',
        duration: 60,
        status: 'scheduled' as const,
        attendanceTaken: false,
        locationType: 'in_person' as const,
        maxParticipants: 15,
        currentParticipants: Math.floor(Math.random() * 15) + 1,
        coachId,
        programId,
      });
    }
  }
  
  return sessions;
};

// ==================== MOCK DATA ====================

// Mock Users
export const mockUsers: User[] = [
  // Admin
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@sportflare.com',
    role: 'admin',
    avatar: '/assets/avatars/admin.jpg',
    bio: 'System administrator with full access to all features.'
  },
  
  // Regular User (Client)
  {
    id: 'user1',
    name: 'Alex Morgan',
    email: 'alex.user@example.com',
    role: 'user',
    avatar: '/assets/avatars/user1.jpg',
    bio: 'Fitness enthusiast looking to improve overall health and strength.',
    // Additional user data would be stored in separate tables/collections in a real app
  },
  
  // Coaches
  {
    id: 'coach1',
    name: 'Sarah Johnson',
    email: 'sarah.coach@example.com',
    role: 'coach',
    avatar: '/assets/avatars/coach1.jpg',
    bio: 'Certified personal trainer with 10+ years of experience in strength and conditioning.',
    // Coach-specific data
    specialties: ['Strength Training', 'Weight Loss', 'Athletic Performance'],
    rating: 4.8,
    hourlyRate: 80
  },
  {
    id: 'coach2',
    name: 'Mike Chen',
    email: 'mike.coach@example.com',
    role: 'coach',
    avatar: '/assets/avatars/coach2.jpg',
    bio: 'Yoga and mobility specialist helping people move better and feel better.',
    specialties: ['Yoga', 'Mobility', 'Injury Prevention'],
    rating: 4.9,
    hourlyRate: 70,
    certifications: [
      'RYT 500 Yoga Instructor',
      'Functional Movement Systems',
      'Precision Movement',
    ],
    languages: ['English', 'Arabic', 'French'],
    availability: {
      monday: [{ start: '07:00', end: '12:00' }, { start: '17:00', end: '20:00' }],
      tuesday: [{ start: '07:00', end: '12:00' }, { start: '17:00', end: '20:00' }],
      wednesday: [{ start: '07:00', end: '12:00' }],
      thursday: [{ start: '07:00', end: '12:00' }, { start: '17:00', end: '20:00' }],
      friday: [{ start: '07:00', end: '12:00' }],
      saturday: [{ start: '08:00', end: '14:00' }],
      sunday: [],
    },
    socialMedia: {
      instagram: '@mikechenyoga',
      facebook: 'mikechenyoga',
    },
  },
  
  // Gym Owners
  {
    id: 'gymowner1',
    name: 'Mohamed Ben Ali',
    email: 'mohamed.gym@example.com',
    role: 'gym_owner',
    avatar: '/assets/avatars/gymowner1.jpg',
    bio: 'Owner of Elite Fitness Center with over 15 years in the fitness industry.',
    gyms: ['gym1'],
  },
  {
    id: 'gymowner2',
    name: 'Leila Trabelsi',
    email: 'leila.gym@example.com',
    role: 'gym_owner',
    avatar: '/assets/avatars/gymowner2.jpg',
    bio: 'Passionate about creating inclusive fitness spaces for all levels.',
    gyms: ['gym2', 'gym3'],
  };

// Mock Gyms
export const mockGyms: Gym[] = [
  {
    id: 'gym1',
    name: 'Elite Fitness Center',
    description: 'Premium fitness center with state-of-the-art equipment and expert trainers.',
    address: '123 Fitness Street',
    city: 'Tunis',
    image: '/assets/gyms/elite-fitness.jpg',
    amenities: ['Locker Rooms', 'Showers', 'Sauna', 'Parking', 'WiFi', 'Swimming Pool', 'Café', 'Spa'],
    latitude: 36.8065,
    longitude: 10.1815,
    contactEmail: 'info@elitefitnesstn.com',
    phoneNumber: '+216 70 123 456',
    website: 'https://elitefitnesstn.com',
    operatingHours: [
      { day: 'monday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { day: 'tuesday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { day: 'wednesday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { day: 'thursday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { day: 'friday', openTime: '06:00', closeTime: '22:00', isOpen: true },
      { day: 'saturday', openTime: '08:00', closeTime: '20:00', isOpen: true },
      { day: 'sunday', openTime: '08:00', closeTime: '18:00', isOpen: true },
    ],
    socialMedia: {
      facebook: 'elitefitnesstn',
      instagram: 'elitefitnesstn',
      twitter: 'elitefitnesstn',
    },
    features: ['24/7 Access', 'Personal Training', 'Group Classes', 'Sauna', 'Steam Room', 'Indoor Pool'],
    capacity: 200,
    staffCount: 25,
    yearEstablished: 2015,
    membershipPlans: [
      {
        id: 'basic',
        name: 'Basic',
        price: 199,
        duration: 1,
        features: ['Gym Access', 'Locker Room', 'Free WiFi'],
        isPopular: false
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 499,
        duration: 1,
        features: ['Gym Access', 'All Classes', 'Sauna', 'Towel Service'],
        isPopular: true
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 899,
        duration: 1,
        features: ['24/7 Access', 'All Classes', 'Personal Trainer Discount', 'Massage Discounts'],
        isPopular: false
      }
    ],
    analytics: {
      totalCheckIns: 12458,
      activeMembers: 587,
      monthlyRevenue: 125000,
      averageRating: 4.7,
      lastUpdated: new Date()
    },
    settings: {
      checkInRequired: true,
      bookingWindowDays: 7,
      cancellationPolicyHours: 12,
      autoConfirmBookings: true,
      notifyOnNewBooking: true,
      notifyOnCheckIn: true,
      notifyOnClassFull: true
    },
    createdAt: new Date('2015-05-15'),
    updatedAt: new Date()
    country: 'Tunisia',
    phone: '+216 70 123 456',
    email: 'info@elitefitnesstn.com',
    website: 'https://elitefitnesstn.com',
    logo: '/assets/gyms/elite-fitness-logo.png',
    coverImage: '/assets/gyms/elite-fitness-cover.jpg',
    rating: 4.7,
    reviewCount: 128,
    isVerified: true,
    featured: true,
    ownerId: 'gymowner1',
    coaches: ['coach1', 'coach2'],
    socialMedia: {
      facebook: 'elitefitnesstn',
      instagram: 'elitefitnesstn',
    },
    createdAt: subDays(today, 14),
    updatedAt: today,
    startDate: addDays(today, 7),
    endDate: addDays(today, 91), // 12 weeks from start
    enrollmentDeadline: addDays(today, 3),
    maxParticipants: 20,
    currentParticipants: 15,
    isFull: false,
    isOnline: false,
    location: 'Elite Fitness Center - Main Studio',
    cancellationPolicy: '24 hours in advance',
    refundPolicy: 'Full refund up to 7 days before start date',
    materials: [
      {
        id: 'mat1',
        title: 'Program Guide',
        type: 'pdf',
        url: '/assets/materials/strength-program-guide.pdf',
        description: 'Complete program guide with workout details and nutrition tips'
      },
      {
        id: 'mat2',
        title: 'Meal Plan',
        type: 'pdf',
        url: '/assets/materials/nutrition-guide.pdf',
        description: 'Customizable meal plan to support your training'
      }
    ],
    faqs: [
      {
        question: 'Do I need previous experience?',
        answer: 'No, the program is designed for all fitness levels with modifications provided.'
      },
      {
        question: 'What equipment do I need?',
        answer: 'Basic gym equipment is required. A detailed list will be provided upon registration.'
      }
    ],
    schedule: generateClassSchedule(addDays(today, 7), 12, ['monday', 'wednesday', 'friday'], '18:00'),
  },
  {
    id: 'gym2',
    name: 'PowerHouse Gym',
    description: 'Serious training for serious athletes. No frills, just results.',
    address: '456 Athlete Avenue',
    city: 'Sousse',
    state: 'Sousse',
    country: 'Tunisia',
    phone: '+216 70 987 654',
    email: 'info@powerhousetn.com',
    logo: '/assets/gyms/powerhouse-logo.png',
    coverImage: '/assets/gyms/powerhouse-cover.jpg',
    rating: 4.5,
    reviewCount: 89,
    isVerified: true,
    featured: false,
    ownerId: 'gymowner2',
    socialMedia: {
      instagram: 'powerhousetn',
      facebook: 'powerhousetn',
    },
    createdAt: new Date('2019-03-10'),
    updatedAt: new Date('2023-06-15'),
  };

// Mock Brands
export const mockBrands: Brand[] = [
  {
    id: 'brand1',
    name: 'Nike',
    description: 'Just Do It. World leader in athletic footwear, apparel, and equipment.',
    logo: '/assets/brands/nike-logo.png'
    createdAt: new Date('2020-05-10'),
    updatedAt: new Date('2023-06-20'),
  },
  {
    id: 'brand2',
    name: 'PureFuel',
    description: 'Clean, science-backed sports nutrition supplements.',
    logo: '/assets/brands/purefuel-logo.png',
    bannerImage: '/assets/brands/purefuel-banner.jpg',
    website: 'https://purefuel.tn',
    email: 'info@purefuel.tn',
    phone: '+216 70 333 444',
    address: '789 Health St, Sousse, Tunisia',
    city: 'Sousse',
    country: 'Tunisia',
    socialMedia: {
      facebook: 'purefueltn',
      instagram: 'purefueltn',
    },
    isVerified: true,
    isActive: true,
    productCount: 18,
    ratingAverage: 4.8,
    reviewCount: 203,
    createdAt: new Date('2019-11-15'),
    updatedAt: new Date('2023-07-05'),
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod1',
    title: 'Nike Air Zoom Pegasus 40',
    description: 'Responsive running shoes with Zoom Air cushioning for a smooth ride.',
    brandId: 'brand1',
    brand: mockBrands[0],
    image: '/assets/products/nike-pegasus.jpg',
    price: 129.99,
    category: 'Footwear',
    stock: 50,
    rating: 4.7
  },
  {
    id: 'prod2',
    title: 'Reebok Nano X1',
    description: 'Versatile training shoes designed for CrossFit and HIIT workouts.',
    brandId: 'brand2',
    brand: mockBrands[1],
    image: '/assets/products/reebok-nano.jpg',
    price: 139.99,
    category: 'Footwear',
    stock: 35,
    rating: 4.8
  },
  {
    id: 'prod3',
    title: 'Lululemon Align Leggings',
    description: 'Buttery-soft leggings perfect for yoga and low-impact workouts.',
    brandId: 'brand3',
    brand: mockBrands[2],
    image: '/assets/products/lulu-leggings.jpg',
    price: 98.00,
    category: 'Apparel',
    stock: 25,
    rating: 4.9
  }
];

// Mock Classes
export const mockClasses: Class[] = [
  // Upcoming classes
  {
    id: 'class1',
    title: 'Morning HIIT',
    description: 'High-intensity interval training to boost metabolism and burn fat.',
    coachId: 'coach1',
    coach: mockUsers[1],
    gymId: 'gym1',
    gym: mockGyms[0],
    image: '/assets/classes/hiit.jpg',
    date: new Date(tomorrow.setHours(7, 0, 0, 0)), // Tomorrow at 7 AM
    duration: 45,
    capacity: 20,
    enrolled: 15,
    price: 20,
    tags: ['HIIT', 'Cardio', 'All Levels'],
    rating: 4.8,
    status: 'confirmed'
  },
  {
    id: 'class2',
    title: 'Vinyasa Flow',
    description: 'Flowing yoga sequence linking breath with movement.',
    coachId: 'coach2',
    coach: mockUsers[2],
    gymId: 'gym2',
    gym: mockGyms[1],
    image: '/assets/classes/yoga.jpg',
    date: new Date(tomorrow.setHours(18, 0, 0, 0)), // Tomorrow at 6 PM
    duration: 60,
    capacity: 15,
    enrolled: 12,
    price: 25,
    tags: ['Yoga', 'All Levels'],
    rating: 4.9,
    status: 'confirmed'
  },
  // Class with counter proposal
  {
    id: 'class3',
    title: 'Strength & Conditioning',
    description: 'Build strength and improve athletic performance with compound lifts.',
    coachId: 'coach1',
    coach: mockUsers[1],
    gymId: 'gym1',
    gym: mockGyms[0],
    image: '/assets/classes/strength.jpg',
    date: new Date(nextWeek.setDate(nextWeek.getDate() + 2)),
    duration: 60,
    capacity: 12,
    enrolled: 8,
    price: 30,
    tags: ['Strength', 'Conditioning', 'Intermediate'],
    rating: 4.7,
    status: 'counter_proposed',
    gymProposal: {
      date: new Date(nextWeek.setDate(nextWeek.getDate() + 3)),
      capacity: 15,
      price: 25
    }
  }
];

// Mock Programs
export const mockPrograms: Program[] = [
  // Active program with upcoming sessions
  {
    id: 'prog1',
    title: '12-Week Strength & Conditioning',
    description: 'Transform your body with this comprehensive strength and conditioning program. Perfect for all fitness levels, this program focuses on building muscle, increasing strength, and improving overall fitness.',
    coachId: 'coach1',
    coach: mockUsers[1],
    image: '/assets/programs/strength-builder.jpg',
    duration: 8,
    classes: [mockClasses[0], mockClasses[2]],
    price: 199,
    tags: ['Strength', 'Muscle Growth', 'Progressive Overload'],
    rating: 4.8
  },
  {
    id: 'prog2',
    title: '30-Day Yoga Challenge',
    description: 'Transform your practice with daily yoga sessions for 30 days.',
    coachId: 'coach2',
    coach: mockUsers[2],
    image: '/assets/programs/yoga-challenge.jpg',
    duration: 4,
    classes: [mockClasses[1]],
    price: 149,
    tags: ['Yoga', 'Flexibility', 'Mindfulness'],
    rating: 4.9
  }
];

// Mock Bookings
export const mockBookings: Booking[] = [
  // Upcoming private session
  {
    id: 'book1',
    type: 'private',
    userId: 'user1',
    date: new Date(tomorrow.setHours(16, 0, 0, 0)),
    time: '16:00',
    duration: 60,
    price: 80,
    status: 'confirmed',
    paymentStatus: 'pending',
    messagingEnabled: true,
    ratingGiven: false,
    coachId: 'coach1',
    coachName: 'Sarah Johnson',
    gymId: 'gym1',
    gymName: 'Elite Fitness Center',
    title: 'Personal Training',
    description: 'One-on-one training session focusing on strength and form',
    maxParticipants: 1,
    currentParticipants: 1,
    autoConfirm: true,
    requiresPayment: true,
    createdAt: twoWeeksAgo,
    updatedAt: twoWeeksAgo
  },
  // Completed session with pending rating
  {
    id: 'book2',
    type: 'private',
    userId: 'user2',
    date: twoWeeksAgo,
    time: '10:00',
    duration: 60,
    price: 70,
    status: 'completed',
    paymentStatus: 'held',
    messagingEnabled: true,
    ratingGiven: false,
    coachId: 'coach2',
    coachName: 'Mike Chen',
    coachRating: 5,
    coachFeedback: 'Great session!',
    gymId: 'gym2',
    gymName: 'Zen Yoga Studio',
    title: 'Private Yoga Session',
    description: 'Personalized yoga practice focusing on flexibility and relaxation',
    maxParticipants: 1,
    currentParticipants: 1,
    autoConfirm: true,
    requiresPayment: true,
    createdAt: new Date(twoWeeksAgo.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before session
    updatedAt: twoWeeksAgo
  },
  // Class booking
  {
    id: 'book3',
    type: 'class',
    userId: 'user1',
    date: new Date(tomorrow.setHours(7, 0, 0, 0)),
    time: '07:00',
    duration: 45,
    price: 20,
    status: 'confirmed',
    paymentStatus: 'released',
    messagingEnabled: true,
    ratingGiven: false,
    classId: 'class1',
    className: 'Morning HIIT',
    coachId: 'coach1',
    coachName: 'Sarah Johnson',
    gymId: 'gym1',
    gymName: 'Elite Fitness Center',
    title: 'Morning HIIT',
    description: 'High-intensity interval training to boost metabolism and burn fat.',
    maxParticipants: 20,
    currentParticipants: 15,
    autoConfirm: true,
    requiresPayment: true,
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
  },
  // Program booking
  {
    id: 'book4',
    type: 'program',
    userId: 'user2',
    date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    time: '09:00',
    duration: 60,
    price: 199,
    status: 'confirmed',
    paymentStatus: 'released',
    messagingEnabled: true,
    ratingGiven: true,
    userRating: 5,
    userFeedback: 'Amazing program!',
    programId: 'prog2',
    programName: '30-Day Yoga Challenge',
    coachId: 'coach2',
    coachName: 'Mike Chen',
    coachRating: 5,
    coachFeedback: 'Great participant!',
    gymId: 'gym2',
    gymName: 'Zen Yoga Studio',
    title: '30-Day Yoga Challenge',
    description: 'Transform your practice with daily yoga sessions for 30 days.',
    startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    maxParticipants: 20,
    currentParticipants: 15,
    autoConfirm: true,
    requiresPayment: true,
    sessions: [
      {
        id: 'sess1',
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        time: '09:00',
        duration: 60,
        status: 'completed'
      },
      {
        id: 'sess2',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        time: '09:00',
        duration: 60,
        status: 'confirmed'
      },
      {
        id: 'sess3',
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        time: '09:00',
        duration: 60,
        status: 'confirmed'
      },
      {
        id: 'sess4',
        date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        time: '09:00',
        duration: 60,
        status: 'confirmed'
      }
    ],
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user1',
    receiverId: 'coach1',
    content: 'Hi Sarah, I wanted to check if we can reschedule our session to 5 PM instead?',
    timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: true
  },
  {
    id: 'msg2',
    senderId: 'coach1',
    receiverId: 'user1',
    content: 'Hi John, I can do 5:30 PM. Would that work for you?',
    timestamp: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    isRead: true
  },
  {
    id: 'msg3',
    senderId: 'user1',
    receiverId: 'coach1',
    content: 'Yes, 5:30 PM works great! See you then.',
    timestamp: new Date(today.getTime() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    title: 'Class Reminder',
    message: 'Your Morning HIIT class starts in 2 hours',
    type: 'class',
    isRead: false,
    createdAt: new Date(),
    actionType: 'navigate',
    actionData: {
      route: '/bookings/book3'
    }
  },
  {
    id: 'notif2',
    userId: 'user1',
    title: 'New Message',
    message: 'You have a new message from Sarah Johnson',
    type: 'message',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    actionType: 'modal',
    actionData: {
      modalType: 'coach',
      entityId: 'coach1'
    }
  },
  {
    id: 'notif3',
    userId: 'user1',
    title: 'Session Completed',
    message: 'Your session with Mike Chen has been completed. Please leave a rating!',
    type: 'coach_booking',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    actionType: 'navigate',
    actionData: {
      route: '/bookings/book2/rate'
    }
  },
  {
    id: 'notif4',
    userId: 'user1',
    title: 'Subscription Renewal',
    message: 'Your Premium subscription will renew in 7 days',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    actionType: 'navigate',
    actionData: {
      route: '/account/subscription'
    }
  },
  {
    id: 'notif5',
    userId: 'user1',
    title: 'Class Reminder',
    message: 'Your Morning HIIT class starts in 2 hours',
    type: 'class',
    isRead: false,
    createdAt: new Date(),
    actionType: 'navigate',
    actionData: {
      route: '/bookings/book3'
    }
  }
];

// API Configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sportflare.fit',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
    },
    users: {
      profile: '/users/me',
      updateProfile: '/users/me',
      changePassword: '/users/me/password',
      uploadAvatar: '/users/me/avatar',
    },
    gyms: {
      list: '/gyms',
      details: (id: string) => `/gyms/${id}`,
      search: '/gyms/search',
    },
    classes: {
      list: '/classes',
      details: (id: string) => `/classes/${id}`,
      book: (id: string) => `/classes/${id}/book`,
      cancel: (id: string) => `/classes/${id}/cancel`,
    },
    programs: {
      list: '/programs',
      details: (id: string) => `/programs/${id}`,
      enroll: (id: string) => `/programs/${id}/enroll`,
      leave: (id: string) => `/programs/${id}/leave`,
    },
    bookings: {
      list: '/bookings',
      details: (id: string) => `/bookings/${id}`,
      create: '/bookings',
      update: (id: string) => `/bookings/${id}`,
      cancel: (id: string) => `/bookings/${id}/cancel`,
      rate: (id: string) => `/bookings/${id}/rate`,
    },
    messages: {
      list: '/messages',
      send: '/messages',
      conversation: (userId: string) => `/messages/conversation/${userId}`,
      markAsRead: (messageId: string) => `/messages/${messageId}/read`,
    },
    notifications: {
      list: '/notifications',
      markAsRead: (id: string) => `/notifications/${id}/read`,
      markAllAsRead: '/notifications/read-all',
    },
    products: {
      list: '/products',
      details: (id: string) => `/products/${id}`,
      search: '/products/search',
    },
    orders: {
      create: '/orders',
      list: '/orders',
      details: (id: string) => `/orders/${id}`,
      cancel: (id: string) => `/orders/${id}/cancel`,
    },
    subscriptions: {
      plans: '/subscriptions/plans',
      subscribe: '/subscriptions/subscribe',
      cancel: '/subscriptions/cancel',
      update: '/subscriptions/update',
      status: '/subscriptions/status',
    },
  },
};

// Environment Configuration
export const envConfig = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sportflare.com/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.sportflare.com',
  
  // Authentication
  authCookieName: 'sportflare_auth_token',
  refreshTokenCookieName: 'sportflare_refresh_token',
  tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
  
  // Feature Flags
  features: {
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
    enableMessaging: true,
    enableNotifications: true,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableMaintenance: false
  },
  
  // Third-party Services
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // App Settings
  defaultPageSize: 10,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  
  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://sportflare.com',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.sportflare.com',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// Helper function to get user by ID
export function getUserById(userId: string): User | undefined {
  return mockUsers.find(user => user.id === userId);
}

// Helper function to get gym by ID
export const getGymById = (gymId: string): Gym | undefined =>
  mockGyms.find(gym => gym.id === gymId);

// Mock Gym Analytics
export const mockGymAnalytics: GymAnalytics = {
  totalCheckIns: 12458,
  activeMembers: 587,
  newMembers: 42,
  avgCheckInsPerDay: 415,
  monthlyRevenue: 125000,
  revenueChange: 12.5, // 12.5% increase from last month
  
  classAttendance: [
    {
      classId: 'class1',
      className: 'HIIT',
      attendanceRate: 85,
      totalSessions: 24,
      totalAttendees: 408,
      peakTime: '18:00',
      revenue: 20400
    },
    {
      classId: 'class2',
      className: 'Yoga',
      attendanceRate: 92,
      totalSessions: 20,
      totalAttendees: 368,
      peakTime: '19:00',
      revenue: 18400
    },
    // Add more classes...
  ],
  
  coachPerformance: [
    {
      coachId: 'coach1',
      coachName: 'Sarah Johnson',
      rating: 4.9,
      classesTaught: 32,
      totalAttendees: 512,
      revenueGenerated: 25600
    },
    // Add more coaches...
  ],
  
  hourlyCheckIns: [
    { hour: '06:00', count: 15 },
    { hour: '07:00', count: 48 },
    { hour: '08:00', count: 72 },
    { hour: '09:00', count: 35 },
    { hour: '10:00', count: 28 },
    { hour: '11:00', count: 32 },
    { hour: '12:00', count: 65 },
    { hour: '13:00', count: 42 },
    { hour: '14:00', count: 38 },
    { hour: '15:00', count: 45 },
    { hour: '16:00', count: 68 },
    { hour: '17:00', count: 95 },
    { hour: '18:00', count: 142 },
    { hour: '19:00', count: 128 },
    { hour: '20:00', count: 85 },
    { hour: '21:00', count: 42 },
    { hour: '22:00', count: 18 },
  ],
  
  dailyCheckIns: [
    { day: 'Mon', count: 415 },
    { day: 'Tue', count: 432 },
    { day: 'Wed', count: 458 },
    { day: 'Thu', count: 472 },
    { day: 'Fri', count: 498 },
    { day: 'Sat', count: 312 },
    { day: 'Sun', count: 287 },
  ],
  
  weeklyCheckIns: Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    count: Math.floor(Math.random() * 500) + 1500
  })),
  
  monthlyCheckIns: [
    { month: 'Jan', count: 12548 },
    { month: 'Feb', count: 11876 },
    { month: 'Mar', count: 13456 },
    { month: 'Apr', count: 12897 },
    { month: 'May', count: 14234 },
    { month: 'Jun', count: 13876 },
    { month: 'Jul', count: 12458 },
  ],
  
  revenueBySource: [
    { source: 'memberships', amount: 87500, percentage: 70 },
    { source: 'classes', amount: 25000, percentage: 20 },
    { source: 'personal_training', amount: 10000, percentage: 8 },
    { source: 'merchandise', amount: 2500, percentage: 2 },
  ],
  
  memberDemographics: {
    ageGroups: [
      { range: '18-24', count: 98 },
      { range: '25-34', count: 187 },
      { range: '35-44', count: 156 },
      { range: '45-54', count: 98 },
      { range: '55+', count: 48 },
    ],
    genderDistribution: [
      { gender: 'Male', count: 352 },
      { gender: 'Female', count: 235 },
    ],
    membershipTiers: [
      { tier: 'Basic', count: 235 },
      { tier: 'Premium', count: 298 },
      { tier: 'VIP', count: 54 },
    ],
  },
};

// Mock Check-in Records
export const mockCheckInRecords: CheckInRecord[] = Array.from({ length: 50 }, (_, i) => {
  const checkInDate = subDays(new Date(), Math.floor(i / 10));
  const checkInTime = addHours(new Date(checkInDate), 6 + Math.floor(Math.random() * 12));
  const checkOutTime = addHours(checkInTime, 1 + Math.random() * 2);
  
  return {
    id: `checkin-${i + 1}`,
    userId: `user${Math.floor(Math.random() * 50) + 1}`,
    userName: `User ${i + 1}`,
    userAvatar: `/assets/avatars/user${(i % 10) + 1}.jpg`,
    checkInTime,
    checkOutTime,
    duration: Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 60000),
    type: Math.random() > 0.3 ? 'gym' : 'class',
    classId: Math.random() > 0.7 ? `class${Math.floor(Math.random() * 5) + 1}` : undefined,
    className: Math.random() > 0.7 ? ['HIIT', 'Yoga', 'Zumba', 'Cycling', 'Pilates'][Math.floor(Math.random() * 5)] : undefined,
    coachId: Math.random() > 0.7 ? `coach${Math.floor(Math.random() * 3) + 1}` : undefined,
    coachName: Math.random() > 0.7 ? ['Sarah Johnson', 'Mike Chen', 'Emma Wilson'][Math.floor(Math.random() * 3)] : undefined,
    membershipTier: ['Basic', 'Premium', 'VIP'][Math.floor(Math.random() * 3)],
    paymentStatus: ['paid', 'pending', 'free'][Math.floor(Math.random() * 3)] as 'paid' | 'pending' | 'free',
    revenue: [0, 29.99, 49.99, 79.99][Math.floor(Math.random() * 4)],
    deviceId: `device-${Math.floor(Math.random() * 1000)}`,
    location: {
      latitude: 36.8065 + (Math.random() * 0.01 - 0.005),
      longitude: 10.1815 + (Math.random() * 0.01 - 0.005)
    }
  };
});

// Mock Promotions
export const mockGymPromotions: GymPromotion[] = [
  {
    id: 'promo1',
    title: 'Summer Special',
    description: '20% off all memberships',
    type: 'discount',
    discountPercentage: 20,
    applicableItems: ['basic', 'premium', 'vip'],
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-31'),
    isActive: true,
    totalRedemptions: 87,
    maxRedemptions: 200,
    promoCode: 'SUMMER23',
    conditions: 'New members only. Cannot be combined with other offers.',
    createdBy: 'admin1',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-07-10')
  },
  // Add more promotions...
];

// Helper function to get class by ID
export const getClassById = (classId: string): Class | undefined =>
  mockClasses.find(cls => cls.id === classId);

// Helper function to get program by ID
export const getProgramById = (programId: string): Program | undefined =>
  mockPrograms.find(prog => prog.id === programId);

// Helper function to get bookings for a user
export const getBookingsByUserId = (userId: string): Booking[] =>
  mockBookings.filter(booking => booking.userId === userId);

// Helper function to get bookings for a coach
export const getBookingsByCoachId = (coachId: string): Booking[] =>
  mockBookings.filter(booking => 'coachId' in booking && booking.coachId === coachId);

// Helper function to get messages between two users
export const getMessagesBetweenUsers = (userId1: string, userId2: string): Message[] =>
  mockMessages.filter(msg => 
    (msg.senderId === userId1 && msg.receiverId === userId2) ||
    (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

// Helper function to get unread notifications count
export const getUnreadNotificationsCount = (userId: string): number =>
  mockNotifications.filter(notif => notif.userId === userId && !notif.isRead).length;
