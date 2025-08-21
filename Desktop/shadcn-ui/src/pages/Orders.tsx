import { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Search, ArrowUpDown, Truck, CheckCircle, XCircle, Clock, Package, User, Mail, MapPin, Calendar, CreditCard, ChevronDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderProduct {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  sku?: string;
}

interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface OrderPayment {
  method: string;
  transactionId: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  amount: number;
  date: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  email: string;
  products: OrderProduct[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  payment: OrderPayment;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: '#1001',
    date: '2024-06-15T10:30:00Z',
    customer: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    products: [
      { id: 'PROD-001', name: 'Premium Yoga Mat', qty: 1, price: 59.99, sku: 'YM-1001' },
      { id: 'PROD-002', name: 'Resistance Bands Set', qty: 2, price: 29.99, sku: 'RB-2001' },
    ],
    subtotal: 119.97,
    shipping: 9.99,
    tax: 12.50,
    discount: 10.00,
    total: 132.46,
    status: 'processing',
    shippingAddress: {
      name: 'Alice Johnson',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
      phone: '(555) 123-4567'
    },
    payment: {
      method: 'Credit Card',
      transactionId: 'TXN-78901234',
      status: 'paid',
      amount: 132.46,
      date: '2024-06-15T10:30:00Z'
    },
    trackingNumber: '1Z999AA1234567890',
    carrier: 'UPS',
    notes: 'Customer requested gift wrapping.'
  },
  {
    id: 'ORD-002',
    orderNumber: '#1002',
    date: '2024-06-16T14:22:00Z',
    customer: 'Robert Chen',
    email: 'robert.chen@example.com',
    products: [
      { id: 'PROD-003', name: 'Smart Water Bottle', qty: 1, price: 34.99, sku: 'WB-3001' },
      { id: 'PROD-004', name: 'Fitness Tracker', qty: 1, price: 89.99, sku: 'FT-4001' },
    ],
    subtotal: 124.98,
    shipping: 0.00,
    tax: 12.50,
    discount: 0.00,
    total: 137.48,
    status: 'shipped',
    shippingAddress: {
      name: 'Robert Chen',
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
      phone: '(555) 987-6543'
    },
    payment: {
      method: 'PayPal',
      transactionId: 'PP-56789012',
      status: 'paid',
      amount: 137.48,
      date: '2024-06-16T14:22:00Z'
    },
    trackingNumber: '1Z999BB1234567890',
    carrier: 'FedEx'
  },
  {
    id: 'ORD-003',
    orderNumber: '#1003',
    date: '2024-06-17T09:15:00Z',
    customer: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    products: [
      { id: 'PROD-005', name: 'Wireless Earbuds', qty: 1, price: 79.99, sku: 'WE-5001' },
    ],
    subtotal: 79.99,
    shipping: 4.99,
    tax: 6.80,
    discount: 0.00,
    total: 91.78,
    status: 'delivered',
    shippingAddress: {
      name: 'Maria Garcia',
      street: '789 Pine Street',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'United States',
      phone: '(555) 456-7890'
    },
    payment: {
      method: 'Credit Card',
      transactionId: 'TXN-34567890',
      status: 'paid',
      amount: 91.78,
      date: '2024-06-17T09:15:00Z'
    }
  },
  {
    id: 'ORD-004',
    orderNumber: '#1004',
    date: '2024-06-18T16:45:00Z',
    customer: 'David Kim',
    email: 'david.kim@example.com',
    products: [
      { id: 'PROD-006', name: 'Adjustable Dumbbell Set', qty: 1, price: 199.99, sku: 'AD-6001' },
      { id: 'PROD-007', name: 'Yoga Block (2-Pack)', qty: 1, price: 24.99, sku: 'YB-7001' },
    ],
    subtotal: 224.98,
    shipping: 19.99,
    tax: 18.75,
    discount: 20.00,
    total: 243.72,
    status: 'pending',
    shippingAddress: {
      name: 'David Kim',
      street: '321 Elm Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'United States',
      phone: '(555) 234-5678'
    },
    payment: {
      method: 'Credit Card',
      transactionId: 'TXN-90123456',
      status: 'pending',
      amount: 243.72,
      date: '2024-06-18T16:45:00Z'
    }
  }
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'total_high', label: 'Total: High to Low' },
  { value: 'total_low', label: 'Total: Low to High' },
];

