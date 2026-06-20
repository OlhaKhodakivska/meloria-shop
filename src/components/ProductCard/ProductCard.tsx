// src/components/ProductCard/ProductCard.tsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext'; // Імпортуємо хук кошика
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart(); // Беремо функцію додавання

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
            className={styles.buyButton}
            onClick={() => addToCart(product)}
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
            <span>До кошика</span>
          </button>
        </div>
      </div>
    </div>
  );
};