import { useState, useEffect, useCallback } from 'react';
import { AuthService, AuthUser, SessionManager } from '../lib/auth';

export interface UseEnhancedAuthReturn {
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

/**
 * Enhanced Authentication Hook
 * Provides comprehensive authentication state management
 */
export const useEnhancedAuth = (): UseEnhancedAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setSessionExpiry(SessionManager.getSessionExpiry());
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Monitor session expiry
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const expiry = SessionManager.getSessionExpiry();
      setSessionExpiry(expiry);

      if (expiry && expiry.getTime() <= Date.now()) {
        // Session expired
        handleSignOut();
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.signIn(email, password, rememberMe);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.user) {
        setUser(result.user);
        setSessionExpiry(SessionManager.getSessionExpiry());
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, fullName?: string, phone?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.signUp({ email, password, fullName, phone });
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.user) {
        setUser(result.user);
        setSessionExpiry(SessionManager.getSessionExpiry());
      }
    } catch (err) {
      setError('An unexpected error occurred during registration');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    
    try {
      await AuthService.signOut();
      setUser(null);
      setSessionExpiry(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.updateProfile(updates);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.user) {
        setUser(result.user);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleResetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.resetPassword(email);
      
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to send password reset email');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshSession = useCallback(async () => {
    try {
      await SessionManager.refreshSession();
      setSessionExpiry(SessionManager.getSessionExpiry());
    } catch (err) {
      console.error('Session refresh error:', err);
      setError('Failed to refresh session');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    sessionExpiry,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    resetPassword: handleResetPassword,
    refreshSession: handleRefreshSession,
    clearError,
  };
};