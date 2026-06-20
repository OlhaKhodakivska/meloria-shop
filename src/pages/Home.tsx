// src/pages/Home.tsx
import React from 'react';
import { ProductCard } from '../components/ProductCard/ProductCard';
import { MOCK_PRODUCTS } from '../data/products';

export const Home: React.FC = () => {
  return (
    <main style={{
      maxWidth: '1200px',
      margin: '100px auto 40px auto',
      padding: '0 20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#102346', fontSize: '28px', fontWeight: 700, letterSpacing: '0.5px' }}>
          Наші Бестселери
        </h2>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
          Преміальні подарунки та аксесуари для вашого затишку
        </p>
      </div>

      {/* Адаптивна CSS Grid-сітка товарів: по 2 на мобільних, по 3-4 на десктопах */}
      <div style={{
        display: 'grid',
        // На мобільних ділимо навпіл (50% - відступ), на великих екранах вмикається автозаповнення
        gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(250px, 1fr))',
        // Робимо менші відступи на мобільних (12px), щоб зекономити місце, і більші (30px) на десктопі
        gap: window.innerWidth <= 480 ? '12px' : '30px',
        marginTop: '20px'
      }}>
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};