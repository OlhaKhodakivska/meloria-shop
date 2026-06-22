// src/components/ProductCard/ProductCard.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/cartContextValue'; // Імпортуємо хук кошика
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cartItems } = useCart(); // Беремо функцію додавання
  const productQuantity = cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const isInCart = productQuantity > 0;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={product.imageUrl} alt={product.title} className={styles.image} />
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{product.price} ₴</span>
          {/* Додаємо подію onClick */}
          <button
            className={`${styles.buyButton} ${isInCart ? styles.buyButtonActive : ''}`}
            onClick={() => addToCart(product)}
            aria-label={isInCart ? `У кошику ${productQuantity} шт.` : 'Додати до кошика'}
            type="button"
          >
            <ShoppingCart size={18} />
            <span>{isInCart ? 'У кошику' : 'До кошика'}</span>
            {isInCart && <span className={styles.quantityBadge}>{productQuantity}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
