import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './InfoPages.module.css';

const paymentCardNumber = import.meta.env.VITE_PAYMENT_CARD_NUMBER || 'буде надіслано менеджером';
const paymentIban = import.meta.env.VITE_PAYMENT_IBAN || 'буде надіслано менеджером';

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
          <li><strong>Картка:</strong> {paymentCardNumber}</li>
          <li><strong>IBAN:</strong> {paymentIban}</li>
        </ul>
        <p>
          У призначенні платежу вкажіть номер заявки або ваше ім'я та прізвище.
        </p>

        <Link className={styles.link} to={import.meta.env.BASE_URL}>
          Повернутися до магазину
        </Link>
      </div>
    </div>
  );
};
