import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Clock, MessageSquare, Plus, Search, Tag, User, XCircle } from 'lucide-react';

// Mock data - replace with actual API calls in a real application
const supportTickets = [
  {
    id: 'TKT-1001',
    subject: 'Unable to access my account',
    requester: 'John Doe',
    email: 'john@example.com',
    status: 'open',
    priority: 'high',
    category: 'Account',
    lastUpdated: '2023-06-15T10:30:00',
    createdAt: '2023-06-15T09:15:00',
    messages: [
      {
        sender: 'John Doe',
        message: 'I cannot log in to my account. I keep getting an error message.',
        timestamp: '2023-06-15T09:15:00',
        isStaff: false
      },
      {
        sender: 'Support Team',
        message: 'We apologize for the inconvenience. Let me help you with that. Have you tried resetting your password?',
        timestamp: '2023-06-15T10:00:00',
        isStaff: true
      }
    ]
  },
  {
    id: 'TKT-1002',
    subject: 'Payment not processed',
    requester: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'in-progress',
    priority: 'high',
    category: 'Billing',
    lastUpdated: '2023-06-14T16:45:00',
    createdAt: '2023-06-14T14:20:00',
    messages: [
      {
        sender: 'Sarah Johnson',
        message: 'I was charged but my subscription is not active.',
        timestamp: '2023-06-14T14:20:00',
        isStaff: false
      }
    ]
  },
  {
    id: 'TKT-1003',
    subject: 'Feature request: Dark mode',
    requester: 'Mike Chen',
    email: 'mike@example.com',
    status: 'open',
    priority: 'low',
    category: 'Feature Request',
    lastUpdated: '2023-06-13T11:10:00',
    createdAt: '2023-06-13T11:10:00',
    messages: [
      {
        sender: 'Mike Chen',
        message: 'Would love to see a dark mode option in the app.',
        timestamp: '2023-06-13T11:10:00',
        isStaff: false
      }
    ]
  },
  {
    id: 'TKT-1004',
    subject: 'Bug report: App crashes on iOS',
    requester: 'Emma Wilson',
    email: 'emma@example.com',
    status: 'in-progress',
    priority: 'high',
    category: 'Bug Report',
    lastUpdated: '2023-06-12T09:30:00',
    createdAt: '2023-06-12T09:30:00',
    messages: [
      {
        sender: 'Emma Wilson',
        message: 'The app crashes when I try to open the settings screen on my iPhone.',
        timestamp: '2023-06-12T09:30:00',
        isStaff: false
      },
      {
        sender: 'Support Team',
        message: 'Thanks for reporting this. We are looking into it.',
        timestamp: '2023-06-12T10:15:00',
        isStaff: true
      }
    ]
  },
  {
    id: 'TKT-1005',
    subject: 'How to cancel subscription',
    requester: 'Alex Kim',
    email: 'alex@example.com',
    status: 'closed',
    priority: 'medium',
    category: 'Billing',
    lastUpdated: '2023-06-10T15:20:00',
    createdAt: '2023-06-10T14:00:00',
    messages: [
      {
        sender: 'Alex Kim',
        message: 'I want to cancel my subscription. How can I do that?',
        timestamp: '2023-06-10T14:00:00',
        isStaff: false
      },
      {
        sender: 'Support Team',
        message: 'You can cancel your subscription from the Account Settings page. Let me know if you need any help!',
        timestamp: '2023-06-10T15:20:00',
        isStaff: true
      },
      {
        sender: 'Alex Kim',
        message: 'Thank you, I was able to cancel it.',
        timestamp: '2023-06-10T15:30:00',
        isStaff: false
      }
    ]
  },
];

const faqs = [
  {
    id: 1,
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
    category: 'Account',
    views: 1245,
    lastUpdated: '2023-05-15'
  },
  {
    id: 2,
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers.',
    category: 'Billing',
    views: 876,
    lastUpdated: '2023-05-10'
  },
  {
    id: 3,
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your Account Settings page.',
    category: 'Billing',
    views: 1542,
    lastUpdated: '2023-06-01'
  },
  {
    id: 4,
    question: 'Is there a mobile app available?',
    answer: 'Yes, our mobile app is available for both iOS and Android devices.',
    category: 'General',
    views: 987,
    lastUpdated: '2023-04-20'
  }
];

