import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Phone, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService, AuthValidation } from '../../lib/auth';

interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name must contain only letters and spaces'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface EnhancedRegisterFormProps {
  onSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

const EnhancedRegisterForm: React.FC<EnhancedRegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password');
  const watchedEmail = watch('email');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const signUpData: SignUpData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      };

      const result = await AuthService.signUp(signUpData);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.user) {
        onSuccess(result.user);
      }
    } catch (error) {
      setError('An unexpected error occurred during registration. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!watchedPassword) return null;
    return AuthValidation.validatePassword(watchedPassword);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join us and start your journey</p>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('fullName')}
              type="text"
              autoComplete="name"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.fullName 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
          {errors.fullName && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.fullName.message}</p>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {watchedEmail && AuthValidation.isValidEmail(watchedEmail) && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {errors.email && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.email.message}</p>
            </div>
          )}
        </div>

        {/* Phone Field (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-gray-400">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.phone 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.phone.message}</p>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.password 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.password.message}</p>
            </div>
          )}
          
          {/* Password Strength Indicator */}
          {passwordStrength && watchedPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${
                  passwordStrength.strength === 'strong' ? 'text-green-600' :
                  passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {passwordStrength.strength.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.strength === 'strong' ? 'bg-green-500 w-full' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'
                  }`}
                />
              </div>
              {passwordStrength.errors.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1">
                  {passwordStrength.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.confirmPassword.message}</p>
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="flex items-start space-x-3">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 mt-1"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <div className="mt-1 flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.agreeToTerms.message}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2 ${
            isValid && !isLoading
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Password Requirements */}
      {watchedPassword && (
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements</h4>
          <div className="space-y-1">
            {[
              { test: watchedPassword.length >= 6, text: 'At least 6 characters' },
              { test: /[a-z]/.test(watchedPassword), text: 'One lowercase letter' },
              { test: /[A-Z]/.test(watchedPassword), text: 'One uppercase letter' },
              { test: /\d/.test(watchedPassword), text: 'One number' },
              { test: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword), text: 'One special character' },
            ].map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                {requirement.test ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <div className="w-3 h-3 border border-gray-300 rounded-full" />
                )}
                <span className={`text-xs ${requirement.test ? 'text-green-600' : 'text-gray-500'}`}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Switch to Login */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            disabled={isLoading}
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default EnhancedRegisterForm;