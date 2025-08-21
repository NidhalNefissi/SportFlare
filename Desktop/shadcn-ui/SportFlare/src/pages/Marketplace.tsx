import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { Search, ShoppingCart, Filter, Star } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Yoga Mat',
    description: 'Non-slip, eco-friendly yoga mat perfect for all types of yoga practices.',
    brandId: '1',
    brand: {
      id: '1',
      name: 'YogaFlex',
      description: 'Premium yoga equipment for enthusiasts and professionals.',
      logo: '/assets/brands/yogaflex.jpg',
    },
    image: '/assets/products/yoga-mat.jpg',
    price: 49.99,
    category: 'Equipment',
    stock: 50,
    rating: 4.7,
  },
  {
    id: '2',
    title: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with different strengths for versatile workouts.',
    brandId: '2',
    brand: {
      id: '2',
      name: 'FitPro',
      description: 'Professional fitness equipment for home and gym use.',
      logo: '/assets/brands/fitpro.jpg',
    },
    image: '/assets/products/resistance-bands.jpg',
    price: 29.99,
    category: 'Equipment',
    stock: 75,
    rating: 4.5,
  },
  {
    id: '3',
    title: 'Whey Protein - Chocolate',
    description: 'High-quality whey protein isolate with 25g protein per serving.',
    brandId: '3',
    brand: {
      id: '3',
      name: 'NutriMax',
      description: 'Premium nutrition supplements for optimal performance.',
      logo: '/assets/brands/nutrimax.jpg',
    },
    image: '/assets/products/whey-protein.jpg',
    price: 59.99,
    category: 'Supplements',
    stock: 100,
    rating: 4.8,
  },
  {
    id: '4',
    title: 'Wireless Earbuds',
    description: 'Sweatproof wireless earbuds perfect for intense workouts.',
    brandId: '4',
    brand: {
      id: '4',
      name: 'SoundFit',
      description: 'Audio equipment designed specifically for fitness activities.',
      logo: '/assets/brands/soundfit.jpg',
    },
    image: '/assets/products/earbuds.jpg',
    price: 89.99,
    category: 'Accessories',
    stock: 30,
    rating: 4.6,
  },
  {
    id: '5',
    title: 'Compression Leggings',
    description: 'High-performance compression leggings for improved circulation and support.',
    brandId: '5',
    brand: {
      id: '5',
      name: 'AthleticWear',
      description: 'High-quality athletic apparel for all fitness levels.',
      logo: '/assets/brands/athleticwear.jpg',
    },
    image: '/assets/products/leggings.jpg',
    price: 69.99,
    category: 'Apparel',
    stock: 45,
    rating: 4.9,
  },
  {
    id: '6',
    title: 'Smart Water Bottle',
    description: 'Tracks your water intake and reminds you to stay hydrated throughout the day.',
    brandId: '4',
    brand: {
      id: '4',
      name: 'SoundFit',
      description: 'Audio equipment designed specifically for fitness activities.',
      logo: '/assets/brands/soundfit.jpg',
    },
    image: '/assets/products/water-bottle.jpg',
    price: 34.99,
    category: 'Accessories',
    stock: 60,
    rating: 4.3,
  },
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Supplements', label: 'Supplements' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Apparel', label: 'Apparel' },
];

export default function Marketplace() {
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Filter products based on search query and filters
  useEffect(() => {
    const filtered = mockProducts.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = category === 'all' || product.category === category;
      
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1] * 2;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
    
    setProducts(filtered);
  }, [searchQuery, category, priceRange]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addItem(product, quantity);
    setIsCartOpen(true);
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">Find premium fitness products from our trusted partners.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or keywords..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your product search</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <div className="pt-4">
                    <Slider
                      defaultValue={priceRange}
                      max={100}
                      step={1}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">${priceRange[0]}</span>
                      <span className="text-sm">${priceRange[1] * 2}+</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Rating</h3>
                  <div className="flex flex-col gap-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
                        <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-1">& Up</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Brands</h3>
                  <div className="flex flex-col gap-2">
                    {['YogaFlex', 'FitPro', 'NutriMax', 'SoundFit', 'AthleticWear'].map((brand) => (
                      <div key={brand} className="flex items-center">
                        <input type="checkbox" id={`brand-${brand}`} className="mr-2" />
                        <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full">Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          {/* Cart */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-2 -top-2 min-w-[18px] h-[18px] flex items-center justify-center p-0">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] sm:w-[450px]">
              <SheetHeader>
                <SheetTitle>Your Cart ({totalItems} items)</SheetTitle>
                <SheetDescription>Review and manage your selected products</SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex-1 overflow-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <ShoppingCart className="h-10 w-10 mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Button variant="link" onClick={() => setIsCartOpen(false)}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 py-3">
                        <div className="w-16 h-16 rounded-md bg-muted" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                          <p className="text-muted-foreground text-xs">{item.product.brand.name}</p>
                          <p className="text-sm font-medium mt-1">{formatCurrency(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="space-y-4 mt-6">
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subtotal</span>
                      <span className="font-medium">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  <Button className="w-full">Checkout</Button>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onView={() => handleViewProduct(product)}
            onAddToCart={() => handleAddToCart(product)} 
            formatCurrency={formatCurrency}
          />
        ))}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
            <DialogDescription>by {selectedProduct?.brand.name}</DialogDescription>
          </DialogHeader>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-muted h-[200px] sm:h-full rounded-md" />
            
            <div className="space-y-4">
              <p className="text-sm">{selectedProduct?.description}</p>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= (selectedProduct?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm ml-1">{selectedProduct?.rating} ({Math.floor(Math.random() * 100) + 50} reviews)</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-bold">{selectedProduct && formatCurrency(selectedProduct.price)}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct?.stock ? (
                    <span className="text-green-600">In Stock ({selectedProduct.stock} available)</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Features:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Premium quality materials</li>
                  <li>Durable construction</li>
                  <li>Performance enhancing design</li>
                  <li>90-day warranty</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Continue Shopping
            </Button>
            <Button 
              onClick={() => {
                if (selectedProduct) {
                  handleAddToCart(selectedProduct);
                  setIsProductDialogOpen(false);
                }
              }}
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button variant="link" onClick={() => {
            setSearchQuery('');
            setCategory('all');
            setPriceRange([0, 100]);
          }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onView: () => void;
  onAddToCart: () => void;
  formatCurrency: (price: number) => string;
}

const ProductCard = ({ product, onView, onAddToCart, formatCurrency }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{product.category}</Badge>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>
        <h3 className="font-medium mt-2 line-clamp-1">{product.title}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm text-muted-foreground">by</span>
          <span className="text-sm font-medium">{product.brand.name}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold">{formatCurrency(product.price)}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            View
          </Button>
          <Button size="sm" onClick={onAddToCart}>
            Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};