import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/apiService';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import CheckoutPage from '../Checkout/CheckoutPage';
import type { Product } from '@shared/schema';

interface ProductGridProps {
  products?: Product[];
  onNavigate?: (page: string) => void;
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products: providedProducts, 
  onNavigate, 
  category, 
  search, 
  featured = false, 
  limit = 8 
}) => {
  const { data: productsData, isLoading: loading, error } = useQuery({
    queryKey: ['/api/products', { category, search, featured, limit }],
    queryFn: () => productService.getProducts({ category, search, featured, limit }),
    enabled: !providedProducts, // Only fetch if products are not provided
  });

  const products = providedProducts || productsData?.products || [];
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBuyNow = (product: Product) => {
    // Navigate to streamlined checkout
    window.dispatchEvent(new CustomEvent('navigate-to-streamlined-checkout', { 
      detail: { product } 
    }));
  };

  const handleCheckoutComplete = () => {
    setCheckoutProduct(null);
  };

  if (checkoutProduct) {
    return (
      <CheckoutPage
        product={checkoutProduct}
        onBack={() => setCheckoutProduct(null)}
        onComplete={handleCheckoutComplete}
      />
    );
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg h-64 mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Error loading products: {error?.message || 'Unknown error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most loved furniture and decor pieces
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {products.map((product, index) => {
              // Convert Supabase product to component format
              const formattedProduct = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.original_price,
                category: product.category,
                images: product.images,
                rating: product.rating,
                reviewCount: product.review_count,
                inStock: product.stock > 0,
                tags: product.tags,
                featured: product.featured,
              };

              return (
                <ProductCard
                  key={product.id}
                  product={formattedProduct}
                  onQuickView={handleQuickView}
                  onBuyNow={handleBuyNow}
                />
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;