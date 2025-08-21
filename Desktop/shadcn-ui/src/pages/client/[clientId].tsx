import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ClientProfile() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-2xl font-bold tracking-tight">Client Profile</h1>
            <p className="text-muted-foreground">This is the profile page for client <span className="font-semibold">{clientId}</span>.</p>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
    );
} 