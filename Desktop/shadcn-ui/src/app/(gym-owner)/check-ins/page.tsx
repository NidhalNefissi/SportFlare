import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Clock, User, Calendar, Users, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Simplified mock data
const mockCheckIns = [
  {
    id: '1',
    userName: 'John Doe',
    checkInTime: new Date('2023-07-24T08:30:00'),
    checkOutTime: new Date('2023-07-24T10:00:00'),
    type: 'gym',
    status: 'checked-out',
    className: 'Morning Workout'
  },
  // Add more mock data as needed
]

export default function CheckInsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check-ins</h2>
        <p className="text-muted-foreground">View and manage member check-ins</p>
      </div>

      <Tabs defaultValue="today">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-[200px]" />
            </div>
          </div>
        </div>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Check-ins</CardTitle>
              <CardDescription>View all check-ins for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{checkIn.userName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {checkIn.checkInTime.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {checkIn.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
