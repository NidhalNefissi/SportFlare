import { useState, useRef, useEffect } from 'react';
import { useAICoach } from '@/context/AICoachContext';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AIMessage } from '@/types';
import { Send, Trash2, Upload, BarChart2, Dumbbell, Pizza, Calendar, Activity } from 'lucide-react';

export default function AICoach() {
  const { user } = useUser();
  const { messages, sendMessage, isTyping, clearConversation, analyzeMeal } = useAICoach();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (actionText: string) => {
    sendMessage(actionText);
  };

  // For demo purposes only - would connect to real image upload
  const handleImageUpload = () => {
    // Simulate meal image analysis
    analyzeMeal("meal_image_url.jpg");
  };

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Fitness Coach</h1>
        <p className="text-muted-foreground">Get personalized workout plans, nutrition advice, and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Chat */}
        <Card className="col-span-2">
          <CardHeader className="p-4 flex-row justify-between items-center">
            <div>
              <CardTitle>Your Personal AI Coach</CardTitle>
              <CardDescription>Get advice on fitness, nutrition, and more</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={clearConversation}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <CardContent className="p-4">
                <div className="h-[60vh] overflow-y-auto flex flex-col space-y-4 pr-4">
                  {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center self-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t flex flex-col gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction("Create a workout plan for me")}>
                    <Dumbbell className="h-4 w-4 mr-1" />
                    Workout Plan
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction("Give me nutrition advice")}>
                    <Pizza className="h-4 w-4 mr-1" />
                    Nutrition
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction("How to track my progress?")}>
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Track Progress
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickAction("What should I train today?")}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Today's Plan
                  </Button>
                </div>
                
                <div className="relative flex w-full">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about fitness or nutrition..."
                    className="pr-24"
                  />
                  <div className="absolute right-0 top-0 flex h-full items-center gap-1 pr-1">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      onClick={handleImageUpload}
                      className="h-8 w-8"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="submit" 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={input.trim() === ''}
                      className="h-8 w-8"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <CardContent className="p-4 space-y-6">
                <h3 className="text-lg font-medium">Your Fitness Progress</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Strength Training</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cardio Performance</span>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flexibility</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Consistency</span>
                      <span className="text-sm text-muted-foreground">80%</span>
                    </div>
                    <Progress value={80} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Weekly Workouts</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-2xl font-bold">4/5</div>
                      <p className="text-xs text-muted-foreground">Target: 5 workouts</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm">Active Minutes</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="text-2xl font-bold">240</div>
                      <p className="text-xs text-muted-foreground">Target: 300 minutes</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Button className="w-full">View Detailed Analytics</Button>
              </CardContent>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-0">
              <CardContent className="p-4 space-y-6">
                <h3 className="text-lg font-medium">Nutrition Tracking</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="text-sm text-muted-foreground">1850 / 2200</span>
                    </div>
                    <Progress value={84} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Protein</span>
                      <span className="text-sm text-muted-foreground">110g / 140g</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Hydration</span>
                      <span className="text-sm text-muted-foreground">1.8L / 2.5L</span>
                    </div>
                    <Progress value={72} />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Recent Meals</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Pizza className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Breakfast</p>
                        <p className="text-xs text-muted-foreground">Oatmeal with fruits - 420 cal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Pizza className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Lunch</p>
                        <p className="text-xs text-muted-foreground">Grilled chicken salad - 580 cal</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button onClick={handleImageUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze Meal Photo
                  </Button>
                  <Button variant="outline">Log Meal Manually</Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Right Column - Stats and Tips */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Fitness Insights</CardTitle>
            <CardDescription>Your stats and personalized tips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Goal */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Weekly Goals
              </h3>
              <Card className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Workouts</span>
                      <span>4/5</span>
                    </div>
                    <Progress value={80} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Steps</span>
                      <span>35k/50k</span>
                    </div>
                    <Progress value={70} className="h-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Protein</span>
                      <span>110g/140g</span>
                    </div>
                    <Progress value={78} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Recent Achievements
              </h3>
              <div className="space-y-2">
                <AchievementCard 
                  title="Consistent Athlete"
                  description="Completed 5 workouts in a week"
                  icon="🏆"
                />
                <AchievementCard 
                  title="Strength Milestone"
                  description="Increased your squat max by 10%"
                  icon="💪"
                />
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Personalized Tips</h3>
              <div className="space-y-2">
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-xs">Try to increase your water intake to improve recovery between workouts.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-xs">Consider adding a rest day after your intense leg workouts for better muscle growth.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Button variant="outline" className="w-full">View Full Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MessageProps {
  message: AIMessage;
}

const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{isUser ? 'U' : 'AI'}</AvatarFallback>
        </Avatar>
        <div
          className={`p-3 rounded-lg ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <span className="text-xs opacity-70 block mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper components
const Trophy = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
};

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
}

const AchievementCard = ({ title, description, icon }: AchievementCardProps) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};