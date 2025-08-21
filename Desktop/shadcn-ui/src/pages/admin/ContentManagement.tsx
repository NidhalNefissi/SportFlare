import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Video, Image, MoreHorizontal, Eye, Edit, Trash2, Calendar, Clock, User, Check, X, Plus } from 'lucide-react';

// Mock data - replace with actual API calls in a real application
const contentItems = [
  {
    id: 'CONT-1001',
    title: 'Beginner Yoga Flow',
    type: 'video',
    category: 'Yoga',
    status: 'published',
    author: 'Sarah Johnson',
    publishDate: '2023-06-10',
    views: 1245,
    likes: 89,
    duration: '32:45',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CONT-1002',
    title: '5 Tips for Better Sleep',
    type: 'article',
    category: 'Wellness',
    status: 'published',
    author: 'Michael Chen',
    publishDate: '2023-06-08',
    views: 876,
    likes: 124,
    readTime: '5 min',
    thumbnail: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CONT-1003',
    title: 'HIIT Workout for Beginners',
    type: 'video',
    category: 'HIIT',
    status: 'draft',
    author: 'Alex Rodriguez',
    publishDate: '2023-06-05',
    views: 0,
    likes: 0,
    duration: '28:15',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CONT-1004',
    title: 'Meal Prep Guide for Weight Loss',
    type: 'article',
    category: 'Nutrition',
    status: 'published',
    author: 'Emily Wilson',
    publishDate: '2023-06-12',
    views: 1542,
    likes: 201,
    readTime: '12 min',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CONT-1005',
    title: 'Morning Stretch Routine',
    type: 'video',
    category: 'Stretching',
    status: 'archived',
    author: 'David Kim',
    publishDate: '2023-05-28',
    views: 987,
    likes: 56,
    duration: '15:30',
    thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  }
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'yoga', name: 'Yoga' },
  { id: 'hiit', name: 'HIIT' },
  { id: 'strength', name: 'Strength Training' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'stretching', name: 'Stretching' },
];

export default function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter;
    const matchesType = contentType === 'all' || item.type === contentType;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'article':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (contentId, newStatus) => {
    // In a real app, this would be an API call
    console.log(`Updating content ${contentId} status to ${newStatus}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Manage all platform content and media</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <div className="grid gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="image">Image</option>
              </select>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.length > 0 ? (
                  filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                            {item.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
                                  <svg
                                    className="h-4 w-4 text-black"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{item.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.author}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <div>👁️ {formatNumber(item.views)} views</div>
                          <div>❤️ {formatNumber(item.likes)} likes</div>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewContent(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {item.status === 'published' ? (
                              <DropdownMenuItem>
                                <X className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Check className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No content found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Other tabs content (videos, articles, images) would go here */}
        <TabsContent value="videos" className="space-y-4">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Video content would be displayed here
          </div>
        </TabsContent>
        <TabsContent value="articles" className="space-y-4">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Article content would be displayed here
          </div>
        </TabsContent>
        <TabsContent value="images" className="space-y-4">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            Image content would be displayed here
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Detail Dialog */}
      {isDetailOpen && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedContent.title}</h2>
                  <p className="text-muted-foreground">{selectedContent.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 grid gap-6">
                <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                  <img
                    src={selectedContent.thumbnail}
                    alt={selectedContent.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedContent.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                          <svg
                            className="h-6 w-6 text-black"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">
                        This is a detailed description of the {selectedContent.title}. It provides more information about the content, its purpose, and what users can expect to learn or experience.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Type</p>
                          <p className="capitalize">{selectedContent.type}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Category</p>
                          <p>{selectedContent.category}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Status</p>
                          <p>{getStatusBadge(selectedContent.status)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Published</p>
                          <p>{formatDate(selectedContent.publishDate)}</p>
                        </div>
                        {selectedContent.duration && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Duration</p>
                            <p>{selectedContent.duration}</p>
                          </div>
                        )}
                        {selectedContent.readTime && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Read Time</p>
                            <p>{selectedContent.readTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Author</h3>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedContent.author}</p>
                          <p className="text-sm text-muted-foreground">Content Creator</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Metrics</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>Views</span>
                          </div>
                          <span className="font-medium">{formatNumber(selectedContent.views)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-muted-foreground"
                              fill="none"
                              height="24"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span>Likes</span>
                          </div>
                          <span className="font-medium">{formatNumber(selectedContent.likes)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-muted-foreground"
                              fill="none"
                              height="24"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6 6-6" />
                            </svg>
                            <span>Shares</span>
                          </div>
                          <span className="font-medium">{formatNumber(Math.floor(selectedContent.views * 0.1))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Actions</h3>
                      <div className="grid gap-2">
                        <Button variant="outline" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Content
                        </Button>
                        {selectedContent.status === 'published' ? (
                          <Button variant="outline" className="w-full">
                            <X className="mr-2 h-4 w-4" />
                            Unpublish
                          </Button>
                        ) : (
                          <Button className="w-full">
                            <Check className="mr-2 h-4 w-4" />
                            Publish Now
                          </Button>
                        )}
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Content
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
