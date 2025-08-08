import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Modern Minimalist Sofa',
    description: 'Elegant 3-seater sofa with premium fabric upholstery and solid wood frame.',
    price: 2000,
    originalPrice: 2500,
    category: 'Furniture',
    images: [
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029698/pexels-photo-2029698.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    tags: ['modern', 'minimalist', 'sofa'],
    featured: true,
  },
  {
    id: '2',
    name: 'Scandinavian Coffee Table',
    description: 'Handcrafted oak coffee table with clean lines and natural finish.',
    price: 21999,
    originalPrice: 25000,
    category: 'Furniture',
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    tags: ['scandinavian', 'coffee table', 'oak'],
    featured: true,
  },
  {
    id: '3',
    name: 'Industrial Floor Lamp',
    description: 'Vintage-inspired floor lamp with adjustable head and brass accents.',
    price: 600,
    category: 'Lighting',
    images: [
      'https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1125131/pexels-photo-1125131.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.4,
    reviewCount: 67,
    inStock: true,
    tags: ['industrial', 'floor lamp', 'vintage'],
  },
  {
    id: '4',
    name: 'Luxury Velvet Armchair',
    description: 'Plush velvet armchair with gold-finished legs and deep cushioning.',
    price: 1000,
    originalPrice: 1200,
    category: 'Furniture',
    images: [
      'https://images.pexels.com/photos/1099816/pexels-photo-1099816.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1099817/pexels-photo-1099817.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.9,
    reviewCount: 156,
    inStock: true,
    tags: ['luxury', 'velvet', 'armchair'],
    featured: true,
  },
  {
    id: '5',
    name: 'Abstract Wall Art Set',
    description: 'Set of 3 contemporary abstract prints on premium canvas.',
    price: 650,
    category: 'Decor',
    images: [
      'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1668861/pexels-photo-1668861.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.3,
    reviewCount: 43,
    inStock: true,
    tags: ['abstract', 'wall art', 'contemporary'],
  },
  {
    id: '6',
    name: 'Ceramic Table Lamp',
    description: 'Handmade ceramic table lamp with linen shade and warm LED bulb.',
    price: 700,
    category: 'Lighting',
    images: [
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571464/pexels-photo-1571464.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.5,
    reviewCount: 78,
    inStock: true,
    tags: ['ceramic', 'table lamp', 'handmade'],
  },
];

export const testimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Interior Designer',
    content: 'Interoo Services has been my go-to for premium furniture. The quality is exceptional and the delivery is always on time.',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Homeowner',
    content: 'Amazing selection and incredible customer service. Our living room transformation exceeded all expectations.',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Architect',
    content: 'Professional quality pieces that perfectly complement modern design aesthetics. Highly recommended!',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
  },
];