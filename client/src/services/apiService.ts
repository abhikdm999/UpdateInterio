import { apiRequest, fetcher } from '../lib/queryClient';
import type { 
  User, 
  InsertUser,
  Product, 
  InsertProduct,
  Category, 
  InsertCategory,
  Order, 
  InsertOrder,
  CartItem, 
  InsertCartItem,
  WishlistItem, 
  InsertWishlistItem,
  Review, 
  InsertReview,
  Transaction,
  InsertTransaction,
  TransactionEvent,
  InsertTransactionEvent
} from '@shared/schema';

// Authentication services
export const authService = {
  async register(userData: InsertUser) {
    return apiRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(email: string, password: string) {
    return apiRequest<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getUser(id: string) {
    return fetcher<{ user: User }>(`/auth/user/${id}`);
  },
};

// Product services
export const productService = {
  async getProducts(filters?: {
    category?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    return fetcher<{ products: Product[] }>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  async getProduct(id: string) {
    return fetcher<{ product: Product }>(`/products/${id}`);
  },

  async createProduct(product: InsertProduct) {
    return apiRequest<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
};

// Category services
export const categoryService = {
  async getCategories() {
    return fetcher<{ categories: Category[] }>('/categories');
  },

  async createCategory(category: InsertCategory) {
    return apiRequest<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
};

// Order services
export const orderService = {
  async getOrders(userId: string) {
    return fetcher<{ orders: Order[] }>(`/orders/${userId}`);
  },

  async createOrder(order: InsertOrder) {
    return apiRequest<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },
};

// Cart services
export const cartService = {
  async getCartItems(userId: string) {
    return fetcher<{ items: CartItem[] }>(`/cart/${userId}`);
  },

  async addToCart(item: InsertCartItem) {
    return apiRequest<{ item: CartItem }>('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateCartItem(id: string, quantity: number) {
    return apiRequest<{ item: CartItem }>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(id: string) {
    return apiRequest<{ success: boolean }>(`/cart/${id}`, {
      method: 'DELETE',
    });
  },
};

// Wishlist services
export const wishlistService = {
  async getWishlistItems(userId: string) {
    return fetcher<{ items: WishlistItem[] }>(`/wishlist/${userId}`);
  },

  async addToWishlist(item: InsertWishlistItem) {
    return apiRequest<{ item: WishlistItem }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async removeFromWishlist(userId: string, productId: string) {
    return apiRequest<{ success: boolean }>(`/wishlist/${userId}/${productId}`, {
      method: 'DELETE',
    });
  },
};

// Review services
export const reviewService = {
  async getReviews(productId: string) {
    return fetcher<{ reviews: Review[] }>(`/reviews/${productId}`);
  },

  async createReview(review: InsertReview) {
    return apiRequest<{ review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },
};

// Transaction services
export const transactionService = {
  async createTransaction(transaction: InsertTransaction) {
    return apiRequest<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  async updateTransaction(orderId: string, updates: Partial<InsertTransaction>) {
    return apiRequest<{ transaction: Transaction }>(`/transactions/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async createTransactionEvent(event: InsertTransactionEvent) {
    return apiRequest<{ event: TransactionEvent }>('/transaction-events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },
};

// Payment services
export const paymentService = {
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) {
    return apiRequest<{ clientSecret: string; paymentIntentId: string }>('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, metadata }),
    });
  },
};