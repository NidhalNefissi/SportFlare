import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import apiService from '@/services/api/apiService';
import { Class, Enrollment } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  DollarSign,
  ChevronLeft,
  Share2,
  Heart,
  MessageSquare,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Import our custom components
import ClassBookingForm from '@/components/ClassBookingForm';
import ClassReviews from '@/components/ClassReviews';

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [similarClasses, setSimilarClasses] = useState<Class[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Format time only
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      setIsLoading(true);
      try {
        // Get class details
        if (!id) {
          toast.error("Class ID not provided");
          navigate('/classes');
          return;
        }
        
        const foundClass = await apiService.getClassById(id);
        
        if (foundClass) {
          setClassDetails(foundClass);
          
          // Find similar classes (classes with similar tags)
          const allClasses = await apiService.getClasses();
          const similar = allClasses
            .filter(c => c.id !== id && c.tags.some(tag => foundClass.tags.includes(tag)))
            .slice(0, 3);
          setSimilarClasses(similar);
          
          // Check if user is enrolled
          if (user) {
            const bookings = await apiService.getBookings({ 
              userId: user.id, 
              classId: id 
            });
            
            const activeBooking = bookings.find(b => 
              b.status !== 'cancelled' && b.status !== 'no-show'
            );
            
            if (activeBooking) {
              setIsEnrolled(true);
              setCurrentEnrollment(activeBooking as unknown as Enrollment);
            }
          }
        } else {
          toast.error("Class not found");
          navigate('/classes');
        }
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast.error("There was an error fetching the class details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [id, navigate, user]);

  const handleRefresh = async () => {
    // Refresh enrollment status
    if (user && id) {
      try {
        const bookings = await apiService.getBookings({ 
          userId: user.id, 
          classId: id 
        });
        
        const activeBooking = bookings.find(b => 
          b.status !== 'cancelled' && b.status !== 'no-show'
        );
        
        if (activeBooking) {
          setIsEnrolled(true);
          setCurrentEnrollment(activeBooking as unknown as Enrollment);
        } else {
          setIsEnrolled(false);
          setCurrentEnrollment(null);
        }
        
        // Refresh class details to update enrollment count
        if (id) {
          const refreshedClass = await apiService.getClassById(id);
          if (refreshedClass) {
            setClassDetails(refreshedClass);
          }
        }
      } catch (error) {
        console.error("Error refreshing enrollment status:", error);
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Dumbbell className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-8 rounded-full bg-muted">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Class Not Found</h2>
        <p className="text-muted-foreground">The requested class could not be found.</p>
        <Button asChild>
          <Link to="/classes">Back to Classes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and navigation */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/classes')}>
          <ChevronLeft className="h-4 w-4" />
          Back to Classes
        </Button>
      </div>

      {/* Class Header */}
      <div className="relative">
        {/* Hero image */}
        <div className="w-full h-64 bg-muted rounded-lg overflow-hidden mb-4">
          {/* In a real app this would be an actual image */}
          <div className="w-full h-full bg-gradient-to-br from-primary/70 to-primary"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{classDetails.title}</h1>
              <Badge className="ml-2" variant="secondary">{classDetails.tags[0]}</Badge>
            </div>
            <p className="text-muted-foreground">{classDetails.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Class Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Date & Time</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="font-medium">{formatDate(classDetails.date)}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="font-medium">{classDetails.duration} minutes</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <div className="font-medium">${classDetails.price}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="font-medium">{classDetails.gym.name}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Spots</div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div className="font-medium">
                      {classDetails.enrolled}/{classDetails.capacity} enrolled
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <div className="font-medium">{classDetails.rating} (24 reviews)</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-1">Class Capacity</div>
                <div className="flex items-center gap-2">
                  <Progress value={(classDetails.enrolled / classDetails.capacity) * 100} className="h-2" />
                  <span className="text-sm font-medium">
                    {classDetails.capacity - classDetails.enrolled} spots left
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {classDetails.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Description, What to Bring, etc. */}
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="bring">What to Bring</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About this Class</h3>
                <p>{classDetails.description}</p>
                <p className="mt-4">
                  This {classDetails.title} class is designed for {classDetails.tags.includes('Beginner') 
                    ? 'beginners who are new to fitness' 
                    : classDetails.tags.includes('Intermediate') 
                      ? 'those with some fitness experience'
                      : 'advanced fitness enthusiasts'}.
                </p>
                <p className="mt-4">
                  During this {classDetails.duration}-minute session, you'll work through a series of exercises designed to 
                  {classDetails.tags.includes('HIIT') 
                    ? ' boost your metabolism and burn calories through high-intensity interval training.'
                    : classDetails.tags.includes('Yoga')
                      ? ' improve flexibility, strength, and mental clarity through a flowing sequence of poses.'
                      : classDetails.tags.includes('Strength')
                        ? ' build strength and muscle through progressive resistance training.'
                        : ' improve your overall fitness and well-being.'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Benefits</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Improved cardiovascular health</li>
                  <li>Increased strength and endurance</li>
                  <li>Better flexibility and mobility</li>
                  <li>Stress reduction and mental clarity</li>
                  <li>Community support and accountability</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="bring" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">What to Bring</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Comfortable workout clothes</li>
                  <li>Water bottle</li>
                  <li>Towel</li>
                  {classDetails.tags.includes('Yoga') && <li>Yoga mat (studio has some available if needed)</li>}
                  <li>Positive attitude!</li>
                </ul>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Good to Know</h4>
                <p className="text-sm">
                  Please arrive 10-15 minutes before class starts. Lockers are available for your belongings.
                  Showers are available at the facility.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4 pt-4">
              {id && (
                <ClassReviews classId={id} className={classDetails.title} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Booking Form Card */}
          {classDetails && (
            <ClassBookingForm 
              classData={classDetails} 
              isEnrolled={isEnrolled}
              currentEnrollment={currentEnrollment || undefined}
              onBookingComplete={handleRefresh}
            />
          )}
          
          {/* Coach Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">{classDetails.coach.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{classDetails.coach.name}</div>
                  <div className="text-sm text-muted-foreground">Fitness Coach</div>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                    <span className="text-sm">4.9</span>
                  </div>
                </div>
              </div>
              <p className="text-sm">
                Professional fitness coach specializing in {classDetails.tags.join(', ')}. 
                With over 5 years of experience helping clients reach their fitness goals.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/coaches/${classDetails.coach.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md overflow-hidden">
                {/* This would be a real map in a production app */}
                <div className="w-full h-32 bg-muted" />
              </div>
              <div>
                <h3 className="font-medium">{classDetails.gym.name}</h3>
                <p className="text-sm text-muted-foreground">{classDetails.gym.address}</p>
                <p className="text-sm text-muted-foreground">{classDetails.gym.city}</p>
              </div>
              <div className="pt-2">
                <div className="text-sm font-medium">Amenities</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {classDetails.gym.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/gyms/${classDetails.gym.id}`}>View Gym</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Similar Classes Card */}
          {similarClasses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {similarClasses.map((similarClass) => (
                  <div key={similarClass.id} className="flex items-start gap-3 pb-3 last:pb-0 last:border-0 border-b">
                    <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link to={`/classes/${similarClass.id}`} className="font-medium hover:underline">
                        {similarClass.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(similarClass.date)}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">${similarClass.price}</div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/classes">Browse All Classes</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>


    </div>
  );
}