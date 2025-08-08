import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, CreditCard, MapPin, Clock, ArrowRight, Edit } from 'lucide-react';

interface PaymentConfirmationProps {
  orderData: {
    items: any[];
    total: number;
    shippingAddress: any;
    paymentMethod: string;
    paymentResult: any;
  };
  onConfirm: () => void;
  onEdit: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  orderData,
  onConfirm,
  onEdit,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    onConfirm();
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'card':
        return `Card ending in ${orderData.paymentResult?.last4 || '****'}`;
      case 'paypal':
        return 'PayPal';
      case 'bank':
        return 'Bank Transfer';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Order</h2>
        <p className="text-gray-600">
          Please review your order details before final confirmation
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
          <button
            onClick={onEdit}
            className="flex items-center space-x-1 text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <img
                src={item.product?.images?.[0] || item.images?.[0]}
                alt={item.product?.name || item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.product?.name || item.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
              </div>
              <p className="font-semibold text-gray-900">
                ₹{((item.product?.price || item.price) * (item.quantity || 1)).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total Amount</span>
            <span>₹{orderData.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
        </div>
        <div className="text-gray-700">
          <p className="font-medium">{orderData.shippingAddress.fullName}</p>
          <p>{orderData.shippingAddress.address}</p>
          <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}</p>
          <p>{orderData.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        </div>
        <p className="text-gray-700">{formatPaymentMethod(orderData.paymentMethod)}</p>
        {orderData.paymentResult?.transactionId && (
          <p className="text-sm text-gray-500 mt-1">
            Transaction ID: {orderData.paymentResult.transactionId}
          </p>
        )}
      </div>

      {/* Delivery Information */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">Estimated Delivery</h4>
            <p className="text-sm text-blue-800">
              Your order will be delivered within 3-5 business days
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConfirm}
        disabled={isConfirming}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isConfirming ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Placing Order...</span>
          </>
        ) : (
          <>
            <Package className="w-5 h-5" />
            <span>Confirm & Place Order</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          By confirming, you agree to our terms and conditions
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentConfirmation;