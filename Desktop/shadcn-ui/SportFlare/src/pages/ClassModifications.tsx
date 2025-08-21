import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import apiService from '@/services/api/apiService';
import { ClassModification, Class } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Edit, 
  AlertCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

export default function ClassModifications() {
  const { user } = useUser();
  const [modifications, setModifications] = useState<ClassModification[]>([]);
  const [selectedModification, setSelectedModification] = useState<ClassModification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    const fetchModifications = async () => {
      setIsLoading(true);
      try {
        let fetchedModifications: ClassModification[] = [];
        
        // Fetch based on user role
        if (user?.role === 'gym') {
          // Get modifications for classes hosted at this gym
          fetchedModifications = await apiService.getGymClassModifications(user.id);
        } else if (user?.role === 'coach') {
          // Get modifications for classes created by this coach
          fetchedModifications = await apiService.getCoachClassModifications(user.id);
        } else if (user?.role === 'admin') {
          // Admins can see all modifications
          fetchedModifications = await apiService.getAllClassModifications();
        }
        
        setModifications(fetchedModifications);
      } catch (error) {
        console.error('Error fetching class modifications:', error);
        toast.error('Failed to load modification requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchModifications();
    }
  }, [user]);

  const handleApproveModification = async () => {
    if (!selectedModification) return;
    
    try {
      await apiService.updateClassModificationStatus(
        selectedModification.id, 
        'approved',
        responseNote
      );
      
      // Update local state
      setModifications(mods => 
        mods.map(mod => 
          mod.id === selectedModification.id 
            ? { ...mod, status: 'approved', responseNote, resolvedAt: new Date() } 
            : mod
        )
      );
      
      toast.success('Modification request approved');
      setShowApproveDialog(false);
      setResponseNote('');
      
      // Send notification to the requester
      await apiService.createNotification({
        userId: selectedModification.requesterId,
        title: 'Class Modification Approved',
        message: `Your requested changes to "${selectedModification.originalData.title}" have been approved.`,
        type: 'class',
        relatedEntityId: selectedModification.classId,
        relatedEntityType: 'class',
      });
    } catch (error) {
      console.error('Error approving modification:', error);
      toast.error('Failed to approve modification');
    }
  };

  const handleRejectModification = async () => {
    if (!selectedModification || !responseNote.trim()) return;
    
    try {
      await apiService.updateClassModificationStatus(
        selectedModification.id, 
        'rejected',
        responseNote
      );
      
      // Update local state
      setModifications(mods => 
        mods.map(mod => 
          mod.id === selectedModification.id 
            ? { ...mod, status: 'rejected', responseNote, resolvedAt: new Date() } 
            : mod
        )
      );
      
      toast.success('Modification request rejected');
      setShowRejectDialog(false);
      setResponseNote('');
      
      // Send notification to the requester
      await apiService.createNotification({
        userId: selectedModification.requesterId,
        title: 'Class Modification Rejected',
        message: `Your requested changes to "${selectedModification.originalData.title}" were not approved. Reason: ${responseNote}`,
        type: 'class',
        relatedEntityId: selectedModification.classId,
        relatedEntityType: 'class',
      });
    } catch (error) {
      console.error('Error rejecting modification:', error);
      toast.error('Failed to reject modification');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Render based on user role
  if (user && !['gym', 'admin', 'coach'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access class modification requests.
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
          <h1 className="text-3xl font-bold">Class Modifications</h1>
          <p className="text-muted-foreground">
            {user?.role === 'coach' && 'Review requested changes to your classes'}
            {user?.role === 'gym' && 'Review proposed changes to classes at your facility'}
            {user?.role === 'admin' && 'Manage all class modification requests across the platform'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {modifications.filter(m => m.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ModificationsTable
            modifications={modifications.filter(m => m.status === 'pending')}
            userRole={user?.role || ''}
            isLoading={isLoading}
            onSelect={setSelectedModification}
            onApprove={(mod) => {
              setSelectedModification(mod);
              setShowApproveDialog(true);
            }}
            onReject={(mod) => {
              setSelectedModification(mod);
              setShowRejectDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ModificationsTable
            modifications={modifications.filter(m => m.status === 'approved')}
            userRole={user?.role || ''}
            isLoading={isLoading}
            onSelect={setSelectedModification}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ModificationsTable
            modifications={modifications.filter(m => m.status === 'rejected')}
            userRole={user?.role || ''}
            isLoading={isLoading}
            onSelect={setSelectedModification}
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Modification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve these changes? The class details will be updated accordingly.
            </DialogDescription>
          </DialogHeader>
          
          {selectedModification && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Class: {selectedModification.originalData.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">Changes requested:</p>
                <CompareChanges
                  original={selectedModification.originalData}
                  proposed={selectedModification.proposedChanges}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Add a response (optional)</label>
                <Textarea
                  placeholder="Add any comments or notes about this approval..."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveModification}>
              Approve Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Modification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting these changes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedModification && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Class: {selectedModification.originalData.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">Changes requested:</p>
                <CompareChanges
                  original={selectedModification.originalData}
                  proposed={selectedModification.proposedChanges}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for rejection <span className="text-red-500">*</span></label>
                <Textarea
                  placeholder="Explain why these changes cannot be approved..."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectModification}
              disabled={!responseNote.trim()}
            >
              Reject Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ModificationsTableProps {
  modifications: ClassModification[];
  userRole: string;
  isLoading: boolean;
  onSelect: (modification: ClassModification) => void;
  onApprove?: (modification: ClassModification) => void;
  onReject?: (modification: ClassModification) => void;
}

function ModificationsTable({ 
  modifications, 
  userRole, 
  isLoading, 
  onSelect, 
  onApprove, 
  onReject 
}: ModificationsTableProps) {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <p className="text-muted-foreground">Loading modification requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (modifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No modification requests found</p>
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
              <TableHead>Class</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifications.map((modification) => (
              <TableRow key={modification.id}>
                <TableCell className="font-medium">
                  {modification.originalData.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {modification.requester.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{modification.requester.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(modification.createdAt)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(modification.status)}
                </TableCell>
                <TableCell className="text-right">
                  {modification.status === 'pending' && (onApprove || onReject) ? (
                    <div className="flex justify-end space-x-2">
                      {onApprove && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-green-600"
                          onClick={() => onApprove(modification)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {onReject && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 text-red-600"
                          onClick={() => onReject(modification)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelect(modification)}
                    >
                      View Details
                    </Button>
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

interface CompareChangesProps {
  original: Partial<Class>;
  proposed: Partial<Class>;
}

function CompareChanges({ original, proposed }: CompareChangesProps) {
  const changedFields = Object.keys(proposed).filter(key => {
    // Skip id field
    if (key === 'id') return false;
    
    // Handle date objects
    if (key === 'date' || key === 'endDate' || key === 'recurrenceEndDate') {
      const origDate = original[key as keyof typeof original] as Date | undefined;
      const propDate = proposed[key as keyof typeof proposed] as Date | undefined;
      
      if (!origDate && !propDate) return false;
      if (!origDate || !propDate) return true;
      
      return new Date(origDate).getTime() !== new Date(propDate).getTime();
    }
    
    // Handle all other fields
    return proposed[key as keyof typeof proposed] !== original[key as keyof typeof original];
  });
  
  const formatField = (key: string, value: unknown): string => {
    if (!value) return 'Not set';
    
    if (key === 'date' || key === 'endDate' || key === 'recurrenceEndDate') {
      return new Date(value).toLocaleDateString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value.toString();
  };

  const getFieldName = (key: string): string => {
    const fieldNames: Record<string, string> = {
      title: 'Class Title',
      description: 'Description',
      date: 'Date',
      endDate: 'End Date',
      duration: 'Duration (mins)',
      capacity: 'Capacity',
      price: 'Price',
      tags: 'Tags',
      recurring: 'Recurring',
      recurrencePattern: 'Recurrence Pattern',
      recurrenceEndDate: 'Recurrence End Date',
    };
    
    return fieldNames[key] || key;
  };

  return (
    <div className="mt-3 space-y-3 text-sm">
      {changedFields.length === 0 ? (
        <p className="text-muted-foreground">No changes requested</p>
      ) : (
        changedFields.map((key) => (
          <div key={key} className="grid grid-cols-2 gap-2 border-b pb-2">
            <div>
              <p className="font-medium">{getFieldName(key)}</p>
              <p className="text-muted-foreground line-through">
                {formatField(key, original[key as keyof typeof original])}
              </p>
            </div>
            <div>
              <p className="font-medium">New Value</p>
              <p className="text-green-600">
                {formatField(key, proposed[key as keyof typeof proposed])}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}