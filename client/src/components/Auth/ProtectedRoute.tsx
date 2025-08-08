import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
  onUnauthorized?: () => void;
}

/**
 * Protected Route Component
 * Wraps components that require authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo,
  requireEmailVerification = false,
  onUnauthorized,
}) => {
  const { user, loading, isAuthenticated } = useEnhancedAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated && onUnauthorized) {
      onUnauthorized();
    }
  }, [loading, isAuthenticated, onUnauthorized]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">
            You need to sign in to access this page. Please log in to continue.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (redirectTo) {
                window.location.href = redirectTo;
              } else if (onUnauthorized) {
                onUnauthorized();
              }
            }}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Check email verification if required
  if (requireEmailVerification && user && !user.email_verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
          <p className="text-gray-600 mb-8">
            Please check your email and click the verification link to access this page.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            I've Verified My Email
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;