import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Check, 
  X, 
  AlertCircle, 
  Plus,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  FileText
} from 'lucide-react';

// Types
type UserRole = 'admin' | 'gym' | 'coach' | 'client' | 'brand';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  avatar: string;
  lastLogin?: string;
  membership?: string;
  sessions?: number;
}

// Mock data - replace with actual API calls in a real application
const mockUsers: User[] = [
  {
    id: 'USR-1001',
    name: 'John Doe',
    email: 'admin@example.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    status: 'active',
    joinDate: '2023-01-15',
    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    membership: 'Premium',
    sessions: 124
  },
  {
    id: 'USR-1002',
    name: 'Fitness Plus',
    email: 'gym@fitnessplus.com',
    phone: '+1 (555) 987-6543',
    role: 'gym',
    status: 'active',
    joinDate: '2023-02-20',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    membership: 'Gym Pro',
    sessions: 89
  },
  {
    id: 'USR-1003',
    name: 'Sarah Johnson',
    email: 'sarah.coach@example.com',
    phone: '+1 (555) 456-7890',
    role: 'coach',
    status: 'active',
    joinDate: '2023-03-10',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    membership: 'Coach Pro',
    sessions: 42
  },
  {
    id: 'USR-1004',
    name: 'Mike Williams',
    email: 'mike.client@example.com',
    phone: '+1 (555) 789-0123',
    role: 'client',
    status: 'pending',
    joinDate: '2023-04-05',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    membership: 'Basic',
    sessions: 5
  },
  {
    id: 'USR-1005',
    name: 'FitGear',
    email: 'contact@fitgear.com',
    phone: '+1 (555) 234-5678',
    role: 'brand',
    status: 'active',
    joinDate: '2023-05-10',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    avatar: 'https://randomuser.me/api/portraits/lego/2.jpg',
    membership: 'Brand Partner',
    sessions: 0
  },
];

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  // UI state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Constants
  const ITEMS_PER_PAGE = 10;

  // Filter users based on search query, status, and role
  const filteredUsers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone?.toLowerCase().includes(searchLower) ?? false) ||
        user.id.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Pagination
  const { totalPages, paginatedUsers } = useMemo(() => {
    const total = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const startIndex = Math.min(
      Math.max(0, (currentPage - 1) * ITEMS_PER_PAGE), 
      filteredUsers.length
    );
    const paginated = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    return { totalPages: total, paginatedUsers: paginated };
  }, [filteredUsers, currentPage]);

  const handleStatusFilterChange = (value: UserStatus | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle status change for a user
  const handleUserStatusChange = (userId: string, newStatus: UserStatus) => {
    // In a real app, this would be an API call
    console.log(`Updating user ${userId} status to ${newStatus}`);
    
    // Update local state for demo purposes
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    // Update the selected user in the dialog if it's the same user
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Delete a user
  const handleDeleteUser = (userId: string) => {
    // In a real app, this would be an API call
    console.log(`Deleting user ${userId}`);
    
    // Update local state for demo purposes
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    
    // If we're deleting the currently selected user, close the dialog
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
    
    // Reset to first page if we deleted the last item on the current page
    if (filteredUsers.length <= 1) {
      setCurrentPage(1);
    }
  };

  const getUserStatusBadge = (status: UserStatus) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      suspended: { label: 'Suspended', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getUserRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
      gym: { label: 'Gym', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      coach: { label: 'Coach', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      client: { label: 'Client', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      brand: { label: 'Brand', className: 'bg-pink-100 text-pink-800 hover:bg-pink-100' },
    };
    
    const config = roleConfig[role] || { label: role, className: 'bg-gray-100' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Format date with time
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time ago (e.g., '2 hours ago')
  const formatLastActive = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return formatDate(dateString);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    return formatDate(dateString);
  };

  const handleRoleFilterChange = (value: UserRole | 'all') => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    // In a real app, this would be an API call
    console.log(`Updating user ${userId} status to ${newStatus}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Approve, edit, or remove users from the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value as UserStatus | 'all';
                handleStatusFilterChange(value);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={roleFilter}
              onChange={(e) => {
                const value = e.target.value as UserRole | 'all';
                handleRoleFilterChange(value);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="gym">Gym</option>
              <option value="coach">Coach</option>
              <option value="client">Client</option>
              <option value="brand">Brand</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getUserRoleBadge(user.role)}</TableCell>
                  <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatLastActive(user.lastActive)}
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
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <X className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Detail Dialog - Implement your dialog/modal component here */}
      {isUserDetailOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-muted-foreground">{selectedUser.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsUserDetailOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 grid gap-6">
                <div className="flex items-start gap-6">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="h-24 w-24 rounded-full"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      {getUserRoleBadge(selectedUser.role)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {getUserStatusBadge(selectedUser.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Member since {formatDate(selectedUser.joinDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Account Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Active</span>
                        <span className="text-sm">{formatLastActive(selectedUser.lastActive)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email Verified</span>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">2FA Enabled</span>
                        <X className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                    <Button variant="outline">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                    {selectedUser.status === 'suspended' ? (
                      <Button>
                        <Check className="mr-2 h-4 w-4" />
                        Reactivate Account
                      </Button>
                    ) : (
                      <Button variant="destructive">
                        <X className="mr-2 h-4 w-4" />
                        Suspend Account
                      </Button>
                    )}
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
