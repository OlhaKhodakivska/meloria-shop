// src/components/Header/Header.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react'; // Додали Search
import { useAuth, UserButton } from '@clerk/clerk-react';
import { useCart } from '../../context/cartContextValue';
import styles from './Header.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onCartOpen: () => void;
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const AccountEntry: React.FC<{ onProfileOpen: () => void }> = ({ onProfileOpen }) => (
  <button
    className={`${styles.actionBtn} ${styles.accountBtn}`}
    onClick={onProfileOpen}
    aria-label="Особистий кабінет"
    title="Вхід та реєстрація"
    type="button"
  >
    <User size={22} />
    <span className={styles.accountLabel}>Вхід</span>
  </button>
);

const ClerkAccountButton: React.FC<{ onProfileOpen: () => void }> = ({ onProfileOpen }) => {
  const { isSignedIn } = useAuth();

  // Keep the account entry available while Clerk determines the session state.
  return isSignedIn ? (
    <div className={styles.clerkUserButton}>
      <UserButton afterSignOutUrl={import.meta.env.BASE_URL} />
    </div>
  ) : <AccountEntry onProfileOpen={onProfileOpen} />;
};

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const [searchDraft, setSearchDraft] = useState<string | null>(null);

  const { totalItems } = useCart();
  const catalogUrl = '/?view=all#catalog';
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const searchQueryFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || '';
  }, [location.search]);
  const searchQuery = searchDraft ?? searchQueryFromUrl;

  const handleCartOpen = () => {
    closeMenu();
    onCartOpen();
  };

  const handleProfileOpen = () => {
    closeMenu();
    navigate('/auth');
  };

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusFrame = isMenuOpen
      ? window.requestAnimationFrame(() => menuRef.current?.querySelector('input')?.focus())
      : undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      if (focusFrame !== undefined) window.cancelAnimationFrame(focusFrame);
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', handleEscape);
      if (isMenuOpen && previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isMenuOpen, closeMenu]);

  // Submit the same search query from the desktop header or mobile menu.
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}#catalog`);
      setSearchDraft(null);
      closeMenu();
    }
  };

  const renderSearchForm = (className: string, placeholder: string) => (
    <form onSubmit={handleSearchSubmit} className={`${styles.searchForm} ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        aria-label="Пошук товарів"
        value={searchQuery}
        onChange={(e) => setSearchDraft(e.target.value)}
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
          aria-label="Відкрити або закрити меню"
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          type="button"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className={styles.logo} onClick={closeMenu} aria-label="MELORIA — головна сторінка">
          MELORIA<span className={styles.star} aria-hidden="true">✦</span>
        </Link>

        {isMenuOpen && (
          <button
            className={styles.backdrop}
            type="button"
            aria-label="Закрити меню"
            onClick={closeMenu}
          />
        )}

        <nav
          ref={menuRef}
          id="main-navigation"
          aria-label="Основна навігація"
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
        >
          <div className={styles.mobileMenuHeader}>
            <span>Меню</span>
            <button className={styles.mobileCloseBtn} onClick={closeMenu} aria-label="Закрити меню" type="button">
              <X size={22} />
            </button>
          </div>

          {renderSearchForm(styles.mobileSearch, 'Пошук товарів...')}

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
          <div className={styles.account}>
            {clerkPublishableKey ? (
              <ClerkAccountButton onProfileOpen={handleProfileOpen} />
            ) : (
              <AccountEntry onProfileOpen={handleProfileOpen} />
            )}
          </div>

          {/* Кошик */}
          <button className={styles.actionBtn} onClick={handleCartOpen} aria-label="Кошик" type="button">
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
