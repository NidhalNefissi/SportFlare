import { 
  User, 
  UserRole, 
  Class, 
  Program, 
  Gym, 
  Product, 
  Brand,
  Order, 
  Message, 
  Notification,
  AIMessage,
  ClassProposal,
  ClassModification,
  ClassStatus,
  Review
} from '@/types';

// Mock User Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'client@example.com',
    role: 'client',
    avatar: '/assets/avatars/client.jpg',
    bio: 'Fitness enthusiast looking to improve my health and strength.',
    achievements: [
      {
        id: '1',
        title: 'First Workout',
        description: 'Completed your first workout on the platform',
        icon: '🏋️‍♂️',
        earnedAt: new Date('2023-01-01'),
      },
    ],
    subscription: {
      id: '1',
      plan: 'premium',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      autoRenew: true,
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'coach@example.com',
    role: 'coach',
    avatar: '/assets/avatars/coach.jpg',
    bio: 'Professional fitness coach with 10+ years of experience.',
    subscription: {
      id: '2',
      plan: 'pro',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      autoRenew: true,
    },
  },
  {
    id: '3',
    name: 'FitZone Gym',
    email: 'gym@example.com',
    role: 'gym',
    avatar: '/assets/avatars/gym.jpg',
    bio: 'Modern gym facility with state-of-the-art equipment.',
  },
  {
    id: '4',
    name: 'FitGear',
    email: 'brand@example.com',
    role: 'brand',
    avatar: '/assets/avatars/brand.jpg',
    bio: 'Premium fitness equipment and apparel.',
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: '/assets/avatars/admin.jpg',
  },
];

// Mock Gym Data
export const mockGyms: Gym[] = [
  {
    id: '1',
    name: 'FitZone Gym',
    description: 'Modern gym with state-of-the-art equipment',
    address: '123 Fitness St',
    city: 'Tunis',
    image: '/assets/gyms/fitzone.jpg',
    amenities: ['Pool', 'Sauna', 'Parking'],
    rating: 4.8,
    latitude: 36.8065,
    longitude: 10.1815,
  },
  {
    id: '2',
    name: 'ZenFit Studio',
    description: 'Peaceful studio focused on mind-body connection',
    address: '456 Zen Ave',
    city: 'Sousse',
    image: '/assets/gyms/zenfit.jpg',
    amenities: ['Meditation Room', 'Tea Bar'],
    rating: 4.7,
    latitude: 35.8245,
    longitude: 10.6346,
  },
  {
    id: '3',
    name: 'PowerHouse Gym',
    description: 'For serious strength training enthusiasts',
    address: '789 Power Rd',
    city: 'Sfax',
    image: '/assets/gyms/powerhouse.jpg',
    amenities: ['Heavy Weights', 'Crossfit Area', 'Protein Bar'],
    rating: 4.6,
    latitude: 34.7398,
    longitude: 10.7600,
  },
];

// Mock Brand Data
export const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'FitGear',
    description: 'Premium fitness equipment and apparel.',
    logo: '/assets/brands/fitgear.jpg',
  },
  {
    id: '2',
    name: 'ProNutrition',
    description: 'High-quality protein and supplements.',
    logo: '/assets/brands/pronutrition.jpg',
  },
  {
    id: '3',
    name: 'GymFlow',
    description: 'Trendy workout clothing and accessories.',
    logo: '/assets/brands/gymflow.jpg',
  },
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: '1',
    title: 'Advanced Yoga',
    description: 'Deep stretching and mindfulness yoga session for intermediate and advanced practitioners.',
    coachId: '2',
    coach: mockUsers[1] as User,
    gymId: '1',
    gym: mockGyms[0],
    image: '/assets/classes/yoga.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 60,
    capacity: 15,
    enrolled: 8,
    price: 25,
    tags: ['Yoga', 'Mindfulness', 'Flexibility'],
    rating: 4.8,
  },
  {
    id: '2',
    title: 'HIIT Workout',
    description: 'High-intensity interval training to burn calories and improve cardiovascular fitness.',
    coachId: '2',
    coach: mockUsers[1] as User,
    gymId: '1',
    gym: mockGyms[0],
    image: '/assets/classes/hiit.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    duration: 45,
    capacity: 20,
    enrolled: 15,
    price: 20,
    tags: ['HIIT', 'Cardio', 'Weight Loss'],
    rating: 4.7,
  },
  {
    id: '3',
    title: 'Strength Training',
    description: 'Build muscle and increase strength through progressive weight training.',
    coachId: '2',
    coach: mockUsers[1] as User,
    gymId: '3',
    gym: mockGyms[2],
    image: '/assets/classes/strength.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    duration: 75,
    capacity: 12,
    enrolled: 10,
    price: 30,
    tags: ['Strength', 'Muscle Building', 'Weightlifting'],
    rating: 4.9,
  },
];

