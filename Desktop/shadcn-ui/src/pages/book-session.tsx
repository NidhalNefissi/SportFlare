import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { mockCoaches } from './Coaches';

export default function BookSession() {
    const { coachId } = useParams();
    const navigate = useNavigate();
    const coach = mockCoaches.find(c => c.id === coachId);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [booked, setBooked] = useState(false);
    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-2xl font-bold tracking-tight">Book Private Session</h1>
            {coach ? (
                <>
                    <div className="flex items-center gap-4 mb-2">
                        <img src={coach.avatar} alt={coach.name} className="h-16 w-16 rounded-full object-cover" />
                        <div>
                            <div className="font-medium text-lg">{coach.name}</div>
                            <div className="text-sm text-muted-foreground">{coach.specialties?.join(' • ')}</div>
                        </div>
                    </div>
                    <form className="space-y-3" onSubmit={e => { e.preventDefault(); setBooked(true); }}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" className="border rounded px-2 py-1 w-full" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input type="time" className="border rounded px-2 py-1 w-full" value={time} onChange={e => setTime(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea className="border rounded px-2 py-1 w-full" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={booked}>{booked ? 'Session Booked!' : 'Book Session'}</Button>
                        {booked && <div className="text-green-600 font-medium mt-2">Booking successful!</div>}
                    </form>
                </>
            ) : (
                <div className="text-muted-foreground">Coach not found.</div>
            )}
            <Button variant="outline" onClick={() => navigate('/coaches')}>Back to Coaches</Button>
        </div>
    );
} 