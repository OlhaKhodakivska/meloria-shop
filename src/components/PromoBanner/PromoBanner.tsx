// src/components/PromoBanner/PromoBanner.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PromoBanner.module.css';

export const PromoBanner: React.FC = () => {
  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerContainer}>
        <div className={styles.content}>
          <h2 className={styles.title}>Безкоштовна доставка від 3000 ₴</h2>
          <p className={styles.subtitle}>Акція діє по всій Україні</p>
          <Link className={styles.detailsBtn} to={`${import.meta.env.BASE_URL}free-delivery`}>
            Детальніше
          </Link>
        </div>
      </div>
    </section>
  );
};
