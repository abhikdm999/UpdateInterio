import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import StripeCheckout from './StripeCheckout';
import { Button } from '@/components/ui/button';

interface StripePaymentMethodProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
  onBack?: () => void;
}

const StripePaymentMethod: React.FC<StripePaymentMethodProps> = ({
  amount,
  currency = 'usd',
  metadata = {},
  onSuccess,
  onError,
  onBack,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);

  if (showCheckout) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Credit Card Payment
          </h3>
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={() => setShowCheckout(false)}
              data-testid="button-back-to-methods"
            >
              ← Back to Payment Methods
            </Button>
          )}
        </div>
        
        <StripeCheckout
          amount={amount}
          currency={currency}
          metadata={metadata}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Payment Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select how you'd like to pay for your order
        </p>
      </div>

      <div className="grid gap-4">
        {/* Credit Card Payment */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
          onClick={() => setShowCheckout(true)}
          data-testid="payment-method-stripe"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Credit/Debit Card
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visa, Mastercard, American Express
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">SECURE</span>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-800 dark:text-green-200">
              Secure Payment Processing
            </p>
            <p className="text-green-600 dark:text-green-300 mt-1">
              Your payment information is encrypted and processed securely by Stripe.
              We never store your card details on our servers.
            </p>
          </div>
        </div>

        {/* Test Mode Notice */}
        {(import.meta.env.VITE_STRIPE_PUBLIC_KEY === 'pk_test_dummy_key_for_development' || 
          !import.meta.env.VITE_STRIPE_PUBLIC_KEY) && (
          <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Development Mode
              </p>
              <p className="text-orange-600 dark:text-orange-300 mt-1">
                This is a test environment. No real payments will be processed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripePaymentMethod;