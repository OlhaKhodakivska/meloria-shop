// src/context/cartContextValue.ts
import { createContext, useContext } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelect: (productId: string) => void;        // Додали типізацію для чекбокса
  clearOrderedItems: () => void;                    // Додали типізацію для очищення купленого
  totalItems: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};