/**
 * Enhanced UPI Payment Component with Razorpay Integration
 * 
 * This component provides two UPI payment options:
 * 1. Open with UPI Apps (GPay, PhonePe, Paytm) - using Razorpay UPI Intent
 * 2. Scan QR Code - Display dummy Razorpay QR with 180-second countdown
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Clock, Copy, Check, QrCode, ExternalLink, ArrowLeft, Shield } from 'lucide-react';
import QRCode from 'qrcode';
import { RazorpayService } from '../../services/razorpayService';
import { RAZORPAY_CONFIG } from '../../config/razorpay';

// =============================================
// TYPE DEFINITIONS
// =============================================
type UPIPaymentMode = 'selection' | 'apps' | 'qr';

interface PaymentSuccessResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  upiId?: string;
  orderId: string;
  timestamp: number;
}

interface UPIApp {
  name: string;
  icon: string;
  brandColor: string;
  description: string;
}

interface StreamlinedUPIPaymentProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (result: PaymentSuccessResult) => void;
  onPaymentError: (error: string) => void;
}

// =============================================
// MAIN COMPONENT
// =============================================
const StreamlinedUPIPayment: React.FC<StreamlinedUPIPaymentProps> = ({ 
  amount, 
  orderId,
  onPaymentSuccess, 
  onPaymentError 
}) => {
  // =============================================
  // STATE MANAGEMENT
  // =============================================
  const [paymentMode, setPaymentMode] = useState<UPIPaymentMode>('selection');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timer, setTimer] = useState(180); // 180 seconds (3 minutes) for QR
  const [isExpired, setIsExpired] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // =============================================
  // PAYMENT CONFIGURATION
  // =============================================
  // UPI payment details with Razorpay
  const upiId = RAZORPAY_CONFIG.company.testCredentials.upiId; // test@razorpay
  const merchantName = RAZORPAY_CONFIG.company.name;
  const transactionId = `RZP_UPI_${Date.now()}_${orderId}`;

  // Customer info for Razorpay
  const customerInfo = {
    name: 'Test Customer',
    email: 'test@example.com',
    contact: '9999999999'
  };

  // Supported UPI apps for Razorpay Intent
  const upiApps: UPIApp[] = [
    {
      name: 'Google Pay',
      icon: '💰',
      brandColor: 'bg-blue-600',
      description: 'Pay securely with Google Pay'
    },
    {
      name: 'PhonePe',
      icon: '📱', 
      brandColor: 'bg-purple-600',
      description: 'Pay instantly with PhonePe'
    },
    {
      name: 'Paytm',
      icon: '💳',
      brandColor: 'bg-indigo-600',
      description: 'Pay quickly with Paytm'
    }
  ];

  // Generate dummy Razorpay QR for testing
  const generateRazorpayQR = async () => {
    const razorpayUpiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Razorpay%20Payment%20for%20Order%20${orderId}&mc=5411`;
    
    try {
      const url = await QRCode.toDataURL(razorpayUpiLink, {
        width: 256,
        margin: 2,
        color: { dark: '#3B82F6', light: '#FFFFFF' }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR generation failed:', err);
      onPaymentError('Failed to generate Razorpay QR code');
    }
  };

  // =============================================
  // EFFECTS AND LIFECYCLE METHODS
  // =============================================
  useEffect(() => {
    if (paymentMode === 'qr') {
      generateRazorpayQR();
      
      // Start 180-second countdown timer for QR
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentMode]);

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  /**
   * Handle UPI app selection via Razorpay UPI Intent
   */
  const handleUPIAppClick = async (app: UPIApp) => {
    setIsProcessing(true);
    try {
      console.log(`Processing ${app.name} payment via Razorpay UPI Intent...`);
      
      // Use Razorpay UPI Intent for the selected app
      const result = await RazorpayService.processUPIPayment(amount, customerInfo, orderId);
      
      if (result.success) {
        onPaymentSuccess({
          success: true,
          transactionId: result.transactionId,
          paymentMethod: `${app.name} (via Razorpay UPI)`,
          amount,
          orderId,
          timestamp: Date.now()
        });
      } else {
        onPaymentError(result.errorMessage || `${app.name} payment failed`);
      }
    } catch (err) {
      console.error(`${app.name} payment error:`, err);
      onPaymentError(`Failed to process ${app.name} payment`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Copy UPI ID to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      onPaymentError('Failed to copy UPI ID to clipboard');
    }
  };

  /**
   * Handle QR payment completion
   */
  const handleQRPaymentComplete = async () => {
    setIsProcessing(true);
    try {
      // Simulate QR payment verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess({
        success: true,
        transactionId: `RZP_QR_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        paymentMethod: 'UPI via Razorpay QR',
        amount,
        upiId,
        orderId,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('QR payment verification failed:', err);
      onPaymentError('Failed to verify QR payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Format time from seconds to MM:SS
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Reset to selection mode
   */
  const resetToSelection = () => {
    setPaymentMode('selection');
    setIsExpired(false);
    setTimer(180);
    setQrCodeUrl('');
  };

  // =============================================
  // RENDER COMPONENT
  // =============================================
  
  // Selection Mode - Show two options
  if (paymentMode === 'selection') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Payment Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">UPI Payment via Razorpay</h3>
          <p className="text-gray-600">
            Choose your preferred UPI payment method
          </p>
        </div>

        {/* Payment Amount Display */}
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <h4 className="text-lg font-semibold text-blue-900 mb-1">Amount to Pay</h4>
          <p className="text-3xl font-bold text-blue-600">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        {/* Two Payment Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 text-center">Select Payment Method</h4>
          
          {/* Option 1: Open with UPI Apps */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMode('apps')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h5 className="text-lg font-semibold">Open with UPI Apps</h5>
                  <p className="text-blue-100 text-sm">Pay directly through GPay, PhonePe, Paytm</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-200" />
            </div>
          </motion.button>

          {/* Option 2: Scan QR Code */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMode('qr')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h5 className="text-lg font-semibold">Scan QR Code</h5>
                  <p className="text-purple-100 text-sm">Scan with any UPI app (180 sec timer)</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-purple-200" />
            </div>
          </motion.button>
        </div>

        {/* Razorpay Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Secured by Razorpay</span>
          </div>
          <p className="text-xs text-gray-500">
            Safe and secure payments with bank-level security
          </p>
        </div>
      </motion.div>
    );
  }

  // UPI Apps Mode - Show UPI app options with Razorpay UPI Intent
  if (paymentMode === 'apps') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={resetToSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h3 className="text-xl font-semibold text-gray-900">Open with UPI Apps</h3>
          <div></div>
        </div>

        {/* Payment Amount */}
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <h4 className="text-lg font-semibold text-blue-900 mb-1">Amount to Pay</h4>
          <p className="text-3xl font-bold text-blue-600">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        {/* UPI Apps Grid */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 text-center">Select your UPI app</h4>
          <div className="grid grid-cols-1 gap-4">
            {upiApps.map((app) => (
              <motion.button
                key={app.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUPIAppClick(app)}
                disabled={isProcessing}
                className={`${app.brandColor} hover:opacity-90 text-white p-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{app.icon}</span>
                    </div>
                    <div className="text-left">
                      <h5 className="text-lg font-semibold">{app.name}</h5>
                      <p className="text-white/80 text-sm">{app.description}</p>
                    </div>
                  </div>
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-white/80" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span className="font-medium text-blue-900">Processing Payment...</span>
            </div>
            <p className="text-sm text-blue-700">
              Please complete the payment in the opened UPI app
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-amber-50 rounded-xl p-4">
          <h4 className="font-medium text-amber-900 mb-2">Payment Instructions</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Select your preferred UPI app above</li>
            <li>• The app will open with payment details pre-filled</li>
            <li>• Verify the amount and merchant details</li>
            <li>• Complete the payment using your UPI PIN</li>
            <li>• You'll be redirected back automatically after payment</li>
          </ul>
        </div>
      </motion.div>
    );
  }

  // QR Code Mode - Show Razorpay QR with 180-second countdown
  if (paymentMode === 'qr') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={resetToSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
          <div></div>
        </div>

        {/* Payment Amount */}
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <h4 className="text-lg font-semibold text-purple-900 mb-1">Amount to Pay</h4>
          <p className="text-3xl font-bold text-purple-600">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        {/* Timer Display */}
        {!isExpired && (
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-900">
                QR Code expires in {formatTime(timer)}
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timer / 180) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Razorpay QR Code Display */}
        {!isExpired && qrCodeUrl && (
          <div className="bg-white rounded-xl p-6 text-center border-2 border-purple-200">
            {/* Razorpay Branding */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Powered by Razorpay</span>
            </div>
            
            <img
              src={qrCodeUrl}
              alt="Razorpay UPI QR Code"
              className="w-64 h-64 mx-auto mb-4 border border-purple-100 rounded-lg"
            />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">Scan & Pay</p>
              <p className="text-sm text-gray-600">Pay to: {merchantName}</p>
              <p className="text-xs text-gray-500">UPI ID: {upiId}</p>
            </div>
          </div>
        )}

        {/* UPI ID Copy Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3">Or pay manually using UPI ID</h4>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <p className="text-sm text-gray-600">UPI ID</p>
              <p className="font-mono text-gray-900">{upiId}</p>
            </div>
            <button
              onClick={() => copyToClipboard(upiId)}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Payment Completion Button */}
        {!isExpired && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQRPaymentComplete}
            disabled={isProcessing}
            className={`w-full ${isProcessing ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Payment...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>I've Completed the Payment</span>
              </>
            )}
          </motion.button>
        )}

        {/* Expired State */}
        {isExpired && (
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-800 font-medium">QR Code Expired</p>
            <p className="text-red-700 text-sm mb-4">The QR code has expired after 3 minutes</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetToSelection}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Generate New QR Code
            </motion.button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-medium text-purple-900 mb-2">QR Payment Instructions</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
            <li>• Scan the QR code above</li>
            <li>• Verify the amount and merchant details</li>
            <li>• Complete the payment using your UPI PIN</li>
            <li>• Click "I've Completed the Payment" after successful payment</li>
          </ul>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default StreamlinedUPIPayment;