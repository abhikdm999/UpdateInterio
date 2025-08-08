/*
  # E-commerce Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `original_price` (decimal, nullable)
      - `category` (text)
      - `images` (text array)
      - `stock` (integer)
      - `rating` (decimal)
      - `review_count` (integer)
      - `featured` (boolean)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total` (decimal)
      - `status` (text)
      - `shipping_address` (jsonb)
      - `payment_method` (text)
      - `payment_status` (text)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (decimal)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `phone` (text)
      - `address` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  category text NOT NULL,
  images text[] DEFAULT '{}',
  stock integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image text,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  payment_method text,
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Categories are insertable by authenticated users"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample categories
INSERT INTO categories (name, description, image) VALUES
  ('Furniture', 'Premium furniture for modern living', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Lighting', 'Elegant lighting solutions', 'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Decor', 'Beautiful home decorations', 'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, original_price, category, images, stock, rating, review_count, featured, tags) VALUES
  (
    'Modern Minimalist Sofa',
    'Elegant 3-seater sofa with premium fabric upholstery and solid wood frame.',
    1299.00,
    1599.00,
    'Furniture',
    ARRAY[
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029698/pexels-photo-2029698.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    15,
    4.8,
    124,
    true,
    ARRAY['modern', 'minimalist', 'sofa']
  ),
  (
    'Scandinavian Coffee Table',
    'Handcrafted oak coffee table with clean lines and natural finish.',
    599.00,
    799.00,
    'Furniture',
    ARRAY[
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    8,
    4.6,
    89,
    true,
    ARRAY['scandinavian', 'coffee table', 'oak']
  ),
  (
    'Industrial Floor Lamp',
    'Vintage-inspired floor lamp with adjustable head and brass accents.',
    249.00,
    NULL,
    'Lighting',
    ARRAY[
      'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1125131/pexels-photo-1125131.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    25,
    4.4,
    67,
    false,
    ARRAY['industrial', 'floor lamp', 'vintage']
  ),
  (
    'Luxury Velvet Armchair',
    'Plush velvet armchair with gold-finished legs and deep cushioning.',
    899.00,
    1199.00,
    'Furniture',
    ARRAY[
      'https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1099817/pexels-photo-1099817.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    12,
    4.9,
    156,
    true,
    ARRAY['luxury', 'velvet', 'armchair']
  ),
  (
    'Abstract Wall Art Set',
    'Set of 3 contemporary abstract prints on premium canvas.',
    179.00,
    NULL,
    'Decor',
    ARRAY[
      'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1668861/pexels-photo-1668861.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    50,
    4.3,
    43,
    false,
    ARRAY['abstract', 'wall art', 'contemporary']
  ),
  (
    'Ceramic Table Lamp',
    'Handmade ceramic table lamp with linen shade and warm LED bulb.',
    149.00,
    NULL,
    'Lighting',
    ARRAY[
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    30,
    4.5,
    78,
    false,
    ARRAY['ceramic', 'table lamp', 'handmade']
  );

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();