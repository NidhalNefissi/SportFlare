import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { CartItem, Product, Order } from '@/types';
import { useUser } from './UserContext';
import { apiService } from '@/services';
import { useNotifications } from './NotificationContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string, shippingAddress: string) => Promise<Order | null>;
  isProcessing: boolean;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const { addNotification } = useNotifications();

  // Load cart from local storage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('sportflare_cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from storage:', error);
      }
    }
  }, []);

  // Save cart to local storage when items change
  useEffect(() => {
    localStorage.setItem('sportflare_cart', JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, quantity: number) => {
    // Check if product is in stock
    if (product.stock < quantity) {
      throw new Error(`Sorry, only ${product.stock} items in stock`);
    }
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // If item already in cart, check total quantity against stock
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          throw new Error(`Sorry, only ${product.stock} items in stock`);
        }
        
        // Update quantity
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQuantity } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prevItems => {
      const item = prevItems.find(item => item.product.id === productId);
      
      // Check if the product has enough stock
      if (item && quantity > item.product.stock) {
        throw new Error(`Sorry, only ${item.product.stock} items in stock`);
      }
      
      return prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };
  
  const checkout = async (paymentMethod: string, shippingAddress: string): Promise<Order | null> => {
    if (!user) {
      throw new Error('You must be logged in to checkout');
    }
    
    if (items.length === 0) {
      throw new Error('Your cart is empty');
    }
    
    setIsProcessing(true);
    
    try {
      // Create order
      const order = await apiService.createOrder({
        userId: user.id,
        products: items,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        shippingAddress,
        total: totalPrice,
      });
      
      // Clear cart after successful order
      clearCart();
      
      // Create notification for successful checkout
      await addNotification({
        userId: user.id,
        title: 'Order Placed',
        message: `Your order has been placed successfully. Order total: $${totalPrice.toFixed(2)}`,
        type: 'order',
        isRead: false,
      });
      
      return order;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        isProcessing,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};