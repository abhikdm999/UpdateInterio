import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearCart, toggleCart } from '../../store/slices/cartSlice';
import { addOrder } from '../../store/slices/orderSlice';
import { ArrowLeft, CheckCircle, Package, Smartphone } from 'lucide-react';
import StreamlinedPaymentMethod, { StreamlinedPaymentMethodType } from '../Payment/StreamlinedPaymentMethod';
import StreamlinedPaymentSection from '../Payment/StreamlinedPaymentSection';
import { generateTransactionId, generatePaymentSummary } from '../../utils/paymentUtils';
import PaymentConfirmation from './PaymentConfirmation';
import type { Product } from '@shared/schema';

interface CheckoutPageProps {
  product?: Product;
  onBack: () => void;
  onComplete: () => void;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ product, onBack, onComplete }) => {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation, 4: Success
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<StreamlinedPaymentMethodType>('upi');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [transactionId] = useState(generateTransactionId());
  
  // Calculate totals
  const orderAmount = product ? product.price : total;
  const paymentSummary = generatePaymentSummary(orderAmount);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    
    // Prepare order data for confirmation
    const orderItems = product ? 
      [{
        id: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
        },
        quantity: 1,
        price: product.price,
      }] : 
      items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
        },
        quantity: item.quantity,
        price: item.product.price * item.quantity,
      }));

    setOrderData({
      items: orderItems,
      total: paymentSummary.total,
      shippingAddress,
      paymentMethod: selectedPaymentMethod,
      paymentResult: result,
    });
    
    setCurrentStep(3); // Move to confirmation step
  };

  const handleOrderConfirmation = () => {
    // Create order and add to orders list
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: orderData.items,
      total: orderData.total,
      status: 'confirmed' as const,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentResult: orderData.paymentResult,
      transactionId: orderData.paymentResult.transactionId,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    };

    dispatch(addOrder(newOrder));
    
    // Clear cart if it was a cart checkout
    if (!product) {
      dispatch(clearCart());
    }
    
    setIsPaymentComplete(true);
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            currentStep >= step ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step === 1 && <Package className="w-5 h-5" />}
            {step === 2 && <Smartphone className="w-5 h-5" />}
            {step === 3 && <CheckCircle className="w-5 h-5" />}
            {step === 4 && <CheckCircle className="w-5 h-5" />}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 transition-colors ${
              currentStep > step ? 'bg-yellow-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderShippingForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={shippingAddress.fullName}
            onChange={(e) => handleShippingChange('fullName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={shippingAddress.email}
            onChange={(e) => handleShippingChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={shippingAddress.phone}
            onChange={(e) => handleShippingChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            value={shippingAddress.country}
            onChange={(e) => handleShippingChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={shippingAddress.address}
            onChange={(e) => handleShippingChange('address', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province *
          </label>
          <input
            type="text"
            value={shippingAddress.state}
            onChange={(e) => handleShippingChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP/Postal Code *
          </label>
          <input
            type="text"
            value={shippingAddress.zipCode}
            onChange={(e) => handleShippingChange('zipCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </motion.div>
  );

  const renderPaymentForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <StreamlinedPaymentMethod
        selectedMethod={selectedPaymentMethod}
        onMethodChange={setSelectedPaymentMethod}
      />

      <div className="mt-8">
        <StreamlinedPaymentSection
          amount={paymentSummary.total}
          paymentMethod={selectedPaymentMethod}
          customerInfo={{
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          }}
          orderId={transactionId}
          shippingAddress={shippingAddress}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    </motion.div>
  );

  const renderConfirmationStep = () => (
    <PaymentConfirmation
      orderData={orderData}
      onConfirm={handleOrderConfirmation}
      onEdit={() => setCurrentStep(1)}
    />
  );

  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        {product ? (
          <div className="flex items-center space-x-3">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">Qty: 1</p>
            </div>
            <p className="font-medium">${product.price.toFixed(2)}</p>
          </div>
        ) : (
          items.map((item) => (
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
              <p className="font-medium text-sm">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${paymentSummary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${paymentSummary.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {paymentSummary.shipping === 0 ? 'Free' : `$${paymentSummary.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Processing Fee</span>
          <span className="text-gray-900">${paymentSummary.processingFee.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${paymentSummary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {orderAmount < 100 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Add ${(100 - orderAmount).toFixed(2)} more for free shipping!
          </p>
        </div>
      )}
    </div>
  );

  const renderSuccessPage = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
      <p className="text-xl text-gray-600 mb-6">
        Thank you for your purchase. Your order has been confirmed.
      </p>
      
      {paymentResult && (
        <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono">{paymentResult.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span>{paymentResult.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">₹{paymentResult.amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-gray-500 mb-8">
        You'll receive a confirmation email shortly with your order details.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComplete}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
      >
        Continue Shopping
      </motion.button>
    </motion.div>
  );

  if (isPaymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderSuccessPage()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>
        </div>

        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderShippingForm()}
                {currentStep === 2 && renderPaymentForm()}
                {currentStep === 3 && renderConfirmationStep()}
              </AnimatePresence>

              {currentStep < 2 && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Back
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-semibold"
                  >
                    Continue to Payment
                  </motion.button>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back to Shipping
                  </button>
                </div>
              )}
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

export default CheckoutPage;