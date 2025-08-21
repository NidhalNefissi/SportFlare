import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Support() {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-3xl font-bold tracking-tight">Support</h1>
            <p className="text-muted-foreground">This is the support management page. (Support tickets coming soon.)</p>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
    );
} 