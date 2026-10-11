import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Star, 
  Search,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategorySlimBanner } from '../components/CategorySlimBanner';
import { toBengaliNumber } from '../utils/translations';
import { isProductInCategory } from '../utils/categoryMatcher';
import { getSubcategoryImage } from '../utils/subcategoryImages';

export const ShopPage: React.FC = () => {
  const {
    products,
    isProductsLoading,
    categories,
    filterState,
    setFilterState,
    language,
    t,
    formatPrice,
    setCurrentPage,
  } = useApp();

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(36);

  // Reset pagination when category, subcategory, search, or filters change
  useEffect(() => {
    setDisplayCount(36);
  }, [filterState]);

  // Smooth scroll to top when category or subcategory is clicked
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {}
  }, [filterState.category, filterState.subcategory]);

  // Extract all unique brands (strictly white-labeled)
  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      const b = (!p.brand || p.brand.toLowerCase().includes('shopbase') || p.brand.toLowerCase().includes('oneroof')) ? 'বাংলা বাজার' : p.brand;
      if (b) brandsSet.add(b);
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category & Subcategory filter using central category matcher
      if (!isProductInCategory(p, filterState.category, filterState.subcategory, categories)) {
        return false;
      }

      // Price range
      if (p.price < filterState.minPrice || p.price > filterState.maxPrice) {
        return false;
      }
      // Brand filter
      if (filterState.brand.length > 0 && !filterState.brand.includes(p.brand)) {
        return false;
      }
      // Rating filter
      if (filterState.minRating > 0 && p.rating < filterState.minRating) {
        return false;
      }
      // In stock
      if (filterState.inStockOnly && p.stock <= 0) {
        return false;
      }
      // Flash sale only
      if (filterState.isFlashSaleOnly && !p.isFlashSale) {
        return false;
      }
      // Search query
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const titleBn = p.titleBn || '';
        const titleEn = p.titleEn || '';
        const titleMatch = (language === 'bn' ? titleBn : titleEn).toLowerCase().includes(q);
        const brandMatch = typeof p.brand === 'string' && p.brand.toLowerCase().includes(q);
        const tagMatch = Array.isArray(p.tags) && p.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q));
        if (!titleMatch && !brandMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (filterState.sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (filterState.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filterState.sortBy === 'newest') {
        return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, filterState, categories, language]);

  const handleCategorySelect = (slug: string) => {
    setFilterState((prev) => ({ ...prev, category: slug, subcategory: 'all' }));
  };

  const handleBrandToggle = (brandName: string) => {
    setFilterState((prev) => {
      const exists = prev.brand.includes(brandName);
      const newBrands = exists
        ? prev.brand.filter((b) => b !== brandName)
        : [...prev.brand, brandName];
      return { ...prev, brand: newBrands };
    });
  };

  const handleResetFilters = () => {
    setFilterState({
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
    });
  };

  const selectedCatObj = categories.find((c) => c.id === filterState.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Dynamic Ultra-Slim Category Rotating Banner & Quick Category Switcher */}
      <CategorySlimBanner
        currentCategory={filterState.category}
        currentSubcategory={filterState.subcategory}
        categories={categories}
        onSelectCategory={handleCategorySelect}
        onSelectSubcategory={(subcatId) => setFilterState((prev) => ({ ...prev, subcategory: subcatId }))}
        productsCount={filteredProducts.length}
        language={language}
        searchQuery={filterState.searchQuery}
        onClearSearch={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
        onResetFilters={handleResetFilters}
      />

      {/* Main Container: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filter (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                {t.filterBy}
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                {t.clearAll}
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                    filterState.category === 'all'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                      {language === 'bn' ? toBengaliNumber(products.length) : products.length}
                    </span>
                    {filterState.category === 'all' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
                {categories.map((c) => {
                  const isSelected = filterState.category === c.id;
                  return (
                    <div key={c.id} className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect(c.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{language === 'bn' ? c.nameBn : c.nameEn}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                            {language === 'bn' ? toBengaliNumber(c.itemCount) : c.itemCount}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                      </button>

                      {/* If selected on desktop, show subcategories indented */}
                      {isSelected && c.subcategories && c.subcategories.length > 0 && (
                        <div className="pl-3 space-y-0.5 border-l-2 border-emerald-300 ml-2 py-0.5 animate-in fade-in duration-150">
                          <button
                            onClick={() => setFilterState((prev) => ({ ...prev, subcategory: 'all' }))}
                            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              filterState.subcategory === 'all'
                                ? 'text-emerald-700 font-bold bg-emerald-50/80'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <img
                              src={c.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80'}
                              alt={c.nameBn}
                              className="w-4 h-4 rounded object-cover shrink-0 border border-slate-200"
                            />
                            <span>{language === 'bn' ? 'সকল আইটেম' : 'All Items'}</span>
                          </button>
                          {c.subcategories.map((sub) => {
                            const isSubSelected = 
                              filterState.subcategory === sub.id || 
                              filterState.subcategory.toLowerCase() === sub.nameBn.toLowerCase();

                            return (
                              <button
                                key={sub.id}
                                onClick={() => setFilterState((prev) => ({ ...prev, subcategory: sub.id }))}
                                className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                  isSubSelected
                                    ? 'text-emerald-700 font-bold bg-emerald-50/80'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <img
                                  src={getSubcategoryImage(sub.id, sub.nameBn, sub.image, products, c.id)}
                                  alt={sub.nameBn}
                                  className="w-4 h-4 rounded object-cover shrink-0 border border-slate-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getSubcategoryImage(sub.id, sub.nameBn, undefined, undefined, c.id);
                                  }}
                                />
                                <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.priceRange}
              </label>
              <div>
                <input
                  type="range"
                  min={0}
                  max={60000}
                  step={500}
                  value={filterState.maxPrice}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mt-1">
                  <span>{formatPrice(0)}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    সর্বোচ্চ {formatPrice(filterState.maxPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.brand}
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {allBrands.map((b) => {
                  const isChecked = filterState.brand.includes(b);
                  return (
                    <label
                      key={b}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:text-emerald-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(b)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span>{b}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.rating}
              </label>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        minRating: prev.minRating === stars ? 0 : stars,
                      }))
                    }
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filterState.minRating === stars
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-500 font-normal">
                        {language === 'bn' ? 'ও তার উপরে' : '& above'}
                      </span>
                    </div>
                    {filterState.minRating === stars && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.isFlashSaleOnly}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, isFlashSaleOnly: e.target.checked }))
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-rose-600 font-bold">{language === 'bn' ? 'শুধুমাত্র ফ্ল্যাশ সেল' : 'Flash Sale Only'}</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.inStockOnly}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>{language === 'bn' ? 'স্টকে থাকা পণ্য' : 'In Stock Only'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Catalog (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Sorting & Layout Toolbar */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{t.filterBy}</span>
              </button>

              <span className="text-xs text-slate-500 hidden sm:inline">
                {filteredProducts.length} {language === 'bn' ? 'টি আইটেম প্রদর্শিত' : 'items displayed'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 hidden sm:inline">{t.sortBy}:</span>
                <select
                  value={filterState.sortBy}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))
                  }
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                >
                  <option value="featured">{t.featured}</option>
                  <option value="price-low">{t.priceLowHigh}</option>
                  <option value="price-high">{t.priceHighLow}</option>
                  <option value="rating">{t.ratingHigh}</option>
                  <option value="newest">{t.newArrivals}</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    layout === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    layout === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(filterState.category !== 'all' || filterState.brand.length > 0 || filterState.minRating > 0 || filterState.isFlashSaleOnly) && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">{language === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}</span>
              {filterState.category !== 'all' && (
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                  {selectedCatObj ? (language === 'bn' ? selectedCatObj.nameBn : selectedCatObj.nameEn) : filterState.category}
                  <button onClick={() => setFilterState((prev) => ({ ...prev, category: 'all' }))}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              )}
              {filterState.brand.map((b) => (
                <span key={b} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                  {b}
                  <button onClick={() => handleBrandToggle(b)}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              ))}
              {filterState.minRating > 0 && (
                <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                  {filterState.minRating}★+
                  <button onClick={() => setFilterState((prev) => ({ ...prev, minRating: 0 }))}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              )}
              {filterState.isFlashSaleOnly && (
                <span className="bg-rose-50 text-rose-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                  Flash Sale
                  <button onClick={() => setFilterState((prev) => ({ ...prev, isFlashSaleOnly: false }))}>
                    <X className="w-3 h-3 hover:text-rose-500" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-1"
              >
                {t.clearAll}
              </button>
            </div>
          )}

          {/* Product Grid / List, Loading Skeleton, or Empty State */}
          {isProductsLoading && products.length === 0 ? (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5'
                  : 'space-y-3'
              }
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-6">
              <div
                className={
                  layout === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5'
                    : 'space-y-3'
                }
              >
                {filteredProducts.slice(0, displayCount).map((product) => (
                  <ProductCard key={product.id} product={product} layout={layout} />
                ))}
              </div>

              {/* Load More Pagination for Large Catalog */}
              {filteredProducts.length > displayCount && (
                <div className="pt-6 pb-2 text-center space-y-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'bn'
                      ? `মোট ${toBengaliNumber(filteredProducts.length)} টির মধ্যে ${toBengaliNumber(Math.min(displayCount, filteredProducts.length))} টি পণ্য প্রদর্শিত হচ্ছে`
                      : `Showing ${Math.min(displayCount, filteredProducts.length)} of ${filteredProducts.length} products`}
                  </p>
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 36)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'আরো পণ্য দেখুন (+৩৬ টি)' : 'Load More Products (+36)'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {language === 'bn' ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {language === 'bn' 
                  ? 'আপনার ফিল্টারের শর্তাবলী শিথিল করুন অথবা অন্যান্য ক্যাটাগরি ব্রাউজ করুন।' 
                  : 'Try relaxing your filter criteria or search for a different item.'}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                {language === 'bn' ? 'সব ফিল্টার রিসেট করুন' : 'Reset All Filters'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  {t.filterBy}
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="py-4 border-b border-slate-100 space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">ক্যাটাগরি</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleCategorySelect('all');
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1 text-xs font-medium rounded ${
                      filterState.category === 'all' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {language === 'bn' ? toBengaliNumber(products.length) : products.length}
                    </span>
                  </button>
                  {categories.map((c) => {
                    const isSelected = filterState.category === c.id;
                    return (
                      <div key={c.id} className="space-y-0.5">
                        <button
                          onClick={() => {
                            handleCategorySelect(c.id);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold rounded ${
                            isSelected ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <span>{language === 'bn' ? c.nameBn : c.nameEn}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {language === 'bn' ? toBengaliNumber(c.itemCount) : c.itemCount}
                          </span>
                        </button>

                        {/* Indented subcategories if category is selected in mobile drawer */}
                        {isSelected && c.subcategories && c.subcategories.length > 0 && (
                          <div className="pl-3 space-y-0.5 border-l-2 border-emerald-300 ml-2 py-0.5">
                            <button
                              onClick={() => {
                                setFilterState((prev) => ({ ...prev, subcategory: 'all' }));
                                setIsMobileFilterOpen(false);
                              }}
                              className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                filterState.subcategory === 'all'
                                  ? 'text-emerald-700 font-bold bg-emerald-50/80'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <img
                                src={c.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80'}
                                alt={c.nameBn}
                                className="w-4 h-4 rounded object-cover shrink-0 border border-slate-200"
                              />
                              <span>{language === 'bn' ? 'সকল আইটেম' : 'All Items'}</span>
                            </button>
                            {c.subcategories.map((sub) => {
                              const isSubSelected = 
                                filterState.subcategory === sub.id || 
                                filterState.subcategory.toLowerCase() === sub.nameBn.toLowerCase();

                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => {
                                    setFilterState((prev) => ({ ...prev, subcategory: sub.id }));
                                    setIsMobileFilterOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                    isSubSelected
                                      ? 'text-emerald-700 font-bold bg-emerald-50/80'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  <img
                                    src={getSubcategoryImage(sub.id, sub.nameBn, sub.image, products, c.id)}
                                    alt={sub.nameBn}
                                    className="w-4 h-4 rounded object-cover shrink-0 border border-slate-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = getSubcategoryImage(sub.id, sub.nameBn, undefined, undefined, c.id);
                                    }}
                                  />
                                  <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-b border-slate-100 space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">মূল্য সীমা</div>
                <input
                  type="range"
                  min={0}
                  max={60000}
                  step={500}
                  value={filterState.maxPrice}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-600"
                />
                <div className="text-xs font-bold text-slate-700">
                  সর্বোচ্চ: {formatPrice(filterState.maxPrice)}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                ফিল্টার প্রয়োগ করুন ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                রিসেট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
