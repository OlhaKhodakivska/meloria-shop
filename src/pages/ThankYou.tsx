import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './InfoPages.module.css';

const paymentDetails = {
  recipient: import.meta.env.VITE_PAYMENT_RECIPIENT || 'Уточнюється менеджером',
  card: import.meta.env.VITE_PAYMENT_CARD_NUMBER || 'Уточнюється менеджером',
  iban: import.meta.env.VITE_PAYMENT_IBAN || 'Уточнюється менеджером',
  taxId: import.meta.env.VITE_PAYMENT_TAX_ID || 'Уточнюється менеджером',
  purpose: import.meta.env.VITE_PAYMENT_PURPOSE || 'Уточнюється менеджером'
};

export const ThankYou: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Дякуємо за замовлення!</h1>
      <div className={styles.content}>
        {orderId && <p>Номер заявки: <strong>{orderId}</strong></p>}
        <p>
          Ми отримали ваше замовлення. Менеджер MELORIA зв'яжеться з вами для
          підтвердження наявності товарів і доставки.
        </p>

        <h3>Оплата</h3>
        <p>
          Замовлення оплачується за умовами <strong>100% передплати</strong> на
          номер картки або IBAN.
        </p>
        <ul>
          <li><strong>Отримувач:</strong> {paymentDetails.recipient}</li>
          <li><strong>IBAN:</strong> {paymentDetails.iban}</li>
          <li><strong>ІПН/ЄДРПОУ:</strong> {paymentDetails.taxId}</li>
          <li><strong>Призначення платежу:</strong> {paymentDetails.purpose}</li>
          <li><strong>Картка:</strong> {paymentDetails.card}</li>
        </ul>

        <Link className={styles.link} to={import.meta.env.BASE_URL}>
          Повернутися до магазину
        </Link>
      </div>
    </div>
  );
};
