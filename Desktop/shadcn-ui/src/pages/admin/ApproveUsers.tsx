import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, User, Clock, Calendar, Check, X, AlertCircle, CheckCircle, File as FileIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - replace with actual API calls in a real application
const pendingApprovals = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'gym_owner',
    gymName: 'Elite Fitness Center',
    submittedAt: '2025-08-12T14:30:00Z',
    status: 'pending',
    documents: [
      { name: 'Business License', url: '#' },
      { name: 'ID Verification', url: '#' },
    ],
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'personal_trainer',
    gymAffiliation: 'Elite Fitness Center',
    submittedAt: '2025-08-13T09:15:00Z',
    status: 'pending',
    certifications: ['NASM Certified Personal Trainer', 'CPR/AED Certified'],
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'gym_owner',
    gymName: 'Urban Fitness Studio',
    submittedAt: '2025-08-14T11:45:00Z',
    status: 'pending',
    documents: [
      { name: 'Business License', url: '#' },
      { name: 'Insurance Certificate', url: '#' },
      { name: 'ID Verification', url: '#' },
    ],
  },
];

const approvalHistory = [
  {
    id: 4,
    name: 'David Kim',
    email: 'david@example.com',
    role: 'gym_owner',
    gymName: 'Peak Performance',
    submittedAt: '2025-08-10T10:20:00Z',
    processedAt: '2025-08-11T14:30:00Z',
    status: 'approved',
    processedBy: 'Admin User',
  },
  {
    id: 5,
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'personal_trainer',
    gymAffiliation: 'Peak Performance',
    submittedAt: '2025-08-09T16:45:00Z',
    processedAt: '2025-08-10T11:15:00Z',
    status: 'rejected',
    reason: 'Incomplete certification documents',
    processedBy: 'Admin User',
  },
];

const ApproveUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const filteredPendingApprovals = pendingApprovals.filter(approval => 
    approval.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (approval.gymName && approval.gymName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredApprovalHistory = approvalHistory.filter(approval => 
    approval.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (approval.gymName && approval.gymName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'gym_owner':
        return <Badge variant="secondary">Gym Owner</Badge>;
      case 'personal_trainer':
        return <Badge variant="outline">Personal Trainer</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  const handleApprove = (id: number) => {
    // In a real app, this would be an API call
    console.log(`Approved user with ID: ${id}`);
    // Refresh the data after approval
  };

  const handleReject = (id: number) => {
    setSelectedApproval(pendingApprovals.find(a => a.id === id));
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!selectedApproval || !rejectionReason.trim()) return;
    
    // In a real app, this would be an API call
    console.log(`Rejected user with ID: ${selectedApproval.id}. Reason: ${rejectionReason}`);
    
    // Reset and close dialog
    setShowRejectDialog(false);
    setRejectionReason('');
    setSelectedApproval(null);
    // Refresh the data after rejection
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approve Users</h1>
          <p className="text-muted-foreground">Review and approve new user registrations</p>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
              <Badge variant="outline" className="ml-2">{pendingApprovals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Approval History
            </TabsTrigger>
          </TabsList>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                {filteredPendingApprovals.length} request{filteredPendingApprovals.length !== 1 ? 's' : ''} waiting for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {filteredPendingApprovals.map((approval) => (
                    <Card key={approval.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{approval.name}</h3>
                                {getRoleBadge(approval.role)}
                              </div>
                              <p className="text-sm text-muted-foreground">{approval.email}</p>
                              {approval.gymName && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Gym:</span> {approval.gymName}
                                </p>
                              )}
                              {approval.gymAffiliation && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Affiliation:</span> {approval.gymAffiliation}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Submitted on {formatDate(approval.submittedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleReject(approval.id)}
                            >
                              <X className="h-4 w-4" /> Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleApprove(approval.id)}
                            >
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                          </div>
                        </div>

                        {(approval.documents || approval.certifications) && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">
                              {approval.role === 'gym_owner' ? 'Submitted Documents' : 'Certifications'}
                            </h4>
                            <div className="space-y-2">
                              {approval.documents?.map((doc, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                                  <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {doc.name}
                                  </a>
                                </div>
                              ))}
                              {approval.certifications?.map((cert, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{cert}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending approvals</h3>
                  <p className="text-muted-foreground mt-1">All caught up! Check back later for new requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                {approvalHistory.length} processed request{approvalHistory.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovalHistory.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <div className="font-medium">{approval.name}</div>
                          <div className="text-sm text-muted-foreground">{approval.email}</div>
                        </TableCell>
                        <TableCell>{getRoleBadge(approval.role)}</TableCell>
                        <TableCell>
                          {approval.status === 'approved' ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(approval.submittedAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(approval.processedAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {approval.processedBy}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredApprovalHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No approval history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Reject User Request
              </CardTitle>
              <CardDescription>
                Please provide a reason for rejecting {selectedApproval?.name}'s request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Reason for Rejection <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApproveUsers;
