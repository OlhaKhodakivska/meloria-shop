import type { Product } from '../types/product';

export const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase('uk');

export function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return products;
  }

  const titleMatches: Product[] = [];
  const categoryMatches: Product[] = [];
  const descriptionMatches: Product[] = [];

  for (const product of products) {
    // Keep catalogue order within each priority and include every product only once.
    if (normalizeSearchText(product.title).includes(normalizedQuery)) {
      titleMatches.push(product);
    } else if (normalizeSearchText(product.category).includes(normalizedQuery)) {
      categoryMatches.push(product);
    } else if (normalizeSearchText(product.description).includes(normalizedQuery)) {
      descriptionMatches.push(product);
    }
  }

  return [...titleMatches, ...categoryMatches, ...descriptionMatches];
}