const supportStats = {
  totalTickets: 1245,
  openTickets: 42,
  avgResponseTime: '2h 15m',
  customerSatisfaction: '94%',
  ticketsByCategory: [
    { name: 'Account', value: 35 },
    { name: 'Billing', value: 28 },
    { name: 'Technical', value: 20 },
    { name: 'Feature Request', value: 12 },
    { name: 'Other', value: 5 },
  ]
};

export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(supportTickets[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      sender: 'Support Team',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isStaff: true
    };

    // In a real app, this would be an API call to update the ticket
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
      lastUpdated: new Date().toISOString()
    });

    setNewMessage('');
  };

  const handleCreateTicket = () => {
    // In a real app, this would be an API call to create a new ticket
    alert('Ticket created successfully!');
    setIsNewTicketOpen(false);
    setNewTicket({
      subject: '',
      category: '',
      priority: 'medium',
      message: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Manage support tickets and help center content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsNewTicketOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tickets" onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tickets</CardDescription>
                <CardTitle className="text-3xl">{supportStats.totalTickets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Open Tickets</CardDescription>
                <CardTitle className="text-3xl">{supportStats.openTickets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Response Time</CardDescription>
                <CardTitle className="text-3xl">{supportStats.avgResponseTime}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Customer Satisfaction</CardDescription>
                <CardTitle className="text-3xl">{supportStats.customerSatisfaction}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>View and manage support requests</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tickets..."
                      className="pl-8 w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 h-[600px]">
                {/* Ticket List */}
                <div className="border-r overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className={`cursor-pointer hover:bg-muted/50 ${selectedTicket?.id === ticket.id ? 'bg-muted/30' : ''}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{ticket.subject}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        </TableRow>
                      ))}
                      {filteredTickets.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No tickets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Ticket Details */}
                <div className="lg:col-span-3 flex flex-col">
                  {selectedTicket ? (
                    <>
                      <div className="border-b p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{selectedTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {selectedTicket.requester} • {selectedTicket.email}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedTicket.status)}
                            {getPriorityBadge(selectedTicket.priority)}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            <span>{selectedTicket.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{selectedTicket.messages.length} messages</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedTicket.messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${msg.isStaff
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                                }`}
                            >
                              <div className="font-medium text-sm">
                                {msg.sender}
                              </div>
                              <p className="mt-1">{msg.message}</p>
                              <div className="text-xs mt-2 opacity-70">
                                {formatDate(msg.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            className="min-h-[80px]"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                          />
                          <Button onClick={handleSendMessage}>
                            Send
                          </Button>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>Press Enter to send, Shift+Enter for new line</span>
                          <Button variant="ghost" size="sm">
                            Close Ticket
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-4" />
                      <p>Select a ticket to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Manage your help center content</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      className="pl-8 w-[200px] lg:w-[300px]"
                    />
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium">{faq.question}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{faq.category}</Badge>
                      </TableCell>
                      <TableCell>{faq.views.toLocaleString()}</TableCell>
                      <TableCell>{faq.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tickets</CardDescription>
                <CardTitle className="text-3xl">{supportStats.totalTickets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Open Tickets</CardDescription>
                <CardTitle className="text-3xl">{supportStats.openTickets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Response Time</CardDescription>
                <CardTitle className="text-3xl">{supportStats.avgResponseTime}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supportStats.ticketsByCategory.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${category.value}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{category.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{ticket.requester}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.subject}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Ticket Dialog */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Ticket</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNewTicketOpen(false)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>
                Fill in the details below to create a new support ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Subject
                  </label>
                  <Input
                    placeholder="Enter a brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Category
                    </label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Priority
                    </label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Description
                  </label>
                  <Textarea
                    placeholder="Please provide as much detail as possible about your issue..."
                    className="min-h-[150px]"
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNewTicketOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.message}
              >
                Create Ticket
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
