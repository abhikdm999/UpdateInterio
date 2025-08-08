import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import StoryViewer from '../Story/StoryViewer';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const stories = [
    {
      id: '1',
      title: 'Modern Living Room Transformation',
      media: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'image' as const,
      duration: 5,
    },
    {
      id: '2',
      title: 'Scandinavian Bedroom Design',
      media: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'image' as const,
      duration: 5,
    },
    {
      id: '3',
      title: 'Luxury Kitchen Makeover',
      media: 'https://images.pexels.com/photos/2029698/pexels-photo-2029698.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'image' as const,
      duration: 5,
    },
  ];

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            }}
          />
          <div className="absolute inset-0 bg-black/0" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Transform Your
              <span className="block text-yellow-400">Living Space</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto px-4"
            >
              Discover premium furniture and decor that brings your dream home to life. 
              Curated collections for modern living.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('products')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center space-x-2 transition-colors shadow-lg w-full sm:w-auto justify-center"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStoryViewer(true)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center space-x-2 transition-colors border border-white/30 w-full sm:w-auto justify-center"
              >
                <Play className="w-5 h-5" />
                <span>Watch Story</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Viewer */}
      <StoryViewer
        isOpen={showStoryViewer}
        onClose={() => setShowStoryViewer(false)}
        stories={stories}
      />
    </>
  );
};

export default Hero;