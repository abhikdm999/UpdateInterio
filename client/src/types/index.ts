// Re-export types from shared schema for frontend use
export type {
  User,
  Product,
  Category,
  Order,
  CartItem,
  WishlistItem,
  Review,
  Transaction,
  TransactionEvent,
  InsertUser,
  InsertProduct,
  InsertCategory,
  InsertOrder,
  InsertCartItem,
  InsertWishlistItem,
  InsertReview,
  InsertTransaction,
  InsertTransactionEvent,
} from '@shared/schema';

// Additional frontend-specific types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

export interface ProductState {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: string;
}