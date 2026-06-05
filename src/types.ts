export type Category = 'tshirt' | 'laptop' | 'appliances' | 'gadgets' | 'watches';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: Category;
  description: string;
  descriptionBn: string;
  priceBDT: number;
  priceUSD: number;
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  features: string[];
  featuresBn: string[];
  isFeatured?: boolean;
  originalPriceBDT?: number;
  originalPriceUSD?: number;
  brand?: string;
  brandBn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalBDT: number;
  totalUSD: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    paymentStatus: string;
  };
  status: 'placed' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: string[]; // Product IDs
  image?: string; // Base64 url or string of uploaded image
}
