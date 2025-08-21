import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, Phone, Mail, Calendar, BarChart, X, Check, Clock, User, Award, Dumbbell, HeartPulse, Clock3 } from 'lucide-react';

const mockStudents = [
    {
        id: '1',
        name: 'Alex Johnson',
        avatar: '/assets/avatars/alex.jpg',
        progress: 80,
        email: 'alex.j@example.com',
        phone: '+216 20 123 456',
        age: 28,
        gender: 'Male',
        bio: 'Passionate about strength training and functional fitness. Looking to improve overall strength and mobility.',
        joinDate: '2024-01-15',
        lastActive: '2024-08-04',
        level: 'Intermediate',
        goals: ['Build Muscle', 'Increase Strength', 'Improve Mobility'],
        enrolledClasses: [
            { id: 'c1', title: 'Strength Training', date: '2024-07-22', time: '18:00', duration: '60 min', completed: true },
            { id: 'c2', title: 'HIIT Workout', date: '2024-07-18', time: '19:30', duration: '45 min', completed: true },
            { id: 'c3', title: 'Mobility & Stretching', date: '2024-07-25', time: '17:00', duration: '30 min', completed: false },
        ],
        stats: {
            workoutsCompleted: 42,
            hoursTrained: 36,
            streak: 12,
        },
    },
    {
        id: '2',
        name: 'Sarah Williams',
        avatar: '/assets/avatars/sarah.jpg',
        progress: 65,
        email: 'sarah.w@example.com',
        phone: '+216 20 654 321',
        age: 35,
        gender: 'Female',
        bio: 'Yoga and pilates enthusiast. Focused on flexibility, core strength, and stress relief.',
        joinDate: '2024-02-10',
        lastActive: '2024-08-03',
        level: 'Advanced',
        goals: ['Improve Flexibility', 'Core Strength', 'Stress Management'],
        enrolledClasses: [
            { id: 'y1', title: 'Yoga Flow', date: '2024-07-23', time: '08:00', duration: '60 min', completed: true },
            { id: 'p1', title: 'Pilates Core', date: '2024-07-25', time: '09:30', duration: '45 min', completed: false },
        ],
        stats: {
            workoutsCompleted: 38,
            hoursTrained: 42,
            streak: 5,
        },
    },
    {
        id: '3',
        name: 'Michael Chen',
        avatar: '/assets/avatars/michael.jpg',
        progress: 45,
        email: 'michael.c@example.com',
        phone: '+216 20 987 654',
        age: 24,
        gender: 'Male',
        bio: 'New to fitness, looking to build a consistent workout routine and improve overall health.',
        joinDate: '2024-06-05',
        lastActive: '2024-08-04',
        level: 'Beginner',
        goals: ['Lose Weight', 'Build Consistency', 'Learn Proper Form'],
        enrolledClasses: [
            { id: 'b1', title: 'Beginner Workout', date: '2024-07-24', time: '19:00', duration: '45 min', completed: true },
            { id: 'b2', title: 'Cardio Basics', date: '2024-07-26', time: '18:30', duration: '30 min', completed: false },
        ],
        stats: {
            workoutsCompleted: 8,
            hoursTrained: 6,
            streak: 3,
        },
    },
];

function MessageSection({ student }: { student: any }) {
    const [messages, setMessages] = useState([
        { id: 1, from: 'client', text: 'Hi Coach! Just wanted to check if we can reschedule our session tomorrow?', time: '10:30 AM' },
        { id: 2, from: 'coach', text: 'Hello! Sure, what time works for you?', time: '10:35 AM' },
        { id: 3, from: 'client', text: 'Can we do 6 PM instead of 5 PM?', time: '10:36 AM' },
        { id: 4, from: 'coach', text: '6 PM works perfectly. I\'ve updated the schedule.', time: '10:40 AM' },
    ]);
    
    const [input, setInput] = useState('');
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            from: 'coach',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="p-3 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Messages with {student?.name}</h3>
                </div>
            </div>
            <div className="h-48 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'coach' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.from === 'coach' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'}`}>
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.from === 'coach' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" size="sm">
                    Send
                </Button>
            </form>
        </div>
    );
}

