import { User, Class, Program } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Calendar, Clock, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { mockClasses as allClasses, mockPrograms as allPrograms } from '@/data/mockData';

interface CoachProfileDialogProps {
    coach: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBookSession: () => void;
    activeTab?: string;
}

export default function CoachProfileDialog({ coach, open, onOpenChange, onBookSession, activeTab: initialTab }: CoachProfileDialogProps) {
    const [activeTab, setActiveTab] = useState(initialTab || 'info');
    const navigate = useNavigate();
    
    // Filter classes and programs by coach
    const coachClasses = useMemo(() => {
        return allClasses.filter(classItem => classItem.coach.name === coach?.name);
    }, [coach?.name]);
    
    const coachPrograms = useMemo(() => {
        return allPrograms.filter(program => program.coach.name === coach?.name);
    }, [coach?.name]);
    
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
    
    if (!coach) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{coach.name}</DialogTitle>
                    <DialogDescription>
                        {coach.specialties?.join(' • ')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="sm:w-1/3 flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32">
                            <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                            <AvatarImage src={coach.avatar} alt={coach.name} />
                        </Avatar>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{coach.rating}</span>
                                    <span className="text-muted-foreground">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                                </div>
                                <ShareButton
                                    url={`${window.location.origin}/coaches/${coach.id}`}
                                    title={`Check out ${coach.name}, a certified coach on SportFlare`}
                                    description={coach.bio}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    icon={<Share2 className="h-3.5 w-3.5" />}
                                />
                            </div>
                            <p className="font-medium">{coach.hourlyRate} TND/hour</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {coach.specialties?.map((specialty, i) => (
                                    <Badge key={i} variant="secondary">{specialty}</Badge>
                                ))}
                            </div>
                            <div className="pt-4">
                                <Button className="w-full" onClick={onBookSession}>Book Session</Button>
                                <Button variant="outline" className="w-full mt-2" onClick={() => { onOpenChange(false); setTimeout(() => navigate(`/messages/${coach.id}`), 0); }}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Message
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="sm:w-2/3">
                        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="w-full">
                                <TabsTrigger value="info" className="flex-1">About</TabsTrigger>
                                <TabsTrigger value="classes" className="flex-1">Classes</TabsTrigger>
                                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="mt-4 space-y-4">
                                <div>
                                    <h3 className="font-medium">About</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{coach.bio}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Certifications</h3>
                                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                                        <li>• Certified Personal Trainer (CPT)</li>
                                        <li>• Strength and Conditioning Specialist</li>
                                        <li>• First Aid & CPR</li>
                                        {coach.specialties?.includes('Nutrition') && (
                                            <li>• Nutrition Coach Certification</li>
                                        )}
                                        {coach.specialties?.includes('Yoga') && (
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
                                    {/* Classes Section */}
                                    {coachClasses.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3">Classes ({coachClasses.length})</h3>
                                            <div className="space-y-3">
                                                {coachClasses.map((classItem) => (
                                                    <div key={classItem.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer" onClick={() => { onOpenChange(false); navigate(`/classes/${classItem.id}`); }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium">{classItem.title}</h4>
                                                            <Badge variant="outline">{classItem.tags[0]}</Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{classItem.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{formatDate(classItem.date)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{classItem.duration} min</span>
                                                            </div>
                                                            <span className="font-medium">{classItem.price} TND</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Programs Section */}
                                    {coachPrograms.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3">Programs ({coachPrograms.length})</h3>
                                            <div className="space-y-3">
                                                {coachPrograms.map((program) => (
                                                    <div key={program.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer" onClick={() => { onOpenChange(false); navigate(`/programs/${program.id}`); }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium">{program.title}</h4>
                                                            <Badge variant="outline">{program.tags[0]}</Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{program.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{program.duration} weeks</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{program.classes.length} classes</span>
                                                            </div>
                                                            <span className="font-medium">{program.price} TND</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* No classes/programs message */}
                                    {coachClasses.length === 0 && coachPrograms.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No classes or programs available for this coach at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-4">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border rounded-md p-3">
                                            <div className="flex items-center">
                                                <Avatar className="h-6 w-6 mr-2">
                                                    <AvatarFallback>U{i}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex">
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <Star
                                                        key={j}
                                                        className={`h-3 w-3 ${j < 5 - (i % 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {i === 1 ?
                                                    `Amazing coach! ${coach.name} really helped me improve my technique and reach my goals faster than I expected.` :
                                                    i === 2 ?
                                                        `Great knowledge and very supportive. I've been training with ${coach.name} for 3 months and have seen significant progress.` :
                                                        `Highly recommend! ${coach.name} is professional, knowledgeable, and creates personalized plans that actually work.`
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 