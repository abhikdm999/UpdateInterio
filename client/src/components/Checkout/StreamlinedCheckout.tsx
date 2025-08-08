import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { addOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import StreamlinedPaymentMethod, { StreamlinedPaymentMethodType } from '../Payment/StreamlinedPaymentMethod';
import StreamlinedPaymentSection from '../Payment/StreamlinedPaymentSection';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid phone number is required').regex(/^\d+$/, 'Phone number must contain only digits'),
  address: z.string().min(10, 'Complete address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

type ShippingData = z.infer<typeof shippingSchema>;

interface StreamlinedCheckoutProps {
  product?: any;
  cartItems?: any[];
  onBack: () => void;
  onComplete: () => void;
}


const StreamlinedCheckout: React.FC<StreamlinedCheckoutProps> = ({ 
  product, 
  cartItems = [], 
  onBack, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment Selection, 3: Payment Processing, 4: Confirmation
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<StreamlinedPaymentMethodType>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId] = useState(`ORD-${Date.now()}`); // Generate orderId once and keep it stable
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    mode: 'onChange',
  });

  // Calculate order details - ONLY base product price
  const orderItems = product ? 
    [{
      id: product.id,
      product: product,
      quantity: 1,
    }] : cartItems;

  // Fix for both regular products and deal products
  const getProductPrice = (prod: any) => {
    return Number(prod.price) || Number(prod.dealPrice) || 0;
  };
  
  const baseAmount = product ? getProductPrice(product) : 
    cartItems.reduce((sum, item) => sum + (getProductPrice(item.product) * (item.quantity || 0)), 0);

  // Final amount is ONLY the base price - no taxes, shipping, or fees
  const finalAmount = baseAmount || 0;

  console.log('Checkout calculation debug:', { 
    product: product?.name, 
    productPrice: product?.price,
    productPriceType: typeof product?.price,
    cartItems: cartItems?.length, 
    baseAmount, 
    finalAmount,
    fullProduct: product 
  });

  const onShippingSubmit = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(2); // Move to payment method selection
  };

  const handlePaymentMethodSelection = (method: StreamlinedPaymentMethodType) => {
    console.log('Payment method selection triggered:', method);
    setSelectedPaymentMethod(method);
    setPaymentError(null);
    
    // For COD, skip payment processing and go directly to confirmation
    if (method === 'cod') {
      console.log('COD selected, processing COD payment...');
      handleCODPayment();
    } else {
      console.log('Moving to payment processing step for method:', method);
      setCurrentStep(3); // Move to payment processing
    }
  };

  const handleCODPayment = () => {
    const codResult = {
      success: true,
      transactionId: `COD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentMethod: 'Cash on Delivery',
      amount: finalAmount,
      timestamp: Date.now(),
    };
    handlePaymentSuccess(codResult);
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful, creating order...', { paymentResult, finalAmount, orderItems });
    setIsProcessing(true);
    
    // Create order with comprehensive details
    const newOrder = {
      id: paymentResult.orderId || `ORD-${Date.now()}`,
      items: orderItems,
      total: finalAmount,
      status: 'confirmed' as const,
      shippingAddress: { ...shippingData!, country: 'India' },
      paymentMethod: paymentResult.paymentMethod || (
        selectedPaymentMethod === 'upi' ? 'UPI' :
        selectedPaymentMethod === 'razorpay-upi' ? 'UPI via Razorpay' :
        selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Unknown'
      ),
      paymentResult: paymentResult,
      transactionId: paymentResult.transactionId,
      razorpayPaymentId: paymentResult.razorpayPaymentId,
      razorpayOrderId: paymentResult.razorpayOrderId,
      razorpaySignature: paymentResult.razorpaySignature,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('Dispatching order to Redux store:', newOrder);
    dispatch(addOrder(newOrder));
    
    // Clear cart if it was a cart checkout
    if (!product) {
      console.log('Clearing cart after order creation');
      dispatch(clearCart());
    }
    
    setTimeout(() => {
      setOrderConfirmed(true);
      setCurrentStep(4);
      setIsProcessing(false);
      console.log('Order confirmation complete');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setIsProcessing(false);
    setCurrentStep(2); // Go back to payment method selection
  };

  const renderShippingForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping Information</h2>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>All fields are mandatory.</strong> Please fill in complete information to proceed.
        </p>
      </div>

      <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('fullName')}
              type="text"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.fullName 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.email 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('phone')}
              type="tel"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.phone 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your phone number"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complete Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              {...register('address')}
              rows={3}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.address 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="Enter your complete address"
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              {...register('city')}
              type="text"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.city 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              {...register('state')}
              type="text"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.state 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="State"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              {...register('zipCode')}
              type="text"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.zipCode 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-yellow-500'
              }`}
              placeholder="ZIP Code"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isValid
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Payment Options
        </motion.button>
      </form>
    </motion.div>
  );

  const renderPaymentMethodSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Select Payment Method</h2>
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Amount to Pay</h3>
        <p className="text-3xl font-bold text-yellow-600">₹{finalAmount.toLocaleString('en-IN')}</p>
        <p className="text-sm text-gray-600 mt-1">No additional charges</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
        
        <StreamlinedPaymentMethod
          selectedMethod={selectedPaymentMethod}
          onMethodChange={handlePaymentMethodSelection}
        />
      </div>
    </motion.div>
  );

  const renderPaymentProcessing = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedPaymentMethod === 'upi' ? 'UPI Payment' : 
           selectedPaymentMethod === 'razorpay-upi' ? 'UPI via Razorpay' : 'Cash on Delivery'}
        </h2>
        <button
          onClick={() => setCurrentStep(2)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{paymentError}</p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Amount to Pay</h3>
        <p className="text-3xl font-bold text-yellow-600">₹{finalAmount.toLocaleString('en-IN')}</p>
        <p className="text-sm text-gray-600 mt-1">No additional charges</p>
      </div>

      <StreamlinedPaymentSection
        amount={finalAmount}
        paymentMethod={selectedPaymentMethod}
        customerInfo={{
          name: shippingData!.fullName,
          email: shippingData!.email,
          contact: shippingData!.phone,
        }}
        orderId={orderId}
        shippingAddress={shippingData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 rounded-xl p-4 mt-4">
          <h4 className="font-medium text-yellow-900 mb-2">Debug Info</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• Final Amount: ₹{finalAmount}</p>
            <p>• Base Amount: ₹{baseAmount}</p>
            <p>• Payment Method: {selectedPaymentMethod}</p>
            <p>• Order Items: {orderItems.length} items</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderOrderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
      <p className="text-xl text-gray-600 mb-6">
        Thank you for your purchase. Your order has been successfully placed.
      </p>
      
      <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span>
              {selectedPaymentMethod === 'upi' ? 'UPI' :
               selectedPaymentMethod === 'razorpay-upi' ? 'UPI via Razorpay' :
               selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold">₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span>5-7 business days</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-orders'))}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          View My Orders
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Continue Shopping
        </motion.button>
      </div>
    </motion.div>
  );

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Order</h3>
          <p className="text-gray-600">Please wait while we confirm your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderShippingForm()}
            {currentStep === 2 && renderPaymentMethodSelection()}
            {currentStep === 3 && renderPaymentProcessing()}
            {currentStep === 4 && renderOrderConfirmation()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StreamlinedCheckout;