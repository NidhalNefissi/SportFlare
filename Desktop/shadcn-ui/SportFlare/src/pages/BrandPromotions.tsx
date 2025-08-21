import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Tag, 
  Plus, 
  Edit, 
  Trash, 
  Calendar, 
  Percent, 
  Eye,
  Target,
  Image
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import apiService from '@/services/api/apiService';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'buy_one_get_one';
  discountValue: number;
  startDate: string;
  endDate: string;
  productCategory: string;
  imageUrl?: string;
  status: 'active' | 'scheduled' | 'expired';
  redemptionCount: number;
}

export default function BrandPromotions() {
  const { user } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    productCategory: 'all',
    imageUrl: '',
  });

  // Mock data for promotions
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'Summer Sale',
      description: 'Get 25% off all summer workout gear. Perfect for outdoor training!',
      discountType: 'percentage' as const,
      discountValue: 25,
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      productCategory: 'apparel',
      imageUrl: 'https://placehold.co/600x400?text=Summer+Sale',
      status: 'active' as const,
      redemptionCount: 128,
    },
    {
      id: '2',
      title: 'Protein Power',
      description: 'Buy one protein supplement, get one 50% off. Fuel your workouts!',
      discountType: 'buy_one_get_one' as const,
      discountValue: 50,
      startDate: '2023-07-15',
      endDate: '2023-09-15',
      productCategory: 'supplements',
      imageUrl: 'https://placehold.co/600x400?text=Protein+Power',
      status: 'active' as const,
      redemptionCount: 76,
    },
    {
      id: '3',
      title: 'Black Friday',
      description: 'Massive discounts on all fitness equipment for Black Friday weekend.',
      discountType: 'percentage' as const,
      discountValue: 40,
      startDate: '2023-11-24',
      endDate: '2023-11-27',
      productCategory: 'equipment',
      imageUrl: 'https://placehold.co/600x400?text=Black+Friday',
      status: 'scheduled' as const,
      redemptionCount: 0,
    },
    {
      id: '4',
      title: 'New Year, New You',
      description: 'Start your fitness journey with $20 off any purchase over $100',
      discountType: 'fixed' as const,
      discountValue: 20,
      startDate: '2022-12-26',
      endDate: '2023-01-31',
      productCategory: 'all',
      imageUrl: 'https://placehold.co/600x400?text=New+Year+Sale',
      status: 'expired' as const,
      redemptionCount: 215,
    }
  ]);

  // Redirect if not brand
  if (user?.role !== 'brand') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDiscountTypeChange = (value: string) => {
    setFormData({
      ...formData,
      discountType: value as 'percentage' | 'fixed' | 'buy_one_get_one'
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      productCategory: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      startDate: '',
      endDate: '',
      productCategory: 'all',
      imageUrl: '',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      productCategory: promotion.productCategory,
      imageUrl: promotion.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleCreatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an API
    const newPromotion: Promotion = {
      id: (promotions.length + 1).toString(),
      ...formData,
      status: new Date(formData.startDate) > new Date() ? 'scheduled' : 'active',
      redemptionCount: 0,
    };
    
    setPromotions([...promotions, newPromotion]);
    setIsCreateDialogOpen(false);
    toast.success('Promotion created successfully');
  };

  const handleUpdatePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromotion) return;
    
    // In a real app, this would call an API
    const updatedPromotions = promotions.map(promo => {
      if (promo.id === selectedPromotion.id) {
        return {
          ...promo,
          ...formData,
          status: new Date(formData.endDate) < new Date() ? 'expired' : 
                  new Date(formData.startDate) > new Date() ? 'scheduled' : 'active',
        };
      }
      return promo;
    });
    
    setPromotions(updatedPromotions);
    setIsEditDialogOpen(false);
    toast.success('Promotion updated successfully');
  };

  const handleDeletePromotion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(promo => promo.id !== id));
      toast.success('Promotion deleted successfully');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'apparel':
        return 'Apparel';
      case 'supplements':
        return 'Supplements';
      case 'equipment':
        return 'Equipment';
      case 'accessories':
        return 'Accessories';
      case 'all':
      default:
        return 'All Products';
    }
  };

  const getDiscountLabel = (promo: Promotion) => {
    switch (promo.discountType) {
      case 'percentage':
        return `${promo.discountValue}% off`;
      case 'fixed':
        return `$${promo.discountValue} off`;
      case 'buy_one_get_one':
        return `Buy one, get one ${promo.discountValue}% off`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Promotions</h1>
          <p className="text-muted-foreground">Create and manage special offers for your products</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        {['active', 'scheduled', 'expired', 'all'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions
                .filter(promo => tab === 'all' || promo.status === tab)
                .map(promo => (
                  <Card key={promo.id} className="overflow-hidden">
                    {promo.imageUrl && (
                      <div className="relative w-full h-40 bg-muted">
                        <img
                          src={promo.imageUrl}
                          alt={promo.title}
                          className="w-full h-full object-cover"
                        />
                        {getStatusBadge(promo.status)}
                      </div>
                    )}
                    <CardHeader className={promo.imageUrl ? "pt-3 pb-3" : "pb-3"}>
                      <div className="flex items-start justify-between">
                        <CardTitle>{promo.title}</CardTitle>
                        {!promo.imageUrl && getStatusBadge(promo.status)}
                      </div>
                      <CardDescription>{promo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Percent className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{getDiscountLabel(promo)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{new Date(promo.startDate).toLocaleDateString()} to {new Date(promo.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{getCategoryLabel(promo.productCategory)}</span>
                        </div>
                        {promo.redemptionCount > 0 && (
                          <div className="flex items-center text-sm">
                            <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{promo.redemptionCount} redemptions</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(promo)}>
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePromotion(promo.id)}>
                        <Trash className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            
            {promotions.filter(promo => tab === 'all' || promo.status === tab).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No promotions found</h3>
                <p className="text-muted-foreground mt-1">
                  {tab === 'active' ? 'You don\'t have any active promotions.' :
                   tab === 'scheduled' ? 'No upcoming promotions scheduled.' :
                   tab === 'expired' ? 'No expired promotions yet.' : 'Start creating promotions for your products.'}
                </p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Promotion
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Promotion Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>
              Set up a special offer for your products.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreatePromotion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Promotion Title</Label>
              <Input 
                id="title" 
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Summer Sale, Holiday Special, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe your promotion and its benefits..."
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={handleDiscountTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? 'Percentage (%)' : 
                   formData.discountType === 'fixed' ? 'Amount ($)' : 'Discount (%)'}
                </Label>
                <Input 
                  id="discountValue" 
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleFormChange}
                  min="0"
                  max={formData.discountType === 'percentage' || formData.discountType === 'buy_one_get_one' ? "100" : undefined}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Category</Label>
              <Select 
                value={formData.productCategory} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Promotion Image URL (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="imageUrl" 
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="/images/exampleimage.jpg"
                />
                {formData.imageUrl && (
                  <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-muted">
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Add an image to make your promotion more eye-catching</p>
            </div>
            
            <DialogFooter>
              <Button type="submit">Create Promotion</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>
              Make changes to the promotion details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePromotion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Promotion Title</Label>
              <Input 
                id="edit-title" 
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discountType">Discount Type</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={handleDiscountTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-discountValue">
                  {formData.discountType === 'percentage' ? 'Percentage (%)' : 
                   formData.discountType === 'fixed' ? 'Amount ($)' : 'Discount (%)'}
                </Label>
                <Input 
                  id="edit-discountValue" 
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleFormChange}
                  min="0"
                  max={formData.discountType === 'percentage' || formData.discountType === 'buy_one_get_one' ? "100" : undefined}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input 
                  id="edit-startDate" 
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input 
                  id="edit-endDate" 
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-productCategory">Product Category</Label>
              <Select 
                value={formData.productCategory} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Promotion Image URL (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="edit-imageUrl" 
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="/images/exampleimage.jpg"
                />
                {formData.imageUrl && (
                  <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-muted">
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Update Promotion</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}