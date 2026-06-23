// src/pages/Home.tsx
import React from 'react';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { Hero } from '../components/Hero/Hero';
import { PromoBanner } from '../components/PromoBanner/PromoBanner';
import { MOCK_PRODUCTS } from '../data/products';
import { Gift, Truck, ShieldCheck, Heart } from 'lucide-react';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  return (
    <div className={styles.homeWrapper}>
      {/* 1. HERO БАНЕР */}
      <Hero />

      {/* 2. СЕКЦІЯ ПЕРЕВАГ */}
      <section className={styles.benefitsContainer}>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <Gift size={28} className={styles.benefitIcon} />
            <div>
              <h4>Оригінальні товари</h4>
              <p>Ретельно підібрані для вас</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Truck size={28} className={styles.benefitIcon} />
            <div>
              <h4>Швидка доставка</h4>
              <p>1–2 дні по Україні</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <ShieldCheck size={28} className={styles.benefitIcon} />
            <div>
              <h4>Безпечна оплата</h4>
              <p>Онлайн або при отриманні</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Heart size={28} className={styles.benefitIcon} />
            <div>
              <h4>Затишок у деталях</h4>
              <p>Товари для особливого дому</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ГОЛОВНИЙ БЛОК ТОВАРІВ (Твій оригінальний .main) */}
      <main className={styles.main}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Хіти продажів</h2>
          <button className={styles.viewAllBtn} type="button">
            Дивитись всі <span className={styles.arrow}>→</span>
          </button>
        </div>

        <div className={styles.productGrid}>
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      {/* 4. БАНЕР БЕЗКОШТОВНОЇ ДОСТАВКИ */}
      <PromoBanner />
    </div>
  );
};