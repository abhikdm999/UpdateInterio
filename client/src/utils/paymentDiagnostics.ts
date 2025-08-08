/**
 * Payment System Diagnostics Utility
 * Provides comprehensive debugging and monitoring for payment issues
 */

export interface PaymentDiagnostic {
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  category: 'validation' | 'network' | 'ui' | 'security' | 'processing';
  message: string;
  details?: any;
  userAgent?: string;
  url?: string;
}

export class PaymentDiagnostics {
  private static logs: PaymentDiagnostic[] = [];
  private static maxLogs = 100;

  /**
   * Log diagnostic information
   */
  static log(diagnostic: Omit<PaymentDiagnostic, 'timestamp' | 'userAgent' | 'url'>) {
    const entry: PaymentDiagnostic = {
      ...diagnostic,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Payment Diagnostic - ${diagnostic.category}`);
      console.log('Type:', diagnostic.type);
      console.log('Message:', diagnostic.message);
      if (diagnostic.details) {
        console.log('Details:', diagnostic.details);
      }
      console.groupEnd();
    }
  }

  /**
   * Get diagnostic logs
   */
  static getLogs(category?: string): PaymentDiagnostic[] {
    if (category) {
      return this.logs.filter(log => log.category === category);
    }
    return [...this.logs];
  }

  /**
   * Clear diagnostic logs
   */
  static clearLogs() {
    this.logs = [];
  }

  /**
   * Check system health
   */
  static async checkSystemHealth(): Promise<{
    network: boolean;
    localStorage: boolean;
    javascript: boolean;
    cookies: boolean;
    ssl: boolean;
  }> {
    const health = {
      network: false,
      localStorage: false,
      javascript: true, // If this runs, JS is working
      cookies: false,
      ssl: window.location.protocol === 'https:',
    };

    // Test network connectivity
    try {
      await fetch('/api/health', { method: 'HEAD' });
      health.network = true;
    } catch (error) {
      this.log({
        type: 'error',
        category: 'network',
        message: 'Network connectivity test failed',
        details: error,
      });
    }

    // Test localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      health.localStorage = true;
    } catch (error) {
      this.log({
        type: 'error',
        category: 'ui',
        message: 'localStorage not available',
        details: error,
      });
    }

    // Test cookies
    try {
      document.cookie = 'test=test; path=/';
      health.cookies = document.cookie.includes('test=test');
      // Clean up
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    } catch (error) {
      this.log({
        type: 'error',
        category: 'security',
        message: 'Cookies not available',
        details: error,
      });
    }

    return health;
  }

  /**
   * Validate payment form data
   */
  static validatePaymentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Card number validation
    if (!data.cardNumber || !this.validateCardNumber(data.cardNumber)) {
      errors.push('Invalid card number');
    }

    // Expiry date validation
    if (!data.expiryDate || !this.validateExpiryDate(data.expiryDate)) {
      errors.push('Invalid or expired card');
    }

    // CVV validation
    if (!data.cvv || !this.validateCVV(data.cvv)) {
      errors.push('Invalid CVV');
    }

    // Name validation
    if (!data.cardName || data.cardName.trim().length < 2) {
      errors.push('Cardholder name required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Luhn algorithm for card validation
   */
  private static validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cleanNumber) || cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

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
   * Validate expiry date
   */
  private static validateExpiryDate(expiryDate: string): boolean {
    const match = expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/);
    if (!match) return false;

    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    return expiry > new Date();
  }

  /**
   * Validate CVV
   */
  private static validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Monitor payment processing performance
   */
  static startPerformanceMonitoring(transactionId: string) {
    const startTime = performance.now();
    
    return {
      end: (success: boolean, error?: any) => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.log({
          type: success ? 'info' : 'error',
          category: 'processing',
          message: `Payment processing ${success ? 'completed' : 'failed'} in ${duration.toFixed(2)}ms`,
          details: {
            transactionId,
            duration,
            success,
            error,
          },
        });
      },
    };
  }
}

/**
 * Payment Error Handler
 */
export class PaymentErrorHandler {
  static handleError(error: any, context: string): string {
    let userMessage = 'An unexpected error occurred. Please try again.';

    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      userMessage = 'Network connection error. Please check your internet connection and try again.';
      PaymentDiagnostics.log({
        type: 'error',
        category: 'network',
        message: 'Network error during payment processing',
        details: { context, error: error.message },
      });
    }

    // Timeout errors
    else if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      userMessage = 'Request timed out. Please try again.';
      PaymentDiagnostics.log({
        type: 'error',
        category: 'network',
        message: 'Timeout error during payment processing',
        details: { context, error: error.message },
      });
    }

    // Validation errors
    else if (error.name === 'ValidationError') {
      userMessage = error.message || 'Please check your payment information and try again.';
      PaymentDiagnostics.log({
        type: 'error',
        category: 'validation',
        message: 'Validation error',
        details: { context, error: error.message },
      });
    }

    // Security errors
    else if (error.name === 'SecurityError') {
      userMessage = 'Security error. Please refresh the page and try again.';
      PaymentDiagnostics.log({
        type: 'error',
        category: 'security',
        message: 'Security error during payment processing',
        details: { context, error: error.message },
      });
    }

    // API errors
    else if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        userMessage = 'Invalid payment information. Please check your details.';
      } else if (status === 401) {
        userMessage = 'Authentication failed. Please refresh and try again.';
      } else if (status === 429) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (status >= 500) {
        userMessage = 'Server error. Please try again later.';
      }

      PaymentDiagnostics.log({
        type: 'error',
        category: 'network',
        message: `API error: ${status}`,
        details: { context, status, error: error.response.data },
      });
    }

    return userMessage;
  }
}

/**
 * Payment Retry Logic
 */
export class PaymentRetryHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  static async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          PaymentDiagnostics.log({
            type: 'info',
            category: 'processing',
            message: `Retrying payment operation (attempt ${attempt + 1}/${maxRetries + 1})`,
            details: { context },
          });

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAYS[attempt - 1] || 4000));
        }

        return await operation();
      } catch (error) {
        lastError = error;

        PaymentDiagnostics.log({
          type: 'warning',
          category: 'processing',
          message: `Payment operation failed (attempt ${attempt + 1}/${maxRetries + 1})`,
          details: { context, error: error.message },
        });

        // Don't retry on validation errors
        if (error.name === 'ValidationError') {
          break;
        }
      }
    }

    throw lastError;
  }
}