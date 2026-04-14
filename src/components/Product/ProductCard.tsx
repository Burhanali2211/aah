import React, { useMemo, useCallback, memo, useState } from 'react';
import { Star, Heart, TrendingUp, Flame, Shield, Zap, Info } from 'lucide-react';
import { Product } from '../../types';
import { useCart, useWishlist } from '../../contexts/ShoppingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ProductImage from '../Common/ProductImage';
import { AddToCartButton } from './AddToCartButton';
import { BuyNowButton } from './BuyNowButton';
import { motion, AnimatePresence } from 'framer-motion';

export type ProductCardVariant = 'default' | 'list' | 'featured' | 'best-seller' | 'luxury' | 'compact';

interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant;
  rank?: number;
  onCompareToggle?: (id: string) => void;
  isComparing?: boolean;
  priority?: 'high' | 'auto';
}

/**
 * Unified Product Card Component
 * A single source of truth for all product display styles across the application.
 */
export const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  variant = 'default',
  rank,
  onCompareToggle,
  isComparing = false,
  priority = 'auto'
}) => {
  const { isInWishlist, addItem: addToWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { user, showAuthModal } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  }, [addToWishlist, product]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showAuthModal(product, 'cart'); return; }
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  }, [addToCart, product, user, showAuthModal]);

  const discount = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.price, product.originalPrice]);

  const images = useMemo(() => 
    product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg'],
    [product.images]
  );

  // Layout Renders
  if (variant === 'list') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex flex-row gap-4 sm:gap-6 p-3 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden"
      >
        <div className="relative w-32 sm:w-48 md:w-56 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 aspect-square">
          <Link to={`/products/${product.id}`} className="block h-full">
            <ProductImage
              product={product}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={product.name}
              priority={priority}
            />
          </Link>
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              -{discount}%
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-sm font-bold text-gray-700 ml-1">{product.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <Link to={`/products/${product.id}`}>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-green-800 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            
            <p className="hidden sm:block text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
              {product.shortDescription || product.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleWishlistToggle}
                className={`p-2.5 rounded-xl border transition-all ${
                  isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100'
                }`}
              >
                <Heart className="h-4 w-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
              <AddToCartButton product={product} size="md" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact Layout (Horizontal, minimal)
  if (variant === 'compact') {
    return (
      <Link to={`/products/${product.id}`} className="block">
        <div className="flex bg-white rounded-xl border border-gray-100 p-2 gap-3 hover:border-green-300 transition-colors">
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
            <ProductImage product={product} className="w-full h-full object-cover" size="small" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
              {discount > 0 && <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5 mt-0.5">
                <Star className="h-2 w-2 text-amber-500 fill-current" />
                <span className="text-[10px] font-bold text-gray-500">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Best Seller / Featured Variants
  const isLuxury = variant === 'luxury';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 h-full ${
        isLuxury 
          ? 'border-amber-200 hover:border-amber-400 shadow-md ring-1 ring-amber-100/50' 
          : 'border-gray-100 hover:border-green-200 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-50">
        <Link to={`/products/${product.id}`} className="block h-full">
          <ProductImage
            product={product}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={product.name}
            priority={priority}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        </div>

      {/* Content */}
      <div className={`flex flex-col p-2 sm:p-4 gap-1 sm:gap-1.5 ${variant === 'luxury' ? 'bg-amber-50/30' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-[13px] sm:text-base leading-tight line-clamp-1 sm:line-clamp-2 sm:min-h-[2.5rem] group-hover:text-green-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center bg-gray-100/50 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
            <Star className="h-2.5 w-2.5 text-amber-500 fill-current" />
            <span className="ml-1 text-[10px] font-bold text-gray-700">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-baseline gap-1">
            <span className={`font-black ${variant === 'luxury' ? 'text-amber-900' : 'text-gray-900'} text-base sm:text-xl`}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          <button
            onClick={handleWishlistToggle}
            className={`transition-all duration-300 py-1 ${
              isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Buy Now (Visible only in featured/luxury or hover) */}
        <BuyNowButton
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-0"
        />
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
