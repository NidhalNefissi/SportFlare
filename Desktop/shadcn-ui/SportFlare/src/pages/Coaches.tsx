import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { Search, Star, MessageSquare } from 'lucide-react';
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

export default function Coaches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [selectedCoach, setSelectedCoach] = useState<User | null>(null);
  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

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
          <CoachCard key={coach.id} coach={coach} onClick={() => handleViewCoach(coach)} />
        ))}
      </div>

      {/* Coach Detail Dialog */}
      <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedCoach?.name}</DialogTitle>
            <DialogDescription>
              {selectedCoach?.specialties.join(' • ')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-1/3 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback>{selectedCoach?.name.charAt(0)}</AvatarFallback>
                <AvatarImage src={selectedCoach?.avatar} alt={selectedCoach?.name} />
              </Avatar>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{selectedCoach?.rating}</span>
                  <span className="text-muted-foreground">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                </div>
                
                <p className="font-medium">${selectedCoach?.hourlyRate}/hour</p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedCoach?.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">Book Session</Button>
                  <Button variant="outline" className="w-full mt-2">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            <div className="sm:w-2/3">
              <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="info" className="flex-1">About</TabsTrigger>
                  <TabsTrigger value="classes" className="flex-1">Classes</TabsTrigger>
                  <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-medium">About</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCoach?.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Certifications</h3>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <li>• Certified Personal Trainer (CPT)</li>
                      <li>• Strength and Conditioning Specialist</li>
                      <li>• First Aid & CPR</li>
                      {selectedCoach?.specialties.includes('Nutrition') && (
                        <li>• Nutrition Coach Certification</li>
                      )}
                      {selectedCoach?.specialties.includes('Yoga') && (
                        <li>• 200-Hour Yoga Teacher Training</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Experience</h3>
                    <ul className="mt-1 space-y-2 text-sm text-muted-foreground">
                      <li>
                        <p className="font-medium text-foreground">Senior Coach at FitZone Gym</p>
                        <p>2018 - Present</p>
                      </li>
                      <li>
                        <p className="font-medium text-foreground">Fitness Instructor at SportFlare</p>
                        <p>2015 - 2018</p>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="classes" className="mt-4">
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{selectedCoach?.specialties[0]} Class</h4>
                        <Badge>Tomorrow, 10:00 AM</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        A comprehensive {selectedCoach?.specialties[0].toLowerCase()} session suitable for all levels.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm">$25 per person</span>
                        <Button size="sm">Book</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{selectedCoach?.specialties[1]} Workshop</h4>
                        <Badge>Saturday, 2:00 PM</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        An in-depth workshop focusing on advanced {selectedCoach?.specialties[1].toLowerCase()} techniques.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm">$40 per person</span>
                        <Button size="sm">Book</Button>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">View All Classes</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-4">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">User{i}</span>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star
                                key={j}
                                className={`h-3 w-3 ${j < 5 - (i % 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {i === 1 ? 
                            `Amazing coach! ${selectedCoach?.name} really helped me improve my technique and reach my goals faster than I expected.` :
                            i === 2 ?
                            `Great knowledge and very supportive. I've been training with ${selectedCoach?.name} for 3 months and have seen significant progress.` :
                            `Highly recommend! ${selectedCoach?.name} is professional, knowledgeable, and creates personalized plans that actually work.`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">2 weeks ago</p>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full">View All Reviews</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoachDialogOpen(false)}>
              Back to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
}

const CoachCard = ({ coach, onClick }: CoachCardProps) => {
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
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-xs font-medium">{coach.rating}</span>
              </div>
            </div>
            
            <p className="text-sm line-clamp-2 mt-2">{coach.bio}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm font-medium">${coach.hourlyRate}/hour</div>
              <Button size="sm">Book</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}