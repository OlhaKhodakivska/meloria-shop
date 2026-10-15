import type { CartItem, OrderedCartItem } from '../types/cart';

export function removeOrderedItems(
  cartItems: readonly CartItem[],
  orderedItems: readonly OrderedCartItem[],
): CartItem[] {
  const orderedQuantities = new Map(
    orderedItems.map((item) => [item.product_id, item.quantity]),
  );

  return cartItems.flatMap((item) => {
    const orderedQuantity = orderedQuantities.get(item.product.id);
    if (orderedQuantity === undefined) return [item];

    const remainingQuantity = item.quantity - orderedQuantity;
    return remainingQuantity > 0 ? [{ ...item, quantity: remainingQuantity }] : [];
  });
}
