import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product, PromoCode } from '../../types/marketplace';

const CART_STORAGE_KEY = 'amazona_cart_items_v1';
const PROMO_STORAGE_KEY = 'amazona_cart_promo_v1';

const DEFAULT_CART: CartItem[] = [
  {
    productId: 'prd-101',
    title: 'Noir Studio Pro Wireless Noise-Canceling Headphones',
    brand: 'Noir Audio',
    sku: 'AMZ-AUD-901',
    price: 279.00,
    originalPrice: 349.00,
    stock: 28,
    image: '/src/assets/images/product_headphones_pro_1793882040985.jpg',
    quantity: 1,
  },
];

function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(DEFAULT_CART));
      return DEFAULT_CART;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CART;
  }
}

function loadPromo(): PromoCode | null {
  try {
    const raw = localStorage.getItem(PROMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface CartState {
  items: CartItem[];
  appliedPromo: PromoCode | null;
  isDrawerOpen: boolean;
  lastAddedTitle: string | null;
}

const initialState: CartState = {
  items: loadCartItems(),
  appliedPromo: loadPromo(),
  isDrawerOpen: false,
  lastAddedTitle: null,
};

function persistCart(items: CartItem[], promo: PromoCode | null) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  if (promo) {
    localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
  } else {
    localStorage.removeItem(PROMO_STORAGE_KEY);
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(
      state,
      action: PayloadAction<{ product: Product; quantity?: number; openDrawer?: boolean }>
    ) {
      const { product, quantity = 1, openDrawer = false } = action.payload;
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity = Math.min(product.stock, existing.quantity + quantity);
        existing.price = product.price;
        existing.stock = product.stock;
      } else {
        state.items.push({
          productId: product.id,
          title: product.title,
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          image: product.image,
          quantity: Math.min(product.stock, Math.max(1, quantity)),
        });
      }
      state.lastAddedTitle = product.title;
      if (openDrawer) {
        state.isDrawerOpen = true;
      }
      persistCart(state.items, state.appliedPromo);
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
        } else {
          item.quantity = Math.min(item.stock, action.payload.quantity);
        }
      }
      persistCart(state.items, state.appliedPromo);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      if (state.items.length === 0) {
        state.appliedPromo = null;
      }
      persistCart(state.items, state.appliedPromo);
    },
    applyPromoCode(state, action: PayloadAction<PromoCode | null>) {
      state.appliedPromo = action.payload;
      persistCart(state.items, state.appliedPromo);
    },
    clearCart(state) {
      state.items = [];
      state.appliedPromo = null;
      persistCart([], null);
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDrawerOpen = action.payload;
    },
    clearLastAddedToast(state) {
      state.lastAddedTitle = null;
    },
  },
});

export const {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  applyPromoCode,
  clearCart,
  setCartDrawerOpen,
  clearLastAddedToast,
} = cartSlice.actions;

export function selectCartBreakdown(state: { cart: CartState }) {
  const subtotal = Number(
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const totalCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const promo = state.cart.appliedPromo;
  let discountAmount = 0;

  if (promo && subtotal >= promo.minSpend) {
    discountAmount =
      promo.type === 'percent'
        ? Number(((subtotal * promo.value) / 100).toFixed(2))
        : Math.min(subtotal, promo.value);
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingCost = subtotal === 0 ? 0 : discountedSubtotal >= 75 ? 0 : 9.99;
  const taxAmount = Number((discountedSubtotal * 0.085).toFixed(2));
  const totalAmount = Number((discountedSubtotal + shippingCost + taxAmount).toFixed(2));

  return {
    subtotal,
    totalCount,
    discountAmount,
    shippingCost,
    taxAmount,
    totalAmount,
    appliedPromo: promo && subtotal >= promo.minSpend ? promo : null,
  };
}

export default cartSlice.reducer;
