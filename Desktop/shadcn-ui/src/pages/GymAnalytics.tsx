import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart, LineChart, Users, Clock, DollarSign, Activity, Calendar, Search, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for charts and metrics
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    name: month,
    checkIns: Math.floor(Math.random() * 300) + 100,
    revenue: Math.floor(Math.random() * 5000) + 3000,
    classes: Math.floor(Math.random() * 50) + 20,
  }));
};

const mockAnalytics = {
  summary: {
    totalMembers: 1245,
    activeMembers: 856,
    monthlyRevenue: 32450,
    avgSessionDuration: '48 min',
    memberRetentionRate: 78,
    newMembers: 124,
    totalCheckIns: 3421,
    avgClassAttendance: 24,
  },
  monthlyData: generateMonthlyData(),
  topClasses: [
    { id: 1, name: 'HIIT Workout', attendance: 320, capacity: 30, revenue: 4800 },
    { id: 2, name: 'Yoga Flow', attendance: 280, capacity: 25, revenue: 4200 },
    { id: 3, name: 'Pilates', attendance: 240, capacity: 20, revenue: 3600 },
    { id: 4, name: 'Spin Class', attendance: 210, capacity: 25, revenue: 5250 },
    { id: 5, name: 'Zumba', attendance: 190, capacity: 30, revenue: 2850 },
  ],
  topMembers: [
    { id: 1, name: 'Alex Johnson', checkIns: 32, lastVisit: '2023-11-15', membership: 'Premium' },
    { id: 2, name: 'Sarah Williams', checkIns: 28, lastVisit: '2023-11-14', membership: 'Premium' },
    { id: 3, name: 'Michael Brown', checkIns: 25, lastVisit: '2023-11-13', membership: 'Standard' },
    { id: 4, name: 'Emily Davis', checkIns: 22, lastVisit: '2023-11-12', membership: 'Premium' },
    { id: 5, name: 'David Wilson', checkIns: 20, lastVisit: '2023-11-11', membership: 'Standard' },
  ],
  revenueByType: [
    { name: 'Memberships', value: 18500 },
    { name: 'Personal Training', value: 7500 },
    { name: 'Merchandise', value: 3200 },
    { name: 'Classes', value: 3250 },
  ],
  checkInTrend: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 50) + 10,
  })),
};

const StatCard = ({ title, value, icon: Icon, description, trend, trendType }: { title: string; value: string | number; icon: React.ElementType; description?: string; trend?: number; trendType?: 'up' | 'down' }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendType === 'up' ? '↑' : '↓'} {trend}% from last month
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProgressCard = ({ title, value, max, description }: { title: string; value: number; max: number; description?: string }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground">{value}/{max}</span>
        </div>
        <Progress value={(value / max) * 100} className="h-2" />
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

const ChartPlaceholder = ({ title, icon: Icon, className = '' }: { title: string; icon: React.ElementType; className?: string }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-md">
        <div className="text-center text-muted-foreground text-sm">
          <BarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Chart data will be displayed here</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function GymAnalytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gym Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your gym's performance and member engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              className="pl-8 w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Members" 
              value={mockAnalytics.summary.totalMembers.toLocaleString()} 
              icon={Users} 
              trend={12.5} 
              trendType="up" 
            />
            <StatCard 
              title="Active Members" 
              value={mockAnalytics.summary.activeMembers.toLocaleString()} 
              icon={Activity} 
              description={`${Math.round((mockAnalytics.summary.activeMembers / mockAnalytics.summary.totalMembers) * 100)}% of total`} 
            />
            <StatCard 
              title="Monthly Revenue" 
              value={`$${mockAnalytics.summary.monthlyRevenue.toLocaleString()}`} 
              icon={DollarSign} 
              trend={8.2} 
              trendType="up" 
            />
            <StatCard 
              title="Avg. Session" 
              value={mockAnalytics.summary.avgSessionDuration} 
              icon={Clock} 
              trend={-2.3} 
              trendType="down" 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ChartPlaceholder title="Check-ins This Month" icon={Activity} />
            <ChartPlaceholder title="Revenue by Type" icon={DollarSign} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Classes</CardTitle>
                <CardDescription>Most attended classes this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topClasses.map((cls) => (
                    <div key={cls.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{cls.name}</span>
                        <span className="text-sm text-muted-foreground">{cls.attendance} attendees</span>
                      </div>
                      <Progress value={(cls.attendance / cls.capacity) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${cls.revenue.toLocaleString()} revenue</span>
                        <span>Capacity: {cls.capacity}/class</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Members</CardTitle>
                <CardDescription>Most active members this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.membership}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.checkIns} check-ins</p>
                        <p className="text-xs text-muted-foreground">Last: {format(new Date(member.lastVisit), 'MMM d')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="New Members" 
              value={mockAnalytics.summary.newMembers} 
              icon={Users} 
              trend={15.7} 
              trendType="up" 
            />
            <StatCard 
              title="Member Retention" 
              value={`${mockAnalytics.summary.memberRetentionRate}%`} 
              icon={Activity} 
              trend={3.2} 
              trendType="up" 
            />
            <ProgressCard 
              title="Average Class Attendance" 
              value={mockAnalytics.summary.avgClassAttendance} 
              max={30} 
              description={`${Math.round((mockAnalytics.summary.avgClassAttendance / 30) * 100)}% of capacity`} 
            />
          </div>
          <ChartPlaceholder title="Member Growth" icon={Users} className="h-[400px]" />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Total Revenue" 
              value={`$${mockAnalytics.summary.monthlyRevenue.toLocaleString()}`} 
              icon={DollarSign} 
              trend={8.2} 
              trendType="up" 
            />
            <StatCard 
              title="Revenue per Member" 
              value={`$${Math.round(mockAnalytics.summary.monthlyRevenue / mockAnalytics.summary.activeMembers)}`} 
              icon={Users} 
              trend={1.8} 
              trendType="up" 
            />
            <ProgressCard 
              title="Revenue Goal" 
              value={mockAnalytics.summary.monthlyRevenue} 
              max={40000} 
              description={`${Math.round((mockAnalytics.summary.monthlyRevenue / 40000) * 100)}% of monthly target`} 
            />
          </div>
          <ChartPlaceholder title="Revenue Breakdown" icon={DollarSign} className="h-[300px]" />
          <ChartPlaceholder title="Revenue by Source" icon={DollarSign} className="h-[300px]" />
        </TabsContent>
      </Tabs>
    </div>
  );
}