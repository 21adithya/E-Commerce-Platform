import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  MessageSquarePlus,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Product } from '../types/marketplace';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { addToCart } from '../redux/slices/cartSlice';
import { switchDemoRole } from '../redux/slices/authSlice';
import { ProductImage } from '../components/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    apiClient
      .get<{ product: Product }>(`/products/${id}`)
      .then(({ data }) => {
        if (active) {
          setProduct(data.product);
          setQuantity(1);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.error || 'Product not found.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity, openDrawer: false }));
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewNotice(null);
    try {
      const { data } = await apiClient.post<{ product: Product }>(
        `/products/${product.id}/reviews`,
        {
          rating,
          title: reviewTitle.trim() || 'Verified Customer Review',
          comment: reviewComment.trim(),
        }
      );
      setProduct(data.product);
      setReviewTitle('');
      setReviewComment('');
      setRating(5);
      setReviewNotice('Thank you! Your verified review has been published.');
    } catch (err: any) {
      setReviewNotice(err.response?.data?.error || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-6 aspect-[4/3] bg-slate-200 rounded-xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-8 bg-slate-200 rounded w-5/6" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-10 max-w-md mx-auto">
          <h1 className="font-display text-lg font-bold text-slate-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            {error || 'The requested item is no longer available in our catalog.'}
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  const savingsAmount = Math.max(0, product.originalPrice - product.price);
  const savingsPercent =
    product.originalPrice > product.price
      ? Math.round((savingsAmount / product.originalPrice) * 100)
      : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-slate-900 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </div>
        <span className="font-mono text-slate-400 tabular-nums">SKU: {product.sku}</span>
      </div>

      {/* Contiguous Purchase Module (Gallery Left + Purchase & Specs Right) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <ProductImage
              src={product.image}
              alt={product.title}
              aspectClass="aspect-[4/3]"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Free Next-Day Prime Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>2-Year Factory Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Right: Contiguous Purchase & Specification Module */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-amber-700">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{product.sku}</span>
            </div>

            <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${
                      idx < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="font-mono font-bold text-slate-900 ml-1 tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span aria-hidden="true">·</span>
              <a
                href="#reviews-section"
                className="text-amber-700 hover:underline font-medium tabular-nums"
              >
                {product.numReviews} verified customer{' '}
                {product.numReviews === 1 ? 'review' : 'reviews'}
              </a>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 font-mono tabular-nums">
                    Save ${savingsAmount.toFixed(2)} ({savingsPercent}%)
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {product.stock > 0 ? (
                <span className="font-semibold text-emerald-700 tabular-nums">
                  In Stock ({product.stock} units ready to ship)
                </span>
              ) : (
                <span className="font-semibold text-red-600">Currently Out of Stock</span>
              )}
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span className="text-slate-600">
                Use code <strong className="font-mono text-slate-900">PRIME20</strong> at
                checkout for 20% off
              </span>
            </div>

            {/* Quantity & Primary Purchase Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="qty-select" className="text-xs font-medium text-slate-700">
                  Qty:
                </label>
                <select
                  id="qty-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={product.stock <= 0}
                  className="px-3 py-2.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg tabular-nums cursor-pointer"
                >
                  {Array.from({ length: Math.min(10, Math.max(1, product.stock)) }).map(
                    (_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() =>
                  dispatch(addToCart({ product, quantity, openDrawer: true }))
                }
                className="flex-1 py-2.5 px-5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleBuyNow}
                className="flex-1 py-2.5 px-5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Product Description & Key Specifications */}
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 mb-1.5">
                Product Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {product.features?.length > 0 && (
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900 mb-2">
                  Key Technical Specifications
                </h2>
                <ul className="space-y-2">
                  {product.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews & Interactive Rating Submission */}
      <section
        id="reviews-section"
        className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Left: Write a Customer Review */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-amber-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Customer Reviews &amp; Ratings
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Share your experience with other shoppers. All submitted ratings immediately
            recalculate the verified product score.
          </p>

          {!user ? (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs font-medium text-slate-800">
                Sign in to post a verified product review
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(switchDemoRole('customer'))}
                  className="px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer"
                >
                  One-Click Demo Customer Sign In
                </button>
                <Link
                  to="/auth"
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Go to Sign In Page
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleReviewSubmit}
              className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Reviewing as {user.name}
                </span>
                <span className="text-emerald-700 font-medium">Verified Account</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Overall Star Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono font-semibold text-slate-800 tabular-nums">
                    {rating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Written Review
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike about build quality, performance, or value?"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {reviewNotice && (
                <p className="text-xs font-medium text-emerald-700">{reviewNotice}</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                {submittingReview ? 'Publishing Review...' : 'Submit Customer Review'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Published Customer Reviews List */}
        <div className="lg:col-span-7 divide-y divide-slate-200">
          {product.reviews?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No customer reviews yet. Be the first to review this product!
            </div>
          ) : (
            product.reviews.map((rev) => (
              <article key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{rev.userName}</span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="text-emerald-700 font-medium">Verified Purchase</span>
                  </div>
                  <span className="text-slate-400 font-mono tabular-nums">
                    {new Date(rev.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < Math.round(rev.rating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{rev.title}</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
