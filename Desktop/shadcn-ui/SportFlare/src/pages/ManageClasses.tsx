import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Class } from '@/types';
import apiService from '@/services/api/apiService';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Search, 
  Edit, 
  Trash, 
  Plus, 
  Calendar, 
  Users, 
  Filter, 
  ArrowUpDown,
  Clock,
  DollarSign,
  Copy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePickerWithRange } from '@/components/DatePickerWithRange';

export default function ManageClasses() {
  const { user } = useUser();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<{id: string; name: string}[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60,
    capacity: 20,
    price: 15,
    coachId: '',
    level: 'all-levels',
    category: 'fitness'
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiService.getGymClasses(user?.id || '');
        setClasses(response);
        setFilteredClasses(response);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      }
    };

    const fetchCoaches = async () => {
      try {
        const response = await apiService.getGymCoaches(user?.id || '');
        setCoaches(response);
      } catch (error) {
        console.error('Error fetching coaches:', error);
        toast.error('Failed to load coaches');
      }
    };

    if (user?.role === 'gym') {
      fetchClasses();
      fetchCoaches();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...classes];
    
    // Apply tab filter
    const now = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(cls => new Date(cls.date) >= now);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(cls => new Date(cls.date) < now);
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(cls => 
        cls.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.coach.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredClasses(filtered);
  }, [searchTerm, classes, activeTab]);

  // Redirect if not gym owner
  if (user?.role !== 'gym') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({
      title: classItem.title,
      description: classItem.description,
      date: new Date(classItem.date).toISOString().split('.')[0],
      duration: classItem.duration,
      capacity: classItem.capacity,
      price: classItem.price,
      coachId: classItem.coach.id,
      level: classItem.level || 'all-levels',
      category: classItem.category || 'fitness'
    });
    setIsEditDialogOpen(true);
  };

  const handleDuplicateClass = (classItem: Class) => {
    setFormData({
      title: `${classItem.title} (Copy)`,
      description: classItem.description,
      date: new Date(new Date(classItem.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0], // One week later
      duration: classItem.duration,
      capacity: classItem.capacity,
      price: classItem.price,
      coachId: classItem.coach.id,
      level: classItem.level || 'all-levels',
      category: classItem.category || 'fitness'
    });
    setIsAddDialogOpen(true);
  };

  const handleDeleteClass = (classId: string) => {
    setClassToDelete(classId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    
    try {
      await apiService.deleteClass(classToDelete);
      setClasses(classes.filter(c => c.id !== classToDelete));
      toast.success('Class deleted successfully');
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddClass = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('.')[0],
      duration: 60,
      capacity: 20,
      price: 15,
      coachId: coaches.length > 0 ? coaches[0].id : '',
      level: 'all-levels',
      category: 'fitness'
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newClassData = {
        ...formData,
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
      };

      const newClass = await apiService.createClass({
        ...newClassData,
        gymId: user?.id || '',
      });
      
      setClasses([...classes, newClass]);
      setIsAddDialogOpen(false);
      toast.success('Class created successfully');
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const updatedClassData = {
        ...formData,
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
      };

      const updatedClass = await apiService.updateClass(selectedClass.id, updatedClassData);
      setClasses(classes.map(c => c.id === selectedClass.id ? updatedClass : c));
      setIsEditDialogOpen(false);
      toast.success('Class updated successfully');
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    }
  };

  const ClassForm = ({ isEdit = false, onSubmit }: { isEdit?: boolean, onSubmit: (e: React.FormEvent) => Promise<void> }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Class Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Enter class title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="15"
            max="180"
            step="5"
            value={formData.duration}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coachId">Coach</Label>
          <Select name="coachId" value={formData.coachId} onValueChange={(value) => 
            setFormData({...formData, coachId: value})
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select a coach" />
            </SelectTrigger>
            <SelectContent>
              {coaches.map(coach => (
                <SelectItem key={coach.id} value={coach.id}>
                  {coach.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" value={formData.category} onValueChange={(value) => 
            setFormData({...formData, category: value})
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="pilates">Pilates</SelectItem>
              <SelectItem value="cycling">Cycling</SelectItem>
              <SelectItem value="hiit">HIIT</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="dance">Dance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select name="level" value={formData.level} onValueChange={(value) => 
            setFormData({...formData, level: value})
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="all-levels">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleFormChange}
          placeholder="Describe what students can expect from this class"
          rows={4}
          required
        />
      </div>

      <DialogFooter>
        <Button type="submit">
          {isEdit ? 'Save Changes' : 'Create Class'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Classes</h1>
          <p className="text-muted-foreground">Organize and manage classes at your gym</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search classes..."
              className="w-full pl-8 md:w-[220px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleAddClass}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All Classes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">No upcoming classes found</p>
                <Button variant="outline" className="mt-4" onClick={handleAddClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.title}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {classItem.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {classItem.level || 'All Levels'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(classItem.date).toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(classItem.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{classItem.coach.name}</TableCell>
                      <TableCell>
                        {classItem.enrolled}/{classItem.capacity}
                        <div className="h-1 w-20 bg-muted mt-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Users className="h-4 w-4" />
                                <span className="sr-only">View Attendees</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Class Attendees</DialogTitle>
                                <DialogDescription>{classItem.title}</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Attendee functionality would be implemented here.</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClass(classItem)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Class</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDuplicateClass(classItem)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate Class</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete Class</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">No past classes found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.title}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {classItem.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(classItem.date).toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(classItem.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{classItem.coach.name}</TableCell>
                      <TableCell>
                        {Math.floor(classItem.enrolled * 0.9)}/{classItem.enrolled}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                          >
                            <Users className="h-4 w-4" />
                            <span className="sr-only">View Attendees</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDuplicateClass(classItem)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate Class</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete Class</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">No classes found</p>
                <Button variant="outline" className="mt-4" onClick={handleAddClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">
                        {classItem.title}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {classItem.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(classItem.date).toLocaleDateString()}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(classItem.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{classItem.coach.name}</TableCell>
                      <TableCell>
                        {classItem.enrolled}/{classItem.capacity}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            <Users className="h-4 w-4" />
                            <span className="sr-only">View Attendees</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClass(classItem)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Class</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDuplicateClass(classItem)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicate Class</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete Class</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Make changes to the class details below.
            </DialogDescription>
          </DialogHeader>
          <ClassForm isEdit={true} onSubmit={handleSubmitEdit} />
        </DialogContent>
      </Dialog>

      {/* Add Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Create a new class for your gym members.
            </DialogDescription>
          </DialogHeader>
          <ClassForm onSubmit={handleSubmitAdd} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClass} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}