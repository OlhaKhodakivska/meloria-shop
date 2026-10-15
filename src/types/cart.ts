// src/types/cart.ts
import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean; // Додано для вибору товарів
}

export type OrderedCartItem = {
  product_id: string;
  quantity: number;
};
