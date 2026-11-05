import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  applyPromoCode,
  removeFromCart,
  selectCartBreakdown,
  setCartDrawerOpen,
  updateCartQuantity,
} from '../redux/slices/cartSlice';
import { apiClient } from '../services/api';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isDrawerOpen } = useAppSelector((state) => state.cart);
  const {
    subtotal,
    totalCount,
    discountAmount,
    shippingCost,
    taxAmount,
    totalAmount,
    appliedPromo,
  } = useAppSelector(selectCartBreakdown);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyPromo = async (codeToUse?: string) => {
    const code = (codeToUse ?? couponInput).trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    setCouponError(null);
    try {
      const { data } = await apiClient.post('/coupons/validate', {
        code,
        subtotal,
      });
      dispatch(applyPromoCode(data.promo));
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.response?.data?.error || 'Invalid coupon code.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]">
      <div className="w-full max-w-md bg-white h-full flex flex-col justify-between border-l border-slate-200 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#131921] text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="font-display text-base font-semibold">
              Shopping Cart ({totalCount})
            </h2>
            <p className="text-xs text-slate-300">
              {subtotal >= 75
                ? 'Your order qualifies for FREE Prime Delivery'
                : `Add $${Math.max(0, 75 - subtotal).toFixed(2)} more for FREE shipping`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setCartDrawerOpen(false))}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 px-6">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-base font-semibold text-slate-800 mb-1">
                Your Amazona Cart is empty
              </p>
              <p className="text-xs text-slate-500 mb-5">
                Explore daily deals and featured electronics in our catalog.
              </p>
              <button
                type="button"
                onClick={() => {
                  dispatch(setCartDrawerOpen(false));
                  navigate('/');
                }}
                className="px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
              >
                Browse Featured Deals
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-4">
                <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    aspectClass="aspect-[4/3]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{item.brand}</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.title}
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                    ${(item.price * item.quantity).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (${item.price.toFixed(2)} each)
                    </span>
                  </p>

                  <div className="flex items-center justify-between mt-2">
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
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
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
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totals & Promo Input */}
        {items.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            {/* Promo Code Bar */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Promo code (e.g. PRIME20)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 uppercase font-mono"
                />
                <button
                  type="button"
                  disabled={applying}
                  onClick={() => handleApplyPromo()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Quick Promo Buttons */}
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Quick apply:</span>
                {['PRIME20', 'SAVE10', 'WELCOME15'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyPromo(code)}
                    className="font-mono font-semibold text-amber-700 hover:underline cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>

              {couponError && (
                <p className="text-xs text-red-600 mt-1">{couponError}</p>
              )}
              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-medium mt-1.5">
                  <span>
                    Applied {appliedPromo.code} ({appliedPromo.label})
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(applyPromoCode(null))}
                    className="text-slate-500 hover:text-red-600 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Tabular Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalCount} items)</span>
                <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount</span>
                  <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-mono tabular-nums">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8.5%)</span>
                <span className="font-mono tabular-nums">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Order Total</span>
                <span className="font-mono tabular-nums">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  dispatch(setCartDrawerOpen(false));
                  navigate('/cart');
                }}
                className="py-2.5 px-4 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Review Full Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(setCartDrawerOpen(false));
                  navigate('/checkout');
                }}
                className="py-2.5 px-4 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
