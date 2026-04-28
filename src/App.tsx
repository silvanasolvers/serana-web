/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';

// Eager: tiny pages that the user lands on most often.
import HomePage from './pages/HomePage';

// Lazy: each route is its own chunk so the home page boots fast.
const ShopPage = lazy(() => import('./pages/ShopPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutResultPage = lazy(() => import('./pages/CheckoutResultPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Heavy non-critical UI: defer until idle so they don't block first paint.
const LivingBackground = lazy(() => import('./components/LivingBackground'));
const ChatBot = lazy(() => import('./components/ChatBot'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-serana-cream">
      <div className="w-8 h-8 border-4 border-serana-forest/20 border-t-serana-forest rounded-full animate-spin" aria-label="Cargando" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <CustomCursor />
      <Suspense fallback={null}>
        <LivingBackground />
      </Suspense>
      <ScrollToTop />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutResultPage variant="success" />} />
          <Route path="/checkout/failure" element={<CheckoutResultPage variant="failure" />} />
          <Route path="/checkout/pending" element={<CheckoutResultPage variant="pending" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
