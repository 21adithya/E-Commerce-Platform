import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, UserCheck, X, Copy, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logout, switchDemoRole } from '../redux/slices/authSlice';

export const MarketplaceToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live countdown timer for Prime Lightning Event (5h 42m 18s initial)
  const [secondsLeft, setSecondsLeft] = useState(5 * 3600 + 42 * 60 + 18);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 5 * 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('PRIME20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDemoSwitch = async (role: 'customer' | 'admin') => {
    await dispatch(switchDemoRole(role));
    if (role === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="bg-[#232F3E] text-slate-200 border-b border-slate-800 text-xs">
      <div className="max-w-[1280px] mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Deals Countdown & Promo Code Banner */}
        {!bannerDismissed ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">
                Ends in {hrs}:{mins}:{secs}
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-500">
              ·
            </span>
            <span className="text-slate-200">
              Prime Member Event: Save 20% on orders $100+ with code{' '}
              <button
                type="button"
                onClick={handleCopyCode}
                className="font-mono font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 inline-flex items-center gap-1 cursor-pointer"
                title="Copy promo code PRIME20"
              >
                <span>PRIME20</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </span>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              aria-label="Dismiss promotional banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-slate-300">
            Free Prime Delivery on orders over $75 · Promo codes: PRIME20 · SAVE10 · WELCOME15
          </div>
        )}

        {/* Right: One-Click Demo Role Switcher (Customer / Admin) */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-slate-400 hidden sm:inline">Quick Role Switcher:</span>
          <div className="inline-flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoSwitch('customer')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                user?.role === 'customer'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Customer</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoSwitch('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="text-slate-400 hover:text-white underline underline-offset-4 ml-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
