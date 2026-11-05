import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Order, OrderStatus } from '../types/marketplace';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { switchDemoRole } from '../redux/slices/authSlice';
import { ProductImage } from '../components/ProductImage';

const DELIVERY_STEPS: OrderStatus[] = [
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'Cancelled') return -1;
  return DELIVERY_STEPS.indexOf(status);
}

export const OrdersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isJustConfirmed = searchParams.get('confirmed') === 'true';

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    if (id) {
      apiClient
        .get<{ order: Order }>(`/orders/${id}`)
        .then(({ data }) => {
          if (active) setSelectedOrder(data.order);
        })
        .catch(() => {
          if (active) setSelectedOrder(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      apiClient
        .get<{ orders: Order[] }>('/orders/my-orders')
        .then(({ data }) => {
          if (active) {
            setOrders(data.orders);
            setSelectedOrder(null);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [user, id]);

  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-lg mx-auto space-y-4">
          <Package className="w-8 h-8 text-amber-500 mx-auto" />
          <h1 className="font-display text-xl font-bold text-slate-900">
            Sign in to view your orders &amp; live package tracking
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Switch to the Demo Customer account in one click to inspect pre-populated orders
            and real-time delivery progress.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => dispatch(switchDemoRole('customer'))}
              className="px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
            >
              Sign In as Demo Customer (Alex Rivera)
            </button>
            <Link
              to="/auth"
              className="px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
            >
              Sign In with Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Individual Order Detail & Tracking View
  if (id && selectedOrder) {
    const currentStepIdx = getStepIndex(selectedOrder.orderStatus);

    return (
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/orders"
            className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            Order #{selectedOrder.orderNumber}
          </span>
        </div>

        {isJustConfirmed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-display text-base font-bold text-emerald-950">
                Order #{selectedOrder.orderNumber} Confirmed — Preparing Shipment
              </h2>
              <p className="text-xs text-emerald-800">
                Stripe PaymentIntent{' '}
                <span className="font-mono font-semibold">
                  {selectedOrder.paymentIntentId}
                </span>{' '}
                has been verified and inventory has been reserved for your shipment.
              </p>
            </div>
          </div>
        )}

        {/* Order Tracking Progress Module */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-500">Live Package Status</p>
              <h1 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                {selectedOrder.orderStatus} · {selectedOrder.estimatedDelivery}
              </h1>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">
              <p className="text-slate-500">Carrier Tracking ID</p>
              <p className="font-semibold text-slate-900">{selectedOrder.trackingNumber}</p>
            </div>
          </div>

          {/* 4-Step Delivery Progress Bar */}
          {selectedOrder.orderStatus !== 'Cancelled' ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              {DELIVERY_STEPS.map((step, idx) => {
                const completed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={step}
                    className={`p-4 rounded-xl border ${
                      isCurrent
                        ? 'bg-amber-50/70 border-amber-400'
                        : completed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                        0{idx + 1}
                      </span>
                      {completed ? (
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            isCurrent ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <p className="font-display text-sm font-semibold text-slate-900">
                      {step}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {idx === 0 && 'Payment & stock verified'}
                      {idx === 1 && 'Dispatched from regional hub'}
                      {idx === 2 && 'With local Prime courier'}
                      {idx === 3 && 'Signed & delivered at address'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              This order was cancelled and refunded to {selectedOrder.paymentMethodSummary}.
            </div>
          )}

          {/* Shipping & Payment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Shipping Address</span>
              </div>
              <p className="text-slate-700 font-medium">
                {selectedOrder.shippingAddress.fullName}
              </p>
              <p className="text-slate-600">{selectedOrder.shippingAddress.street}</p>
              <p className="text-slate-600">
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                {selectedOrder.shippingAddress.postalCode}
              </p>
              <p className="text-slate-500 font-mono">
                {selectedOrder.shippingAddress.phone}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Payment &amp; Verification</span>
              </div>
              <p className="text-slate-700 font-medium">
                {selectedOrder.paymentMethodSummary}
              </p>
              <p className="text-slate-500 font-mono tabular-nums">
                Intent: {selectedOrder.paymentIntentId}
              </p>
              <p className="text-emerald-700 font-medium capitalize">
                Status: {selectedOrder.paymentStatus}
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono tabular-nums">
                  ${selectedOrder.subtotal.toFixed(2)}
                </span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo ({selectedOrder.couponCode}):</span>
                  <span className="font-mono tabular-nums">
                    -${selectedOrder.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping &amp; Tax:</span>
                <span className="font-mono tabular-nums">
                  ${(selectedOrder.shippingCost + selectedOrder.taxAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {selectedOrder.items.map((item) => (
            <div
              key={item.productId}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <Link
                  to={`/product/${item.productId}`}
                  className="w-20 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    aspectClass="aspect-[4/3]"
                  />
                </Link>
                <div>
                  <p className="text-xs text-slate-500">
                    {item.brand} · <span className="font-mono">{item.sku}</span>
                  </p>
                  <Link
                    to={`/product/${item.productId}`}
                    className="font-display text-sm font-semibold text-slate-900 hover:text-amber-700"
                  >
                    {item.title}
                  </Link>
                  <p className="font-mono text-xs text-slate-600 tabular-nums mt-0.5">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <Link
                  to={`/product/${item.productId}`}
                  className="px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Buy Again</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Order History List View
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Your Orders &amp; Returns
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track live shipments, inspect payment receipts, or reorder items for{' '}
            <strong className="text-slate-800">{user.name}</strong>.
          </p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-40 bg-white border border-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <Truck className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="font-display text-base font-semibold text-slate-900">
            You have not placed any orders yet
          </h2>
          <p className="text-xs text-slate-500">
            Once you complete checkout, your confirmed orders and tracking updates will appear
            here.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg inline-block mt-2"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Order Card Top Metadata Header */}
              <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-500 block">Order Placed</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Charged</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ship To</span>
                    <span className="font-medium text-slate-900">
                      {order.shippingAddress.fullName} ({order.shippingAddress.city},{' '}
                      {order.shippingAddress.state})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-slate-500 tabular-nums">
                    #{order.orderNumber}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg whitespace-nowrap"
                  >
                    Track Package &amp; Receipt
                  </Link>
                </div>
              </div>

              {/* Order Status & Items Preview */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-display text-sm font-bold text-slate-900">
                      Status: {order.orderStatus}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="text-emerald-700 font-medium">
                      {order.estimatedDelivery}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    Tracking: {order.trackingNumber}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <Link
                          to={`/product/${item.productId}`}
                          className="w-16 h-12 rounded border border-slate-200 overflow-hidden shrink-0"
                        >
                          <ProductImage
                            src={item.image}
                            alt={item.title}
                            aspectClass="aspect-[4/3]"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-sm font-semibold text-slate-900 hover:text-amber-700"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-slate-500 font-mono tabular-nums">
                            Qty {item.quantity} · ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-xs font-medium text-amber-700 hover:underline whitespace-nowrap"
                      >
                        View Item
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
