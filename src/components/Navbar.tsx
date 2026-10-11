import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Flame, 
  Sparkles, 
  ShoppingBag, 
  ChevronDown, 
  Tag, 
  Award, 
  CheckCircle2, 
  Clock,
  Zap,
  ArrowRight,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toBengaliNumber } from '../utils/translations';

export const Navbar: React.FC = () => {
  const { 
    language, 
    t, 
    categories, 
    currentPage, 
    setCurrentPage, 
    openCategory,
    setFilterState,
    openTrackOrder
  } = useApp();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page: any) => {
    setCurrentPage(page);
    setIsCategoryOpen(false);
  };

  const openFlashSale = () => {
    setFilterState((prev) => ({ ...prev, isFlashSaleOnly: true, category: 'all', searchQuery: '' }));
    setCurrentPage('shop');
  };

  return (
    <div className="bg-[#0A2540] border-t border-slate-800 text-white select-none hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Category Mega Dropdown Button */}
          <div ref={catMenuRef} className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2.5 px-4 sm:px-5 py-3 theme-btn-buy text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{t.allCategories}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown List */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 w-72 bg-white text-slate-800 shadow-2xl rounded-b-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      openCategory(cat.id);
                      setIsCategoryOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 hover:text-[#003882] text-xs font-semibold text-slate-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#003882] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-[#003882] font-normal transition-colors">
                      {language === 'bn' ? `${toBengaliNumber(cat.itemCount)}টি পণ্য` : `${cat.itemCount} items`}
                    </span>
                  </button>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-100 px-4 pb-1">
                  <button
                    onClick={() => {
                      setFilterState((prev) => ({ ...prev, category: 'all', searchQuery: '' }));
                      setCurrentPage('shop');
                      setIsCategoryOpen(false);
                    }}
                    className="text-xs text-[#003882] font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>{language === 'bn' ? 'সব পণ্য এক সাথে দেখুন' : 'Browse All Products'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Nav Links */}
          <nav className="flex items-center space-x-1 pl-2 text-xs sm:text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-3 rounded-md transition-colors ${
                currentPage === 'home' ? 'text-amber-400 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.home}
            </button>

            {/* Flash Sale with Animated Fire badge */}
            <button
              onClick={openFlashSale}
              className="flex items-center gap-1 px-3 py-3 text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{t.flashSale}</span>
              <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-0.5">
                HOT
              </span>
            </button>

            <button
              onClick={() => {
                setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'price-low', searchQuery: '' }));
                setCurrentPage('shop');
              }}
              className="px-3 py-3 text-slate-200 hover:text-white transition-colors"
            >
              {t.bestSellers}
            </button>

            <button
              onClick={() => {
                setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'newest', searchQuery: '' }));
                setCurrentPage('shop');
              }}
              className="px-3 py-3 text-slate-200 hover:text-white transition-colors"
            >
              {t.newArrivals}
            </button>

            <button
              onClick={() => openCategory('grocery')}
              className="flex items-center gap-1 px-3 py-3 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'গ্রোসারি এক্সপ্রেস' : 'Grocery Express'}</span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-3 rounded-md transition-colors ${
                currentPage === 'about' ? 'text-amber-400 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.aboutUs}
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-3 rounded-md transition-colors ${
                currentPage === 'contact' ? 'text-amber-400 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.contact}
            </button>

            <button
              onClick={() => openTrackOrder()}
              className="flex items-center gap-1.5 px-3 py-3 text-amber-300 hover:text-amber-200 transition-colors font-semibold"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
          </nav>
        </div>

        {/* Right side Promo Pill */}
        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold bg-slate-900/60 py-1.5 px-3 rounded-full border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'bn' ? '১০% ডিসকাউন্ট কুপন: ' : '10% Off Code: '}</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black tracking-wider text-[11px]">
            BANGLABAZAR10
          </span>
        </div>
      </div>
    </div>
  );
};