function RemoveConfirmationDialog({ open, onConfirm, onCancel, student }: { open: boolean, onConfirm: () => void, onCancel: () => void, student: any }) {
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onCancel(); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Remove Student</DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to remove <span className="font-semibold text-foreground">{student?.name}</span> from your students? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" /> Remove Student
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function ClientProfileDialog({ student, open, onOpenChange, onRemove }: { student: any, open: boolean, onOpenChange: (open: boolean) => void, onRemove: (id: string) => void }) {
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    
    if (!student) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Student Profile</DialogTitle>
                        <Badge variant="outline" className="text-sm font-normal">
                            {student.level}
                        </Badge>
                    </div>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary/10">
                            <AvatarFallback className="text-xl">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                            <AvatarImage src={student.avatar} alt={student.name} />
                        </Avatar>
                        
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold">{student.name}</h2>
                            <p className="text-muted-foreground">{student.bio}</p>
                            
                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{student.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{student.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Member since {formatDate(student.joinDate)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span className="font-medium">{student.progress}%</span>
                                </div>
                                <Progress value={student.progress} className="h-2" />
                            </div>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="classes">Classes</TabsTrigger>
                            <TabsTrigger value="messages">Messages</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BarChart className="h-5 w-5" />
                                        <span>Stats</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                                            <div className="text-2xl font-bold">{student.stats.workoutsCompleted}</div>
                                            <div className="text-sm text-muted-foreground">Workouts</div>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                                            <div className="text-2xl font-bold">{student.stats.hoursTrained}+</div>
                                            <div className="text-sm text-muted-foreground">Hours Trained</div>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                                            <div className="text-2xl font-bold">{student.stats.streak}</div>
                                            <div className="text-sm text-muted-foreground">Day Streak</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        <span>Fitness Goals</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {student.goals.map((goal: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                                                {goal}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="classes" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Dumbbell className="h-5 w-5" />
                                        <span>Enrolled Classes</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {student.enrolledClasses.map((cls: any) => (
                                            <div key={cls.id} className="flex items-start justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{cls.title}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(cls.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        <Clock3 className="h-3.5 w-3.5 ml-2" />
                                                        {cls.time} • {cls.duration}
                                                    </div>
                                                </div>
                                                <Badge variant={cls.completed ? 'default' : 'outline'} className="ml-2">
                                                    {cls.completed ? (
                                                        <>
                                                            <Check className="h-3.5 w-3.5 mr-1" /> Completed
                                                        </>
                                                    ) : 'Upcoming'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="messages" className="pt-4">
                            <MessageSection student={student} />
                        </TabsContent>
                    </Tabs>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                        Back to List
                    </Button>
                    <div className="flex-1" />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowRemoveConfirm(true)}
                    >
                        Remove Student
                    </Button>
                    <Button className="w-full sm:w-auto">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </div>
                
                <RemoveConfirmationDialog 
                    open={showRemoveConfirm} 
                    onConfirm={() => { 
                        onRemove(student.id); 
                        setShowRemoveConfirm(false); 
                        onOpenChange(false); 
                    }} 
                    onCancel={() => setShowRemoveConfirm(false)} 
                    student={student} 
                />
            </DialogContent>
        </Dialog>
    );
}

function getProgressColor(progress: number) {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
}

export default function CoachStudents() {
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [students, setStudents] = useState(mockStudents);
    
    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleRemove = (id: string) => {
        setStudents(students.filter(s => s.id !== id));
        setIsDialogOpen(false);
    };

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Students</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your students' progress</p>
                </div>
                <Button onClick={() => window.location.href = '/'} variant="outline" className="hidden sm:flex">
                    Back to Dashboard
                </Button>
            </div>
            
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 w-full max-w-md"
                    />
                </div>
            </div>
            
            {filtered.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium text-muted-foreground">No students found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {search ? 'Try a different search term' : 'You currently have no students'}
                    </p>
                    {!search && (
                        <Button className="mt-4">
                            Invite Students
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((student) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                            <AvatarFallback className="text-base">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                            <AvatarImage src={student.avatar} alt={student.name} />
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{student.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {student.enrolledClasses.length} {student.enrolledClasses.length === 1 ? 'class' : 'classes'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {student.level}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{student.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${getProgressColor(student.progress)}`}
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Last active: {formatDate(student.lastActive)}</span>
                                        <span>{student.stats.workoutsCompleted} workouts</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2 pt-0">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    View Profile
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        // In a real app, this would open a chat with the student
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="sr-only">Message</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            
            <Button variant="outline" className="w-full mt-8 sm:hidden" onClick={() => window.location.href = '/'}>
                Back to Dashboard
            </Button>
            
            <ClientProfileDialog 
                student={selectedStudent} 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                onRemove={handleRemove} 
            />
        </div>
    );
} 