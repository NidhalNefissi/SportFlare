import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Filter, Users, Activity, BarChart2, Clock, TrendingUp, Award, Star } from "lucide-react"

type TimeRange = 'week' | 'month' | 'quarter' | 'year'

// Mock data for analytics
const mockAnalytics = {
  totalMembers: 342,
  newMembersThisMonth: 24,
  avgClassAttendance: 78, // %
  peakHours: '6-8 PM',
  revenue: {
    current: 24500,
    change: 12.5,
    trend: 'up'
  },
  topClasses: [
    { name: 'Morning Yoga', attendance: 95, revenue: 2850 },
    { name: 'HIIT Blast', attendance: 88, revenue: 2640 },
    { name: 'Power Lifting', attendance: 82, revenue: 2460 },
  ],
  topCoaches: [
    { name: 'Sarah Johnson', rating: 4.9, classesTaught: 24, attendanceRate: 92 },
    { name: 'Mike Chen', rating: 4.8, classesTaught: 22, attendanceRate: 89 },
    { name: 'Emma Wilson', rating: 4.7, classesTaught: 20, attendanceRate: 85 },
  ],
  attendanceTrend: [
    { day: 'Mon', attendance: 65 },
    { day: 'Tue', attendance: 78 },
    { day: 'Wed', attendance: 82 },
    { day: 'Thu', attendance: 85 },
    { day: 'Fri', attendance: 72 },
    { day: 'Sat', attendance: 90 },
    { day: 'Sun', attendance: 60 },
  ],
  memberRetention: 84, // %
  avgVisitDuration: '1h 24m',
  busiestDay: 'Saturday',
  slowestDay: 'Sunday',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Key metrics and insights about your gym performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              +{mockAnalytics.newMembersThisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Class Attendance
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.avgClassAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockAnalytics.revenue.current.toLocaleString()}
            </div>
            <p className={`text-xs ${mockAnalytics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {mockAnalytics.revenue.trend === 'up' ? '↑' : '↓'} {mockAnalytics.revenue.change}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peak Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.peakHours}</div>
            <p className="text-xs text-muted-foreground">
              Busiest time of day
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>
                  Weekly attendance overview
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-end justify-between px-6">
                  {mockAnalytics.attendanceTrend.map((day) => (
                    <div key={day.day} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary rounded-t-sm"
                        style={{ height: `${day.attendance * 2}px` }}
                      />
                      <span className="text-xs mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Classes</CardTitle>
                <CardDescription>By attendance rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topClasses.map((cls) => (
                    <div key={cls.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{cls.name}</p>
                        <span className="text-sm text-muted-foreground">{cls.attendance}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${cls.attendance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Coaches</CardTitle>
                <CardDescription>By member ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topCoaches.map((coach, index) => (
                    <div key={coach.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="font-medium">{coach.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="font-medium">{coach.name}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-muted-foreground">
                              {coach.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{coach.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">attendance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Retention</CardTitle>
                <CardDescription>Current retention rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative h-40 w-40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-3xl font-bold">{mockAnalytics.memberRetention}%</div>
                    </div>
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-green-500"
                        strokeWidth="10"
                        strokeDasharray={`${mockAnalytics.memberRetention * 2.51} 251.2`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    of members stay active
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Visit Duration</p>
                    <p className="text-lg font-semibold">{mockAnalytics.avgVisitDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Busiest Day</p>
                    <p className="text-lg font-semibold">{mockAnalytics.busiestDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Slowest Day</p>
                    <p className="text-lg font-semibold">{mockAnalytics.slowestDay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Class Analytics</CardTitle>
              <CardDescription>Detailed class performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Class analytics coming soon</p>
                <p className="text-sm mt-2">View detailed metrics about each class</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Member Analytics</CardTitle>
              <CardDescription>Detailed member engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Member analytics coming soon</p>
                <p className="text-sm mt-2">View detailed metrics about member engagement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue and financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>Revenue analytics coming soon</p>
                <p className="text-sm mt-2">View detailed financial metrics and reports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
