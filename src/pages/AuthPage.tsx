import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  clearAuthError,
  loginUser,
  logout,
  registerUser,
  switchDemoRole,
} from '../redux/slices/authSlice';

export const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@amazona.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(res)) {
        navigate('/');
      }
    } else {
      const res = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(res)) {
        navigate('/');
      }
    }
  };

  const handleQuickDemo = async (role: 'customer' | 'admin') => {
    const res = await dispatch(switchDemoRole(role));
    if (switchDemoRole.fulfilled.match(res)) {
      navigate(role === 'admin' ? '/admin' : '/');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: JWT Login / Registration Card */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-6 lg:p-8 space-y-6">
          {user ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-emerald-700 font-semibold">
                  Authenticated Session Active
                </p>
                <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                  {user.name}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {user.email} · Role: <span className="uppercase">{user.role}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <p className="font-semibold text-slate-800">Default Shipping Address</p>
                {user.shippingAddress?.street ? (
                  <>
                    <p className="text-slate-600">{user.shippingAddress.fullName}</p>
                    <p className="text-slate-600">{user.shippingAddress.street}</p>
                    <p className="text-slate-600">
                      {user.shippingAddress.city}, {user.shippingAddress.state}{' '}
                      {user.shippingAddress.postalCode}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500">
                    No default shipping address saved yet. It will be saved automatically on
                    your first checkout.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
                >
                  View Your Orders
                </button>
                {user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Open Admin Console
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(logout())}
                  className="px-4 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h1 className="font-display text-xl font-bold text-slate-900">
                  {mode === 'login' ? 'Sign In to Amazona' : 'Create Customer Account'}
                </h1>
                <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearAuthError());
                      setMode('login');
                    }}
                    className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearAuthError());
                      setMode('register');
                      setEmail('');
                      setPassword('');
                    }}
                    className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@amazona.com"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password (bcrypt hashed)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  {loading
                    ? 'Authenticating...'
                    : mode === 'login'
                      ? 'Sign In with JWT'
                      : 'Create Amazona Account'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Right: Instant Demo Role Credentials */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              One-Click Demo Accounts
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Instantly switch between pre-seeded Customer and Administrator JWT sessions to
            evaluate order tracking, review submission, and the Admin Dashboard:
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Customer Account</span>
                <span className="font-mono text-slate-500">Alex Rivera</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                customer@amazona.com · password123
              </p>
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="w-full py-2 px-3 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In as Demo Customer</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">Administrator Account</span>
                <span className="font-mono text-slate-500">Elena Vance</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                admin@amazona.com · admin123
              </p>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full py-2 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In as Demo Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
