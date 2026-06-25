// src/components/Header/Header.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react'; // Додали Search
import { useCart } from '../../context/cartContextValue';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onCartOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Стан для пошукового запиту

  const { totalItems } = useCart();
  const baseUrl = import.meta.env.BASE_URL;
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // ТИМЧАСОВА заглушка для перевірки аватарки (коли підключимо Supabase, братимемо це з контексту)
  // Зміни значення на true, щоб протестувати вигляд з аватаркою
  const isLoggedIn = false;
  const userEmail = "olha.khodakivska@gmail.com";

  // Функція для отримання першої літери пошти для аватарки
  const getUserInitial = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

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

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, closeMenu]);

  // Обробник пошуку (спрацьовує при натисканні Enter або втраті фокусу)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Коли буде реалізовано фільтр, ми можемо передавати query в URL, наприклад: /?search=сумка
      navigate(`${baseUrl}?search=${encodeURIComponent(searchQuery.trim())}`);
      closeMenu();
    }
  };

  const renderSearchForm = (className: string, placeholder: string) => (
    <form onSubmit={handleSearchSubmit} className={`${styles.searchForm} ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchBtn} aria-label="Пошук">
        <Search size={20} />
      </button>
    </form>
  );

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

        {isMenuOpen && (
          <button
            className={styles.backdrop}
            type="button"
            aria-label="Закрити меню"
            onClick={closeMenu}
          />
        )}

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <div className={styles.mobileMenuHeader}>
            <span>Меню</span>
            <button className={styles.mobileCloseBtn} onClick={closeMenu} aria-label="Закрити меню" type="button">
              <X size={22} />
            </button>
          </div>

          <ul className={styles.navList}>
            <li><Link to={baseUrl} className={styles.navLink} onClick={closeMenu}>Каталог</Link></li>
            <li><Link to={`${baseUrl}about`} className={styles.navLink} onClick={closeMenu}>Про нас</Link></li>
            <li><Link to={`${baseUrl}delivery`} className={styles.navLink} onClick={closeMenu}>Доставка та оплата</Link></li>
            <li><Link to={`${baseUrl}contacts`} className={styles.navLink} onClick={closeMenu}>Контакти</Link></li>
          </ul>

          <div className={styles.mobileMenuFooter}>
            <button className={styles.mobileProfileBtn} onClick={handleProfileOpen} type="button">
              <User size={18} />
              Особистий кабінет
            </button>
            <button className={styles.mobileCartBtn} onClick={handleCartOpen} type="button">
              <ShoppingBag size={18} />
              Кошик
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
        </nav>

        <div className={styles.actions}>
          {/* Блок пошуку */}
          {renderSearchForm(styles.desktopSearch, 'Пошук товарів...')}

          {/* Кнопка профілю / Аватарка клієнта */}
          <button className={styles.actionBtn} onClick={handleProfileOpen} aria-label="Profile" type="button">
            {isLoggedIn ? (
              // Кружечок з першою літерою email, якщо користувач увійшов
              <div className={styles.avatarBadge}>
                {getUserInitial(userEmail)}
              </div>
            ) : (
              // Звичайна іконка, якщо гість
              <User size={22} />
            )}
          </button>

          {/* Кошик */}
          <button className={styles.actionBtn} onClick={handleCartOpen} aria-label="Cart" type="button">
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
