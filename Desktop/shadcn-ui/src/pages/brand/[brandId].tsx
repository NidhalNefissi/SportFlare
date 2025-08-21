import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { mockProducts } from '../Marketplace';
import { Star, ShoppingCart, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Checkout from '../Checkout';

export default function BrandProfile() {
    const { brandId } = useParams();
    const navigate = useNavigate();
    const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

    // Find brand info and products
    const brandProducts = useMemo(() => mockProducts.filter(p => p.brand.id === brandId), [brandId]);
    const brand = brandProducts[0]?.brand;

    // Product popup state (copied from Marketplace)
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(true);
    };
    const handleAddToCart = (product, quantity = 1) => {
        addItem(product, quantity);
        setIsCartOpen(true);
        setIsProductDialogOpen(false);
    };
    const formatCurrency = (price) => `${price} TND`;

    return (
        <div className="max-w-3xl mx-auto mt-12 space-y-10">
            {/* Brand Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
                {brand?.logo && <img src={brand.logo} alt={brand.name} className="h-20 w-20 rounded-full object-cover border" />}
                <div className="flex-1">
                    <h1 className="text-4xl font-bold tracking-tight mb-1">{brand?.name || 'Brand'}</h1>
                    <p className="text-muted-foreground text-lg mb-2">{brand?.description || 'Brand description not available.'}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{brandProducts[0]?.rating || 4.7}</span>
                    </div>
                </div>
            </div>
            {/* Navigation Actions */}
            <div className="flex flex-wrap gap-3 items-center">
                <Button variant="outline" onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
                <Button variant="outline" onClick={() => navigate(`/messages/brand/${brandId}`)}>Message Brand</Button>
                <ShareButton
                  url={`${window.location.origin}/brand/${brandId}`}
                  title={`Check out ${brand?.name} on SportFlare`}
                  description={brand?.description || ''}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </ShareButton>

                {/* Cart Button */}
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative">
                            <ShoppingCart className="h-4 w-4" />
                            Cart ({totalItems})
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Your Cart ({totalItems} items)</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart className="h-10 w-10 mb-2 text-muted-foreground mx-auto" />
                                    <p className="text-muted-foreground">Your cart is empty</p>
                                    <Button variant="link" onClick={() => setIsCartOpen(false)}>
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded">
                                            <div className="w-12 h-12 bg-muted rounded" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{item.product.title}</h4>
                                                <p className="text-xs text-muted-foreground">{item.product.brand?.name || 'Unknown Brand'}</p>
                                                <p className="text-sm font-medium">{formatCurrency(item.product.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(item.product.id, Math.max(1, item.quantity - 1));
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <span className="text-sm w-6 text-center">{item.quantity}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(item.product.id, item.quantity + 1);
                                                    }}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeItem(item.product.id);
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between font-bold">
                                            <span>Total: {totalPrice} TND</span>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    setIsCartOpen(false);
                                                    setIsCheckoutOpen(true);
                                                }}
                                                disabled={items.length === 0}
                                            >
                                                Checkout
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setIsCartOpen(false)}
                                            >
                                                Continue Shopping
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            {/* Products Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brandProducts.length > 0 ? brandProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onView={() => handleViewProduct(product)}
                            onAddToCart={() => handleAddToCart(product)}
                            formatCurrency={formatCurrency}
                        />
                    )) : <p className="text-muted-foreground">No products found for this brand.</p>}
                </div>
            </div>
            {/* Contact Information */}
            <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
                <ul className="text-muted-foreground space-y-1 text-lg">
                    <li><span className="font-medium">Email:</span> info@{brand?.name?.toLowerCase().replace(/\s/g, '') || 'brand'}.com</li>
                    <li><span className="font-medium">Phone:</span> +216 12 345 678</li>
                    <li><span className="font-medium">Website:</span> www.{brand?.name?.toLowerCase().replace(/\s/g, '') || 'brand'}.com</li>
                </ul>
            </div>
            {/* Product Popup Dialog (copied from Marketplace) */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{selectedProduct?.title}</DialogTitle>
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
                        <Button variant="outline" onClick={() => { setIsProductDialogOpen(false); setTimeout(() => navigate(`/brand/${selectedProduct?.brand.id}`), 0); }}>View Brand</Button>
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

            {/* Checkout Modal */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Checkout
                            items={items}
                            total={totalPrice}
                            open={isCheckoutOpen}
                            onOpenChange={setIsCheckoutOpen}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Reuse ProductCard from Marketplace
import { ProductCard } from '../Marketplace';