// src/components/CartDrawer/CartDrawer.tsx
import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './CartDrawer.module.css';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* stopPropagation зупиняє закриття кошика при кліку всередині самої панелі */}
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Кошик</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag size={48} className={styles.emptyIcon} />
              <p>Ваш кошик порожній</p>
              <button className={styles.continueBtn} onClick={onClose}>Продовжити покупки</button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={item.product.id} className={styles.item}>
                  <img src={item.product.imageUrl} alt={item.product.title} className={styles.itemImg} />

                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>{item.product.title}</h4>
                    <span className={styles.itemPrice}>{item.product.price} ₴</span>

                    <div className={styles.itemActions}>
                      <div className={styles.quantityControls}>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <button className={styles.deleteBtn} onClick={() => removeFromCart(item.product.id)}>
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
              <span>Разом к сплаті:</span>
              <span className={styles.totalPrice}>{totalPrice} ₴</span>
            </div>
            <button
            className={styles.checkoutBtn}
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}>
              Оформити замовлення
            </button>
          </div>
        )}
      </div>
    </div>
  );
};