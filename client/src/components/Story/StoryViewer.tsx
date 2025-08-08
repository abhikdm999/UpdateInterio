import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  media: string;
  type: 'image' | 'video';
  duration: number;
}

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex?: number;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  isOpen, 
  onClose, 
  stories, 
  initialStoryIndex = 0 
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentStory.duration * 10));
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStoryIndex, currentStory.duration]);

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentStoryIndex ? '100%' : 
                         index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Interoo Stories</h3>
              <p className="text-white/80 text-sm">{currentStory.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <motion.div
          key={currentStoryIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full h-full max-w-md mx-auto"
        >
          {currentStory.type === 'image' ? (
            <img
              src={currentStory.media}
              alt={currentStory.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={currentStory.media}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop={false}
              onEnded={nextStory}
            />
          )}

          {/* Navigation Areas */}
          <button
            onClick={prevStory}
            className="absolute left-0 top-0 w-1/3 h-full z-10 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
            disabled={currentStoryIndex === 0}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={nextStory}
            className="absolute right-0 top-0 w-1/3 h-full z-10 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 z-5"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;