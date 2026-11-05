import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, dbRepository } from './backend/store/repository.js';
import { IOrder, IProduct, IReview, IUser, OrderStatusType } from './backend/models/schemas.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'amazon_marketplace_jwt_secret_key_2026';
const PORT = 3000;

interface AuthPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

function signUserToken(user: IUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user: IUser) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

// JWT Authentication Middleware
function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Role-Based Access Control (Admin Middleware)
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator privileges required.' });
  }
  next();
}

// Coupon Code Catalog
const PROMO_CODES: Record<
  string,
  { code: string; label: string; type: 'percent' | 'fixed'; value: number; minSpend: number }
> = {
  PRIME20: {
    code: 'PRIME20',
    label: '20% Off Prime Member Deal',
    type: 'percent',
    value: 20,
    minSpend: 100,
  },
  SAVE10: {
    code: 'SAVE10',
    label: '10% Off Sitewide Savings',
    type: 'percent',
    value: 10,
    minSpend: 50,
  },
  WELCOME15: {
    code: 'WELCOME15',
    label: '$15 Off Welcome Order',
    type: 'fixed',
    value: 15,
    minSpend: 75,
  },
};

function calculateDiscount(subtotal: number, rawCode?: string) {
  if (!rawCode) return { discountAmount: 0, appliedPromo: null };
  const normalized = rawCode.trim().toUpperCase();
  const promo = PROMO_CODES[normalized];
  if (!promo || subtotal < promo.minSpend) {
    return { discountAmount: 0, appliedPromo: null };
  }
  const discountAmount =
    promo.type === 'percent'
      ? Number(((subtotal * promo.value) / 100).toFixed(2))
      : Math.min(subtotal, promo.value);
  return { discountAmount, appliedPromo: promo };
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve generated studio product images in both dev and production
  app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));

  // ============================================================================
  // 1. AUTHENTICATION & DEMO ROLE SWITCHER ROUTES
  // ============================================================================
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password || password.length < 6) {
        return res
          .status(400)
          .json({ error: 'Name, valid email, and password (min 6 chars) are required.' });
      }
      const existing = await dbRepository.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: IUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: 'customer',
        shippingAddress: {
          fullName: name.trim(),
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          phone: '',
        },
        createdAt: new Date().toISOString(),
      };
      const created = await dbRepository.createUser(newUser);
      const token = signUserToken(created);
      return res.status(201).json({ user: sanitizeUser(created), token });
    } catch (err) {
      return res.status(500).json({ error: 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const user = await dbRepository.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = signUserToken(user);
      return res.json({ user: sanitizeUser(user), token });
    } catch {
      return res.status(500).json({ error: 'Login failed.' });
    }
  });

  // One-click Demo Account Switcher for Customer and Admin roles
  app.post('/api/auth/demo-switch', async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const targetEmail = role === 'admin' ? 'admin@amazona.com' : 'customer@amazona.com';
      const user = await dbRepository.findUserByEmail(targetEmail);
      if (!user) {
        return res.status(404).json({ error: 'Demo account not found.' });
      }
      const token = signUserToken(user);
      return res.json({ user: sanitizeUser(user), token });
    } catch {
      return res.status(500).json({ error: 'Failed to switch demo account.' });
    }
  });

  app.get('/api/auth/me', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    const user = await dbRepository.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: sanitizeUser(user) });
  });

  app.put('/api/auth/address', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    const updated = await dbRepository.updateUserAddress(req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: sanitizeUser(updated) });
  });

  // ============================================================================
  // 2. PRODUCT DISCOVERY, FILTERING, PAGINATION & REVIEWS
  // ============================================================================
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const {
        search = '',
        category = 'All',
        minPrice,
        maxPrice,
        minRating,
        sort = 'featured',
        page = '1',
        limit = '8',
      } = req.query as Record<string, string>;

      let items = await dbRepository.findProducts();

      // Categories list from full catalog
      const allCategories = ['All', ...Array.from(new Set(items.map((p) => p.category)))];

      // 1. Search by title, brand, category, or description
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }

      // 2. Filter by category
      if (category && category !== 'All') {
        items = items.filter((p) => p.category === category);
      }

      // 3. Filter by price range
      if (minPrice !== undefined && minPrice !== '') {
        const min = Number(minPrice);
        if (!Number.isNaN(min)) items = items.filter((p) => p.price >= min);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const max = Number(maxPrice);
        if (!Number.isNaN(max)) items = items.filter((p) => p.price <= max);
      }

      // 4. Filter by minimum star rating
      if (minRating !== undefined && minRating !== '') {
        const minR = Number(minRating);
        if (!Number.isNaN(minR) && minR > 0) {
          items = items.filter((p) => p.rating >= minR);
        }
      }

      // 5. Sort products
      items = [...items].sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating || b.numReviews - a.numReviews;
        if (sort === 'popular') return b.numReviews - a.numReviews || b.rating - a.rating;
        // default: featured
        return Number(b.isFeatured) - Number(a.isFeatured);
      });

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 8);
      const totalItems = items.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));
      const safePage = Math.min(pageNum, totalPages);
      const paginated = items.slice((safePage - 1) * limitNum, safePage * limitNum);

      return res.json({
        products: paginated,
        totalItems,
        totalPages,
        currentPage: safePage,
        categories: allCategories,
      });
    } catch {
      return res.status(500).json({ error: 'Failed to load products.' });
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    const product = await dbRepository.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ product });
  });

  // Submit Customer Product Review & Star Rating
  app.post(
    '/api/products/:id/reviews',
    verifyToken,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const product = await dbRepository.findProductById(req.params.id);
        if (!product) {
          return res.status(404).json({ error: 'Product not found.' });
        }
        const { rating, title, comment } = req.body;
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5 || !comment?.trim()) {
          return res
            .status(400)
            .json({ error: 'Please provide a valid star rating (1-5) and written review.' });
        }

        const newReview: IReview = {
          id: `rev-${Date.now()}`,
          userId: req.user!.id,
          userName: req.user!.name,
          rating: numericRating,
          title: (title || 'Verified Customer Review').trim(),
          comment: comment.trim(),
          verifiedPurchase: true,
          createdAt: new Date().toISOString(),
        };

        const updatedReviews = [newReview, ...(product.reviews || [])];
        const avgRating = Number(
          (
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
          ).toFixed(1)
        );

        const updatedProduct = await dbRepository.updateProduct(product.id, {
          reviews: updatedReviews,
          numReviews: updatedReviews.length,
          rating: avgRating,
        });

        return res.status(201).json({ product: updatedProduct, review: newReview });
      } catch {
        return res.status(500).json({ error: 'Failed to submit review.' });
      }
    }
  );

  // ============================================================================
  // 3. PROMO CODES, STRIPE PAYMENT INTENT & ORDER CREATION
  // ============================================================================
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const normalized = (code || '').trim().toUpperCase();
    const promo = PROMO_CODES[normalized];
    if (!promo) {
      return res.status(404).json({
        error: 'Invalid promo code. Try PRIME20 (20% off $100+), SAVE10 (10% off $50+), or WELCOME15 ($15 off $75+).',
      });
    }
    const numericSubtotal = Number(subtotal) || 0;
    if (numericSubtotal < promo.minSpend) {
      return res.status(400).json({
        error: `Code ${promo.code} requires a minimum subtotal of $${promo.minSpend.toFixed(2)}.`,
      });
    }
    const { discountAmount } = calculateDiscount(numericSubtotal, normalized);
    return res.json({
      promo,
      discountAmount,
    });
  });

  // Create Stripe PaymentIntent (Interactive Simulation with Server-Side Price Verification)
  app.post(
    '/api/payments/create-intent',
    verifyToken,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { items, couponCode } = req.body as {
          items: { productId: string; quantity: number }[];
          couponCode?: string;
        };

        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'Cart is empty.' });
        }

        let subtotal = 0;
        for (const item of items) {
          const prod = await dbRepository.findProductById(item.productId);
          if (!prod) {
            return res.status(404).json({ error: `Product ${item.productId} no longer exists.` });
          }
          if (prod.stock < item.quantity) {
            return res.status(400).json({
              error: `Insufficient stock for "${prod.title}" (${prod.stock} available).`,
            });
          }
          subtotal += prod.price * item.quantity;
        }

        subtotal = Number(subtotal.toFixed(2));
        const { discountAmount, appliedPromo } = calculateDiscount(subtotal, couponCode);
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const shippingCost = taxableAmount >= 75 ? 0 : 9.99;
        const taxAmount = Number((taxableAmount * 0.085).toFixed(2));
        const totalAmount = Number((taxableAmount + shippingCost + taxAmount).toFixed(2));

        const paymentIntentId = `pi_3Q9${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

        return res.json({
          paymentIntentId,
          clientSecret,
          breakdown: {
            subtotal,
            discountAmount,
            couponCode: appliedPromo?.code,
            shippingCost,
            taxAmount,
            totalAmount,
          },
        });
      } catch {
        return res.status(500).json({ error: 'Failed to initialize Stripe PaymentIntent.' });
      }
    }
  );

  // Confirm Payment & Create Verified Order
  app.post('/api/orders', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        items,
        shippingAddress,
        couponCode,
        paymentIntentId,
        paymentMethodSummary,
      } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Cannot place an empty order.' });
      }
      if (
        !shippingAddress?.fullName ||
        !shippingAddress?.street ||
        !shippingAddress?.city ||
        !shippingAddress?.postalCode
      ) {
        return res.status(400).json({ error: 'Complete shipping address is required.' });
      }

      let subtotal = 0;
      const verifiedItems: IOrder['items'] = [];

      // Validate stock and lock prices server-side
      for (const reqItem of items) {
        const prod = await dbRepository.findProductById(reqItem.productId);
        if (!prod) {
          return res.status(404).json({ error: `Product not found.` });
        }
        const qty = Math.max(1, Number(reqItem.quantity) || 1);
        if (prod.stock < qty) {
          return res.status(400).json({
            error: `Only ${prod.stock} units of "${prod.title}" remain in stock.`,
          });
        }
        subtotal += prod.price * qty;
        verifiedItems.push({
          productId: prod.id,
          title: prod.title,
          brand: prod.brand,
          sku: prod.sku,
          price: prod.price,
          quantity: qty,
          image: prod.image,
        });
      }

      // Decrement product inventory
      for (const vItem of verifiedItems) {
        const prod = await dbRepository.findProductById(vItem.productId);
        if (prod) {
          await dbRepository.updateProduct(prod.id, {
            stock: Math.max(0, prod.stock - vItem.quantity),
          });
        }
      }

      subtotal = Number(subtotal.toFixed(2));
      const { discountAmount, appliedPromo } = calculateDiscount(subtotal, couponCode);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const shippingCost = taxableAmount >= 75 ? 0 : 9.99;
      const taxAmount = Number((taxableAmount * 0.085).toFixed(2));
      const totalAmount = Number((taxableAmount + shippingCost + taxAmount).toFixed(2));

      // Save user's default shipping address
      await dbRepository.updateUserAddress(req.user!.id, shippingAddress);

      const now = new Date();
      const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const newOrder: IOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `AMZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: req.user!.id,
        customerName: shippingAddress.fullName || req.user!.name,
        customerEmail: req.user!.email,
        items: verifiedItems,
        shippingAddress,
        subtotal,
        discountAmount,
        couponCode: appliedPromo?.code,
        taxAmount,
        shippingCost,
        totalAmount,
        paymentIntentId: paymentIntentId || `pi_${Date.now()}`,
        paymentMethodSummary: paymentMethodSummary || 'Visa ending in 4242',
        paymentStatus: 'paid',
        orderStatus: 'Processing',
        trackingNumber: `1Z999AA101${Math.floor(10000000 + Math.random() * 89999999)}`,
        estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const created = await dbRepository.createOrder(newOrder);
      return res.status(201).json({ order: created });
    } catch {
      return res.status(500).json({ error: 'Order creation failed.' });
    }
  });

  app.get('/api/orders/my-orders', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    const orders = await dbRepository.findOrdersByUser(req.user!.id);
    return res.json({ orders });
  });

  app.get('/api/orders/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
    const order = await dbRepository.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order.' });
    }
    return res.json({ order });
  });

  // ============================================================================
  // 4. ADMIN DASHBOARD ROUTES (PRODUCTS, INVENTORY, ORDERS, CUSTOMERS, ANALYTICS)
  // ============================================================================
  app.get(
    '/api/admin/overview',
    verifyToken,
    requireAdmin,
    async (_req: AuthenticatedRequest, res: Response) => {
      const [products, orders, users] = await Promise.all([
        dbRepository.findProducts(),
        dbRepository.findOrders(),
        dbRepository.findUsers(),
      ]);

      const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
      const totalRevenue = Number(
        validOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)
      );
      const totalUnitsSold = validOrders.reduce(
        (sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0),
        0
      );
      const lowStockProducts = products.filter((p) => p.stock <= 15);

      const customersWithStats = users.map((u) => {
        const userOrders = orders.filter((o) => o.userId === u.id);
        const totalSpent = Number(
          userOrders
            .filter((o) => o.orderStatus !== 'Cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0)
            .toFixed(2)
        );
        return {
          ...sanitizeUser(u),
          orderCount: userOrders.length,
          totalSpent,
        };
      });

      return res.json({
        metrics: {
          totalRevenue,
          totalOrders: orders.length,
          totalUnitsSold,
          totalCustomers: users.filter((u) => u.role === 'customer').length,
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          mongoConnected: dbRepository.isMongoActive(),
        },
        products,
        orders,
        customers: customersWithStats,
      });
    }
  );

  app.post(
    '/api/admin/products',
    verifyToken,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const {
          title,
          brand,
          category,
          price,
          originalPrice,
          stock,
          image,
          description,
          features,
          isFeatured,
          sku,
        } = req.body;

        if (!title || !brand || !category || price === undefined) {
          return res.status(400).json({ error: 'Title, brand, category, and price are required.' });
        }

        const numPrice = Number(price);
        const numOrig = Number(originalPrice) || Number((numPrice * 1.2).toFixed(2));
        const newProduct: IProduct = {
          id: `prd-${Date.now()}`,
          sku: sku?.trim() || `AMZ-NEW-${Math.floor(100 + Math.random() * 900)}`,
          title: title.trim(),
          slug: title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
          category: category.trim(),
          brand: brand.trim(),
          price: numPrice,
          originalPrice: numOrig,
          rating: 4.8,
          numReviews: 0,
          stock: Math.max(0, Number(stock) || 0),
          image:
            image?.trim() || '/src/assets/images/product_headphones_pro_1793882040985.jpg',
          features: Array.isArray(features)
            ? features
            : typeof features === 'string'
              ? features
                  .split('\n')
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : ['Commercial-grade build quality', 'Backed by 2-year Amazona warranty'],
          description:
            description?.trim() ||
            'Premium marketplace product verified by Amazona quality assurance.',
          isFeatured: Boolean(isFeatured),
          reviews: [],
          createdAt: new Date().toISOString(),
        };

        const created = await dbRepository.createProduct(newProduct);
        return res.status(201).json({ product: created });
      } catch {
        return res.status(500).json({ error: 'Failed to create product.' });
      }
    }
  );

  app.put(
    '/api/admin/products/:id',
    verifyToken,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const updates = { ...req.body };
        if (typeof updates.features === 'string') {
          updates.features = updates.features
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        if (updates.price !== undefined) updates.price = Number(updates.price);
        if (updates.originalPrice !== undefined)
          updates.originalPrice = Number(updates.originalPrice);
        if (updates.stock !== undefined) updates.stock = Math.max(0, Number(updates.stock));

        const updated = await dbRepository.updateProduct(req.params.id, updates);
        if (!updated) {
          return res.status(404).json({ error: 'Product not found.' });
        }
        return res.json({ product: updated });
      } catch {
        return res.status(500).json({ error: 'Failed to update product.' });
      }
    }
  );

  app.delete(
    '/api/admin/products/:id',
    verifyToken,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      const deleted = await dbRepository.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      return res.json({ success: true, id: req.params.id });
    }
  );

  app.put(
    '/api/admin/orders/:id/status',
    verifyToken,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      const { orderStatus, estimatedDelivery } = req.body as {
        orderStatus: OrderStatusType;
        estimatedDelivery?: string;
      };
      const updated = await dbRepository.updateOrderStatus(
        req.params.id,
        orderStatus,
        estimatedDelivery
      );
      if (!updated) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      return res.json({ order: updated });
    }
  );

  // Express Mongoose/Network error fallback middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (
      err.name === 'MongooseError' ||
      err.name === 'MongoNetworkError' ||
      err.message?.includes('buffering timed out')
    ) {
      if (req.method === 'GET') {
        return res.json(req.path.endsWith('s') ? [] : {});
      }
      return res.status(503).json({ error: 'Database temporarily unavailable' });
    }
    next(err);
  });

  // ============================================================================
  // 5. VITE FRONTEND MIDDLEWARE (DEV) OR STATIC BUNDLE (PROD)
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Amazona Server] Full-stack marketplace listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
