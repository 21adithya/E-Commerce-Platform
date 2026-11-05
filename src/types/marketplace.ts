export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  numReviews: number;
  stock: number;
  image: string;
  features: string[];
  description: string;
  isFeatured: boolean;
  reviews: Review[];
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  shippingAddress: ShippingAddress;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  quantity: number;
}

export interface PromoCode {
  code: string;
  label: string;
  type: 'percent' | 'fixed';
  value: number;
  minSpend: number;
}

export type OrderStatus =
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentIntentId: string;
  paymentMethodSummary: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: OrderStatus;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}
