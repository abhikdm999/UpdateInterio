import { v4 as uuidv4 } from 'uuid';

export interface PaymentData {
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: number;
  merchantId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CardProcessingResult {
  success: boolean;
  transactionId: string;
  authCode?: string;
  errorMessage?: string;
  processingTime: number;
}

// Generate random transaction ID
export const generateTransactionId = (): string => {
  return `TXN_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
};

// Generate random auth code for successful transactions
export const generateAuthCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Simulate card processing with random backend data
export const processCardPayment = async (
  cardData: any,
  amount: number
): Promise<CardProcessingResult> => {
  const processingTime = Math.random() * 3000 + 1000; // 1-4 seconds
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        resolve({
          success: true,
          transactionId: generateTransactionId(),
          authCode: generateAuthCode(),
          processingTime: Math.round(processingTime),
        });
      } else {
        // Random error messages
        const errors = [
          'Insufficient funds',
          'Card declined by issuer',
          'Invalid card details',
          'Transaction limit exceeded',
          'Card expired',
        ];
        
        resolve({
          success: false,
          transactionId: generateTransactionId(),
          errorMessage: errors[Math.floor(Math.random() * errors.length)],
          processingTime: Math.round(processingTime),
        });
      }
    }, processingTime);
  });
};

// Generate payment summary data
export const generatePaymentSummary = (amount: number) => {
  const tax = amount * 0.18; // 18% GST in India
  const shipping = amount > 5000 ? 0 : 499; // Free shipping over ₹5000
  const processingFee = amount * 0.029 + 0.30; // Typical payment processing fee
  
  return {
    subtotal: amount,
    tax: Math.round(tax * 100) / 100,
    shipping: shipping,
    processingFee: Math.round(processingFee * 100) / 100,
    total: Math.round((amount + tax + shipping + processingFee) * 100) / 100,
  };
};

// Validate card number using Luhn algorithm
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) return false;
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Generate mock bank response
export const generateBankResponse = () => {
  const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'];
  const responseCode = Math.random() > 0.05 ? '00' : ['51', '54', '61', '65'][Math.floor(Math.random() * 4)];
  
  return {
    bankName: banks[Math.floor(Math.random() * banks.length)],
    responseCode,
    responseMessage: responseCode === '00' ? 'Approved' : 'Declined',
    rrn: Math.random().toString().substring(2, 14), // Reference number
    timestamp: new Date().toISOString(),
  };
};