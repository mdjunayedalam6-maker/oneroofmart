import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';

export const TrackOrderModal: React.FC = () => {
  const {
    isTrackOrderModalOpen,
    setIsTrackOrderModalOpen,
    trackingQuery,
    setTrackingQuery,
    orders,
    userOrders,
    formatPrice,
    language,
    setCurrentPage,
    siteSettings
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync with global tracking query when opened
  useEffect(() => {
    if (isTrackOrderModalOpen) {
      if (trackingQuery) {
        setInputVal(trackingQuery);
        executeSearch(trackingQuery);
      } else if (userOrders.length > 0) {
        // default to user's latest order if they have placed one
        setSearchedOrder(userOrders[0]);
        setInputVal(userOrders[0].trackingNumber || userOrders[0].id);
      } else {
        setSearchedOrder(null);
        setInputVal('');
      }
    } else {
      setHasSearched(false);
    }
  }, [isTrackOrderModalOpen, trackingQuery]);

  if (!isTrackOrderModalOpen) return null;

  const executeSearch = (q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    const cleanDigits = query.replace(/[^0-9]/g, '');

    const found = orders.find((o) => {
      const matchTrack = o.trackingNumber?.toLowerCase() === query;
      const matchId = o.id.toLowerCase() === query;
      const phoneDigits = (o.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 7 && phoneDigits.includes(cleanDigits);
      return matchTrack || matchId || matchPhone;
    });

    setSearchedOrder(found || null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputVal);
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'placed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'out_for_delivery': return 4;
      case 'delivered': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = searchedOrder ? getStatusStep(searchedOrder.status) : 1;

  const steps = [
    {
      step: 1,
      titleBn: 'অর্ডার গৃহীত',
      titleEn: 'Order Placed',
      descBn: 'অর্ডার সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে',
      descEn: 'Order received into our system',
    },
    {
      step: 2,
      titleBn: 'প্রক্রিয়াকরণ',
      titleEn: 'Processing',
      descBn: 'পণ্য কোয়ালিটি চেক ও প্যাকেজিং চলছে',
      descEn: 'Packaging and quality check in progress',
    },
    {
      step: 3,
      titleBn: 'কুরিয়ারে হস্তান্তর',
      titleEn: 'In Transit',
      descBn: 'কুরিয়ার পার্টনারের মাধ্যমে পাঠানো হয়েছে',
      descEn: 'Dispatched via trusted courier partner',
    },
    {
      step: 4,
      titleBn: 'ডেলিভারির পথে',
      titleEn: 'Out for Delivery',
      descBn: 'ডেলিভারি রাইডার আপনার ঠিকানায় আসছে',
      descEn: 'Rider is on the way to your address',
    },
    {
      step: 5,
      titleBn: 'সফল ডেলিভারি',
      titleEn: 'Delivered',
      descBn: 'পণ্যটি আপনার ঠিকানায় পৌঁছে দেওয়া হয়েছে',
      descEn: 'Delivered successfully at your doorstep',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#003882] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={() => {
              setIsTrackOrderModalOpen(false);
              setTrackingQuery('');
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                {language === 'bn' ? 'লাইভ পার্সেল ট্র্যাকিং' : 'Live Parcel Tracking'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'bn' 
                  ? 'আপনার ট্র্যাকিং নম্বর, অর্ডার আইডি অথবা মোবাইল নম্বর দিয়ে সার্চ করুন' 
                  : 'Search by Tracking Number, Order ID, or Phone Number'}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: TRK-BD-90421 বা 01929637253...' : 'e.g. TRK-BD-90421 or 01929637253...'}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-300 focus:placeholder:text-slate-400 rounded-xl border border-white/20 focus:border-amber-400 text-xs sm:text-sm font-medium focus:outline-none transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
            >
              {language === 'bn' ? 'ট্র্যাক করুন' : 'Track'}
            </button>
          </form>

          {/* Quick suggestions of user's own orders if available */}
          {userOrders.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-300 pt-1 no-scrollbar">
              <span className="shrink-0 text-slate-400 font-medium">
                {language === 'bn' ? 'আপনার সাম্প্রতিক অর্ডার:' : 'Your Recent:'}
              </span>
              {userOrders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setInputVal(o.trackingNumber);
                    executeSearch(o.trackingNumber);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 font-mono text-amber-300 text-[10px] shrink-0 transition-colors"
                >
                  {o.trackingNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {searchedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Order Meta Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {language === 'bn' ? 'অর্ডার আইডি:' : 'Order ID:'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {searchedOrder.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{searchedOrder.date}</span>
                    <span>•</span>
                    <span className="font-semibold capitalize text-emerald-700">
                      {searchedOrder.shippingAddress.deliverySpeed === 'express' ? '⚡ এক্সপ্রেস ডেলিভারি' : 'রেগুলার ডেলিভারি'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'bn' ? 'ট্র্যাকিং নম্বর' : 'Tracking #'}
                    </div>
                    <div className="font-mono font-black text-amber-600 text-sm">
                      {searchedOrder.trackingNumber}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    searchedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : searchedOrder.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {searchedOrder.status === 'placed' && (language === 'bn' ? 'অর্ডার গ্রহণ' : 'Placed')}
                    {searchedOrder.status === 'processing' && (language === 'bn' ? 'প্যাকেজিং' : 'Processing')}
                    {searchedOrder.status === 'shipped' && (language === 'bn' ? 'ট্রানজিট' : 'Shipped')}
                    {searchedOrder.status === 'out_for_delivery' && (language === 'bn' ? 'ডেলিভারির পথে' : 'Out for Delivery')}
                    {searchedOrder.status === 'delivered' && (language === 'bn' ? 'ডেলিভার্ড' : 'Delivered')}
                    {searchedOrder.status === 'cancelled' && (language === 'bn' ? 'বাতিল' : 'Cancelled')}
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {searchedOrder.status === 'cancelled' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>
                    {language === 'bn' 
                      ? 'এই অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে কাস্টমার সাপোর্টে যোগাযোগ করুন।' 
                      : 'This order has been cancelled. Please contact customer support for assistance.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'bn' ? 'ডেলিভারি অগ্রগতি' : 'Delivery Progress'}
                  </h4>

                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {steps.map((s) => {
                      const isCompleted = currentStep >= s.step;
                      const isCurrent = currentStep === s.step;

                      return (
                        <div key={s.step} className="relative flex items-start gap-3.5 group">
                          {/* Circle indicator */}
                          <div
                            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <span>{s.step}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5
                                className={`text-sm font-black ${
                                  isCurrent
                                    ? 'text-amber-600'
                                    : isCompleted
                                    ? 'text-slate-900'
                                    : 'text-slate-400'
                                }`}
                              >
                                {language === 'bn' ? s.titleBn : s.titleEn}
                              </h5>
                              {isCurrent && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                  {language === 'bn' ? 'চলমান ধাপ' : 'Active'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {language === 'bn' ? s.descBn : s.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address & Payment Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}</span>
                  </div>
                  <p className="text-slate-900 font-semibold">{searchedOrder.shippingAddress.fullName}</p>
                  <p className="text-slate-600">{searchedOrder.shippingAddress.address}</p>
                  <p className="text-slate-600">
                    {searchedOrder.shippingAddress.district}, {searchedOrder.shippingAddress.division}
                  </p>
                  <p className="text-slate-700 font-mono">{searchedOrder.shippingAddress.phone}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'পেমেন্ট ও মূল্য বিবরণী' : 'Payment & Summary'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span>
                    <span className="font-bold uppercase text-slate-900">{searchedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'bn' ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Status:'}</span>
                    <span className={`font-bold capitalize ${searchedOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {searchedOrder.paymentStatus === 'paid' ? 'পরিশোধিত (Paid)' : 'বাকি (Cash on Delivery)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                    <span>{language === 'bn' ? 'মোট প্রদেয়:' : 'Total Amount:'}</span>
                    <span className="text-emerald-700">{formatPrice(searchedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'bn' ? `অর্ডারের পণ্যসমূহ (${searchedOrder.items.length})` : `Order Items (${searchedOrder.items.length})`}
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center gap-3 bg-white hover:bg-slate-50 transition-colors">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h6 className="text-xs font-bold text-slate-800 truncate">
                            {item.title}
                          </h6>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-300">
                            SKU: {item.sku || `SBP-${item.productId.replace(/\D/g, '') || item.productId}`}
                          </span>
                        </div>
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
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatPrice(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            /* No Results Found */
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-800">
                {language === 'bn' ? 'কোনো অর্ডার খুঁজে পাওয়া যায়নি' : 'No Order Found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'অনুগ্রহ করে সঠিক ট্র্যাকিং নম্বর (যেমন TRK-BD-XXXXX) অথবা অর্ডার প্রদানের সময় ব্যবহৃত মোবাইল নম্বর দিয়ে আবার চেষ্টা করুন।'
                  : 'Please verify the Tracking Number or the phone number provided during checkout and try again.'}
              </p>
              {userOrders.length > 0 && (
                <button
                  onClick={() => {
                    setSearchedOrder(userOrders[0]);
                    setInputVal(userOrders[0].trackingNumber);
                  }}
                  className="text-xs font-bold text-[#003882] hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'আপনার সাম্প্রতিক অর্ডারটি দেখুন' : 'View your recent order'}
                </button>
              )}
            </div>
          ) : (
            /* Initial State */
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003882] flex items-center justify-center mx-auto border border-blue-100">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-slate-800">
                {language === 'bn' ? 'পার্সেল ট্র্যাকিং শুরু করতে সার্চ করুন' : 'Enter details to track package'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {language === 'bn'
                  ? 'উপরে আপনার ট্র্যাকিং নম্বর অথবা মোবাইল নম্বর লিখে ট্র্যাক বাটনে ক্লিক করুন।'
                  : 'Input your tracking ID or phone number in the search bar above to see live updates.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'bn' ? 'সহায়তা প্রয়োজন? কল করুন: ' : 'Need help? Call: '}
              <strong className="text-slate-900 font-mono">{siteSettings.hotlineNumber || '01929637253'}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setIsTrackOrderModalOpen(false);
              setCurrentPage('shop');
            }}
            className="text-xs font-bold text-[#003882] hover:text-[#FF6B00] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
