// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { Hero } from '../components/Hero/Hero';
import { PromoBanner } from '../components/PromoBanner/PromoBanner';
import type { Product } from '../types/product';
import { Gift, Truck, ShieldCheck, Heart } from 'lucide-react';
import styles from './Home.module.css';

type CatalogView = 'featured' | 'all' | 'new';

const NEW_PRODUCTS_LIMIT = 48;
const FEATURED_PRODUCTS_LIMIT = 12;

const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase('uk');

const getProductIdNumber = (productId: string) => {
  const parsedId = Number(productId);
  return Number.isFinite(parsedId) ? parsedId : 0;
};

const getMostExpensiveProduct = (products: Product[]) =>
  [...products].sort((firstProduct, secondProduct) => secondProduct.price - firstProduct.price)[0];

const getFeaturedProducts = (products: Product[], limit: number) => {
  if (products.length === 0) {
    return [];
  }

  const mostExpensiveProduct = getMostExpensiveProduct(products);
  const randomProducts = [...products]
    .filter((product) => product.id !== mostExpensiveProduct.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, limit - 1);

  return [mostExpensiveProduct, ...randomProducts];
};

export const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL;

  // Стейт для збереження активної категорії
  const [activeCategory, setActiveCategory] = useState('Всі');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState('');

  // Список усіх унікальних категорій + варіант "Всі"
  const categories = useMemo(() => {
    const preferredOrder = [
      'Сумки та шопери',
      'Подушки',
      'Косметички',
      'Годинники',
      'Канцелярія',
      'Килимки',
      'Ключниці',
      'Листівки',
      'Маски для сну'
    ];
    const productCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
    const orderedCategories = [
      ...preferredOrder.filter((category) => productCategories.includes(category)),
      ...productCategories
        .filter((category) => !preferredOrder.includes(category))
        .sort((firstCategory, secondCategory) => firstCategory.localeCompare(secondCategory, 'uk'))
    ];

    return ['Всі', ...orderedCategories];
  }, [products]);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const catalogView = useMemo<CatalogView>(() => {
    const requestedView = searchParams.get('view');

    return requestedView === 'all' || requestedView === 'new' ? requestedView : 'featured';
  }, [searchParams]);

  const selectedCatalogCategory = useMemo(() => {
    const category = searchParams.get('category');
    return category && categories.includes(category) && category !== 'Всі' ? category : null;
  }, [categories, searchParams]);

  const searchQuery = useMemo(
    () => normalizeSearchText(searchParams.get('search') || ''),
    [searchParams]
  );

  const categoryCards = useMemo(
    () =>
      categories
        .filter((category) => category !== 'Всі')
        .map((category) => {
          const categoryProducts = products.filter((product) => product.category === category);
          const coverProduct =
            categoryProducts.find((product) => product.imageUrl) ||
            categoryProducts[0];

          return {
            category,
            count: categoryProducts.length,
            coverProduct
          };
        }),
    [categories, products]
  );

  const newProducts = useMemo(
    () =>
      [...products]
        .sort((firstProduct, secondProduct) =>
          getProductIdNumber(secondProduct.id) - getProductIdNumber(firstProduct.id)
        )
        .slice(0, NEW_PRODUCTS_LIMIT),
    [products]
  );
  const featuredProducts = useMemo(
    () => getFeaturedProducts(products, FEATURED_PRODUCTS_LIMIT),
    [products]
  );

  useEffect(() => {
    let ignore = false;

    fetch(`${baseUrl}products.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не вдалося завантажити каталог товарів.');
        }

        return response.json() as Promise<Product[]>;
      })
      .then((loadedProducts) => {
        if (!ignore) {
          setProducts(loadedProducts);
          setProductsError('');
        }
      })
      .catch(() => {
        if (!ignore) {
          setProductsError('Не вдалося завантажити товари. Оновіть сторінку або спробуйте пізніше.');
        }
      });

    return () => {
      ignore = true;
    };
  }, [baseUrl]);

  useEffect(() => {
    if (location.hash === '#catalog') {
      window.requestAnimationFrame(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash, location.search]);

  const showCategory = (category: string) => {
    setActiveCategory(category);
    navigate('/#catalog');
  };

  const showAllProducts = () => {
    navigate('/?view=all#catalog');
  };

  const clearSearch = () => {
    navigate('/?view=all#catalog');
  };

  const showCatalogCategory = (category: string) => {
    navigate(`/?view=all&category=${encodeURIComponent(category)}#catalog`);
  };

  const filteredProducts = useMemo(() => {
    if (searchQuery) {
      return products.filter((product) => {
        const searchableText = normalizeSearchText(
          `${product.title} ${product.category} ${product.description}`
        );

        return searchableText.includes(searchQuery);
      });
    }

    if (catalogView === 'new') {
      return newProducts;
    }

    const selectedCategory = catalogView === 'all'
      ? selectedCatalogCategory || 'Всі'
      : activeCategory;
    const categoryProducts = selectedCategory === 'Всі'
      ? products
      : products.filter((product) => product.category === selectedCategory);

    return catalogView === 'all'
      ? categoryProducts
      : activeCategory === 'Всі'
        ? featuredProducts
        : categoryProducts.slice(0, FEATURED_PRODUCTS_LIMIT);
  }, [activeCategory, catalogView, featuredProducts, newProducts, products, searchQuery, selectedCatalogCategory]);

  const showCategoryCards = catalogView === 'all' && !selectedCatalogCategory && !searchQuery;

  const titleText = searchQuery
    ? `Пошук: ${searchParams.get('search')?.trim()}`
    : catalogView === 'new'
    ? 'Новинки'
    : catalogView === 'all'
      ? selectedCatalogCategory || 'Каталог'
      : activeCategory === 'Всі'
      ? 'Хіти продажів'
      : activeCategory;

  const headingActionText = searchQuery
    ? 'Очистити пошук'
    : catalogView === 'all' && selectedCatalogCategory
    ? 'Усі категорії'
    : 'Дивитись всі';

  const handleHeadingAction = searchQuery ? clearSearch : showAllProducts;

  return (
    <div className={styles.homeWrapper}>
      <Hero />

      {/* СЕКЦІЯ ПЕРЕВАГ */}
      <section className={styles.benefitsContainer}>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <Gift size={28} className={styles.benefitIcon} />
            <div>
              <h4>Оригінальні товари</h4>
              <p>Ретельно підібрані для вас</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Truck size={28} className={styles.benefitIcon} />
            <div>
              <h4>Швидка доставка</h4>
              <p>1-2 дні по Україні</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <ShieldCheck size={28} className={styles.benefitIcon} />
            <div>
              <h4>Безпечна оплата</h4>
              <p>100% передоплата карткою або IBAN</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <Heart size={28} className={styles.benefitIcon} />
            <div>
              <h4>Затишок у деталях</h4>
              <p>Товари для особливого дому</p>
            </div>
          </div>
        </div>
      </section>

      {/* СЕКЦІЯ КАТЕГОРІЙ (Популярні категорії з макету) */}
      <section className={styles.categoriesSection}>
        <h3 className={styles.categoriesTitle}>Популярні категорії ✦</h3>
        <div className={styles.categoriesTabs}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryTab} ${activeCategory === cat ? styles.activeTab : ''}`}
              onClick={() => showCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ГОЛОВНИЙ БЛОК ТОВАРІВ */}
      <main className={styles.main} id="catalog">
        <div className={styles.heading}>
          <h2 className={styles.title}>{titleText}</h2>
          <button className={styles.viewAllBtn} onClick={handleHeadingAction} type="button">
            {headingActionText} <span className={styles.arrow}>→</span>
          </button>
        </div>

        {showCategoryCards ? (
          <div className={styles.catalogCategoryGrid}>
            {categoryCards.map(({ category, count, coverProduct }) => (
              <button
                className={styles.catalogCategoryCard}
                key={category}
                onClick={() => showCatalogCategory(category)}
                type="button"
              >
                <span className={styles.catalogCategoryImageWrapper}>
                  {coverProduct?.imageUrl ? (
                    <img
                      src={coverProduct.imageUrl}
                      alt={category}
                      className={styles.catalogCategoryImage}
                    />
                  ) : (
                    <span className={styles.catalogCategoryFallback}>Фото скоро буде</span>
                  )}
                </span>
                <span className={styles.catalogCategoryInfo}>
                  <span className={styles.catalogCategoryLabel}>Категорія</span>
                  <span className={styles.catalogCategoryTitle}>{category}</span>
                  <span className={styles.catalogCategoryCount}>{count} товарів</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.productGrid}>
            {productsError ? (
              <div className={styles.emptySearch}>
                <h3>Каталог тимчасово недоступний</h3>
                <p>{productsError}</p>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptySearch}>
                <h3>Завантажуємо товари</h3>
                <p>Каталог з'явиться за мить.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.emptySearch}>
                <h3>Нічого не знайдено</h3>
                <p>Спробуйте інший запит або перегляньте весь каталог.</p>
                <button onClick={clearSearch} type="button">До каталогу</button>
              </div>
            )}
          </div>
        )}
      </main>

      <PromoBanner />
    </div>
  );
};
