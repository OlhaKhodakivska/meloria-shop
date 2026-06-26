// src/components/Header/Header.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react'; // Додали Search
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useCart } from '../../context/cartContextValue';
import styles from './Header.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onCartOpen: () => void;
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const ClerkAccountButton: React.FC<{ onProfileOpen: () => void }> = ({ onProfileOpen }) => (
  <>
    <SignedIn>
      <div className={styles.clerkUserButton}>
        <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
      </div>
    </SignedIn>
    <SignedOut>
      <button className={styles.actionBtn} onClick={onProfileOpen} aria-label="Profile" type="button">
        <User size={22} />
      </button>
    </SignedOut>
  </>
);

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Стан для пошукового запиту

  const { totalItems } = useCart();
  const catalogUrl = '/?view=all#catalog';
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleCartOpen = () => {
    closeMenu();
    onCartOpen();
  };

  const handleProfileOpen = () => {
    closeMenu();
    navigate('/auth');
  };

  const handleLogoClick = () => {
    closeMenu();
    navigate('/');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

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
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}#catalog`);
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
            <li><Link to={catalogUrl} className={styles.navLink} onClick={closeMenu}>Каталог</Link></li>
            <li><Link to="/about" className={styles.navLink} onClick={closeMenu}>Про нас</Link></li>
            <li><Link to="/delivery" className={styles.navLink} onClick={closeMenu}>Доставка та оплата</Link></li>
            <li><Link to="/contacts" className={styles.navLink} onClick={closeMenu}>Контакти</Link></li>
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

          {/* Кнопка профілю / меню клієнта */}
          {clerkPublishableKey ? (
            <ClerkAccountButton onProfileOpen={handleProfileOpen} />
          ) : (
            <button className={styles.actionBtn} onClick={handleProfileOpen} aria-label="Profile" type="button">
              <User size={22} />
            </button>
          )}

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
