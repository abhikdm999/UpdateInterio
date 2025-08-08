import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { RootState } from '../../store';
import { removeFromCart, updateQuantity, clearCart, toggleCart } from '../../store/slices/cartSlice';

const CartSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { items, total, isOpen } = useSelector((state: RootState) => state.cart);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    dispatch(toggleCart());
    // Navigate to checkout - this will be handled by parent component
    window.dispatchEvent(new CustomEvent('navigate-to-checkout'));
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = total * 0.18; // 18% tax
  const shipping = total > 500 ? 0 : 50; // Free shipping over ₹500
  const grandTotal = total + tax + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => dispatch(toggleCart())}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                <span className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-full font-medium">
                  {cartItemCount}
                </span>
              </div>
              <button
                onClick={() => dispatch(toggleCart())}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">Add some amazing products to get started</p>
                  <button
                    onClick={() => dispatch(toggleCart())}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.product.name}</h4>
                        <p className="text-yellow-600 font-bold">₹{item.product.price.toLocaleString('en-IN')}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="mt-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Clear All Items
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                    <span className="font-medium text-gray-900">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-yellow-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {total < 500 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Add ₹{(500 - total).toLocaleString('en-IN')} more for free shipping!
                    </p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;