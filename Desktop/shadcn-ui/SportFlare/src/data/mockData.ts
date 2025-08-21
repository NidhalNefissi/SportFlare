import { Class, Program } from '@/types';

// Mock classes data
export const mockClasses: Class[] = [
  {
    id: '1',
    title: 'HIIT Workout',
    description: 'High-intensity interval training to boost your metabolism',
    coachId: '2',
    coach: {
      id: '2',
      name: 'Jane Smith',
      email: 'coach@example.com',
      role: 'coach',
      avatar: '/assets/avatars/coach.jpg'
    },
    gymId: '1',
    gym: {
      id: '1',
      name: 'FitZone Gym',
      description: 'Modern gym with state-of-the-art equipment',
      address: '123 Fitness St',
      city: 'New York',
      image: '/assets/gyms/fitzone.jpg',
      amenities: ['Pool', 'Sauna', 'Parking'],
      rating: 4.8,
      latitude: 40.712776,
      longitude: -74.005974
    },
    image: '/assets/classes/hiit.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 45,
    capacity: 20,
    enrolled: 12,
    price: 15,
    tags: ['HIIT', 'Cardio', 'Intermediate'],
    rating: 4.7
  },
  {
    id: '2',
    title: 'Yoga Flow',
    description: 'Relaxing yoga session to improve flexibility',
    coachId: '3',
    coach: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'coach',
      avatar: '/assets/avatars/mike.jpg'
    },
    gymId: '2',
    gym: {
      id: '2',
      name: 'ZenFit Studio',
      description: 'Peaceful studio focused on mind-body connection',
      address: '456 Zen Ave',
      city: 'Los Angeles',
      image: '/assets/gyms/zenfit.jpg',
      amenities: ['Meditation Room', 'Tea Bar'],
      rating: 4.7,
      latitude: 34.052235,
      longitude: -118.243683
    },
    image: '/assets/classes/yoga.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    duration: 60,
    capacity: 15,
    enrolled: 8,
    price: 12,
    tags: ['Yoga', 'Relaxation', 'All Levels'],
    rating: 4.9
  },
  {
    id: '3',
    title: 'Strength Training',
    description: 'Build muscle and increase strength with this comprehensive workout',
    coachId: '4',
    coach: {
      id: '4',
      name: 'Alex Brown',
      email: 'alex@example.com',
      role: 'coach',
      avatar: '/assets/avatars/alex.jpg'
    },
    gymId: '1',
    gym: {
      id: '1',
      name: 'FitZone Gym',
      description: 'Modern gym with state-of-the-art equipment',
      address: '123 Fitness St',
      city: 'New York',
      image: '/assets/gyms/fitzone.jpg',
      amenities: ['Pool', 'Sauna', 'Parking'],
      rating: 4.8,
      latitude: 40.712776,
      longitude: -74.005974
    },
    image: '/assets/classes/strength.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    duration: 50,
    capacity: 12,
    enrolled: 9,
    price: 18,
    tags: ['Strength', 'Weights', 'Intermediate'],
    rating: 4.5
  },
  {
    id: '4',
    title: 'Spin Class',
    description: 'High-energy cycling workout set to motivating music',
    coachId: '5',
    coach: {
      id: '5',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'coach',
      avatar: '/assets/avatars/sarah.jpg'
    },
    gymId: '3',
    gym: {
      id: '3',
      name: 'Cycle Studio',
      description: 'Premium cycling studio with top-of-the-line bikes',
      address: '789 Spin St',
      city: 'Chicago',
      image: '/assets/gyms/cycle.jpg',
      amenities: ['Showers', 'Water Station'],
      rating: 4.6,
      latitude: 41.878113,
      longitude: -87.629799
    },
    image: '/assets/classes/spin.jpg',
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    duration: 45,
    capacity: 25,
    enrolled: 20,
    price: 14,
    tags: ['Cycling', 'Cardio', 'All Levels'],
    rating: 4.8
  }
];

// Mock programs data
export const mockPrograms: Program[] = [
  {
    id: '1',
    title: '4-Week Fitness Challenge',
    description: 'Comprehensive 4-week program designed to boost strength and endurance',
    coachId: '2',
    coach: {
      id: '2',
      name: 'Jane Smith',
      email: 'coach@example.com',
      role: 'coach',
      avatar: '/assets/avatars/coach.jpg'
    },
    image: '/assets/programs/fitness-challenge.jpg',
    duration: 4, // weeks
    classes: mockClasses.slice(0, 2),
    price: 99,
    tags: ['Challenge', 'Full Body', 'Intermediate'],
    rating: 4.8
  },
  {
    id: '2',
    title: 'Yoga for Beginners',
    description: 'A gentle introduction to yoga fundamentals over 2 weeks',
    coachId: '3',
    coach: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'coach',
      avatar: '/assets/avatars/mike.jpg'
    },
    image: '/assets/programs/yoga-beginners.jpg',
    duration: 2, // weeks
    classes: mockClasses.slice(1, 2),
    price: 59,
    tags: ['Yoga', 'Relaxation', 'Beginner'],
    rating: 4.9
  }
];