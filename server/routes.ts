import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertProductSchema,
  insertCategorySchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertReviewSchema,
  insertCartItemSchema,
  insertWishlistItemSchema,
  insertTransactionSchema,
  insertTransactionEventSchema,
} from "@shared/schema";

// Initialize Stripe with dummy key for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_development", {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
    }
  });

  app.get("/api/auth/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get user" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        featured: req.query.featured ? req.query.featured === 'true' : undefined,
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };
      
      const products = await storage.getProducts(filters);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ product });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json({ product });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product data" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json({ categories });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json({ category });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid category data" });
    }
  });

  // Orders routes
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const orders = await storage.getOrders(req.params.userId);
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json({ order });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid order data" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const items = await storage.getCartItems(req.params.userId);
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const itemData = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(itemData);
      res.status(201).json({ item });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ item });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to remove cart item" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const items = await storage.getWishlistItems(req.params.userId);
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get wishlist items" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const itemData = insertWishlistItemSchema.parse(req.body);
      const item = await storage.addToWishlist(itemData);
      res.status(201).json({ item });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid wishlist item data" });
    }
  });

  app.delete("/api/wishlist/:userId/:productId", async (req, res) => {
    try {
      const success = await storage.removeFromWishlist(req.params.userId, req.params.productId);
      if (!success) {
        return res.status(404).json({ error: "Wishlist item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to remove wishlist item" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.productId);
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json({ review });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid review data" });
    }
  });

  // Transaction routes for payment tracking
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json({ transaction });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:orderId", async (req, res) => {
    try {
      const updates = req.body;
      const transaction = await storage.updateTransaction(req.params.orderId, updates);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json({ transaction });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update transaction" });
    }
  });

  app.post("/api/transaction-events", async (req, res) => {
    try {
      const eventData = insertTransactionEventSchema.parse(req.body);
      const event = await storage.createTransactionEvent(eventData);
      res.status(201).json({ event });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid event data" });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", metadata = {} } = req.body;
      
      // For development with dummy keys, return mock response
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_dummy_key_for_development") {
        res.json({ 
          clientSecret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          paymentIntentId: `pi_test_${Date.now()}`
        });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      // For development with dummy keys, just acknowledge
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_dummy_key_for_development") {
        res.json({ received: true });
        return;
      }

      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).send('Missing signature or webhook secret');
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          // Update order status, send confirmation email, etc.
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`Payment failed for PaymentIntent ${failedPayment.id}`);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Razorpay payment routes
  app.post('/api/payments/razorpay/create-order', async (req, res) => {
    try {
      const { amount, currency, receipt, notes } = req.body;
      
      // Validate input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Mock Razorpay order creation for development
      const mockOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        entity: 'order',
        amount: amount * 100, // Convert to paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: currency || 'INR',
        receipt: receipt,
        status: 'created',
        attempts: 0,
        notes: notes || {},
        created_at: Math.floor(Date.now() / 1000)
      };
      
      console.log('Created Razorpay order:', mockOrder);
      res.json({ success: true, order: mockOrder });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create order' });
    }
  });

  app.post('/api/payments/razorpay/verify', async (req, res) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      
      // Validate input
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ error: 'Missing payment verification data' });
      }
      
      // Mock payment verification for development
      console.log('Verifying Razorpay payment:', {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      });
      
      // Mock successful verification (in production, verify signature with Razorpay)
      const verificationResult = {
        verified: true,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: 'captured',
        amount: 100, // Mock amount in paise
        timestamp: Date.now()
      };
      
      res.json({ success: true, verification: verificationResult });
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Payment verification failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
