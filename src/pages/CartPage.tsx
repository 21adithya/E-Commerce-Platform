import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  applyPromoCode,
  clearCart,
  removeFromCart,
  selectCartBreakdown,
  updateCartQuantity,
} from '../redux/slices/cartSlice';
import { apiClient } from '../services/api';
import { ProductImage } from '../components/ProductImage';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);
  const {
    subtotal,
    totalCount,
    discountAmount,
    shippingCost,
    taxAmount,
    totalAmount,
    appliedPromo,
  } = useAppSelector(selectCartBreakdown);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleApplyPromo = async (codeOverride?: string) => {
    const code = (codeOverride ?? promoInput).trim().toUpperCase();
    if (!code) return;
    setValidating(true);
    setPromoError(null);
    try {
      const { data } = await apiClient.post('/coupons/validate', {
        code,
        subtotal,
      });
      dispatch(applyPromoCode(data.promo));
      setPromoInput('');
    } catch (err: any) {
      setPromoError(err.response?.data?.error || 'Invalid promotional code.');
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">
            Your Amazona Shopping Cart is empty
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your shopping cart lives to serve. Give it purpose—fill it with flagship audio,
            espresso craft, titanium fitness watches, and ergonomic workspace gear.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="px-6 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg inline-flex items-center gap-2"
            >
              <span>Explore Featured Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Shopping Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Items in your cart are persisted across sessions and verified for stock at checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="text-xs text-slate-500 hover:text-red-600 underline underline-offset-4 cursor-pointer"
        >
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Line Items */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {items.map((item) => (
            <div
              key={item.productId}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <Link
                  to={`/product/${item.productId}`}
                  className="w-28 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 block"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    aspectClass="aspect-[4/3]"
                  />
                </Link>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{item.brand}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.sku}</span>
                  </div>
                  <Link
                    to={`/product/${item.productId}`}
                    className="font-display text-base font-semibold text-slate-900 hover:text-amber-700 block"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-emerald-700 font-medium">
                    In Stock · Eligible for FREE Prime Shipping
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="font-mono text-xs text-slate-400 tabular-nums">
                    ${item.price.toFixed(2)} / unit
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateCartQuantity({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-semibold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateCartQuantity({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary & Promo Code Module */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-slate-900">Order Summary</h2>

          {/* Promotional Coupon Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              Promotional Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter PRIME20, SAVE10..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                disabled={validating}
                onClick={() => handleApplyPromo()}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <Tag className="w-3 h-3 text-amber-600" />
              <span>Available codes:</span>
              {['PRIME20', 'SAVE10', 'WELCOME15'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleApplyPromo(c)}
                  className="font-mono font-semibold text-amber-700 hover:underline cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>

            {promoError && <p className="text-xs text-red-600">{promoError}</p>}
            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-700 font-medium pt-1">
                <span>
                  {appliedPromo.code}: {appliedPromo.label}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(applyPromoCode(null))}
                  className="text-slate-400 hover:text-red-600 underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2.5 text-xs border-t border-slate-200 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal ({totalCount})</span>
              <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Savings</span>
                <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping &amp; Handling</span>
              <span className="font-mono tabular-nums">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8.5%)</span>
              <span className="font-mono tabular-nums">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2.5 border-t border-slate-200">
              <span>Order Total</span>
              <span className="font-mono tabular-nums">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-3 px-5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Stripe Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/"
            className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit SSL encrypted checkout with Stripe PaymentIntent verification.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
