import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Users, Filter, Star, Share2 } from 'lucide-react';
import { Class, Program } from '@/types';
import { mockClasses, mockPrograms } from '@/data/mockData';
import { ShareButton } from '@/components/ShareButton';
import Booking from './Booking';
import ProgramEnrollment from '@/components/ProgramEnrollment';
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
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGym, setFilterGym] = useState('all');
  const navigate = useNavigate();

  // Get URL parameters for preselected gym filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gymFilter = urlParams.get('gym');
    const tabParam = urlParams.get('tab');
    if (gymFilter) {
      setFilterGym(gymFilter);
    }
    if (tabParam && ['all', 'single', 'programs', 'popular'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Get unique gyms from classes and programs
  const uniqueGyms = React.useMemo(() => {
    const gyms = new Set<string>();
    mockClasses.forEach(classItem => {
      if (classItem.gym?.name) {
        gyms.add(classItem.gym.name);
      }
    });
    mockPrograms.forEach(program => {
      if (program.gym?.name) {
        gyms.add(program.gym.name);
      }
    });
    return Array.from(gyms).sort();
  }, []);

  const handleBookClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsBookingDialogOpen(true);
  };

  const handleEnrollProgram = (program: Program) => {
    setSelectedProgram(program);
    setIsEnrollmentOpen(true);
  };

  const completeBooking = () => {
    setIsBookingDialogOpen(false);
    setSelectedClass(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  // Filter classes based on search query, category, and gym
  const filteredClasses = mockClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || classItem.tags.some(tag => tag.toLowerCase() === filterCategory.toLowerCase());

    const matchesGym = filterGym === 'all' || (classItem.gym?.name === filterGym);

    return matchesSearch && matchesCategory && matchesGym;
  });

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || program.tags.some(tag => tag.toLowerCase() === filterCategory.toLowerCase());

    const matchesGym = filterGym === 'all' || (program.gym?.name === filterGym);

    return matchesSearch && matchesCategory && matchesGym;
  });

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
        <Select value={filterGym} onValueChange={setFilterGym}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Gyms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gyms</SelectItem>
            {uniqueGyms.map((gymName) => (
              <SelectItem key={gymName} value={gymName}>
                {gymName}
              </SelectItem>
            ))}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  formatDate={formatDate}
                  onClick={() => navigate(`/programs/${program.id}`)}
                  onEnroll={() => handleEnrollProgram(program)}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                formatDate={formatDate}
                onClick={() => navigate(`/programs/${program.id}`)}
                onEnroll={() => handleEnrollProgram(program)}
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
      {selectedClass && (
        <Booking
          classItem={selectedClass}
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
          onBooked={completeBooking}
        />
      )}
      
      {/* Program Enrollment Modal */}
      {selectedProgram && (
        <ProgramEnrollment
          program={selectedProgram}
          open={isEnrollmentOpen}
          onOpenChange={setIsEnrollmentOpen}
          onEnrolled={() => setIsEnrollmentOpen(false)}
        />
      )}
    </div>
  );
}

interface ClassCardProps {
  classItem: Class;
  onBook: () => void;
  formatDate: (date: Date) => string;
}

const ClassCard = ({ classItem, onBook, formatDate }: ClassCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer group" onClick={() => navigate(`/classes/${classItem.id}`)} tabIndex={0} role="button">
      <CardContent className="p-0">
        <div className="h-40 bg-muted" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium hover:underline cursor-pointer" onClick={e => { e.stopPropagation(); navigate(`/classes/${classItem.id}`); }}>{classItem.title}</span>
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
            <div className="flex items-center">
              <span>{classItem.price} TND</span>
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
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <ShareButton 
                  url={`${window.location.origin}/classes/${classItem.id}`}
                  title={`Check out ${classItem.title} on SportFlare`}
                  description={classItem.description}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  icon={<Share2 className="h-3.5 w-3.5" />}
                />
              </div>
              <span className="font-medium">{classItem.price} TND</span>
              <Button size="sm" onClick={onBook}>Book</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProgramCardProps {
  program: Program;
  formatDate: (date: Date) => string;
  onClick: () => void;
  onEnroll: () => void;
}

const ProgramCard = ({ program, formatDate, onClick, onEnroll }: ProgramCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="h-40 bg-muted" onClick={onClick} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium hover:underline cursor-pointer" onClick={onClick}>{program.title}</span>
            <Badge>{program.tags[0]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2" onClick={onClick}>{program.description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {program.tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground" onClick={onClick}>
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
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2" onClick={onClick}>
              <div className="w-6 h-6 rounded-full bg-primary" />
              <span className="text-sm">{program.coach.name}</span>
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <ShareButton 
                  url={`${window.location.origin}/programs/${program.id}`}
                  title={`Check out ${program.title} on SportFlare`}
                  description={program.description}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  icon={<Share2 className="h-3.5 w-3.5" />}
                />
              </div>
              <span className="font-medium">{program.price} TND</span>
              <Button size="sm" onClick={e => { e.stopPropagation(); onEnroll(); }}>
                Enroll in Program
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};