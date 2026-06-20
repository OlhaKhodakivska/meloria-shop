// src/components/Header/Header.tsx
import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Імпортуємо Link замість звичайного тегу <a>

interface HeaderProps {
  onCartOpen: () => void; // Додали пропс для відкриття кошика
}

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button
          className={styles.burger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>


        <div className={styles.logo} onClick={() => navigate('/')}>
          MELORIA<span className={styles.star}>✦</span>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>

          <ul className={styles.navList}>
            <li><Link to="/" className={styles.navLink}>Каталог</Link></li>
            <li><Link to="/about" className={styles.navLink}>Про нас</Link></li>
            <li><Link to="/delivery" className={styles.navLink}>Доставка та оплата</Link></li>
            <li><Link to="/contacts" className={styles.navLink}>Контакти</Link></li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => navigate('/auth')} aria-label="Profile">
            <User size={22} />
          </button>

          {/* Додали onClick={onCartOpen} на кнопку кошика */}
          <button className={styles.actionBtn} onClick={onCartOpen} aria-label="Cart">
            <ShoppingBag size={22} />
            <span className={styles.cartBadge}>{totalItems}</span>
          </button>
        </div>
      </div>
    </header>
  );
};