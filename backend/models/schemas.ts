import mongoose, { Schema, Document } from 'mongoose';

// CRITICAL: Fail fast if external MongoDB is offline
mongoose.set('bufferCommands', false);

export interface IReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface IProduct {
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
  dealEndsAt?: string;
  reviews: IReview[];
  createdAt: string;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  shippingAddress: IShippingAddress;
  createdAt: string;
}

export interface IOrderItem {
  productId: string;
  title: string;
  brand: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatusType =
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentIntentId: string;
  paymentMethodSummary: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: OrderStatusType;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

const reviewSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  createdAt: { type: String, required: true },
});

const productSchema = new Schema({
  id: { type: String, required: true, unique: true },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
  features: [{ type: String }],
  description: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  dealEndsAt: { type: String },
  reviews: [reviewSchema],
  createdAt: { type: String, required: true },
});

const shippingAddressSchema = new Schema({
  fullName: { type: String, default: '' },
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: 'United States' },
  phone: { type: String, default: '' },
});

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
  createdAt: { type: String, required: true },
});

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  brand: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
});

const orderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [orderItemSchema],
  shippingAddress: { type: shippingAddressSchema, required: true },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  taxAmount: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentIntentId: { type: String, required: true },
  paymentMethodSummary: { type: String, default: 'Visa ending in 4242' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  trackingNumber: { type: String, required: true },
  estimatedDelivery: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const ProductModel: mongoose.Model<IProduct> =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>('Product', productSchema);
export const UserModel: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema);
export const OrderModel: mongoose.Model<IOrder> =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>('Order', orderSchema);
