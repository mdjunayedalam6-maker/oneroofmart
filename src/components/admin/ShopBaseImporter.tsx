import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Percent, 
  ArrowRight, 
  Search, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Tag,
  Check,
  PackageCheck,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  Zap,
  KeyRound,
  Send
} from 'lucide-react';
import { Product, Category } from '../../types';
import { 
  POPULAR_SHOPBASE_CATEGORIES, 
  CURATED_SHOPBASE_PRODUCTS,
  fetchShopBaseCategories,
  fetchShopBaseProductsByCategory,
  fetchShopBaseSingleProduct,
  getCuratedShopBaseProducts,
  calculateSellingPrice,
  parseShopBaseInput,
  mapNameToCategorySlug,
  ShopBaseCategoryItem,
  fetchAllLiveShopBaseProducts,
  DEFAULT_SHOPBASE_ACCOUNT,
  DEFAULT_SHOPBASE_PASSWORD
} from '../../services/shopbaseService';

interface ShopBaseImporterProps {
  products: Product[];
  addMultipleProducts: (newProducts: Product[]) => void;
  addProduct: (product: Product) => void;
  formatPrice: (amount: number) => string;
  categories: Category[];
  addCategory: (newCat: Category) => void;
}

export const ShopBaseImporter: React.FC<ShopBaseImporterProps> = ({
  products,
  addMultipleProducts,
  addProduct,
  formatPrice,
  categories: siteCategories,
  addCategory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'curated' | 'category' | 'single' | 'guide'>('curated');
  
  // Reseller Account credentials from user
  const [accountNumber, setAccountNumber] = useState<string>(DEFAULT_SHOPBASE_ACCOUNT);
  const [accountPassword, setAccountPassword] = useState<string>(DEFAULT_SHOPBASE_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Profit margin state (10% - 15% as requested!)
  const [profitMargin, setProfitMargin] = useState<number>(15);

  // Mass Sync All Products State
  const [isMassSyncing, setIsMassSyncing] = useState(false);
  const [massSyncProgress, setMassSyncProgress] = useState<{
    loadedCount: number;
    currentCategory: string;
    totalCategories: number;
  }>({
    loadedCount: 0,
    currentCategory: '',
    totalCategories: 0,
  });
  const [massSyncSuccessMsg, setMassSyncSuccessMsg] = useState('');

  // Curated state
  const [curatedList, setCuratedList] = useState<Product[]>([]);
  const [selectedCuratedIds, setSelectedCuratedIds] = useState<Set<string>>(new Set());
  const [isImportingCurated, setIsImportingCurated] = useState(false);

  // Category browse state
  const [categories, setCategories] = useState<ShopBaseCategoryItem[]>(POPULAR_SHOPBASE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<ShopBaseCategoryItem | null>(POPULAR_SHOPBASE_CATEGORIES[0]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] = useState(false);
  const [selectedCatProductIds, setSelectedCatProductIds] = useState<Set<string>>(new Set());
  const [isImportingCatProducts, setIsImportingCatProducts] = useState(false);

  // Single link state
  const [singleInput, setSingleInput] = useState('');
  const [isFetchingSingle, setIsFetchingSingle] = useState(false);
  const [singlePreviewProduct, setSinglePreviewProduct] = useState<Product | null>(null);
  const [singleFetchError, setSingleFetchError] = useState('');

  // Detected category state in Single / Custom URL Tab
  const [detectedCategoryResult, setDetectedCategoryResult] = useState<{
    id: number;
    name: string;
    nameEn: string;
    targetSlug: string;
    image: string;
    iconName: string;
    products: Product[];
  } | null>(null);
  const [selectedDetectedProductIds, setSelectedDetectedProductIds] = useState<Set<string>>(new Set());
  const [isImportingDetectedCategory, setIsImportingDetectedCategory] = useState(false);

  // Already imported IDs
  const existingProductIds = new Set(products.map((p) => p.id));
  const existingSkus = new Set(products.map((p) => p.sku || ''));

  // Calculate stats
  const importedCount = products.filter(
    (p) => p.id.startsWith('sbp-') || p.sku?.startsWith('SBP-') || p.brand?.includes('ShopBase')
  ).length;

  // Mass Sync All Products function
  const handleMassSyncAll = async () => {
    setIsMassSyncing(true);
    setMassSyncSuccessMsg('');
    try {
      const allFetched = await fetchAllLiveShopBaseProducts(
        profitMargin,
        (loadedCount, currentCategory, totalCategories) => {
          setMassSyncProgress({
            loadedCount,
            currentCategory,
            totalCategories,
          });
        }
      );

      const unimported = allFetched.filter((p) => !existingProductIds.has(p.id));
      if (unimported.length > 0) {
        addMultipleProducts(unimported);
        setMassSyncSuccessMsg(`সফল হয়েছে! ShopBaseBD থেকে নতুন ${unimported.length}টি পণ্য সফলভাবে ওয়েবসাইটে আপলোড করা হয়েছে (${profitMargin}% লাভ সহ)।`);
      } else {
        setMassSyncSuccessMsg(`সকল পণ্য ইতোমধ্যে আপনার ওয়েবসাইটে যুক্ত রয়েছে (${allFetched.length}টি পণ্য যাচাইকৃত)।`);
      }
    } catch (err) {
      console.error('Mass sync failed:', err);
    } finally {
      setIsMassSyncing(false);
    }
  };

  // Initialize curated list with 15% profit
  useEffect(() => {
    const list = getCuratedShopBaseProducts(profitMargin);
    setCuratedList(list);
    // Select all unimported by default
    const unimported = list.filter((p) => !existingProductIds.has(p.id)).map((p) => p.id);
    setSelectedCuratedIds(new Set(unimported));
  }, [profitMargin, products.length]);

  // Load category products when selected category changes
  useEffect(() => {
    if (selectedCategory && activeSubTab === 'category') {
      loadProductsForCategory(selectedCategory);
    }
  }, [selectedCategory, profitMargin, activeSubTab]);

  const loadProductsForCategory = async (cat: ShopBaseCategoryItem) => {
    setIsLoadingCategoryProducts(true);
    try {
      const items = await fetchShopBaseProductsByCategory(
        cat.id,
        cat.targetSlug,
        cat.name,
        profitMargin
      );
      setCategoryProducts(items);
      const unimported = items.filter((p) => !existingProductIds.has(p.id)).map((p) => p.id);
      setSelectedCatProductIds(new Set(unimported));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  };

  // Toggle selection
  const toggleCuratedSelection = (id: string) => {
    setSelectedCuratedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCurated = () => {
    const unimported = curatedList.filter((p) => !existingProductIds.has(p.id)).map((p) => p.id);
    setSelectedCuratedIds(new Set(unimported));
  };

  const deselectAllCurated = () => {
    setSelectedCuratedIds(new Set());
  };

  // Import selected curated
  const handleImportCurated = () => {
    const toImport = curatedList.filter((p) => selectedCuratedIds.has(p.id) && !existingProductIds.has(p.id));
    if (toImport.length === 0) return;

    setIsImportingCurated(true);
    setTimeout(() => {
      addMultipleProducts(toImport);
      setIsImportingCurated(false);
      setSelectedCuratedIds(new Set());
    }, 400);
  };

  // Import selected from category
  const handleImportCategoryProducts = () => {
    const toImport = categoryProducts.filter((p) => selectedCatProductIds.has(p.id) && !existingProductIds.has(p.id));
    if (toImport.length === 0) return;

    setIsImportingCatProducts(true);
    setTimeout(() => {
      addMultipleProducts(toImport);
      setIsImportingCatProducts(false);
      setSelectedCatProductIds(new Set());
    }, 400);
  };

  // Fetch single product or category from URL or ID
  const handleFetchSingle = async () => {
    if (!singleInput.trim()) return;
    setIsFetchingSingle(true);
    setSingleFetchError('');
    setSinglePreviewProduct(null);
    setDetectedCategoryResult(null);

    try {
      const parsed = parseShopBaseInput(singleInput.trim());

      if (parsed && parsed.type === 'category') {
        const foundMeta = POPULAR_SHOPBASE_CATEGORIES.find((c) => c.id === parsed.id);
        const catName = foundMeta ? foundMeta.name : `ক্যাটাগরি #${parsed.id}`;
        const targetSlug = foundMeta ? foundMeta.targetSlug : mapNameToCategorySlug(catName);
        const catImage = foundMeta?.image || 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738393401.png';

        const items = await fetchShopBaseProductsByCategory(
          parsed.id,
          targetSlug,
          catName,
          profitMargin
        );

        if (items && items.length > 0) {
          setDetectedCategoryResult({
            id: parsed.id,
            name: catName,
            nameEn: foundMeta?.nameEn || targetSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            targetSlug,
            image: catImage,
            iconName: targetSlug.includes('watch') || targetSlug.includes('phone') || targetSlug.includes('electronics') ? 'Smartphone' : 'Shirt',
            products: items,
          });
          const unimported = items.filter((p) => !existingProductIds.has(p.id)).map((p) => p.id);
          setSelectedDetectedProductIds(new Set(unimported));
        } else {
          setSingleFetchError(`ক্যাটাগরি #${parsed.id}-তে কোনো প্রোডাক্ট পাওয়া যায়নি।`);
        }
      } else {
        const item = await fetchShopBaseSingleProduct(singleInput.trim(), profitMargin);
        if (item) {
          setSinglePreviewProduct(item);
        } else {
          setSingleFetchError('প্রোডাক্টটি পাওয়া যায়নি। সঠিক ShopBase লিংক (যেমন: https://shopbasebd.com/store/products/93/1 বা https://shopbasebd.com/store/sample/product/details/32846) অথবা আইডি দিন।');
        }
      }
    } catch (e) {
      setSingleFetchError('ডাটা ফেচ করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট সংযোগ বা লিংকটি পুনরায় চেক করুন।');
    } finally {
      setIsFetchingSingle(false);
    }
  };

  const handleImportDetectedCategory = () => {
    if (!detectedCategoryResult) return;
    
    setIsImportingDetectedCategory(true);
    setTimeout(() => {
      // 1. Check and add/update Category in local store
      const exists = siteCategories.some(
        (c) => (c.slug || '').trim().toLowerCase() === detectedCategoryResult.targetSlug.trim().toLowerCase()
      );
      
      if (!exists) {
        const newCat: Category = {
          id: detectedCategoryResult.targetSlug,
          nameBn: detectedCategoryResult.name,
          nameEn: detectedCategoryResult.nameEn,
          slug: detectedCategoryResult.targetSlug,
          iconName: detectedCategoryResult.iconName,
          image: detectedCategoryResult.image,
          itemCount: detectedCategoryResult.products.length,
          featured: true,
        };
        addCategory(newCat);
      }
      
      // 2. Import all products of that category
      const toImport = detectedCategoryResult.products.filter(
        (p) => !existingProductIds.has(p.id)
      );
      
      if (toImport.length > 0) {
        addMultipleProducts(toImport);
      }
      
      setIsImportingDetectedCategory(false);
      setDetectedCategoryResult(null);
      setSingleInput('');
    }, 400);
  };

  const handleImportSingle = () => {
    if (!singlePreviewProduct) return;
    addProduct(singlePreviewProduct);
    setSinglePreviewProduct(null);
    setSingleInput('');
  };

  // Example profit calculation based on current profitMargin
  const sampleWholesale = 500;
  const sampleCalc = calculateSellingPrice(sampleWholesale, profitMargin);

  return (
    <div className="space-y-6">
      {/* Reseller Account Connection Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  ShopBaseBD রিসেলার অ্যাকাউন্ট কানেকশন
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  সংযুক্ত ও সক্রিয় (Connected)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                এই অ্যাকাউন্টের মাধ্যমে আপনার ওয়েবসাইটের পণ্য ও কাস্টমারদের ড্রপশিপিং অর্ডার স্বয়ংক্রিয়ভাবে পরিচালিত হচ্ছে।
              </p>
            </div>
          </div>

          {/* Account Credentials Badge */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">রিসেলার মোবাইল / আইডি:</span>
              <span className="text-sm font-mono font-bold text-amber-400">{accountNumber}</span>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">পাসওয়ার্ড:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-bold text-slate-200">
                  {showPassword ? accountPassword : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <a
              href="https://shopbasebd.com/store/login"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto lg:ml-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>ShopBase ড্যাশবোর্ড</span>
            </a>
          </div>
        </div>

        {/* 1-Click Mass Sync All Products Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                স্বয়ংক্রিয় বাল্ক সিঙ্ক (Auto-Sync All Products):
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              এক ক্লিকে ShopBaseBD-এর সমস্ত ক্যাটাগরি স্ক্যান করে নতুন সকল পণ্য আপনার ওয়েবসাইটে যোগ করুন ({profitMargin}% লাভ সহ)।
            </p>
          </div>

          <button
            type="button"
            onClick={handleMassSyncAll}
            disabled={isMassSyncing}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 disabled:opacity-50 cursor-pointer shrink-0 transition-all active:scale-95"
          >
            {isMassSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                <span>
                  স্ক্যান চলছে: {massSyncProgress.currentCategory || 'ডাটা ফেচ হচ্ছে'} ({massSyncProgress.loadedCount}টি পণ্য প্রাপ্ত)...
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-yellow-300" />
                <span>সকল ShopBaseBD প্রোডাক্ট একসাথে অটো-ইমপোর্ট করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Mass Sync Progress Bar (if active) */}
        {isMassSyncing && (
          <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-bold">
                ক্যাটাগরি স্ক্যানিং: {massSyncProgress.currentCategory}
              </span>
              <span className="text-slate-300 font-mono font-bold">
                {massSyncProgress.loadedCount} টি প্রোডাক্ট প্রস্তুত
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-300 animate-pulse"
                style={{ width: `${Math.min(100, Math.max(15, (massSyncProgress.loadedCount / 500) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Alert */}
        {massSyncSuccessMsg && (
          <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{massSyncSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Profit Margin Controller Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>ShopBaseBD ড্রপশিপিং ও প্রাইসিং সিস্টেম</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              ShopBaseBD পণ্যের বিক্রয়মূল্য ও মার্জিন নির্ধারণ
            </h2>
            <p className="text-orange-100 text-sm mt-1 max-w-xl">
              ShopBaseBD থেকে পাইকারি মূল্যে পণ্য নিয়ে স্বয়ংক্রিয়ভাবে <strong className="text-white underline decoration-yellow-400 font-bold">{profitMargin}% লাভ</strong> যোগ করে আপনার ওয়ানরুফ মার্ট ওয়েবসাইটে বিক্রয়মূল্য সেট করা হচ্ছে।
            </p>
          </div>

          {/* Profit Margin Control Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-orange-100 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-yellow-300" />
                আপনার লাভের মার্জিন (% লাভ):
              </span>
              <span className="text-lg font-black text-yellow-300">{profitMargin}% লাভ</span>
            </div>

            {/* Margin Slider */}
            <input
              type="range"
              min="10"
              max="25"
              step="1"
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseInt(e.target.value, 10))}
              className="w-full accent-yellow-400 cursor-pointer h-2 bg-white/30 rounded-lg"
            />

            {/* Quick Preset Buttons (10% - 15% as requested!) */}
            <div className="flex items-center gap-1.5 mt-3">
              {[10, 12, 15, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProfitMargin(preset)}
                  className={`flex-1 text-xs py-1 rounded font-bold transition-all ${
                    profitMargin === preset
                      ? 'bg-yellow-400 text-neutral-900 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            {/* Live Calculation Example */}
            <div className="mt-3 pt-2 border-t border-white/15 text-[11px] text-orange-100 space-y-0.5">
              <div className="flex justify-between">
                <span>হোলসেল পাইকারি মূল্য:</span>
                <span>৳ {sampleWholesale}</span>
              </div>
              <div className="flex justify-between text-yellow-300">
                <span>আপনার নিট লাভ ({profitMargin}%):</span>
                <span>+৳ {sampleCalc.profitAmount}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-white/10 pt-1 mt-1">
                <span>ওয়েবসাইটে সেল রেট:</span>
                <span className="text-yellow-200">৳ {sampleCalc.sellingPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-orange-100">
          <div>
            সাইটে আপলোড করা শপবেইজ পণ্য: <strong className="text-white text-sm">{importedCount} টি</strong>
          </div>
          <div className="ml-auto text-yellow-200 font-medium">
            ✓ অটোমেটিক {profitMargin}% লাভ হিসাব সক্রিয়
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('curated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'curated'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>১-ক্লিকে টপ ২০+ প্রোডাক্ট ইমপোর্ট</span>
        </button>

        <button
          onClick={() => setActiveSubTab('category')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'category'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ক্যাটাগরি অনুযায়ী বাল্ক ইমপোর্ট</span>
        </button>

        <button
          onClick={() => setActiveSubTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'single'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>নির্দিষ্ট লিংক / প্রোডাক্ট আইডি দিয়ে</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ml-auto ${
            activeSubTab === 'guide'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>অর্ডার ও ডেলিভারি নির্দেশিকা</span>
        </button>
      </div>

      {/* ================= TAB 1: CURATED TOP PRODUCTS ================= */}
      {activeSubTab === 'curated' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 p-4 rounded-xl">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                ShopBaseBD এর সর্বাধিক বিক্রিত ভেরিফায়েড পণ্যসমূহ
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                পলো শার্ট, ড্রপসোল্ডার টিশার্ট, কাতুয়া, পাঞ্জাবি ও কম্বো সেটের বেস্ট কালেকশন (১৫% লাভসহ হিসাবকৃত)।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllCurated}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 font-semibold"
              >
                সব সিলেক্ট করুন
              </button>
              <button
                type="button"
                onClick={deselectAllCurated}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800"
              >
                আনসিলেক্ট
              </button>
              <button
                type="button"
                onClick={handleImportCurated}
                disabled={isImportingCurated || selectedCuratedIds.size === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50"
              >
                {isImportingCurated ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>আপলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>নির্বাচিত {selectedCuratedIds.size}টি প্রডাক্ট আপলোড করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid of Curated Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {curatedList.map((item, idx) => {
              const isAlreadyAdded = existingProductIds.has(item.id);
              const isSelected = selectedCuratedIds.has(item.id);
              const wholesale = item.wholesalePrice || 0;
              const profit = item.price - wholesale;

              return (
                <div
                  key={`curated-${item.id}-${idx}`}
                  onClick={() => !isAlreadyAdded && toggleCuratedSelection(item.id)}
                  className={`relative group bg-white dark:bg-neutral-900 border rounded-xl overflow-hidden p-3 transition-all cursor-pointer ${
                    isAlreadyAdded
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default opacity-85'
                      : isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  {/* Select Checkbox badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {isAlreadyAdded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow">
                        <Check className="w-3 h-3" /> আপলোড করা আছে
                      </span>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white'
                            : 'bg-white/80 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* SKU badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-[10px] font-mono bg-neutral-900/70 backdrop-blur-sm text-neutral-200 px-1.5 py-0.5 rounded">
                      {item.sku}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2.5">
                    <img
                      src={
                        item.images[0]?.includes('_L_') && item.images[0].endsWith('.jpg')
                          ? item.images[0].replace(/\.jpg$/i, '.jpeg')
                          : item.images[0] || ''
                      }
                      alt={item.titleBn}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('_L_')) {
                          target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                        } else {
                          target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                      {item.subcategory || item.category}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {item.titleBn}
                    </h4>

                    {/* Price Breakdown */}
                    <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] space-y-0.5">
                      <div className="flex justify-between text-neutral-500">
                        <span>হোলসেল মূল্য:</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">৳ {wholesale}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>আপনার লাভ ({profitMargin}%):</span>
                        <span>+৳ {profit}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="font-bold text-neutral-900 dark:text-white">বিক্রয়মূল্য:</span>
                        <div>
                          <span className="text-xs text-neutral-400 line-through mr-1">
                            ৳ {item.originalPrice}
                          </span>
                          <span className="text-sm font-black text-orange-600">
                            ৳ {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: BULK BY CATEGORY ================= */}
      {activeSubTab === 'category' && (
        <div className="space-y-6">
          {/* Category Selector Cards */}
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              ShopBaseBD ক্যাটাগরি বেছে নিন:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-500/20 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-1.5 flex items-center justify-center">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          // fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">ID: {cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Products Result */}
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-100 dark:bg-neutral-800/60 p-4 rounded-xl">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>ক্যাটাগরি: <strong className="text-orange-600">{selectedCategory.name}</strong></span>
                    <span className="text-xs text-neutral-500 font-normal">
                      ({categoryProducts.length} টি পণ্য পাওয়া গেছে)
                    </span>
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    প্রতিটি পণ্যে স্বয়ংক্রিয়ভাবে <strong className="text-orange-600 font-bold">{profitMargin}% লাভ</strong> যোগ করা হয়েছে।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const unimported = categoryProducts
                        .filter((p) => !existingProductIds.has(p.id))
                        .map((p) => p.id);
                      setSelectedCatProductIds(new Set(unimported));
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 font-semibold"
                  >
                    সব সিলেক্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCatProductIds(new Set())}
                    className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800"
                  >
                    আনসিলেক্ট
                  </button>
                  <button
                    type="button"
                    onClick={handleImportCategoryProducts}
                    disabled={isImportingCatProducts || selectedCatProductIds.size === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isImportingCatProducts ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>আপলোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>নির্বাচিত {selectedCatProductIds.size}টি আপলোড করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingCategoryProducts ? (
                <div className="py-16 text-center text-neutral-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
                  <p className="text-sm font-semibold">ShopBaseBD থেকে ডাটা লোড হচ্ছে...</p>
                </div>
              ) : categoryProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryProducts.map((item, idx) => {
                    const isAlreadyAdded = existingProductIds.has(item.id);
                    const isSelected = selectedCatProductIds.has(item.id);
                    const wholesale = item.wholesalePrice || 0;
                    const profit = item.price - wholesale;

                    return (
                      <div
                        key={`cat-${selectedCategory?.id || 'c'}-${item.id}-${idx}`}
                        onClick={() => !isAlreadyAdded && setSelectedCatProductIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        })}
                        className={`relative group bg-white dark:bg-neutral-900 border rounded-xl overflow-hidden p-3 transition-all cursor-pointer ${
                          isAlreadyAdded
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default opacity-85'
                            : isSelected
                            ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          {isAlreadyAdded ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow">
                              <Check className="w-3 h-3" /> আপলোড করা আছে
                            </span>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-white/80 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-600 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-2.5">
                          <img
                            src={
                              item.images[0]?.includes('_L_') && item.images[0].endsWith('.jpg')
                                ? item.images[0].replace(/\.jpg$/i, '.jpeg')
                                : item.images[0] || ''
                            }
                            alt={item.titleBn}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('_L_')) {
                                target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                              } else {
                                target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                            {item.titleBn}
                          </h4>

                          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] space-y-0.5">
                            <div className="flex justify-between text-neutral-500">
                              <span>হোলসেল মূল্য:</span>
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">৳ {wholesale}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-bold">
                              <span>লাভ ({profitMargin}%):</span>
                              <span>+৳ {profit}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1 border-t border-neutral-100 dark:border-neutral-800">
                              <span className="font-bold text-neutral-900 dark:text-white">বিক্রয়মূল্য:</span>
                              <div>
                                <span className="text-xs text-neutral-400 line-through mr-1">
                                  ৳ {item.originalPrice}
                                </span>
                                <span className="text-sm font-black text-orange-600">
                                  ৳ {item.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
                  <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    এই ক্যাটাগরিতে পণ্য লোড হচ্ছে অথবা সরাসরি লিংক দিয়ে আপলোড করতে পারবেন।
                  </p>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    ShopBaseBD-এর যে কোনো স্পেসিফিক প্রোডাক্ট লিংক নিয়ে 'নির্দিষ্ট লিংক / প্রোডাক্ট আইডি দিয়ে' ট্যাবে পেস্ট করলেই তা দ্রুত চলে আসবে।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SINGLE PRODUCT URL / ID ================= */}
      {activeSubTab === 'single' && (
        <div className="space-y-6 max-w-2xl mx-auto py-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600" />
                ShopBaseBD লিংক বা প্রোডাক্ট আইডি দিয়ে ফেচ করুন
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                যেমন: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-orange-600 font-mono">https://shopbasebd.com/store/sample/product/details/32846</code> অথবা শুধু আইডি: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-orange-600 font-mono">32950</code>
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="https://shopbasebd.com/store/sample/product/details/32846"
                className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
              <button
                type="button"
                onClick={handleFetchSingle}
                disabled={isFetchingSingle || !singleInput.trim()}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isFetchingSingle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>খোঁজা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>ফেচ করুন</span>
                  </>
                )}
              </button>
            </div>

            {singleFetchError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{singleFetchError}</span>
              </div>
            )}
          </div>

          {/* Category Preview Card */}
          {detectedCategoryResult && (
            <div className="bg-white dark:bg-neutral-900 border-2 border-orange-500/40 p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ক্যাটাগরি সফলভাবে পাওয়া গেছে!</span>
                </div>
                <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600">
                  ID: {detectedCategoryResult.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border flex items-center justify-center p-4">
                  <img
                    src={detectedCategoryResult.image}
                    alt={detectedCategoryResult.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300 text-xs font-bold rounded-full">
                    <Layers className="w-3.5 h-3.5" />
                    <span>ShopBaseBD ক্যাটাগরি</span>
                  </span>
                  
                  <h4 className="text-lg font-black text-neutral-900 dark:text-white">
                    {detectedCategoryResult.name} ({detectedCategoryResult.nameEn})
                  </h4>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    এই ক্যাটাগরির অধীনে মোট <strong className="text-orange-600 font-bold">{detectedCategoryResult.products.length}টি পণ্য</strong> পাওয়া গেছে। নিচের বাটনে ক্লিক করলেই এই ক্যাটাগরি তৈরি/আপডেট হয়ে যাবে এবং ক্যাটাগরির ভেতরের সমস্ত প্রোডাক্ট লাভসহ OneRoof Mart সাইটে একসাথে বাল্ক আপলোড হয়ে যাবে।
                  </p>

                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-200 dark:border-orange-800/40 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">ক্যাটাগরি আইডি:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{detectedCategoryResult.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">ক্যাটাগরি স্ল্যাগ (Slug):</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{detectedCategoryResult.targetSlug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">সেট করা প্রফিট মার্জিন:</span>
                      <span className="font-bold text-emerald-600">{profitMargin}% লাভ</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportDetectedCategory}
                    disabled={isImportingDetectedCategory}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isImportingDetectedCategory ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>আপলোড ও ক্যাটাগরি তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>ক্যাটাগরি তৈরি করে সকল {detectedCategoryResult.products.length}টি প্রোডাক্ট আপলোড করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Card */}
          {singlePreviewProduct && (
            <div className="bg-white dark:bg-neutral-900 border-2 border-orange-500/40 p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>প্রোডাক্ট সফলভাবে পাওয়া গেছে!</span>
                </div>
                <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600">
                  {singlePreviewProduct.sku}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border">
                  <img
                    src={singlePreviewProduct.images[0]}
                    alt={singlePreviewProduct.titleBn}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                    {singlePreviewProduct.titleBn}
                  </h4>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 whitespace-pre-line">
                    {singlePreviewProduct.descriptionBn}
                  </p>

                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-200 dark:border-orange-800/40 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">হোলসেল পাইকারি দর:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        ৳ {singlePreviewProduct.wholesalePrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>আপনার লাভ ({profitMargin}%):</span>
                      <span>+৳ {(singlePreviewProduct.price - (singlePreviewProduct.wholesalePrice || 0))}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-orange-200 dark:border-orange-800/40">
                      <span className="font-bold text-neutral-900 dark:text-white">বিক্রয়মূল্য:</span>
                      <div>
                        <span className="text-xs text-neutral-400 line-through mr-1.5">
                          ৳ {singlePreviewProduct.originalPrice}
                        </span>
                        <span className="text-base font-black text-orange-600">
                          ৳ {singlePreviewProduct.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportSingle}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>এই প্রডাক্ট OneRoof Mart সাইটে আপলোড করুন (১৫% লাভসহ)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: DROPSHIPPING WORKFLOW GUIDE ================= */}
      {activeSubTab === 'guide' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-orange-600" />
              ShopBaseBD রিসেলিং ও ড্রপশিপিং কীভাবে কাজ করে?
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              কোনো পণ্য আগে থেকে কিনে গুদামজাত করতে হবে না। পণ্য বিক্রি হওয়ার পরই শুধুমাত্র অর্ডার করবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black flex items-center justify-center text-sm">
                ১
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                প্রোডাক্ট আপলোড
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                এই পেজ থেকে ১৫% লাভে আপনার পছন্দের প্রোডাক্টগুলো ১-ক্লিকে OneRoof Mart সাইটে আপলোড করুন।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                ২
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                কাস্টমার অর্ডার গ্রহণ
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                কাস্টমার আপনার সাইট থেকে সম্পূর্ণ মূল্যে (যেমন: ৳ ৩৩৪) অর্ডার করবে ও ঠিকানা দেবে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-sm">
                ৩
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                ShopBaseBD তে প্লেস
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                ShopBaseBD অ্যাপ/সাইটে লগইন করে পাইকারি মূল্যে (৳ ২৯০) কাস্টমারের ঠিকানায় পার্সেল অর্ডার করুন।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
                ৪
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                ১৫% লাভ অ্যাকাউন্টে
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                ShopBaseBD আপনার শপের নামে কাস্টমারকে পণ্য পৌঁছে দেবে এবং বাকি লাভ আপনার বিকাশ/ব্যাংকে পাঠাবে।
              </p>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
            <h5 className="font-bold text-neutral-900 dark:text-white">জরুরি লিঙ্ক ও যোগাযোগ:</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>অফিসিয়াল ওয়েবসাইট: <a href="https://shopbasebd.com" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline">https://shopbasebd.com</a></li>
              <li>রিসেলার রেজিস্ট্রেশন লিঙ্ক: <a href="https://shopbasebd.com/store/registration" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline">shopbasebd.com/store/registration</a></li>
              <li>ShopBaseBD হেল্পলাইন: 09647300100</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