// Mock Programs
export const mockPrograms: Program[] = [
  {
    id: '1',
    title: '6-Week Body Transformation',
    description: 'Comprehensive program designed to transform your physique in just 6 weeks.',
    coachId: '2',
    coach: mockUsers[1] as User,
    image: '/images/Transformation.jpg',
    duration: 6,
    classes: [mockClasses[0], mockClasses[1]],
    price: 199,
    tags: ['Weight Loss', 'Muscle Toning', 'Nutrition'],
    rating: 4.9,
  },
  {
    id: '2',
    title: 'Yoga Foundations',
    description: 'Build a strong yoga practice from the ground up with this beginner-friendly program.',
    coachId: '2',
    coach: mockUsers[1] as User,
    image: '/assets/programs/yoga.jpg',
    duration: 8,
    classes: [mockClasses[0]],
    price: 149,
    tags: ['Yoga', 'Flexibility', 'Mindfulness'],
    rating: 4.8,
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat perfect for all types of yoga practices.',
    brandId: '1',
    brand: mockBrands[0],
    image: '/assets/products/yogamat.jpg',
    price: 59.99,
    category: 'Equipment',
    stock: 50,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Protein Powder - Chocolate',
    description: 'High-quality whey protein with delicious chocolate flavor.',
    brandId: '2',
    brand: mockBrands[1],
    image: '/assets/products/protein.jpg',
    price: 39.99,
    category: 'Supplements',
    stock: 100,
    rating: 4.7,
  },
  {
    id: '3',
    title: 'Workout Leggings',
    description: 'Comfortable, breathable leggings perfect for any workout.',
    brandId: '3',
    brand: mockBrands[2],
    image: '/assets/products/leggings.jpg',
    price: 45.99,
    category: 'Apparel',
    stock: 75,
    rating: 4.9,
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    products: [
      { product: mockProducts[0], quantity: 1 },
      { product: mockProducts[1], quantity: 2 },
    ],
    totalPrice: 139.97,
    status: 'delivered',
    shippingAddress: '123 Main St, Apt 4, Tunis',
    createdAt: new Date('2023-05-15'),
  },
  {
    id: '2',
    userId: '1',
    products: [
      { product: mockProducts[2], quantity: 1 },
    ],
    totalPrice: 45.99,
    status: 'shipped',
    shippingAddress: '123 Main St, Apt 4, Tunis',
    createdAt: new Date('2023-06-20'),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Welcome to SportFlare!',
    message: 'Thank you for joining SportFlare. Explore our classes and start your fitness journey today!',
    type: 'system',
    isRead: false,
    createdAt: new Date('2023-06-01'),
  },
  {
    id: '2',
    userId: '1',
    title: 'Class Reminder',
    message: 'Your Advanced Yoga class is tomorrow at 10:00 AM.',
    type: 'class',
    isRead: false,
    createdAt: new Date('2023-06-25'),
  },
  {
    id: '3',
    userId: '2',
    title: 'New Student',
    message: 'John Doe has enrolled in your Advanced Yoga class.',
    type: 'class',
    isRead: false,
    createdAt: new Date('2023-06-24'),
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Hi, I have a question about the Advanced Yoga class.',
    timestamp: new Date('2023-06-20T14:30:00'),
    isRead: true,
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'Sure, what would you like to know?',
    timestamp: new Date('2023-06-20T14:35:00'),
    isRead: true,
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'Do I need to bring my own yoga mat?',
    timestamp: new Date('2023-06-20T14:37:00'),
    isRead: true,
  },
  {
    id: '4',
    senderId: '2',
    receiverId: '1',
    content: 'Yes, please bring your own mat if possible. We have some extras if you need one.',
    timestamp: new Date('2023-06-20T14:40:00'),
    isRead: false,
  },
];

// Mock AI Coach Messages
export const mockAIMessages: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI fitness coach. How can I help you today?',
    timestamp: new Date('2023-06-25T10:00:00'),
  },
  {
    id: '2',
    role: 'user',
    content: 'I want to improve my core strength. Can you suggest some exercises?',
    timestamp: new Date('2023-06-25T10:01:00'),
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Absolutely! For core strength, I recommend planks, Russian twists, and bicycle crunches. Would you like me to create a full core workout routine for you?',
    timestamp: new Date('2023-06-25T10:02:00'),
  },
];

// Booking Status Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'pay-at-gym';

// Extended Types
export interface Booking {
  id: string;
  userId: string;
  classId: string;
  className: string;
  gymId: string;
  gymName: string;
  coachId: string;
  coachName: string;
  date: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  price: number;
  createdAt: Date;
  checkedIn: boolean;
  checkedInAt?: Date;
  cancelledAt?: Date;
  refundAmount?: number;
}

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '1',
    classId: '1',
    className: 'Advanced Yoga',
    gymId: '1',
    gymName: 'FitZone Gym',
    coachId: '2',
    coachName: 'Jane Smith',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    price: 25,
    createdAt: new Date('2023-06-20'),
    checkedIn: false,
  },
  {
    id: '2',
    userId: '1',
    classId: '2',
    className: 'HIIT Workout',
    gymId: '1',
    gymName: 'FitZone Gym',
    coachId: '2',
    coachName: 'Jane Smith',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    status: 'confirmed',
    paymentStatus: 'pending',
    paymentMethod: 'pay-at-gym',
    price: 20,
    createdAt: new Date('2023-06-22'),
    checkedIn: false,
  },
];

