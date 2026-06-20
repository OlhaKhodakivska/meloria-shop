// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { CartDrawer } from './components/CartDrawer/CartDrawer';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout/Checkout';
import { CartProvider } from './context/CartContext';
import { Auth } from './pages/Auth/Auth';
import { About } from './pages/About';
import { Delivery } from './pages/Delivery';
import { Contacts } from './pages/Contacts';
import { Footer } from './components/Footer/Footer';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <CartProvider>
        {/* Головна обгортка для притискання футера */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Глобальні компоненти інтерфейсу (шапка та кошик) */}
          <Header onCartOpen={() => setIsCartOpen(true)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

          {/* Контентна зона, яка розтягується і штовхає футер донизу */}
          <div style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout onCloseCart={() => setIsCartOpen(false)} />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/contacts" element={<Contacts />} />
            </Routes>
          </div>

          {/* Наш новий стильний футер */}
          <Footer />

        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;