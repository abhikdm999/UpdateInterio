import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ShoppingCart, Timer, Star, ArrowRight } from 'lucide-react';
import StreamlinedCheckout from '../Checkout/StreamlinedCheckout';

interface DealProduct {
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
  limitPerCustomer: number;
  stockRemaining: number;
}

const OneRupeeDeals: React.FC = () => {
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});
  const [selectedDeal, setSelectedDeal] = useState<DealProduct | null>(null);

  // Initialize deals on component mount
  useEffect(() => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    const initialDeals: DealProduct[] = [
      {
        id: 'deal-1',
        name: 'Premium Desk Organizer',
        description: 'Elegant bamboo desk organizer with multiple compartments for your workspace essentials.',
        originalPrice: 2999,
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
        limitPerCustomer: 1,
        stockRemaining: 47,
      },
      {
        id: 'deal-2',
        name: 'Minimalist Phone Stand',
        description: 'Sleek aluminum phone stand perfect for your desk or bedside table.',
        originalPrice: 1999,
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
        limitPerCustomer: 1,
        stockRemaining: 23,
      },
      {
        id: 'deal-3',
        name: 'Ceramic Plant Pot Set',
        description: 'Beautiful set of 3 ceramic plant pots in different sizes for your indoor garden.',
        originalPrice: 1499,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1668861/pexels-photo-1668861.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Decor',
        rating: 4.3,
        reviewCount: 67,
        inStock: true,
        tags: ['ceramic', 'plant', 'pot'],
        limitPerCustomer: 1,
        stockRemaining: 31,
      },
      {
        id: 'deal-4',
        name: 'Wireless Bluetooth Speaker',
        description: 'Compact portable speaker with crystal clear sound and 12-hour battery life.',
        originalPrice: 3499,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1649772/pexels-photo-1649772.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Electronics',
        rating: 4.6,
        reviewCount: 124,
        inStock: true,
        tags: ['speaker', 'bluetooth', 'wireless'],
        limitPerCustomer: 1,
        stockRemaining: 18,
      },
      {
        id: 'deal-5',
        name: 'LED Desk Lamp',
        description: 'Modern adjustable LED desk lamp with touch control and USB charging port.',
        originalPrice: 2799,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1779488/pexels-photo-1779488.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Lighting',
        rating: 4.4,
        reviewCount: 92,
        inStock: true,
        tags: ['lamp', 'led', 'desk'],
        limitPerCustomer: 1,
        stockRemaining: 35,
      },
      {
        id: 'deal-6',
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
        originalPrice: 1799,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1000085/pexels-photo-1000085.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Lifestyle',
        rating: 4.8,
        reviewCount: 203,
        inStock: true,
        tags: ['bottle', 'steel', 'insulated'],
        limitPerCustomer: 1,
        stockRemaining: 52,
      },
      {
        id: 'deal-7',
        name: 'Silicone Keyboard Cover',
        description: 'Transparent keyboard protector for laptops, dustproof and waterproof.',
        originalPrice: 899,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/38519/macbook-laptop-ipad-apple-38519.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/38519/macbook-laptop-ipad-apple-38519.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/38520/macbook-laptop-ipad-apple-38520.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Accessories',
        rating: 4.2,
        reviewCount: 76,
        inStock: true,
        tags: ['keyboard', 'cover', 'protection'],
        limitPerCustomer: 2,
        stockRemaining: 94,
      },
      {
        id: 'deal-8',
        name: 'Bamboo Cutting Board',
        description: 'Eco-friendly bamboo cutting board with juice groove and built-in handles.',
        originalPrice: 1299,
        dealPrice: 1,
        image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
        images: [
          'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1435905/pexels-photo-1435905.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        category: 'Kitchen',
        rating: 4.5,
        reviewCount: 145,
        inStock: true,
        tags: ['bamboo', 'cutting', 'kitchen'],
        limitPerCustomer: 1,
        stockRemaining: 28,
      },
    ];

    setDeals(initialDeals);

    // Initialize time remaining for each deal
    const initialTimeRemaining: { [key: string]: number } = {};
    initialDeals.forEach(deal => {
      const remaining = twoHours; // 2 hours for each deal
      initialTimeRemaining[deal.id] = remaining;
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
          const remaining = prev[deal.id] - 1000; // Decrease by 1 second
          updated[deal.id] = Math.max(0, remaining);
          if (remaining > 0) hasActiveDeals = true;
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deals]);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBuyNow = (deal: DealProduct) => {
    setSelectedDeal(deal);
  };

  const handleCheckoutComplete = () => {
    setSelectedDeal(null);
  };

  // Filter active deals
  const activeDeals = deals.filter(deal => timeRemaining[deal.id] > 0);

  if (selectedDeal) {
    return (
      <StreamlinedCheckout
        product={selectedDeal}
        onBack={() => setSelectedDeal(null)}
        onComplete={() => setSelectedDeal(null)}
      />
    );
  }

  if (activeDeals.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-r from-red-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">₹1 Flash Deals</h2>
            <p className="text-xl mb-8">All deals have ended. Check back soon for new amazing offers!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Regular Products
            </motion.button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-red-500 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 px-2"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">₹1 Flash Deals</h2>
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
          </div>
          <p className="text-lg sm:text-xl text-red-100 px-4">
            Limited time offers - grab them before they're gone!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <AnimatePresence>
            {activeDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-2xl mx-2 sm:mx-0"
              >
                {/* Timer Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5" />
                      <span className="font-semibold">Time Remaining</span>
                    </div>
                    <div className="text-xl font-mono font-bold">
                      {formatTime(timeRemaining[deal.id])}
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-yellow-400"
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${(timeRemaining[deal.id] / (2 * 60 * 60 * 1000)) * 100}%` 
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-4 sm:p-6">
                  <div className="relative mb-4">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-40 sm:h-48 object-cover rounded-xl"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      99.97% OFF
                    </div>
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                      {deal.stockRemaining} left
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {deal.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{deal.description}</p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(deal.rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({deal.reviewCount})</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-green-600">
                        ₹{deal.dealPrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{deal.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">You Save</p>
                      <p className="text-lg font-bold text-red-600">
                        ₹{(deal.originalPrice - deal.dealPrice).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Limit Notice */}
                  <div className="bg-amber-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800 text-center">
                      <strong>Limit {deal.limitPerCustomer} per customer</strong> • While stocks last
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBuyNow(deal)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Buy Now for ₹1</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    Limited quantity • {deal.stockRemaining} items remaining
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Deal Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Deal Statistics</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-300">{activeDeals.length}</p>
                <p className="text-white/80 text-sm sm:text-base">Active Deals</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-300">
                  {activeDeals.reduce((sum, deal) => sum + deal.stockRemaining, 0)}
                </p>
                <p className="text-white/80 text-sm sm:text-base">Items Left</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-300">99.97%</p>
                <p className="text-white/80 text-sm sm:text-base">Max Savings</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OneRupeeDeals;