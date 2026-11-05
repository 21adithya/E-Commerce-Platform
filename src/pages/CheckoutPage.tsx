import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  CreditCard,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { clearCart, selectCartBreakdown } from '../redux/slices/cartSlice';
import { switchDemoRole } from '../redux/slices/authSlice';
import { apiClient } from '../services/api';
import { ShippingAddress } from '../types/marketplace';
import { ProductImage } from '../components/ProductImage';

const TEST_CARDS = [
  {
    id: 'visa-4242',
    brand: 'Visa',
    number: '4242 •••• •••• 4242',
    expiry: '08/29',
    cvc: '424',
    summary: 'Visa ending in 4242',
  },
  {
    id: 'mc-8819',
    brand: 'Mastercard',
    number: '5555 •••• •••• 8819',
    expiry: '11/28',
    cvc: '819',
    summary: 'Mastercard ending in 8819',
  },
  {
    id: 'amex-1004',
    brand: 'American Express',
    number: '3782 •••• •••• 1004',
    expiry: '04/30',
    cvc: '1004',
    summary: 'Amex ending in 1004',
  },
];

export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
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

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: user?.shippingAddress?.fullName || user?.name || 'Alex Rivera',
    street: user?.shippingAddress?.street || '742 Evergreen Terrace, Apt 4B',
    city: user?.shippingAddress?.city || 'Seattle',
    state: user?.shippingAddress?.state || 'WA',
    postalCode: user?.shippingAddress?.postalCode || '98101',
    country: user?.shippingAddress?.country || 'United States',
    phone: user?.shippingAddress?.phone || '(206) 555-0194',
  });

  const [selectedCardId, setSelectedCardId] = useState(TEST_CARDS[0].id);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [initializingIntent, setInitializingIntent] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.shippingAddress?.street) {
      setShipping(user.shippingAddress);
    }
  }, [user]);

  // Initialize Stripe PaymentIntent on mount / when user or cart changes
  useEffect(() => {
    if (!user || items.length === 0) return;
    let active = true;
    setInitializingIntent(true);
    apiClient
      .post('/payments/create-intent', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: appliedPromo?.code,
      })
      .then(({ data }) => {
        if (active) {
          setPaymentIntentId(data.paymentIntentId);
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        if (active) {
          setCheckoutError(
            err.response?.data?.error || 'Could not initialize payment intent.'
          );
        }
      })
      .finally(() => {
        if (active) setInitializingIntent(false);
      });
    return () => {
      active = false;
    };
  }, [user, items, appliedPromo]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProcessingOrder(true);
    setCheckoutError(null);
    const chosenCard =
      TEST_CARDS.find((c) => c.id === selectedCardId) || TEST_CARDS[0];

    try {
      const { data } = await apiClient.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: shipping,
        couponCode: appliedPromo?.code,
        paymentIntentId: paymentIntentId || `pi_3Q9_${Date.now()}`,
        paymentMethodSummary: chosenCard.summary,
      });
      dispatch(clearCart());
      navigate(`/orders/${data.order.id}?confirmed=true`);
    } catch (err: any) {
      setCheckoutError(
        err.response?.data?.error || 'Payment verification failed. Please try again.'
      );
    } finally {
      setProcessingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-md mx-auto space-y-4">
          <h1 className="font-display text-lg font-bold text-slate-900">
            No items in checkout
          </h1>
          <p className="text-xs text-slate-500">
            Add products to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg inline-block"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/cart"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shopping Cart</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Secure Checkout &amp; Stripe Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
          <Lock className="w-4 h-4" />
          <span>Stripe PaymentIntent Verified</span>
        </div>
      </div>

      {/* Authentication Gate */}
      {!user ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-xl mx-auto space-y-4 text-center">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Sign in to complete your order
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Use the one-click Demo Customer account to test instant checkout with pre-filled
            Seattle shipping details, or sign in with your own credentials.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => dispatch(switchDemoRole('customer'))}
              className="px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
            >
              Continue as Demo Customer (Alex Rivera)
            </button>
            <Link
              to="/auth"
              className="px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
            >
              Sign In or Create Account
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left 7 Columns: Shipping Address + Interactive Stripe Gateway */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <h2 className="font-display text-base font-bold text-slate-900">
                    1. Shipping Destination
                  </h2>
                </div>
                <span className="text-xs text-slate-500">Prime Expedited Carrier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping({ ...shipping, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Street Address &amp; Apt/Suite
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.street}
                    onChange={(e) =>
                      setShipping({ ...shipping, street: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.state}
                      onChange={(e) =>
                        setShipping({ ...shipping, state: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.postalCode}
                      onChange={(e) =>
                        setShipping({ ...shipping, postalCode: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping({ ...shipping, country: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Delivery Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Interactive Simulated Stripe Payment Gateway */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <h2 className="font-display text-base font-bold text-slate-900">
                    2. Stripe Payment Method
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                  {initializingIntent
                    ? 'Initializing PaymentIntent...'
                    : `Intent: ${paymentIntentId || 'pi_ready'}`}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Select a pre-configured Stripe test card below to simulate instant PaymentIntent
                confirmation and server-side inventory reservation:
              </p>

              <div className="space-y-2.5">
                {TEST_CARDS.map((card) => {
                  const selected = selectedCardId === card.id;
                  return (
                    <label
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-amber-50/50 border-amber-500'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="stripeCard"
                          checked={selected}
                          onChange={() => setSelectedCardId(card.id)}
                          className="accent-amber-500"
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {card.brand} ·{' '}
                            <span className="font-mono tabular-nums">{card.number}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                            Expires {card.expiry} · CVC {card.cvc} · Instant 3DS Pass
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-700">Verified</span>
                    </label>
                  );
                })}
              </div>

              {clientSecret && (
                <div className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono flex items-center justify-between">
                  <span className="truncate">
                    Stripe ClientSecret: {clientSecret}
                  </span>
                  <span className="text-emerald-400 font-semibold ml-2 shrink-0">
                    READY
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Order Review & Confirm CTA */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Order Review ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </h2>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-11 rounded border border-slate-200 overflow-hidden shrink-0">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      aspectClass="aspect-[4/3]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Qty {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo ({appliedPromo?.code})</span>
                  <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Prime Shipping</span>
                <span className="font-mono tabular-nums">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8.5%)</span>
                <span className="font-mono tabular-nums">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total to Charge</span>
                <span className="font-mono tabular-nums">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {checkoutError}
              </div>
            )}

            <button
              type="submit"
              disabled={processingOrder}
              className="w-full py-3.5 px-5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-mono font-bold tabular-nums">
                {processingOrder
                  ? 'Verifying Stripe PaymentIntent...'
                  : `Pay $${totalAmount.toFixed(2)} & Place Order`}
              </span>
            </button>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Instant order confirmation &amp; tracking number generated upon payment.
              </span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
