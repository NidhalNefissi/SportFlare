import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Class, Gym } from '@/types';
import { Calendar, Clock, Dumbbell, MapPin, Trophy, Activity, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UniversalGymCard from '@/components/UniversalGymCard';
import { useUniversalGymDialog } from '@/hooks/useUniversalGymDialog';
import { useNavigate } from 'react-router-dom';
import { mockClasses, mockPrograms } from '@/data/mockData';
import { mockCoaches } from './Coaches';
import Booking from './Booking';
import ProgramEnrollment from '@/components/ProgramEnrollment';
import CoachProfileDialog from '@/components/CoachProfileDialog';
import PrivateSessionBookingModal from '@/components/PrivateSessionBookingModal';

// Mock data
const mockUpcomingClasses: Class[] = [
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
    tags: ['HIIT', 'Cardio', 'Intermediate']
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
    tags: ['Yoga', 'Relaxation', 'All Levels']
  }
];

const mockNearbyGyms: Gym[] = [
  {
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
  {
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
  }
];

export default function Dashboard() {
  const { user } = useUser();
  const [weeklyProgress, setWeeklyProgress] = useState(65);
  const [upcomingClasses, setUpcomingClasses] = useState<Class[]>(mockUpcomingClasses);
  const [nearbyGyms, setNearbyGyms] = useState<Gym[]>(mockNearbyGyms);
  const [allClasses, setAllClasses] = useState<Class[]>(mockClasses);
  const navigate = useNavigate();

  const {
    handleViewGym,
    handleCheckIn,
    GymDialogComponents
  } = useUniversalGymDialog();

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [isPrivateSessionOpen, setIsPrivateSessionOpen] = useState(false);

  // Gym-side actions
  const handleAcceptClass = (classId: string) => {
    setAllClasses(prev => prev.map(c => c.id === classId ? { ...c, status: 'confirmed', gymProposal: undefined } : c));
  };
  const handleRejectClass = (classId: string) => {
    setAllClasses(prev => prev.map(c => c.id === classId ? { ...c, status: 'rejected', gymProposal: undefined } : c));
  };
  const handleCounterPropose = (classId: string) => {
    // This would open a modal for counter-proposing
    console.log('Counter-proposing for class:', classId);
  };

  // Program enrollment handlers
  const handleEnrollProgram = (program: any) => {
    setSelectedProgram(program);
    setIsEnrollmentOpen(true);
  };

  // Coach booking handlers
  const handleViewCoach = (coach: any) => {
    setSelectedCoach(coach);
    setIsCoachDialogOpen(true);
  };

  const handleBookSession = () => {
    setIsCoachDialogOpen(false);
    setIsPrivateSessionOpen(true);
  };

  // Role-specific stats
  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'coach':
        return {
          title: 'Coach Stats',
          stats: [
            { label: 'Active Students', value: '42', icon: <Users className="h-4 w-4" /> },
            { label: 'Classes This Week', value: '8', icon: <Calendar className="h-4 w-4" /> },
            { label: 'Rating', value: '4.9', icon: <Trophy className="h-4 w-4" /> },
          ]
        };
      case 'gym':
        return {
          title: 'Gym Stats',
          stats: [
            { label: 'Check-ins Today', value: '124', icon: <Users className="h-4 w-4" /> },
            { label: 'Classes Today', value: '12', icon: <Calendar className="h-4 w-4" /> },
            { label: 'Rating', value: '4.8', icon: <Trophy className="h-4 w-4" /> },
          ]
        };
      case 'brand':
        return {
          title: 'Brand Stats',
          stats: [
            { label: 'Active Orders', value: '53', icon: <Activity className="h-4 w-4" /> },
            { label: 'Product Views', value: '2.3k', icon: <Activity className="h-4 w-4" /> },
            { label: 'Rating', value: '4.7', icon: <Trophy className="h-4 w-4" /> },
          ]
        };
      case 'admin':
        return {
          title: 'Platform Stats',
          stats: [
            { label: 'Active Users', value: '2.4k', icon: <Users className="h-4 w-4" /> },
            { label: 'New Today', value: '47', icon: <Activity className="h-4 w-4" /> },
            { label: 'Support Tickets', value: '12', icon: <Activity className="h-4 w-4" /> },
          ]
        };
      default:
        return {
          title: 'Weekly Goals',
          stats: [
            { label: 'Workouts', value: '3/5', icon: <Dumbbell className="h-4 w-4" /> },
            { label: 'Classes', value: '2/3', icon: <Users className="h-4 w-4" /> },
            { label: 'Active Days', value: '4/7', icon: <Activity className="h-4 w-4" /> },
          ]
        };
    }
  };

  const roleStats = getRoleSpecificStats();

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          {user?.role === 'client' && "Here's an overview of your fitness journey."}
          {user?.role === 'coach' && "Here's an overview of your coaching stats."}
          {user?.role === 'gym' && "Here's an overview of your gym's performance."}
          {user?.role === 'brand' && "Here's an overview of your brand's performance."}
          {user?.role === 'admin' && "Here's an overview of the platform statistics."}
        </p>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{roleStats.title}</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleStats.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {stat.icon}
                      <span className="ml-2 text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Overall</span>
                  <span className="text-sm font-medium">{weeklyProgress}%</span>
                </div>
                <Progress value={weeklyProgress} />
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/profile', { state: { tab: 'analytics' } })}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/profile', { state: { tab: 'workouts' } })}
                >
                  Set Goals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {user?.role === 'client' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/classes')}>Book Class</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/gyms')}>Find Gym</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/ai-coach')}>Chat with AI</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>Shop</Button>
                </>
              )}
              {user?.role === 'coach' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/create-class')}>Create Class</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/students')}>Message Students</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/coach/analytics')}>Analytics</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/coach/earnings')}>Earnings</Button>
                </>
              )}
              {user?.role === 'gym' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/gym/manage-classes')}>Manage Classes</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/gym/check-ins')}>Check-ins</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/gym-analytics')}>Analytics</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/gym-promotions')}>Promotions</Button>
                </>
              )}
              {user?.role === 'brand' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/manage-products')}>Add Product</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>Orders</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/brand-analytics')}>Analytics</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/brand-promotions')}>Promotions</Button>
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/approve-users')}>Approve Users</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/content-review')}>Content Review</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/analytics')}>Analytics</Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/support')}>Support</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Classes Section */}
      {['client', 'coach'].includes(user?.role || '') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Classes</h2>
            <Button variant="link" onClick={() => navigate('/classes')}>View All</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} className="cursor-pointer group" onClick={() => navigate(`/classes/${classItem.id}`)} tabIndex={0} role="button">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 bg-muted h-32 md:h-auto" />
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium hover:underline cursor-pointer" onClick={e => { e.stopPropagation(); navigate(`/classes/${classItem.id}`); }}>{classItem.title}</span>
                          <Badge>{classItem.tags[0]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{classItem.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(classItem.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{classItem.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary" />
                          <span className="text-sm">{classItem.coach.name}</span>
                        </div>
                        <Button size="sm" onClick={e => { e.stopPropagation(); setSelectedClass(classItem); setIsBookingDialogOpen(true); }}>Book</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Gym-side class management */}
      {user?.role === 'gym' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Class Management</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {allClasses.filter(c => c.gymId === user.id).map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{classItem.title}</span>
                    <Badge>{classItem.status || 'confirmed'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{classItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(classItem.date)}</span>
                    <Clock className="h-3 w-3 ml-4 mr-1" />
                    <span>{classItem.duration} min</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>Price: {classItem.price} TND</span>
                    <span>Capacity: {classItem.capacity}</span>
                  </div>
                  {['pending', 'counter_proposed'].includes(classItem.status || '') && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="default" onClick={() => handleAcceptClass(classItem.id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleCounterPropose(classItem.id)}>Counter-Propose</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectClass(classItem.id)}>Reject</Button>
                    </div>
                  )}
                  {classItem.gymProposal && (
                    <div className="mt-2 p-2 border rounded bg-muted">
                      <div className="text-xs font-semibold mb-1">Your Counter Proposal:</div>
                      {Object.entries(classItem.gymProposal).map(([k, v]) => (
                        <div key={k} className="text-xs">{k}: {String(v)}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/classes/${classItem.id}`)}>
                      View Public Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      {/* Coach-side: show status and gymProposal in class list */}
      {user?.role === 'coach' && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">My Created Classes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {allClasses.filter(c => c.coachId === user.id).map((classItem) => (
              <Card key={classItem.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{classItem.title}</span>
                    <Badge>{classItem.status || 'confirmed'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{classItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(classItem.date)}</span>
                    <Clock className="h-3 w-3 ml-4 mr-1" />
                    <span>{classItem.duration} min</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>Price: {classItem.price} TND</span>
                    <span>Capacity: {classItem.capacity}</span>
                  </div>
                  {classItem.status === 'counter_proposed' && classItem.gymProposal && (
                    <div className="mt-2 p-2 border rounded bg-muted">
                      <div className="text-xs font-semibold mb-1">Gym Counter Proposal:</div>
                      {Object.entries(classItem.gymProposal).map(([k, v]) => (
                        <div key={k} className="text-xs">{k}: {String(v)}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/classes/${classItem.id}`)}>
                      View Public Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Popular Programs Section */}
      {user?.role === 'client' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Popular Programs</h2>
            <Button variant="link" onClick={() => navigate('/classes?tab=programs')}>View All</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPrograms.slice(0, 3).map((program) => (
              <Card key={program.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="h-40 bg-muted" onClick={() => navigate(`/programs/${program.id}`)} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium hover:underline cursor-pointer" onClick={() => navigate(`/programs/${program.id}`)}>{program.title}</span>
                      <Badge>{program.tags[0]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2" onClick={() => navigate(`/programs/${program.id}`)}>{program.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2" onClick={() => navigate(`/programs/${program.id}`)}>
                        <div className="w-6 h-6 rounded-full bg-primary" />
                        <span className="text-sm">{program.coach.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{program.price} TND</span>
                        <Button size="sm" onClick={e => { e.stopPropagation(); handleEnrollProgram(program); }}>
                          Enroll in Program
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Top Coaches Section */}
      {user?.role === 'client' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Top Coaches</h2>
            <Button variant="link" onClick={() => navigate('/coaches')}>View All</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCoaches.slice(0, 3).map((coach) => (
              <Card key={coach.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewCoach(coach)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{coach.name}</h3>
                      <p className="text-sm text-muted-foreground">{coach.specialties?.join(', ')}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm">{coach.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{coach.hourlyRate} TND/hr</p>
                      <Button size="sm" className="mt-2" onClick={e => { e.stopPropagation(); setSelectedCoach(coach); setIsPrivateSessionOpen(true); }}>
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Gyms Section */}
      {user?.role === 'client' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Nearby Gyms</h2>
            <Button variant="link" onClick={() => navigate('/gyms')}>View All</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nearbyGyms.map((gym) => (
              <UniversalGymCard
                key={gym.id}
                gym={gym}
                onClick={() => handleViewGym(gym)}
                onCheckIn={() => handleCheckIn(gym)}
              />
            ))}
          </div>
        </section>
      )}

      {selectedClass && (
        <Booking
          classItem={selectedClass}
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          onBooked={() => setIsBookingDialogOpen(false)}
        />
      )}
      
      {/* Program Enrollment Modal */}
      {selectedProgram && (
        <ProgramEnrollment
          program={selectedProgram}
          open={isEnrollmentOpen}
          onOpenChange={setIsEnrollmentOpen}
          onEnrolled={() => setIsEnrollmentOpen(false)}
        />
      )}
      
      {/* Coach Profile Dialog */}
      <CoachProfileDialog
        coach={selectedCoach}
        open={isCoachDialogOpen}
        onOpenChange={setIsCoachDialogOpen}
        onBookSession={handleBookSession}
      />
      
      {/* Private Session Booking Modal */}
      {selectedCoach && (
        <PrivateSessionBookingModal
          isOpen={isPrivateSessionOpen}
          onClose={() => setIsPrivateSessionOpen(false)}
          coachName={selectedCoach.name}
          coachPrice={selectedCoach.hourlyRate}
          onSubmit={() => setIsPrivateSessionOpen(false)}
        />
      )}
      
      {/* Universal Gym Dialog Components */}
      <GymDialogComponents />
    </div>
  );
}