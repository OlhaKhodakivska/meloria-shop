// src/App.tsx
import React from 'react';
import { Header } from './components/Header/Header';
import { ProductCard } from './components/ProductCard/ProductCard';
import { MOCK_PRODUCTS } from './data/products';

function App() {
  return (
    <>
      <Header />

      {/* Головний контейнер сайту */}
      <main style={{
        marginTop: '100px',
        padding: '0 20px 40px 20px',
        maxWidth: '1200px',
        margin: '100px auto 40px auto'
      }}>

        {/* Секція заголовку каталогу */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#102346', fontSize: '28px', fontWeight: 700, letterSpacing: '0.5px' }}>
            Наші Бестселери
          </h2>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
            Преміальні подарунки та аксесуари для вашого затишку
          </p>
        </div>

        {/* Адаптивна CSS Grid-сітка товарів */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </main>
    </>
  );
}

export default App;