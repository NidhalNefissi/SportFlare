import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { mockGyms } from '@/data/mockData';

const mockCheckIns = [
    { user: 'Alice', time: 'Today, 9:00 AM' },
    { user: 'Bob', time: 'Yesterday, 6:30 PM' },
    { user: 'Jane', time: 'Yesterday, 5:00 PM' },
];

export default function CheckIn() {
    const { gymId } = useParams();
    const navigate = useNavigate();
    const [checkedIn, setCheckedIn] = useState(false);
    const gym = mockGyms.find(g => g.id === gymId);
    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-2xl font-bold tracking-tight">Check In</h1>
            {gym ? (
                <>
                    <div className="space-y-1">
                        <div className="font-medium text-lg">{gym.name}</div>
                        <div className="text-sm text-muted-foreground">{gym.address}</div>
                    </div>
                    <Button className="mt-4" disabled={checkedIn} onClick={() => setCheckedIn(true)}>
                        {checkedIn ? 'Checked In!' : 'Check In'}
                    </Button>
                    {checkedIn && <div className="text-green-600 font-medium mt-2">Check-in successful!</div>}
                    <div className="mt-8">
                        <h3 className="font-medium mb-2">Recent Check-Ins</h3>
                        <ul className="space-y-1 text-sm">
                            {mockCheckIns.map((ci, i) => (
                                <li key={i}>{ci.user} - {ci.time}</li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <div className="text-muted-foreground">Gym not found.</div>
            )}
            <Button variant="outline" onClick={() => navigate('/gyms')}>Back to Gyms</Button>
        </div>
    );
} 