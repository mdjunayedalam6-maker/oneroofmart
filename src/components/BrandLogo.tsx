import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'light';
  onClick?: () => void;
  className?: string;
  useImageOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  textColor = 'dark',
  onClick,
  className = '',
}) => {
  // Configured sizing for balanced proportions across mobile, header, drawer, and footer
  const sizeStyles = {
    sm: {
      icon: 'w-7 h-7 sm:w-8 sm:h-8',
      iconInner: 'w-4 h-4',
      banglaText: 'text-base sm:text-lg',
      englishText: 'text-[9px] sm:text-[10px]',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-9 h-9 sm:w-11 sm:h-11',
      iconInner: 'w-5 h-5 sm:w-6 sm:h-6',
      banglaText: 'text-lg sm:text-2xl',
      englishText: 'text-[10px] sm:text-[11.5px]',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      iconInner: 'w-6 h-6 sm:w-7 sm:h-7',
      banglaText: 'text-2xl sm:text-3xl',
      englishText: 'text-xs sm:text-sm',
      gap: 'gap-3',
    },
    xl: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      iconInner: 'w-8 h-8 sm:w-10 sm:h-10',
      banglaText: 'text-3xl sm:text-4xl',
      englishText: 'text-sm sm:text-base',
      gap: 'gap-3.5',
    },
  }[size];

  const isLight = textColor === 'light';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${
        onClick ? 'cursor-pointer group transition-all duration-300 active:scale-95' : ''
      } ${sizeStyles.gap} ${className}`}
      title="বাংলা বাজার (Bangla Bazar) - সেরা অনলাইন শপ"
    >
      {/* Brand Icon Emblem */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#003882] via-[#0052b4] to-[#FF6B00] shadow-md shadow-[#003882]/25 group-hover:scale-105 transition-transform duration-300 ${sizeStyles.icon}`}>
        <ShoppingBag className={`text-white stroke-[2.2] ${sizeStyles.iconInner}`} />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B00]"></span>
        </span>
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight font-sans transition-colors ${sizeStyles.banglaText} ${
              isLight ? 'text-white' : 'text-[#003882]'
            }`}
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            বাংলা<span className="text-[#FF6B00]"> বাজার</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            <span>অফিসিয়াল</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`font-black uppercase tracking-widest ${sizeStyles.englishText} ${
              isLight ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Bangla Bazar
          </span>
          <span className="text-[10px] text-slate-400 font-medium">|</span>
          <span className={`text-[10px] font-medium hidden xs:inline ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            অনলাইন মার্কেট
          </span>
        </div>
      </div>
    </div>
  );
};
