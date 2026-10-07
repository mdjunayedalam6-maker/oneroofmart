import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Package, 
  Phone, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Order } from '../../types';
import { 
  DEFAULT_SHOPBASE_ACCOUNT, 
  generateShopBaseDropshipOrderSlip, 
  getShopBaseWhatsAppDispatchUrl 
} from '../../services/shopbaseService';

interface ShopBaseDropshipModalProps {
  order: Order | null;
  onClose: () => void;
  formatPrice: (amount: number) => string;
  onMarkForwarded: (orderId: string) => void;
  resellerAccount?: string;
}

export const ShopBaseDropshipModal: React.FC<ShopBaseDropshipModalProps> = ({
  order,
  onClose,
  formatPrice,
  onMarkForwarded,
  resellerAccount = DEFAULT_SHOPBASE_ACCOUNT,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  // Calculate estimated wholesale & profit
  const wholesaleCost = Math.round(order.subtotal / 1.15);
  const estimatedProfit = Math.max(0, order.subtotal - wholesaleCost);

  const orderSlipText = generateShopBaseDropshipOrderSlip(order, resellerAccount);
  const whatsappUrl = getShopBaseWhatsAppDispatchUrl(order, resellerAccount);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderSlipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleForwardAndMark = () => {
    onMarkForwarded(order.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Truck className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">ShopBaseBD অটো ড্রপশিপিং ফরোয়ার্ডার</h3>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-bold rounded-full border border-emerald-400/40">
                  অর্ডার #{order.id}
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                রিসেলার অ্যাকাউন্ট: <strong className="text-yellow-300 font-mono">{resellerAccount}</strong> (কানেক্টেড)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-200 text-xs">
          {/* Profit Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                আপনার নিশ্চিত লাভ (১৫% রিসেলার মার্জিন):
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
                +{formatPrice(estimatedProfit)}
              </div>
              <div className="text-[11px] text-slate-400">
                কাস্টমার পার্সেল রিসিভ করলে এই লাভ আপনার ShopBase অ্যাকাউন্টে যোগ হবে।
              </div>
            </div>

            <div className="text-right border-l border-slate-800 pl-4 space-y-1">
              <div className="text-slate-400">
                কাস্টমার থেকে COD আদায়: <strong className="text-white">{formatPrice(order.total)}</strong>
              </div>
              <div className="text-slate-400">
                পাইকারি হোলসেল খরচ: <strong className="text-amber-300">{formatPrice(wholesaleCost)}</strong>
              </div>
            </div>
          </div>

          {/* Customer Shipping Destination Details */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5" />
              <span>কাস্টমারের ডেলিভারি ঠিকানা (ShopBaseBD ড্রপশিপে যাবে):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">গ্রাহকের নাম:</span>
                <span className="text-white font-bold text-sm">{order.shippingAddress.fullName}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">মোবাইল নম্বর:</span>
                <span className="text-amber-400 font-mono font-bold text-sm">{order.shippingAddress.phone}</span>
              </div>
              <div className="sm:col-span-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">সম্পূর্ণ ঠিকানা:</span>
                <span className="text-slate-200 font-medium">
                  {order.shippingAddress.address}, {order.shippingAddress.district}, {order.shippingAddress.division}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Products to Deliver */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-2 text-xs">
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>ডেলিভারির জন্য পণ্য তালিকা ({order.items.length} টি):</span>
            </h4>

            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <img
                    src={it.image}
                    alt={it.title}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate text-xs">{it.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {it.selectedSize && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
                          সাইজ: {it.selectedSize}
                        </span>
                      )}
                      {it.selectedColor && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                          কালার: {it.selectedColor}
                        </span>
                      )}
                      <span>পরিমাণ: <strong className="text-white">{it.quantity} টি</strong></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-400">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formatted Booking Slip Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">ড্রপশিপ পার্সেল স্লিপ (রেডি টেক্সট):</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'কপি হয়েছে!' : 'স্লিপ কপি করুন'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {orderSlipText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="https://shopbasebd.com/store/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ShopBaseBD লগইন</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ShopBaseBD WhatsApp এ সরাসরি অর্ডার পাঠান</span>
            </a>
          </div>

          <button
            type="button"
            onClick={handleForwardAndMark}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer ml-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>অর্ডার স্ট্যাটাস: 'ShopBase এ ফরওয়ার্ডকৃত' মার্ক করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
