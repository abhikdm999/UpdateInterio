import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Download, Trash2, Filter, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { PaymentDiagnostics, PaymentDiagnostic } from '../../utils/paymentDiagnostics';

const PaymentDiagnosticsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<PaymentDiagnostic[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setLogs(PaymentDiagnostics.getLogs());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.category === filter || log.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    PaymentDiagnostics.clearLogs();
    setLogs([]);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg z-40"
      >
        <Bug className="w-5 h-5" />
      </motion.button>

      {/* Diagnostics Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Diagnostics</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Controls */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All Logs</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                    <option value="validation">Validation</option>
                    <option value="network">Network</option>
                    <option value="processing">Processing</option>
                    <option value="security">Security</option>
                    <option value="ui">UI</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={exportLogs}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={clearLogs}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bug className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No diagnostic logs</p>
                  </div>
                ) : (
                  filteredLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-3 text-sm"
                    >
                      <div className="flex items-start space-x-2 mb-2">
                        {getIcon(log.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{log.category}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{log.message}</p>
                          {log.details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-blue-600">
                                Show Details
                              </summary>
                              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PaymentDiagnosticsPanel;