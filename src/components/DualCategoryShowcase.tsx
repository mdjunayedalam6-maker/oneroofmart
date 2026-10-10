import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, 
  ShoppingBag, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Truck, 
  CheckCircle2,
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface ShowcasePanelProps {
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeBn: string;
  badgeEn: string;
  badgeBg: string;
  themeColor: 'amber' | 'emerald';
  categorySlug: string;
  products: Product[];
  autoRotateInterval?: number;
}

const ShowcasePanel: React.FC<ShowcasePanelProps> = ({
  titleBn,
  titleEn,
  subtitleBn,
  subtitleEn,
  badgeBn,
  badgeEn,
  badgeBg,
  themeColor,
  categorySlug,
  products,
  autoRotateInterval = 3800,
}) => {
  const { 
    language, 
    formatPrice, 
    viewProductDetails, 
    setCurrentPage, 
    setFilterState, 
    toggleWishlist,
    isInWishlist
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = products.length;

  const nextProduct = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 300);
  }, [total]);

  const prevProduct = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 300);
  }, [total]);

  const goToProduct = (idx: number) => {
    if (idx === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(idx);
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Auto change timer
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const stepMs = 250;
    const stepIncrement = (stepMs / autoRotateInterval) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextProduct();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, total, autoRotateInterval, nextProduct]);

  if (!products || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex] || products[0];
  const title = language === 'bn' ? currentProduct.titleBn : currentProduct.titleEn;
  const isWishlisted = isInWishlist(currentProduct.id);

  const handleViewAll = () => {
    setFilterState((prev) => ({
      ...prev,
      category: categorySlug,
      searchQuery: '',
    }));
    setCurrentPage('shop');
  };

  const isAmber = themeColor === 'amber';

  return (
    <div 
      className={`rounded-xl border p-2 sm:p-3 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
        isAmber 
          ? 'bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/30 text-white' 
          : 'bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/30 text-white'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Ambient Glow */}
      <div 
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isAmber ? 'bg-amber-500' : 'bg-emerald-500'
        }`} 
      />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between gap-1 mb-2 pb-2 border-b border-white/10">
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1">
            <div className="flex flex-wrap gap-1">
              {(language === 'bn' ? badgeBn : badgeEn).split(' • ').map((b, i) => (
                <span key={i} className={`text-[8px] font-black uppercase px-1 py-0.5 rounded shadow-xs ${badgeBg}`}>
                  {b}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-0.5 text-[8px] text-slate-300 bg-white/10 px-1 py-0.5 rounded-full font-mono">
              <span>{currentIndex + 1}/{total}</span>
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5 truncate">
            {language === 'bn' ? titleBn : titleEn}
          </h3>
        </div>

        <button
          onClick={handleViewAll}
          className={`shrink-0 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-1 rounded border transition-all cursor-pointer ${
            isAmber 
              ? 'text-amber-300 border-amber-500/30 hover:bg-amber-500/20' 
              : 'text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          <span>{language === 'bn' ? 'সব' : 'All'}</span>
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>
      </div>

      {/* Main Dynamic Product Card Presentation */}
      <div 
        onClick={() => viewProductDetails(currentProduct)}
        className={`relative z-10 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group flex flex-row gap-2 items-center ${
          isAnimating ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100'
        }`}
      >
        {/* Product Image Box */}
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-950">
          <img
            src={
              currentProduct?.images?.[0]?.includes('_L_') && currentProduct.images[0].endsWith('.jpg')
                ? currentProduct.images[0].replace(/\.jpg$/i, '.jpeg')
                : currentProduct?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
            }
            alt={title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('_L_')) {
                target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
              } else {
                target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 leading-tight">
            {title}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-300">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="ml-0.5 font-bold">{currentProduct.rating}</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-sm font-black text-amber-400 font-mono">
              {formatPrice(currentProduct.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Slide Dots & Micro Progress */}
      <div className="relative z-10 flex items-center justify-between pt-2 mt-2 border-t border-white/10">
        <div className="flex items-center gap-1">
          {products.map((p, idx) => (
            <button
              key={`showcase-dot-${p.id}-${idx}`}
              onClick={() => goToProduct(idx)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? isAmber ? 'w-4 bg-amber-400' : 'w-4 bg-emerald-400'
                  : 'w-1 bg-white/25 hover:bg-white/50'
              }`}
              aria-label={`Show product ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
            <button onClick={prevProduct} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button onClick={nextProduct} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer">
              <ChevronRight className="w-3 h-3" />
            </button>
        </div>
      </div>
    </div>
  );
};

export const DualCategoryShowcase: React.FC = () => {
  const { products } = useApp();

  // 1. Fashion / Panjabi & Festive Products (strictly top 6 handpicked)
  const fashionProducts = React.useMemo(() => {
    return products.filter((p) => {
      const isFashionCat = p.category === 'fashion' || p.category === 'mens-clothing';
      const hasFestiveTag = p.tags && p.tags.some((t) => 
        ['panjabi', 'kabli', 'eid', 'festive', 'fashion'].includes(t.toLowerCase())
      );
      return isFashionCat || hasFestiveTag;
    }).slice(0, 6);
  }, [products]);

  // 2. Grocery / Pure & Natural Products (strictly top 6 handpicked)
  const groceryProducts = React.useMemo(() => {
    return products.filter((p) => {
      const isGroceryCat = p.category === 'grocery';
      const hasOrganicTag = p.tags && p.tags.some((t) => 
        ['grocery', 'honey', 'rice', 'oil', 'ghee', 'organic', 'pure'].includes(t.toLowerCase())
      );
      return isGroceryCat || hasOrganicTag;
    }).slice(0, 6);
  }, [products]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Left: Fashion & Punjabi Showcase */}
        <ShowcasePanel
          titleBn="পাঞ্জাবি ও উৎসব স্পেশাল ডিল"
          titleEn="Festive Panjabi & Ethnic Collection"
          subtitleBn="প্রিমিয়াম সুতি ও সেমি-তসর সিল্ক পাঞ্জাবিতে আকর্ষণীয় মূল্যছাড়"
          subtitleEn="Handpicked premium cotton & semi-tussar silk festival wear"
          badgeBn="সীমিত অফার • উৎসব কালেকশন"
          badgeEn="Limited Offer • Festive Wear"
          badgeBg="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black"
          themeColor="amber"
          categorySlug="fashion"
          products={fashionProducts}
          autoRotateInterval={3800}
        />

        {/* Right: Grocery, Sundarbans Honey, Fragrant Rice & Pure Food */}
        <ShowcasePanel
          titleBn="খাঁটি ও প্রাকৃতিক খাদ্য উপাদান"
          titleEn="Pure Natural & Organic Food"
          subtitleBn="সুন্দরবনের প্রাকৃতিক মধু, সুগন্ধি চিনিগুঁড়া চাল, খাঁটি সরিষার তেল ও গাওয়া ঘি"
          subtitleEn="Sundarbans raw honey, fragrant chinigura rice, cold-pressed oil & ghee"
          badgeBn="খাঁটি ও প্রাকৃতিক • 100% খাঁটি"
          badgeEn="100% Pure & Organic Staples"
          badgeBg="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black"
          themeColor="emerald"
          categorySlug="grocery"
          products={groceryProducts}
          autoRotateInterval={4200}
        />
      </div>
    </section>
  );
};
