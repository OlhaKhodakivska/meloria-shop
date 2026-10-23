import type { Product } from '../types/product';

export const getFeaturedProducts = (products: Product[]): Product[] => {
  if (products.length === 0) return [];

  // Keep the existing featured product first without sorting the full catalogue.
  let mostExpensiveProduct = products[0];
  for (const product of products) {
    if (product.price > mostExpensiveProduct.price) mostExpensiveProduct = product;
  }

  const remainingProducts = products.filter((product) => product.id !== mostExpensiveProduct.id);

  // Fisher–Yates shuffles a copy in one pass and preserves every product.
  for (let index = remainingProducts.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [remainingProducts[index], remainingProducts[randomIndex]] =
      [remainingProducts[randomIndex], remainingProducts[index]];
  }

  return [mostExpensiveProduct, ...remainingProducts];
};
