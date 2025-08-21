import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Trophy, 
  Edit, 
  Save, 
  Settings, 
  Activity,
  Heart,
  Dumbbell,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans.new';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock workout data
const mockWorkouts = [
  { id: '1', name: 'Morning Run', type: 'Cardio', date: new Date(2023, 6, 10), duration: 30, calories: 320, distance: 5 },
  { id: '2', name: 'Weight Training', type: 'Strength', date: new Date(2023, 6, 12), duration: 45, calories: 280, sets: 4, reps: 12 },
  { id: '3', name: 'Yoga Session', type: 'Flexibility', date: new Date(2023, 6, 13), duration: 60, calories: 200 },
  { id: '4', name: 'HIIT Workout', type: 'High Intensity', date: new Date(2023, 6, 15), duration: 25, calories: 350 },
  { id: '5', name: 'Swimming', type: 'Cardio', date: new Date(2023, 6, 17), duration: 40, calories: 400, distance: 1.5 },
];

// Mock weight tracking data
const weightData = [
  { date: '2023-06-01', weight: 78 },
  { date: '2023-06-08', weight: 77.2 },
  { date: '2023-06-15', weight: 76.5 },
  { date: '2023-06-22', weight: 76.0 },
  { date: '2023-06-29', weight: 75.3 },
  { date: '2023-07-06', weight: 74.8 },
  { date: '2023-07-13', weight: 74.2 },
];

// Mock workout type distribution data
const workoutTypeData = [
  { name: 'Cardio', value: 45 },
  { name: 'Strength', value: 30 },
  { name: 'Flexibility', value: 15 },
  { name: 'High Intensity', value: 10 },
];

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Workout summary mock data
const workoutSummary = {
  totalWorkouts: 42,
  totalDuration: 1680, // minutes
  totalCalories: 15400,
  avgWeeklyWorkouts: 3.5
};

export default function Profile() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle tab state from navigation
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Clear the location state to avoid keeping it in history
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  const [workouts, setWorkouts] = useState(mockWorkouts);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        email: user.email,
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar
      };
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-3xl">{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <Input
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="Avatar URL"
                      className="w-full max-w-[200px]"
                    />
                  )}
                  
                  <div className="text-center">
                    <Badge>{user?.role}</Badge>
                    {user?.subscription && (
                      <Badge variant="secondary" className="ml-2">
                        {user.subscription.plan}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium" htmlFor="name">Name</label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium" htmlFor="bio">Bio</label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-semibold">{user?.name}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                      
                      {user?.bio && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">About</h3>
                          <p>{user.bio}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.achievements?.map(achievement => (
                <Card key={achievement.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned on {formatDate(new Date(achievement.earnedAt))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!user?.achievements || user.achievements.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No achievements yet. Start working out to earn badges!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          {/* Recent Workouts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Workouts
              </h2>
              <Button variant="outline" size="sm">Add Workout</Button>
            </div>
            
            <div className="space-y-4">
              {workouts.map(workout => (
                <Card key={workout.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{workout.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(workout.date)}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{workout.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{workout.calories} cal</span>
                      </div>
                      {workout.distance && (
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{workout.distance} km</span>
                        </div>
                      )}
                      {workout.sets && (
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{workout.sets} sets x {workout.reps} reps</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Workout Plan */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Workout Plan
            </h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 divide-x">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={day} className="p-4 text-center">
                      <div className="font-medium">{day}</div>
                      {index === 1 || index === 3 || index === 5 ? (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-primary/10">
                            {index === 1 && 'Cardio'}
                            {index === 3 && 'Strength'}
                            {index === 5 && 'HIIT'}
                          </Badge>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-muted-foreground">Rest</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">3 workouts planned this week</p>
                <Button variant="ghost" size="sm">Edit Plan</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Workout Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold">{workoutSummary.totalWorkouts}</div>
                <p className="text-sm text-muted-foreground text-center">Total Workouts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold">{Math.round(workoutSummary.totalDuration / 60)}</div>
                <p className="text-sm text-muted-foreground text-center">Hours Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold">{workoutSummary.totalCalories.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground text-center">Calories Burned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold">{workoutSummary.avgWeeklyWorkouts}</div>
                <p className="text-sm text-muted-foreground text-center">Avg. Weekly</p>
              </CardContent>
            </Card>
          </div>

          {/* Weight Tracking Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Your weight over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weightData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Workout Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={workoutTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {workoutTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: 'Mon', duration: 45 },
                        { day: 'Tue', duration: 0 },
                        { day: 'Wed', duration: 60 },
                        { day: 'Thu', duration: 0 },
                        { day: 'Fri', duration: 30 },
                        { day: 'Sat', duration: 0 },
                        { day: 'Sun', duration: 90 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="duration" fill="#8884d8" name="Minutes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="language">Language</label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="notifications">Email Notifications</label>
                <Select defaultValue="important">
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="important">Important only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Change Password</label>
                <div className="space-y-2">
                  <Input type="password" placeholder="Current Password" />
                  <Input type="password" placeholder="New Password" />
                  <Input type="password" placeholder="Confirm New Password" />
                </div>
                <Button className="mt-2" size="sm">Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan: <span className="text-primary capitalize">{user?.subscription?.plan || 'Free'}</span></p>
                    {user?.subscription && (
                      <p className="text-sm text-muted-foreground">Renews on {formatDate(new Date(user.subscription.endDate))}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <SubscriptionPlans />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                </div>
                <Select defaultValue="public">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activity Sharing</p>
                  <p className="text-sm text-muted-foreground">Share your workout activities</p>
                </div>
                <Select defaultValue="friends">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select sharing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}