import { RAZORPAY_CONFIG, generateRazorpayOptions, validateRazorpayConfig } from '../config/razorpay';

export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentMethod: string;
  amount: number;
  timestamp: number;
  errorMessage?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  contact: string;
}

/**
 * Razorpay Payment Service
 * Handles all Razorpay payment operations
 */
export class RazorpayService {
  private static isRazorpayLoaded = false;

  /**
   * Load Razorpay script dynamically
   */
  static async loadRazorpayScript(): Promise<boolean> {
    if (this.isRazorpayLoaded) return true;
    
    console.log('Loading Razorpay script...');

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.isRazorpayLoaded = true;
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Create Razorpay order (server-side simulation)
   */
  static async createOrder(orderRequest: RazorpayOrderRequest): Promise<RazorpayOrderResponse> {
    // In a real implementation, this would be a server-side API call
    // For demo purposes, we'll simulate the order creation
    
    if (!validateRazorpayConfig()) {
      throw new Error('Razorpay configuration is invalid');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock Razorpay order response
    const mockOrder: RazorpayOrderResponse = {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      entity: 'order',
      amount: orderRequest.amount * 100, // Convert to paise
      amount_paid: 0,
      amount_due: orderRequest.amount * 100,
      currency: orderRequest.currency,
      receipt: orderRequest.receipt,
      status: 'created',
      attempts: 0,
      notes: orderRequest.notes || {},
      created_at: Math.floor(Date.now() / 1000)
    };

    return mockOrder;
  }

  /**
   * Process UPI payment through Razorpay (Streamlined)
   */
  static async processUPIPayment(
    amount: number,
    customerInfo: CustomerInfo,
    orderId: string
  ): Promise<PaymentResult> {
    console.log('Processing UPI payment:', { amount, customerInfo, orderId });
    
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        console.error('Razorpay script failed to load');
        throw new Error('Failed to load Razorpay payment gateway');
      }
      
      console.log('Razorpay script loaded, creating order...');

      // Create Razorpay order
      const orderRequest: RazorpayOrderRequest = {
        amount,
        currency: RAZORPAY_CONFIG.currency,
        receipt: orderId,
        notes: {
          payment_method: 'upi',
          customer_name: customerInfo.name
        }
      };

      const razorpayOrder = await this.createOrder(orderRequest);
      console.log('Razorpay order created:', razorpayOrder);

      // Generate Razorpay options for UPI only
      const options = generateRazorpayOptions(amount, razorpayOrder.id, customerInfo, 'upi');
      console.log('Razorpay options generated:', options);

      return new Promise((resolve, reject) => {
        console.log('Opening Razorpay payment modal...');
        
        const razorpay = new (window as any).Razorpay({
          ...options,
          handler: (response: any) => {
            // Payment successful
            console.log('Payment successful:', response);
            resolve({
              success: true,
              transactionId: `UPI_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'UPI',
              amount,
              timestamp: Date.now()
            });
          },
          modal: {
            ondismiss: () => {
              // Payment cancelled
              console.log('Payment modal dismissed by user');
              resolve({
                success: false,
                transactionId: `UPI_CANCELLED_${Date.now()}`,
                paymentMethod: 'UPI',
                amount,
                timestamp: Date.now(),
                errorMessage: 'Payment cancelled by user'
              });
            }
          }
        });

        razorpay.open();
        console.log('Razorpay modal opened');
      });

    } catch (error) {
      console.error('UPI payment processing error:', error);
      return {
        success: false,
        transactionId: `UPI_FAILED_${Date.now()}`,
        paymentMethod: 'UPI',
        amount,
        timestamp: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'UPI payment failed'
      };
    }
  }

  /**
   * Process Cash on Delivery (no Razorpay processing needed)
   */
  static async processCODPayment(
    amount: number,
    customerInfo: CustomerInfo,
    orderId: string
  ): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: `COD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      paymentMethod: 'Cash on Delivery',
      amount,
      timestamp: Date.now()
    };
  }

  /**
   * Get payment status from Razorpay
   */
  static async getPaymentStatus(paymentId: string): Promise<any> {
    // In a real implementation, this would make an API call to Razorpay
    // For demo purposes, we'll return a mock response
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: paymentId,
      status: 'captured',
      amount: 100000, // Amount in paise
      currency: 'INR',
      method: 'upi',
      captured: true,
      created_at: Math.floor(Date.now() / 1000)
    };
  }
}