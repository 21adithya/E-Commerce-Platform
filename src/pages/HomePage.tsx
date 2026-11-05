import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Truck,
  Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchCatalogProducts,
  resetCatalogFilters,
  setCatalogFilters,
  CatalogFilters,
} from '../redux/slices/catalogSlice';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';

const HERO_IMAGE = '/src/assets/images/hero_flagship_workspace_1793882040414.jpg';

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $200', min: '0', max: '200' },
  { label: '$200 – $450', min: '200', max: '450' },
  { label: '$450 & Above', min: '450', max: '' },
];

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    categories,
    totalItems,
    totalPages,
    currentPage,
    filters,
    loading,
  } = useAppSelector((state) => state.catalog);

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    dispatch(fetchCatalogProducts(undefined));
  }, [dispatch]);

  const applyFilterUpdate = (patch: Partial<CatalogFilters>) => {
    const updated = { ...patch, page: patch.page ?? 1 };
    dispatch(setCatalogFilters(updated));
    dispatch(fetchCatalogProducts(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilterUpdate({ search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(resetCatalogFilters());
    dispatch(
      fetchCatalogProducts({
        search: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        minRating: 0,
        sort: 'featured',
        page: 1,
      })
    );
  };

  const activePriceIndex = PRICE_RANGES.findIndex(
    (r) => r.min === filters.minPrice && r.max === filters.maxPrice
  );

  return (
    <div className="space-y-12 pb-16">
      {/* SECTION 1: Storefront Split-Screen Hero Showcase */}
      <section className="bg-[#0F172A] text-white border-b border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Copy & CTA Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <span>Featured Flagship Collection</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct Factory Warranty</span>
                  <span aria-hidden="true">·</span>
                  <span>Free Next-Day Prime Delivery</span>
                </div>

                <h1
                  className="font-display font-bold tracking-tight text-white leading-[1.12]"
                  style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.35rem)' }}
                >
                  Precision Audio, Barista Craft &amp; Ergonomic Workspaces.
                </h1>

                <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                  Discover benchmark studio headphones, dual-boiler Italian espresso machines,
                  and aerospace-grade titanium fitness instruments—backed by instant price-lock
                  checkout and real-time package tracking.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalog-section"
                  className="px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Shop Featured Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/product/prd-101"
                  className="px-5 py-3 text-sm font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Inspect Noir Studio Pro ($279.00)
                </Link>
              </div>

              {/* Unboxed quantitative highlights */}
              <div className="pt-4 border-t border-slate-800/90 grid grid-cols-3 gap-6 text-xs text-slate-300">
                <div>
                  <p className="font-mono text-lg font-bold text-white tabular-nums">20% OFF</p>
                  <p className="text-slate-400">Code PRIME20 ($100+)</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-white tabular-nums">4.8 ★</p>
                  <p className="text-slate-400">Verified Buyer Rating</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-white tabular-nums">$0.00</p>
                  <p className="text-slate-400">Free Shipping Over $75</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-xl overflow-hidden border border-slate-800 relative flex-1 bg-slate-900">
                <ProductImage
                  src={HERO_IMAGE}
                  alt="Flagship studio workspace featuring matte black headphones, aluminum laptop, and smart speaker"
                  aspectClass="aspect-[16/9] lg:aspect-auto lg:h-full"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-6">
                  <div className="flex items-center justify-between w-full gap-4 text-white">
                    <div>
                      <p className="text-xs text-amber-400 font-medium">
                        Ambient Tech · Workstation Bundle
                      </p>
                      <p className="font-display text-base font-semibold">
                        Ambient Pro 16&quot; Thunderbolt 4 Dock &amp; Spatial Audio
                      </p>
                    </div>
                    <Link
                      to="/product/prd-105"
                      className="px-4 py-2 text-xs font-semibold bg-white/95 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
                    >
                      $419.00 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Product Discovery, Multi-Facet Filtering & Catalog Grid */}
      <section id="catalog-section" className="max-w-[1280px] mx-auto px-6 space-y-6">
        {/* Search & Filter Control Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (e.target.value === '') {
                      applyFilterUpdate({ search: '' });
                    }
                  }}
                  placeholder="Search products by name, brand, category, or SKU..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Search Catalog
              </button>
            </form>

            {/* Sort Order & Reset Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <label htmlFor="sort-select" className="font-medium whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={filters.sort}
                  onChange={(e) =>
                    applyFilterUpdate({
                      sort: e.target.value as CatalogFilters['sort'],
                    })
                  }
                  className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="featured">Featured Recommendations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Avg. Customer Review</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {(filters.search ||
                filters.category !== 'All' ||
                filters.minPrice !== '' ||
                filters.maxPrice !== '' ||
                filters.minRating > 0) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Segmented Category Filter & Price / Rating Facets */}
          <div className="pt-3 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Category Segmented Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => applyFilterUpdate({ category: cat })}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filters.category === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Range & Minimum Star Rating Filter Controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Price Facet */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() =>
                      applyFilterUpdate({ minPrice: range.min, maxPrice: range.max })
                    }
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activePriceIndex === idx
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Rating Facet */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {[
                  { label: 'All Ratings', value: 0 },
                  { label: '4.5★ & Up', value: 4.5 },
                  { label: '4.8★ & Up', value: 4.8 },
                ].map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => applyFilterUpdate({ minRating: r.value })}
                    className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      filters.minRating === r.value
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <div>
            Showing{' '}
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {products.length}
            </span>{' '}
            of{' '}
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {totalItems}
            </span>{' '}
            marketplace products
            {filters.category !== 'All' && (
              <>
                {' '}
                in <span className="font-semibold text-slate-900">{filters.category}</span>
              </>
            )}
            {filters.search && (
              <>
                {' '}
                matching <span className="font-semibold text-slate-900">&quot;{filters.search}&quot;</span>
              </>
            )}
          </div>
          <div className="font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="pt-3 flex justify-between items-center">
                    <div className="h-6 bg-slate-200 rounded w-20" />
                    <div className="h-8 bg-slate-200 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto">
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-2">
              No products matched your current filters
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Try broadening your price range, clearing the search query, or switching back to
              All Categories.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => applyFilterUpdate({ page: currentPage - 1 })}
              className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => applyFilterUpdate({ page: pageNum })}
                  className={`w-9 h-9 text-xs font-mono font-semibold rounded-lg transition-colors tabular-nums cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilterUpdate({ page: currentPage + 1 })}
              className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* SECTION 3: Marketplace Guarantees & Fulfillment Architecture */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              01. Expedited Prime Fulfillment
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every in-stock item ships with live stage-by-stage tracking numbers from our regional
              distribution centers, free on orders over $75.00.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              02. Stripe Price-Lock Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All PaymentIntents validate item prices, promotional coupon discounts, and warehouse
              stock levels server-side before capturing payment.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              03. 30-Day A-to-Z Return Protection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct manufacturer warranty coverage plus hassle-free 30-day returns on all audio,
              home espresso, fitness, and workstation hardware.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
