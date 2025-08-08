import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../../services/apiService';
import ProductGrid from './ProductGrid';

const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const categories = categoriesData?.categories || [];

  return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
            <p className="text-xl text-gray-600">Discover our complete collection of premium furniture and decor</p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                {!categoriesLoading && categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="latest">Latest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="popularity">Most Popular</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid 
            category={selectedCategory === 'all' ? undefined : selectedCategory}
            search={searchQuery || undefined}
          />
        </div>
      </div>
  );
};

export default ProductsPage;