import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  ShieldCheck, 
  Truck, 
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartShippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    language,
    t,
    formatPrice,
    setCurrentPage,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCode('');
    }
  };

  const freeShippingThreshold = 2000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">{t.emptyCart}</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {t.emptyCartDesc}
        </p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="mt-4 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
        >
          <span>{t.startShopping}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'আপনার শপিং কার্ট' : 'Shopping Cart'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {cart.length} {language === 'bn' ? 'টি আইটেম সিলেক্ট করা আছে' : 'items currently selected'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কার্ট খালি করুন' : 'Clear Cart'}</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            {remainingForFreeShipping === 0
              ? (language === 'bn' ? 'অভিনন্দন! আপনি সমগ্র বাংলাদেশে ফ্রি ডেলিভারি পাচ্ছেন' : 'Congratulations! You unlocked Free Delivery across Bangladesh')
              : (language === 'bn' ? `আর মাত্র ${formatPrice(remainingForFreeShipping)} টাকার কেনাকাটা করলেই ফ্রি ডেলিভারি!` : `Add ${formatPrice(remainingForFreeShipping)} more to get Free Delivery!`)}
          </span>
          <span>{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* 2-Column Layout: Left Cart Items, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items Table/List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {cart.map((item) => {
              const title = language === 'bn' ? item.product.titleBn : item.product.titleEn;
              return (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <img
                    src={
                      (item.selectedImage || item.product?.images?.[0])?.includes('_L_') && (item.selectedImage || item.product?.images?.[0]).endsWith('.jpg')
                        ? (item.selectedImage || item.product?.images?.[0]).replace(/\.jpg$/i, '.jpeg')
                        : item.selectedImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
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
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.product.brand}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 mt-1">
                      {title}
                    </h3>
                    
                    {/* Selected Variants Badges (Size, Color, etc.) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                      {item.selectedSize && (
                        <span className="inline-flex items-center text-[11px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
                          সাইজ: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="inline-flex items-center text-[11px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                          কালার: {item.selectedColor}
                        </span>
                      )}
                      {item.selectedVariant && Object.entries(item.selectedVariant).filter(([k]) => k.toLowerCase() !== 'size' && k.toLowerCase() !== 'color').map(([k, v]) => (
                        <span key={k} className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-1">
                      {formatPrice(item.product.price)} / পিস
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-base font-black text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('shop')}
              className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
              {t.orderSummary}
            </h2>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'কুপন / ডিসকাউন্ট কোড' : 'Promo Code'}</span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-900">{appliedCoupon.code}</span>
                    <p className="text-[11px] text-amber-700">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="BANGLABAZAR10 / EID500"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </form>
              )}

              {couponMsg && (
                <div className={`text-[11px] font-medium ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {couponMsg.text}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>{t.discount}</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>{t.shipping}</span>
                <span className="font-bold text-slate-800">
                  {cartShippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-xs">
                      {language === 'bn' ? 'ফ্রি' : 'FREE'}
                    </span>
                  ) : (
                    formatPrice(cartShippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>{t.total}</span>
                <span className="text-[#003882] font-black">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full py-4 theme-btn-buy theme-shimmer-effect text-white font-black rounded-2xl text-base transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>{t.proceedCheckout}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Trust badge info */}
            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? '100% নিরাপদ ও সুরক্ষিত পেমেন্ট' : '100% Safe & Secure Checkout'}</span>
              </div>
              <p>{language === 'bn' ? 'বিকাশ, নগদ বা ক্যাশ অন ডেলিভারি সাপোর্ট' : 'bKash, Nagad, Card or Cash on Delivery'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    formatPrice,
    language,
    t,
    setCurrentPage,
  } = useApp();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#0A2540] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">
              {language === 'bn' ? 'আপনার শপিং কার্ট' : 'Shopping Cart'} ({cart.length})
            </span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">{t.emptyCart}</h3>
            <p className="text-xs text-slate-400 mt-1">{t.emptyCartDesc}</p>
            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                setCurrentPage('shop');
              }}
              className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {cart.map((item) => {
              const title = language === 'bn' ? item.product.titleBn : item.product.titleEn;
              return (
                <div key={item.product.id} className="py-3 flex items-center gap-3">
                  <img
                    src={
                      (item.selectedImage || item.product?.images?.[0])?.includes('_L_') && (item.selectedImage || item.product?.images?.[0]).endsWith('.jpg')
                        ? (item.selectedImage || item.product?.images?.[0]).replace(/\.jpg$/i, '.jpeg')
                        : item.selectedImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
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
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{title}</h4>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {item.selectedSize && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                          সাইজ: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100">
                          কালার: {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-xs">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-slate-800 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span>{t.subtotal}:</span>
              <span className="text-emerald-700 text-base">{formatPrice(cartSubtotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCurrentPage('cart');
                }}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs text-center transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'কার্ট ভিউ' : 'View Cart'}
              </button>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setCurrentPage('checkout');
                }}
                className="py-2.5 px-3 theme-btn-buy text-white font-black rounded-xl text-xs text-center transition-all shadow-md cursor-pointer"
              >
                {t.proceedCheckout}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
