import { createClient } from '@supabase/supabase-js';
import { Product, Order, Category, SiteSettings, AdminBannerSlide, User } from '../types';
import { safeLocalStorage } from '../utils/safeStorage';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return String(import.meta.env[key]);
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return String(process.env[key]);
    }
  } catch {}
  return fallback;
};

// Clean and normalize Supabase base URL (strips any trailing /rest/v1 or slashes)
export const SUPABASE_URL = (
  getEnvVar('VITE_SUPABASE_URL', 'https://ppwaosjmbdyocrmhnwak.supabase.co')
).trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2Fvc2ptYmR5b2NybWhud2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExOTgsImV4cCI6MjEwNjA2NzE5OH0.8zZnNTMhFZnUWXfkKwUzV07pgGOEnQSCKn7xg5GHLN4'
).trim();

// Custom storage adapter ensuring iframe and mobile compatibility without throwing SecurityError
const safeSupabaseStorage = {
  getItem: (key: string): string | null => safeLocalStorage.getItem(key),
  setItem: (key: string, value: string): void => safeLocalStorage.setItem(key, value),
  removeItem: (key: string): void => safeLocalStorage.removeItem(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeSupabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// SQL Schema for Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- =========================================================
-- OneRoof Mart - Complete Supabase Backend Database Setup Script
-- Project: OneRoof Mart (ID: ppwaosjmbdyocrmhnwak | Region: ap-southeast-1)
-- Instructions:
-- 1. Go to Supabase Dashboard (https://supabase.com/dashboard/project/ppwaosjmbdyocrmhnwak/sql/new)
-- 2. Paste this entire script into SQL Editor
-- 3. Click "Run" button to create all tables with Realtime and RLS
-- =========================================================

-- 1. Products Table (পণ্য তালিকা)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL,
  subcategory TEXT,
  stock INTEGER DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure subcategory column exists if table was created previously
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Orders Table (অর্ডার ট্র্যাকিং ও ইতিহাস)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  tracking_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'placed',
  total NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table (ক্যাটাগরি ও সাব-ক্যাটাগরি)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Site Settings Table (সাইট ডিজাইন ও কনফিগারেশন)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Banner Slides Table (হিরো ব্যানার স্লাইডার)
CREATE TABLE IF NOT EXISTS public.banner_slides (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Users Table (গ্রাহক ও ব্যবহারকারী একাউন্ট)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  phone TEXT,
  email TEXT,
  name TEXT,
  password TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Set up permissive Row Level Security (RLS) policies for Anon & Authenticated users

-- Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage products" ON public.products;
CREATE POLICY "Public can manage products" ON public.products FOR ALL USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can manage orders" ON public.orders;
CREATE POLICY "Public can manage orders" ON public.orders FOR ALL USING (true);

-- Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
CREATE POLICY "Public can manage categories" ON public.categories FOR ALL USING (true);

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view site_settings" ON public.site_settings;
CREATE POLICY "Public can view site_settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage site_settings" ON public.site_settings;
CREATE POLICY "Public can manage site_settings" ON public.site_settings FOR ALL USING (true);

-- Banner Slides Policies
DROP POLICY IF EXISTS "Public can view banner_slides" ON public.banner_slides;
CREATE POLICY "Public can view banner_slides" ON public.banner_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage banner_slides" ON public.banner_slides;
CREATE POLICY "Public can manage banner_slides" ON public.banner_slides FOR ALL USING (true);

-- Users Policies
DROP POLICY IF EXISTS "Public can view users" ON public.users;
CREATE POLICY "Public can view users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage users" ON public.users;
CREATE POLICY "Public can manage users" ON public.users FOR ALL USING (true);

-- Enable Realtime for orders and products (live sync across devices)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
`;

// Helper functions with graceful fallback

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tablesFound?: string[]; missingTables?: string[] }> {
  try {
    const tables: string[] = [];
    const missing: string[] = [];

    const checkTable = async (tableName: string) => {
      try {
        const { error } = await supabase.from(tableName).select('id').limit(1);
        if (!error) {
          tables.push(tableName);
        } else {
          missing.push(tableName);
        }
      } catch {
        missing.push(tableName);
      }
    };

    await Promise.all([
      checkTable('orders'),
      checkTable('products'),
      checkTable('categories'),
      checkTable('site_settings'),
      checkTable('banner_slides'),
      checkTable('users'),
    ]);

    if (tables.length === 6) {
      return { 
        success: true, 
        message: `সব টেবিল সক্রিয় ও সংযুক্ত (6/6 টি টেবিল প্রস্তুত)`,
        tablesFound: tables,
        missingTables: []
      };
    }

    if (tables.length > 0) {
      return { 
        success: true, 
        message: `আংশিক সংযুক্ত (${tables.length}/6 টি টেবিল: ${tables.join(', ')})। বাকি টেবিল (${missing.join(', ')}) তৈরিতে SQL রান করুন।`,
        tablesFound: tables,
        missingTables: missing
      };
    }

    return { 
      success: false, 
      message: 'Supabase প্রজেক্ট কানেক্টেড, কিন্তু টেবিলগুলো এখনও তৈরি করা হয়নি। SQL Editor এ স্ক্রিপ্টটি রান করুন।',
      tablesFound: [],
      missingTables: missing
    };
  } catch (err) {
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Supabase সংযোগে সমস্যা' 
    };
  }
}

// 1. Orders
export async function syncOrderToSupabase(order: Order): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      tracking_number: order.trackingNumber,
      customer_name: order.shippingAddress?.fullName || '',
      customer_phone: order.shippingAddress?.phone || '',
      status: order.status,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      data: order,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase order sync notice:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase order exception:', e);
    return false;
  }
}

export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('data')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }
    return data.map((row) => row.data as Order);
  } catch {
    return null;
  }
}

// 2. Products
export async function syncProductToSupabase(product: Product): Promise<boolean> {
  try {
    const payload: any = {
      id: product.id,
      title_bn: product.titleBn,
      title_en: product.titleEn,
      price: product.price,
      original_price: product.originalPrice || null,
      category: product.category,
      stock: product.stock,
      data: product,
      updated_at: new Date().toISOString(),
    };
    if (product.subcategory) {
      payload.subcategory = product.subcategory;
    }

    const { error } = await supabase.from('products').upsert(payload);
    if (error) {
      // If error mentions subcategory column missing, retry without subcategory top-level column
      if (error.message?.includes('subcategory')) {
        delete payload.subcategory;
        const { error: retryError } = await supabase.from('products').upsert(payload);
        return !retryError;
      }
      console.warn('Supabase product sync notice:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase product exception:', e);
    return false;
  }
}

export async function syncProductsBatchToSupabase(products: Product[]): Promise<boolean> {
  try {
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const chunk = products.slice(i, i + batchSize);
      const rows = chunk.map((product) => ({
        id: product.id,
        title_bn: product.titleBn,
        title_en: product.titleEn,
        price: product.price,
        original_price: product.originalPrice || null,
        category: product.category,
        subcategory: product.subcategory || null,
        stock: product.stock,
        data: product,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('products').upsert(rows);
      if (error) {
        console.warn('Batch product sync notice:', error.message);
      }
    }
    return true;
  } catch (e) {
    console.warn('Batch product sync exception:', e);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.warn('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteMultipleProductsFromSupabase(productIds: string[]): Promise<boolean> {
  if (!productIds || productIds.length === 0) return true;
  try {
    const batchSize = 100;
    for (let i = 0; i < productIds.length; i += batchSize) {
      const chunk = productIds.slice(i, i + batchSize);
      const { error } = await supabase.from('products').delete().in('id', chunk);
      if (error) {
        console.warn('Supabase batch delete error:', error.message);
      }
    }
    return true;
  } catch (e) {
    console.warn('Supabase batch delete exception:', e);
    return false;
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const allProducts: Product[] = [];
    const step = 1000;
    let from = 0;
    const maxPages = 20; // Up to 20,000 products support

    for (let page = 0; page < maxPages; page++) {
      const query = supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(from, from + step - 1);

      // 8-second timeout guarantee
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Product fetch timeout')), 8000)
      );

      const { data, error } = await Promise.race([query, timeoutPromise]);

      if (error || !data || data.length === 0) {
        break;
      }

      for (const row of data) {
        if (row) {
          const item: Product = (row.data && typeof row.data === 'object') ? { ...(row.data as Product) } : ({} as Product);
          item.id = row.id || item.id;
          if (row.title_bn) item.titleBn = row.title_bn;
          if (row.title_en) item.titleEn = row.title_en;
          if (row.price !== undefined && row.price !== null) item.price = Number(row.price);
          if (row.original_price !== undefined && row.original_price !== null) item.originalPrice = Number(row.original_price);
          if (row.category) item.category = row.category;
          if (row.subcategory) item.subcategory = row.subcategory;
          if (row.stock !== undefined && row.stock !== null) item.stock = Number(row.stock);
          if (item.id) {
            // White-label safety: enforce OneRoof Mart brand and supplier price fields
            if (!item.brand || item.brand.toLowerCase().includes('shopbase')) {
              item.brand = 'OneRoof Mart';
            }
            if (!item.wholesalePrice) {
              item.wholesalePrice = item.price;
            }
            if (!item.profitMarginPercent) {
              item.profitMarginPercent = 15;
            }
            allProducts.push(item);
          }
        }
      }

      if (data.length < step) {
        break;
      }
      from += step;
    }

    if (allProducts.length === 0) {
      return null;
    }
    return allProducts;
  } catch (e) {
    console.warn('Supabase fetchProducts notice:', e);
    return null;
  }
}

// 2.5 Update profit margin across all products in Supabase
export async function updateAllProductsProfitMarginInSupabase(
  newMargin: number,
  onProgress?: (processed: number, total: number) => void
): Promise<boolean> {
  try {
    const validMargin = Math.max(1, Math.min(100, Math.round(newMargin)));
    const step = 300;
    let from = 0;
    let processed = 0;

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + step - 1);

      if (error || !data || data.length === 0) break;

      const updatedBatch = data.map((row) => {
        const item: Product = (row.data && typeof row.data === 'object') ? { ...(row.data as Product) } : ({} as Product);
        const wholesale = Number(item.wholesalePrice || row.price || 300);
        const retailPrice = Math.round(wholesale * (1 + validMargin / 100));
        const originalPrice = Math.max(
          Number(row.original_price || retailPrice * 1.3),
          Math.round(retailPrice * 1.25)
        );

        item.wholesalePrice = wholesale;
        item.profitMarginPercent = validMargin;
        item.price = retailPrice;
        item.originalPrice = originalPrice;
        item.brand = 'OneRoof Mart';

        return {
          id: row.id,
          title_bn: row.title_bn,
          title_en: row.title_en,
          price: retailPrice,
          original_price: originalPrice,
          category: row.category,
          subcategory: row.subcategory,
          stock: row.stock || 50,
          data: item,
          updated_at: new Date().toISOString(),
        };
      });

      const { error: upsertErr } = await supabase.from('products').upsert(updatedBatch);
      if (!upsertErr) {
        processed += updatedBatch.length;
        if (onProgress) onProgress(processed, 11902);
      }

      if (data.length < step) break;
      from += step;
    }
    return true;
  } catch (e) {
    console.warn('Update margin exception:', e);
    return false;
  }
}

// 3. Site Settings
export async function syncSiteSettingsToSupabase(settings: SiteSettings): Promise<boolean> {
  try {
    const { error } = await supabase.from('site_settings').upsert({
      id: 'global',
      data: settings,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSiteSettingsFromSupabase(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 'global')
      .maybeSingle();

    if (error || !data || !data.data) {
      return null;
    }
    return data.data as SiteSettings;
  } catch {
    return null;
  }
}

// 4. Categories
export async function syncCategoriesToSupabase(categories: Category[]): Promise<boolean> {
  try {
    const rows = categories.map((cat) => ({
      id: cat.id,
      name_bn: cat.nameBn,
      name_en: cat.nameEn,
      slug: cat.slug,
      data: cat,
    }));
    const { error } = await supabase.from('categories').upsert(rows);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCategoryFromSupabase(categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  try {
    const { data, error } = await supabase.from('categories').select('data');
    if (error || !data || data.length === 0) {
      return null;
    }
    return data.map((row) => row.data as Category);
  } catch {
    return null;
  }
}

// 5. Users
export async function syncUserToSupabase(user: User): Promise<boolean> {
  try {
    const payload: any = {
      id: user.id,
      phone: user.phone || null,
      password: user.password || null,
      data: user,
      updated_at: new Date().toISOString(),
    };
    if (user.email) payload.email = user.email;
    if (user.name) payload.name = user.name;

    const { error } = await supabase.from('users').upsert(payload);
    if (error) {
      if (error.message?.includes('email') || error.message?.includes('name')) {
        delete payload.email;
        delete payload.name;
        const { error: retryError } = await supabase.from('users').upsert(payload);
        return !retryError;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('data')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }
    return data.map((row) => row.data as User);
  } catch {
    return null;
  }
}

// 6. Banner Slides
export async function syncBannerSlidesToSupabase(slides: AdminBannerSlide[]): Promise<boolean> {
  try {
    const rows = slides.map((slide) => ({
      id: slide.id,
      data: slide,
    }));
    const { error } = await supabase.from('banner_slides').upsert(rows);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteBannerSlideFromSupabase(slideId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('banner_slides').delete().eq('id', slideId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchBannerSlidesFromSupabase(): Promise<AdminBannerSlide[] | null> {
  try {
    const { data, error } = await supabase.from('banner_slides').select('data');
    if (error || !data || data.length === 0) {
      return null;
    }
    return data.map((row) => row.data as AdminBannerSlide);
  } catch {
    return null;
  }
}
