import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, MoreHorizontal, FileText, Image, Video, File, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - replace with actual API calls in a real application
const contentItems = [
  { 
    id: 1, 
    title: 'Getting Started Guide', 
    type: 'article', 
    status: 'published', 
    author: 'Admin', 
    lastUpdated: '2025-08-13T14:30:00Z',
    views: 1245,
    category: 'Guides'
  },
  { 
    id: 2, 
    title: 'Summer Workout Challenge', 
    type: 'program', 
    status: 'draft', 
    author: 'Fitness Coach', 
    lastUpdated: '2025-08-12T09:15:00Z',
    views: 0,
    category: 'Programs'
  },
  { 
    id: 3, 
    title: 'Yoga for Beginners', 
    type: 'video', 
    status: 'scheduled', 
    author: 'Yoga Instructor', 
    lastUpdated: '2025-08-10T16:45:00Z',
    views: 876,
    category: 'Videos',
    scheduledDate: '2025-08-20T10:00:00Z'
  },
  { 
    id: 4, 
    title: 'Nutrition 101', 
    type: 'article', 
    status: 'published', 
    author: 'Nutritionist', 
    lastUpdated: '2025-08-05T11:20:00Z',
    views: 2341,
    category: 'Articles'
  },
  { 
    id: 5, 
    title: '30-Day HIIT Challenge', 
    type: 'program', 
    status: 'archived', 
    author: 'Fitness Coach', 
    lastUpdated: '2025-07-28T13:10:00Z',
    views: 3567,
    category: 'Programs'
  },
];

export default function ContentManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesTab && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'program':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    return <Badge variant="secondary" className="text-xs">{category}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Manage all content across the platform</p>
        </div>
        <Button onClick={() => {}}>
          <Plus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="program">Programs</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Guides">Guides</option>
                <option value="Programs">Programs</option>
                <option value="Videos">Videos</option>
                <option value="Articles">Articles</option>
              </select>
            </div>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={activeTab}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.length > 0 ? (
                  filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell className="text-sm">{item.author}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm">
                        <div>{formatDate(item.lastUpdated)}</div>
                        {item.status === 'scheduled' && item.scheduledDate && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled: {new Date(item.scheduledDate).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{item.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <File className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {item.status === 'draft' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {item.status === 'published' && (
                              <DropdownMenuItem>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <File className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No content found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}