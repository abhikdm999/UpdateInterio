import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToHistory } from '../../store/slices/historySlice';
import type { Product } from '@shared/schema';

interface ProductDetailProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    // Add to history when user interacts with product
    dispatch(addToHistory(product));
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleClose = () => {
    // Add to history when user views product
    dispatch(addToHistory(product));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Content */}
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                {/* Product Images */}
                <div className="p-6 lg:p-8 space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? 'border-yellow-500 ring-2 ring-yellow-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 lg:p-8 space-y-6">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {product.name}
                    </h1>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-gray-600 ml-2">({product.rating})</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{product.reviewCount} reviews</span>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg lg:text-xl text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Truck className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Free Delivery</p>
                        <p className="text-sm text-gray-600">On orders above ₹500</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Warranty</p>
                        <p className="text-sm text-gray-600">1 year guarantee</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <RotateCcw className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Easy Returns</p>
                        <p className="text-sm text-gray-600">30 day return policy</p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="text-gray-700 font-medium">Quantity:</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWishlistToggle}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                          isInWishlist
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetail;