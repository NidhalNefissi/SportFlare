import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import { format } from 'date-fns';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface BookingChatProps {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isMessagingEnabled: boolean;
  onToggleMessaging: (enabled: boolean) => Promise<void>;
}

export function BookingChat({
  bookingId,
  otherUser,
  messages,
  onSendMessage,
  isMessagingEnabled,
  onToggleMessaging,
}: BookingChatProps) {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    await onSendMessage(message.trim());
    setMessage('');
  };

  const handleToggleMessaging = async () => {
    await onToggleMessaging(!isMessagingEnabled);
  };

  if (!isMessagingEnabled) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground mb-4 text-center">
          Messaging is currently disabled for this booking.
        </p>
        <Button onClick={handleToggleMessaging}>
          Enable Messaging
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherUser.name}</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length > 0 
                ? `Last message: ${format(new Date(messages[messages.length - 1].timestamp), 'MMM d, yyyy h:mm a')}`
                : 'No messages yet'}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToggleMessaging}
        >
          Disable Messaging
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                  msg.senderId === user?.id
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                <div>
                  {msg.senderId !== user?.id && (
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {msg.senderName}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isMessagingEnabled}
          />
          <Button type="submit" disabled={!message.trim() || !isMessagingEnabled}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
