import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar } from 'lucide-react';

export default function Earnings() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Earnings</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <DollarSign className="h-6 w-6 text-green-600" /> 2,400 TND
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <Calendar className="h-6 w-6 text-primary" /> 800 TND
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <DollarSign className="h-6 w-6 text-yellow-500" /> 200 TND
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Placeholder for earnings chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">[Earnings Chart Placeholder]</div>
                </CardContent>
            </Card>
        </div>
    );
} 