import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { SessionManager } from '../../lib/auth';

/**
 * Session Monitor Component
 * Displays session status and handles automatic refresh
 */
const SessionMonitor: React.FC = () => {
  const { user, sessionExpiry, refreshSession, signOut } = useEnhancedAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!sessionExpiry || !user) return;

    const updateTimer = () => {
      const now = new Date();
      const timeLeft = sessionExpiry.getTime() - now.getTime();
      
      if (timeLeft <= 0) {
        setTimeUntilExpiry(0);
        setShowWarning(true);
        return;
      }

      setTimeUntilExpiry(timeLeft);
      
      // Show warning if less than 5 minutes remaining
      const fiveMinutes = 5 * 60 * 1000;
      setShowWarning(timeLeft <= fiveMinutes);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry, user]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't show if user is not authenticated
  if (!user || !sessionExpiry) return null;

  // Only show in development or when warning is needed
  if (process.env.NODE_ENV !== 'development' && !showWarning) return null;

  return (
    <AnimatePresence>
      {(showWarning || process.env.NODE_ENV === 'development') && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 max-w-sm ${
            showWarning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
          } border rounded-xl p-4 shadow-lg`}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${
              showWarning ? 'text-amber-600' : 'text-blue-600'
            }`}>
              {showWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-medium ${
                showWarning ? 'text-amber-900' : 'text-blue-900'
              } mb-1`}>
                {showWarning ? 'Session Expiring Soon' : 'Session Status'}
              </h4>
              
              <p className={`text-sm ${
                showWarning ? 'text-amber-800' : 'text-blue-800'
              } mb-3`}>
                {timeUntilExpiry !== null && timeUntilExpiry > 0 ? (
                  <>Time remaining: {formatTimeRemaining(timeUntilExpiry)}</>
                ) : (
                  'Session has expired'
                )}
              </p>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefreshSession}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showWarning 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50`}
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </motion.button>

                {showWarning && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={signOut}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionMonitor;