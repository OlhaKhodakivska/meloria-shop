// src/components/Header/Header.tsx
import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Бургер-меню для мобільних */}
        <button
          className={styles.burger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Наш преміальний Логотип */}
        <div className={styles.logo}>
          VELORIA<span className={styles.star}>✦</span>
        </div>

        {/* Навігація (Адаптивна) */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            <li><a href="#" className={styles.navLink}>Каталог</a></li>
            <li><a href="#" className={styles.navLink}>Про нас</a></li>
            <li><a href="#" className={styles.navLink}>Доставка та оплата</a></li>
            <li><a href="#" className={styles.navLink}>Контакти</a></li>
          </ul>
        </nav>

        {/* Іконки користувача та кошика */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} aria-label="Profile">
            <User size={22} />
          </button>
          <button className={styles.actionBtn} aria-label="Cart">
            <ShoppingBag size={22} />
            <span className={styles.cartBadge}>0</span>
          </button>
        </div>
      </div>
    </header>
  );
};