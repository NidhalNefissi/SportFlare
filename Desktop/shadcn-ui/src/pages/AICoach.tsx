import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dumbbell, Pizza, BarChart2, Calendar, Upload } from 'lucide-react';

const initialMessages = [
  { from: 'AI', text: 'Hello! I am your AI fitness coach. How can I help you today?' },
];

export default function AICoach() {
  const { user } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (msg: string) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { from: 'You', text: msg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'AI', text: getAIResponse(msg) }]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (msg: string) => {
    if (msg.toLowerCase().includes('workout')) return 'Here is a personalized workout plan for you!';
    if (msg.toLowerCase().includes('nutrition')) return 'Here are some nutrition tips to help you reach your goals.';
    if (msg.toLowerCase().includes('progress')) return 'Tracking your progress is key! Try logging your workouts and meals.';
    if (msg.toLowerCase().includes('train')) return 'Today is a great day for a HIIT session!';
    if (msg.toLowerCase().includes('meal')) return 'Analyzing your meal... Looks healthy!';
    return 'How else can I assist you?';
  };

  const handleQuickAction = (text: string) => sendMessage(text);

  const handleImageUpload = () => {
    setMessages(prev => [...prev, { from: 'You', text: '[Uploaded meal photo]' }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'AI', text: 'Analyzing your meal... Looks healthy and balanced!' }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          </Avatar>
          <div>
            <CardTitle>AI Coach</CardTitle>
            <div className="text-sm text-muted-foreground">Hi {user?.name || 'User'}! Ask me anything about fitness, nutrition, or your progress.</div>
          </div>
        </CardHeader>
        <CardContent className="h-80 overflow-y-auto bg-muted rounded p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.from === 'You' ? 'text-right' : 'text-left'}`}>
              <span className="font-medium">{msg.from}:</span> {msg.text}
            </div>
          ))}
          {isTyping && <div className="text-muted-foreground">AI is typing...</div>}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 pb-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 min-w-[140px]" onClick={() => handleQuickAction('Create a workout plan for me')}>
              <Dumbbell className="h-4 w-4 mr-1" /> Workout Plan
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-[140px]" onClick={() => handleQuickAction('Give me nutrition advice')}>
              <Pizza className="h-4 w-4 mr-1" /> Nutrition
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-[140px]" onClick={() => handleQuickAction('How to track my progress?')}>
              <BarChart2 className="h-4 w-4 mr-1" /> Track Progress
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-[140px]" onClick={() => handleQuickAction('What should I train today?')}>
              <Calendar className="h-4 w-4 mr-1" /> Today's Plan
            </Button>
            <Button variant="outline" size="sm" className="flex-1 min-w-[140px]" onClick={handleImageUpload}>
              <Upload className="h-4 w-4 mr-1" /> Upload Meal
            </Button>
          </div>
          <form className="flex gap-2 w-full" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
            <Input
              className="flex-1"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}