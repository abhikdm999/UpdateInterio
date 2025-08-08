import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearCart } from '../../store/slices/cartSlice';
import { addOrder, OrderItem } from '../../store/slices/orderSlice';
import { User, Mail, Phone, MapPin, CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StreamlinedPaymentMethod, { StreamlinedPaymentMethodType } from '../Payment/StreamlinedPaymentMethod';
import StreamlinedPaymentSection from '../Payment/StreamlinedPaymentSection';
import { generateTransactionId } from '../../utils/paymentUtils';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\d+$/, 'Phone number must contain only digits'),
  address: z.string().min(10, 'Please enter a complete address'),
  paymentMethod: z.enum(['upi', 'razorpay-upi', 'cod'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onBack: () => void;
  product?: any; // For direct buy now from ₹1 deals
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, product }) => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to get product price (handles both regular and deal products)
  const getProductPrice = (prod: any) => {
    return Number(prod.price) || Number(prod.dealPrice) || 0;
  };

  // Calculate order details
  const orderItems: OrderItem[] = product ? 
    [{
      id: product.id,
      product: {
        id: product.id,
        name: product.name,
        price: getProductPrice(product),
        images: product.images || ['/placeholder.jpg'],
      },
      quantity: 1,
      price: getProductPrice(product),
    }] : items.map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: getProductPrice(item.product),
        images: item.product.images || ['/placeholder.jpg'],
      },
      quantity: item.quantity || 1,
      price: getProductPrice(item.product),
    }));

  const orderTotal = product ? getProductPrice(product) : total;
  const tax = orderTotal * 0.18;
  const shipping = orderTotal > 500 ? 0 : 50;
  const grandTotal = orderTotal + tax + shipping;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutData) => {
    setOrderData(data);
    if (data.paymentMethod === 'cod') {
      // For COD payments, skip payment step and go directly to confirmation
      handleOrderConfirmation(data, {
        success: true,
        transactionId: generateTransactionId(),
        paymentMethod: 'Cash on Delivery',
        amount: grandTotal,
      });
    } else {
      setCurrentStep(2); // Go to payment step
    }
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('Payment successful:', paymentResult);
    if (orderData) {
      handleOrderConfirmation(orderData, paymentResult);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
    // Keep user on payment step to retry
  };
  const handleOrderConfirmation = (customerData: CheckoutData, paymentResult: any) => {
    console.log('Creating order with data:', { customerData, paymentResult });
    setIsProcessing(true);
    
    // Create order
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: orderItems,
      total: grandTotal,
      status: 'confirmed' as const,
      shippingAddress: {
        fullName: customerData.fullName,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: 'Not specified',
        state: 'Not specified', 
        zipCode: 'Not specified',
        country: 'India',
      },
      paymentMethod: customerData.paymentMethod,
      paymentResult: paymentResult,
      transactionId: paymentResult.transactionId || generateTransactionId(),
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    };

    console.log('Adding order to store:', newOrder);
    dispatch(addOrder(newOrder));
    
    // Clear cart if it was a cart checkout
    if (!product) {
      console.log('Clearing cart after successful order');
      dispatch(clearCart());
    }
    
    setTimeout(() => {
      setCurrentStep(3); // Show confirmation
      setIsProcessing(false);
    }, 2000);
  };

  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        {orderItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium text-sm text-gray-900">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{orderTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (18%)</span>
          <span className="text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-yellow-600">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerDetailsForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Checkout Details</h2>
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          
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
              Mobile Number *
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
                placeholder="Enter your mobile number"
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
                placeholder="Enter your complete address including city, state, and PIN code"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <StreamlinedPaymentMethod
            selectedMethod={selectedPaymentMethod as StreamlinedPaymentMethodType}
            onMethodChange={(method) => {
              register('paymentMethod').onChange({ target: { value: method } });
            }}
          />
          {errors.paymentMethod && (
            <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
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
          {selectedPaymentMethod === 'cod' ? 'Confirm Order' : 'Continue to Payment'}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <StreamlinedPaymentSection
        amount={grandTotal}
        paymentMethod={selectedPaymentMethod as StreamlinedPaymentMethodType}
        customerInfo={{
          name: orderData?.fullName || '',
          email: orderData?.email || '',
          contact: orderData?.phone || '',
        }}
        orderId={`ORD-${Date.now()}`}
        shippingAddress={orderData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </motion.div>
  );

  const renderConfirmation = () => (
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
        <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono">{orderData?.transactionId || 'ORD-' + Date.now()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span>
              {orderData?.paymentMethod === 'cod' ? 'Cash on Delivery' : 
               orderData?.paymentMethod === 'test' ? 'Test Payment' : 
               orderData?.paymentMethod?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span>5-7 business days</span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-500 mb-8">
        You'll receive a confirmation email shortly with tracking information.
      </p>
      
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
          onClick={onBack}
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {currentStep === 1 && renderCustomerDetailsForm()}
              {currentStep === 2 && renderPaymentStep()}
              {currentStep === 3 && renderConfirmation()}
            </div>
          </div>

          {currentStep < 3 && (
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;