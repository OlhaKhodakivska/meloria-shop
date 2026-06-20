// src/components/Footer/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Імпортуємо useNavigate
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const navigate = useNavigate(); // Ініціалізуємо навігацію
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > 2026 ? `2026-${currentYear}` : '2026';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Клікабельний брендинг зі стилями як у хедері */}
        <div className={styles.brand}>
          <h3 className={styles.logo} onClick={() => navigate('/')}>
            MELORIA<span className={styles.star}>✦</span>
          </h3>
          <p>Преміальні подарунки та аксесуари</p>
        </div>

        <div className={styles.info}>
          <p className={styles.brandLegal}>Інтернет-магазин MELORIA</p>
          <p className={styles.fopName}>ФОП Ходаківська О. С.</p>
          <p className={styles.copy}>&copy; {displayYear} Всі права захищені.</p>
        </div>

      </div>
    </footer>
  );
};