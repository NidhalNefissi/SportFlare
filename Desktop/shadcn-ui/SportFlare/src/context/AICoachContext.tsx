import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AIMessage } from '@/types';
import { useUser } from './UserContext';
import { apiService } from '@/services';

interface AICoachContextType {
  messages: AIMessage[];
  sendMessage: (content: string) => Promise<void>;
  isTyping: boolean;
  clearConversation: () => Promise<void>;
  analyzeMeal: (imageUrl: string) => Promise<void>;
}

const AICoachContext = createContext<AICoachContextType | undefined>(undefined);

export const AICoachProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages when user changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        setMessages([]);
        return;
      }
      
      try {
        const aiMessages = await apiService.getAIMessages(user.id);
        if (aiMessages.length > 0) {
          setMessages(aiMessages);
        } else {
          // Add welcome message for new conversations
          const welcomeMessage: AIMessage = {
            id: '1',
            role: 'assistant',
            content: `Hello ${user.name}! I'm your AI Fitness Coach. How can I help you today? I can help with workout plans, nutrition advice, or track your progress.`,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load AI messages:', error);
        
        // Fallback to welcome message
        const welcomeMessage: AIMessage = {
          id: '1',
          role: 'assistant',
          content: `Hello ${user.name}! I'm your AI Fitness Coach. How can I help you today?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    };
    
    loadMessages();
  }, [user]);

  const sendMessage = async (content: string) => {
    if (!user) return;
    
    try {
      // Add user message to UI immediately
      const userMessage: AIMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      // Send message to API and get response
      const responseMessage = await apiService.sendAIMessage(content, user.id);
      
      // AI response will be added by the API service through a simulated response
      // We wait for the response time and then refetch messages
      setTimeout(async () => {
        try {
          const updatedMessages = await apiService.getAIMessages(user.id);
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Failed to get updated AI messages:', error);
        } finally {
          setIsTyping(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to send AI message:', error);
      setIsTyping(false);
    }
  };

  const analyzeMeal = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      // Add user message with image to UI immediately
      const userMessage: AIMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: `[Image uploaded]`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      // In a real app, we would send the image to an API for analysis
      // Here we'll simulate the process
      
      // Send a message to our API service indicating image analysis
      await apiService.sendAIMessage('[MEAL_IMAGE_ANALYSIS_REQUEST]', user.id);
      
      // Wait for the simulated AI response
      setTimeout(async () => {
        try {
          const updatedMessages = await apiService.getAIMessages(user.id);
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Failed to get meal analysis:', error);
          
          // Fallback response if API fails
          const fallbackResponse: AIMessage = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: "I analyzed your meal! This appears to be a balanced plate with approximately 500 calories. I see a good source of protein, healthy vegetables, and complex carbs. Great choice! This meal is aligned with your fitness goals.",
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, fallbackResponse]);
        } finally {
          setIsTyping(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to analyze meal:', error);
      setIsTyping(false);
    }
  };

  const clearConversation = async () => {
    if (!user) return;
    
    setIsTyping(true);
    
    try {
      // In a real app, we would make an API call to clear the conversation history
      // Here we'll just create a new welcome message
      const welcomeMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: `Hello again ${user.name}! I'm ready to help with your fitness journey. What would you like to discuss?`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // In a production app, we'd make an API call like:
      // await apiService.clearAIConversation(user.id);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    } finally {
      setIsTyping(false);
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