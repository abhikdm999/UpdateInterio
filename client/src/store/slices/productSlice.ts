import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  filteredProducts: Product[];
  categories: string[];
  currentCategory: string;
  searchQuery: string;
  sortBy: 'price' | 'popularity' | 'latest';
  isLoading: boolean;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  filteredProducts: [],
  categories: [],
  currentCategory: 'all',
  searchQuery: '',
  sortBy: 'latest',
  isLoading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
      state.categories = [...new Set(action.payload.map(p => p.category))];
    },
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(action.payload.toLowerCase()) ||
        product.description.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.currentCategory = action.payload;
      state.filteredProducts = action.payload === 'all' 
        ? state.products 
        : state.products.filter(product => product.category === action.payload);
    },
    setSortBy: (state, action: PayloadAction<'price' | 'popularity' | 'latest'>) => {
      state.sortBy = action.payload;
      state.filteredProducts = [...state.filteredProducts].sort((a, b) => {
        switch (action.payload) {
          case 'price':
            return a.price - b.price;
          case 'popularity':
            return b.rating - a.rating;
          case 'latest':
            return Date.now() - Date.now(); // Mock latest sort
          default:
            return 0;
        }
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProducts, setFeaturedProducts, setSearchQuery, setCategory, setSortBy, setLoading } = productSlice.actions;
export default productSlice.reducer;