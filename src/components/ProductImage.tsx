import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectClass = 'aspect-[4/3]',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`${aspectClass} w-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center select-none`}
      >
        <Package className="w-10 h-10 text-slate-400 mb-2" />
        <span className="text-xs font-medium text-slate-500 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} w-full overflow-hidden bg-slate-100 relative`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    </div>
  );
};
