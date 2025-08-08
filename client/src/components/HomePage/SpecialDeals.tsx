import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ShoppingCart, Timer } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

interface Deal {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    originalPrice: number;
    dealPrice: number;
    image: string;
    images: string[];
    category: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    tags: string[];
  };
  startTime: number;
  duration: number; // in milliseconds
}

const SpecialDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});
  const dispatch = useDispatch();

  // Initialize deals on component mount
  useEffect(() => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    const initialDeals: Deal[] = [
      {
        id: 'deal-1',
        product: {
          id: 'deal-product-1',
          name: 'Premium Desk Organizer',
          description: 'Elegant bamboo desk organizer with multiple compartments',
          originalPrice: 299,
          dealPrice: 1,
          image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
          images: [
            'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'Office',
          rating: 4.7,
          reviewCount: 89,
          inStock: true,
          tags: ['desk', 'organizer', 'bamboo'],
        },
        startTime: now,
        duration: twoHours,
      },
      {
        id: 'deal-2',
        product: {
          id: 'deal-product-2',
          name: 'Minimalist Phone Stand',
          description: 'Sleek aluminum phone stand for desk or bedside',
          originalPrice: 199,
          dealPrice: 1,
          image: 'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800',
          images: [
            'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1125131/pexels-photo-1125131.jpeg?auto=compress&cs=tinysrgb&w=800'
          ],
          category: 'Accessories',
          rating: 4.5,
          reviewCount: 156,
          inStock: true,
          tags: ['phone', 'stand', 'aluminum'],
        },
        startTime: now,
        duration: twoHours,
      },
    ];

    setDeals(initialDeals);

    // Initialize time remaining for each deal
    const initialTimeRemaining: { [key: string]: number } = {};
    initialDeals.forEach(deal => {
      const remaining = deal.startTime + deal.duration - now;
      initialTimeRemaining[deal.id] = Math.max(0, remaining);
    });
    setTimeRemaining(initialTimeRemaining);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        let hasActiveDeals = false;

        deals.forEach(deal => {
          const remaining = deal.startTime + deal.duration - Date.now();
          updated[deal.id] = Math.max(0, remaining);
          if (remaining > 0) hasActiveDeals = true;
        });

        // Remove expired deals
        if (!hasActiveDeals) {
          setDeals(prevDeals => prevDeals.filter(deal => 
            timeRemaining[deal.id] > 0
          ));
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deals, timeRemaining]);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = (deal: Deal) => {
    const cartProduct = {
      id: deal.product.id,
      name: deal.product.name,
      description: deal.product.description,
      price: deal.product.dealPrice,
      originalPrice: deal.product.originalPrice,
      category: deal.product.category,
      images: deal.product.images,
      rating: deal.product.rating,
      reviewCount: deal.product.reviewCount,
      inStock: deal.product.inStock,
      tags: deal.product.tags,
    };
    dispatch(addToCart(cartProduct));
  };

  // Filter active deals
  const activeDeals = deals.filter(deal => timeRemaining[deal.id] > 0);

  if (activeDeals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-red-500 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-8 h-8 text-yellow-300" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">₹1 Flash Deals</h2>
            <Zap className="w-8 h-8 text-yellow-300" />
          </div>
          <p className="text-xl text-red-100">
            Limited time offers - grab them before they're gone!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {activeDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Timer Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5" />
                      <span className="font-semibold">Time Remaining</span>
                    </div>
                    <div className="text-xl font-mono font-bold">
                      {formatTime(timeRemaining[deal.id])}
                    </div>
                  </div>
                  <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-yellow-400"
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${(timeRemaining[deal.id] / deal.duration) * 100}%` 
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-6">
                  <div className="relative mb-4">
                    <img
                      src={deal.product.image}
                      alt={deal.product.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      99.7% OFF
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {deal.product.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{deal.product.description}</p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-green-600">
                        ₹{deal.product.dealPrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{deal.product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">You Save</p>
                      <p className="text-lg font-bold text-red-600">
                        ₹{(deal.product.originalPrice - deal.product.dealPrice).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(deal)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Grab This Deal!</span>
                  </motion.button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    Limited quantity • While stocks last
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SpecialDeals;