import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import AuthHeader from './components/AuthHeader';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AddressesPage from './pages/AddressesPage';
import SavedCardsPage from './pages/SavedCardsPage';
import WishlistPage from './pages/WishlistPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import BecomeSellerPage from './pages/BecomeSellerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import OrdersPage from './pages/OrdersPage';
import {
  AboutPage, ContactPage, CareersPage, StoriesPage,
  PaymentsHelpPage, ShippingPage, ReturnsHelpPage, FaqPage,
  ReturnPolicyPage, TermsPage, SecurityPage, PrivacyPage,
} from './pages/StaticPages';

const AUTH_ROUTES = ['/login', '/register', '/verify-otp'];

function AppInner() {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAuthRoute && <Header />}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Main */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/addresses" element={<AddressesPage />} />
          <Route path="/profile/saved-cards" element={<SavedCardsPage />} />
          <Route path="/profile/wishlist" element={<WishlistPage />} />
          {/* Auth / Seller / Admin */}
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/become-seller" element={<BecomeSellerPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          {/* Footer — About */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          {/* Footer — Help */}
          <Route path="/help/payments" element={<PaymentsHelpPage />} />
          <Route path="/help/shipping" element={<ShippingPage />} />
          <Route path="/help/returns" element={<ReturnsHelpPage />} />
          <Route path="/help/faq" element={<FaqPage />} />
          {/* Footer — Policy */}
          <Route path="/policy/returns" element={<ReturnPolicyPage />} />
          <Route path="/policy/terms" element={<TermsPage />} />
          <Route path="/policy/security" element={<SecurityPage />} />
          <Route path="/policy/privacy" element={<PrivacyPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
