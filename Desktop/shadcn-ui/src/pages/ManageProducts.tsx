import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Pencil, X, Search, ArrowUpDown, Package, UploadCloud, Filter, MoreHorizontal, Eye, Tag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: boolean;
  sku?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  compareAtPrice?: number;
  costPerItem?: number;
  taxable?: boolean;
  barcode?: string;
  stockStatus?: string;
  trackQuantity?: boolean;
  continueSelling?: boolean;
  requiresShipping?: boolean;
}

// Mock products data with more realistic e-commerce data
const mockProducts: Product[] = [
  {
    id: 'prod_001',
    title: 'Premium Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat with carrying strap',
    price: 59.99,
    category: 'Fitness Equipment',
    stock: 45,
    status: true,
    sku: 'YM-1001',
    createdAt: '2024-01-15',
    updatedAt: '2024-05-20',
    images: ['/placeholder-yoga-mat.jpg'],
    variants: ['Black', 'Blue', 'Purple'],
    rating: 4.8,
    reviews: 128
  },
  {
    id: 'prod_002',
    title: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells from 5kg to 25kg',
    price: 199.99,
    category: 'Strength Training',
    stock: 12,
    status: true,
    sku: 'DB-2001',
    createdAt: '2024-02-10',
    updatedAt: '2024-06-15',
    images: ['/placeholder-dumbbell.jpg'],
    variants: ['5-25kg'],
    rating: 4.9,
    reviews: 245
  },
  {
    id: 'prod_003',
    title: 'Wireless Earbuds Pro',
    description: 'Sweatproof wireless earbuds with noise cancellation',
    price: 129.99,
    category: 'Accessories',
    stock: 0,
    status: false,
    sku: 'EB-3001',
    createdAt: '2024-03-05',
    updatedAt: '2024-07-01',
    images: ['/placeholder-earbuds.jpg'],
    variants: ['Black', 'White'],
    rating: 4.7,
    reviews: 312
  },
  {
    id: 'prod_004',
    title: 'Resistance Bands Set',
    description: '5-piece set of durable resistance bands with handles',
    price: 39.99,
    category: 'Training Equipment',
    stock: 78,
    status: true,
    sku: 'RB-4001',
    createdAt: '2024-04-12',
    updatedAt: '2024-07-10',
    images: ['/placeholder-bands.jpg'],
    variants: ['Light', 'Medium', 'Heavy', 'X-Heavy', 'XX-Heavy'],
    rating: 4.6,
    reviews: 187
  },
  {
    id: 'prod_005',
    title: 'Foam Roller',
    description: 'High-density foam roller for muscle recovery',
    price: 29.99,
    category: 'Recovery',
    stock: 32,
    status: true,
    sku: 'FR-5001',
    createdAt: '2024-05-18',
    updatedAt: '2024-07-05',
    images: ['/placeholder-foam-roller.jpg'],
    variants: ['Blue', 'Black', 'Purple'],
    rating: 4.5,
    reviews: 94
  }
];

