import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Users, Filter, Star } from 'lucide-react';
import { Class } from '@/types';
import { mockClasses, mockPrograms } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Classes() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Filter classes based on search query and category
  const filteredClasses = mockClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          classItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          classItem.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          classItem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || classItem.tags.some(tag => tag.toLowerCase() === filterCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || program.tags.some(tag => tag.toLowerCase() === filterCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const handleBookClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsBookingDialogOpen(true);
  };

  const completeBooking = () => {
    // In a real app, this would make an API call to book the class
    setIsBookingDialogOpen(false);
    // Show success notification or message
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Classes & Programs</h1>
        <p className="text-muted-foreground">Discover and book fitness classes or join comprehensive programs.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes, coaches, or keywords..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="cardio">Cardio</SelectItem>
            <SelectItem value="strength">Strength</SelectItem>
            <SelectItem value="hiit">HIIT</SelectItem>
            <SelectItem value="cycling">Cycling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="single">Single Classes</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Featured Classes</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.slice(0, 3).map((classItem) => (
                <ClassCard 
                  key={classItem.id} 
                  classItem={classItem} 
                  onBook={() => handleBookClass(classItem)} 
                  formatDate={formatDate} 
                />
              ))}
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Featured Programs</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPrograms.map((program) => (
                <ProgramCard 
                  key={program.id} 
                  program={program} 
                />
              ))}
            </div>
          </section>
        </TabsContent>

        {/* Single Classes Tab */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((classItem) => (
              <ClassCard 
                key={classItem.id} 
                classItem={classItem} 
                onBook={() => handleBookClass(classItem)} 
                formatDate={formatDate} 
              />
            ))}
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrograms.map((program) => (
              <ProgramCard 
                key={program.id} 
                program={program} 
              />
            ))}
          </div>
        </TabsContent>

        {/* Popular Tab */}
        <TabsContent value="popular" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...filteredClasses].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3).map((classItem) => (
              <ClassCard 
                key={classItem.id} 
                classItem={classItem} 
                onBook={() => handleBookClass(classItem)} 
                formatDate={formatDate} 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Class</DialogTitle>
            <DialogDescription>
              Confirm your booking for the following class:
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">{selectedClass.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedClass.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedClass.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.enrolled} / {selectedClass.capacity} enrolled</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary" />
                    <span className="text-sm">{selectedClass.coach.name}</span>
                  </div>
                  <Badge>${selectedClass.price}</Badge>
                </div>
              </div>

              <div className="flex items-center border rounded-md p-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Spots Available</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedClass.capacity - selectedClass.enrolled} spots left
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={completeBooking}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ClassCardProps {
  classItem: Class;
  onBook: () => void;
  formatDate: (date: Date) => string;
}

const ClassCard = ({ classItem, onBook, formatDate }: ClassCardProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="h-40 bg-muted" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Link to={`/classes/${classItem.id}`} className="font-medium hover:underline">
              {classItem.title}
            </Link>
            <Badge>{classItem.tags[0]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{classItem.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(classItem.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{classItem.duration} min</span>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
            <span className="text-sm">{classItem.rating}</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary" />
              <span className="text-sm">{classItem.coach.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${classItem.price}</span>
              <Button size="sm" onClick={onBook}>Book</Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/classes/${classItem.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProgramCardProps {
  program: Program;
}

const ProgramCard = ({ program }: ProgramCardProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 h-44 md:h-auto bg-muted" />
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{program.title}</h3>
                <Badge>{program.tags[0]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {program.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{program.duration} week program</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{program.classes.length} classes included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{program.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary" />
                <span className="text-sm">{program.coach.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">${program.price}</span>
                <Button size="sm">View Program</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};