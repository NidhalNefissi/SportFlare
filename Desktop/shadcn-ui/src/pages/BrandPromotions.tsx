import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tag, Search, Filter, Plus, Calendar as CalendarIcon, Tag as TagIcon, Percent, ShoppingBag, Ticket, Award, Clock, Users, Package, Check, X } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';

// Mock data for brand promotions
const mockPromotions = [
  {
    id: 1,
    title: 'Summer Collection Launch',
    description: '20% off all new summer collection items',
    code: 'SUMMER20',
    type: 'product_discount',
    discount: 20,
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    status: 'active',
    usage: {
      total: 1000,
      used: 342,
      remaining: 658
    },
    minPurchase: 0,
    products: ['All Summer Collection'],
    customerSegment: 'all',
    image: '/placeholder-promo-1.jpg'
  },
  {
    id: 2,
    title: 'Loyalty Member Exclusive',
    description: '30% off for Gold members only',
    code: 'GOLD30',
    type: 'member_discount',
    discount: 30,
    startDate: '2023-05-15',
    endDate: '2023-12-31',
    status: 'active',
    usage: {
      total: 500,
      used: 189,
      remaining: 311
    },
    minPurchase: 50,
    products: ['All Products'],
    customerSegment: 'gold_members',
    image: '/placeholder-promo-2.jpg'
  },
  {
    id: 3,
    title: 'Bundle & Save',
    description: 'Buy 2 items, get 1 free (lowest priced item)',
    code: 'BUNDLE3',
    type: 'bundle',
    discount: 33,
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    status: 'scheduled',
    usage: {
      total: 200,
      used: 0,
      remaining: 200
    },
    minPurchase: 0,
    products: ['Select Items'],
    customerSegment: 'all',
    image: '/placeholder-promo-3.jpg'
  },
  {
    id: 4,
    title: 'Free Shipping Weekend',
    description: 'Free shipping on all orders this weekend',
    code: 'FREESHIP',
    type: 'shipping',
    discount: 100,
    startDate: '2023-05-20',
    endDate: '2023-05-21',
    status: 'expired',
    usage: {
      total: 300,
      used: 298,
      remaining: 2
    },
    minPurchase: 0,
    products: ['All Products'],
    customerSegment: 'all',
    image: '/placeholder-promo-4.jpg'
  },
  {
    id: 5,
    title: 'New Customer Welcome',
    description: '15% off first purchase for new customers',
    code: 'WELCOME15',
    type: 'first_purchase',
    discount: 15,
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    status: 'active',
    usage: {
      total: 1000,
      used: 423,
      remaining: 577
    },
    minPurchase: 0,
    products: ['All Products'],
    customerSegment: 'new_customers',
    image: '/placeholder-promo-5.jpg'
  }
];

