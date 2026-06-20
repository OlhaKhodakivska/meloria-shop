import React from 'react';
import styles from './InfoPages.module.css';

export const Delivery: React.FC = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Доставка та оплата</h1>
    <div className={styles.content}>
      <h3>Доставка по Україні</h3>
      <p>Ми здійснюємо доставку в будь-який куточок України за допомогою провідних логістичних служб:</p>
      <ul>
        <li><strong>Нова Пошта</strong> (у відділення, поштомат або кур'єром) — 1-3 дні.</li>
        <li><strong>Укрпошта</strong> (стандартна доставка) — 3-5 днів.</li>
      </ul>
      <h3>Способи оплати</h3>
      <ul>
        <li><strong>Передплата на картку:</strong> Оплата за реквізитами після підтвердження замовлення (дозволяє зекономити на комісії за накладений платіж).</li>
        <li><strong>Накладений платіж:</strong> Оплата готівкою або карткою безпосередньо під час отримання товару у відділенні.</li>
      </ul>
    </div>
  </div>
);