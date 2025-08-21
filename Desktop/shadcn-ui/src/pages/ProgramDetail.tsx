import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Star, Users, MessageSquare, ChevronLeft, Heart, MapPin } from 'lucide-react';
import { Program } from '@/types';
import { mockPrograms, mockGyms } from '@/data/mockData';
import { useNotifications } from '@/context/NotificationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareButton } from '@/components/ShareButton';
import { useUniversalGymDialog } from '@/hooks/useUniversalGymDialog';
import ProgramEnrollment from '../components/ProgramEnrollment';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CoachProfileDialog from '../components/CoachProfileDialog';
import PrivateSessionBookingModal from '../components/PrivateSessionBookingModal';

const mockReviews = [
    { id: 1, user: 'Alice', rating: 5, comment: 'Amazing program! Highly recommend.' },
    { id: 2, user: 'Bob', rating: 4, comment: 'Great structure and coach.' },
];

export default function ProgramDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState<Program | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const { addNotification } = useNotifications();
    const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(program?.coach || null);
    const [activeTab, setActiveTab] = useState('about');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { handleViewGym, GymDialogComponents } = useUniversalGymDialog();

    useEffect(() => {
        setIsLoading(true);
        const found = mockPrograms.find(p => p.id === id);
        setProgram(found || null);
        setIsLoading(false);
    }, [id]);

    // Find similar programs (by shared tags, excluding current)
    const similarPrograms = program
        ? mockPrograms.filter(p => p.id !== program.id && p.tags.some(tag => program.tags.includes(tag))).slice(0, 3)
        : [];

    // Find gym info (from first class in program, if available)
    const gym = program?.classes[0]?.gym;

    const handleEnroll = () => {
        setIsEnrollmentOpen(true);
    };

    const handleEnrollmentSuccess = () => {
        setIsEnrollmentOpen(false);
        setIsEnrolled(true);
        addNotification({
            userId: '1', // TODO: use real user id
            title: 'Enrollment Confirmed',
            message: `You have successfully enrolled in ${program?.title}.`,
            type: 'class',
            isRead: false,
        });
    };

    const toggleFavorite = () => setIsFavorite(f => !f);

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

    if (isLoading) return <div>Loading...</div>;
    if (!program) return <div>Program not found</div>;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <div className="flex items-center">
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/classes')}>
                    <ChevronLeft className="h-4 w-4" />
                    Back to Classes & Programs
                </Button>
            </div>
            {/* Header */}
            <div className="relative">
                <div className="w-full h-64 bg-muted rounded-lg overflow-hidden mb-4 flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    [Program Image Placeholder]
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{program.title}</h1>
                            <Badge className="ml-2" variant="secondary">{program.tags[0]}</Badge>
                        </div>
                        <p className="text-muted-foreground">{program.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={toggleFavorite}>
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <ShareButton 
                            url={`${window.location.origin}/programs/${program.id}`}
                            title={`Check out ${program.title} on SportFlare`}
                            description={program.description}
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                        />
                        <Button onClick={handleEnroll} disabled={isEnrolled}>{isEnrolled ? 'Enrolled ✓' : 'Enroll in Program'}</Button>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Program Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Program Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Program Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Duration</div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <div className="font-medium">{program.duration} weeks</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Classes Included</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <div className="font-medium">{program.classes.length}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Price</div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium">{program.price} TND</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Location</div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <div className="font-medium">{gym?.name}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Rating</div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        <div className="font-medium">{program.rating}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="text-sm text-muted-foreground mb-2">Tags</div>
                                <div className="flex flex-wrap gap-2">
                                    {program.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Tabs for About, What to Bring, Reviews */}
                    <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="bring">What to Bring</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        </TabsList>
                        <TabsContent value="about" className="space-y-4 pt-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">About this Program</h3>
                                <p>{program.description}</p>
                                <p className="mt-4">
                                    This {program.title} program is designed for {program.tags.includes('Beginner')
                                        ? 'beginners who are new to fitness'
                                        : program.tags.includes('Intermediate')
                                            ? 'those with some fitness experience'
                                            : 'advanced fitness enthusiasts'}.
                                </p>
                                <p className="mt-4">
                                    Over the course of {program.duration} weeks, you'll participate in a series of classes designed to help you achieve your fitness goals.
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Reviews</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        <span className="font-medium">{program.rating}</span>
                                        <span className="text-muted-foreground">(12 reviews)</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Write a Review
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {mockReviews.map(r => (
                                    <Card key={r.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{r.user.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{r.user}</h4>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">2 weeks ago</p>
                                                    <p className="text-sm">{r.comment}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                    {/* Classes in this Program */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classes in this Program</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {program.classes.map(c => (
                                    <li key={c.id} className="flex items-center gap-2">
                                        <Badge>{c.tags[0]}</Badge>
                                        <span>{c.title}</span>
                                        <span className="text-xs text-muted-foreground">({c.duration} min)</span>
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/classes/${c.id}`)}>View Class</Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    {/* Similar Programs */}
                    {similarPrograms.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Similar Programs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {similarPrograms.map(p => (
                                        <li key={p.id} className="flex items-center gap-2">
                                            <Badge>{p.tags[0]}</Badge>
                                            <span>{p.title}</span>
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/programs/${p.id}`)}>View Program</Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Coach Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Coach</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">{program.coach.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{program.coach.name}</div>
                                    <div className="text-sm text-muted-foreground">Fitness Coach</div>
                                    <div className="flex items-center mt-1">
                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                        <span className="text-sm">{program.coach.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm">
                                Professional fitness coach specializing in {program.coach.specialties?.join(', ')}.
                                With over 5 years of experience helping clients reach their fitness goals.
                            </p>
                            <Button variant="outline" className="w-full" onClick={() => { setSelectedCoach(program.coach); setIsCoachDialogOpen(true); }}>View Profile</Button>
                        </CardContent>
                    </Card>
                    {/* Location Card */}
                    {gym && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-md overflow-hidden">
                                    <div className="w-full h-32 bg-muted" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{gym.name}</h3>
                                    <p className="text-sm text-muted-foreground">{gym.address}</p>
                                    <p className="text-sm text-muted-foreground">{gym.city}</p>
                                </div>
                                <div className="pt-2">
                                    <div className="text-sm font-medium">Amenities</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {gym.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="outline">{amenity}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => handleViewGym(gym)}>View Gym</Button>
                            </CardContent>
                        </Card>
                    )}
                    {/* Participants Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>32 enrolled</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Program Enrollment Modal */}
            {program && (
                <ProgramEnrollment
                    program={program}
                    open={isEnrollmentOpen}
                    onOpenChange={setIsEnrollmentOpen}
                    onEnrolled={handleEnrollmentSuccess}
                />
            )}
            {/* Coach Profile Dialog (reusable) */}
            <CoachProfileDialog
                coach={selectedCoach}
                open={isCoachDialogOpen}
                onOpenChange={setIsCoachDialogOpen}
                onBookSession={() => setIsBookingModalOpen(true)}
            />
            {/* Private Session Booking Modal */}
            {selectedCoach && (
                <PrivateSessionBookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    coachName={selectedCoach.name}
                    coachPrice={selectedCoach.hourlyRate}
                    onSubmit={() => setIsBookingModalOpen(false)}
                />
            )}
            {/* Gym Dialog */}
            <GymDialogComponents />
        </div>
    );
}