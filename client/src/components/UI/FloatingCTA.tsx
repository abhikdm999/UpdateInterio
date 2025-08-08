import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X } from 'lucide-react';

const FloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 500;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="relative">
            {/* Expanded Menu */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-16 right-0 space-y-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors flex items-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-medium">Call Now</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Chat</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-4 rounded-full shadow-lg transition-colors ${
                isExpanded 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white`}
            >
              {isExpanded ? (
                <X className="w-6 h-6" />
              ) : (
                <MessageCircle className="w-6 h-6" />
              )}
            </motion.button>

            {/* Pulse Animation */}
            {!isExpanded && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-600 rounded-full opacity-20"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;