// Helper function to get status badge
const getStatusBadge = (status: OrderStatus) => {
  const statusMap = {
    pending: { label: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Processing', variant: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Shipped', variant: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Delivered', variant: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', variant: 'bg-red-100 text-red-800' },
    returned: { label: 'Returned', variant: 'bg-purple-100 text-purple-800' },
  };

  const statusInfo = statusMap[status] || { label: 'Unknown', variant: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.variant}`}>
      {statusInfo.label}
    </span>
  );
};

export default function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // New order form state
  const [newOrder, setNewOrder] = useState({
    customer: '',
    email: '',
    products: [] as Array<{ id: string; name: string; price: number; qty: number }>,
    status: 'pending' as OrderStatus,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'Tunisia',
    },
    payment: {
      method: 'credit_card',
      status: 'pending' as 'pending' | 'paid',
    },
    notes: '',
  });
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQty, setProductQty] = useState(1);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(searchLower) ||
        o.customer.toLowerCase().includes(searchLower) ||
        o.email.toLowerCase().includes(searchLower) ||
        o.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'total_high':
          return b.total - a.total;
        case 'total_low':
          return a.total - b.total;
        default:
          return 0;
      }
    });
    
    return result;
  }, [orders, search, statusFilter, sortOption]);

  // Handle status update
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: 'Order updated',
      description: `Order status updated to ${newStatus}.`,
    });
  };

  // Handle order details view
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

    const openOrderDialog = (order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };
    const handleStatusChange = (status) => {
        setOrders(orders.map(o =>
            o.id === selectedOrder.id ? { ...o, status } : o
        ));
        setSelectedOrder({ ...selectedOrder, status });
    };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Mock products for order creation
  const products = [
    { id: 'prod_001', name: 'Premium Yoga Mat', price: 59.99, sku: 'YM-1001' },
    { id: 'prod_002', name: 'Adjustable Dumbbell Set', price: 199.99, sku: 'DB-2001' },
    { id: 'prod_003', name: 'Resistance Bands Set', price: 29.99, sku: 'RB-3001' },
  ];
  
  // Add product to new order
  const addProductToOrder = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    setNewOrder(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: productQty
        }
      ]
    }));
    
    // Reset form
    setSelectedProduct('');
    setProductQty(1);
  };
  
  // Remove product from new order
  const removeProduct = (productId: string) => {
    setNewOrder(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };
  
  // Submit new order
  const submitNewOrder = () => {
    if (newOrder.products.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product to the order',
        variant: 'destructive',
      });
      return;
    }
    
    const orderTotal = newOrder.products.reduce((total, product) => {
      return total + (product.price * product.qty);
    }, 0);
    
    const newOrderObj: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `#${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      customer: newOrder.customer,
      email: newOrder.email,
      products: newOrder.products,
      subtotal: orderTotal,
      shipping: 0, // Free shipping
      tax: orderTotal * 0.1, // 10% tax
      discount: 0,
      total: orderTotal * 1.1, // subtotal + tax
      status: newOrder.status,
      shippingAddress: newOrder.shippingAddress,
      payment: {
        method: newOrder.payment.method,
        transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: newOrder.payment.status,
        amount: orderTotal * 1.1,
        date: new Date().toISOString(),
      },
    };
    
    // Add to orders list
    setOrders(prev => [newOrderObj, ...prev]);
    
    // Reset form
    setNewOrder({
      customer: '',
      email: '',
      products: [],
      status: 'pending',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'Tunisia',
      },
      payment: {
        method: 'credit_card',
        status: 'pending',
      },
      notes: '',
    });
    
    // Close dialog
    setIsCreateOrderOpen(false);
    
    // Show success message
    toast({
      title: 'Success',
      description: 'Order created successfully',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <Button onClick={() => setIsCreateOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.products.length} items</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedOrder && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order {selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Placed on {formatDate(selectedOrder.date)}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="status">Status & Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedOrder.products.map((product) => (
                        <div key={product.id} className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku || 'N/A'}
                            </div>
                            <div className="mt-1 text-sm">
                              {formatCurrency(product.price)} × {product.qty}
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(product.price * product.qty)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {selectedOrder.shipping === 0
                            ? 'Free'
                            : formatCurrency(selectedOrder.shipping)}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount</span>
                          <span className="text-green-600">
                            -{formatCurrency(selectedOrder.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Payment Method</h4>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {selectedOrder.payment.method} •••• 
                            {selectedOrder.payment.transactionId.slice(-4)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {selectedOrder.payment.status === 'paid' ? (
                            <span className="text-green-600">Paid on {formatDate(selectedOrder.payment.date)}</span>
                          ) : (
                            <span className="text-yellow-600">Pending payment</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Billing Address</h4>
                        <div className="text-sm text-muted-foreground">
                          {selectedOrder.billingAddress ? (
                            <>
                              <div>{selectedOrder.billingAddress.name}</div>
                              <div>{selectedOrder.billingAddress.street}</div>
                              <div>
                                {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state}{' '}
                                {selectedOrder.billingAddress.zip}
                              </div>
                              <div>{selectedOrder.billingAddress.country}</div>
                              <div className="mt-1">{selectedOrder.billingAddress.phone}</div>
                            </>
                          ) : (
                            <div>Same as shipping address</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customer" className="space-y-6">
                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                            <h4 className="font-medium mb-2">Contact Information</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedOrder.customer}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${selectedOrder.email}`} className="text-primary hover:underline">
                                  {selectedOrder.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Shipping Address</h4>
                            <div className="text-sm text-muted-foreground">
                              <div>{selectedOrder.shippingAddress.name}</div>
                              <div>{selectedOrder.shippingAddress.street}</div>
                              <div>
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                                {selectedOrder.shippingAddress.zip}
                              </div>
                              <div>{selectedOrder.shippingAddress.country}</div>
                              <div className="mt-1">{selectedOrder.shippingAddress.phone}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="px-6 py-4">
                        <CardTitle className="text-lg">Order Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOrder.notes ? (
                          <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No notes available for this order.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="status" className="space-y-6">
                    <Card>
                      <CardHeader className="px-6 py-4">
                        <CardTitle className="text-lg">Order Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium mb-4">Current Status</h4>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(selectedOrder.status)}
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions
                                    .filter(opt => opt.value !== 'all')
                                    .map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? (
                            <div>
                              <h4 className="font-medium mb-4">Tracking Information</h4>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                    <Truck className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Shipped via {selectedOrder.carrier || 'Standard Shipping'}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Tracking #: {selectedOrder.trackingNumber || 'Not available'}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Track Package
                                </Button>
                              </div>
                            </div>
                          ) : null}

                          <div>
                            <h4 className="font-medium mb-4">Order Timeline</h4>
                            <div className="space-y-4">
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="h-full w-0.5 bg-green-100 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                  <div className="font-medium">Order Placed</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(selectedOrder.date)}
                                  </div>
                                </div>
                              </div>

                              {selectedOrder.status === 'processing' || 
                               selectedOrder.status === 'shipped' || 
                               selectedOrder.status === 'delivered' ? (
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="h-full w-0.5 bg-green-100 mt-2"></div>
                                  </div>
                                  <div className="flex-1 pb-6">
                                    <div className="font-medium">Order Confirmed</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(new Date(selectedOrder.date).getTime() + 1000 * 60 * 30)}
                                    </div>
                                    <div className="mt-1 text-sm">
                                      We've received your order and it's being processed.
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              {selectedOrder.status === 'shipped' || 
                               selectedOrder.status === 'delivered' ? (
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <Truck className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="h-full w-0.5 bg-green-100 mt-2"></div>
                                  </div>
                                  <div className="flex-1 pb-6">
                                    <div className="font-medium">Shipped</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(new Date(selectedOrder.date).getTime() + 1000 * 60 * 60 * 24)}
                                    </div>
                                    {selectedOrder.trackingNumber && (
                                      <div className="mt-1 text-sm">
                                        Tracking #: {selectedOrder.trackingNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null}

                              {selectedOrder.status === 'delivered' ? (
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">Delivered</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(new Date(selectedOrder.date).getTime() + 1000 * 60 * 60 * 48)}
                                    </div>
                                    <div className="mt-1 text-sm">
                                      Your order has been delivered.
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                      ['pending', 'processing'].includes(selectedOrder.status) 
                                        ? 'bg-gray-100' 
                                        : 'bg-green-100'
                                    }`}>
                                      {['pending', 'processing'].includes(selectedOrder.status) ? (
                                        <Clock className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {selectedOrder.status === 'cancelled' 
                                        ? 'Order Cancelled' 
                                        : 'In Transit'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {selectedOrder.status === 'cancelled'
                                        ? 'This order has been cancelled.'
                                        : 'Your order is on its way to you.'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button>Print Order</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
          
          {/* Create Order Dialog */}
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Add products and customer information to create a new order
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input 
                        type="number" 
                        min="1" 
                        value={productQty} 
                        onChange={(e) => setProductQty(Number(e.target.value))} 
                        className="w-24"
                        placeholder="Qty"
                      />
                      
                      <Button 
                        onClick={addProductToOrder}
                        disabled={!selectedProduct}
                      >
                        Add to Order
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newOrder.products.length > 0 ? (
                            newOrder.products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    value={product.qty} 
                                    onChange={(e) => {
                                      const updatedProducts = [...newOrder.products];
                                      updatedProducts[index].qty = Number(e.target.value);
                                      setNewOrder(prev => ({
                                        ...prev,
                                        products: updatedProducts
                                      }));
                                    }}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>{formatCurrency(product.price * product.qty)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeProduct(product.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                No products added yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      {newOrder.products.length > 0 && (
                        <div className="p-4 border-t">
                          <div className="flex justify-between font-medium">
                            <span>Subtotal:</span>
                            <span>
                              {formatCurrency(
                                newOrder.products.reduce((total, product) => {
                                  return total + (product.price * product.qty);
                                }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer Name *</Label>
                        <Input 
                          id="customer" 
                          value={newOrder.customer}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            customer: e.target.value
                          }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={newOrder.email}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Shipping Address</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          placeholder="Street Address"
                          value={newOrder.shippingAddress.street}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress,
                              street: e.target.value
                            }
                          }))}
                        />
                        <Input 
                          placeholder="City"
                          value={newOrder.shippingAddress.city}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress,
                              city: e.target.value
                            }
                          }))}
                        />
                        <Input 
                          placeholder="State/Province"
                          value={newOrder.shippingAddress.state}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress,
                              state: e.target.value
                            }
                          }))}
                        />
                        <Input 
                          placeholder="ZIP/Postal Code"
                          value={newOrder.shippingAddress.zip}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress,
                              zip: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select 
                        value={newOrder.payment.method}
                        onValueChange={(value) => setNewOrder(prev => ({
                          ...prev,
                          payment: {
                            ...prev.payment,
                            method: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Any special instructions for this order..."
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOrderOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitNewOrder}
                  disabled={newOrder.products.length === 0 || !newOrder.customer || !newOrder.email}
                >
                  Create Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    }