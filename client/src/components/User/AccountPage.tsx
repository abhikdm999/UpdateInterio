import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Heart, Settings, LogOut, Edit, Camera, ShoppingBag, Save, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout, setUser } from '../../store/slices/authSlice';
import { MockAuthService } from '../../utils/mockAuth';
import OrdersPage from './OrdersPage';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { orders } = useSelector((state: RootState) => state.orders);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleEditProfile = () => {
    setProfileForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      dateOfBirth: '',
      address: typeof user?.address === 'string' ? user.address : ''
    });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      fullName: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await MockAuthService.updateProfile(user.id, {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        address: profileForm.address
      });
      
      dispatch(setUser(updatedUser));
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your account</h2>
          <p className="text-gray-600">Access your profile, orders, and preferences</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'orders-page', name: 'Order History', icon: ShoppingBag },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2025-01-15',
      status: 'Delivered',
      total: 1299,
      items: 2,
    },
    {
      id: 'ORD-002',
      date: '2025-01-10',
      status: 'Shipped',
      total: 599,
      items: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={user?.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-yellow-600 text-white p-1 rounded-full hover:bg-yellow-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-4">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditingProfile ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditProfile}
                        className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </motion.button>
                    ) : (
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isLoading ? 'Saving...' : 'Save'}</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={isEditingProfile ? profileForm.fullName : (user?.fullName || '')}
                        onChange={handleInputChange}
                        readOnly={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={isEditingProfile ? profileForm.phone : (user?.phone || '')}
                        onChange={handleInputChange}
                        readOnly={!isEditingProfile}
                        placeholder={isEditingProfile ? "Enter phone number" : "No phone number"}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileForm.dateOfBirth}
                        onChange={handleInputChange}
                        readOnly={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent' : 'bg-gray-50'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      rows={3}
                      name="address"
                      value={isEditingProfile ? profileForm.address : (typeof user?.address === 'string' ? user.address : '')}
                      onChange={handleInputChange}
                      readOnly={!isEditingProfile}
                      placeholder={isEditingProfile ? "Enter your address" : "No address added"}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                        isEditingProfile ? 'bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent' : 'bg-gray-50'
                      }`}
                    />
                  </div>

                  {/* Save Button - only show when editing */}
                  {isEditingProfile && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        <span>{isLoading ? 'Saving Profile...' : 'Save Profile'}</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order {order.id}</h3>
                              <p className="text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-600">{order.items.length} items</p>
                              <p className="font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="space-x-2">
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                View Details
                              </button>
                              {order.status === 'shipped' && (
                                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                                  Track Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <button
                          onClick={() => setActiveTab('orders-page')}
                          className="w-full py-3 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                        >
                          View All Orders ({orders.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders-page' && (
                <div className="-m-6">
                  <OrdersPage />
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                  <p className="text-gray-600 mb-4">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                  </p>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No items in your wishlist yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.slice(0, 6).map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-yellow-600 font-bold">${item.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                          <span className="ml-3 text-gray-700">Email notifications for orders</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                          <span className="ml-3 text-gray-700">Promotional emails</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                          <span className="ml-3 text-gray-700">SMS notifications</span>
                        </label>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Privacy</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                          <span className="ml-3 text-gray-700">Make profile public</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                          <span className="ml-3 text-gray-700">Share purchase history</span>
                        </label>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-6">
                      <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
                      <p className="text-red-600 mb-4">Once you delete your account, there is no going back.</p>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;