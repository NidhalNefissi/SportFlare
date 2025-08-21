import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, addHours } from 'date-fns';
import { Product, ProductVariant, Cart, CartItem, Order, OrderStatus, WishlistItem } from '@/types/product';
import { MessageType } from '@/types/messaging';
import { Rating, RatingType } from '@/types/rating';

class ProductService {
  private static instance: ProductService;
  
  // In-memory storage (replace with API calls in production)
  private products: Product[] = [];
  private carts: Record<string, Cart> = {}; // Keyed by sessionId or userId
  private orders: Order[] = [];
  private wishlist: WishlistItem[] = [];
  
  private constructor() {}
  
  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }
  
  // ==================== Products ====================
  
  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }
  
  async getProductsByBrand(brandId: string, options: { 
    category?: string;
    inStock?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    limit?: number;
  } = {}): Promise<Product[]> {
    let result = this.products.filter(p => p.brandId === brandId);
    
    if (options.category) {
      result = result.filter(p => p.category === options.category);
    }
    
    if (options.inStock) {
      result = result.filter(p => p.inventoryStatus !== 'out_of_stock');
    }
    
    // Apply sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.basePrice - b.basePrice);
          break;
        case 'price_desc':
          result.sort((a, b) => b.basePrice - a.basePrice);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
          break;
        case 'popular':
          // In a real app, this would be based on order history or views
          result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
          break;
      }
    }
    
    if (options.limit) {
      result = result.slice(0, options.limit);
    }
    
    return result;
  }
  
  async searchProducts(query: string, options: {
    category?: string;
    brandId?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ products: Product[]; total: number }> {
    let result = [...this.products];
    
    // Apply search query
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      result = result.filter(product => {
        const searchableText = [
          product.name,
          product.description,
          product.shortDescription,
          product.tags?.join(' '),
          product.category,
          product.brandName,
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    
    // Apply filters
    if (options.category) {
      result = result.filter(p => p.category === options.category);
    }
    
    if (options.brandId) {
      result = result.filter(p => p.brandId === options.brandId);
    }
    
    if (options.inStock) {
      result = result.filter(p => p.inventoryStatus !== 'out_of_stock');
    }
    
    if (options.minPrice !== undefined) {
      result = result.filter(p => p.basePrice >= (options.minPrice as number));
    }
    
    if (options.maxPrice !== undefined) {
      result = result.filter(p => p.basePrice <= (options.maxPrice as number));
    }
    
    // Apply sorting
    const sortBy = options.sortBy || 'relevance';
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
        break;
      case 'popular':
        // In a real app, this would be based on order history or views
        result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
        break;
      case 'relevance':
      default:
        // Already sorted by relevance from the search
        break;
    }
    
    // Apply pagination
    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedResult = result.slice(startIndex, startIndex + pageSize);
    
    return {
      products: paginatedResult,
      total: result.length,
    };
  }
  
  // ==================== Cart Management ====================
  
  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    const cartId = userId ? `user_${userId}` : `session_${sessionId || uuidv4()}`;
    
    if (!this.carts[cartId]) {
      const now = new Date();
      this.carts[cartId] = {
        id: cartId,
        userId,
        sessionId: sessionId || (userId ? undefined : uuidv4()),
        items: [],
        itemCount: 0,
        itemSubtotal: 0,
        itemTotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        total: 0,
        createdAt: now,
        updatedAt: now,
        expiresAt: addDays(now, 30), // Cart expires after 30 days of inactivity
      };
    }
    
    return this.carts[cartId];
  }
  
  async addToCart(cartId: string, item: Omit<CartItem, 'id' | 'inventory'>): Promise<Cart> {
    const cart = this.carts[cartId];
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Check product availability
    const product = await this.getProductById(item.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const variant = item.variantId 
      ? product.variants?.find(v => v.id === item.variantId)
      : undefined;
    
    const availableQuantity = variant ? variant.quantity : product.inventoryQuantity;
    
    if (availableQuantity < item.quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(i => 
      i.productId === item.productId && 
      i.variantId === item.variantId
    );
    
    const now = new Date();
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].updatedAt = now;
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        ...item,
        id: uuidv4(),
        inventory: {
          available: availableQuantity > 0,
          quantity: availableQuantity,
        },
        createdAt: now,
        updatedAt: now,
      };
      cart.items.push(newItem);
    }
    
    // Recalculate cart totals
    await this.recalculateCartTotals(cart);
    
    return cart;
  }
  
  async updateCartItem(cartId: string, itemId: string, updates: { quantity?: number }): Promise<Cart> {
    const cart = this.carts[cartId];
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    const item = cart.items[itemIndex];
    
    // Update quantity if provided
    if (updates.quantity !== undefined) {
      if (updates.quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Check product availability
        const product = await this.getProductById(item.productId);
        if (!product) {
          throw new Error('Product not found');
        }
        
        const variant = item.variantId 
          ? product.variants?.find(v => v.id === item.variantId)
          : undefined;
        
        const availableQuantity = variant ? variant.quantity : product.inventoryQuantity;
        
        if (availableQuantity < updates.quantity) {
          throw new Error('Insufficient stock');
        }
        
        // Update quantity
        item.quantity = updates.quantity;
        item.updatedAt = new Date();
      }
    }
    
    // Recalculate cart totals
    await this.recalculateCartTotals(cart);
    
    return cart;
  }
  
  async removeFromCart(cartId: string, itemId: string): Promise<Cart> {
    const cart = this.carts[cartId];
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const itemIndex = cart.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    
    // Recalculate cart totals
    await this.recalculateCartTotals(cart);
    
    return cart;
  }
  
  private async recalculateCartTotals(cart: Cart): Promise<void> {
    // Reset totals
    let itemSubtotal = 0;
    let itemTotal = 0;
    let itemCount = 0;
    
    // Calculate item totals
    for (const item of cart.items) {
      const lineTotal = item.price * item.quantity;
      itemSubtotal += lineTotal;
      itemCount += item.quantity;
      
      // Apply any item-level discounts here
      const itemDiscount = 0; // Would calculate based on promotions
      itemTotal += lineTotal - itemDiscount;
    }
    
    // Calculate shipping (simplified)
    const shippingTotal = this.calculateShipping(cart);
    
    // Calculate taxes (simplified)
    const taxRate = 0.1; // 10% tax rate (would be calculated based on location)
    const taxTotal = itemTotal * taxRate;
    
    // Apply cart-level discounts
    const discountTotal = 0; // Would calculate based on promotions
    
    // Update cart
    cart.itemSubtotal = itemSubtotal;
    cart.itemTotal = itemTotal;
    cart.itemCount = itemCount;
    cart.shippingTotal = shippingTotal;
    cart.taxTotal = taxTotal;
    cart.discountTotal = discountTotal;
    cart.total = itemTotal + shippingTotal + taxTotal - discountTotal;
    cart.updatedAt = new Date();
  }
  
  private calculateShipping(cart: Cart): number {
    // Simplified shipping calculation
    // In a real app, this would consider item weights, dimensions, shipping zones, etc.
    if (cart.itemTotal >= 100) {
      return 0; // Free shipping for orders over $100
    }
    
    // Base shipping + per item
    return 5 + (cart.items.length * 1.5);
  }
  
  // ==================== Checkout & Orders ====================
  
  async createOrderFromCart(cartId: string, checkoutData: {
    email: string;
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    paymentToken?: string;
    notes?: string;
  }): Promise<Order> {
    const cart = this.carts[cartId];
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    if (cart.items.length === 0) {
      throw new Error('Cannot create order from empty cart');
    }
    
    // Validate inventory
    for (const item of cart.items) {
      const product = await this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const variant = item.variantId 
        ? product.variants?.find(v => v.id === item.variantId)
        : undefined;
      
      const availableQuantity = variant ? variant.quantity : product.inventoryQuantity;
      
      if (availableQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }
    
    // Process payment (simplified)
    const paymentResult = await this.processPayment({
      amount: cart.total,
      paymentMethod: checkoutData.paymentMethod,
      paymentToken: checkoutData.paymentToken,
      description: `Order for ${checkoutData.email}`,
      metadata: {
        cartId,
        userId: cart.userId,
      },
    });
    
    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }
    
    // Create order
    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const order: Order = {
      id: uuidv4(),
      orderNumber,
      userId: cart.userId,
      userEmail: checkoutData.email,
      userName: checkoutData.shippingAddress.firstName + ' ' + checkoutData.shippingAddress.lastName,
      
      // Copy cart totals
      subtotal: cart.itemSubtotal,
      shippingTotal: cart.shippingTotal,
      taxTotal: cart.taxTotal,
      discountTotal: cart.discountTotal,
      total: cart.total,
      currency: 'USD', // Would be dynamic in a real app
      
      // Status
      status: 'pending_payment',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      
      // Payment
      paymentMethod: checkoutData.paymentMethod as any,
      paymentMethodTitle: this.getPaymentMethodTitle(checkoutData.paymentMethod),
      transactionId: paymentResult.transactionId,
      
      // Addresses
      billingAddress: {
        ...checkoutData.billingAddress || checkoutData.shippingAddress,
        type: 'billing',
      },
      shippingAddress: {
        ...checkoutData.shippingAddress,
        type: 'shipping',
      },
      
      // Items
      items: cart.items.map(item => ({
        id: uuidv4(),
        orderId: '', // Will be set after order is created
        productId: item.productId,
        productName: item.name,
        productImage: item.image,
        variantId: item.variantId,
        variantName: item.variantOptions ? Object.values(item.variantOptions).join(' / ') : undefined,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        taxRate: 0.1, // Would be calculated based on product and location
        taxAmount: item.price * 0.1 * item.quantity,
        discountAmount: 0, // Would be calculated based on promotions
        total: item.price * item.quantity * 1.1, // Price + tax
        weight: item.weight,
        weightUnit: item.weightUnit || 'g',
        requiresShipping: item.requiresShipping !== false,
        status: 'pending',
        isReturnable: true,
        returnWindowDays: 30,
        returnRequested: false,
      })),
      
      // Notes
      customerNote: checkoutData.notes,
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      
      // Empty arrays for related data
      refunds: [],
    };
    
    // Set order ID on items
    order.items.forEach(item => {
      item.orderId = order.id;
    });
    
    // Save order
    this.orders.push(order);
    
    // Clear cart
    cart.items = [];
    await this.recalculateCartTotals(cart);
    
    // In a real app, you would:
    // 1. Send order confirmation email
    // 2. Update inventory
    // 3. Trigger any post-purchase workflows
    
    return order;
  }
  
  private getPaymentMethodTitle(paymentMethod: string): string {
    // Map payment method codes to display names
    const paymentMethods: Record<string, string> = {
      'credit_card': 'Credit Card',
      'paypal': 'PayPal',
      'bank_transfer': 'Bank Transfer',
      'cash_on_delivery': 'Cash on Delivery',
      'mobile_money': 'Mobile Money',
    };
    
    return paymentMethods[paymentMethod] || paymentMethod;
  }
  
  private async processPayment(paymentData: {
    amount: number;
    paymentMethod: string;
    paymentToken?: string;
    description: string;
    metadata: Record<string, any>;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // In a real app, this would integrate with a payment processor like Stripe
    // This is a simplified mock implementation
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate payment failure 5% of the time for testing
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: 'Payment was declined by the payment processor',
      };
    }
    
    // Success case
    return {
      success: true,
      transactionId: `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    };
  }
  
  // ==================== Wishlist ====================
  
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return this.wishlist.filter(item => item.userId === userId);
  }
  
  async addToWishlist(userId: string, productId: string, variantId?: string): Promise<WishlistItem> {
    // Check if product exists
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if variant exists (if provided)
    if (variantId && !product.variants?.some(v => v.id === variantId)) {
      throw new Error('Variant not found');
    }
    
    // Check if item is already in wishlist
    const existingItem = this.wishlist.find(
      item => item.userId === userId && 
             item.productId === productId && 
             item.variantId === variantId
    );
    
    if (existingItem) {
      return existingItem; // Already in wishlist
    }
    
    // Add to wishlist
    const variant = variantId ? product.variants?.find(v => v.id === variantId) : undefined;
    
    const wishlistItem: WishlistItem = {
      id: uuidv4(),
      userId,
      productId,
      variantId,
      addedAt: new Date(),
      product: {
        id: product.id,
        name: product.name,
        description: product.description || '',
        basePrice: variant?.price || product.basePrice,
        images: product.images,
        ...(variant ? { variant: {
          id: variant.id,
          name: variant.name,
          price: variant.price,
          images: variant.images,
        }} : {}),
      },
    };
    
    this.wishlist.push(wishlistItem);
    return wishlistItem;
  }
  
  async removeFromWishlist(userId: string, itemId: string): Promise<boolean> {
    const index = this.wishlist.findIndex(
      item => item.id === itemId && item.userId === userId
    );
    
    if (index === -1) {
      return false;
    }
    
    this.wishlist.splice(index, 1);
    return true;
  }
  
  async moveWishlistToCart(userId: string, sessionId?: string): Promise<Cart> {
    const wishlistItems = await this.getWishlist(userId);
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    for (const item of wishlistItems) {
      try {
        await this.addToCart(cart.id, {
          productId: item.productId,
          variantId: item.variantId,
          quantity: 1,
          price: item.product.variant?.price || item.product.basePrice,
          name: item.product.name,
          image: item.product.images?.[0]?.url,
          sku: item.product.variant?.sku || `PROD-${item.productId}`,
          requiresShipping: true,
          taxable: true,
          variantOptions: item.product.variant?.options || {},
        });
        
        // Remove from wishlist if added to cart successfully
        await this.removeFromWishlist(userId, item.id);
      } catch (error) {
        console.error(`Failed to add item ${item.productId} to cart:`, error);
        // Continue with next item
      }
    }
    
    return cart;
  }
}

export const productService = ProductService.getInstance();
