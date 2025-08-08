import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productSlice from './slices/productSlice';
import wishlistSlice from './slices/wishlistSlice';
import historySlice from './slices/historySlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productSlice,
    wishlist: wishlistSlice,
    history: historySlice,
    orders: orderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;