import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Class, Program, Product } from '@/types';
import apiService from '@/services/api/apiService';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash, Plus, Check, X, Eye } from 'lucide-react';

// Define a union type for content items
type ContentItem = Class | Program | Product;

// Type for selected item with type information
interface SelectedItem extends ContentItem {
  type: 'class' | 'product' | 'program';
}

export default function ContentManagement() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // In a real app, these would call API endpoints
        const classesResponse = await apiService.getClasses();
        const productsResponse = await apiService.getProducts();
        const programsResponse = await apiService.getPrograms();
        
        setClasses(classesResponse);
        setProducts(productsResponse);
        setPrograms(programsResponse);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      }
    };

    fetchContent();
  }, []);

  // Redirect if not admin
  if (user?.role !== 'admin') {
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

  const handleApprove = async (id: string, type: string) => {
    try {
      // In a real app, this would call an API endpoint
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully`);
    } catch (error) {
      console.error(`Error approving ${type}:`, error);
      toast.error(`Failed to approve ${type}`);
    }
  };

  const handleReject = async (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to reject this ${type}?`)) {
      try {
        // In a real app, this would call an API endpoint
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected`);
      } catch (error) {
        console.error(`Error rejecting ${type}:`, error);
        toast.error(`Failed to reject ${type}`);
      }
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        // In a real app, this would call an API endpoint
        if (type === 'class') {
          await apiService.deleteClass(id);
          setClasses(classes.filter(c => c.id !== id));
        } else if (type === 'product') {
          await apiService.deleteProduct(id);
          setProducts(products.filter(p => p.id !== id));
        } else if (type === 'program') {
          await apiService.deleteProgram(id);
          setPrograms(programs.filter(p => p.id !== id));
        }
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        toast.error(`Failed to delete ${type}`);
      }
    }
  };

  const handleView = (item: ContentItem, type: 'class' | 'product' | 'program') => {
    setSelectedItem({ ...item, type });
    setIsViewDialogOpen(true);
  };

  const getFilteredItems = (): ContentItem[] => {
    if (searchTerm === '') {
      if (activeTab === 'classes') return classes;
      if (activeTab === 'products') return products;
      if (activeTab === 'programs') return programs;
      return [];
    }

    const term = searchTerm.toLowerCase();
    if (activeTab === 'classes') {
      return classes.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.description.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'products') {
      return products.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'programs') {
      return programs.filter(p => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    return [];
  };

  const renderItemDetails = () => {
    if (!selectedItem) return null;

    const { type } = selectedItem;
    
    return (
      <div className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-lg">
          <img 
            src={selectedItem.image} 
            alt={selectedItem.title} 
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{selectedItem.title}</h3>
          <p className="text-muted-foreground">{selectedItem.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {type === 'class' && 'coach' in selectedItem && 'gym' in selectedItem && (
            <>
              <div>
                <p className="text-sm font-medium">Coach</p>
                <p>{selectedItem.coach?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Gym</p>
                <p>{selectedItem.gym?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date</p>
                <p>{new Date(selectedItem.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p>{selectedItem.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Price</p>
                <p>${selectedItem.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Capacity</p>
                <p>{selectedItem.enrolled}/{selectedItem.capacity}</p>
              </div>
            </>
          )}

          {type === 'product' && 'brand' in selectedItem && (
            <>
              <div>
                <p className="text-sm font-medium">Brand</p>
                <p>{selectedItem.brand?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Price</p>
                <p>${selectedItem.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Category</p>
                <p>{selectedItem.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Stock</p>
                <p>{selectedItem.stock}</p>
              </div>
            </>
          )}

          {type === 'program' && 'coach' in selectedItem && 'classes' in selectedItem && (
            <>
              <div>
                <p className="text-sm font-medium">Coach</p>
                <p>{selectedItem.coach?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p>{selectedItem.duration} weeks</p>
              </div>
              <div>
                <p className="text-sm font-medium">Price</p>
                <p>${selectedItem.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Classes</p>
                <p>{selectedItem.classes?.length || 0}</p>
              </div>
            </>
          )}
        </div>

        {selectedItem.tags && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex flex-wrap gap-2">
              {selectedItem.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage and moderate all platform content</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-8 md:w-[250px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        {['classes', 'products', 'programs'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        {tab === 'classes' && 'Coach / Gym'}
                        {tab === 'products' && 'Brand'}
                        {tab === 'programs' && 'Coach'}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {tab === 'classes' && 'Date'}
                        {tab === 'products' && 'Category'}
                        {tab === 'programs' && 'Duration'}
                      </TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredItems().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No {tab} found
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredItems().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {tab === 'classes' && 'coach' in item && 'gym' in item && 
                              `${item.coach?.name || 'Unknown'} / ${item.gym?.name || 'Unknown'}`
                            }
                            {tab === 'products' && 'brand' in item && item.brand?.name}
                            {tab === 'programs' && 'coach' in item && item.coach?.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {tab === 'classes' && 'date' in item && new Date(item.date).toLocaleDateString()}
                            {tab === 'products' && 'category' in item && item.category}
                            {tab === 'programs' && 'duration' in item && `${item.duration} weeks`}
                          </TableCell>
                          <TableCell className="text-right">${item.price}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleView(item, tab.slice(0, -1) as 'class' | 'product' | 'program')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-green-500" 
                                onClick={() => handleApprove(item.id, tab.slice(0, -1))}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-red-500" 
                                onClick={() => handleReject(item.id, tab.slice(0, -1))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleDelete(item.id, tab.slice(0, -1))}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
            <DialogDescription>
              View detailed information about this content.
            </DialogDescription>
          </DialogHeader>
          {renderItemDetails()}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}