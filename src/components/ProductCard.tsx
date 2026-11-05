import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types/marketplace';
import { ProductImage } from './ProductImage';
import { useAppDispatch } from '../redux/store';
import { addToCart } from '../redux/slices/cartSlice';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();

  const savingsPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:border-slate-300">
      <div>
        {/* Product Image (65-75% visual lead on neutral backdrop) */}
        <Link to={`/product/${product.id}`} className="block relative">
          <ProductImage
            src={product.image}
            alt={product.title}
            aspectClass="aspect-[4/3]"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="p-5">
          {/* Unboxed Metadata with middle-dot separator (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-700">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            {savingsPercent > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium tabular-nums">
                  Save {savingsPercent}%
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.id}`}
            className="block font-display text-base font-semibold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 min-h-[3rem] leading-snug"
          >
            {product.title}
          </Link>

          {/* Rating & Reviews Count (Unboxed text) */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
            </span>
            <span aria-hidden="true">·</span>
            {product.stock > 10 ? (
              <span className="text-emerald-700 font-medium">In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-amber-700 font-medium tabular-nums">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Price Baseline & Primary Action */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Free Prime Delivery</p>
        </div>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{product.stock > 0 ? 'Add to Cart' : 'Unavailable'}</span>
        </button>
      </div>
    </article>
  );
};
