// src/pages/Checkout/Checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cartContextValue';
import styles from './Checkout.module.css';

export const Checkout: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;

  // Стани для полів форми
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    delivery: 'nova_poshta',
    warehouse: '',
    payment: 'card_prepayment'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Сценарій відправки форми
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    // Тут у майбутньому буде запит до бекенду!
    console.log('Замовлення оформлено:', { formData, items: cartItems, total: totalPrice });

    setIsSubmitted(true);
    clearCart(); // Очищаємо кошик після успішного замовлення
  };

  if (isSubmitted) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✦</div>
          <h2>Дякуємо за замовлення!</h2>
          <p>Менеджер <strong>MELORIA</strong> зв'яжеться з вами найближчим часом для підтвердження.</p>
          <button onClick={() => navigate(baseUrl)} className={styles.homeBtn} type="button">Повернутись до магазину</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Оформлення замовлення</h1>

      <div className={styles.checkoutLayout}>
        {/* ЛІВА ЧАСТИНА: Форма даних */}
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h3 className={styles.sectionTitle}>1. Контактні дані</h3>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Прізвище та Ім'я *</label>
            <input
              type="text" id="name" required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Іванов Іван"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Номер телефону *</label>
            <input
              type="tel" id="phone" required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+380"
            />
          </div>

          <h3 className={styles.sectionTitle}>2. Спосіб доставки</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio" name="delivery" value="nova_poshta"
                checked={formData.delivery === 'nova_poshta'}
                onChange={(e) => setFormData({...formData, delivery: e.target.value})}
              />
              <span>Нова Пошта</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio" name="delivery" value="ukr_poshta"
                checked={formData.delivery === 'ukr_poshta'}
                onChange={(e) => setFormData({...formData, delivery: e.target.value})}
              />
              <span>Укрпошта</span>
            </label>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="city">Місто *</label>
            <input
              type="text" id="city" required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Назва міста"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="warehouse">Відділення / Поштомат *</label>
            <input
              type="text" id="warehouse" required
              value={formData.warehouse}
              onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
              placeholder="Відділення №1"
            />
          </div>

          <h3 className={styles.sectionTitle}>3. Спосіб оплати</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio" name="payment" value="card_prepayment"
                checked={formData.payment === 'card_prepayment'}
                onChange={(e) => setFormData({...formData, payment: e.target.value})}
              />
              <span>Передплата на картку</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio" name="payment" value="cod"
                checked={formData.payment === 'cod'}
                onChange={(e) => setFormData({...formData, payment: e.target.value})}
              />
              <span>Накладений платіж (післяплата при отриманні)</span>
            </label>
          </div>

          <button type="submit" disabled={cartItems.length === 0} className={styles.submitOrderBtn}>
            Підтвердити замовлення
          </button>
        </form>

        {/* ПРАВА ЧАСТИНА: Склад замовлення */}
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Ваше замовлення</h3>

          {cartItems.length === 0 ? (
            <p className={styles.emptyText}>У кошику немає товарів. Поверніться до каталогу.</p>
          ) : (
            <>
              <div className={styles.summaryItems}>
                {cartItems.map((item) => (
                  <div key={item.product.id} className={styles.summaryItem}>
                    <img src={item.product.imageUrl} alt={item.product.title} />
                    <div className={styles.summaryItemInfo}>
                      <h4>{item.product.title}</h4>
                      <p>{item.quantity} шт. × {item.product.price} ₴</p>
                    </div>
                    <span className={styles.itemSum}>{item.product.price * item.quantity} ₴</span>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span>Всього до сплати:</span>
                <span className={styles.totalPrice}>{totalPrice} ₴</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