// CheckIn Interface
export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  gymId: string;
  gymName: string;
  classId?: string;
  className?: string;
  timestamp: Date;
}

// Mock CheckIns
export const mockCheckIns: CheckIn[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    gymId: '1',
    gymName: 'FitZone Gym',
    timestamp: new Date('2023-06-15T10:00:00'),
  },
  {
    id: '2',
    userId: '1',
    userName: 'John Doe',
    gymId: '1',
    gymName: 'FitZone Gym',
    classId: '1',
    className: 'Advanced Yoga',
    timestamp: new Date('2023-06-18T15:00:00'),
  },
];

// Mock class proposals
export const mockClassProposals: ClassProposal[] = [
  {
    id: 'proposal_1',
    title: 'Advanced Yoga Flow',
    description: 'A challenging yoga class focusing on advanced poses and transitions',
    coachId: '2',
    coach: mockUsers.find(u => u.id === '2') as User,
    gymId: '1',
    gym: mockGyms.find(g => g.id === '1') as Gym,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
    duration: 75,
    capacity: 15,
    price: 25,
    tags: ['Yoga', 'Advanced', 'Flexibility'],
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'proposal_2',
    title: 'Beginner Strength Training',
    description: 'Introduction to strength training fundamentals for beginners',
    coachId: '2',
    coach: mockUsers.find(u => u.id === '2') as User,
    gymId: '2',
    gym: mockGyms.find(g => g.id === '2') as Gym,
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
    duration: 60,
    capacity: 12,
    price: 20,
    tags: ['Strength', 'Beginner', 'Weight Training'],
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: 'proposal_3',
    title: 'High-Intensity Interval Training',
    description: 'Fast-paced HIIT workout to maximize calorie burn',
    coachId: '2',
    coach: mockUsers.find(u => u.id === '2') as User,
    gymId: '1',
    gym: mockGyms.find(g => g.id === '1') as Gym,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
    duration: 45,
    capacity: 20,
    price: 22,
    tags: ['HIIT', 'Cardio', 'Weight Loss'],
    status: 'rejected',
    notes: 'Class schedule conflicts with another high-demand class',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  }
];

// Mock class modifications
export const mockClassModifications: ClassModification[] = [
  {
    id: 'modification_1',
    classId: '1',
    requesterId: '2',
    requester: mockUsers.find(u => u.id === '2') as User,
    originalData: {
      title: 'Advanced Yoga',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      duration: 60
    },
    proposedChanges: {
      title: 'Advanced Yoga: Extended Session',
      duration: 75
    },
    reason: 'Extending class duration to include more advanced poses and longer relaxation period',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 'modification_2',
    classId: '2',
    requesterId: '2',
    requester: mockUsers.find(u => u.id === '2') as User,
    originalData: {
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      capacity: 15,
      price: 25
    },
    proposedChanges: {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      capacity: 20,
      price: 20
    },
    reason: 'Moving class to a larger room allows for more participants at a reduced price',
    status: 'approved',
    responseNote: 'Changes approved. Please ensure you have proper equipment for the additional participants.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
];

// Mock reviews
export const mockReviews: Review[] = [
  {
    id: 'review_1',
    userId: '1',
    user: mockUsers.find(u => u.id === '1') as User,
    entityId: '1', // Class ID
    entityType: 'class',
    rating: 5,
    comment: 'Fantastic yoga class! The instructor was very knowledgeable and helpful.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    helpfulCount: 3
  },
  {
    id: 'review_2',
    userId: '1',
    user: mockUsers.find(u => u.id === '1') as User,
    entityId: '2', // Class ID
    entityType: 'class',
    rating: 4,
    comment: 'Great HIIT workout. Really challenged me but in a good way!',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    helpfulCount: 2,
    reply: {
      userId: '2',
      userName: 'Jane Smith',
      content: 'Thanks for your feedback! Glad you enjoyed the workout.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
  }
];

// Export all mock data for easy access
export const mockData = {
  users: mockUsers,
  gyms: mockGyms,
  brands: mockBrands,
  classes: mockClasses,
  programs: mockPrograms,
  products: mockProducts,
  orders: mockOrders,
  notifications: mockNotifications,
  messages: mockMessages,
  aiMessages: mockAIMessages,
  bookings: mockBookings,
  checkIns: mockCheckIns,
  classProposals: mockClassProposals,
  classModifications: mockClassModifications,
  reviews: mockReviews
};

// Helper to deep clone objects while preserving dates
export function cloneWithDates<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cloneWithDates(item)) as unknown as T;
  }
  
  const clonedObj = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = cloneWithDates(obj[key]);
    }
  }
  
  return clonedObj;
}