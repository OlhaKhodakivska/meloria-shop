// src/pages/Contacts.tsx
import React from 'react';
import styles from './InfoPages.module.css';

export const Contacts: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Контакти</h1>
    <div className={styles.content}>
      <p>Ми завжди раді поспілкуватися, відповісти на ваші запитання або допомогти з вибором.</p>

      <h3>Зв'язатися з нами:</h3>

      <p>
        <strong>Телефон: </strong>
        <a href="tel:+380997064090" className={styles.link}>
          +38 (099) 706-40-90
        </a>{' '}
        (Пн-Пт: 09:00 - 18:00)
      </p>

      <p>
        <strong>Email: </strong>
        <a href="mailto:info@meloria.shop" className={styles.link}>
          info@meloria.shop
        </a>
      </p>

      <p>
        <strong>Instagram: </strong>
        <a
          href="https://instagram.com/meloria.shop"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          @meloria.shop
        </a>
      </p>
    </div>
  </div>
);