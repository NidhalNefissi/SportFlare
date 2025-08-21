import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Users, Calendar, BarChart2, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { mockGymAnalytics, mockCheckInRecords, mockGymClasses } from "@/data/mockDataEnhanced"

export default function GymOwnerDashboard() {
  const today = new Date()
  
  // Calculate today's check-ins
  const todayCheckIns = mockCheckInRecords.filter(
    checkIn => new Date(checkIn.checkInTime).toDateString() === today.toDateString()
  ).length

  // Get upcoming classes (next 7 days)
  const upcomingClasses = mockGymClasses
    .filter(gymClass => {
      const classDate = new Date(gymClass.date)
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)
      return classDate >= today && classDate <= nextWeek
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Get recent check-ins
  const recentCheckIns = mockCheckInRecords
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
    .slice(0, 5)

  // Calculate member growth (mock data)
  const memberGrowth = 12.5 // %
  const revenueGrowth = 8.3 // %
  const avgClassAttendance = 78 // %
  const peakHours = '5-7 PM'
  
  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Gym Owner!</h2>
          <p className="text-muted-foreground">Here's what's happening with your gym today.</p>
        </div>
        <Button asChild>
          <Link href="/gym-owner/check-ins">View All Check-ins</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCheckIns}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGymAnalytics.activeMembers}</div>
            <p className="text-xs text-muted-foreground">+5 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockGymAnalytics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{mockGymAnalytics.revenueChange}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingClasses.length}</div>
            <p className="text-xs text-muted-foreground">Today's schedule</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Check-ins */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{checkIn.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(checkIn.checkInTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {checkIn.type === 'class' ? checkIn.className : 'Gym Access'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {cls.time}
                    </div>
                  </div>
                  <div className={`text-sm ${
                    cls.spotsLeft > 3 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {cls.spotsLeft > 0 ? 
                      `${cls.spotsLeft} spots left` : 
                      'Fully booked'}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Schedule a Class</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new class to your schedule
            </p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/gym-owner/manage-classes/new">Create Class</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Member Check-in</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manually check in a member
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Check-in Member
            </Button>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">View Alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check for any important notifications
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              View Alerts (3)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
