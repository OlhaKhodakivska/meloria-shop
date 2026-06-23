// src/components/CartDrawer/CartDrawer.tsx
import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/cartContextValue';
import styles from './CartDrawer.module.css';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  // Додали toggleSelect з нашого оновленого контексту!
  const { cartItems, updateQuantity, removeFromCart, totalPrice, toggleSelect } = useCart();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;

  // Перевіряємо, чи є хоча б один вибраний товар, щоб активувати кнопку замовлення
  const hasSelectedItems = cartItems.some(item => item.selected);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Кошик</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart" type="button">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} className={styles.emptyIcon} />
              <p>Ваш кошик порожній</p>
              <button className={styles.continueBtn} onClick={onClose} type="button">Продовжити покупки</button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                /* Якщо товар не вибраний, додаємо клас itemUnselected для красивого затемнення */
                <div
                  key={item.product.id}
                  className={`${styles.item} ${!item.selected ? styles.itemUnselected : ''}`}
                >
                  {/* КВАДРАТИК-ЧЕКБОКС ДЛЯ ВИБОРУ ТОВАРУ */}
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.product.id)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.customCheckbox}></span>
                  </label>

                  <img src={item.product.imageUrl} alt={item.product.title} className={styles.itemImg} />

                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>{item.product.title}</h4>
                    <span className={styles.itemPrice}>{item.product.price} ₴</span>

                    <div className={styles.itemActions}>
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Зменшити кількість"
                          type="button"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Збільшити кількість"
                          type="button"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Видалити товар"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Разом до сплати:</span>
              <span className={styles.totalPrice}>{totalPrice} ₴</span>
            </div>
            <button
              className={styles.checkoutBtn}
              type="button"
              disabled={!hasSelectedItems} // Блокуємо кнопку, якщо жоден товар не вибрано
              onClick={() => {
                if (hasSelectedItems) {
                  onClose();
                  navigate(`${baseUrl}checkout`);
                }
              }}
            >
              Оформити замовлення
            </button>
          </div>
        )}
      </div>
    </div>
  );
};