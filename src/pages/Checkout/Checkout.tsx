// src/pages/Checkout/Checkout.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cartContextValue';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import styles from './Checkout.module.css';

const paymentDetails = {
  recipient: import.meta.env.VITE_PAYMENT_RECIPIENT || 'Уточнюється менеджером',
  card: import.meta.env.VITE_PAYMENT_CARD_NUMBER || 'Уточнюється менеджером',
  iban: import.meta.env.VITE_PAYMENT_IBAN || 'Уточнюється менеджером',
  taxId: import.meta.env.VITE_PAYMENT_TAX_ID || 'Уточнюється менеджером',
  purpose: import.meta.env.VITE_PAYMENT_PURPOSE || 'Уточнюється менеджером'
};

export const Checkout: React.FC = () => {
  const { cartItems, clearOrderedItems } = useCart();
  const navigate = useNavigate();
  const selectedCartItems = cartItems.filter((item) => item.selected);
  const selectedTotalPrice = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Стани для полів форми
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    delivery: 'nova_poshta',
    warehouse: '',
    payment: 'card_prepayment',
    comment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Сценарій відправки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (selectedCartItems.length === 0) return;

    if (!isSupabaseConfigured || !supabase) {
      setSubmitError('Supabase ще не налаштований. Додайте VITE_SUPABASE_URL та VITE_SUPABASE_ANON_KEY у .env.');
      return;
    }

    setIsSubmitting(true);

    const orderItems = selectedCartItems.map((item) => ({
      product_id: item.product.id,
      title: item.product.title,
      category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
      image_url: item.product.imageUrl
    }));

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim(),
        delivery_method: formData.delivery,
        delivery_city: formData.city.trim(),
        delivery_branch: formData.warehouse.trim(),
        payment_method: formData.payment,
        payment_status: 'awaiting_prepayment',
        payment_details: formData.payment === 'card_prepayment'
          ? {
              type: 'card',
              recipient: paymentDetails.recipient,
              card: paymentDetails.card,
              purpose: paymentDetails.purpose
            }
          : {
              type: 'iban',
              recipient: paymentDetails.recipient,
              iban: paymentDetails.iban,
              tax_id: paymentDetails.taxId,
              purpose: paymentDetails.purpose
            },
        comment: formData.comment.trim(),
        items: orderItems,
        total_amount: selectedTotalPrice,
        status: 'new'
      })
      .select('id')
      .single();

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    clearOrderedItems();
    navigate(`/thank-you${data?.id ? `?order=${encodeURIComponent(String(data.id))}` : ''}`);
  };

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
            <label htmlFor="email">Електронна пошта *</label>
            <input
              type="email" id="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@mail.com"
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
              <span>100% передплата на картку</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio" name="payment" value="iban_prepayment"
                checked={formData.payment === 'iban_prepayment'}
                onChange={(e) => setFormData({...formData, payment: e.target.value})}
              />
              <span>100% передплата на IBAN</span>
            </label>
          </div>

          <div className={styles.paymentNotice}>
            <strong>Реквізити для оплати:</strong>
            <span>Оплата замовлення здійснюється за умовами 100% передоплати.</span>
            <span><strong>Отримувач:</strong> {paymentDetails.recipient}</span>
            <span><strong>IBAN:</strong> {paymentDetails.iban}</span>
            <span><strong>ІПН/ЄДРПОУ:</strong> {paymentDetails.taxId}</span>
            <span><strong>Призначення платежу:</strong> {paymentDetails.purpose}</span>
            <span><strong>Картка:</strong> {paymentDetails.card}</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="comment">Коментар до замовлення</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              placeholder="Побажання щодо доставки або замовлення"
              rows={4}
            />
          </div>

          {submitError && <p className={styles.errorText}>{submitError}</p>}

          <button type="submit" disabled={selectedCartItems.length === 0 || isSubmitting} className={styles.submitOrderBtn}>
            {isSubmitting ? 'Надсилаємо заявку...' : 'Підтвердити замовлення'}
          </button>
        </form>

        {/* ПРАВА ЧАСТИНА: Склад замовлення */}
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>Ваше замовлення</h3>

          {selectedCartItems.length === 0 ? (
            <p className={styles.emptyText}>У кошику немає товарів. Поверніться до каталогу.</p>
          ) : (
            <>
              <div className={styles.summaryItems}>
                {selectedCartItems.map((item) => (
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
                <span className={styles.totalPrice}>{selectedTotalPrice} ₴</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
