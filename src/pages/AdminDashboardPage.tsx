import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Search,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  X,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Order, OrderStatus, Product, User } from '../types/marketplace';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { switchDemoRole } from '../redux/slices/authSlice';
import { fetchCatalogProducts } from '../redux/slices/catalogSlice';
import { ProductImage } from '../components/ProductImage';

const PRESET_IMAGES = [
  {
    label: 'Wireless Studio Headphones',
    url: '/src/assets/images/product_headphones_pro_1793882040985.jpg',
  },
  {
    label: 'Commercial Espresso Machine',
    url: '/src/assets/images/product_espresso_machine_1793882043467.jpg',
  },
  {
    label: 'Titanium GPS Smartwatch',
    url: '/src/assets/images/product_smartwatch_titanium_1793882043708.jpg',
  },
  {
    label: 'Ergonomic Mesh Office Chair',
    url: '/src/assets/images/product_ergonomic_chair_1793882044259.jpg',
  },
  {
    label: 'Workstation Dock & Audio Bundle',
    url: '/src/assets/images/hero_flagship_workspace_1793882040414.jpg',
  },
];

interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  mongoConnected: boolean;
}

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers'>('products');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState({
    title: '',
    brand: '',
    category: 'Audio & Tech',
    sku: '',
    price: '299.00',
    originalPrice: '349.00',
    stock: '25',
    image: PRESET_IMAGES[0].url,
    description: '',
    features: '',
    isFeatured: true,
  });

  const loadAdminOverview = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/overview');
      setMetrics(data.metrics);
      setProducts(data.products);
      setOrders(data.orders);
      setCustomers(data.customers);
    } catch {
      // handled by role check
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminOverview();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState({
      title: '',
      brand: 'Noir Audio',
      category: 'Audio & Tech',
      sku: `AMZ-PRO-${Math.floor(100 + Math.random() * 900)}`,
      price: '249.00',
      originalPrice: '299.00',
      stock: '20',
      image: PRESET_IMAGES[0].url,
      description:
        'Commercial-grade marketplace hardware backed by 2-year Amazona factory warranty.',
      features:
        'Precision CNC anodized aluminum enclosure\n2-year direct manufacturer replacement warranty\nEligible for FREE Next-Day Prime Delivery',
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      title: product.title,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      stock: String(product.stock),
      image: product.image,
      description: product.description,
      features: (product.features || []).join('\n'),
      isFeatured: product.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiClient.put(`/admin/products/${editingProduct.id}`, formState);
      } else {
        await apiClient.post('/admin/products', formState);
      }
      setIsModalOpen(false);
      await loadAdminOverview();
      dispatch(fetchCatalogProducts(undefined));
    } catch {
      // ignore
    }
  };

  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    await apiClient.put(`/admin/products/${product.id}`, { stock: newStock });
    await loadAdminOverview();
    dispatch(fetchCatalogProducts(undefined));
  };

  const handleDeleteProduct = async (id: string) => {
    await apiClient.delete(`/admin/products/${id}`);
    await loadAdminOverview();
    dispatch(fetchCatalogProducts(undefined));
  };

  const handleOrderStatusChange = async (orderId: string, orderStatus: OrderStatus) => {
    await apiClient.put(`/admin/orders/${orderId}/status`, { orderStatus });
    await loadAdminOverview();
  };

  // RBAC Gate: Require Admin Role
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-lg mx-auto space-y-4">
          <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto" />
          <h1 className="font-display text-xl font-bold text-slate-900">
            Administrator Privileges Required
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Admin Operations Console is protected by Role-Based Access Control (RBAC).
            Click below to switch into the Demo Admin session (`admin@amazona.com`) in one
            click.
          </p>
          <button
            type="button"
            onClick={() => dispatch(switchDemoRole('admin'))}
            className="px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Demo Admin Account (Elena Vance)</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8">
      {/* Top Admin Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Admin Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-medium">
              Inventory, Orders &amp; Customer Analytics
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Marketplace Operations Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 4-Column Sales & Operations KPI Strip (Tabular Numerals) */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Gross Merchandise Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              Verified Stripe PaymentIntents
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Customer Orders</span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {metrics.totalOrders}
            </p>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              {metrics.totalUnitsSold} total units fulfilled
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Registered Customers</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {metrics.totalCustomers}
            </p>
            <p className="text-xs text-slate-500">JWT &amp; bcrypt verified accounts</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Catalog SKUs &amp; Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {metrics.totalProducts} SKUs
            </p>
            <p className="text-xs text-amber-700 font-medium tabular-nums">
              {metrics.lowStockCount} items at or below 15 units
            </p>
          </div>
        </div>
      )}

      {/* Segmented Navigation Tabs & Search Filter */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div className="inline-flex bg-slate-200/80 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Products &amp; Inventory ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registered Users ({customers.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter ${activeTab}...`}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* TAB 1: PRODUCTS & INVENTORY TABLE */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">SKU · Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Rating</th>
                  <th className="py-3 px-4 font-semibold text-right">Stock Level</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading catalog inventory...
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded border border-slate-200 overflow-hidden shrink-0">
                            <ProductImage
                              src={prod.image}
                              alt={prod.title}
                              aspectClass="aspect-[4/3]"
                            />
                          </div>
                          <div>
                            <Link
                              to={`/product/${prod.id}`}
                              className="font-semibold text-slate-900 hover:text-amber-700 line-clamp-1 max-w-xs"
                            >
                              {prod.title}
                            </Link>
                            <p className="text-[11px] text-slate-500">{prod.brand}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-800">{prod.sku}</span>
                        <span aria-hidden="true" className="mx-1.5 text-slate-300">
                          ·
                        </span>
                        <span className="text-slate-500">{prod.category}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ${prod.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {prod.rating.toFixed(1)} ★ ({prod.numReviews})
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <span
                            className={`font-mono font-semibold tabular-nums ${
                              prod.stock <= 15 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                          <div className="inline-flex border border-slate-200 rounded bg-white">
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(prod, -1)}
                              className="px-1.5 py-0.5 text-[11px] font-mono hover:bg-slate-100 cursor-pointer"
                              title="Decrement stock by 1"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStockAdjust(prod, 5)}
                              className="px-1.5 py-0.5 text-[11px] font-mono border-l border-slate-200 hover:bg-slate-100 cursor-pointer"
                              title="Restock +5 units"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                            title="Edit product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-md cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS MANAGEMENT TABLE */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">Order ID · Date</th>
                  <th className="py-3 px-4 font-semibold">Customer · Destination</th>
                  <th className="py-3 px-4 font-semibold">Payment Intent</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <p className="font-mono font-semibold text-slate-900 tabular-nums">
                        {ord.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.customerEmail} · {ord.shippingAddress.city},{' '}
                        {ord.shippingAddress.state}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-700">{ord.paymentIntentId}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {ord.paymentMethodSummary} ({ord.paymentStatus})
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${ord.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) =>
                          handleOrderStatusChange(
                            ord.id,
                            e.target.value as OrderStatus
                          )
                        }
                        className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${ord.id}`}
                        className="text-amber-700 hover:underline font-semibold"
                      >
                        View Receipt →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REGISTERED CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">User Name</th>
                  <th className="py-3 px-4 font-semibold">Email · Role</th>
                  <th className="py-3 px-4 font-semibold">Default Shipping Location</th>
                  <th className="py-3 px-4 font-semibold text-right">Orders Placed</th>
                  <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{cust.name}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700">{cust.email}</span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-300">
                        ·
                      </span>
                      <span
                        className={`font-semibold uppercase text-[11px] ${
                          cust.role === 'admin' ? 'text-amber-700' : 'text-slate-600'
                        }`}
                      >
                        {cust.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {cust.shippingAddress?.city
                        ? `${cust.shippingAddress.city}, ${cust.shippingAddress.state} ${cust.shippingAddress.postalCode}`
                        : 'Not set'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {cust.orderCount ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${(cust.totalSpent ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editingProduct ? 'Update Catalog Product' : 'Add New Catalog Product'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) =>
                      setFormState({ ...formState, title: e.target.value })
                    }
                    placeholder="e.g. Noir Studio Reference Monitors"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formState.brand}
                    onChange={(e) =>
                      setFormState({ ...formState, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({ ...formState, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Audio & Tech">Audio &amp; Tech</option>
                    <option value="Home & Kitchen">Home &amp; Kitchen</option>
                    <option value="Fitness & Outdoors">Fitness &amp; Outdoors</option>
                    <option value="Workspace & Office">Workspace &amp; Office</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.price}
                    onChange={(e) =>
                      setFormState({ ...formState, price: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Original List Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.originalPrice}
                    onChange={(e) =>
                      setFormState({ ...formState, originalPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Warehouse Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.stock}
                    onChange={(e) =>
                      setFormState({ ...formState, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.sku}
                    onChange={(e) =>
                      setFormState({ ...formState, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Studio Product Image Preset
                  </label>
                  <select
                    value={formState.image}
                    onChange={(e) =>
                      setFormState({ ...formState, image: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {PRESET_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Key Specifications (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formState.features}
                    onChange={(e) =>
                      setFormState({ ...formState, features: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
