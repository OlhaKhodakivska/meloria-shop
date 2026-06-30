import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './InfoPages.module.css';

const paymentDetails = {
  recipient: import.meta.env.VITE_PAYMENT_RECIPIENT || 'Ходаківська О. С.',
  card: import.meta.env.VITE_PAYMENT_CARD_NUMBER || '4441 1111 3361 0240',
  iban: import.meta.env.VITE_PAYMENT_IBAN || 'UA063220010000026206360427520'
};

export const ThankYou: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');
  const paymentMethod = params.get('payment') === 'iban' ? 'iban' : 'card';

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
        {paymentMethod === 'iban' ? (
          <>
            <p><strong>Оплата за IBAN:</strong></p>
            <ul>
              <li><strong>IBAN:</strong> {paymentDetails.iban}</li>
              <li><strong>Отримувач:</strong> {paymentDetails.recipient}</li>
            </ul>
          </>
        ) : (
          <>
            <p><strong>Оплата на картку:</strong></p>
            <ul>
              <li><strong>Картка:</strong> {paymentDetails.card}</li>
              <li><strong>Отримувач:</strong> {paymentDetails.recipient}</li>
            </ul>
          </>
        )}

        <Link className={styles.link} to={import.meta.env.BASE_URL}>
          Повернутися до магазину
        </Link>
      </div>
    </div>
  );
};
