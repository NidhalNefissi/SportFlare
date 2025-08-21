import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AIMessage } from '@/types';
import { useUser } from './UserContext';

interface AICoachContextType {
  messages: AIMessage[];
  sendMessage: (content: string) => void;
  isTyping: boolean;
  clearConversation: () => void;
  analyzeMeal: (imageUrl: string) => void;
}

const AICoachContext = createContext<AICoachContextType | undefined>(undefined);

export const AICoachProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from local storage
  useEffect(() => {
    if (user) {
      const storedMessages = localStorage.getItem(`sportflare_ai_messages_${user.id}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        // Add welcome message for new conversations
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: `Hello ${user.name}! I'm your AI Fitness Coach. How can I help you today? I can help with workout plans, nutrition advice, or track your progress.`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [user]);

  // Save messages to local storage
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`sportflare_ai_messages_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Mock AI response generator
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Simple pattern matching for responses
    if (lowerCaseMessage.includes('workout') || lowerCaseMessage.includes('exercise')) {
      response = "Here's a personalized workout plan for you: Start with 10 minutes of cardio warm-up, then do 3 sets of squats, push-ups, and planks. Cool down with 5 minutes of stretching. Would you like me to adjust the intensity?";
    } else if (lowerCaseMessage.includes('nutrition') || lowerCaseMessage.includes('diet') || lowerCaseMessage.includes('food')) {
      response = "Based on your goals, I recommend focusing on protein-rich foods like chicken, fish, and legumes. Try to include plenty of vegetables with each meal and stay hydrated throughout the day. Would you like specific meal ideas?";
    } else if (lowerCaseMessage.includes('progress') || lowerCaseMessage.includes('tracking')) {
      response = "I see you've been consistent with your workouts this week! Your strength indicators are improving. Keep up the good work and consider increasing your weights slightly in your next session.";
    } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = `Hello there! How can I assist with your fitness journey today?`;
    } else {
      response = "I'm here to help with your fitness goals. Would you like workout advice, nutrition tips, or to track your progress?";
    }
    
    setIsTyping(false);
    return response;
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate AI response
    const aiResponse = await generateAIResponse(content);
    
    const assistantMessage: AIMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };

  const analyzeMeal = (imageUrl: string) => {
    // Add user message with image
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: `[Image uploaded]`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI analyzing the meal
    setIsTyping(true);
    
    setTimeout(() => {
      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: "I analyzed your meal! This appears to be a balanced plate with approximately 500 calories. I see a good source of protein, healthy vegetables, and complex carbs. Great choice! This meal is aligned with your fitness goals.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const clearConversation = () => {
    if (user) {
      const welcomeMessage: AIMessage = {
        id: '1',
        role: 'assistant',
        content: `Hello again ${user.name}! I'm ready to help with your fitness journey. What would you like to discuss?`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    } else {
      setMessages([]);
    }
  };

  return (
    <AICoachContext.Provider
      value={{
        messages,
        sendMessage,
        isTyping,
        clearConversation,
        analyzeMeal,
      }}
    >
      {children}
    </AICoachContext.Provider>
  );
};

export const useAICoach = () => {
  const context = useContext(AICoachContext);
  if (context === undefined) {
    throw new Error('useAICoach must be used within an AICoachProvider');
  }
  return context;
};