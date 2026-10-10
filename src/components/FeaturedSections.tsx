import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Send,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { DualCategoryShowcase } from './DualCategoryShowcase';
import { BRANDS } from '../data/mockData';

export const FeaturedSections: React.FC = () => {
  const { products, isProductsLoading, language, t, setCurrentPage, setFilterState, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'electronics' | 'fashion' | 'grocery' | 'home'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const filteredFeatured = React.useMemo(() => {
    return products.filter((p) => {
      if (activeTab === 'all') return p.isFeatured;
      return p.isFeatured && p.category === activeTab;
    });
  }, [products, activeTab]);

  const displayedFeatured = React.useMemo(() => {
    return filteredFeatured.slice(0, 16);
  }, [filteredFeatured]);

  const bestSellers = React.useMemo(() => {
    return products.filter((p) => p.isBestSeller).slice(0, 4);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    return products.filter((p) => p.isNewArrival || p.isFlashSale).slice(0, 4);
  }, [products]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast(
        language === 'bn' ? 'দয়া করে একটি সঠিক ইমেইল প্রদান করুন' : 'Please enter a valid email',
        'error'
      );
      return;
    }
    setIsSubscribed(true);
    addToast(
      language === 'bn' 
        ? 'ধন্যবাদ! আপনি সফলভাবে নিউজলেটারে যুক্ত হয়েছেন।' 
        : 'Thank you for subscribing to our newsletter!',
      'success'
    );
    setNewsletterEmail('');
  };

  const handleBrandClick = (brandName: string) => {
    setFilterState((prev) => ({
      ...prev,
      brand: [brandName],
      category: 'all',
      searchQuery: '',
    }));
    setCurrentPage('shop');
  };

  return (
    <div className="space-y-12 pb-8">
      {/* 1. Featured Products with Interactive Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'সেরা বাছাইকৃত পণ্য' : 'Curated Picks'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'ফিচারড প্রোডাক্টস' : 'Featured Products'}
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', labelBn: 'সকল পণ্য', labelEn: 'All' },
              { id: 'electronics', labelBn: 'ইলেকট্রনিক্স', labelEn: 'Electronics' },
              { id: 'fashion', labelBn: 'ফ্যাশন', labelEn: 'Fashion' },
              { id: 'grocery', labelBn: 'মুদি বাজার', labelEn: 'Grocery' },
              { id: 'home', labelBn: 'হোম অ্যাপ্লায়েন্স', labelEn: 'Home' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {language === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {isProductsLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 animate-pulse space-y-3">
                <div className="w-full pt-[100%] bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-7 bg-slate-200 rounded-xl w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedFeatured.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayedFeatured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredFeatured.length > displayedFeatured.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setFilterState((prev) => ({
                      ...prev,
                      category: activeTab === 'all' ? 'all' : activeTab,
                      subcategory: 'all',
                      searchQuery: '',
                    }));
                    setCurrentPage('shop');
                  }}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-600/30 hover:border-emerald-600 shadow-xs inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>
                    {language === 'bn' 
                      ? `সকল ফিচারড পণ্য দেখুন (${filteredFeatured.length}টি পণ্য)` 
                      : `View All Featured Products (${filteredFeatured.length} items)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-500 text-sm">
            {language === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।' : 'No products in this category yet.'}
          </div>
        )}
      </section>

      {/* 2. Dynamic Auto-Rotating Category Showcase (Panjabi & Festive + Pure Food & Grocery) */}
      <DualCategoryShowcase />

      {/* 3. Best Sellers & New Arrivals Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Sellers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {language === 'bn' ? 'বেস্ট সেলার (সেরা বিক্রিত)' : 'Best Sellers'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'featured', searchQuery: '' }));
                  setCurrentPage('shop');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                {language === 'bn' ? 'সব দেখুন' : 'See all'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {bestSellers.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {language === 'bn' ? 'নতুন এসেছে (নতুন কালেকশন)' : 'New Arrivals'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'newest', searchQuery: '' }));
                  setCurrentPage('shop');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                {language === 'bn' ? 'সব দেখুন' : 'See all'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {newArrivals.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
