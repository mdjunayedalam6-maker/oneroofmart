import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  ShoppingCart, 
  Heart, 
  User, 
  Truck, 
  ShieldCheck,
  Download,
  Smartphone,
  ExternalLink,
  Grid,
  PhoneCall,
  Store
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { MobileDrawer } from './MobileNav';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Header: React.FC = () => {
  const {
    language,
    setCurrentPage,
    products,
    categories,
    setFilterState,
    viewProductDetails,
    formatPrice,
    siteSettings,
    cartItemsCount,
    wishlist,
    currentUser,
    isUserAdmin,
    loginAdmin,
    openTrackOrder,
    setIsAuthModalOpen,
    setIsCartDrawerOpen,
  } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [searchInput, setSearchInput] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const threeDotRef = useRef<HTMLDivElement>(null);

  // Filter auto-suggestions
  const suggestions = searchInput.trim().length > 1
    ? products.filter((p) => {
        const titleBn = p.titleBn || '';
        const titleEn = p.titleEn || '';
        const titleMatch = (language === 'bn' ? titleBn : titleEn)
          .toLowerCase()
          .includes(searchInput.toLowerCase());
        const tagMatch = Array.isArray(p.tags) && p.tags.some((tag) => typeof tag === 'string' && tag.toLowerCase().includes(searchInput.toLowerCase()));
        const brandMatch = typeof p.brand === 'string' && p.brand.toLowerCase().includes(searchInput.toLowerCase());
        const catMatch = selectedSearchCat === 'all' || p.category === selectedSearchCat;
        return (titleMatch || tagMatch || brandMatch) && catMatch;
      }).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (threeDotRef.current && !threeDotRef.current.contains(e.target as Node)) {
        setIsThreeDotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setFilterState((prev) => ({
      ...prev,
      searchQuery: searchInput.trim(),
      category: selectedSearchCat,
    }));
    setIsSearchOpen(false);
    setCurrentPage('shop');
  };

  const handleSelectSuggestion = (prod: any) => {
    setIsSearchOpen(false);
    setSearchInput('');
    viewProductDetails(prod);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200/80 transition-all">
      {/* Top Announcement Bar (Controllable via Secret Admin Panel) */}
      {siteSettings.showAnnouncementBar && (
        <div 
          className="text-white text-xs py-1.5 px-4 text-center font-medium transition-colors"
          style={{ backgroundColor: siteSettings.primaryColor }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="truncate">
              {language === 'bn' ? siteSettings.announcementTextBn : siteSettings.announcementTextEn}
            </span>
            {siteSettings.hotlineNumber && (
              <span className="shrink-0 text-[11px] opacity-90 hidden sm:inline">
                হটলাইন: {siteSettings.hotlineNumber}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Header Bar: Brand Logo on Left, Product Search & Find Button directly on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: 3-Dot Navigation Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 py-0.5">
          <div ref={threeDotRef} className="relative">
            <button
              onClick={() => {
                if (siteSettings.appDownloadUrl?.trim()) {
                  setIsThreeDotMenuOpen((prev) => !prev);
                } else {
                  setIsDrawerOpen(true);
                }
              }}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer relative"
              aria-label="Toggle Menu"
            >
              <MoreVertical className="w-6 h-6" />
              {siteSettings.appDownloadUrl?.trim() && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Dropdown Menu directly below Three-Dot Button */}
            {isThreeDotMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                {/* App Download / Install Action (Priority feature) */}
                {siteSettings.appDownloadUrl?.trim() && (
                  <div className="mb-2 p-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl shadow-md">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black leading-tight flex items-center gap-1.5">
                          <span className="truncate">{siteSettings.appNameBn || (language === 'bn' ? 'বাংলা বাজার মোবাইল অ্যাপ' : 'Bangla Bazar Mobile App')}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white text-emerald-800 rounded">
                            APK
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-100 mt-0.5 leading-snug line-clamp-2">
                          {siteSettings.appSubtitleBn || (language === 'bn' ? 'সহজ ও দ্রুত কেনাকাটায় সরাসরি ডাউনলোড ও ইনস্টল করুন' : 'Fast and smooth shopping experience')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={siteSettings.appDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => setIsThreeDotMenuOpen(false)}
                      className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড বা ইনস্টল করুন' : 'Download / Install App'}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-0.5 text-xs font-medium text-slate-700">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Grid className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-800">{language === 'bn' ? 'সকল ক্যাটাগরি ও মেনু' : 'All Categories & Menu'}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {categories.length}টি
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      openTrackOrder();
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 text-left transition-colors cursor-pointer font-bold"
                  >
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span>{language === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Track Order'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('about');
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-left transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-slate-500" />
                    <span>{language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('contact');
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-left transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-slate-500" />
                    <span>{language === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact & Support'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <BrandLogo onClick={() => setCurrentPage('home')} size="md" />
          </div>
        </div>

        {/* Right: Product Find & Search Section */}
        <div ref={searchRef} className="relative flex-1 max-w-xl sm:max-w-2xl ml-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
            {/* Animated Gradient Border wrapper */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-[#003882] to-emerald-500 rounded-2xl blur-xs opacity-30 group-hover:opacity-70 transition duration-500"></div>
            
            <div className="relative flex w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Category Select inside Search Input (Desktop) */}
              <div className="hidden md:flex items-center pl-2 bg-slate-50 border-r border-slate-200">
                <select
                  value={selectedSearchCat}
                  onChange={(e) => setSelectedSearchCat(e.target.value)}
                  className="bg-transparent hover:bg-slate-100 text-slate-700 text-xs font-bold py-3 px-2 focus:outline-none cursor-pointer transition-colors max-w-[140px] truncate"
                >
                  <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder={
                    language === 'bn'
                      ? 'আপনার পছন্দের পণ্য বা ব্র্যান্ড খুঁজুন...'
                      : 'Search for products or brands...'
                  }
                  className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-3.5 sm:px-6 bg-gradient-to-r from-[#003882] to-[#002a61] hover:from-[#002a61] hover:to-[#001b40] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                aria-label={language === 'bn' ? 'অনুসন্ধান' : 'Search'}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">
                  {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                </span>
              </button>
            </div>
          </form>

          {/* Auto-suggest dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              {suggestions.length > 0 ? (
                <div className="p-2 divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'পণ্য সাজেশন' : 'Product Suggestions'}
                  </div>
                  {suggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectSuggestion(prod)}
                      className="flex items-center gap-3 p-2.5 hover:bg-orange-50/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <img
                        src={
                          prod?.images?.[0]?.includes('_L_') && prod.images[0].endsWith('.jpg')
                            ? prod.images[0].replace(/\.jpg$/i, '.jpeg')
                            : prod?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
                        }
                        alt={prod.titleBn || ''}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('_L_')) {
                            target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                          } else {
                            target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                          }
                        }}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {language === 'bn' ? prod.titleBn : prod.titleEn}
                        </div>
                        <div className="text-[11px] text-[#FF6B00] font-bold">
                          {formatPrice(prod.price)}
                          {prod.originalPrice && (
                            <span className="text-slate-400 line-through text-[10px] ml-1.5 font-normal">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 capitalize bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        {prod.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : searchInput.trim().length > 1 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {language === 'bn' ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No matching products found'}
                </div>
              ) : (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {language === 'bn' ? 'জনপ্রিয় সার্চসমূহ' : 'Popular Searches'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['স্যামসাং A54', 'সুতি পাঞ্জাবি', 'চিনিগুঁড়া চাল', 'স্মার্টওয়াচ', 'নন-ফ্রস্ট ফ্রিজ', 'ব্লুটুথ হেডফোন'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchInput(tag);
                          setFilterState((prev) => ({ ...prev, searchQuery: tag, category: 'all' }));
                          setIsSearchOpen(false);
                          setCurrentPage('shop');
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-orange-50 hover:text-[#FF6B00] hover:border-orange-200 border border-transparent rounded-full text-slate-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Desktop Action Icons (Track, Admin, Cart, Wishlist, User) */}
        <div className="hidden md:flex items-center gap-3 shrink-0 pl-3">
          {/* In-App PWA Install Button on Desktop */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => install()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer shadow-2xs"
              title={language === 'bn' ? 'বাংলা বাজার অ্যাপ ইনস্টল করুন' : 'Install Bangla Bazar App'}
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              <span>{language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
            </button>
          )}

          {/* Universal Track Order Button */}
          <button
            onClick={() => openTrackOrder()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#FF6B00] text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title={language === 'bn' ? 'অর্ডার লাইভ ট্র্যাক করুন' : 'Track Order'}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
          </button>

          {/* Admin Panel Button if Logged-in User is Admin */}
          {currentUser && isUserAdmin(currentUser) && (
            <button
              onClick={() => {
                loginAdmin();
                setCurrentPage('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              title="এডমিন ড্যাশবোর্ডে প্রবেশ করুন"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (currentUser) {
                setCurrentPage('profile');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title={language === 'bn' ? 'লগইন / রেজিস্ট্রেশন' : 'Login / Register'}
          >
            <User className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => {
              if (currentUser) {
                setCurrentPage('profile');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <Heart className="w-6 h-6" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-[#003882] hover:bg-[#002a61] text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm hidden lg:inline">
              {language === 'bn' ? 'কার্ট' : 'Cart'}
            </span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B00] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};
