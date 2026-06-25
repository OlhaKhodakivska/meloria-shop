// src/components/ProductCard/ProductCard.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../types/product';
import { useCart } from '../../context/cartContextValue'; // Імпортуємо хук кошика
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cartItems } = useCart(); // Беремо функцію додавання
  const productQuantity = cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const isInCart = productQuantity > 0;
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const currentImage = images[selectedImageIndex] || images[0];
  const hasImage = Boolean(currentImage) && !failedImages.includes(currentImage);

  const openGallery = () => {
    if (hasImage) {
      setIsGalleryOpen(true);
    }
  };

  const showPreviousImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  };

  const markImageAsFailed = (imageUrl: string) => {
    setFailedImages((currentImages) =>
      currentImages.includes(imageUrl) ? currentImages : [...currentImages, imageUrl]
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <button
            className={styles.imageButton}
            onClick={openGallery}
            type="button"
            aria-label={`Розглянути фото товару ${product.title}`}
          >
            <img
              src={currentImage}
              alt={product.title}
              className={styles.image}
              onError={() => markImageAsFailed(currentImage)}
            />
          </button>
        ) : (
          <div className={styles.imageFallback}>Фото скоро буде</div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>

        <div className={styles.footer}>
          <span className={styles.price}>{product.price} ₴</span>
          {/* Додаємо подію onClick */}
          <button
            className={`${styles.buyButton} ${isInCart ? styles.buyButtonActive : ''}`}
            onClick={() => addToCart(product)}
            aria-label={isInCart ? `У кошику ${productQuantity} шт.` : 'Додати до кошика'}
            type="button"
          >
            <ShoppingCart size={18} />
            <span>{isInCart ? 'У кошику' : 'До кошика'}</span>
            {isInCart && <span className={styles.quantityBadge}>{productQuantity}</span>}
          </button>
        </div>
      </div>

      {isGalleryOpen && hasImage && (
        <div className={styles.galleryOverlay} role="dialog" aria-modal="true">
          <button
            className={styles.galleryBackdrop}
            onClick={() => setIsGalleryOpen(false)}
            type="button"
            aria-label="Закрити перегляд фото"
          />
          <div className={styles.gallery}>
            <button
              className={styles.closeButton}
              onClick={() => setIsGalleryOpen(false)}
              type="button"
              aria-label="Закрити"
            >
              <X size={22} />
            </button>

            {images.length > 1 && (
              <button
                className={`${styles.galleryControl} ${styles.galleryControlPrev}`}
                onClick={showPreviousImage}
                type="button"
                aria-label="Попереднє фото"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img
              src={currentImage}
              alt={product.title}
              className={styles.galleryImage}
              onError={() => markImageAsFailed(currentImage)}
            />

            {images.length > 1 && (
              <button
                className={`${styles.galleryControl} ${styles.galleryControlNext}`}
                onClick={showNextImage}
                type="button"
                aria-label="Наступне фото"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <div className={styles.galleryCaption}>
              <span>{product.title}</span>
              {images.length > 1 && (
                <span>
                  {selectedImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
