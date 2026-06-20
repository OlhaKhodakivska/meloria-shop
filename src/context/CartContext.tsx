// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ЛОГІКА ЗЧИТУВАННЯ: При запуск додатка перевіряємо, чи є щось у localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('veloria_cart');
    // Якщо знайшли збережений кошик — парсимо його з рядка в масив, якщо ні — повертаємо порожній масив []
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // ЛОГІКА ЗБЕРЕЖЕННЯ: Щоразу, коли масив cartItems змінюється, записуємо його в localStorage
  useEffect(() => {
    localStorage.setItem('veloria_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Рахуємо загальну кількість товарів у кошику
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Рахуємо фінальну вартість усього кошика
  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Функція додавання товару
  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { product, quantity: 1 }];
    });
  };

  // Функція видалення товару повністю
  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  // Функція оновлення кількості (плюс / мінус)
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Очищення кошика (знадобиться після оформлення замовлення)
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};