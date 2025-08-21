import React, { useState, useContext } from 'react';
import { useUser } from '@/context/UserContext';
import { ClassContext } from '@/context/ClassContext';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isThisWeek, subDays } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Search,
  QrCode,
  UserPlus,
  MoreHorizontal,
  User,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock3,
  Users,
  CalendarDays,
  Download,
  FileText,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';

// Types
type CheckInStatus = 'checked-in' | 'late' | 'cancelled' | 'no-show';

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  classId: string;
  className: string;
  classTime: string;
  classDuration: number;
  checkInTime: string;
  status: CheckInStatus;
  membershipType: string;
  notes?: string;
}

export default function CheckIns() {
  const { user } = useUser();
  const { checkIns: contextCheckIns, handleManualCheckIn, handleQRCheckIn } = useContext(ClassContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [isManualCheckInOpen, setIsManualCheckInOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Transform check-ins data
  const checkIns: CheckIn[] = contextCheckIns
    .filter((ci: any) => ci.gymId === user?.id)
    .map((checkIn: any) => ({
      ...checkIn,
      checkInTime: checkIn.time,
      className: checkIn.classTitle || 'Unknown Class',
      status: (checkIn.status || 'checked-in') as CheckInStatus,
      membershipType: checkIn.membershipType || 'Drop-in',
      userEmail: checkIn.userEmail || `${checkIn.userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    }));

  // Filter check-ins based on tab and search term
  const filteredCheckIns = checkIns.filter((checkIn) => {
    const matchesSearch = 
      checkIn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkIn.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const checkInDate = new Date(checkIn.checkInTime);
    const isTodayCheckIn = isToday(checkInDate);
    const isThisWeekCheckIn = isThisWeek(checkInDate);
    
    const matchesTab = 
      (activeTab === 'today' && isTodayCheckIn) ||
      (activeTab === 'week' && isThisWeekCheckIn) ||
      (activeTab === 'all') ||
      (activeTab === 'late' && checkIn.status === 'late') ||
      (activeTab === 'no-shows' && checkIn.status === 'no-show');
    
    return matchesSearch && matchesTab;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: CheckInStatus) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'no-show':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Get today's stats
  const todayStats = {
    total: checkIns.filter(ci => isToday(new Date(ci.checkInTime))).length,
    checkedIn: checkIns.filter(ci => isToday(new Date(ci.checkInTime)) && ci.status === 'checked-in').length,
    late: checkIns.filter(ci => isToday(new Date(ci.checkInTime)) && ci.status === 'late').length,
    noShows: checkIns.filter(ci => isToday(new Date(ci.checkInTime)) && ci.status === 'no-show').length,
  };

  // Handle manual check-in
  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call handleManualCheckIn with form data
    handleManualCheckIn();
    setIsManualCheckInOpen(false);
  };

  // Handle QR check-in success
  const handleQRScanSuccess = (data: string) => {
    console.log('QR Code scanned:', data);
    // In a real app, this would process the QR code data
    handleQRCheckIn();
    setIsQRScannerOpen(false);
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
          <h1 className="text-2xl font-bold tracking-tight">Check-Ins</h1>
          <p className="text-muted-foreground">Manage member check-ins and attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsQRScannerOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
          <Button onClick={() => setIsManualCheckInOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Manual Check-In
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">Today's Check-Ins</CardDescription>
            <CardTitle className="text-2xl">{todayStats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {todayStats.checkedIn} on time • {todayStats.late} late
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">No-Shows</CardDescription>
            <CardTitle className="text-2xl">{todayStats.noShows}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {todayStats.noShows === 0 ? 'Perfect attendance!' : 'Follow up recommended'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">This Week</CardDescription>
            <CardTitle className="text-2xl">
              {checkIns.filter(ci => isThisWeek(new Date(ci.checkInTime))).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {Math.round((checkIns.filter(ci => isThisWeek(new Date(ci.checkInTime))).length / 7) * 10) / 10} avg. per day
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">Member Retention</CardDescription>
            <CardTitle className="text-2xl">87%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 2.5%</span> from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search check-ins..."
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
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" onValueChange={setActiveTab}>
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="today" className="py-2 text-xs sm:text-sm">
                  <Clock3 className="h-4 w-4 mr-1" />
                  <span>Today</span>
                  <Badge variant="secondary" className="ml-2">
                    {checkIns.filter(ci => isToday(new Date(ci.checkInTime))).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="week" className="py-2 text-xs sm:text-sm">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>This Week</span>
                  <Badge variant="secondary" className="ml-2">
                    {checkIns.filter(ci => isThisWeek(new Date(ci.checkInTime))).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="all" className="py-2 text-xs sm:text-sm">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>All</span>
                  <Badge variant="secondary" className="ml-2">
                    {checkIns.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="late" className="py-2 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Late</span>
                  <Badge variant="secondary" className="ml-2">
                    {checkIns.filter(ci => ci.status === 'late').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="no-shows" className="py-2 text-xs sm:text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>No-Shows</span>
                  <Badge variant="secondary" className="ml-2">
                    {checkIns.filter(ci => ci.status === 'no-show').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCheckIns.length > 0 ? (
                      filteredCheckIns.map((checkIn) => (
                        <TableRow key={checkIn.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{checkIn.userName}</div>
                                <div className="text-xs text-muted-foreground">{checkIn.userEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{checkIn.className}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(checkIn.classTime), 'h:mm a')} • {checkIn.classDuration} min
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span>{format(new Date(checkIn.checkInTime), 'h:mm a')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(checkIn.checkInTime), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(checkIn.status)}>
                              {checkIn.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {checkIn.membershipType}
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
                                <DropdownMenuItem onClick={() => navigate(`/members/${checkIn.userId}`)}>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>View Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/classes/${checkIn.classId}`)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>View Class</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Mark as No-Show</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No check-ins found.
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

      {/* Manual Check-In Dialog */}
      <Dialog open={isManualCheckInOpen} onOpenChange={setIsManualCheckInOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manual Check-In</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualCheckInSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Member</label>
                <Input placeholder="Search member by name or email..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Input placeholder="Select class..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" defaultValue={format(new Date(), 'HH:mm')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add any notes about this check-in..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsManualCheckInOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Check In
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-64 h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4">
              <div className="absolute inset-0 border-4 border-white/20 rounded-lg m-2"></div>
              <div className="text-white/50 text-sm">Camera feed will appear here</div>
              <div className="absolute bottom-4 text-white/70 text-xs">
                Point camera at member's QR code
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan a member's QR code to check them in quickly
            </p>
            <Button onClick={() => {
              // Simulate successful scan
              handleQRScanSuccess('member:12345');
            }}>
              Simulate QR Scan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}