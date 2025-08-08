import React from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Clock, AlertCircle, CheckCircle, IndianRupee } from 'lucide-react';

interface StreamlinedCODPaymentProps {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  shippingAddress?: any;
  onPaymentSuccess: (result: any) => void;
}

const StreamlinedCODPayment: React.FC<StreamlinedCODPaymentProps> = ({
  amount,
  customerInfo,
  shippingAddress,
  onPaymentSuccess
}) => {
  const codFee = amount > 500 ? 0 : 49; // Free COD for orders above ₹500
  const totalAmount = amount + codFee;

  const handleCODConfirmation = () => {
    onPaymentSuccess({
      success: true,
      transactionId: `COD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentMethod: 'Cash on Delivery',
      amount: totalAmount,
      codFee,
      deliveryInstructions: 'Pay cash to delivery person upon receipt',
      timestamp: Date.now(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cash on Delivery</h3>
        <p className="text-gray-600">
          Pay at the time of delivery
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order Amount</span>
            <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">COD Fee</span>
            <span className="font-medium">
              {codFee === 0 ? 'Free' : `₹${codFee.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total to Pay on Delivery</span>
              <span className="text-green-600 flex items-center">
                <IndianRupee className="w-4 h-4" />
                {totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      {shippingAddress && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-2">Delivery Address</h5>
              <div className="text-sm text-blue-800">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Timeline */}
      <div className="bg-amber-50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-amber-900 mb-2">Estimated Delivery</h5>
            <p className="text-sm text-amber-800">
              Your order will be delivered within 3-5 business days. 
              You'll receive tracking information once your order is shipped.
            </p>
          </div>
        </div>
      </div>

      {/* COD Benefits */}
      <div className="bg-green-50 rounded-xl p-4">
        <h4 className="font-medium text-green-900 mb-3">Cash on Delivery Benefits</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>No need for online payment</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Inspect products before payment</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Pay only when you receive your order</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Secure and convenient</span>
          </li>
        </ul>
      </div>

      {/* Important Notes */}
      <div className="bg-red-50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-red-900 mb-2">Important Notes</h5>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Please have the exact amount ready for payment</li>
              <li>• COD fee of ₹{codFee} applies for orders under ₹500</li>
              <li>• Payment must be made in cash only</li>
              <li>• Someone must be available to receive the delivery</li>
              <li>• Orders are confirmed immediately upon selection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCODConfirmation}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Truck className="w-5 h-5" />
        <span>Confirm Cash on Delivery</span>
      </motion.button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Questions about cash on delivery? 
          <a href="#" className="text-green-600 hover:text-green-700 ml-1">
            View our COD policy
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default StreamlinedCODPayment;