import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye, Heart, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, onBuyNow }) => {
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to streamlined checkout
    window.dispatchEvent(new CustomEvent('navigate-to-streamlined-checkout', { 
      detail: { product } 
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer w-full"
      onClick={() => onQuickView(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 hover:bg-white text-gray-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-sm sm:text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <span className="text-xs sm:text-sm text-gray-500">{product.reviewCount} reviews</span>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 sm:py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;