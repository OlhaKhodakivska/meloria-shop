// src/pages/Home.tsx
import React from 'react';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { MOCK_PRODUCTS } from '../data/products';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Наші Бестселери</h2>
        <p className={styles.subtitle}>Подарунки та аксесуари для вашого затишку</p>
      </div>

      <div className={styles.productGrid}>
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};
