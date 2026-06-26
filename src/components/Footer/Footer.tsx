// src/components/Footer/Footer.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > 2026 ? `2026-${currentYear}` : '2026';
  const baseUrl = import.meta.env.BASE_URL;
  const catalogUrl = `${baseUrl}?view=all#catalog`;

  const handleLogoClick = () => {
    navigate(baseUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        {/* Стовпчик 1: Брендинг та соцмережі */}
        <div className={styles.columnBrand}>
          <h3 className={styles.logo} onClick={handleLogoClick}>
            MELORIA<span className={styles.star}>✦</span>
          </h3>
          <p className={styles.brandDescription}>
            Речі, які створюють емоції та залишають приємні спогади.
          </p>
          <div className={styles.socials}>
            {/* Instagram */}
            <a href="https://instagram.com/meloria.shop" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            {/* TikTok */}
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
            </a>
          </div>
        </div>

        {/* Стовпчик 2: Покупцям */}
        <div className={styles.column}>
          <h4>Покупцям</h4>
          <ul>
            <li><Link to={catalogUrl}>Каталог</Link></li>
            <li><Link to={`${baseUrl}delivery`}>Доставка та оплата</Link></li>
            <li><Link to={`${baseUrl}returns-exchange`}>Повернення та обмін</Link></li>
            <li><a href="#faq" onClick={(e) => e.preventDefault()}>Питання та відповіді</a></li>
          </ul>
        </div>

        {/* Стовпчик 3: Інформація */}
        <div className={styles.column}>
          <h4>Інформація</h4>
          <ul>
            <li><Link to={`${baseUrl}about`}>Про нас</Link></li>
            <li><Link to={`${baseUrl}contacts`}>Контакти</Link></li>
            <li><Link to={`${baseUrl}privacy-policy`}>Політика конфіденційності</Link></li>
            <li><Link to={`${baseUrl}terms-of-use`}>Умови користування</Link></li>
          </ul>
        </div>

      </div>

      <hr className={styles.divider} />

      {/* Нижня плашка футера */}
      <div className={styles.bottomSection}>
        <div className={styles.legalInfo}>
          <span>&copy; {displayYear} Meloria. Усі права захищені.</span>
          <span className={styles.fopSubtext}>ФОП Ходаківська О. С.</span>
        </div>
        <div className={styles.madeIn}>
          Зроблено з <span className={styles.heart}>❤️</span> в Україні <span className={styles.flag}>🇺🇦</span>
        </div>
      </div>
    </footer>
  );
};
