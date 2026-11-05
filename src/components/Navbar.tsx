import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  clearLastAddedToast,
  selectCartBreakdown,
  setCartDrawerOpen,
} from '../redux/slices/cartSlice';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { lastAddedTitle } = useAppSelector((state) => state.cart);
  const { totalCount } = useAppSelector(selectCartBreakdown);

  useEffect(() => {
    if (!lastAddedTitle) return;
    const timer = setTimeout(() => {
      dispatch(clearLastAddedToast());
    }, 2600);
    return () => clearTimeout(timer);
  }, [lastAddedTitle, dispatch]);

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-amber-400 underline underline-offset-8 decoration-2'
      : 'text-slate-200 hover:text-white';

  return (
    <>
      <header className="bg-[#131921] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            Amazona
          </Link>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/')}`}
            >
              Storefront
            </Link>
            <Link
              to="/orders"
              className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/orders')}`}
            >
              Orders
            </Link>
            <Link
              to="/cart"
              className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/cart')}`}
            >
              Shopping Cart
            </Link>
            <Link
              to="/admin"
              className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/admin')}`}
            >
              Admin Console
            </Link>
            <Link
              to="/auth"
              className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/auth')}`}
            >
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </Link>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => dispatch(setCartDrawerOpen(true))}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="tabular-nums">Cart ({totalCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Non-intrusive Add-to-Cart confirmation toast */}
      {lastAddedTitle && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs leading-snug">
            <p className="font-semibold text-white">Added to Shopping Cart</p>
            <p className="text-slate-300 truncate max-w-[220px]">{lastAddedTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(clearLastAddedToast());
              navigate('/cart');
            }}
            className="ml-2 text-xs font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}
    </>
  );
};
