import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>

              {/* Auth Form */}
              <div className="text-center">
                <User className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication</h2>
                <p className="text-gray-600 mb-6">
                  Authentication features are being updated. Please check back later.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;