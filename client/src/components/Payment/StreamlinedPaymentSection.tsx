import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StreamlinedUPIPayment from './StreamlinedUPIPayment';
import StreamlinedRazorpayUPI from './StreamlinedRazorpayUPI';
import StreamlinedCODPayment from './StreamlinedCODPayment';
import { StreamlinedPaymentMethodType } from './StreamlinedPaymentMethod';

interface StreamlinedPaymentSectionProps {
  amount: number;
  paymentMethod: StreamlinedPaymentMethodType;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  orderId: string;
  shippingAddress?: any;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

/**
 * Streamlined Payment Section Component
 * Renders the appropriate payment component based on selected method
 */
const StreamlinedPaymentSection: React.FC<StreamlinedPaymentSectionProps> = ({
  amount,
  paymentMethod,
  customerInfo,
  orderId,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
}) => {
  console.log('StreamlinedPaymentSection rendered with:', { 
    amount, 
    paymentMethod, 
    customerInfo, 
    orderId 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {paymentMethod === 'upi' && (
          <>
            {console.log('Rendering UPI payment component')}
          <StreamlinedUPIPayment
            key="upi"
            amount={amount}
            orderId={orderId}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
          </>
        )}
        
        {paymentMethod === 'razorpay-upi' && (
          <>
            {console.log('Rendering Razorpay UPI payment component')}
          <StreamlinedRazorpayUPI
            key="razorpay-upi"
            amount={amount}
            customerInfo={customerInfo}
            orderId={orderId}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
          </>
        )}
        
        {paymentMethod === 'cod' && (
          <>
            {console.log('Rendering COD payment component')}
          <StreamlinedCODPayment
            key="cod"
            amount={amount}
            customerInfo={customerInfo}
            shippingAddress={shippingAddress}
            onPaymentSuccess={onPaymentSuccess}
          />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StreamlinedPaymentSection;