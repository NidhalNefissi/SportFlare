import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, X, AlertCircle, Clock, Calendar, MessageSquare, ThumbsUp, User, Image as ImageIcon, Video as VideoIcon, FileText } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data - replace with actual API calls in a real application
const pendingReviews = [
  {
    id: 1,
    type: 'post',
    title: 'My Fitness Journey',
    content: 'Sharing my 6-month transformation journey...',
    author: {
      id: 101,
      name: 'Alex Johnson',
      avatar: '',
      role: 'user'
    },
    media: [
      { type: 'image', url: '#' },
      { type: 'image', url: '#' },
    ],
    stats: {
      likes: 42,
      comments: 8
    },
    submittedAt: '2025-08-13T14:30:00Z',
    status: 'pending',
    reported: true,
    reportReason: 'Inappropriate content',
    reportedBy: 'user123',
  },
  {
    id: 2,
    type: 'comment',
    content: 'This workout routine is amazing! I\'ve been following it for a week and already see results.',
    author: {
      id: 102,
      name: 'Sarah Williams',
      avatar: '',
      role: 'user'
    },
    parentContent: 'Ultimate 30-Day Workout Challenge',
    parentType: 'article',
    submittedAt: '2025-08-14T09:15:00Z',
    status: 'pending',
    reported: false,
  },
  {
    id: 3,
    type: 'recipe',
    title: 'High-Protein Vegan Smoothie',
    content: 'A delicious and nutritious smoothie recipe...',
    author: {
      id: 103,
      name: 'Mike Chen',
      avatar: '',
      role: 'user'
    },
    media: [
      { type: 'image', url: '#' },
    ],
    ingredients: [
      '1 banana',
      '1 scoop vegan protein powder',
      '1 tbsp almond butter',
      '1 cup almond milk',
      'Handful of spinach',
    ],
    submittedAt: '2025-08-14T11:45:00Z',
    status: 'pending',
    reported: true,
    reportReason: 'Inaccurate nutritional information',
    reportedBy: 'fitnessPro22',
  },
];

const reviewHistory = [
  {
    id: 4,
    type: 'post',
    title: 'My Morning Routine',
    content: 'Here\'s what my morning looks like...',
    author: {
      id: 104,
      name: 'Emma Wilson',
      avatar: '',
      role: 'user'
    },
    media: [
      { type: 'image', url: '#' },
    ],
    stats: {
      likes: 28,
      comments: 5
    },
    submittedAt: '2025-08-10T10:20:00Z',
    reviewedAt: '2025-08-10T14:30:00Z',
    reviewedBy: 'Admin User',
    status: 'approved',
    notes: 'Content follows community guidelines.'
  },
  {
    id: 5,
    type: 'comment',
    content: 'This is spam and should be removed!',
    author: {
      id: 105,
      name: 'John Doe',
      avatar: '',
      role: 'user'
    },
    parentContent: 'How to Stay Motivated',
    parentType: 'article',
    submittedAt: '2025-08-09T16:45:00Z',
    reviewedAt: '2025-08-09T17:15:00Z',
    reviewedBy: 'Admin User',
    status: 'rejected',
    notes: 'Spam content removed.'
  },
];

export default function ContentReview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredPendingReviews = pendingReviews.filter(review => 
    (review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredReviewHistory = reviewHistory.filter(review => 
    (review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case 'post':
        return <Badge variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" /> Post</Badge>;
      case 'comment':
        return <Badge variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" /> Comment</Badge>;
      case 'recipe':
        return <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" /> Recipe</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleApprove = (id: number, notes: string = '') => {
    // In a real app, this would be an API call
    console.log(`Approved content with ID: ${id}`, { notes });
    // Refresh the data after approval
  };

  const handleReject = (id: number) => {
    setSelectedReview(pendingReviews.find(r => r.id === id));
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!selectedReview || !rejectionReason.trim()) return;
    
    // In a real app, this would be an API call
    console.log(`Rejected content with ID: ${selectedReview.id}. Reason: ${rejectionReason}`);
    
    // Reset and close dialog
    setShowRejectDialog(false);
    setRejectionReason('');
    setSelectedReview(null);
    // Refresh the data after rejection
  };

  const renderMediaPreview = (media: any[]) => {
    if (!media || media.length === 0) return null;
    
    return (
      <div className="flex gap-2 mt-2">
        {media.map((item, index) => (
          <div key={index} className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
            {item.type === 'image' ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : item.type === 'video' ? (
              <VideoIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <FileText className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContentPreview = (item: any) => {
    return (
      <div className="space-y-2">
        {item.title && <h4 className="font-medium">{item.title}</h4>}
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}
        </p>
        {item.ingredients && (
          <div className="mt-2">
            <h5 className="text-sm font-medium">Ingredients:</h5>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {item.ingredients.map((ing: string, i: number) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}
        {renderMediaPreview(item.media)}
        {item.parentContent && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">In response to: <span className="font-medium">{item.parentContent}</span> ({item.parentType})</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Review</h1>
          <p className="text-muted-foreground">Review and moderate user-generated content</p>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
              <Badge variant="outline" className="ml-2">{pendingReviews.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Review History
            </TabsTrigger>
          </TabsList>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                {filteredPendingReviews.length} item{filteredPendingReviews.length !== 1 ? 's' : ''} waiting for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPendingReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredPendingReviews.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.author.avatar} alt={item.author.name} />
                              <AvatarFallback className="bg-muted">
                                {item.author.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.author.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.author.role}
                                </Badge>
                                {getContentTypeBadge(item.type)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Submitted on {formatDate(item.submittedAt)}
                              </p>
                            </div>
                          </div>
                          
                          {item.reported && (
                            <div className="ml-auto">
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Reported
                              </Badge>
                              {item.reportReason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reason: {item.reportReason}
                                  {item.reportedBy && ` (by ${item.reportedBy})`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pl-14">
                          {renderContentPreview(item)}
                        </div>

                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {item.stats && (
                              <>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {item.stats.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {item.stats.comments}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleReject(item.id)}
                            >
                              <X className="h-4 w-4" /> Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleApprove(item.id, reviewNotes)}
                            >
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending reviews</h3>
                  <p className="text-muted-foreground mt-1">All caught up! Check back later for new content to review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
              <CardDescription>
                {reviewHistory.length} item{reviewHistory.length !== 1 ? 's' : ''} reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviewHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[200px] truncate">
                          {item.title || item.content.substring(0, 50) + '...'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.author.name}</div>
                        </TableCell>
                        <TableCell>
                          {getContentTypeBadge(item.type)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.submittedAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.reviewedBy}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredReviewHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No review history found
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
      {showRejectDialog && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Reject Content
              </CardTitle>
              <CardDescription>
                Please provide a reason for rejecting this content.
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add any additional notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
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
                  setReviewNotes('');
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
}
