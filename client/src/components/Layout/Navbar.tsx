import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Menu, X, Home, Package, Heart, Settings, ShoppingBag } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleCart } from '../../store/slices/cartSlice';
import { setSearchQuery } from '../../store/slices/productSlice';
import { logout } from '../../store/slices/authSlice';
import AuthModal from '../Auth/AuthModal';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { products } = useSelector((state: RootState) => state.products);
  
  // Authentication is handled by API service

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
      
      // Generate search suggestions
      if (searchInput.length > 0) {
        const suggestions = products
          .filter(product => 
            product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            product.category.toLowerCase().includes(searchInput.toLowerCase())
          )
          .slice(0, 5)
          .map(product => product.name);
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, dispatch, products]);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'Home', icon: Home, page: 'home' },
    { name: 'Products', icon: Package, page: 'products' },
    { name: 'Orders', icon: ShoppingBag, page: 'orders' },
    { name: 'Wishlist', icon: Heart, page: 'wishlist' },
    { name: 'Account', icon: Settings, page: 'account' },
  ];

  const handleNavigation = (page: string) => {
    if ((page === 'wishlist' || page === 'account' || page === 'orders') && !user) {
      setShowAuthModal(true);
      return;
    }
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    dispatch(logout());
    onNavigate('home');
  };

  const handleLogoClick = () => {
    onNavigate('home');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo with proper spacing */}
            <motion.div 
              className="flex items-center cursor-pointer mr-16"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={handleLogoClick}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800">Interoo</span>
              </div>
            </motion.div>

            {/* Desktop Navigation with proper spacing */}
            <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.page)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-yellow-600 transition-colors px-2 xl:px-4 py-3 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm xl:text-lg">{item.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center max-w-sm lg:max-w-md w-full mx-4 lg:mx-8 relative">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setShowSuggestions(searchInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/90 backdrop-blur-sm text-sm lg:text-lg"
                />
                
                {/* Search Suggestions */}
                <AnimatePresence>
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50"
                    >
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchInput(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* User Profile */}
              {user ? (
                <motion.button
                  onClick={() => handleNavigation('account')}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <span className="hidden sm:block text-lg font-medium text-gray-700">
                    {user?.fullName || user?.email || 'User'}
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-yellow-600 transition-colors px-4 py-3 rounded-lg "
                >
                  <User className="w-6 h-6" />
                  <span className="hidden sm:block font-medium text-lg">Sign In</span>
                </motion.button>
              )}

              {/* Cart */}
              <motion.button
                onClick={() => dispatch(toggleCart())}
                className="relative p-3 text-gray-700 hover:text-yellow-600 transition-colors rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-7 h-7" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 text-gray-700 hover:text-yellow-600 transition-colors rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavigation(item.page)}
                      className="flex items-center space-x-3 py-4 text-gray-700 hover:text-yellow-600 transition-colors w-full text-left rounded-lg hover:bg-yellow-50 px-4"
                      whileHover={{ x: 5 }}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="font-medium text-lg">{item.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;