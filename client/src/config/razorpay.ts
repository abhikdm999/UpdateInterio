// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Test API Keys - Replace with your actual test keys
  keyId: 'rzp_test_1DP5mmOlF5G5ag', // Test Key ID - Replace with actual test key
  keySecret: 'thisissecretkey', // Dummy Test Key Secret (server-side only)
  
  // Test webhook secret
  webhookSecret: 'whsec_test_webhook_secret_dummy',
  
  // API endpoints
  baseUrl: 'https://api.razorpay.com/v1',
  
  // Test mode settings
  testMode: true,
  
  // Currency
  currency: 'INR',
  
  // Company details
  company: {
    name: 'Interoo Services',
    description: 'Premium Furniture & Home Decor - Test Environment',
    logo: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=100',
    theme: {
      color: '#F59E0B'
    },
    // Test environment settings
    testCredentials: {
      upiId: 'success@razorpay', // Use success@razorpay for successful test payments
      merchantCode: 'TEST_MERCHANT_001',
      terminalId: 'TEST_TERMINAL_001'
    }
  }
};

// Razorpay payment methods configuration
export const PAYMENT_METHODS = {
  UPI: {
    id: 'upi',
    name: 'UPI Payment',
    description: 'Pay using UPI apps like PhonePe, GPay, Paytm',
    icon: 'smartphone',
    enabled: true,
    flow: ['upi']
  },
  COD: {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: 'truck',
    enabled: true,
    flow: [] // No Razorpay processing needed
  }
};

// Helper function to validate Razorpay configuration
export const validateRazorpayConfig = (): boolean => {
  return !!(RAZORPAY_CONFIG.keyId && RAZORPAY_CONFIG.keySecret);
};

// Generate Razorpay order options
export const generateRazorpayOptions = (
  amount: number,
  orderId: string,
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  },
  paymentMethod: 'upi'
) => {
  return {
    key: RAZORPAY_CONFIG.keyId,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.company.name,
    description: RAZORPAY_CONFIG.company.description,
    image: RAZORPAY_CONFIG.company.logo,
    order_id: orderId,
    method: {
      upi: true
    },
    prefill: {
      name: customerInfo.name,
      email: customerInfo.email,
      contact: customerInfo.contact
    },
    theme: {
      color: RAZORPAY_CONFIG.company.theme.color
    },
    modal: {
      ondismiss: () => {
        console.log('Razorpay payment modal dismissed');
      }
    }
  };
};