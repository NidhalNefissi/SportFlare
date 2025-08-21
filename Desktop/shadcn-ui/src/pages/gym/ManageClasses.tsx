import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '@/context/UserContext';
import { ClassContext } from '@/context/ClassContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Icons
import {
  Search,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock3,
  UserCheck,
  BarChart2,
  CalendarDays,
  Filter,
} from 'lucide-react';

// Types
type ClassStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

interface GymClass {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  status: ClassStatus;
  coach: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  level: string;
}

export default function ManageClasses() {
  const { user } = useUser();
  const { classes: contextClasses, handleEditClass, handleCancelClass } = useContext(ClassContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // Transform context classes to match our GymClass type
  const myClasses: GymClass[] = contextClasses
    .filter((c: any) => c.gymId === user?.id)
    .map((cls: any) => ({
      ...cls,
      date: new Date(cls.date),
      enrolled: cls.enrolled || 0,
      status: getClassStatus(cls.date, cls.duration),
      coach: {
        id: cls.coachId || '1',
        name: cls.coachName || 'Coach Name',
      },
      category: cls.category || 'Fitness',
      level: cls.level || 'All Levels',
    }));

  // Filter classes based on tab and search term
  const filteredClasses = myClasses.filter((cls) => {
    const matchesSearch = 
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const classDate = new Date(cls.date);
    const classEndTime = new Date(classDate.getTime() + cls.duration * 60000);
    
    const isUpcoming = isAfter(classDate, now);
    const isInProgress = isBefore(classDate, now) && isAfter(classEndTime, now);
    const isCompleted = isBefore(classEndTime, now);
    
    const matchesTab = 
      (activeTab === 'upcoming' && isUpcoming) ||
      (activeTab === 'in-progress' && isInProgress) ||
      (activeTab === 'completed' && isCompleted) ||
      (activeTab === 'cancelled' && cls.status === 'cancelled');
    
    return matchesSearch && matchesTab;
  });

  // Helper function to determine class status
  function getClassStatus(date: Date | string, duration: number): ClassStatus {
    const now = new Date();
    const classDate = new Date(date);
    const classEndTime = new Date(classDate.getTime() + duration * 60000);
    
    if (isBefore(now, classDate)) return 'upcoming';
    if (isBefore(now, classEndTime)) return 'in-progress';
    return 'completed';
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: ClassStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Handle class actions
  const handleEdit = (classItem: GymClass) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (classItem: GymClass) => {
    // In a real app, this would create a duplicate of the class
    const newClass = {
      ...classItem,
      id: `new-${Date.now()}`,
      title: `${classItem.title} (Copy)`,
      date: addDays(new Date(classItem.date), 7), // One week later
    };
    // Here you would call an API to create the duplicate class
    console.log('Duplicating class:', newClass);
  };

  const handleDelete = (classId: string) => {
    setClassToDelete(classId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      handleCancelClass(classToDelete);
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  // Redirect if not gym owner
  if (user?.role !== 'gym') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Classes</h1>
          <p className="text-muted-foreground">View and manage your class schedule</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Class
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search classes..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  This Week
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="upcoming" className="py-2 text-xs sm:text-sm">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>Upcoming</span>
                  <Badge variant="secondary" className="ml-2">
                    {myClasses.filter(c => getClassStatus(c.date, c.duration) === 'upcoming').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="py-2 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>In Progress</span>
                  <Badge variant="secondary" className="ml-2">
                    {myClasses.filter(c => getClassStatus(c.date, c.duration) === 'in-progress').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="py-2 text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span>Completed</span>
                  <Badge variant="secondary" className="ml-2">
                    {myClasses.filter(c => getClassStatus(c.date, c.duration) === 'completed').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="py-2 text-xs sm:text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>Cancelled</span>
                  <Badge variant="secondary" className="ml-2">
                    {myClasses.filter(c => c.status === 'cancelled').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Class</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Coach</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="font-semibold">{classItem.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {classItem.category} • {classItem.level}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span>{format(new Date(classItem.date), 'MMM d, yyyy')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(classItem.date), 'h:mm a')} • {classItem.duration} min
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {classItem.coach.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span>{classItem.coach.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{classItem.enrolled} / {classItem.capacity}</span>
                              <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    (classItem.enrolled / classItem.capacity) > 0.8 ? 'bg-red-500' : 
                                    (classItem.enrolled / classItem.capacity) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (classItem.enrolled / classItem.capacity) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(classItem.status)}>
                              {classItem.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/gym/classes/${classItem.id}`)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  <span>View Attendees</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Class</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(classItem)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Duplicate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDelete(classItem.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No classes found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Class Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Title</label>
                <Input placeholder="Morning Yoga Flow" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" placeholder="60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input type="number" placeholder="20" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter class description..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this class? This action cannot be undone.</p>
            <p className="text-sm text-muted-foreground mt-2">
              All associated bookings and check-ins will also be removed.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}