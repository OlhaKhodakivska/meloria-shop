// src/components/ProductCard/ProductCard.tsx
import React, { useEffect, useState } from 'react';
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const currentImage = images[selectedImageIndex] || images[0];
  const hasImage = Boolean(currentImage) && !failedImages.includes(currentImage);

  const openDetails = () => {
    setIsDetailOpen(true);
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

  useEffect(() => {
    if (!isDetailOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDetailOpen]);

  const cartButtonLabel = isInCart ? 'У кошику' : 'До кошика';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {hasImage ? (
          <button
            className={styles.imageButton}
            onClick={openDetails}
            type="button"
            aria-label={`Відкрити товар ${product.title}`}
          >
            <img
              src={currentImage}
              alt={product.title}
              className={styles.image}
              onError={() => markImageAsFailed(currentImage)}
            />
          </button>
        ) : (
          <button
            className={styles.imageFallbackButton}
            onClick={openDetails}
            type="button"
            aria-label={`Відкрити товар ${product.title}`}
          >
            Фото скоро буде
          </button>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <button className={styles.detailsButton} onClick={openDetails} type="button">
          <span className={styles.title}>{product.title}</span>
          <span className={styles.description}>{product.description || 'Детальніше про товар'}</span>
          <span className={styles.moreLink}>Детальніше</span>
        </button>

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
            <span>{cartButtonLabel}</span>
            {isInCart && <span className={styles.quantityBadge}>{productQuantity}</span>}
          </button>
        </div>
      </div>

      {isDetailOpen && (
        <div className={styles.galleryOverlay} role="dialog" aria-modal="true" aria-labelledby={`product-${product.id}-title`}>
          <button
            className={styles.galleryBackdrop}
            onClick={() => setIsDetailOpen(false)}
            type="button"
            aria-label="Закрити перегляд товару"
          />
          <div className={styles.productDialog}>
            <button
              className={styles.closeButton}
              onClick={() => setIsDetailOpen(false)}
              type="button"
              aria-label="Закрити"
            >
              <X size={22} />
            </button>

            <div className={styles.detailMedia}>
              {hasImage ? (
                <>
                  <div className={styles.detailImageFrame}>
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
                  </div>

                  {images.length > 1 && (
                    <div className={styles.thumbnails} aria-label="Фото товару">
                      {images.map((imageUrl, imageIndex) => (
                        <button
                          className={`${styles.thumbnailButton} ${imageIndex === selectedImageIndex ? styles.thumbnailButtonActive : ''}`}
                          key={imageUrl}
                          onClick={() => setSelectedImageIndex(imageIndex)}
                          type="button"
                          aria-label={`Фото ${imageIndex + 1}`}
                        >
                          <img src={imageUrl} alt="" onError={() => markImageAsFailed(imageUrl)} />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.detailImageFallback}>Фото скоро буде</div>
              )}
            </div>

            <div className={styles.detailInfo}>
              <span className={styles.detailCategory}>{product.category}</span>
              <h2 id={`product-${product.id}-title`} className={styles.detailTitle}>{product.title}</h2>
              <div className={styles.detailPrice}>{product.price} ₴</div>

              <div className={styles.detailDescription}>
                <h3>Опис</h3>
                <p>{product.description || 'Опис товару буде додано найближчим часом.'}</p>
              </div>

              <button
                className={`${styles.detailBuyButton} ${isInCart ? styles.buyButtonActive : ''}`}
                onClick={() => addToCart(product)}
                type="button"
              >
                <ShoppingCart size={18} />
                <span>{cartButtonLabel}</span>
                {isInCart && <span className={styles.quantityBadge}>{productQuantity}</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
