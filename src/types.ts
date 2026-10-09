export type Language = 'bn' | 'en';

export type PageView = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'profile' 
  | 'order-success'
  | 'about' 
  | 'contact'
  | 'admin';

export interface SiteSettings {
  primaryColor: string;
  accentColor: string;
  themePreset: 'classic' | 'emerald' | 'festive' | 'violet' | 'luxury' | 'custom';
  showAnnouncementBar: boolean;
  announcementTextBn: string;
  announcementTextEn: string;
  hotlineNumber: string;
  freeShippingThreshold: number; // ৳ Amount above which shipping is free
  shippingFeeInsideDhaka: number; // ৳ Delivery charge inside Dhaka
  shippingFeeOutsideDhaka: number; // ৳ Delivery charge outside Dhaka
  shippingFeeExpress: number; // ৳ Express 24h delivery charge
  enableFreeShipping: boolean; // toggle free shipping offer
  deliveryNoteBn?: string; // delivery notice text
  taglineBn: string;
  taglineEn: string;
  adminPin: string;
  layoutStyle: 'modern' | 'compact' | 'festive';
  whatsappLink?: string;
  facebookLink?: string;
  messengerLink?: string;
  imoLink?: string;
  youtubeLink?: string;
  tiktokLink?: string;
  appDownloadUrl?: string; // App / Software download/install link
  appNameBn?: string; // e.g. OneRoof মোবাইল অ্যাপ
  appSubtitleBn?: string; // e.g. সহজ ও দ্রুত কেনাকাটার জন্য ডাউনলোড করুন
  globalProfitMargin?: number; // Universal profit margin % across all products e.g. 15
  shopbaseConfig?: {
    connected: boolean;
    accountNumber: string;
    password?: string;
    profitMargin: number; // profit margin %
    autoSync: boolean;
    autoForwardOrders: boolean;
    lastSyncTime?: string;
    totalSyncedProducts?: number;
  };
}

export interface AdminBannerSlide {
  id: string;
  badgeBn?: string;
  badgeEn?: string;
  titleBn?: string;
  titleEn?: string;
  subtitleBn?: string;
  subtitleEn?: string;
  coupon?: string;
  discountTextBn?: string;
  discountTextEn?: string;
  btnTextBn?: string;
  btnTextEn?: string;
  categoryTarget: string;
  image: string;
  accentColor?: string;
  showTextOverlay?: boolean;
}

export interface SubCategory {
  id: string;
  nameBn: string;
  nameEn: string;
  image?: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  featured?: boolean;
  subcategories?: SubCategory[];
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  sku?: string; // New field
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number; // in BDT
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  isFlashSale?: boolean;
  flashSaleEnds?: string; // ISO string
  soldCount?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  tags: string[];
  variants?: {
    type: 'size' | 'color' | 'weight' | 'storage';
    options: string[];
  }[];
  sizes?: string[];
  colors?: string[];
  specifications?: Record<string, string>;
  reviews?: Review[];
  warranty?: string;
  deliveryTime?: string;
  shippingFee?: number;
  shippingInside?: number;
  shippingOutside?: number;
  isFreeShipping?: boolean;
  sourceUrl?: string;
  wholesalePrice?: number;
  profitMarginPercent?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: Record<string, string>;
  selectedSize?: string;
  selectedColor?: string;
  selectedImage?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  fixedDiscount?: number;
  minSpend: number;
  description: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant?: Record<string, string>;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'forwarded_to_shopbase';

export interface Order {
  id: string;
  trackingNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';
  paymentStatus: 'paid' | 'pending';
  shippingAddress: {
    fullName: string;
    phone: string;
    division: string;
    district: string;
    address: string;
    deliverySpeed: 'regular' | 'express';
    notes?: string;
    senderNumber?: string;
    trxId?: string;
    email?: string;
  };
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  shopbaseDropship?: {
    forwarded: boolean;
    forwardedAt?: string;
    resellerAccount?: string;
    wholesaleCost?: number;
    expectedProfit?: number;
    shopbaseOrderId?: string;
    notes?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: 'admin' | 'user';
  division: string;
  district: string;
  thana: string;
  village: string;
  avatar: string;
  addresses: {
    id: string;
    title: string;
    address: string;
    district: string;
    isDefault: boolean;
  }[];
}

export interface FilterState {
  category: string;
  subcategory: string;
  minPrice: number;
  maxPrice: number;
  brand: string[];
  minRating: number;
  inStockOnly: boolean;
  isFlashSaleOnly: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}
