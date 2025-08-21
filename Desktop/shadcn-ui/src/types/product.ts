import { User } from './index';

export enum ProductCategory {
  APPAREL = 'apparel',
  EQUIPMENT = 'equipment',
  SUPPLEMENTS = 'supplements',
  ACCESSORIES = 'accessories',
  MEMBERSHIPS = 'memberships',
  DIGITAL = 'digital',
  OTHER = 'other'
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  ARCHIVED = 'archived'
}

export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
  PREORDER = 'preorder'
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  weight?: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  requiresShipping: boolean;
  taxable: boolean;
  trackInventory: boolean;
  inventoryStatus: InventoryStatus;
  images: string[];
  options: Record<string, string>; // e.g., { size: 'M', color: 'Blue' }
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isDefault: boolean;
  order: number;
}

export interface ProductOption {
  id: string;
  name: string; // e.g., 'Size', 'Color'
  values: string[]; // e.g., ['S', 'M', 'L'], ['Red', 'Blue', 'Green']
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  
  // Basic info
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  
  // Pricing and inventory
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxRate?: number;
  
  // Inventory
  trackInventory: boolean;
  inventoryQuantity: number;
  inventoryStatus: InventoryStatus;
  allowBackorders: boolean;
  lowStockThreshold: number;
  
  // Product details
  status: ProductStatus;
  category: ProductCategory;
  tags: string[];
  
  // Media
  images: ProductImage[];
  thumbnail?: string;
  
  // Variants
  hasVariants: boolean;
  variants: ProductVariant[];
  options: ProductOption[];
  defaultVariantId?: string;
  
  // Shipping
  weight?: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  requiresShipping: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  
  // Social media
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  
  // Stats
  productCount: number;
  ratingAverage: number;
  reviewCount: number;
  
  // Settings
  isVerified: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata
  metadata?: Record<string, any>;
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  ON_HOLD = 'on_hold',
  RETURNED = 'returned',
  EXCHANGED = 'exchanged'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other'
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  weight?: number;
  weightUnit: 'g' | 'kg' | 'oz' | 'lb';
  requiresShipping: boolean;
  
  // Status tracking
  status: OrderStatus;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Return/refund info
  isReturnable: boolean;
  returnWindowDays: number;
  returnRequested: boolean;
  returnReason?: string;
  returnStatus?: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';
  returnRequestedAt?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  type: 'billing' | 'shipping';
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  
  // Order totals
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  
  // Status
  status: OrderStatus;
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned' | 'partially_returned';
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentMethodTitle?: string;
  transactionId?: string;
  
  // Shipping
  shippingMethod?: string;
  shippingTrackingNumber?: string;
  shippingTrackingUrl?: string;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  fulfilledAt?: Date;
  cancelledAt?: Date;
  
  // Addresses
  billingAddress: OrderAddress;
  shippingAddress?: OrderAddress;
  
  // Items
  items: OrderItem[];
  
  // Notes
  customerNote?: string;
  adminNote?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Refunds
  refunds: Array<{
    id: string;
    amount: number;
    reason?: string;
    note?: string;
    processedAt: Date;
    processedBy: string;
  }>;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  name: string;
  image?: string;
  sku: string;
  requiresShipping: boolean;
  taxable: boolean;
  weight?: number;
  weightUnit: string;
  variantOptions?: Record<string, string>;
  inventory?: {
    available: boolean;
    quantity: number;
  };
  metadata?: Record<string, any>;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  
  // Totals
  itemCount: number;
  itemSubtotal: number;
  itemTotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  
  // Discounts
  discountCode?: string;
  discountAmount?: number;
  
  // Shipping
  shippingMethod?: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  addedAt: Date;
  product: Pick<Product, 'id' | 'name' | 'description' | 'basePrice' | 'images'> & {
    variant?: Pick<ProductVariant, 'id' | 'name' | 'price' | 'images'>;
  };
}
