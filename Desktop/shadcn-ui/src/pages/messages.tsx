import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const initialMessages = [
    { from: 'You', text: 'Hi there!' },
    { from: 'Them', text: 'Hello! How can I help you?' },
];

export default function Messages() {
    const { userId, brandId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const recipient = userId || brandId;

    const sendMessage = () => {
        if (input.trim()) {
            setMessages([...messages, { from: 'You', text: input }]);
            setInput('');
        }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground mb-4">Chat with <span className="font-semibold">{recipient}</span></p>
            <div className="border rounded p-4 h-64 overflow-y-auto bg-muted mb-2">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-2 ${msg.from === 'You' ? 'text-right' : 'text-left'}`}>
                        <span className="font-medium">{msg.from}:</span> {msg.text}
                    </div>
                ))}
            </div>
            <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                <input
                    className="flex-1 border rounded px-2 py-1"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit">Send</Button>
            </form>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
    );
} 