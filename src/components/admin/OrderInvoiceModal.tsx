import React from 'react';
import { X, Printer, CheckCircle2, Clock, Truck, Package, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  const { formatPrice, language } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      }
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              {language === 'bn' ? `অর্ডার ইনভয়েস: ${order.id}` : `Order Invoice: ${order.id}`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="invoice-sheet">
          {/* Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xl font-black text-[#003882]">
                One<span className="text-[#FF6B00]">Roof</span> Mart
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">সবকিছু এক ছাদের নিচে</div>
              <div className="text-[11px] text-slate-400 mt-1">
                হটলাইন: 16443 | support@oneroofmart.com.bd
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-sm font-bold text-slate-900">ইনভয়েস নং: {order.id}</div>
              <div className="text-xs text-slate-500">তারিখ: {order.date}</div>
              <div className="text-xs text-slate-500 font-mono">ট্র্যাকিং: {order.trackingNumber}</div>
              <div className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                স্ট্যাটাস: {order.status}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                গ্রাহকের তথ্য (Customer Details):
              </span>
              <div className="font-bold text-slate-800 text-sm">{order.shippingAddress.fullName}</div>
              <div className="text-slate-600 font-mono mt-0.5">ফোন: {order.shippingAddress.phone}</div>
              <div className="text-slate-600 mt-1">{order.shippingAddress.address}</div>
              <div className="text-slate-600 font-medium">{order.shippingAddress.district}, {order.shippingAddress.division}</div>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                পেমেন্ট ও ডেলিভারি মোড:
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold uppercase text-slate-800">
                  {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : order.paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  পেমেন্ট অবস্থা: {order.paymentStatus === 'paid' ? 'পরিশোধিত (Paid)' : 'পরিশোধ বাকি (Pending)'}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1.5">
                ডেলিভারি ধরন: {order.shippingAddress.deliverySpeed === 'express' ? 'এক্সপ্রেস ডেলিভারি (Express)' : 'রেগুলার ডেলিভারি (Regular)'}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                  <th className="py-2 px-1">পণ্য</th>
                  <th className="py-2 px-2 text-center">পরিমাণ</th>
                  <th className="py-2 px-2 text-right">একক মূল্য</th>
                  <th className="py-2 px-2 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-1 flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800">{item.title}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                            SKU: {item.sku || `SBP-${item.productId.replace(/\D/g, '') || item.productId}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
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
                          {item.variant && Object.entries(item.variant).filter(([k]) => k.toLowerCase() !== 'size' && k.toLowerCase() !== 'color').map(([k, v]) => (
                            <span key={k} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-600">{formatPrice(item.price)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>সাবটোটাল (Subtotal):</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ (Shipping Fee):</span>
              <span>{order.shippingFee === 0 ? 'ফ্রি (Free)' : formatPrice(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>কুপন ছাড় (Discount):</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>সর্বমোট প্রদেয় (Total Payable):</span>
              <span className="text-[#003882] text-base">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            OneRoof Mart মার্কেটপ্লেস বেছে নেওয়ার জন্য ধন্যবাদ! যেকোনো অনুসন্ধানে 16443 কল করুন।
          </div>
        </div>
      </div>
    </div>
  );
};
