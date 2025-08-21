import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, Star, DollarSign } from 'lucide-react';

export default function Analytics() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <BarChart className="h-6 w-6 text-primary" /> 24
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <Users className="h-6 w-6 text-primary" /> 120
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Avg. Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <Star className="h-6 w-6 text-yellow-500" /> 4.8
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <DollarSign className="h-6 w-6 text-green-600" /> 2,400 TND
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Placeholder for charts/graphs */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Attendance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">[Attendance Chart Placeholder]</div>
                </CardContent>
            </Card>
        </div>
    );
} 