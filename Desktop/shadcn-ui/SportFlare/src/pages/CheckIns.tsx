import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { User } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, ChevronDown, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock type for check-in data
interface CheckIn {
  id: string;
  userId: string;
  user: User;
  timestamp: Date;
  classId?: string;
  className?: string;
}

// Type for the raw check-in data from the API
interface RawCheckIn {
  id: string;
  userId: string;
  user: User;
  timestamp: string; // Date comes as string from API
  classId?: string;
  className?: string;
}

export default function CheckIns() {
  const { user } = useUser();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month', 'all'
  
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        // In a real app, this would call a gym-specific API endpoint
        // Mock data for now - would come from the API
        const response = await apiService.getGymCheckIns(user?.id || '');
        
        // Convert string dates to Date objects
        const processedData = response.map((checkIn: RawCheckIn) => ({
          ...checkIn,
          timestamp: new Date(checkIn.timestamp)
        }));
        
        setCheckIns(processedData);
        applyFilters(processedData, searchTerm, dateFilter);
      } catch (error) {
        console.error('Error fetching check-ins:', error);
        toast.error('Failed to load check-ins');
      }
    };

    if (user?.role === 'gym') {
      fetchCheckIns();
    }
  }, [user]);

  const applyFilters = (data: CheckIn[], search: string, dateFilter: string) => {
    // Filter by search term
    let filtered = data;
    if (search.trim() !== '') {
      filtered = filtered.filter(checkIn => 
        checkIn.user.name.toLowerCase().includes(search.toLowerCase()) ||
        (checkIn.className && checkIn.className.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (dateFilter === 'today') {
      filtered = filtered.filter(checkIn => checkIn.timestamp >= today);
    } else if (dateFilter === 'week') {
      filtered = filtered.filter(checkIn => checkIn.timestamp >= weekAgo);
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(checkIn => checkIn.timestamp >= monthAgo);
    }

    setFilteredCheckIns(filtered);
  };

  useEffect(() => {
    applyFilters(checkIns, searchTerm, dateFilter);
  }, [searchTerm, dateFilter, checkIns]);

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

  const handleManualCheckIn = () => {
    // Implementation for manual check-in
    toast.info('Manual check-in feature would open here');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Check-ins</h1>
          <p className="text-muted-foreground">Track member visits and class attendance</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleManualCheckIn}>
            <UserCheck className="mr-2 h-4 w-4" />
            Manual Check-in
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past 7 days</SelectItem>
              <SelectItem value="month">Past 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Check-ins</TabsTrigger>
          <TabsTrigger value="classes">Class Check-ins</TabsTrigger>
          <TabsTrigger value="general">General Access</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckIns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No check-ins found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCheckIns.map((checkIn) => (
                      <TableRow key={checkIn.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={checkIn.user.avatar} />
                            <AvatarFallback>{checkIn.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{checkIn.user.name}</span>
                        </TableCell>
                        <TableCell>
                          {checkIn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {checkIn.timestamp.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {checkIn.className ? `Class: ${checkIn.className}` : 'General Access'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                View Member Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                View Check-in History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckIns.filter(c => c.className).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No class check-ins found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCheckIns
                      .filter(checkIn => checkIn.className)
                      .map((checkIn) => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={checkIn.user.avatar} />
                              <AvatarFallback>{checkIn.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{checkIn.user.name}</span>
                          </TableCell>
                          <TableCell>{checkIn.className}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {checkIn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {checkIn.timestamp.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckIns.filter(c => !c.className).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No general access check-ins found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCheckIns
                      .filter(checkIn => !checkIn.className)
                      .map((checkIn) => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={checkIn.user.avatar} />
                              <AvatarFallback>{checkIn.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{checkIn.user.name}</span>
                          </TableCell>
                          <TableCell>
                            {checkIn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {checkIn.timestamp.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}