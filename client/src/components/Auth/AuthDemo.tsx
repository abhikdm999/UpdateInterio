import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Shield, LogOut, AlertTriangle, X } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import EnhancedLoginForm from './EnhancedLoginForm';
import EnhancedRegisterForm from './EnhancedRegisterForm';
import ProtectedRoute from './ProtectedRoute';

type AuthMode = 'login' | 'register';

/**
 * Authentication Demo Component
 * Demonstrates the complete authentication system
 */
const AuthDemo: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated, signOut, updateProfile, loading, error } = useAuthContext();

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
    console.log('Authentication successful:', user);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      await updateProfile({
        full_name: 'Updated Name',
        phone: '+1234567890',
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supabase Authentication Demo
          </h1>
          <p className="text-xl text-gray-600">
            Complete authentication system with enhanced security features
          </p>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-yellow-600 rounded-full animate-spin"></div>
              <span>Checking authentication...</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Signed in as {user.full_name || user.email}</p>
                  <p className="text-sm text-gray-600">
                    Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {user.email_verified ? (
                      <>
                        <Shield className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-600">Unverified</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Phone</h4>
                  <p className="text-sm text-gray-600">{user.phone || 'Not provided'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Member Since</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateProfile}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Update Profile</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6">Not authenticated</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuthModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Sign In / Register
              </motion.button>
            </div>
          )}
        </div>

        {/* Protected Content Demo */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Protected Content Demo</h2>
          
          <ProtectedRoute
            fallback={
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">This content requires authentication</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Sign In to View
                </button>
              </div>
            }
          >
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Protected Content Unlocked!
              </h3>
              <p className="text-green-800">
                This content is only visible to authenticated users. You have successfully 
                accessed a protected route using our Supabase authentication system.
              </p>
            </div>
          </ProtectedRoute>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {authMode === 'login' ? (
                <EnhancedLoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setAuthMode('register')}
                  onSwitchToForgotPassword={() => {}}
                />
              ) : (
                <EnhancedRegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setAuthMode('login')}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDemo;