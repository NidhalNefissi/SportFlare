import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Calendar, Clock, Users, DollarSign, MapPin, Filter, Search } from "lucide-react"
import Link from "next/link"

type ClassStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled'

interface GymClass {
  id: string
  name: string
  type: string
  date: Date
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
  status: ClassStatus
  coach: string
  location: string
  price: number
}

// Mock data for gym classes
const mockClasses: GymClass[] = [
  {
    id: '1',
    name: 'Morning Yoga',
    type: 'Yoga',
    date: new Date('2023-07-25'),
    startTime: '08:00',
    endTime: '09:00',
    capacity: 20,
    enrolled: 18,
    status: 'upcoming',
    coach: 'Sarah Johnson',
    location: 'Yoga Studio A',
    price: 25
  },
  {
    id: '2',
    name: 'HIIT Blast',
    type: 'HIIT',
    date: new Date('2023-07-25'),
    startTime: '18:00',
    endTime: '19:00',
    capacity: 15,
    enrolled: 15,
    status: 'upcoming',
    coach: 'Mike Chen',
    location: 'Main Studio',
    price: 30
  },
  {
    id: '3',
    name: 'Power Lifting',
    type: 'Strength',
    date: new Date('2023-07-24'),
    startTime: '19:00',
    endTime: '20:00',
    capacity: 10,
    enrolled: 8,
    status: 'completed',
    coach: 'Emma Wilson',
    location: 'Weight Room',
    price: 35
  },
  {
    id: '4',
    name: 'Zumba Party',
    type: 'Dance',
    date: new Date('2023-07-26'),
    startTime: '19:30',
    endTime: '20:30',
    capacity: 25,
    enrolled: 22,
    status: 'upcoming',
    coach: 'Alex Rodriguez',
    location: 'Dance Studio',
    price: 20
  },
  {
    id: '5',
    name: 'Cycling',
    type: 'Cardio',
    date: new Date('2023-07-23'),
    startTime: '07:00',
    endTime: '07:45',
    capacity: 15,
    enrolled: 12,
    status: 'completed',
    coach: 'David Kim',
    location: 'Cycling Studio',
    price: 25
  },
]

export default function ManageClassesPage() {
  const upcomingClasses = mockClasses.filter(cls => 
    cls.status === 'upcoming' || cls.status === 'in-progress'
  )
  
  const pastClasses = mockClasses.filter(cls => 
    cls.status === 'completed' || cls.status === 'cancelled'
  )

  const getStatusBadge = (status: ClassStatus) => {
    const statusClasses = {
      'upcoming': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    
    const statusLabels = {
      'upcoming': 'Upcoming',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Classes</h2>
          <p className="text-muted-foreground">
            View and manage all your gym classes
          </p>
        </div>
        <Button asChild>
          <Link href="/gym-owner/manage-classes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Class
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="past">Past Classes</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search classes..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingClasses.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription className="mt-1">{cls.type}</CardDescription>
                    </div>
                    {getStatusBadge(cls.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.startTime} - {cls.endTime}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.enrolled} / {cls.capacity} participants
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      ${cls.price}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.location}
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastClasses.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription className="mt-1">{cls.type}</CardDescription>
                    </div>
                    {getStatusBadge(cls.status)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.startTime} - {cls.endTime}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      {cls.enrolled} / {cls.capacity} participants
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
