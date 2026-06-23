// src/components/PromoBanner/PromoBanner.tsx
import React from 'react';
import styles from './PromoBanner.module.css';

export const PromoBanner: React.FC = () => {
  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerContainer}>
        <div className={styles.content}>
          <h2 className={styles.title}>Безкоштовна доставка від 2000 ₴</h2>
          <p className={styles.subtitle}>Акція діє по всій Україні</p>
          <button className={styles.detailsBtn}>Детальніше</button>
        </div>
      </div>
    </section>
  );
};