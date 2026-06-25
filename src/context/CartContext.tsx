// src/context/CartContext.tsx
import React, { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';
import { CartContext } from './cartContextValue';

const CART_STORAGE_KEY = 'meloria_cart';
const LEGACY_CART_STORAGE_KEY = 'veloria_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ЛОГІКА ЗЧИТУВАННЯ
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart =
        localStorage.getItem(CART_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_CART_STORAGE_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart) as Partial<CartItem>[];
        // Про всяк випадок переконуємося, що у старих даних з localStorage з'явиться selected: true
        return parsed.map((item) => ({
          ...item,
          selected: item.selected !== undefined ? item.selected : true
        })) as CartItem[];
      }
      return [];
    } catch {
      return [];
    }
  });

  // ЛОГІКА ЗБЕРЕЖЕННЯ
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Працює в пам'яті
    }
  }, [cartItems]);

  // Рахуємо загальну кількість ТІЛЬКИ обраних товарів (для бейджа кошика/оплати)
  const totalItems = cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0);

  // Рахуємо фінальну вартість ТІЛЬКИ обраних товарів
  const totalPrice = cartItems.filter(item => item.selected).reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Функція додавання товару
  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, selected: true } // Робимо вибраним при повторному додаванні
            : item
        );
      }

      return [...prevItems, { product, quantity: 1, selected: true }]; // Новий товар за дефолтом selected: true
    });
  };

  // Перемикання квадратика (чекбокса)
  const toggleSelect = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
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

  // Видаляємо з кошика ТІЛЬКИ ті товари, які були куплені (де стояла галочка)
  const clearOrderedItems = () => {
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
  };

  // Повне очищення кошика
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleSelect,        // Передали у контекст
        clearOrderedItems,   // Передали у контекст
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
