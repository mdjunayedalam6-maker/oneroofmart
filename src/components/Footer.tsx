import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ArrowRight,
  Lock,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Download,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Footer: React.FC = () => {
  const { 
    language, 
    t, 
    setCurrentPage, 
    setFilterState,
    isAdminAuthenticated,
    setIsAdminModalOpen,
    siteSettings,
    currentUser,
    isUserAdmin,
    loginAdmin
  } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <footer className="bg-[#0A2540] text-white pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Brand Info */}
          <div className="flex flex-col items-center text-center space-y-4">
            <BrandLogo onClick={() => setCurrentPage('home')} size="md" textColor="light" />

            <p className="text-xs text-slate-300/90 leading-relaxed max-w-md">
              {language === 'bn'
                ? 'বাংলা বাজার — সারা বাংলাদেশ অনলাইন মার্কেট। ১০০% আসল পণ্যের নিশ্চয়তা ও দ্রুততম ক্যাশ অন ডেলিভারিতে আপনার প্রয়োজনীয় সবকিছু এক ঠিকানায়।'
                : 'Bangla Bazar — Nationwide online marketplace across Bangladesh, delivering 100% authentic products with fast cash on delivery.'}
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:01929637253" className="hover:text-emerald-400 transition-colors">
                  হটলাইন: <strong className="font-mono text-white">01929637253</strong> (সকাল 9টা - রাত 10টা)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="mailto:mdzunayedali6@gmail.com" className="hover:text-emerald-400 transition-colors">
                  mdzunayedali6@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>রামপুর, তারাকান্দা, ময়মনসিংহ, বাংলাদেশ</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {siteSettings.whatsappLink && (
                <a 
                  href={siteSettings.whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/20 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">WhatsApp</span>
                </a>
              )}
              {siteSettings.facebookLink && (
                <a 
                  href={siteSettings.facebookLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/20 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-xs font-bold">Facebook</span>
                </a>
              )}
              {siteSettings.messengerLink && (
                <a 
                  href={siteSettings.messengerLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B2FF]/10 hover:bg-[#00B2FF] text-[#00B2FF] hover:text-white border border-[#00B2FF]/20 transition-colors"
                  title="Messenger"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold">Messenger</span>
                </a>
              )}
              {siteSettings.imoLink && (
                <a 
                  href={siteSettings.imoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0056FF]/10 hover:bg-[#0056FF] text-[#0056FF] hover:text-white border border-[#0056FF]/20 transition-colors"
                  title="Imo"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span className="text-xs font-bold">Imo</span>
                </a>
              )}
              {siteSettings.youtubeLink && (
                <a 
                  href={siteSettings.youtubeLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/20 transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                  <span className="text-xs font-bold">YouTube</span>
                </a>
              )}
              {siteSettings.tiktokLink && (
                <a 
                  href={siteSettings.tiktokLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-black text-white hover:text-white border border-white/20 transition-colors"
                  title="TikTok"
                >
                  <span className="w-4 h-4 flex items-center justify-center font-black">♪</span>
                  <span className="text-xs font-bold">TikTok</span>
                </a>
              )}
            </div>

            {/* App / Software Download Option */}
            {siteSettings.appDownloadUrl?.trim() ? (
              <div className="pt-3 pb-1 w-full max-w-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 p-3.5 px-4 sm:px-5 bg-gradient-to-r from-slate-900/90 via-emerald-950/60 to-slate-900/90 border border-emerald-500/40 rounded-2xl shadow-xl shadow-emerald-950/30">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-2">
                        <span>{siteSettings.appNameBn || (language === 'bn' ? 'বাংলা বাজার মোবাইল অ্যাপ' : 'Bangla Bazar Mobile App')}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          APK / App
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {siteSettings.appSubtitleBn || (language === 'bn' ? 'সহজ ও দ্রুত কেনাকাটায় সরাসরি ডাউনলোড ও ইনস্টল করুন' : 'Download and install now for faster shopping')}
                      </div>
                    </div>
                  </div>
                  <a
                    href={siteSettings.appDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ডাউনলোড করুন' : 'Download Now'}</span>
                  </a>
                </div>
              </div>
            ) : (!isInstalled && isInstallable) && (
              <div className="pt-3 pb-1 w-full max-w-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 p-3.5 px-4 sm:px-5 bg-gradient-to-r from-slate-900/90 via-blue-950/60 to-slate-900/90 border border-blue-500/40 rounded-2xl shadow-xl shadow-blue-950/30">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center shrink-0">
                      <img src="/pwa-192x192.png" alt="বাংলা বাজার (Bangla Bazar)" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center justify-center sm:justify-start gap-2">
                        <span>{language === 'bn' ? 'বাংলা বাজার অফিসিয়াল অ্যাপ' : 'Bangla Bazar Official App'}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          PWA App
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {language === 'bn' ? 'ফোনে বা কম্পিউটারে ইনস্টল করে সরাসরি কেনাকাটা করুন' : 'Install on phone or computer for instant shopping'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => install()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ইনস্টল করুন' : 'Install App'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Discreet Secret Admin Entry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <p>
            © {new Date().getFullYear()} বাংলা বাজার (Bangla Bazar) Marketplace Ltd. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <button
            onClick={() => {
              if (isAdminAuthenticated || (currentUser && isUserAdmin(currentUser))) {
                loginAdmin();
                setCurrentPage('admin');
              } else {
                setIsAdminModalOpen(true);
              }
            }}
            className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] p-1 rounded-md cursor-pointer group"
            title="Secret Admin Access (Ctrl+Shift+A)"
          >
            <Lock className="w-3 h-3 text-amber-500/70 group-hover:scale-110 transition-transform" />
            <span className="opacity-70 group-hover:opacity-100 font-mono">সিক্রেট এডমিন</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          ট্রেড লাইসেন্স নং: TRAD/DNCC/012938/2024 | ডিবিআইডি নং: 98421
        </p>
      </div>
    </footer>
  );
};
