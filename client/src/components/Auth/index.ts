// Authentication Components Export
export { default as EnhancedLoginForm } from './EnhancedLoginForm';
export { default as EnhancedRegisterForm } from './EnhancedRegisterForm';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as SessionMonitor } from './SessionMonitor';
export { AuthProvider, useAuthContext, withAuth } from './AuthProvider';
export { default as AuthDemo } from './AuthDemo';

// Re-export existing components for backward compatibility
export { default as AuthModal } from './AuthModal';
export { default as SupabaseAuthModal } from './SupabaseAuthModal';
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ForgotPasswordForm } from './ForgotPasswordForm';