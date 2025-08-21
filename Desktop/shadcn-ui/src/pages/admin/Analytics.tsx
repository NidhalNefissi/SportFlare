import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, BarChart2, TrendingUp, Clock, DollarSign, CreditCard, UserCheck, FileText, Video, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data
const platformMetrics = {
  totalUsers: 12453,
  activeUsers: 3421,
  newUsers: 287,
  totalRevenue: 125430,
  mrr: 85620,
  activeSubscriptions: 5342,
};

const userSegments = [
  { name: 'Free Users', value: 42, color: 'bg-blue-500' },
  { name: 'Basic Plan', value: 28, color: 'bg-green-500' },
  { name: 'Pro Plan', value: 18, color: 'bg-purple-500' },
  { name: 'Premium Plan', value: 12, color: 'bg-amber-500' },
];

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'upgraded to Pro Plan', time: '2 min ago', type: 'subscription', change: '+$19.99' },
  { id: 2, user: 'Sarah Johnson', action: 'cancelled subscription', time: '15 min ago', type: 'subscription', change: '-$9.99' },
  { id: 3, user: 'Mike Chen', action: 'signed up', time: '22 min ago', type: 'user', change: '' },
  { id: 4, user: 'Emma Wilson', action: 'completed workout program', time: '45 min ago', type: 'activity', change: '' },
  { id: 5, user: 'Alex Kim', action: 'purchased training plan', time: '1 hour ago', type: 'purchase', change: '+$29.99' },
];

const contentStats = [
  { name: 'Total Workouts', value: 245, icon: Activity, change: 0.12 },
  { name: 'Active Challenges', value: 18, icon: TrendingUp, change: 0.05 },
  { name: 'Video Tutorials', value: 187, icon: Video, change: 0.08 },
  { name: 'Articles', value: 92, icon: FileText, change: 0.03 },
  { name: 'Community Posts', value: 1245, icon: MessageSquare, change: 0.15 },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track and analyze platform performance</p>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.totalUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+{platformMetrics.newUsers}</span> this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.activeUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(platformMetrics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+15%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(platformMetrics.mrr)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total and new users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                  <BarChart2 className="h-12 w-12 text-muted-foreground" />
                  <span className="text-muted-foreground ml-2">User Growth Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Monthly revenue and MRR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                  <TrendingUp className="h-12 w-12 text-muted-foreground" />
                  <span className="text-muted-foreground ml-2">Revenue Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.totalUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+{platformMetrics.newUsers}</span> this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.activeUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12:45</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+2:15</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>Breakdown of user plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-md">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">User Segments Chart</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {userSegments.map((segment, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${segment.color}`} />
                    <span className="text-sm">{segment.name}</span>
                    <span className="text-sm font-medium ml-auto">{segment.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(platformMetrics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+15%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(platformMetrics.mrr)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(platformMetrics.activeSubscriptions)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+8%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and MRR trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-md">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Revenue Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentStats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {stat.change >= 0 ? '+' : ''}{formatPercentage(stat.change)}
                    </span>{' '}
                    from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Engagement</CardTitle>
              <CardDescription>How users interact with content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/50 rounded-md">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Engagement Metrics Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple pie chart component for visualization
function PieChart({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12a2.5 2.5 0 0 0 0-5v5Z" />
      <path d="M12 7a5 5 0 0 1 0 10" />
    </svg>
  );
}
