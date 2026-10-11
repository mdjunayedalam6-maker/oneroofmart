import React from 'react';
import { Heart, Star, Eye, Zap, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

export const ProductCard: React.FC<{ product: Product; layout?: 'grid' | 'list' }> = ({
  product,
  layout = 'grid',
}) => {
  const {
    language,
    t,
    viewProductDetails,
    toggleWishlist,
    isInWishlist,
    formatPrice,
  } = useApp();

  const isSaved = isInWishlist(product.id);
  const title = language === 'bn' ? product.titleBn : product.titleEn;
  const displayBrand = (!product.brand || product.brand.toLowerCase().includes('shopbase') || product.brand.toLowerCase().includes('oneroof')) 
    ? (language === 'bn' ? 'বাংলা বাজার' : 'Bangla Bazar') 
    : product.brand;

  // Robust image handling: normalize ShopBaseBD image extensions and provide fallback
  const initialImage = React.useMemo(() => {
    let img = product.images?.[0] || '';
    if (typeof img === 'string' && img.includes('shopbasebd.com') && img.includes('_L_') && img.endsWith('.jpg')) {
      img = img.replace(/\.jpg$/i, '.jpeg');
    }
    return img;
  }, [product.images]);

  const [currentImg, setCurrentImg] = React.useState<string>(initialImage);

  React.useEffect(() => {
    setCurrentImg(initialImage);
  }, [initialImage]);

  const handleImageError = () => {
    // If large image failed, fallback to small thumbnail (_S_...jpg)
    if (currentImg && currentImg.includes('_L_')) {
      const fallbackSm = currentImg.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
      setCurrentImg(fallbackSm);
      return;
    }
    // If that fails, try secondary image if available
    if (product.images?.[1] && currentImg !== product.images[1]) {
      let sec = product.images[1];
      if (sec.includes('_L_') && sec.endsWith('.jpg')) {
        sec = sec.replace(/\.jpg$/i, '.jpeg');
      }
      setCurrentImg(sec);
      return;
    }
    // Default fallback placeholder
    setCurrentImg('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80');
  };

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-amber-500/60 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center group">
        <div 
          onClick={() => viewProductDetails(product)}
          className="relative w-full sm:w-48 h-48 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
        >
          <img
            src={currentImg}
            alt={title}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPercentage && (
              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                -{product.discountPercentage}%
              </span>
            )}
            {product.isFreeShipping && (
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                ফ্রি ডেলিভারি
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-wider text-[#003882] uppercase bg-blue-50 px-2 py-0.5 rounded">
                {displayBrand}
              </span>
              <div className="flex items-center text-amber-500 text-xs font-bold gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount})</span>
              </div>
            </div>

            <h3
              onClick={() => viewProductDetails(product)}
              className="text-sm sm:text-base font-semibold text-slate-800 hover:text-[#003882] cursor-pointer line-clamp-2 transition-colors mb-2"
            >
              {title}
            </h3>

            <p className="text-xs text-slate-500 line-clamp-2 hidden sm:block">
              {language === 'bn' ? product.descriptionBn : product.descriptionEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
            <div>
              <div className="text-lg font-black text-slate-900">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                  isSaved
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title={t.wishlist}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  viewProductDetails(product);
                }}
                className="py-2.5 px-4 bg-slate-900 hover:bg-[#003882] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              >
                <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => viewProductDetails(product)}
      className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 hover:border-emerald-500/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative cursor-pointer"
    >
      <div className="relative w-full pt-[100%] rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img
          src={currentImg}
          alt={title}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.discountPercentage && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-slate-950" />
              FLASH
            </span>
          )}
          {product.isFreeShipping && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
              ফ্রি ডেলিভারি
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 z-20 ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/85 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
          title={t.wishlist}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block z-10">
          <div
            className="w-full py-2 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Quick View'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5 gap-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-bold text-[#003882] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] shrink-0">
                {displayBrand}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {product.sku ? product.sku.toUpperCase() : `SBP-${product.id.replace(/\D/g, '') || product.id.toUpperCase()}`}
              </span>
            </div>
            <div className="flex items-center text-amber-500 font-bold gap-1 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#003882] line-clamp-2 transition-colors min-h-[2.5rem] leading-snug"
          >
            {title}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-[#003882] group-hover:text-emerald-600 flex items-center gap-0.5 transition-colors">
              <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
