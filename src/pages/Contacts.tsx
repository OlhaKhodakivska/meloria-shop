// src/pages/Contacts.tsx
import React from 'react';
import styles from './InfoPages.module.css';

export const Contacts: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Контакти</h1>
    <div className={styles.content}>
      <p>Ми завжди раді поспілкуватися, відповісти на ваші запитання або допомогти з вибором.</p>

      <h2>Зв'язатися з нами:</h2>

      <p>
        <strong>Телефон: </strong>
        <a href="tel:+380957064090" className={styles.link}>
          +38 (095) 706-40-90
        </a>{' '}
        (Пн-Пт: 09:00 - 18:00)
      </p>

      <p>
        <strong>Email: </strong>
        <a href="mailto:info@meloria.pp.ua" className={styles.link}>
          info@meloria.pp.ua
        </a>
      </p>

      {/*
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
      */}
    </div>
  </div>
);
