// src/components/Hero/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  const catalogUrl = `${import.meta.env.BASE_URL}?view=all#catalog`;
  const newProductsUrl = `${import.meta.env.BASE_URL}?view=new#catalog`;

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.content}>
          <span className={styles.subtitle}>Стиль. Затишок. Натхнення ✦</span>
          <h1 className={styles.title}>Гарні моменти кожного дня</h1>
          <p className={styles.description}>
            Подарунки, аксесуари для стилю та товари для затишку в домі. Обирайте з любов'ю ❤️

          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryBtn} to={catalogUrl}>Перейти в каталог</Link>
            <Link className={styles.secondaryBtn} to={newProductsUrl}>
              Дивитись новинки <span className={styles.arrow}>→</span>
            </Link>
          </div>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.active}`}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
      </div>
    </section>
  );
};