export default function ManageProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({ key: 'title', direction: 'asc' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<Omit<Product, 'id' | 'rating' | 'reviews'>>({
    title: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    status: true,
    sku: '',
    images: [],
    compareAtPrice: undefined,
    costPerItem: undefined,
    taxable: false,
    barcode: '',
    stockStatus: 'in-stock',
    trackQuantity: true,
    continueSelling: false,
    requiresShipping: true
  });

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const showActive = statusFilter === 'active';
      result = result.filter(p => p.status === showActive);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [products, search, categoryFilter, statusFilter, sortConfig]);

  // Handlers
  const handleSort = (key: keyof Product) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setForm({
      title: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      status: true,
      sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      images: [],
      compareAtPrice: undefined,
      costPerItem: undefined,
      taxable: false,
      barcode: '',
      stockStatus: 'in-stock',
      trackQuantity: true,
      continueSelling: false,
      requiresShipping: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      sku: product.sku || `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      images: product.images || [],
      compareAtPrice: product.compareAtPrice,
      costPerItem: product.costPerItem,
      taxable: product.taxable || false,
      barcode: product.barcode || '',
      stockStatus: product.stockStatus || 'in-stock',
      trackQuantity: product.trackQuantity !== false,
      continueSelling: product.continueSelling || false,
      requiresShipping: product.requiresShipping !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleStatusToggle = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, status: !p.status } : p
    ));
  };

  const handleDialogSave = () => {
    if (dialogMode === 'add') {
      const newProduct: Product = {
        ...form,
        id: `prod_${Math.random().toString(36).substr(2, 9)}`,
        price: form.price,
        stock: form.stock,
        sku: form.sku || `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        images: form.images || [],
        compareAtPrice: form.compareAtPrice,
        costPerItem: form.costPerItem,
        taxable: form.taxable || false,
        barcode: form.barcode || '',
        stockStatus: form.stockStatus || 'in-stock',
        trackQuantity: form.trackQuantity !== false,
        continueSelling: form.continueSelling || false,
        requiresShipping: form.requiresShipping !== false,
        rating: 0,
        reviews: 0
      };
      setProducts([...products, newProduct]);
      toast({
        title: 'Product added',
        description: `${form.title} has been added to your products.`,
      });
    } else if (selectedProduct) {
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? { 
          ...form, 
          id: selectedProduct.id,
          sku: form.sku || p.sku,
          images: form.images || p.images || [],
          compareAtPrice: form.compareAtPrice,
          costPerItem: form.costPerItem,
          taxable: form.taxable || false,
          barcode: form.barcode || p.barcode || '',
          stockStatus: form.stockStatus || p.stockStatus || 'in-stock',
          trackQuantity: form.trackQuantity !== false,
          continueSelling: form.continueSelling || false,
          requiresShipping: form.requiresShipping !== false,
          rating: p.rating || 0,
          reviews: p.reviews || 0
        } : p
      ) as Product[];
      setProducts(updatedProducts);
      toast({
        title: 'Product updated',
        description: `${form.title} has been updated.`,
      });
    }
    setIsDialogOpen(false);
    setForm({
      title: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      status: true,
      sku: '',
      images: [],
      compareAtPrice: undefined,
      costPerItem: undefined,
      taxable: false,
      barcode: '',
      stockStatus: 'in-stock',
      trackQuantity: true,
      continueSelling: false,
      requiresShipping: true
    });
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => URL.createObjectURL(file));
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    setForm(f => ({
      ...f,
      variants: [...f.variants, { name: '', value: '' }]
    }));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      variants: f.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const removeVariant = (index: number) => {
    setForm(f => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index)
    }));
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status: boolean) => (
    <Badge variant={status ? 'default' : 'secondary'} className="capitalize">
      {status ? 'Active' : 'Inactive'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button onClick={openAddDialog} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    cat !== 'all' && (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="px-7">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {filteredProducts.length} products found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('sku')}
                    >
                      SKU
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      Product
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort('category')}
                    >
                      Category
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
                      onClick={() => handleSort('stock')}
                    >
                      Stock
                      <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      Status
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <span className="text-xs bg-muted px-2 py-1 rounded-md font-mono">
                          {product.sku || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            {product.images?.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.title}
                                className="h-full w-full object-cover rounded-md"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{product.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-medium",
                          product.stock < 10 ? "text-amber-600" : "text-foreground"
                        )}>
                          {product.stock} in stock
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={product.status} 
                            onCheckedChange={() => handleStatusToggle(product.id)} 
                          />
                          {getStatusBadge(product.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-6">
                        <Package className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No products found. Try adjusting your search or filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
            {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Update the product details below.' 
                : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <form onSubmit={(e) => { e.preventDefault(); handleDialogSave(); }}>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Product Name *</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Premium Yoga Mat"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        placeholder="e.g. YG-MAT-001"
                        value={form.sku || ''}
                        onChange={(e) => setForm({...form, sku: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to auto-generate SKU
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={form.category}
                        onValueChange={(value) => setForm({...form, category: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter detailed product description..."
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        rows={8}
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (TND) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          TND
                        </span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.price}
                          onChange={(e) => setForm({...form, price: parseFloat(e.target.value)})}
                          className="pl-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="compareAtPrice">Compare at Price (TND)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          TND
                        </span>
                        <Input
                          id="compareAtPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.compareAtPrice || ''}
                          onChange={(e) => setForm({...form, compareAtPrice: parseFloat(e.target.value)})}
                          className="pl-12"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        To show a reduced price, move the product's original price to Compare at price.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cost per item (TND)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          TND
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={form.costPerItem || ''}
                          onChange={(e) => setForm({...form, costPerItem: parseFloat(e.target.value)})}
                          className="pl-12"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customers won't see this
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Charge tax on this product</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="taxable"
                          checked={form.taxable}
                          onCheckedChange={(checked) => setForm({...form, taxable: checked})}
                        />
                        <Label htmlFor="taxable" className="cursor-pointer">
                          {form.taxable ? 'Taxable' : 'Not taxable'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                      <Input
                        id="sku"
                        placeholder="e.g. YG-MAT-001"
                        value={form.sku || ''}
                        onChange={(e) => setForm({...form, sku: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                      <Input
                        id="barcode"
                        placeholder="e.g. 123456789012"
                        value={form.barcode || ''}
                        onChange={(e) => setForm({...form, barcode: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantity *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.stock}
                        onChange={(e) => setForm({...form, stock: parseInt(e.target.value)})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stock status</Label>
                      <Select
                        value={form.stockStatus || 'in-stock'}
                        onValueChange={(value) => setForm({...form, stockStatus: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stock status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-stock">In stock</SelectItem>
                          <SelectItem value="out-of-stock">Out of stock</SelectItem>
                          <SelectItem value="on-backorder">On backorder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Track quantity</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="trackQuantity"
                          checked={form.trackQuantity}
                          onCheckedChange={(checked) => setForm({...form, trackQuantity: checked})}
                        />
                        <Label htmlFor="trackQuantity" className="cursor-pointer">
                          {form.trackQuantity ? 'Tracking enabled' : 'Not tracking'}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Track inventory levels and prevent overselling
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Continue selling when out of stock</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="continueSelling"
                          checked={form.continueSelling}
                          onCheckedChange={(checked) => setForm({...form, continueSelling: checked})}
                        />
                        <Label htmlFor="continueSelling" className="cursor-pointer">
                          {form.continueSelling ? 'Continue selling' : 'Stop selling when out of stock'}
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Requires shipping</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requiresShipping"
                          checked={form.requiresShipping}
                          onCheckedChange={(checked) => setForm({...form, requiresShipping: checked})}
                        />
                        <Label htmlFor="requiresShipping" className="cursor-pointer">
                          {form.requiresShipping ? 'Yes' : 'No'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Product Images</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add high-quality images of your product. The first image will be used as the featured image.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {(form.images || []).map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border border-muted">
                            <img 
                              src={img} 
                              alt={`Product image ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newImages = [...form.images];
                              newImages.splice(index, 1);
                              setForm({...form, images: newImages});
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="text-center p-4">
                          <UploadCloud className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Upload images</p>
                          <Input 
                            type="file" 
                            className="hidden" 
                            id="product-images" 
                            multiple 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <Label 
                            htmlFor="product-images" 
                            className="cursor-pointer text-xs text-primary hover:underline"
                          >
                            or drag and drop
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
        </div>
    );
} 