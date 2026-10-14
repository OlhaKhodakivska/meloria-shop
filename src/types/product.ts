// src/types/product.ts
export interface Product {
  id: string;
  title: string;
  price: number;
  priceOld?: number | null;
  imageUrl: string;
  images?: string[];
  description: string;
  category: string;
  isAvailable: boolean;
  deliveryGroup?: 'express' | 'made_to_order';
  deliveryLabel?: string;
  deliveryDescription?: string;
}
