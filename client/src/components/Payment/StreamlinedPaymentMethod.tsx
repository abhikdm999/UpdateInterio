import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Truck, Check, CreditCard } from 'lucide-react';

export type StreamlinedPaymentMethodType = 'upi' | 'cod' | 'razorpay-upi';

interface StreamlinedPaymentMethodProps {
  selectedMethod: StreamlinedPaymentMethodType;
  onMethodChange: (method: StreamlinedPaymentMethodType) => void;
}

const StreamlinedPaymentMethod: React.FC<StreamlinedPaymentMethodProps> = ({ 
  selectedMethod, 
  onMethodChange 
}) => {
  const handleMethodClick = (methodId: StreamlinedPaymentMethodType) => {
    console.log('Payment method selected:', methodId);
    onMethodChange(methodId);
  };

  const paymentMethods = [
    {
      id: 'upi' as StreamlinedPaymentMethodType,
      name: 'UPI Payment',
      description: 'QR Code, UPI ID, and UPI app links',
      icon: Smartphone,
      color: 'bg-blue-500',
      available: true,
    },
    {
      id: 'cod' as StreamlinedPaymentMethodType,
      name: 'Cash on Delivery',
      description: 'Pay at the time of delivery',
      icon: Truck,
      color: 'bg-green-500',
      available: true,
    },
    {
      id: 'razorpay-upi' as StreamlinedPaymentMethodType,
      name: 'Razorpay (UPI Only)',
      description: 'Secure UPI payment through Razorpay gateway',
      icon: Smartphone,
      color: 'bg-purple-500',
      available: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Select Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              selectedMethod === method.id
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleMethodClick(method.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${method.color} text-white`}>
                <method.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                selectedMethod === method.id
                  ? 'border-yellow-500 bg-yellow-500'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === method.id && (
                  <Check className="w-3 h-3 text-white m-0.5" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StreamlinedPaymentMethod;