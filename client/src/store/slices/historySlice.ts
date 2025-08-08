import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface HistoryState {
  items: Product[];
}

const initialState: HistoryState = {
  items: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<Product>) => {
      // Remove if already exists to avoid duplicates
      state.items = state.items.filter(item => item.id !== action.payload.id);
      // Add to beginning of array (most recent first)
      state.items.unshift(action.payload);
      // Keep only last 50 items
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    clearHistory: (state) => {
      state.items = [];
    },
  },
});

export const { addToHistory, clearHistory } = historySlice.actions;
export default historySlice.reducer;