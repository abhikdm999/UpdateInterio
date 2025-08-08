import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: any;
  transactionId: string;
  createdAt: string;
  estimatedDelivery?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload); // Add to beginning (most recent first)
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { 
  addOrder, 
  updateOrderStatus, 
  setCurrentOrder, 
  setLoading, 
  clearOrders 
} = orderSlice.actions;

export default orderSlice.reducer;