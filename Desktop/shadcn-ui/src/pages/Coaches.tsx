import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { Search, Star, MessageSquare, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { useBooking } from '@/context/BookingContext';
import { useUser } from '@/context/UserContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import PrivateSessionBookingModal from '../components/PrivateSessionBookingModal';
import { useToast } from '@/components/ui/use-toast';
import CoachProfileDialog from '../components/CoachProfileDialog';

// Mock coaches data
const mockCoaches: User[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'coach',
    avatar: '/assets/avatars/jane.jpg',
    bio: 'Certified personal trainer with 10+ years of experience in strength training and HIIT workouts.',
    specialties: ['Strength Training', 'HIIT', 'Weight Loss'],
    rating: 4.8,
    hourlyRate: 65
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'coach',
    avatar: '/assets/avatars/mike.jpg',
    bio: 'Yoga instructor specializing in vinyasa flow and meditation techniques for stress reduction.',
    specialties: ['Yoga', 'Meditation', 'Flexibility'],
    rating: 4.9,
    hourlyRate: 60
  },
  {
    id: '3',
    name: 'Alex Brown',
    email: 'alex@example.com',
    role: 'coach',
    avatar: '/assets/avatars/alex.jpg',
    bio: 'Former professional athlete focused on sports-specific training and athletic performance.',
    specialties: ['Sports Performance', 'Athletic Training', 'Injury Prevention'],
    rating: 4.7,
    hourlyRate: 70
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'coach',
    avatar: '/assets/avatars/sarah.jpg',
    bio: 'Nutritionist and fitness coach specializing in holistic wellness and sustainable weight management.',
    specialties: ['Nutrition', 'Weight Management', 'Holistic Health'],
    rating: 4.6,
    hourlyRate: 75
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david@example.com',
    role: 'coach',
    avatar: '/assets/avatars/david.jpg',
    bio: 'CrossFit coach with expertise in functional movement and high-intensity workouts.',
    specialties: ['CrossFit', 'Functional Training', 'Strength & Conditioning'],
    rating: 4.9,
    hourlyRate: 80
  },
  {
    id: '6',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'coach',
    avatar: '/assets/avatars/emily.jpg',
    bio: 'Dance fitness instructor bringing fun and energy to cardio workouts.',
    specialties: ['Dance Fitness', 'Cardio', 'Group Classes'],
    rating: 4.8,
    hourlyRate: 55
  }
];

// Mock classes data
const mockClasses = [
  {
    id: '1',
    coach: mockCoaches[0], // Jane Smith
    title: 'Strength Training Session',
    description: 'A comprehensive strength training session focusing on compound movements and proper form.',
    date: 'Tomorrow, 10:00 AM',
    price: 25,
    duration: '60 minutes'
  },
  {
    id: '2',
    coach: mockCoaches[1], // Mike Johnson
    title: 'Yoga Flow',
    description: 'Vinyasa flow yoga session designed to improve flexibility, strength, and mindfulness.',
    date: 'Tomorrow, 11:00 AM',
    price: 30,
    duration: '75 minutes'
  },
  {
    id: '3',
    coach: mockCoaches[0], // Jane Smith
    title: 'HIIT Circuit',
    description: 'High-intensity interval training circuit that combines strength, cardio, and core exercises.',
    date: 'Tomorrow, 12:00 PM',
    price: 20,
    duration: '45 minutes'
  },
  {
    id: '4',
    coach: mockCoaches[2], // Alex Brown
    title: 'Sports Performance Workshop',
    description: 'Advanced workshop focusing on sports-specific training and injury prevention.',
    date: 'Tomorrow, 2:00 PM',
    price: 40,
    duration: '90 minutes'
  },
  {
    id: '5',
    coach: mockCoaches[3], // Sarah Wilson
    title: 'Nutrition & Wellness Talk',
    description: 'Interactive talk on sustainable nutrition and holistic wellness practices.',
    date: 'Tomorrow, 3:00 PM',
    price: 15,
    duration: '60 minutes'
  },
  {
    id: '6',
    coach: mockCoaches[4], // David Lee
    title: 'CrossFit Basics',
    description: 'Introduction to CrossFit methodology and foundational movements.',
    date: 'Tomorrow, 4:00 PM',
    price: 25,
    duration: '60 minutes'
  },
  {
    id: '7',
    coach: mockCoaches[5], // Emily Chen
    title: 'Dance Fitness Party',
    description: 'Fun and energetic dance fitness party for all fitness levels.',
    date: 'Tomorrow, 5:00 PM',
    price: 10,
    duration: '45 minutes'
  }
];

