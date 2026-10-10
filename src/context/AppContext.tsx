import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  PageView, 
  Product, 
  Category, 
  CartItem, 
  Order, 
  OrderStatus,
  User, 
  FilterState, 
  Coupon,
  Review,
  SiteSettings,
  AdminBannerSlide
} from '../types';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  CATEGORIES, 
  INITIAL_USER, 
  INITIAL_ORDERS 
} from '../data/mockData';
import { DEFAULT_SITE_SETTINGS, DEFAULT_BANNER_SLIDES } from '../data/defaultSiteSettings';
import { TRANSLATIONS, formatPrice as formatPriceUtil } from '../utils/translations';
import {
  testSupabaseConnection,
  syncOrderToSupabase,
  deleteOrderFromSupabase,
  fetchOrdersFromSupabase,
  syncProductToSupabase,
  deleteProductFromSupabase,
  deleteMultipleProductsFromSupabase,
  fetchProductsFromSupabase,
  syncSiteSettingsToSupabase,
  fetchSiteSettingsFromSupabase,
  syncCategoriesToSupabase,
  deleteCategoryFromSupabase,
  fetchCategoriesFromSupabase,
  syncBannerSlidesToSupabase,
  deleteBannerSlideFromSupabase,
  fetchBannerSlidesFromSupabase,
  syncUserToSupabase,
  syncProductsBatchToSupabase,
  updateAllProductsProfitMarginInSupabase,
  fetchUsersFromSupabase,
  supabase,
  SUPABASE_URL,
  SUPABASE_SETUP_SQL,
} from '../lib/supabase';
import { safeLocalStorage, safeSessionStorage } from '../utils/safeStorage';
import { idbGet, idbSet } from '../utils/idbStorage';
import { getShopBaseCategoryMetadata } from '../services/shopbaseService';
import { getSubcategoryImage } from '../utils/subcategoryImages';
import { calculateCategoryCounts } from '../utils/categoryMatcher';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['bn'];
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  viewProductDetails: (product: Product) => void;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  userOrders: Order[];
  currentUser: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addToCart: (
    product: Product, 
    quantity?: number, 
    variant?: Record<string, string>,
    selectedImage?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addReview: (productId: string, rating: number, comment: string, name: string) => void;
  calculateShippingFee: (location?: 'dhaka' | 'outside', speed?: 'regular' | 'express', subtotal?: number) => number;
  placeOrder: (shippingInfo: any, paymentMethod: any, specifiedShippingFee?: number) => Order;
  lastPlacedOrder: Order | null;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  loginUser: (identifier: string, password?: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  registerUser: (userData: Partial<User>) => boolean;
  updateUserProfile: (userData: Partial<User>) => void;
  logoutUser: () => void;
  formatPrice: (amount: number) => string;
  cartSubtotal: number;
  cartDiscount: number;
  cartShippingFee: number;
  cartTotal: number;
  cartItemsCount: number;
  openCategory: (catSlug: string) => void;
  profileActiveTab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings';
  setProfileActiveTab: (tab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings') => void;
  // Hidden Admin Panel extensions
  siteSettings: SiteSettings;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSiteSettings: () => void;
  bannerSlides: AdminBannerSlide[];
  updateBannerSlides: (slides: AdminBannerSlide[]) => void;
  addBannerSlide: (slide: AdminBannerSlide) => void;
  deleteBannerSlide: (id: string) => void;
  addProduct: (product: Product) => void;
  addMultipleProducts: (products: Product[]) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteMultipleProducts: (ids: string[]) => void;
  resetProductsToDefault: () => void;
  addCategory: (category: Category) => void;
  ensureCategoryExists: (
    categorySlug: string,
    nameBn?: string,
    nameEn?: string,
    image?: string,
    iconName?: string
  ) => Category;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;
  updateBannerSlide: (id: string, updated: Partial<AdminBannerSlide>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: 'paid' | 'pending') => void;
  deleteOrder: (orderId: string) => void;
  isTrackOrderModalOpen: boolean;
  setIsTrackOrderModalOpen: (open: boolean) => void;
  trackingQuery: string;
  setTrackingQuery: (q: string) => void;
  openTrackOrder: (query?: string) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (identifier?: string, password?: string) => boolean;
  logoutAdmin: () => void;
  isUserAdmin: (user?: User | null) => boolean;
  // Supabase Integration
  supabaseConnected: boolean;
  supabaseStatusMsg: string;
  checkSupabaseConnection: () => Promise<boolean>;
  syncAllToSupabase: () => Promise<boolean>;
  supabaseSetupSql: string;
  supabaseUrl: string;
  isProductsLoading: boolean;
  globalProfitMargin: number;
  updateGlobalProfitMargin: (marginPercent: number) => Promise<boolean>;
  enforceWhiteLabelPurge: () => Promise<boolean>;
}

const defaultFilterState: FilterState = {
  category: 'all',
  subcategory: 'all',
  minPrice: 0,
  maxPrice: 60000,
  brand: [],
  minRating: 0,
  inStockOnly: false,
  isFlashSaleOnly: false,
  searchQuery: '',
  sortBy: 'featured',
};

export const SECRET_ADMIN_CONFIG = {
  email: 'mdjunayedalam6@gmail.com',
  secondaryEmail: 'mdzunayedali6@gmail.com',
  phone: '01929637253',
  secondaryPhone: '01326654722',
  password: 'oneroofzunaid6$',
  secondaryPassword: 'zunayed12345#'
};

export const isUserAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const phoneDigits = (user.phone || '').replace(/[^0-9]/g, '');
  if (email === SECRET_ADMIN_CONFIG.email || email === SECRET_ADMIN_CONFIG.secondaryEmail) return true;
  if (
    phoneDigits.length >= 10 && 
    (phoneDigits.endsWith(SECRET_ADMIN_CONFIG.phone) || phoneDigits.endsWith(SECRET_ADMIN_CONFIG.secondaryPhone))
  ) {
    return true;
  }
  return user.role === 'admin';
};

export const deduplicateProducts = (list: Product[]): Product[] => {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const rawItem of list) {
    if (rawItem && rawItem.id) {
      if (!seen.has(rawItem.id)) {
        seen.add(rawItem.id);
        let item = rawItem;
        if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
          const sanitizedImages = rawItem.images.map((img) => {
            if (typeof img === 'string' && img.includes('shopbasebd.com')) {
              // Convert erroneous _L_*.jpg to _L_*.jpeg (ShopBaseBD uses .jpeg for large images)
              if (img.includes('_L_') && img.endsWith('.jpg')) {
                return img.replace(/\.jpg$/i, '.jpeg');
              }
            }
            return img;
          });
          item = { ...rawItem, images: sanitizedImages };
        }
        result.push(item);
      }
    }
  }
  return result;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Track intentionally deleted products to guarantee they never resurrect on reload
