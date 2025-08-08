import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Lock, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import { RazorpayService } from '../../services/razorpayService';

interface StreamlinedRazorpayUPIProps {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  orderId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const StreamlinedRazorpayUPI: React.FC<StreamlinedRazorpayUPIProps> = ({
  amount,
  customerInfo,
  orderId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleRazorpayUPIPayment = async () => {
    if (!amount || amount <= 0 || !razorpayOrder) {
      onPaymentError('Invalid payment amount');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Initializing Razorpay UPI payment...');
    
    console.log('Starting Razorpay UPI payment process...', { amount, customerInfo, orderId, razorpayOrder });

    try {
      // Load Razorpay script
      const Razorpay = await loadRazorpayScript();
      
      const options = {
        key: RAZORPAY_CONFIG.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: RAZORPAY_CONFIG.company.name,
        description: 'UPI Payment via Razorpay - Test Environment',
        image: RAZORPAY_CONFIG.company.logo,
        order_id: razorpayOrder.id,
        method: {
          upi: true,
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact,
        },
        theme: {
          color: RAZORPAY_CONFIG.company.theme.color,
        },
        handler: async (response: any) => {
          console.log('Razorpay payment successful:', response);
          
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('Payment verified:', verifyData);
              
              const result = {
                success: true,
                transactionId: response.razorpay_payment_id,
                paymentMethod: 'UPI via Razorpay',
                amount: amount,
                orderId: orderId,
                timestamp: Date.now(),
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              };
              
              setIsProcessing(false);
              onPaymentSuccess(result);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setIsProcessing(false);
            onPaymentError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed by user');
            setIsProcessing(false);
          },
        },
      };
      
      const rzp = new Razorpay(options);
      
      // Add error handling for payment failures
      rzp.on('payment.failed', (response: any) => {
        console.error('Razorpay payment failed:', response);
        setIsProcessing(false);
        onPaymentError(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      
      console.log('Opening Razorpay payment modal...');
      rzp.open();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'UPI payment failed';
      console.error('Razorpay UPI payment error:', error);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve((window as any).Razorpay);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve((window as any).Razorpay);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  };

  // Create Razorpay order when component mounts
  const [razorpayOrder, setRazorpayOrder] = useState<any>(null);

  useEffect(() => {
    const createRazorpayOrder = async () => {
      try {
        console.log('Creating Razorpay order...', { amount, orderId });
        
        const orderResponse = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: 'INR',
            receipt: orderId,
            notes: {
              paymentMethod: 'UPI',
              orderId: orderId,
            },
          }),
        });
        
        if (!orderResponse.ok) {
          throw new Error('Failed to create Razorpay order');
        }
        
        const orderData = await orderResponse.json();
        console.log('Razorpay order created successfully:', orderData);
        setRazorpayOrder(orderData.order);
        
      } catch (error) {
        console.error('Error creating Razorpay order:', error);
        onPaymentError('Failed to initialize payment. Please try again.');
      }
    };

    createRazorpayOrder();
  }, [amount, orderId]);

  const handleRazorpayUPIPayment = async () => {
      console.log('Razorpay UPI payment result:', result);
      
      if (result.success) {
        setProcessingStep('Payment successful!');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a comprehensive success result
        const successResult = {
          ...result,
          success: true,
          transactionId: result.transactionId || `RZP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          paymentMethod: 'UPI via Razorpay',
          amount: amount,
          orderId: orderId,
          timestamp: Date.now(),
          razorpayPaymentId: result.razorpayPaymentId,
          razorpayOrderId: result.razorpayOrderId,
          razorpaySignature: result.razorpaySignature
        };
        
        onPaymentSuccess(successResult);
      } else {
        onPaymentError(result.errorMessage || 'UPI payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'UPI payment failed';
      console.error('Razorpay UPI payment error:', error);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Loader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing UPI Payment</h3>
        <p className="text-gray-600 mb-4">{processingStep}</p>
        
        <div className="bg-purple-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-purple-800">
            Please complete the payment in the Razorpay window that opened.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">UPI Payment via Razorpay</h3>
        <p className="text-gray-600">
          Secure UPI payment powered by Razorpay. Pay using any UPI app.
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-purple-50 rounded-xl p-4 text-center">
        <h4 className="text-lg font-semibold text-purple-900 mb-1">Amount to Pay</h4>
        <p className="text-3xl font-bold text-purple-600">₹{(amount || 0).toLocaleString('en-IN')}</p>
        {(!amount || amount <= 0) && (
          <p className="text-sm text-red-600 mt-2">⚠️ Invalid amount detected</p>
        )}
      </div>

      {/* Customer Information */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{customerInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{customerInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contact:</span>
            <span className="font-medium">{customerInfo.contact}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono text-sm">{orderId}</span>
          </div>
        </div>
      </div>

      {/* Razorpay UPI Benefits */}
      <div className="bg-green-50 rounded-xl p-4">
        <h4 className="font-medium text-green-900 mb-3">Secure UPI Payment</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Instant payment confirmation</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Secure payment through Razorpay</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>No additional charges</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Works with all UPI apps</span>
          </li>
        </ul>
      </div>

      {/* Test UPI Information */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-3">Test UPI IDs (Demo Mode)</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Success:</strong> success@razorpay</p>
          <p>• <strong>Failure:</strong> failure@razorpay</p>
          <p>• Use any UPI ID for testing different scenarios</p>
        </div>
      </div>

      {/* Payment Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRazorpayUPIPayment}
        disabled={!amount || amount <= 0 || isProcessing}
        className={`w-full ${(!amount || amount <= 0 || isProcessing) ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2`}
      >
        <Smartphone className="w-5 h-5" />
        <span>{isProcessing ? 'Processing...' : 'Pay with UPI'}</span>
      </motion.button>

      {/* Security Notice */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Secured by Razorpay</span>
        </div>
        <p className="text-xs text-gray-500">
          Your payment is secure and encrypted
        </p>
      </div>
    </motion.div>
  );
};

export default StreamlinedRazorpayUPI;