// Specialty options for filter
const specialties = [
  'All Specialties',
  'Strength Training',
  'HIIT',
  'Yoga',
  'Meditation',
  'CrossFit',
  'Nutrition',
  'Weight Loss',
  'Cardio',
  'Sports Performance',
  'Dance Fitness'
];

export { mockCoaches };

// Mock session proposal state (in a real app, this would be fetched from backend)
type SessionProposalStatus = 'none' | 'pending' | 'confirmed' | 'modified' | 'canceled' | 'finished';

function useMockSessionProposal(selectedCoach: User | null) {
  const [status, setStatus] = useState<SessionProposalStatus>('none');
  const [proposal, setProposal] = useState<any>(null);
  const [modification, setModification] = useState<any>(null);
  // Simulate user and coach roles (in real app, use auth context)
  const isCoach = false; // TODO: set true if viewing as coach
  return {
    status,
    proposal,
    modification,
    setStatus,
    setProposal,
    setModification,
    isCoach,
  };
}

export default function Coaches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedClass, setSelectedClass] = useState<any>(null); // State for ClassDetailDialog
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false); // State for ClassDetailDialog
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toast } = useToast();
  const { createBooking } = useBooking();
  const { user: currentUser } = useUser();
  const sessionProposal = useMockSessionProposal(selectedCoach);

  const handleClassClick = (classId: string) => {
    setIsCoachDialogOpen(false);
    setTimeout(() => navigate(`/classes/${classId}`), 0);
  };

  // Filter coaches based on search query and specialty
  const filteredCoaches = mockCoaches.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty = specialty === 'All Specialties' ||
      coach.specialties.some(spec => spec === specialty);

    return matchesSearch && matchesSpecialty;
  });

  const handleViewCoach = (coach: User) => {
    setSelectedCoach(coach);
    setIsCoachDialogOpen(true);
  };
  const handleBookSession = () => {
    setIsBookingModalOpen(true);
  };
  const handleBookingSubmit = async (bookingData: any) => {
    if (!selectedCoach) return;
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to book a session');
      }

      // Create a new booking using the BookingContext
      const newBooking = {
        userId: currentUser.id,
        coachId: selectedCoach.id,
        gymId: bookingData.gymId,
        gymName: bookingData.gymName,
        date: new Date(bookingData.date),
        time: bookingData.time,
        duration: bookingData.duration,
        price: bookingData.totalPrice,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        messagingEnabled: true,
        ratingGiven: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createBooking(newBooking);
      
      toast({
        title: 'Session Request Sent',
        description: `Your private session request with ${selectedCoach.name} has been sent. You'll be notified when they respond.`,
      });
      
      // Close the booking modal
      setIsBookingModalOpen(false);
      
      // For demo purposes, we'll still update the session proposal state
      sessionProposal.setProposal(bookingData);
      sessionProposal.setStatus('pending');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Coach actions (for demo, user can act as coach)
  const handleCoachConfirm = () => sessionProposal.setStatus('confirmed');
  const handleCoachModify = () => {
    sessionProposal.setModification({ ...sessionProposal.proposal, time: '15:00' });
    sessionProposal.setStatus('modified');
  };
  const handleCoachReject = () => sessionProposal.setStatus('canceled');
  // User actions
  const handleUserAcceptModification = () => {
    sessionProposal.setProposal(sessionProposal.modification);
    sessionProposal.setModification(null);
    sessionProposal.setStatus('confirmed');
  };
  const handleUserCancel = () => sessionProposal.setStatus('canceled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Coaches</h1>
        <p className="text-muted-foreground">Find expert coaches to help you achieve your fitness goals</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, or keywords..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coaches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoaches.map((coach) => (
          <CoachCard 
            key={coach.id} 
            coach={coach} 
            onClick={() => handleViewCoach(coach)} 
            onBook={() => {
              setSelectedCoach(coach);
              handleBookSession();
            }}
          />
        ))}
      </div>

      {/* Coach Profile Dialog (reusable) */}
      <CoachProfileDialog
        coach={selectedCoach}
        open={isCoachDialogOpen}
        onOpenChange={setIsCoachDialogOpen}
        onBookSession={handleBookSession}
        activeTab={activeTab}
      />

      {/* Private Session Booking Modal */}
      {selectedCoach && (
        <PrivateSessionBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          coachId={selectedCoach.id}
          coachName={selectedCoach.name}
          coachPrice={selectedCoach.hourlyRate}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Session Proposal Card (mock) */}
      {sessionProposal.status !== 'none' && selectedCoach && sessionProposal.proposal && (
        <div className="my-6 p-4 border rounded bg-muted">
          <div className="font-bold mb-2">Private Session with {selectedCoach.name}</div>
          <div>Date: {sessionProposal.proposal.date}</div>
          <div>Time: {sessionProposal.proposal.time}</div>
          <div>Gym: {sessionProposal.proposal.gymName}</div>
          <div>Duration: {sessionProposal.proposal.duration} hour(s)</div>
          <div>Total: {sessionProposal.proposal.totalPrice} TND</div>
          <div className="mt-2">
            Status: <Badge>{sessionProposal.status}</Badge>
          </div>
          {sessionProposal.status === 'pending' && !sessionProposal.isCoach && (
            <div className="mt-2 flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleUserCancel}>Cancel Request</Button>
            </div>
          )}
          {sessionProposal.status === 'pending' && sessionProposal.isCoach && (
            <div className="mt-2 flex gap-2">
              <Button variant="default" size="sm" onClick={handleCoachConfirm}>Confirm</Button>
              <Button variant="outline" size="sm" onClick={handleCoachModify}>Propose Modification</Button>
              <Button variant="destructive" size="sm" onClick={handleCoachReject}>Reject</Button>
            </div>
          )}
          {sessionProposal.status === 'modified' && !sessionProposal.isCoach && sessionProposal.modification && (
            <div className="mt-2">
              <div className="mb-2">Coach proposed a new time: <b>{sessionProposal.modification.time}</b></div>
              <Button variant="default" size="sm" onClick={handleUserAcceptModification}>Accept</Button>
              <Button variant="destructive" size="sm" onClick={handleUserCancel} className="ml-2">Cancel</Button>
            </div>
          )}
          {sessionProposal.status === 'confirmed' && (
            <div className="mt-2 text-green-700 font-semibold">Session Confirmed! (Money pending until session is finished)</div>
          )}
          {sessionProposal.status === 'canceled' && (
            <div className="mt-2 text-red-700 font-semibold">Session Canceled. (Money refunded)</div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredCoaches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No coaches found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button variant="link" onClick={() => {
            setSearchQuery('');
            setSpecialty('All Specialties');
          }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

interface CoachCardProps {
  coach: User;
  onClick: () => void;
  onBook: () => void;
}

const CoachCard = ({ coach, onClick, onBook }: CoachCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
            <AvatarImage src={coach.avatar} alt={coach.name} />
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium truncate">{coach.name}</h3>
                <p className="text-sm text-muted-foreground">{coach.specialties.slice(0, 2).join(' • ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-xs font-medium">{coach.rating}</span>
                </div>
                <ShareButton
                  url={`${window.location.origin}/coaches/${coach.id}`}
                  title={`Check out ${coach.name}, a certified coach on SportFlare`}
                  description={coach.bio}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  icon={<Share2 className="h-3 w-3" />}
                />
              </div>
            </div>

            <p className="text-sm line-clamp-2 mt-2">{coach.bio}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="text-sm font-medium">{coach.hourlyRate} TND/hour</div>
              <Button size="sm" onClick={e => { e.stopPropagation(); onBook(); }}>Book</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}