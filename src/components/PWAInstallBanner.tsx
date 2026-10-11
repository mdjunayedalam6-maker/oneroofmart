import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { safeSessionStorage } from '../utils/safeStorage';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Check if previously dismissed in session
  useEffect(() => {
    const isDismissed = safeSessionStorage.getItem('pwa_banner_dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    safeSessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Do not show if already installed as PWA or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  // Only show if installable on Chromium/Android/Desktop OR if on iOS device
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await install();
    }
  };

  return (
    <>
      {/* Floating Prompt Banner */}
      <div className="fixed bottom-18 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-[0_10px_35px_rgba(0,56,130,0.18)] border border-slate-200/90 flex items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden shadow-sm">
              <img
                src="/pwa-192x192.png"
                alt="বাংলা বাজার (Bangla Bazar) App Logo"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {language === 'bn' ? 'বাংলা বাজার অ্যাপ' : 'Bangla Bazar Mobile App'}
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Fast & Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {language === 'bn'
                  ? 'দ্রুত কেনাকাটায় ফোনে ইনস্টল করুন'
                  : 'Install on your home screen for quick shopping'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-[#003580] hover:bg-[#002860] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img src="/pwa-192x192.png" alt="বাংলা বাজার (Bangla Bazar)" className="w-10 h-10 rounded-xl object-cover shadow-xs" />
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'bn' ? 'iPhone / iPad-এ অ্যাপ ইনস্টল' : 'Install on iPhone / iPad'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {language === 'bn' ? '১. শেয়ার বাটন চাপুন' : '1. Tap the Share button'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'Safari ব্রাউজারের নিচে বা উপরের বার থেকে শেয়ার (Share) আইকন চাপুন।'
                      : 'Tap the Share icon in the Safari toolbar.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {language === 'bn' ? '২. হোম স্ক্রিনে যোগ করুন' : '2. Add to Home Screen'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'তালিকায় স্ক্রোল করে "Add to Home Screen" অপশনে ট্যাপ করুন।'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {language === 'bn' ? '৩. ইনস্টল সম্পন্ন' : '3. Complete Install'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'উপরের ডানে "Add" চাপলেই অ্যাপটি আপনার ফোনে ইনস্টল হয়ে যাবে।'
                      : 'Tap "Add" at the top right to complete.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-xl bg-[#003580] py-2.5 text-xs font-bold text-white hover:bg-[#002860] transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Got it / Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
