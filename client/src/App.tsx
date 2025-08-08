import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Hero from './components/HomePage/Hero';
import FeaturedProducts from './components/HomePage/FeaturedProducts';
import SpecialDeals from './components/HomePage/SpecialDeals';
import ProductGrid from './components/Products/ProductGrid';
import ProductsPage from './components/Products/ProductsPage';
import WishlistPage from './components/User/WishlistPage';
import AccountPage from './components/User/AccountPage';
import OrdersPage from './components/User/OrdersPage';
import HistoryPage from './components/User/HistoryPage';
import CheckoutForm from './components/Checkout/CheckoutForm';
import OneRupeeDeals from './components/Deals/OneRupeeDeals';
import MyOrders from './components/Orders/MyOrders';
import Testimonials from './components/HomePage/Testimonials';
import Newsletter from './components/HomePage/Newsletter';
import CartSidebar from './components/Cart/CartSidebar';
import WhatsAppChat from './components/UI/WhatsAppChat';
import PaymentDiagnosticsPanel from './components/UI/PaymentDiagnosticsPanel';
import StreamlinedCheckout from './components/Checkout/StreamlinedCheckout';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showStreamlinedCheckout, setShowStreamlinedCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Listen for checkout navigation
  useEffect(() => {
    const handleCheckoutNavigation = () => {
      setShowCheckout(true);
    };

    const handleOrdersNavigation = () => {
      setCurrentPage('orders');
    };

    const handleStreamlinedCheckoutNavigation = (event: any) => {
      setCheckoutProduct(event.detail.product);
      setShowStreamlinedCheckout(true);
    };
    window.addEventListener('navigate-to-checkout', handleCheckoutNavigation);
    window.addEventListener('navigate-to-orders', handleOrdersNavigation);
    window.addEventListener('navigate-to-streamlined-checkout', handleStreamlinedCheckoutNavigation);

    return () => {
      window.removeEventListener('navigate-to-checkout', handleCheckoutNavigation);
      window.removeEventListener('navigate-to-orders', handleOrdersNavigation);
      window.removeEventListener('navigate-to-streamlined-checkout', handleStreamlinedCheckoutNavigation);
    };
  }, []);

  if (showCheckout) {
    return (
      <Provider store={store}>
        <Router>
          <div className="min-h-screen bg-white font-inter">
            <CheckoutForm onBack={() => setShowCheckout(false)} />
          </div>
        </Router>
      </Provider>
    );
  }

  if (showStreamlinedCheckout) {
    return (
      <Provider store={store}>
        <Router>
          <div className="min-h-screen bg-white font-inter">
            <StreamlinedCheckout 
              product={checkoutProduct}
              onBack={() => {
                setShowStreamlinedCheckout(false);
                setCheckoutProduct(null);
              }}
              onComplete={() => {
                setShowStreamlinedCheckout(false);
                setCheckoutProduct(null);
                setCurrentPage('orders');
              }}
            />
          </div>
        </Router>
      </Provider>
    );
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'account':
        return <AccountPage />;
      case 'history':
        return <HistoryPage />;
      case 'orders':
        return <OrdersPage />;
      case 'my-orders':
        return <MyOrders />;
      default:
        return (
          <main>
            <Hero onNavigate={handleNavigate} />
            <SpecialDeals />
            <FeaturedProducts onNavigate={handleNavigate} />
            <ProductGrid />
            <OneRupeeDeals />
            <Testimonials />
            <Newsletter />
          </main>
        );
    }
  };

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-white font-inter">
          <Navbar onNavigate={handleNavigate} />
          {renderPage()}
          {currentPage === 'home' && <Footer />}
          <CartSidebar />
          <WhatsAppChat />
          <PaymentDiagnosticsPanel />
        </div>
      </Router>
    </Provider>
  );
}

export default App;