import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import apiService from '@/services/api/apiService';
import { ClassProposal, User } from '@/types';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ClassProposals() {
  const { user } = useUser();
  const [proposals, setProposals] = useState<ClassProposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ClassProposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<ClassProposal | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modificationDetails, setModificationDetails] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      try {
        let fetchedProposals: ClassProposal[] = [];

        // Fetch different proposals based on user role
        if (user?.role === 'gym') {
          fetchedProposals = await apiService.getGymClassProposals(user.id);
        } else if (user?.role === 'admin') {
          fetchedProposals = await apiService.getAllClassProposals();
        } else if (user?.role === 'coach') {
          fetchedProposals = await apiService.getCoachClassProposals(user.id);
        }

        setProposals(fetchedProposals);
        setFilteredProposals(fetchedProposals);
      } catch (error) {
        console.error('Error fetching class proposals:', error);
        toast.error('Failed to load class proposals');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProposals();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters
    let filtered = [...proposals];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        proposal =>
          proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.gym.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }
    
    setFilteredProposals(filtered);
  }, [searchTerm, statusFilter, proposals]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleApproveProposal = async () => {
    if (!selectedProposal) return;

    try {
      await apiService.updateClassProposalStatus(selectedProposal.id, 'approved');
      
      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: 'approved' } : p
      ));
      
      toast.success('Class proposal approved');
      setShowApprovalDialog(false);

      // Send notification to the coach
      await apiService.createNotification({
        userId: selectedProposal.coachId,
        title: 'Class Proposal Approved',
        message: `Your class proposal "${selectedProposal.title}" has been approved.`,
        type: 'proposal',
        relatedEntityId: selectedProposal.id,
        relatedEntityType: 'classProposal',
      });
    } catch (error) {
      console.error('Error approving class proposal:', error);
      toast.error('Failed to approve class proposal');
    }
  };

  const handleRejectProposal = async () => {
    if (!selectedProposal || !rejectionReason.trim()) return;

    try {
      await apiService.updateClassProposalStatus(selectedProposal.id, 'rejected', rejectionReason);
      
      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: 'rejected', notes: rejectionReason } : p
      ));
      
      toast.success('Class proposal rejected');
      setShowRejectionDialog(false);
      setRejectionReason('');

      // Send notification to the coach
      await apiService.createNotification({
        userId: selectedProposal.coachId,
        title: 'Class Proposal Rejected',
        message: `Your class proposal "${selectedProposal.title}" has been rejected. Reason: ${rejectionReason}`,
        type: 'proposal',
        relatedEntityId: selectedProposal.id,
        relatedEntityType: 'classProposal',
      });
    } catch (error) {
      console.error('Error rejecting class proposal:', error);
      toast.error('Failed to reject class proposal');
    }
  };

  const handleRequestModification = async () => {
    if (!selectedProposal || !modificationDetails.trim()) return;

    try {
      await apiService.updateClassProposalStatus(selectedProposal.id, 'modified', modificationDetails);
      
      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: 'modified', notes: modificationDetails } : p
      ));
      
      toast.success('Modification request sent to coach');
      setShowModificationDialog(false);
      setModificationDetails('');

      // Send notification to the coach
      await apiService.createNotification({
        userId: selectedProposal.coachId,
        title: 'Class Proposal Modification Requested',
        message: `Your class proposal "${selectedProposal.title}" needs some changes: ${modificationDetails}`,
        type: 'proposal',
        relatedEntityId: selectedProposal.id,
        relatedEntityType: 'classProposal',
      });
    } catch (error) {
      console.error('Error requesting class proposal modification:', error);
      toast.error('Failed to request modification');
    }
  };

  // Render based on user role
  if (user && !['gym', 'admin', 'coach'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access class proposals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Class Proposals</h1>
          <p className="text-muted-foreground">
            {user?.role === 'gym' && 'Review and approve class proposals for your gym'}
            {user?.role === 'admin' && 'Manage all class proposals across the platform'}
            {user?.role === 'coach' && 'Track the status of your class proposals'}
          </p>
        </div>

        {user?.role === 'coach' && (
          <Button asChild>
            <a href="/create-class">Create New Proposal</a>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search proposals..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="modified">Needs Changes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs based on user role */}
      <Tabs defaultValue={user?.role === 'coach' ? 'myProposals' : 'pending'}>
        {user?.role === 'gym' || user?.role === 'admin' ? (
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {proposals.filter(p => p.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="modified">Needs Changes</TabsTrigger>
          </TabsList>
        ) : (
          <TabsList>
            <TabsTrigger value="myProposals">My Proposals</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {proposals.filter(p => p.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        )}

        {/* Tab content for gym or admin */}
        {(user?.role === 'gym' || user?.role === 'admin') && (
          <>
            <TabsContent value="pending">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'pending')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                onApprove={(proposal) => {
                  setSelectedProposal(proposal);
                  setShowApprovalDialog(true);
                }}
                onReject={(proposal) => {
                  setSelectedProposal(proposal);
                  setShowRejectionDialog(true);
                }}
                onRequestModification={(proposal) => {
                  setSelectedProposal(proposal);
                  setShowModificationDialog(true);
                }}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="approved">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'approved')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="rejected">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'rejected')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="modified">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'modified')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
          </>
        )}

        {/* Tab content for coach */}
        {user?.role === 'coach' && (
          <>
            <TabsContent value="myProposals">
              <ProposalsTable 
                proposals={filteredProposals} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="pending">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'pending')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="approved">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'approved')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="rejected">
              <ProposalsTable 
                proposals={filteredProposals.filter(p => p.status === 'rejected')} 
                userRole={user?.role || ''}
                onSelect={setSelectedProposal}
                isLoading={isLoading}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Class Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this class proposal? This will make the class available for booking.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">{selectedProposal.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProposal.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedProposal.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProposal.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProposal.gym.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveProposal}>
              Approve Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Class Proposal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this class proposal. This feedback will be sent to the coach.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">{selectedProposal.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProposal.description}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  Rejection Reason
                </label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please explain why this class proposal is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRejectProposal} 
              variant="destructive"
              disabled={!rejectionReason.trim()}
            >
              Reject Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modification Request Dialog */}
      <Dialog open={showModificationDialog} onOpenChange={setShowModificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Request changes to this class proposal. Be specific about what needs to be modified.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">{selectedProposal.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProposal.description}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="modification-details" className="text-sm font-medium">
                  Requested Changes
                </label>
                <Textarea
                  id="modification-details"
                  placeholder="Please specify what changes are needed for this proposal..."
                  value={modificationDetails}
                  onChange={(e) => setModificationDetails(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModificationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestModification}
              disabled={!modificationDetails.trim()}
            >
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProposalsTableProps {
  proposals: ClassProposal[];
  userRole: string;
  onSelect: (proposal: ClassProposal) => void;
  onApprove?: (proposal: ClassProposal) => void;
  onReject?: (proposal: ClassProposal) => void;
  onRequestModification?: (proposal: ClassProposal) => void;
  isLoading: boolean;
}

function ProposalsTable({ 
  proposals, 
  userRole, 
  onSelect, 
  onApprove, 
  onReject, 
  onRequestModification,
  isLoading
}: ProposalsTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'modified':
        return 'warning';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <p className="text-muted-foreground">Loading proposals...</p>
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No proposals found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>{userRole === 'coach' ? 'Gym' : 'Coach'}</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">
                  {proposal.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {userRole === 'coach' 
                          ? proposal.gym.name.substring(0, 2).toUpperCase() 
                          : proposal.coach.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {userRole === 'coach' 
                        ? proposal.gym.name 
                        : proposal.coach.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(proposal.date)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {proposal.duration} min
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(proposal.status)}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {(userRole === 'gym' || userRole === 'admin') && proposal.status === 'pending' ? (
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-green-600"
                        onClick={() => onApprove && onApprove(proposal)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-amber-600"
                        onClick={() => onRequestModification && onRequestModification(proposal)}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-red-600"
                        onClick={() => onReject && onReject(proposal)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelect(proposal)}>
                          View Details
                        </DropdownMenuItem>
                        {proposal.status === 'modified' && userRole === 'coach' && (
                          <DropdownMenuItem>
                            Update Proposal
                          </DropdownMenuItem>
                        )}
                        {proposal.status === 'approved' && userRole === 'coach' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Message Gym
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}