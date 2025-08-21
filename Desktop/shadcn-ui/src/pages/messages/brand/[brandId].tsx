import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function BrandMessages() {
    const { brandId } = useParams();
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-lg mx-auto mt-12">
            <h1 className="text-2xl font-bold tracking-tight">Brand Messages</h1>
            <p className="text-muted-foreground">This is the messaging page for brand <span className="font-semibold">{brandId}</span>.</p>
            <Button variant="outline" onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
        </div>
    );
} 