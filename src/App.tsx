import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { switchDemoRole } from './redux/slices/authSlice';
import { Navbar } from './components/Navbar';
import { MarketplaceToolbar } from './components/MarketplaceToolbar';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  // Auto-initialize Demo Customer session on first visit so cart/orders/reviews work seamlessly
  useEffect(() => {
    if (!user && !token) {
      dispatch(switchDemoRole('customer'));
    }
  }, [dispatch, user, token]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <Navbar />
        <MarketplaceToolbar />
        <CartDrawer />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>

        <footer className="bg-[#131921] text-slate-400 border-t border-slate-800 text-xs">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-display font-bold text-white text-sm mr-3">
                Amazona
              </span>
              <span>
                © {new Date().getFullYear()} Amazona Marketplace Inc. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-white transition-colors">
                Storefront
              </Link>
              <Link to="/cart" className="hover:text-white transition-colors">
                Shopping Cart
              </Link>
              <Link to="/orders" className="hover:text-white transition-colors">
                Order Tracking
              </Link>
              <Link to="/admin" className="hover:text-white transition-colors">
                Admin Console
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
