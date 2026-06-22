// src/components/Header/Header.tsx
import React, { useState } from 'react';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/cartContextValue';
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
  const baseUrl = import.meta.env.BASE_URL;
  const closeMenu = () => setIsMenuOpen(false);

  const handleCartOpen = () => {
    closeMenu();
    onCartOpen();
  };

  const handleProfileOpen = () => {
    closeMenu();
    navigate(`${baseUrl}auth`);
  };

  const handleLogoClick = () => {
    closeMenu();
    navigate(baseUrl);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button
          className={styles.burger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          type="button"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>


        <div className={styles.logo} onClick={handleLogoClick}>
          MELORIA<span className={styles.star}>✦</span>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>

          <ul className={styles.navList}>
            <li><Link to={baseUrl} className={styles.navLink} onClick={closeMenu}>Каталог</Link></li>
            <li><Link to={`${baseUrl}about`} className={styles.navLink} onClick={closeMenu}>Про нас</Link></li>
            <li><Link to={`${baseUrl}delivery`} className={styles.navLink} onClick={closeMenu}>Доставка та оплата</Link></li>
            <li><Link to={`${baseUrl}contacts`} className={styles.navLink} onClick={closeMenu}>Контакти</Link></li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleProfileOpen} aria-label="Profile" type="button">
            <User size={22} />
          </button>

          {/* Додали onClick={onCartOpen} на кнопку кошика */}
          <button className={styles.actionBtn} onClick={handleCartOpen} aria-label="Cart" type="button">
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
