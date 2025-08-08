import React, { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

// Initialize Stripe with dummy public key for development
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key_for_development';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface StripeCheckoutFormProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  currency = 'usd',
  metadata = {},
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe not initialized');
      return;
    }

    setIsProcessing(true);

    // For development with dummy keys, simulate payment success
    if (STRIPE_PUBLIC_KEY === 'pk_test_dummy_key_for_development') {
      setTimeout(() => {
        const mockResult = {
          success: true,
          transactionId: `stripe_test_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          paymentMethod: 'Credit Card (Test)',
          amount,
          currency,
          timestamp: Date.now(),
        };
        setIsProcessing(false);
        onSuccess(mockResult);
        console.log('Payment Successful (Test Mode): Your test payment was processed successfully.');
      }, 2000);
      return;
    }

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        console.error('Payment Failed:', error.message);
      } else {
        const result = {
          success: true,
          transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          paymentMethod: 'Credit Card',
          amount,
          currency,
          timestamp: Date.now(),
        };
        onSuccess(result);
        console.log('Payment Successful: Thank you for your purchase!');
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
      console.error('Payment Error:', err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Secure Payment</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Amount: ${amount.toFixed(2)} {currency.toUpperCase()}
            </p>
          </div>
        </div>
        {STRIPE_PUBLIC_KEY === 'pk_test_dummy_key_for_development' && (
          <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">TEST MODE</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="stripe-checkout-form">
        {STRIPE_PUBLIC_KEY !== 'pk_test_dummy_key_for_development' ? (
          <div className="p-4 border rounded-lg">
            <PaymentElement />
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Test Mode - No real payment required
            </p>
            <p className="text-xs text-gray-500">
              Click "Pay Now" to simulate a successful payment
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
          data-testid="button-pay-now"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Pay ₹{amount.toFixed(2)} Now
            </>
          )}
        </button>
      </form>
    </div>
  );
};

interface StripeCheckoutProps {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<{ clientSecret: string; paymentIntentId: string }>('/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({
            amount: props.amount,
            currency: props.currency || 'usd',
            metadata: props.metadata || {},
          }),
        });
        
        setClientSecret(response.clientSecret);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment');
        props.onError(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.amount, props.currency]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading-payment">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Initializing secure payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="payment-error">
        <div className="text-center text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <p className="font-medium">Payment initialization failed</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // For development with dummy keys or when clientSecret is available
  const stripeOptions = {
    clientSecret: clientSecret || 'dummy_client_secret_for_development',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;