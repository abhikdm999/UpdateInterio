import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import { AuthUser } from '../../lib/auth';
import { Lock, Shield } from 'lucide-react';
import SessionMonitor from './SessionMonitor';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpiry: Date | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  enableSessionMonitoring?: boolean;
}

/**
 * Authentication Provider Component
 * Provides authentication context to the entire app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  enableSessionMonitoring = true 
}) => {
  const auth = useEnhancedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
      {enableSessionMonitoring && <SessionMonitor />}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireEmailVerification?: boolean;
    fallback?: React.ComponentType;
    onUnauthorized?: () => void;
  }
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, loading } = useAuthContext();

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (options?.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      if (options?.onUnauthorized) {
        options.onUnauthorized();
        return null;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">
              You need to sign in to access this page.
            </p>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold transition-colors">
              Sign In
            </button>
          </div>
        </div>
      );
    }

    if (options?.requireEmailVerification && user && !user.email_verified) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
            <p className="text-gray-600 mb-8">
              Please verify your email address to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthProvider;