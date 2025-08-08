import { v4 as uuidv4 } from 'uuid';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'cod' | 'test';
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: PaymentMethod['type'];
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  timestamp: number;
  authCode?: string;
  errorMessage?: string;
  processingTime: number;
}

/**
 * Unified Payment Service
 * Handles all payment processing across the application
 */
export class PaymentService {
  private static readonly DUMMY_UPI_ID = 'test@paytm';
  private static readonly DUMMY_MERCHANT_NAME = 'Interoo Services';
  private static readonly SUCCESS_RATE = 0.85; // 85% success rate for testing

  /**
   * Get available payment methods
   */
  static getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'upi',
        name: 'UPI Payment',
        type: 'upi',
        description: 'Pay using UPI apps or scan QR code',
        icon: 'smartphone',
        enabled: true,
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        description: 'Pay securely with your card',
        icon: 'credit-card',
        enabled: true,
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        type: 'cod',
        description: 'Pay when you receive your order',
        icon: 'truck',
        enabled: true,
      },
      {
        id: 'test',
        name: 'Test Payment (Demo)',
        type: 'test',
        description: 'Dummy payment for testing purposes',
        icon: 'test-tube',
        enabled: process.env.NODE_ENV === 'development',
      },
    ];
  }

  /**
   * Generate UPI payment link
   */
  static generateUPILink(request: PaymentRequest): string {
    const { amount, orderId, customerInfo } = request;
    return `upi://pay?pa=${this.DUMMY_UPI_ID}&pn=${encodeURIComponent(this.DUMMY_MERCHANT_NAME)}&tid=${orderId}&tr=${orderId}&tn=Payment%20for%20Order&am=${amount}&cu=INR`;
  }

  /**
   * Process UPI payment
   */
  static async processUPIPayment(request: PaymentRequest): Promise<PaymentResult> {
    const startTime = Date.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const success = Math.random() < this.SUCCESS_RATE;
    const processingTime = Date.now() - startTime;
    
    if (success) {
      return {
        success: true,
        transactionId: `UPI_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'UPI',
        amount: request.amount,
        timestamp: Date.now(),
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        processingTime,
      };
    } else {
      return {
        success: false,
        transactionId: `UPI_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'UPI',
        amount: request.amount,
        timestamp: Date.now(),
        errorMessage: 'Payment failed. Please try again.',
        processingTime,
      };
    }
  }

  /**
   * Process card payment
   */
  static async processCardPayment(
    request: PaymentRequest,
    cardData: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      cardName: string;
    }
  ): Promise<PaymentResult> {
    const startTime = Date.now();
    
    // Validate card data
    if (!this.validateCardNumber(cardData.cardNumber)) {
      return {
        success: false,
        transactionId: `CARD_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'Credit/Debit Card',
        amount: request.amount,
        timestamp: Date.now(),
        errorMessage: 'Payment failed. Please try again.',
        processingTime: Date.now() - startTime,
      };
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    const success = Math.random() < this.SUCCESS_RATE;
    const processingTime = Date.now() - startTime;
    
    if (success) {
      return {
        success: true,
        transactionId: `CARD_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'Credit/Debit Card',
        amount: request.amount,
        timestamp: Date.now(),
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        processingTime,
      };
    } else {
      return {
        success: false,
        transactionId: `CARD_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'Credit/Debit Card',
        amount: request.amount,
        timestamp: Date.now(),
        errorMessage: 'Payment failed. Please try again.',
        processingTime,
      };
    }
  }

  /**
   * Process cash on delivery
   */
  static async processCODPayment(request: PaymentRequest): Promise<PaymentResult> {
    const startTime = Date.now();
    
    // COD always succeeds (no actual payment processing)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: `COD_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
      paymentMethod: 'Cash on Delivery',
      amount: request.amount,
      timestamp: Date.now(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Process test payment
   */
  static async processTestPayment(
    request: PaymentRequest,
    outcome: 'success' | 'failure' | 'random' = 'random'
  ): Promise<PaymentResult> {
    const startTime = Date.now();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let success = false;
    if (outcome === 'success') {
      success = true;
    } else if (outcome === 'failure') {
      success = false;
    } else {
      success = Math.random() < this.SUCCESS_RATE;
    }
    
    const processingTime = Date.now() - startTime;
    
    if (success) {
      return {
        success: true,
        transactionId: `TEST_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'Test Payment',
        amount: request.amount,
        timestamp: Date.now(),
        authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        processingTime,
      };
    } else {
      return {
        success: false,
        transactionId: `TEST_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: 'Test Payment',
        amount: request.amount,
        timestamp: Date.now(),
        errorMessage: 'Payment failed. Please try again.',
        processingTime,
      };
    }
  }

  /**
   * Main payment processing method
   */
  static async processPayment(
    request: PaymentRequest,
    additionalData?: any
  ): Promise<PaymentResult> {
    try {
      switch (request.paymentMethod) {
        case 'upi':
          return await this.processUPIPayment(request);
        case 'card':
          return await this.processCardPayment(request, additionalData);
        case 'cod':
          return await this.processCODPayment(request);
        case 'test':
          return await this.processTestPayment(request, additionalData?.outcome);
        default:
          throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }
    } catch (error) {
      return {
        success: false,
        transactionId: `ERR_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentMethod: request.paymentMethod,
        amount: request.amount,
        timestamp: Date.now(),
        errorMessage: 'Payment failed. Please try again.',
        processingTime: 0,
      };
    }
  }

  /**
   * Validate card number using Luhn algorithm
   */
  private static validateCardNumber(cardNumber: string): boolean {
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
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Generate transaction reference
   */
  static generateTransactionReference(): string {
    return `TXN_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;
  }
}