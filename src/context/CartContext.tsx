// src/context/CartContext.tsx
import React, { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';
import { CartContext } from './cartContextValue';

const CART_STORAGE_KEY = 'meloria_cart';
const LEGACY_CART_STORAGE_KEY = 'veloria_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ЛОГІКА ЗЧИТУВАННЯ: При запуск додатка перевіряємо, чи є щось у localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_CART_STORAGE_KEY);

      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // ЛОГІКА ЗБЕРЕЖЕННЯ: Щоразу, коли масив cartItems змінюється, записуємо його в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Кошик все одно працює в пам'яті, навіть якщо браузер заборонив localStorage.
    }
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
