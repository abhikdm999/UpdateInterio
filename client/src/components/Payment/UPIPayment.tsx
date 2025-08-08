import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Clock, Copy, Check, QrCode, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { transactionService } from '../../services/apiService';

interface UPIPaymentProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const UPIPayment: React.FC<UPIPaymentProps> = ({ 
  amount, 
  orderId,
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  // Replace these with your actual UPI details
  const upiId = 'your-business@upi'; // Your business UPI ID
  const merchantName = 'Your Business Name'; // Your business name
  
  const transactionId = `TXN${Date.now()}_${orderId}`;

  const generateUpiLink = () => {
    const params = new URLSearchParams();
    params.append('pa', upiId); // Payee address
    params.append('pn', merchantName); // Payee name
    params.append('tid', transactionId); // Transaction ID
    params.append('tr', transactionId); // Transaction reference
    params.append('tn', `Payment for Order #${orderId}`);
    params.append('am', amount.toString());
    params.append('cu', 'INR');
    
    return `upi://pay?${params.toString()}`;
  };

  const upiLink = generateUpiLink();

  useEffect(() => {
    // Generate QR code
    QRCode.toDataURL(upiLink)
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR generation failed:', err));

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePaymentExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const createPaymentRecord = async () => {
      try {
        await transactionService.createTransaction({
          orderId,
          amount: amount.toString(),
          upiId,
          transactionId,
          status: 'pending'
        });
      } catch (error) {
        console.error('Error creating payment record:', error);
      }
    };

    createPaymentRecord();

    return () => clearInterval(interval);
  }, [upiLink, orderId, amount, transactionId]);

  const handlePaymentExpiry = async () => {
    try {
      await transactionService.updateTransaction(orderId, {
        status: 'expired'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const verifyPayment = async () => {
    setIsProcessing(true);
    
    try {
      // In production, replace this with actual payment verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 85% success rate for demo
      const success = Math.random() > 0.15;
      
      if (success) {
        const { error } = await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
        
        if (error) throw error;
        
        onPaymentSuccess({
          success: true,
          transactionId,
          paymentMethod: 'UPI',
          amount,
          upiId,
          orderId
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      onPaymentError('Payment verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying UPI Payment</h3>
        <p className="text-gray-600">Please wait while we verify your payment...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pay with UPI</h3>
          <div className="flex items-center text-sm text-orange-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Expires in: {formatTime(timer)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </h4>
              <div className="border border-gray-200 rounded-lg p-4 flex justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 animate-pulse rounded"></div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Pay using UPI App
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
                <div className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-200">
                  <span className="font-mono text-sm">{upiId}</span>
                  <button 
                    onClick={() => copyToClipboard(upiId)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Copy this UPI ID and paste in your payment app</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Or open payment link directly</h4>
              <button
                onClick={() => window.open(upiLink, '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Open in UPI App
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={verifyPayment}
            disabled={timer === 0}
            className={`w-full py-3 px-4 rounded-md font-medium ${timer === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {timer === 0 ? 'Payment Expired' : 'I have made the payment'}
          </button>
        </div>

        {timer === 0 && (
          <div className="mt-4 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>This payment request has expired. Please refresh to generate a new one.</span>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>Note: Payment will be verified automatically. If facing issues, please contact support with transaction details.</p>
        </div>
      </div>
    </motion.div>
  );
};

// Initialize Supabase client outside the component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default UPIPayment;