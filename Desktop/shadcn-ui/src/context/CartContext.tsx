import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { useUser } from './UserContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);

  // Helper function to get cart key for current user
  const getCartKey = useCallback(() => {
    return user ? `sportflare_cart_${user.id}` : 'sportflare_cart_guest';
  }, [user]);

  // Load cart from local storage when user changes
  useEffect(() => {
    if (user || !user) { // This will trigger on both login and logout
      const cartKey = getCartKey();
      const storedCart = localStorage.getItem(cartKey);
      setItems(storedCart ? JSON.parse(storedCart) : []);
    }
  }, [user, getCartKey]);

  // Save cart to local storage when items or user changes
  useEffect(() => {
    if (items.length > 0 || localStorage.getItem(getCartKey())) {
      localStorage.setItem(getCartKey(), JSON.stringify(items));
    }
  }, [items, getCartKey]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        // If item already in cart, update quantity
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
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

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from localStorage
    localStorage.removeItem(getCartKey());
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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