// Types
interface Promotion {
  id: number;
  title: string;
  description: string;
  code: string;
  type: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
  usage: {
    total: number;
    used: number;
    remaining: number;
  };
  minPurchase: number;
  products: string[];
  customerSegment: string;
  image: string;
  active?: boolean;
}

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onEdit, onToggle, onDelete }) => {
  const isActive = (promotion.status === 'active' || promotion.active === true) && 
    (!promotion.endDate || new Date(promotion.endDate) >= new Date());
  const isScheduled = (promotion.status === 'scheduled' || 
    (promotion.startDate && new Date(promotion.startDate) > new Date())) && 
    !isActive;
  const isExpired = promotion.status === 'expired' || 
    (promotion.endDate && new Date(promotion.endDate) < new Date() && !isActive) ||
    promotion.active === false;
  
  const usagePercentage = promotion.usage && promotion.usage.total > 0 
    ? (Number(promotion.usage.used) / Number(promotion.usage.total)) * 100 
    : 0;
  const endDate = promotion.endDate ? new Date(promotion.endDate) : new Date();
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  const getPromotionIcon = (type) => {
    switch(type) {
      case 'product_discount':
        return <TagIcon className="h-4 w-4" />;
      case 'member_discount':
        return <Award className="h-4 w-4" />;
      case 'bundle':
        return <Package className="h-4 w-4" />;
      case 'shipping':
        return <ShoppingBag className="h-4 w-4" />;
      case 'first_purchase':
        return <Users className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };
  
  const getPromotionTypeLabel = (type) => {
    switch(type) {
      case 'product_discount':
        return 'Product Discount';
      case 'member_discount':
        return 'Member Exclusive';
      case 'bundle':
        return 'Bundle Deal';
      case 'shipping':
        return 'Free Shipping';
      case 'first_purchase':
        return 'New Customer';
      default:
        return 'Special Offer';
    }
  };
  
  const getCustomerSegmentLabel = (segment) => {
    switch(segment) {
      case 'all':
        return 'All Customers';
      case 'new_customers':
        return 'New Customers';
      case 'returning_customers':
        return 'Returning Customers';
      case 'gold_members':
        return 'Gold Members';
      case 'platinum_members':
        return 'Platinum Members';
      default:
        return segment.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
          {getPromotionIcon(promotion.type)}
        </div>
        <div className="absolute top-2 right-2">
          <Badge 
            variant={isActive ? 'default' : isScheduled ? 'secondary' : 'outline'}
            className={isExpired ? 'bg-muted text-muted-foreground' : ''}
          >
            {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{promotion.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{promotion.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isActive} 
              onCheckedChange={() => onToggle(promotion.id, !isActive)}
              disabled={isExpired}
            />
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              <span>{format(new Date(promotion.startDate), 'MMM d')} - {format(new Date(promotion.endDate), 'MMM d, yyyy')}</span>
            </div>
            <Badge variant="secondary" className="text-xs font-normal">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <TagIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <code className="px-1.5 py-0.5 bg-muted rounded-md text-xs font-mono">{promotion.code}</code>
            </div>
            <Badge variant="outline" className="text-xs">
              {promotion.type === 'shipping' 
                ? 'Free Shipping' 
                : promotion.type === 'bundle'
                  ? 'Bundle Deal'
                  : `${promotion.discount}% OFF`}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{getCustomerSegmentLabel(promotion.customerSegment)}</span>
          </div>
          
          {promotion.minPurchase > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <ShoppingBag className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>Min. purchase: ${promotion.minPurchase}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Usage: {promotion.usage.used} of {promotion.usage.total} ({Math.round(usagePercentage)}%)</span>
            <span>{promotion.usage.remaining} remaining</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t px-4 py-2 bg-muted/20">
        <div className="flex items-center text-xs text-muted-foreground">
          {isActive && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
              Active
            </span>
          )}
          {isScheduled && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
              Starts {format(new Date(promotion.startDate), 'MMM d')}
            </span>
          )}
          {isExpired && (
            <span className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-gray-400 mr-1.5"></span>
              Ended {format(new Date(promotion.endDate), 'MMM d')}
            </span>
          )}
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => onEdit(promotion)}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-destructive hover:text-destructive text-xs"
            onClick={() => onDelete(promotion.id)}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function BrandPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  
  // Form state with all necessary fields
  const [form, setForm] = useState<Omit<Promotion, 'id' | 'status' | 'image'>>({
    title: '',
    description: '',
    code: '',
    type: 'product_discount',
    discount: 10,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    usage: {
      total: 100,
      used: 0,
      remaining: 100
    },
    minPurchase: 0,
    products: [],
    customerSegment: 'all',
    active: true
  });

  // Reset form to default values
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      code: '',
      type: 'product_discount',
      discount: 10,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      usage: {
        total: 100,
        used: 0,
        remaining: 100
      },
      minPurchase: 0,
      products: [],
      customerSegment: 'all',
      active: true
    });
  };

  // Handle adding a new promotion
  const handleAddPromotion = () => {
    setEditPromotion(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle editing an existing promotion
  const handleEditPromotion = (promotion: Promotion) => {
    setEditPromotion(promotion);
    setForm({
      ...promotion,
      // Ensure dates are in the correct format for the date input
      startDate: format(new Date(promotion.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(promotion.endDate), 'yyyy-MM-dd')
    });
    setIsDialogOpen(true);
  };

  // Handle saving a promotion (both new and edit)
  const handleSave = () => {
    const promotionData: Promotion = {
      ...form,
      id: editPromotion ? editPromotion.id : Math.max(0, ...promotions.map(p => p.id)) + 1,
      // Convert dates to proper format
      startDate: format(new Date(form.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(form.endDate), 'yyyy-MM-dd'),
      // Set status based on dates and active state
      status: !form.active ? 'expired' : 
        isAfter(new Date(), new Date(form.endDate)) ? 'expired' : 
        isBefore(new Date(), new Date(form.startDate)) ? 'scheduled' : 'active',
      // Ensure usage is calculated correctly
      usage: {
        ...form.usage,
        remaining: form.usage.total - form.usage.used
      },
      // Add image placeholder if not present
      image: editPromotion?.image || '/placeholder-promo.jpg'
    };

    if (editPromotion) {
      // Update existing promotion
      setPromotions(promotions.map(p => 
        p.id === editPromotion.id ? promotionData : p
      ));
    } else {
      // Add new promotion
      setPromotions([...promotions, promotionData]);
    }
    setIsDialogOpen(false);
  };

  // Handle deleting a promotion
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  // Toggle promotion active status
  const toggleActive = (id: number, active: boolean) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { 
        ...p, 
        active,
        status: active ? 'active' : 'expired' 
      } : p
    ));
  };

  // Generate a random promo code
  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  // Filter promotions based on search and filters
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promotion => {
      // Search filter
      const matchesSearch = 
        promotion.title.toLowerCase().includes(search.toLowerCase()) ||
        promotion.description.toLowerCase().includes(search.toLowerCase()) ||
        promotion.code.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && promotion.status === 'active' && promotion.active !== false) ||
        (statusFilter === 'scheduled' && promotion.status === 'scheduled') ||
        (statusFilter === 'expired' && (promotion.status === 'expired' || promotion.active === false));
      
      // Type filter
      const matchesType = 
        typeFilter === 'all' || 
        promotion.type === typeFilter;
      
      // Customer segment filter
      const matchesSegment = 
        segmentFilter === 'all' || 
        promotion.customerSegment === segmentFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesSegment;
    });
  }, [promotions, search, statusFilter, typeFilter, segmentFilter]);

  // Get unique values for filters
  const promotionTypes = useMemo(() => {
    const types = new Set<string>();
    mockPromotions.forEach(p => types.add(p.type));
    return Array.from(types);
  }, []);

  const customerSegments = useMemo(() => {
    const segments = new Set<string>();
    mockPromotions.forEach(p => segments.add(p.customerSegment));
    return Array.from(segments);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage your brand's promotions and special offers
          </p>
        </div>
        <Button onClick={handleAddPromotion} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Promotion
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search promotions by title, description, or code..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">Status</Label>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type-filter" className="text-xs font-medium text-muted-foreground">Type</Label>
            <Select 
              value={typeFilter} 
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product_discount">Product Discount</SelectItem>
                <SelectItem value="member_discount">Member Exclusive</SelectItem>
                <SelectItem value="bundle">Bundle Deal</SelectItem>
                <SelectItem value="shipping">Free Shipping</SelectItem>
                <SelectItem value="first_purchase">New Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="segment-filter" className="text-xs font-medium text-muted-foreground">Customer Segment</Label>
            <Select 
              value={segmentFilter} 
              onValueChange={setSegmentFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="new_customers">New Customers</SelectItem>
                <SelectItem value="returning_customers">Returning Customers</SelectItem>
                <SelectItem value="gold_members">Gold Members</SelectItem>
                <SelectItem value="platinum_members">Platinum Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTypeFilter('all');
                setSegmentFilter('all');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      {filteredPromotions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion) => (
            <PromotionCard 
              key={promotion.id}
              promotion={promotion}
              onEdit={handleEditPromotion}
              onToggle={toggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No promotions found</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            {search || statusFilter !== 'all' || typeFilter !== 'all' || segmentFilter !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating a new promotion.'}
          </p>
          <Button onClick={handleAddPromotion}>
            <Plus className="mr-2 h-4 w-4" /> Create Promotion
          </Button>
        </div>
      )}

      {/* Create/Edit Promotion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
            <DialogDescription>
              {editPromotion 
                ? 'Update the promotion details below.' 
                : 'Fill in the details to create a new promotion.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Promotion Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Sale, Member Exclusive"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER20"
                    className="font-mono"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generatePromoCode}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter a detailed description of the promotion"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Promotion Type *</Label>
                <Select 
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_discount">Product Discount</SelectItem>
                    <SelectItem value="member_discount">Member Exclusive</SelectItem>
                    <SelectItem value="bundle">Bundle Deal</SelectItem>
                    <SelectItem value="shipping">Free Shipping</SelectItem>
                    <SelectItem value="first_purchase">New Customer Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {form.type !== 'shipping' && form.type !== 'bundle' && (
                <div className="space-y-2">
                  <Label htmlFor="discount">
                    {form.type === 'product_discount' || form.type === 'member_discount' || form.type === 'first_purchase'
                      ? 'Discount Percentage *'
                      : 'Discount Amount *'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max={form.type === 'shipping' ? '100' : '100'}
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {form.type === 'shipping' ? '$' : '%'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  min={form.startDate || format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usage-total">Total Usage Limit *</Label>
                <Input
                  id="usage-total"
                  type="number"
                  min="1"
                  value={form.usage.total}
                  onChange={(e) => setForm({ 
                    ...form, 
                    usage: { 
                      ...form.usage, 
                      total: Number(e.target.value),
                      remaining: Number(e.target.value) - form.usage.used
                    } 
                  })}
                  placeholder="Maximum number of redemptions"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minPurchase}
                  onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                  placeholder="0 for no minimum"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerSegment">Customer Segment *</Label>
                <Select 
                  value={form.customerSegment}
                  onValueChange={(value) => setForm({ ...form, customerSegment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="new_customers">New Customers</SelectItem>
                    <SelectItem value="returning_customers">Returning Customers</SelectItem>
                    <SelectItem value="gold_members">Gold Members</SelectItem>
                    <SelectItem value="platinum_members">Platinum Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                  />
                  <Label htmlFor="active">
                    {form.active ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSave}
              disabled={!form.title || !form.code || !form.description || !form.startDate || !form.endDate}
            >
              {editPromotion ? 'Save Changes' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}