export const getDeletedProductIds = (): Set<string> => {
  try {
    const raw = safeLocalStorage.getItem('oneroof_deleted_product_ids');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const recordDeletedProductIds = (ids: string[]) => {
  try {
    if (!ids || ids.length === 0) return;
    const existing = getDeletedProductIds();
    ids.forEach((id) => existing.add(id));
    const arr = Array.from(existing);
    safeLocalStorage.setItem('oneroof_deleted_product_ids', JSON.stringify(arr));
    idbSet('oneroof_deleted_product_ids', arr).catch(() => {});
  } catch {}
};

export const unrecordDeletedProductId = (id: string) => {
  try {
    const existing = getDeletedProductIds();
    if (existing.has(id)) {
      existing.delete(id);
      const arr = Array.from(existing);
      safeLocalStorage.setItem('oneroof_deleted_product_ids', JSON.stringify(arr));
      idbSet('oneroof_deleted_product_ids', arr).catch(() => {});
    }
  } catch {}
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (safeLocalStorage.getItem('oneroof_lang') as Language) || 'bn';
  });

  const [currentPage, setCurrentPageState] = useState<PageView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Persistent Products: Cleanly loads without resurrecting deleted items
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const deletedIds = getDeletedProductIds();
      const saved = safeLocalStorage.getItem('oneroof_products');
      if (saved !== null) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validSaved = parsed.filter((p) => !deletedIds.has(p.id));
          return deduplicateProducts(validSaved);
        }
      }
      const initialClean = deduplicateProducts(
        INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id))
      );
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(initialClean));
      return initialClean;
    } catch {
      return deduplicateProducts(INITIAL_PRODUCTS);
    }
  });

  // Strict 11 Main Category IDs in requested display order
  const MAIN_11_ORDER = [
    'womens-clothing',
    'mens-clothing',
    'baby-collection',
    'couple-combo',
    'home-living',
    'bag-collection',
    'jewelry-accessories',
    'electronics-gadgets',
    'winter-collection',
    'seasonal-products',
    'other-categories',
  ];

  const sanitizeCategories = (cats: Category[]): Category[] => {
    if (!Array.isArray(cats) || cats.length === 0) return CATEGORIES;
    // Keep only the 11 main categories
    const valid = cats.filter((c) => MAIN_11_ORDER.includes(c.id));
    const defMap = new Map(CATEGORIES.map((c) => [c.id, c]));

    const working = valid.length === 11 
      ? valid 
      : CATEGORIES.map((def) => {
          const found = valid.find((c) => c.id === def.id);
          return found || def;
        });

    // Ensure every subcategory has its latest distinct image
    return working
      .map((c) => {
        const def = defMap.get(c.id);
        const defSubMap = new Map((def?.subcategories || []).map((s) => [s.id, s.image]));
        const updatedSubs = (c.subcategories || def?.subcategories || []).map((s) => ({
          ...s,
          image: s.image || defSubMap.get(s.id) || getSubcategoryImage(s.id, s.nameBn),
        }));
        return {
          ...c,
          subcategories: updatedSubs,
        };
      })
      .sort((a, b) => MAIN_11_ORDER.indexOf(a.id) - MAIN_11_ORDER.indexOf(b.id));
  };

  // Persistent Categories (guaranteed strictly 11 main categories with distinct subcategory images)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const version = safeLocalStorage.getItem('oneroof_cat_schema_version');
      if (version === 'v7_complete_all_shopbase_subcategories') {
        const saved = safeLocalStorage.getItem('oneroof_categories');
        if (saved !== null) {
          const parsed: Category[] = JSON.parse(saved);
          const sanitized = sanitizeCategories(parsed);
          if (sanitized.length === 11) {
            return sanitized;
          }
        }
      }
      // Force migration to clean 11 structured categories with complete subcategory catalog
      safeLocalStorage.setItem('oneroof_cat_schema_version', 'v7_complete_all_shopbase_subcategories');
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(CATEGORIES));
      idbSet('oneroof_cached_categories', CATEGORIES).catch(() => {});
      syncCategoriesToSupabase(CATEGORIES).catch(() => {});
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  // Dynamic Categories: item counts are automatically and accurately synchronized with the real products in the catalog
  const dynamicCategories = useMemo<Category[]>(() => {
    return calculateCategoryCounts(categories, products);
  }, [categories, products]);

  // Persistent Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_site_settings');
      return saved ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  // Persistent Banner Slides
  const [bannerSlides, setBannerSlides] = useState<AdminBannerSlide[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_banner_slides');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((slide: AdminBannerSlide) => ({
            ...slide,
            showTextOverlay: Boolean(slide.showTextOverlay),
          }));
        }
      }
      return DEFAULT_BANNER_SLIDES;
    } catch {
      return DEFAULT_BANNER_SLIDES;
    }
  });

  // Persistent Customer Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old hardcoded dummy orders if present
          return parsed.filter((o) => o.id !== 'OR-88219' && o.id !== 'OR-74190');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'>('orders');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_users');
      const parsed: User[] = saved ? JSON.parse(saved) : [];
      const hasAdmin = parsed.some(
        (u) =>
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.email ||
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.secondaryEmail ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.phone) ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.secondaryPhone)
      );
      if (!hasAdmin) {
        return [INITIAL_USER, ...parsed];
      }
      return parsed.map((u) => {
        if (
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.email ||
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.secondaryEmail ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.phone) ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.secondaryPhone)
        ) {
          return { ...u, role: 'admin' as const, password: u.password || SECRET_ADMIN_CONFIG.password };
        }
        return u;
      });
    } catch {
      return [INITIAL_USER];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_current_user');
      if (saved) {
        const parsed: User = JSON.parse(saved);
        if (isUserAdmin(parsed)) {
          return { ...parsed, role: 'admin' as const };
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Customer-specific orders: strictly only orders placed by the current user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userPhoneDigits = (currentUser.phone || '').replace(/[^0-9]/g, '');

    return orders.filter((order) => {
      // 1. Direct userId match
      if (order.userId && order.userId === currentUser.id) return true;

      // 2. Direct customer email match
      if (userEmail) {
        if (order.customerEmail && order.customerEmail.trim().toLowerCase() === userEmail) return true;
        if (order.shippingAddress?.email && order.shippingAddress.email.trim().toLowerCase() === userEmail) return true;
      }

      // 3. Direct customer phone match (last 10 digits)
      if (userPhoneDigits.length >= 10) {
        const orderPhone = (order.customerPhone || order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
        if (orderPhone.length >= 10 && orderPhone.endsWith(userPhoneDigits.slice(-10))) {
          return true;
        }
      }

      return false;
    });
  }, [orders, currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openTrackOrder = (query?: string) => {
    if (query) {
      setTrackingQuery(query);
    }
    setIsTrackOrderModalOpen(true);
  };

  // Hidden Admin Authentication & Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem('oneroof_admin_auth') === 'true';
  });

  // Supabase Connection & Sync State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string>('কানেক্ট হচ্ছে...');
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(() => products.length === 0);

  // Check Supabase Connection
  const checkSupabaseConnection = async (): Promise<boolean> => {
    const res = await testSupabaseConnection();
    setSupabaseConnected(res.success);
    setSupabaseStatusMsg(res.message);
    return res.success;
  };

  // Instant restoration from IndexedDB (ultra-fast 10-30ms offline cache)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      idbGet<Product[]>('oneroof_cached_products'),
      idbGet<Category[]>('oneroof_cached_categories'),
      idbGet<AdminBannerSlide[]>('oneroof_cached_slides'),
    ])
      .then(([cachedProducts, cachedCategories, cachedSlides]) => {
        if (!isMounted) return;
        if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
          const deletedIds = getDeletedProductIds();
          const cleanCached = deduplicateProducts(
            cachedProducts.filter((p) => !deletedIds.has(p.id))
          );
          setProducts(cleanCached);
          setIsProductsLoading(false);
        }
        if (cachedCategories && Array.isArray(cachedCategories) && cachedCategories.length > 0) {
          const cleanCats = sanitizeCategories(cachedCategories);
          setCategories(cleanCats);
          idbSet('oneroof_cached_categories', cleanCats).catch(() => {});
          safeLocalStorage.setItem('oneroof_categories', JSON.stringify(cleanCats));
        }
        if (cachedSlides && Array.isArray(cachedSlides) && cachedSlides.length > 0) {
          setBannerSlides(cachedSlides);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Deep-link listener for shared product URLs (e.g. ?product=sbp-17804, /product/17804, or #product=sbp-17804)
  useEffect(() => {
    const checkUrlForProduct = () => {
      if (typeof window === 'undefined') return;
      try {
        const params = new URLSearchParams(window.location.search);
        let targetId = params.get('product') || params.get('p') || params.get('id');
        
        // Check pathname (e.g. /product/sbp-1234 or /product/1234)
        if (!targetId && window.location.pathname) {
          const pathMatch = window.location.pathname.match(/\/product\/([^/?#]+)/i);
          if (pathMatch) targetId = decodeURIComponent(pathMatch[1]);
        }

        if (!targetId && window.location.hash) {
          const match = window.location.hash.match(/product=([^&]+)/);
          if (match) targetId = decodeURIComponent(match[1]);
          else if (window.location.hash.startsWith('#/product/')) {
            targetId = decodeURIComponent(window.location.hash.replace('#/product/', ''));
          }
        }

        if (targetId) {
          targetId = targetId.trim();
          const targetLower = targetId.toLowerCase();
          const cleanNum = targetId.replace(/\D/g, '');

          // Check if already viewing this product
          if (
            selectedProduct && 
            (selectedProduct.id.toLowerCase() === targetLower || 
             selectedProduct.sku?.toUpperCase() === targetId.toUpperCase() ||
             (cleanNum && selectedProduct.id.toLowerCase() === `sbp-${cleanNum}`))
          ) {
            if (currentPage !== 'product-detail') setCurrentPageState('product-detail');
            return;
          }

          // Try finding in current products state
          const matchInState = products.find((p) => {
            const pId = p.id.toLowerCase();
            const pSku = (p.sku || '').toLowerCase();
            return pId === targetLower || 
                   pSku === targetLower || 
                   (cleanNum && (pId === `sbp-${cleanNum}` || pSku === `sbp-${cleanNum}`));
          });

          if (matchInState) {
            setSelectedProduct(matchInState);
            setCurrentPageState('product-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            // Fetch directly from Supabase for instant link resolution even before full catalog loads
            const orConditions = [
              `id.eq.${targetId}`,
              `id.eq.sbp-${targetId}`,
              `data->>sku.eq.${targetId}`,
              `data->>sku.eq.SBP-${targetId}`
            ];
            if (cleanNum) {
              orConditions.push(`id.eq.sbp-${cleanNum}`);
              orConditions.push(`data->>sku.eq.SBP-${cleanNum}`);
            }

            Promise.resolve(
              supabase
                .from('products')
                .select('*')
                .or(orConditions.join(','))
                .maybeSingle()
            )
              .then(({ data, error }) => {
                if (!error && data) {
                  const p: Product = (data.data && typeof data.data === 'object') ? { ...(data.data as Product) } : ({} as Product);
                  p.id = data.id || p.id;
                  if (data.title_bn) p.titleBn = data.title_bn;
                  if (data.title_en) p.titleEn = data.title_en;
                  if (data.price !== undefined && data.price !== null) p.price = Number(data.price);
                  if (data.original_price !== undefined && data.original_price !== null) p.originalPrice = Number(data.original_price);
                  if (!p.brand || p.brand.toLowerCase().includes('shopbase')) p.brand = 'OneRoof Mart';
                  setSelectedProduct(p);
                  setCurrentPageState('product-detail');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              })
              .catch(() => {});
          }
        }
      } catch (_) {}
    };

    checkUrlForProduct();
    window.addEventListener('popstate', checkUrlForProduct);
    window.addEventListener('hashchange', checkUrlForProduct);

    return () => {
      window.removeEventListener('popstate', checkUrlForProduct);
      window.removeEventListener('hashchange', checkUrlForProduct);
    };
  }, [products]);

  // Initial Supabase Sync on mount - unblocked & parallel for lightning load speed
  useEffect(() => {
    let isMounted = true;
    let authUnsub: (() => void) | null = null;
    let channelObj: any = null;

    const initSupabase = async () => {
      try {
        // Run test connection asynchronously without blocking resource downloads
        testSupabaseConnection()
          .then((res) => {
            if (isMounted) {
              setSupabaseConnected(res.success);
              setSupabaseStatusMsg(res.message);
            }
          })
          .catch(() => {});

        // Fetch products, categories, slides, orders immediately in parallel
        const [
          remoteProducts,
          remoteOrders,
          remoteSettings,
          remoteCategories,
          remoteSlides,
          remoteUsers
        ] = await Promise.all([
          fetchProductsFromSupabase((batchProducts) => {
            if (isMounted && batchProducts && batchProducts.length > 0) {
              setProducts((prev) => {
                const map = new Map(prev.map((p) => [p.id, p]));
                for (const p of batchProducts) {
                  map.set(p.id, p);
                }
                return Array.from(map.values());
              });
            }
          }),
          fetchOrdersFromSupabase(),
          fetchSiteSettingsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchBannerSlidesFromSupabase(),
          fetchUsersFromSupabase()
        ]);

        if (isMounted) {
          if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
            const deletedIds = getDeletedProductIds();
            const cleanRemote = deduplicateProducts(
              remoteProducts.filter((p) => !deletedIds.has(p.id))
            );
            setProducts(cleanRemote);
            idbSet('oneroof_cached_products', cleanRemote).catch(() => {});
            try {
              safeLocalStorage.setItem('oneroof_products', JSON.stringify(cleanRemote.slice(0, 200)));
            } catch (_) {}

            // Auto-clean any products in Supabase that were previously marked as deleted
            const ghostIds = remoteProducts
              .filter((p) => deletedIds.has(p.id))
              .map((p) => p.id);
            if (ghostIds.length > 0) {
              deleteMultipleProductsFromSupabase(ghostIds).catch(() => {});
            }
          }
          if (remoteOrders && remoteOrders.length > 0) setOrders(remoteOrders);
          if (remoteSettings) {
            setSiteSettings(remoteSettings);
            safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(remoteSettings));
          }
          if (remoteCategories && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
            const cleanCats = sanitizeCategories(remoteCategories);
            setCategories(cleanCats);
            safeLocalStorage.setItem('oneroof_categories', JSON.stringify(cleanCats));
            idbSet('oneroof_cached_categories', cleanCats).catch(() => {});
          } else {
            syncCategoriesToSupabase(CATEGORIES).catch(() => {});
          }
          if (remoteSlides && Array.isArray(remoteSlides) && remoteSlides.length > 0) {
            setBannerSlides(remoteSlides);
            safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(remoteSlides));
            idbSet('oneroof_cached_slides', remoteSlides).catch(() => {});
          }
          if (remoteUsers && remoteUsers.length > 0) setUsers(remoteUsers);
          setIsProductsLoading(false);
        }

        // Setup real auth listener with error safety
        try {
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (session?.user && event === 'SIGNED_IN') {
              const email = session.user.email || '';
              const phoneStr = session.user.phone || '';
              const fullName = session.user.user_metadata?.full_name || '';
              const avatarUrl = session.user.user_metadata?.avatar_url || '';
              
              setUsers(prev => {
                const existingUser = prev.find(u => u.id === session.user.id);
                const userObj: User = existingUser ? { ...existingUser } : {
                  id: session.user.id,
                  phone: phoneStr || email,
                  email: email,
                  name: fullName || (email ? email.split('@')[0] : 'User'),
                  avatar: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
                  password: '', 
                  division: '',
                  district: '',
                  thana: '',
                  village: '',
                  addresses: []
                };
                
                setCurrentUser(userObj);
                safeLocalStorage.setItem('oneroof_current_user', JSON.stringify(userObj));
                
                if (!existingUser) {
                  const next = [...prev, userObj];
                  syncUserToSupabase(userObj).catch(() => {});
                  return next;
                }
                return prev;
              });
              
              setIsAuthModalOpen(false);
            } else if (event === 'SIGNED_OUT') {
              setCurrentUser(null);
              safeLocalStorage.removeItem('oneroof_current_user');
            }
          });

          if (authListener?.subscription) {
            authUnsub = () => {
              try {
                authListener.subscription.unsubscribe();
              } catch (_) {}
            };
          }
        } catch (authErr) {
          console.warn('Supabase auth listener notice:', authErr);
        }
        
        // Setup real-time listeners for live sync across devices with graceful error handling
        try {
          try {
            const existingChannels = supabase.getChannels();
            const stale = existingChannels.find((c: any) => c.topic === 'realtime:oneroof-realtime');
            if (stale) supabase.removeChannel(stale);
          } catch (_) {}

          const channel = supabase
            .channel('oneroof-realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'orders' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newOrder = payload.new.data as Order;
                  setOrders((prev) => (prev.some((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev]));
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedOrder = payload.new.data as Order;
                  setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setOrders((prev) => prev.filter((o) => o.id !== deletedId));
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'products' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newProduct = payload.new.data as Product;
                  const deletedIds = getDeletedProductIds();
                  if (deletedIds.has(newProduct.id)) return;
                  setProducts((prev) => {
                    const next = deduplicateProducts([newProduct, ...prev]);
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedProduct = payload.new.data as Product;
                  const deletedIds = getDeletedProductIds();
                  if (deletedIds.has(updatedProduct.id)) return;
                  setProducts((prev) => {
                    const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  recordDeletedProductIds([deletedId]);
                  setProducts((prev) => {
                    const next = prev.filter((p) => p.id !== deletedId);
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'categories' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newCat = payload.new.data as Category;
                  setCategories((prev) => {
                    const next = prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat];
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedCat = payload.new.data as Category;
                  setCategories((prev) => {
                    const next = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setCategories((prev) => {
                    const next = prev.filter((c) => c.id !== deletedId);
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                }
              }
            );

          channel.subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              // Ignore WebSocket channel errors silently
            }
          });

          channelObj = channel;
        } catch (rtErr) {
          console.warn('Supabase realtime notice:', rtErr);
        }

      } catch (e) {
        console.warn('Supabase initial fetch notice:', e);
      }
    };

    initSupabase();

    return () => {
      isMounted = false;
      try {
        if (authUnsub) authUnsub();
      } catch (_) {}
      try {
        if (channelObj) supabase.removeChannel(channelObj);
      } catch (_) {}
    };
  }, []);

  // Bulk Sync to Supabase
  const syncAllToSupabase = async (): Promise<boolean> => {
    try {
      addToast(language === 'bn' ? 'Supabase এ সিঙ্ক শুরু হচ্ছে...' : 'Syncing with Supabase...', 'info');
      await syncSiteSettingsToSupabase(siteSettings);
      await syncCategoriesToSupabase(categories);
      await syncBannerSlidesToSupabase(bannerSlides);
      if (products.length > 0) {
        await syncProductsBatchToSupabase(products);
      }
      for (const o of orders) {
        await syncOrderToSupabase(o);
      }
      for (const u of users) {
        await syncUserToSupabase(u);
      }
      setSupabaseConnected(true);
      setSupabaseStatusMsg('সকল তথ্য Supabase এ সিঙ্ক হয়েছে');
      addToast(
        language === 'bn' ? 'সকল প্রডাক্ট, অর্ডার ও সেটিংস Supabase এ সিঙ্ক হয়েছে!' : 'All data synced to Supabase!',
        'success'
      );
      return true;
    } catch (e) {
      addToast(language === 'bn' ? 'Supabase সিঙ্কে সমস্যা হয়েছে' : 'Supabase sync failed', 'error');
      return false;
    }
  };

  // Synchronize CSS Root Variables for dynamic branding
  useEffect(() => {
    const primary = siteSettings.primaryColor || '#003882';
    const accent = siteSettings.accentColor || '#FF6B00';
    document.documentElement.style.setProperty('--theme-primary', primary);
    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-accent', accent);
    document.documentElement.style.setProperty('--theme-primary-light', `${primary}14`);
    document.documentElement.style.setProperty('--theme-accent-light', `${accent}1c`);
  }, [siteSettings.primaryColor, siteSettings.accentColor]);

  // Save changes to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('oneroof_lang', language);
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_products', JSON.stringify(products));
    idbSet('oneroof_cached_products', products).catch(() => {});
  }, [products]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(categories));
    idbSet('oneroof_cached_categories', categories).catch(() => {});
  }, [categories]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorage.setItem('oneroof_current_user', JSON.stringify(currentUser));
    } else {
      safeLocalStorage.removeItem('oneroof_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(bannerSlides));
    idbSet('oneroof_cached_slides', bannerSlides).catch(() => {});
  }, [bannerSlides]);

  // Apply dynamic theme colors and layout style to :root across the entire website
  useEffect(() => {
    const root = document.documentElement;
    const primary = siteSettings.primaryColor || '#003882';
    const accent = siteSettings.accentColor || '#FF6B00';

    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-accent', accent);
    root.style.setProperty('--theme-primary-light', `${primary}18`);
    root.style.setProperty('--theme-accent-light', `${accent}1e`);

    // Radius
    const radius = siteSettings.layoutStyle === 'compact' ? '0.5rem' : siteSettings.layoutStyle === 'festive' ? '1.5rem' : '1rem';
    root.style.setProperty('--theme-radius', radius);
  }, [siteSettings.primaryColor, siteSettings.accentColor, siteSettings.layoutStyle]);

  // Secret keyboard trigger (Ctrl + Shift + A or Cmd + Shift + A) and URL Hash (#admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };

    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=')) {
        setIsAdminModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkHash);
    checkHash();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const loginAdmin = (identifier?: string, password?: string): boolean => {
    // If identifier & password provided
    if (identifier && password) {
      const cleanId = identifier.trim().toLowerCase();
      const cleanDigits = identifier.replace(/[^0-9]/g, '');
      const isEmailValid = cleanId === SECRET_ADMIN_CONFIG.email || cleanId === SECRET_ADMIN_CONFIG.secondaryEmail;
      const isPhoneValid = cleanDigits.length >= 10 && (
        cleanDigits.endsWith(SECRET_ADMIN_CONFIG.phone) || 
        cleanDigits.endsWith(SECRET_ADMIN_CONFIG.secondaryPhone)
      );
      const isPassValid = password === SECRET_ADMIN_CONFIG.password || password === SECRET_ADMIN_CONFIG.secondaryPassword;

      // Also check user database for any admin matching credentials
      const matchedAdminUser = users.find((u) => {
        if (!isUserAdmin(u) && u.role !== 'admin') return false;
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');
        const emailMatches = Boolean(uEmail && uEmail === cleanId);
        const phoneMatches = cleanDigits.length >= 10 && uPhoneDigits.length >= 10 && uPhoneDigits.endsWith(cleanDigits.slice(-10));
        const passMatches = u.password === password;
        return (emailMatches || phoneMatches) && passMatches;
      });

      if (((isEmailValid || isPhoneValid) && isPassValid) || matchedAdminUser) {
        let adminUser = matchedAdminUser || users.find((u) => isUserAdmin(u));

        if (!adminUser) {
          adminUser = { ...INITIAL_USER, role: 'admin' };
          setUsers((prev) => [adminUser!, ...prev]);
        }

        const validAdmin = { ...adminUser, role: 'admin' as const };
        setCurrentUser(validAdmin);
        setIsAdminAuthenticated(true);
        safeSessionStorage.setItem('oneroof_admin_auth', 'true');
        addToast(
          language === 'bn' 
            ? 'এডমিন কন্ট্রোল ভেরিফাইড! এডমিন প্যানেলে স্বাগতম।' 
            : 'Admin Verified! Welcome to Admin Panel.',
          'success'
        );
        return true;
      } else {
        addToast(
          language === 'bn' 
            ? 'অ্যাক্সেস ডিনাইড! সঠিক অনুমোদিত এডমিন তথ্য ও পাসওয়ার্ড দিয়ে চেষ্টা করুন।' 
            : 'Access Denied! Unauthorized admin credentials.',
          'error'
        );
        return false;
      }
    }

    // Direct entrance if already logged in with admin credentials
    if (isUserAdmin(currentUser)) {
      setIsAdminAuthenticated(true);
      safeSessionStorage.setItem('oneroof_admin_auth', 'true');
      addToast(
        language === 'bn' 
          ? 'স্বাগতম এডমিন! সরাসরি এডমিন প্যানেলে প্রবেশ করেছেন।' 
          : 'Welcome Admin! Directly entered Admin Panel.',
        'success'
      );
      return true;
    }

    addToast(
      language === 'bn' 
        ? 'অ্যাক্সেস ডিনাইড! শুধুমাত্র অনুমোদিত এডমিন অ্যাকাউন্ট দিয়েই প্রবেশ করা সম্ভব।' 
        : 'Access Denied! Only authorized admin account can enter.',
      'error'
    );
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    safeSessionStorage.removeItem('oneroof_admin_auth');
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
    addToast(language === 'bn' ? 'এডমিন প্যানেল থেকে প্রস্থান করা হয়েছে' : 'Logged out from Admin', 'info');
  };

  // Category Admin Operations & Auto-Creation Helper
  const ensureCategoryExists = (
    categorySlug: string,
    nameBn?: string,
    nameEn?: string,
    image?: string,
    iconName?: string
  ): Category => {
    const cleanSlug = (categorySlug || '').trim().toLowerCase();
    const cleanBn = (nameBn || '').trim().toLowerCase();
    const cleanEn = (nameEn || '').trim().toLowerCase();

    // 1. Check if category already exists in current categories
    const existing = categories.find((c) => {
      const cId = (c.id || '').trim().toLowerCase();
      const cSlug = (c.slug || '').trim().toLowerCase();
      const cBn = (c.nameBn || '').trim().toLowerCase();
      const cEn = (c.nameEn || '').trim().toLowerCase();
      return (
        (cleanSlug && (cId === cleanSlug || cSlug === cleanSlug)) ||
        (cleanBn && cBn === cleanBn) ||
        (cleanEn && cEn === cleanEn)
      );
    });

    if (existing) {
      return existing;
    }

    // 2. Derive metadata for the missing category
    const meta = getShopBaseCategoryMetadata(categorySlug || nameBn || '');
    const finalSlug = cleanSlug || meta.slug;
    const finalNameBn = nameBn || meta.nameBn;
    const finalNameEn = nameEn || meta.nameEn;
    const finalIcon = iconName || meta.iconName || 'Shirt';
    const finalImage =
      image ||
      meta.image ||
      'https://shopbasebd.com/public/uploads/shop/category/scategory-1738393401.png';

    const newCategory: Category = {
      id: finalSlug,
      slug: finalSlug,
      nameBn: finalNameBn,
      nameEn: finalNameEn,
      iconName: finalIcon,
      image: finalImage,
      itemCount: 1,
      featured: true,
    };

    setCategories((prev) => {
      const alreadyPresent = prev.some(
        (c) =>
          c.id.toLowerCase() === finalSlug.toLowerCase() ||
          c.slug.toLowerCase() === finalSlug.toLowerCase() ||
          c.nameBn.trim().toLowerCase() === finalNameBn.trim().toLowerCase()
      );
      if (alreadyPresent) return prev;
      const updated = [...prev, newCategory];
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(updated));
      idbSet('oneroof_cached_categories', updated).catch(() => {});
      syncCategoriesToSupabase(updated).catch(() => {});
      return updated;
    });

    addToast(
      language === 'bn'
        ? `নতুন ক্যাটাগরি "${finalNameBn}" স্বয়ংক্রিয়ভাবে ওয়েবসাইটে যুক্ত হয়েছে!`
        : `New category "${finalNameEn}" automatically created!`,
      'success'
    );

    return newCategory;
  };

  // Product Admin Operations
  const addProduct = (newProduct: Product) => {
    // Unrecord from deleted set if re-adding
    unrecordDeletedProductId(newProduct.id);

    // Automatically ensure the product's category exists on the website
    if (newProduct.category) {
      ensureCategoryExists(
        newProduct.category,
        newProduct.subcategory,
        undefined,
        newProduct.images?.[0]
      );
    }
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== newProduct.id);
      const next = [newProduct, ...filtered];
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    syncProductToSupabase(newProduct).catch((err) => {
      console.warn('Supabase product add warning:', err);
    });
    addToast(
      language === 'bn' 
        ? `"${newProduct.titleBn}" প্রডাক্ট সফলভাবে যুক্ত হয়েছে!` 
        : `Product "${newProduct.titleEn}" added successfully!`,
      'success'
    );
  };

  const addMultipleProducts = (newProducts: Product[]) => {
    if (!newProducts || newProducts.length === 0) return;

    for (const p of newProducts) {
      unrecordDeletedProductId(p.id);
    }

    // Automatically ensure all categories exist on the website
    const categoriesProcessed = new Set<string>();
    for (const p of newProducts) {
      if (p.category && !categoriesProcessed.has(p.category)) {
        categoriesProcessed.add(p.category);
        ensureCategoryExists(
          p.category,
          p.subcategory,
          undefined,
          p.images?.[0]
        );
      }
    }

    setProducts((prev) => {
      const incomingClean = deduplicateProducts(newProducts);
      const incomingIds = new Set(incomingClean.map((p) => p.id));
      const filteredExisting = prev.filter((p) => !incomingIds.has(p.id));
      const next = [...incomingClean, ...filteredExisting];
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    syncProductsBatchToSupabase(newProducts).catch((err) => {
      console.warn('Supabase batch add warning:', err);
    });
    addToast(
      language === 'bn' 
        ? `${newProducts.length}টি প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!` 
        : `${newProducts.length} products imported successfully!`,
      'success'
    );
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    let updatedTarget: Product | undefined;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated };
          updatedTarget = merged;
          return merged;
        }
        return p;
      });
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });

    if (updatedTarget) {
      syncProductToSupabase(updatedTarget).catch((err) => {
        console.warn('Supabase product update warning:', err);
      });
    }

    addToast(language === 'bn' ? 'প্রডাক্ট তথ্য আপডেট করা হয়েছে!' : 'Product updated successfully!', 'success');
  };

  const deleteProduct = (id: string) => {
    recordDeletedProductIds([id]);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    deleteProductFromSupabase(id).catch((err) => {
      console.warn('Supabase delete error:', err);
    });
    addToast(language === 'bn' ? 'প্রডাক্ট সফলভাবে মুছে ফেলা হয়েছে!' : 'Product deleted successfully!', 'info');
  };

  const deleteMultipleProducts = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    recordDeletedProductIds(ids);
    const idSet = new Set(ids);
    setProducts((prev) => {
      const next = prev.filter((p) => !idSet.has(p.id));
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    deleteMultipleProductsFromSupabase(ids).catch((err) => {
      console.warn('Supabase batch delete error:', err);
    });
    addToast(
      language === 'bn' 
        ? `${ids.length}টি পণ্য সফলভাবে মুছে ফেলা হয়েছে!` 
        : `${ids.length} products deleted successfully!`, 
      'info'
    );
  };

  const resetProductsToDefault = () => {
    safeLocalStorage.removeItem('oneroof_deleted_product_ids');
    idbSet('oneroof_deleted_product_ids', []).catch(() => {});
    const cleanDefault = deduplicateProducts(INITIAL_PRODUCTS);
    setProducts(cleanDefault);
    safeLocalStorage.setItem('oneroof_products', JSON.stringify(cleanDefault));
    idbSet('oneroof_cached_products', cleanDefault).catch(() => {});
    cleanDefault.forEach((p) => syncProductToSupabase(p));
    addToast(language === 'bn' ? 'ডিফল্ট প্রডাক্টগুলো রিস্টোর করা হয়েছে' : 'Default products restored', 'info');
  };

  // Category Admin Operations
  const addCategory = (newCat: Category) => {
    setCategories((prev) => {
      const next = [...prev, newCat];
      syncCategoriesToSupabase(next);
      return next;
    });
    addToast(
      language === 'bn' ? `"${newCat.nameBn}" ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!` : `Category "${newCat.nameEn}" added!`,
      'success'
    );
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      syncCategoriesToSupabase(next);
      return next;
    });
    addToast(language === 'bn' ? 'ক্যাটাগরি সফলভাবে আপডেট হয়েছে!' : 'Category updated successfully!', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      deleteCategoryFromSupabase(id);
      syncCategoriesToSupabase(next);
      return next;
    });
    addToast(language === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে' : 'Category deleted', 'info');
  };

  const resetCategoriesToDefault = () => {
    setCategories(CATEGORIES);
    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(CATEGORIES));
    idbSet('oneroof_cached_categories', CATEGORIES).catch(() => {});
    syncCategoriesToSupabase(CATEGORIES);
    addToast(language === 'bn' ? 'ডিফল্ট ক্যাটাগরিগুলো রিস্টোর করা হয়েছে' : 'Default categories restored', 'info');
  };

  // Order Admin Operations
  const updateOrderStatus = (orderId: string, status: OrderStatus, paymentStatus?: 'paid' | 'pending') => {
    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedOrd = {
            ...ord,
            status,
            ...(paymentStatus ? { paymentStatus } : {}),
          };
          syncOrderToSupabase(updatedOrd);
          return updatedOrd;
        }
        return ord;
      });
      return next;
    });
    addToast(
      language === 'bn' ? `অর্ডার #${orderId} স্ট্যাটাস আপডেট হয়েছে!` : `Order #${orderId} status updated!`,
      'success'
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    deleteOrderFromSupabase(orderId);
    addToast(language === 'bn' ? 'অর্ডার রেকর্ড মুছে ফেলা হয়েছে' : 'Order record deleted', 'info');
  };

  // Site Settings Operations
  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      syncSiteSettingsToSupabase(merged);
      return merged;
    });
    addToast(language === 'bn' ? 'সাইটের সেটিংস ও ডিজাইন সংরক্ষিত হয়েছে!' : 'Settings & design saved!', 'success');
  };

  const resetSiteSettings = () => {
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(DEFAULT_SITE_SETTINGS));
    syncSiteSettingsToSupabase(DEFAULT_SITE_SETTINGS);
    addToast(language === 'bn' ? 'ডিফল্ট সেটিংস ও কালার রিস্টোর করা হয়েছে' : 'Default settings restored', 'info');
  };

  const globalProfitMargin = siteSettings.globalProfitMargin || siteSettings.shopbaseConfig?.profitMargin || 15;

  // Universal Profit Margin & Dynamic Pricing Controller
  const updateGlobalProfitMargin = async (newMargin: number): Promise<boolean> => {
    try {
      const validMargin = Math.max(1, Math.min(100, Math.round(newMargin)));
      // 1. Update siteSettings
      const updatedSettings: SiteSettings = {
        ...siteSettings,
        globalProfitMargin: validMargin,
        shopbaseConfig: {
          ...(siteSettings.shopbaseConfig || {
            connected: true,
            accountNumber: '01929637253',
            autoSync: true,
            autoForwardOrders: true,
          }),
          profitMargin: validMargin,
        },
      };
      setSiteSettings(updatedSettings);
      syncSiteSettingsToSupabase(updatedSettings).catch(() => {});
      safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(updatedSettings));

      // 2. Recalculate prices across all products in state
      setProducts((prev) => {
        const updated = prev.map((p) => {
          const wholesale = Number(p.wholesalePrice || p.price);
          const newPrice = Math.round(wholesale * (1 + validMargin / 100));
          return {
            ...p,
            price: newPrice,
            originalPrice: Math.max(p.originalPrice || Math.round(newPrice * 1.3), Math.round(newPrice * 1.25)),
            profitMarginPercent: validMargin,
            brand: (!p.brand || p.brand.toLowerCase().includes('shopbase')) ? 'OneRoof Mart' : p.brand,
          };
        });
        idbSet('oneroof_cached_products', updated).catch(() => {});
        try {
          safeLocalStorage.setItem('oneroof_products', JSON.stringify(updated.slice(0, 200)));
        } catch (_) {}
        return updated;
      });

      // 3. Batch sync to Supabase in background
      updateAllProductsProfitMarginInSupabase(validMargin).catch((err) => {
        console.warn('Background Supabase margin sync notice:', err);
      });

      addToast(
        language === 'bn'
          ? `সকল ১১,৮৯৬+ প্রোডাক্টে ${validMargin}% প্রফিট মার্জিন সফলভাবে কার্যকর হয়েছে!`
          : `Applied ${validMargin}% profit margin across all products!`,
        'success'
      );
      return true;
    } catch {
      addToast(language === 'bn' ? 'মার্জিন আপডেটে সমস্যা হয়েছে' : 'Failed to update margin', 'error');
      return false;
    }
  };

  // Enforce White-Label Store Branding and Purge Supplier references
  const enforceWhiteLabelPurge = async (): Promise<boolean> => {
    try {
      setProducts((prev) => {
        const cleaned = prev.map((p) => {
          let desc = p.descriptionBn || '';
          desc = desc.replace(/ShopBase BD পণ্য/gi, 'OneRoof Mart এক্সক্লুসিভ পণ্য');
          desc = desc.replace(/ShopBase BD/gi, 'OneRoof Mart');
          desc = desc.replace(/ShopBaseBD Official/gi, 'OneRoof Official');
          desc = desc.replace(/ShopBase/gi, 'OneRoof');
          desc = desc.split('\n').filter(line => {
            const l = line.toLowerCase();
            return !l.includes('পাইকারি রেট') && 
                   !l.includes('পাইকারি মূল্য') && 
                   !l.includes('হোলসেল') && 
                   !l.includes('রিসেলার একাউন্ট') && 
                   !l.includes('01929637253') &&
                   !l.includes('আপনার নিট প্রফিট') &&
                   !l.includes('আপনার লাভ');
          }).join('\n').trim();

          const cleanSpecs: Record<string, string> = {
            'ব্র্যান্ড': 'OneRoof Mart',
            'কোয়ালিটি': '১০০% প্রিমিয়াম এক্সপোর্ট স্ট্যান্ডার্ড',
            'ডেলিভারি': 'সারাদেশে ক্যাশ অন ডেলিভারি (২-৪ দিন)',
            'ওয়ারেন্টি': '৭ দিনের রিটার্ন ও রিপ্লেসমেন্ট',
          };

          if (p.specifications && typeof p.specifications === 'object') {
            const forbiddenKeys = ['সোর্স', 'উৎস', 'পাইকারি', 'হোলসেল', 'লাভ', 'প্রফিট', 'রিসেলার', 'একাউন্ট'];
            Object.entries(p.specifications).forEach(([k, v]) => {
              if (!forbiddenKeys.some(f => k.includes(f))) {
                cleanSpecs[k] = String(v).replace(/ShopBase/gi, 'OneRoof');
              }
            });
          }

          return {
            ...p,
            brand: 'OneRoof Mart',
            descriptionBn: desc,
            specifications: cleanSpecs,
            tags: (p.tags || []).filter(t => !['shopbase', 'dropshipping', 'wholesale'].includes(String(t).toLowerCase())),
          };
        });

        idbSet('oneroof_cached_products', cleaned).catch(() => {});
        try {
          safeLocalStorage.setItem('oneroof_products', JSON.stringify(cleaned.slice(0, 200)));
        } catch (_) {}
        return cleaned;
      });

      addToast(
        language === 'bn'
          ? '১০০% নিজস্ব OneRoof Mart ব্র্যান্ডিং সফলভাবে নিশ্চিত করা হয়েছে!'
          : 'Enforced 100% white-label store brand!',
        'success'
      );
      return true;
    } catch {
      return false;
    }
  };

  // Banner Slides Operations
  const updateBannerSlides = (slides: AdminBannerSlide[]) => {
    setBannerSlides(slides);
    syncBannerSlidesToSupabase(slides);
    addToast(language === 'bn' ? 'ব্যানার স্লাইডার আপডেট হয়েছে!' : 'Banner slides updated!', 'success');
  };

  const addBannerSlide = (slide: AdminBannerSlide) => {
    setBannerSlides((prev) => {
      const next = [...prev, slide];
      syncBannerSlidesToSupabase(next);
      return next;
    });
    addToast(language === 'bn' ? 'নতুন ব্যানার যুক্ত করা হয়েছে!' : 'New banner added!', 'success');
  };

  const updateBannerSlide = (id: string, updated: Partial<AdminBannerSlide>) => {
    setBannerSlides((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      syncBannerSlidesToSupabase(next);
      return next;
    });
    addToast(language === 'bn' ? 'ব্যানার সফলভাবে আপডেট হয়েছে!' : 'Banner updated successfully!', 'success');
  };

  const deleteBannerSlide = (id: string) => {
    setBannerSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      deleteBannerSlideFromSupabase(id);
      syncBannerSlidesToSupabase(next);
      return next;
    });
    addToast(language === 'bn' ? 'ব্যানার মুছে ফেলা হয়েছে!' : 'Banner deleted!', 'info');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrentPage = (page: PageView) => {
    setCurrentPageState(page);
    try {
      if (typeof window !== 'undefined' && window.history && page !== 'product-detail') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('product') || url.searchParams.has('p') || url.searchParams.has('id')) {
          url.searchParams.delete('product');
          url.searchParams.delete('p');
          url.searchParams.delete('id');
          const newUrl = url.pathname + (url.search ? url.search : '') + (url.hash && !url.hash.includes('product') ? url.hash : '');
          window.history.pushState({}, '', newUrl);
        }
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPageState('product-detail');
    try {
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set('product', product.id);
        window.history.pushState({ productId: product.id }, '', url.toString());
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (catSlug: string) => {
    setFilterState((prev) => ({ 
      ...prev, 
      category: catSlug, 
      subcategory: 'all', 
      searchQuery: '' 
    }));
    setCurrentPage('shop');
  };

  const addToCart = (
    product: Product, 
    quantity = 1, 
    variant?: Record<string, string>,
    selectedImage?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    const finalSize = selectedSize || variant?.['size'] || variant?.['Size'];
    const finalColor = selectedColor || variant?.['color'] || variant?.['Color'];
    const finalImage = selectedImage || product.images?.[0] || '';

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.product.id === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant) &&
          item.selectedSize === finalSize &&
          item.selectedColor === finalColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev, 
          { 
            product, 
            quantity, 
            selectedVariant: variant,
            selectedSize: finalSize,
            selectedColor: finalColor,
            selectedImage: finalImage
          }
        ];
      }
    });

    const title = language === 'bn' ? product.titleBn : product.titleEn;
    addToast(
      language === 'bn' 
        ? `"${title.substring(0, 24)}..." কার্টে যোগ করা হয়েছে` 
        : `"${title.substring(0, 24)}..." added to cart`,
      'success'
    );
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast(language === 'bn' ? 'আইটেম কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    if (isSaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addToast(language === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, productId]);
      addToast(language === 'bn' ? 'উইশলিস্টে সংরক্ষণ করা হয়েছে' : 'Added to wishlist', 'success');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'ONEROOF10' || trimmed === 'ONEROOFMART10') {
      const coupon: Coupon = {
        code: trimmed,
        discountPercent: 10,
        minSpend: 1000,
        description: language === 'bn' ? '10% ফ্ল্যাট ডিসকাউন্ট' : '10% Flat Discount',
      };
      setAppliedCoupon(coupon);
      return { 
        success: true, 
        message: language === 'bn' ? '10% ডিসকাউন্ট কুপন সফলভাবে যুক্ত হয়েছে!' : '10% Discount applied successfully!' 
      };
    } else if (trimmed === 'EID500') {
      const coupon: Coupon = {
        code: 'EID500',
        fixedDiscount: 500,
        minSpend: 3000,
        description: language === 'bn' ? '৳500 ঈদ স্পেশাল ক্যাশব্যাক' : '৳500 Special Eid Cashback',
      };
      setAppliedCoupon(coupon);
      return { 
        success: true, 
        message: language === 'bn' ? '৳500 ছাড় সফলভাবে যুক্ত হয়েছে!' : '৳500 Discount applied!' 
      };
    } else {
      return { 
        success: false, 
        message: language === 'bn' ? 'ভুল কুপন কোড! "ONEROOFMART10" বা "EID500" ট্রাই করুন' : 'Invalid promo code! Try "ONEROOFMART10" or "EID500"' 
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast(language === 'bn' ? 'কুপন বাতিল করা হয়েছে' : 'Coupon removed', 'info');
  };

  const addReview = (productId: string, rating: number, comment: string, name: string) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      userName: name || (currentUser ? currentUser.name : 'গ্রাহক (Customer)'),
      rating,
      date: language === 'bn' ? 'আজকে' : 'Today',
      comment,
      verifiedPurchase: true,
    };

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const updatedReviews = [newRev, ...prod.reviews];
          const newAvgRating = (
            updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
          );
          const updatedProd = {
            ...prod,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Number(newAvgRating.toFixed(1)),
          };
          syncProductToSupabase(updatedProd).catch(() => {});
          return updatedProd;
        }
        return prod;
      })
    );

    addToast(
      language === 'bn' ? 'আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!' : 'Review posted successfully!',
      'success'
    );
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Dynamic Shipping Fee Calculation
  const calculateShippingFee = (
    location: 'dhaka' | 'outside' = 'dhaka',
    speed: 'regular' | 'express' = 'regular',
    subtotal: number = cartSubtotal
  ): number => {
    if (cart.length === 0 || subtotal === 0) return 0;

    // 1. Express delivery override
    if (speed === 'express') {
      return Number(siteSettings.shippingFeeExpress ?? 150);
    }

    // 2. Check if product-specific shipping fee is defined for the items in cart
    if (location === 'dhaka') {
      const productInsideFees = cart
        .map((item) => item.product.shippingInside ?? item.product.shippingFee)
        .filter((fee): fee is number => fee !== undefined && fee >= 0);
      if (productInsideFees.length > 0) {
        return Math.max(...productInsideFees);
      }
    } else {
      const productOutsideFees = cart
        .map((item) => item.product.shippingOutside ?? item.product.shippingFee)
        .filter((fee): fee is number => fee !== undefined && fee >= 0);
      if (productOutsideFees.length > 0) {
        return Math.max(...productOutsideFees);
      }
    }

    // 3. Check if all products in cart are marked as free shipping
    const allFreeShipping = cart.every((item) => item.product.isFreeShipping);
    if (allFreeShipping && speed === 'regular') return 0;

    // 4. Check if subtotal qualifies for site-wide free delivery threshold
    if (
      siteSettings.enableFreeShipping !== false &&
      siteSettings.freeShippingThreshold > 0 &&
      subtotal >= siteSettings.freeShippingThreshold
    ) {
      if (speed === 'regular') return 0;
    }

    // 5. Default site settings inside vs outside Dhaka
    if (location === 'dhaka') {
      return Number(siteSettings.shippingFeeInsideDhaka ?? 60);
    } else {
      return Number(siteSettings.shippingFeeOutsideDhaka ?? 120);
    }
  };

  const cartShippingFee = calculateShippingFee('dhaka', 'regular', cartSubtotal);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.fixedDiscount) {
      cartDiscount = appliedCoupon.fixedDiscount;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShippingFee);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = (shippingInfo: any, paymentMethod: any, specifiedShippingFee?: number): Order => {
    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
    const trackingNum = 'TRK-BD-' + Math.floor(100000 + Math.random() * 900000);
    
    const finalShippingFee = specifiedShippingFee !== undefined ? specifiedShippingFee : cartShippingFee;
    const finalTotal = Math.max(0, cartSubtotal - cartDiscount + finalShippingFee);

    const now = new Date();
    const dateFormatted = language === 'bn' 
      ? `আজ, ${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}` 
      : now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const newOrder: Order = {
      id: `OR-${randomOrderNum}`,
      trackingNumber: trackingNum,
      date: dateFormatted,
      status: 'placed',
      items: cart.map((item) => ({
        productId: item.product.id,
        sku: item.product.sku || (item.product.id ? `SBP-${item.product.id.replace(/\D/g, '') || item.product.id}` : undefined),
        title: language === 'bn' ? item.product.titleBn : item.product.titleEn,
        price: item.product.price,
        quantity: item.quantity,
        image: item.selectedImage || item.product.images?.[0] || '',
        variant: item.selectedVariant,
        selectedSize: item.selectedSize || item.selectedVariant?.['size'] || item.selectedVariant?.['Size'],
        selectedColor: item.selectedColor || item.selectedVariant?.['color'] || item.selectedVariant?.['Color'],
      })),
      subtotal: cartSubtotal,
      shippingFee: finalShippingFee,
      discount: cartDiscount,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      shippingAddress: shippingInfo,
      userId: currentUser?.id,
      customerEmail: currentUser?.email || shippingInfo?.email || '',
      customerPhone: currentUser?.phone || shippingInfo?.phone || '',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    syncOrderToSupabase(newOrder);
    clearCart();
    setAppliedCoupon(null);
    setCurrentPage('order-success');
    addToast(
      language === 'bn'
        ? 'ধন্যবাদ! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।'
        : 'Thank you! Your order has been placed successfully.',
      'success'
    );
    return newOrder;
  };

  const loginWithGoogle = async () => {
    try {
      // In iframe preview environments, opening OAuth inside the iframe causes Google to throw a 403 Forbidden
      // because Google prohibits accounts.google.com from running inside an iframe.
      // skipBrowserRedirect: true allows opening the OAuth URL in a clean top-level popup/tab.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;

      if (data?.url) {
        const authWindow = window.open(data.url, '_blank', 'width=520,height=640');
        if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
          // Fallback if browser popup blocker prevented window.open
          window.location.href = data.url;
        } else {
          addToast(
            language === 'bn' 
              ? 'গুগল লগইন উইন্ডো ওপেন হয়েছে। অনুগ্রহ করে লগইন সম্পন্ন করুন।' 
              : 'Google login window opened. Please complete your login.',
            'info'
          );
        }
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      addToast(
        language === 'bn' ? `গুগল লগইন ব্যর্থ হয়েছে: ${err.message || 'আবার চেষ্টা করুন'}` : `Google login failed: ${err.message || 'Please try again'}`,
        'error'
      );
    }
  };

  const loginUser = (identifier: string, password?: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    const user = users.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').trim();
      const uPhoneDigits = uPhone.replace(/[^0-9]/g, '');

      // Match email directly
      if (uEmail && uEmail === cleanId) return true;
      // Match phone directly
      if (uPhone && uPhone.toLowerCase() === cleanId) return true;
      // Match phone digits (e.g., 01712-345678 vs 01712345678)
      if (cleanDigits.length >= 10 && uPhoneDigits.length >= 10 && uPhoneDigits.endsWith(cleanDigits.slice(-10))) {
        return true;
      }
      return false;
    });

    if (!user) {
      addToast(
        language === 'bn' 
          ? 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি!' 
          : 'No account found with this email or mobile number!', 
        'error'
      );
      return false;
    }
    
    if (password && user.password && user.password !== password) {
      addToast(language === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect password! Please try again.', 'error');
      return false;
    }

    const isOwner = isUserAdmin(user);
    const userToSet = isOwner && user.role !== 'admin' ? { ...user, role: 'admin' as const } : user;
    setCurrentUser(userToSet);
    if (isOwner || userToSet.role === 'admin') {
      setIsAdminAuthenticated(true);
      safeSessionStorage.setItem('oneroof_admin_auth', 'true');
    }
    setIsAuthModalOpen(false);
    addToast(
      language === 'bn' 
        ? `স্বাগতম, ${user.name}! সফলভাবে লগইন হয়েছে।` 
        : `Welcome, ${user.name}! Logged in successfully.`, 
      'success'
    );
    return true;
  };

  const registerUser = (userData: Partial<User>): boolean => {
    const cleanEmail = userData.email?.trim().toLowerCase() || '';
    const cleanPhone = userData.phone?.trim() || '';
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');

    // Ensure at least one identifier is provided (either phone or email)
    if (!cleanEmail && cleanDigits.length < 10) {
      addToast(
        language === 'bn' 
          ? 'মোবাইল নম্বর অথবা ইমেইল — যেকোনো একটি অবশ্যই প্রদান করতে হবে।' 
          : 'Please provide either a mobile number or an email address.', 
        'error'
      );
      return false;
    }

    // Validate uniqueness if email provided
    if (cleanEmail) {
      const existingEmail = users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
      if (existingEmail) {
        addToast(
          language === 'bn' 
            ? 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করার চেষ্টা করুন।' 
            : 'An account with this email already exists! Please log in.', 
          'error'
        );
        return false;
      }
    }

    // Validate phone uniqueness if phone provided
    if (cleanDigits.length >= 10) {
      const existingPhone = users.find(u => (u.phone || '').replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10)));
      if (existingPhone) {
        addToast(
          language === 'bn' 
            ? 'এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করার চেষ্টা করুন।' 
            : 'An account with this phone number already exists! Please log in.', 
          'error'
        );
        return false;
      }
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
    
    // Auto-promote owner email/phone to admin
    const isAdmin = (Boolean(cleanEmail) && (cleanEmail === SECRET_ADMIN_CONFIG.email || cleanEmail === SECRET_ADMIN_CONFIG.secondaryEmail)) || 
                    (cleanDigits.length >= 10 && cleanDigits.endsWith(SECRET_ADMIN_CONFIG.phone)) || 
                    userData.role === 'admin';

    const fullAddrString = [userData.village, userData.thana, userData.district, userData.division]
      .filter(Boolean)
      .join(', ');

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name?.trim() || '',
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password || '',
      role: isAdmin ? 'admin' : 'user',
      division: userData.division?.trim() || '',
      district: userData.district?.trim() || '',
      thana: userData.thana?.trim() || '',
      village: userData.village?.trim() || '',
      avatar: userData.avatar || defaultAvatar,
      addresses: userData.addresses || (fullAddrString ? [
        {
          id: `addr-${Date.now()}`,
          title: language === 'bn' ? 'মূল ঠিকানা (Default Address)' : 'Primary Address',
          address: fullAddrString,
          district: userData.district?.trim() || '',
          isDefault: true
        }
      ] : [])
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    syncUserToSupabase(newUser);
    setIsAuthModalOpen(false);
    addToast(
      language === 'bn' 
        ? `অভিনন্দন ${newUser.name}! আপনার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে।` 
        : `Congratulations ${newUser.name}! Your account has been registered.`, 
      'success'
    );
    return true;
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(language === 'bn' ? 'প্রোফাইল আপডেট করা হয়েছে' : 'Profile updated successfully', 'success');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    addToast(
      language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out',
      'info'
    );
  };

  const formatPrice = (amount: number) => {
    return formatPriceUtil(amount, language);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        currentPage,
        setCurrentPage,
        selectedProduct,
        setSelectedProduct,
        viewProductDetails,
        products,
        categories: dynamicCategories,
        cart,
        wishlist,
        orders,
        userOrders,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        filterState,
        setFilterState,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        addReview,
        calculateShippingFee,
        placeOrder,
        lastPlacedOrder,
        toasts,
        addToast,
        removeToast,
        loginUser,
        loginWithGoogle,
        registerUser,
        updateUserProfile,
        logoutUser,
        formatPrice,
        cartSubtotal,
        cartDiscount,
        cartShippingFee,
        cartTotal,
        cartItemsCount,
        openCategory,
        profileActiveTab,
        setProfileActiveTab,
        siteSettings,
        updateSiteSettings,
        resetSiteSettings,
        bannerSlides,
        updateBannerSlides,
        addBannerSlide,
        updateBannerSlide,
        deleteBannerSlide,
        addProduct,
        addMultipleProducts,
        updateProduct,
        deleteProduct,
        deleteMultipleProducts,
        resetProductsToDefault,
        addCategory,
        ensureCategoryExists,
        updateCategory,
        deleteCategory,
        resetCategoriesToDefault,
        updateOrderStatus,
        deleteOrder,
        isTrackOrderModalOpen,
        setIsTrackOrderModalOpen,
        trackingQuery,
        setTrackingQuery,
        openTrackOrder,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        isUserAdmin,
        supabaseConnected,
        supabaseStatusMsg,
        checkSupabaseConnection,
        syncAllToSupabase,
        supabaseSetupSql: SUPABASE_SETUP_SQL,
        supabaseUrl: SUPABASE_URL,
        isProductsLoading,
        globalProfitMargin,
        updateGlobalProfitMargin,
        enforceWhiteLabelPurge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
