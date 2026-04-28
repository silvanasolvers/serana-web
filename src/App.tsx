/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutResultPage from './pages/CheckoutResultPage';
import DashboardPage from './pages/DashboardPage';
import { useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import LivingBackground from './components/LivingBackground';
import ChatBot from './components/ChatBot';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <CustomCursor />
      <LivingBackground />
      <ScrollToTop />
      <ChatBot />
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
    </Router>
  );
}
