// src/types/product.ts
export interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  isAvailable: boolean;
}