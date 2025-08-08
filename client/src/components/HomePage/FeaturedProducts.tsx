import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductGrid from '../Products/ProductGrid';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/apiService';
import { Loader } from 'lucide-react';

interface FeaturedProductsProps {
  onNavigate: (page: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onNavigate }) => {
  const { data: featuredProductsData, isLoading: loading } = useQuery({
    queryKey: ['/api/products', { featured: true, limit: 6 }],
    queryFn: () => productService.getProducts({ featured: true, limit: 6 }),
  });

  const featuredProducts = featuredProductsData?.products || [];

  return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of premium furniture and decor
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading featured products...</p>
              </div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} onNavigate={onNavigate} featured={true} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured products available</p>
            </div>
          )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('products')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              View All Products
            </motion.button>
          </motion.div>
      </section>
  );
};

export default FeaturedProducts;