// src/App.tsx
import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { CartDrawer } from './components/CartDrawer/CartDrawer';
import { CartProvider } from './context/CartContext';
import { Footer } from './components/Footer/Footer';
import { SEO } from './components/SEO/SEO';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Checkout = lazy(() => import('./pages/Checkout/Checkout').then((module) => ({ default: module.Checkout })));
const Auth = lazy(() => import('./pages/Auth/Auth').then((module) => ({ default: module.Auth })));
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Delivery = lazy(() => import('./pages/Delivery').then((module) => ({ default: module.Delivery })));
const Contacts = lazy(() => import('./pages/Contacts').then((module) => ({ default: module.Contacts })));
const FreeDelivery = lazy(() => import('./pages/FreeDelivery').then((module) => ({ default: module.FreeDelivery })));
const ThankYou = lazy(() => import('./pages/ThankYou').then((module) => ({ default: module.ThankYou })));
const ReturnsExchange = lazy(() => import('./pages/ReturnsExchange').then((module) => ({ default: module.ReturnsExchange })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then((module) => ({ default: module.TermsOfUse })));

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <BrowserRouter basename={routerBasename}>
      <CartProvider>
        <SEO />
        {/* Головна обгортка для притискання футера */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Глобальні компоненти інтерфейсу (шапка та кошик) */}
          <Header onCartOpen={() => setIsCartOpen(true)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

          {/* Контентна зона, яка розтягується і штовхає футер донизу */}
          <div style={{ flexGrow: 1 }}>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/delivery" element={<Delivery />} />
                <Route path="/free-delivery" element={<FreeDelivery />} />
                <Route path="/returns-exchange" element={<ReturnsExchange />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/contacts" element={<Contacts />} />
              </Routes>
            </Suspense>
          </div>

          {/* Наш новий стильний футер */}
          <Footer />

        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
