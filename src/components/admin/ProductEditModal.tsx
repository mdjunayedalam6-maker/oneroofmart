import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, Truck, DollarSign, Trash2, Hash, Palette, Layers, Plus, Star } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { compressImageFile } from '../../utils/imageCompressor';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  { label: 'স্মার্টফোন / Phone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { label: 'ল্যাপটপ / Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
  { label: 'হেডফোন / Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { label: 'ঘড়ি / Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'পাঞ্জাবি / Fashion', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80' },
  { label: 'শাড়ি / Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' },
  { label: 'মধু / Organic Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { label: 'সরিষার তেল / Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80' },
  { label: 'ব্লেন্ডার / Blender', url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80' },
  { label: 'কেডস / Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { label: 'পারফিউম / Perfume', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80' },
  { label: 'বই / Books', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
];

const PRESET_SIZES = [
  'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size',
  '28', '30', '32', '34', '36', '38', '40', '42'
];

const PRESET_COLORS = [
  { name: 'কালো', hex: '#111827', labelEn: 'Black' },
  { name: 'সাদা', hex: '#FFFFFF', labelEn: 'White', border: true },
  { name: 'লাল', hex: '#DC2626', labelEn: 'Red' },
  { name: 'নীল', hex: '#2563EB', labelEn: 'Blue' },
  { name: 'নেভি ব্লু', hex: '#1E3A8A', labelEn: 'Navy Blue' },
  { name: 'সবুজ', hex: '#16A34A', labelEn: 'Green' },
  { name: 'হলুদ', hex: '#EAB308', labelEn: 'Yellow' },
  { name: 'মেরুন', hex: '#831843', labelEn: 'Maroon' },
  { name: 'গোলাপি', hex: '#DB2777', labelEn: 'Pink' },
  { name: 'কমলা', hex: '#EA580C', labelEn: 'Orange' },
  { name: 'ধূসর / গ্রে', hex: '#6B7280', labelEn: 'Gray' },
  { name: 'বেগুনি', hex: '#7C3AED', labelEn: 'Purple' },
  { name: 'গোল্ডেন', hex: '#D97706', labelEn: 'Gold' },
];

// Helper: Converts any Bengali digits (0-9) to clean English digits (0-9)
const toEnglishDigits = (str: string): string => {
  const bnToEn: Record<string, string> = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  };
  let res = str;
  for (const [bn, en] of Object.entries(bnToEn)) {
    res = res.replaceAll(bn, en);
  }
  return res.replace(/[^0-9.]/g, '');
};

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct, deleteProduct, language, addToast } = useApp();

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceStr, setPriceStr] = useState<string>('205');
  const [originalPriceStr, setOriginalPriceStr] = useState<string>('250');
  const [stockStr, setStockStr] = useState<string>('50');
  const [sku, setSku] = useState(''); // Added
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  ]);
  const [activeImageSlot, setActiveImageSlot] = useState(0);
  const [sizes, setSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [warranty, setWarranty] = useState('1 বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি');
  const [deliveryTime, setDeliveryTime] = useState('2-3 কার্যদিবস');
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [shippingInside, setShippingInside] = useState<number | undefined>(undefined);
  const [shippingOutside, setShippingOutside] = useState<number | undefined>(undefined);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (productToEdit) {
      setTitleBn(productToEdit.titleBn || '');
      setTitleEn(productToEdit.titleEn || '');
      setCategory(productToEdit.category || (categories[0]?.slug || 'electronics'));
      setSubcategory(productToEdit.subcategory || '');
      setBrand(productToEdit.brand || '');
      setPriceStr(productToEdit.price !== undefined ? String(productToEdit.price) : '205');
      setOriginalPriceStr(productToEdit.originalPrice ? String(productToEdit.originalPrice) : '');
      setStockStr(productToEdit.stock !== undefined ? String(productToEdit.stock) : '25');
      setSku(productToEdit.sku || '');

      // Product images (1 to 5)
      const existingImages = (productToEdit.images && productToEdit.images.length > 0)
        ? productToEdit.images.slice(0, 5)
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'];
      setImages(existingImages);
      setActiveImageSlot(0);

      // Product sizes
      const existingSizes = (productToEdit.sizes && productToEdit.sizes.length > 0)
        ? productToEdit.sizes
        : (productToEdit.variants?.find((v) => v.type === 'size')?.options || []);
      setSizes(existingSizes);

      // Product colors
      const existingColors = (productToEdit.colors && productToEdit.colors.length > 0)
        ? productToEdit.colors
        : (productToEdit.variants?.find((v) => v.type === 'color')?.options || []);
      setColors(existingColors);

      setDescriptionBn(productToEdit.descriptionBn || '');
      setDescriptionEn(productToEdit.descriptionEn || '');
      setTagsStr(productToEdit.tags?.join(', ') || '');
      setIsFlashSale(Boolean(productToEdit.isFlashSale));
      setWarranty(productToEdit.warranty || '1 বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি');
      setDeliveryTime(productToEdit.deliveryTime || '2-3 কার্যদিবস');
      setIsFreeShipping(Boolean(productToEdit.isFreeShipping));
      setShippingInside(productToEdit.shippingInside ?? productToEdit.shippingFee);
      setShippingOutside(productToEdit.shippingOutside ?? productToEdit.shippingFee);
    } else {
      // Default initial values for new product
      setTitleBn('');
      setTitleEn('');
      setCategory(categories[0]?.slug || 'electronics');
      setSubcategory('');
      setBrand('বাংলা বাজার অফিসিয়াল');
      setPriceStr('205');
      setOriginalPriceStr('250');
      setStockStr('50');
      setSku('');
      setImages(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80']);
      setActiveImageSlot(0);
      setSizes(['M', 'L', 'XL']);
      setColors(['কালো', 'নীল']);
      setDescriptionBn('উন্নত মানের ও দীর্ঘস্থায়ী প্রিমিয়াম পণ্য। 100% অরিজিনাল কোয়ালিটি গ্যারান্টি।');
      setDescriptionEn('Premium high quality original product with full customer warranty.');
      setTagsStr('অরিজিনাল, বেস্টসেলার, ট্রেন্ডিং');
      setIsFlashSale(false);
      setWarranty('1 বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি');
      setDeliveryTime('2-3 কার্যদিবস');
      setIsFreeShipping(false);
      setShippingInside(undefined);
      setShippingOutside(undefined);
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  // Single file upload for specific slot with automatic image compression
  const handleSingleFileUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          const newImages = [...images];
          if (slotIndex < newImages.length) {
            newImages[slotIndex] = compressed;
          } else if (newImages.length < 5) {
            newImages.push(compressed);
          }
          setImages(newImages);
        }
      } catch (err) {
        console.warn('Image compression error:', err);
      }
    }
  };

  // Multiple files upload (up to 5 images) with automatic image compression
  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const maxAllowed = 5;
    const filesToRead: File[] = [];
    for (let i = 0; i < Math.min(files.length, maxAllowed); i++) {
      const f = files.item(i);
      if (f) filesToRead.push(f);
    }
    
    try {
      const results = await Promise.all(
        filesToRead.map((file) => compressImageFile(file))
      );
      const validResults = results.filter(Boolean);
      if (validResults.length > 0) {
        setImages(validResults.slice(0, 5));
        setActiveImageSlot(0);
        addToast(
          language === 'bn' 
            ? `${validResults.length} টি ছবি অপ্টিমাইজড করে লোড করা হয়েছে` 
            : `${validResults.length} images optimized successfully`, 
          'success'
        );
      }
    } catch (err) {
      console.warn('Batch image compression error:', err);
    }
  };

  // Add new image slot
  const addImageSlot = () => {
    if (images.length >= 5) {
      addToast(language === 'bn' ? 'সর্বোচ্চ 5 টি ছবি যুক্ত করা যাবে' : 'Maximum 5 images allowed', 'error');
      return;
    }
    setImages([...images, '']);
    setActiveImageSlot(images.length);
  };

  // Remove image slot
  const removeImageSlot = (idx: number) => {
    if (images.length <= 1) {
      addToast(language === 'bn' ? 'কমপক্ষে 1 টি ছবি থাকতে হবে' : 'At least 1 image is required', 'error');
      return;
    }
    const filtered = images.filter((_, i) => i !== idx);
    setImages(filtered);
    setActiveImageSlot(Math.max(0, Math.min(activeImageSlot, filtered.length - 1)));
  };

  // Make image the primary (index 0)
  const makeImagePrimary = (idx: number) => {
    if (idx === 0) return;
    const item = images[idx];
    const remaining = images.filter((_, i) => i !== idx);
    setImages([item, ...remaining]);
    setActiveImageSlot(0);
    addToast(language === 'bn' ? 'প্রধান ছবি হিসেবে সেট করা হয়েছে' : 'Set as primary main image', 'success');
  };

  // Size helpers
  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (!sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
    }
    setCustomSizeInput('');
  };

  // Color helpers
  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter((c) => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const addCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    if (!colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
    }
    setCustomColorInput('');
  };

  const handleDeleteCurrentProduct = () => {
    if (!productToEdit) return;
    deleteProduct(productToEdit.id);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleBn.trim() && !titleEn.trim()) {
      addToast(language === 'bn' ? 'পণ্যের নাম পূরণ করুন' : 'Please enter product title', 'error');
      return;
    }

    const finalPrice = Math.max(0, parseFloat(priceStr) || 0);
    const finalOriginalPrice = originalPriceStr.trim() ? Math.max(0, parseFloat(originalPriceStr) || 0) : undefined;
    const finalStock = Math.max(0, parseInt(stockStr, 10) || 0);

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const discountPercentage = finalOriginalPrice && finalOriginalPrice > finalPrice
      ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
      : undefined;

    // Filter valid images
    const validImages = images.map((img) => img.trim()).filter(Boolean);
    const finalImages = validImages.length > 0
      ? validImages
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'];

    // Variants for legacy support
    const variants = [];
    if (sizes.length > 0) {
      variants.push({ type: 'size' as const, options: sizes });
    }
    if (colors.length > 0) {
      variants.push({ type: 'color' as const, options: colors });
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        titleBn: titleBn.trim() || titleEn.trim(),
        titleEn: titleEn.trim() || titleBn.trim(),
        category,
        subcategory,
        sku: sku.trim() || undefined,
        brand: brand.trim() || 'বাংলা বাজার',
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercentage,
        stock: finalStock,
        images: finalImages,
        sizes,
        colors,
        variants,
        descriptionBn,
        descriptionEn,
        tags,
        isFlashSale,
        warranty,
        deliveryTime,
        isFreeShipping,
        shippingInside,
        shippingOutside,
      });
    } else {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        sku: sku.trim() || undefined,
        titleBn: titleBn.trim() || titleEn.trim(),
        titleEn: titleEn.trim() || titleBn.trim(),
        descriptionBn: descriptionBn || 'প্রিমিয়াম কোয়ালিটি পণ্য।',
        descriptionEn: descriptionEn || 'Premium quality product.',
        category: category || categories[0]?.slug || 'electronics',
        subcategory,
        brand: brand.trim() || 'বাংলা বাজার',
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercentage,
        rating: 4.8,
        reviewCount: 1,
        images: finalImages,
        sizes,
        colors,
        variants,
        stock: finalStock,
        isFlashSale,
        soldCount: 0,
        isFeatured: true,
        isNewArrival: true,
        tags: tags.length ? tags : ['নতুন পণ্য', 'অরিজিনাল'],
        specifications: {
          'ব্র্যান্ড': brand.trim() || 'বাংলা বাজার',
          'ওয়ারেন্টি': warranty,
          'ডেলিভারি': deliveryTime,
        },
        reviews: [],
        warranty,
        deliveryTime,
        isFreeShipping,
        shippingInside,
        shippingOutside,
      };
      addProduct(newProd);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {productToEdit
                  ? (language === 'bn' ? 'প্রডাক্ট এডিট করুন' : 'Edit Product')
                  : (language === 'bn' ? 'নতুন প্রডাক্ট আপলোড করুন' : 'Upload New Product')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'bn' ? 'পণ্যের সম্পূর্ণ বিবরণ, মূল্য, ডেলিভারি চার্জ ও ছবি নির্ধারণ করুন' : 'Enter product details, pricing, shipping fee and images'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-slate-900">
          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: স্মার্ট ওয়্যারলেস ব্লুটুথ হেডফোন"
                required
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Product Title (English)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Smart Wireless Bluetooth Headphone"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ক্যাটাগরি নির্বাচন করুন *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none capitalize"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="text-slate-900">
                    {c.nameBn} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ব্র্যান্ড নাম (Brand)
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Samsung, Apple, বাংলা বাজার"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
            
            {/* Subcategory */}
            {categories.find(c => c.slug === category)?.subcategories && categories.find(c => c.slug === category)!.subcategories!.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  সাব-ক্যাটাগরি নির্বাচন করুন
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 font-medium bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                >
                  <option value="">-- কোনোটি না (None) --</option>
                  {categories.find(c => c.slug === category)?.subcategories?.map(s => (
                    <option key={s.id} value={s.id}>{language === 'bn' ? s.nameBn : s.nameEn}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  SKU (Code)
                </label>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-123"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  বিক্রয় মূল্য (Price ৳) *
                </label>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  যেমন: 205
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">৳</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceStr}
                  onChange={(e) => setPriceStr(toEnglishDigits(e.target.value))}
                  placeholder="205"
                  required
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold text-emerald-700 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                নির্ধারিত মূল্য: <span className="font-bold text-slate-800">৳{priceStr || '0'}</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  আগের মূল্য (Original ৳)
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  ঐচ্ছিক
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">৳</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={originalPriceStr}
                  onChange={(e) => setOriginalPriceStr(toEnglishDigits(e.target.value))}
                  placeholder="250"
                  className="w-full pl-7 pr-3 py-2 text-xs text-slate-700 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                ছাড়ের আগের দাম: <span className="font-medium text-slate-600">{originalPriceStr ? `৳${originalPriceStr}` : 'নাই'}</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  মজুদ সংখ্যা (Stock) *
                </label>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                  যেমন: 205
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={stockStr}
                onChange={(e) => setStockStr(toEnglishDigits(e.target.value))}
                placeholder="205"
                required
                className="w-full px-3 py-2 text-xs text-slate-900 font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                মোট স্টক: <span className="font-bold text-slate-800">{stockStr || '0'} টি</span>
              </p>
            </div>
          </div>

          {/* 1-5 Product Images Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>পণ্যের ছবি (1-5 টি ছবি আপলোড করুন)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  সর্বোচ্চ 5 টি ছবি দিতে পারবেন। 1ম ছবিটি প্রধান ছবি (Main Thumbnail) হিসেবে প্রদর্শিত হবে।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>একসাথে একাধিক ছবি আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFileUpload}
                    className="hidden"
                  />
                </label>

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ছবি যোগ করুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5-Slot Thumbnails Bar */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 1, 2, 3, 4].map((slotIdx) => {
                const img = images[slotIdx];
                const isSelected = activeImageSlot === slotIdx;
                const isPrimary = slotIdx === 0;

                if (img !== undefined) {
                  return (
                    <div
                      key={slotIdx}
                      onClick={() => setActiveImageSlot(slotIdx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-white group ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={`Slot ${slotIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100 text-slate-400">
                          <ImageIcon className="w-5 h-5 mb-0.5" />
                          <span className="text-[9px] font-bold">ছবি {slotIdx + 1}</span>
                        </div>
                      )}

                      {/* Primary Badge */}
                      {isPrimary && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-slate-950" />
                          <span>প্রধান</span>
                        </span>
                      )}

                      {/* Slot Number */}
                      {!isPrimary && (
                        <span className="absolute top-1 left-1 bg-slate-900/80 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                          #{slotIdx + 1}
                        </span>
                      )}

                      {/* Remove Button */}
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImageSlot(slotIdx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md opacity-80 hover:opacity-100 transition-opacity"
                          title="এই ছবিটি মুছুন"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                }

                // Empty available slot
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={addImageSlot}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 text-slate-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-bold">ছবি {slotIdx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Currently Active Slot Editor */}
            {images[activeImageSlot] !== undefined && (
              <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    ছবি #{activeImageSlot + 1} সম্পাদন করছেন {activeImageSlot === 0 ? '(প্রধান ছবি)' : ''}
                  </span>

                  {activeImageSlot > 0 && images[activeImageSlot] && (
                    <button
                      type="button"
                      onClick={() => makeImagePrimary(activeImageSlot)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      <span>এই ছবিটিকে প্রধান ছবি বানান</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={images[activeImageSlot] || ''}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[activeImageSlot] = e.target.value;
                      setImages(newImages);
                    }}
                    placeholder="ছবির সরাসরি লিংক (URL) লিখুন..."
                    className="flex-1 px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />

                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>ফাইল পরিবর্তন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSingleFileUpload(activeImageSlot, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Suggestions for this slot */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    জনপ্রিয় ছবি প্রিসেট থেকে নির্বাচন করুন:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const newImages = [...images];
                          newImages[activeImageSlot] = preset.url;
                          setImages(newImages);
                        }}
                        className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Size Variants (সাইজ নির্বাচন) Section */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>পণ্যের সাইজ নির্বাচন (Size Options)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  কাস্টমার কেনার সময় যেসকল সাইজ সিলেক্ট করতে পারবে তা নির্ধারণ করুন।
                </p>
              </div>

              <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200">
                {sizes.length} টি সাইজ যোগ হয়েছে
              </span>
            </div>

            {/* Quick Presets for Sizes */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                ক্লিক করে দ্রুত সাইজ অন/অফ করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SIZES.map((s) => {
                  const isChecked = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Size Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSize();
                  }
                }}
                placeholder="অন্য কোনো সাইজ লিখুন (যেমন: 44, 2 Litre, 128GB, Free Size)..."
                className="flex-1 px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 outline-none"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                + সাইজ যোগ
              </button>
            </div>

            {/* Active Selected Sizes List */}
            {sizes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600">নির্বাচিত সাইজ:</span>
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-900 border border-indigo-200 text-xs font-bold rounded-lg shadow-2xs"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => toggleSize(s)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ কোনো সাইজ সিলেক্ট করা নেই। প্রয়োজন হলে উপরের সাইজে ক্লিক করুন অথবা কাস্টম সাইজ যোগ করুন।
              </p>
            )}
          </div>

          {/* Color Variants (কালার নির্বাচন) Section */}
          <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>পণ্যের কালার/রং নির্বাচন (Color Options)</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  কাস্টমার কেনার সময় যেসকল কালার সিলেক্ট করতে পারবে তা নির্ধারণ করুন।
                </p>
              </div>

              <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200">
                {colors.length} টি কালার যোগ হয়েছে
              </span>
            </div>

            {/* Quick Presets for Colors */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                ক্লিক করে দ্রুত কালার অন/অফ করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => {
                  const isChecked = colors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isChecked && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomColor();
                  }
                }}
                placeholder="অন্য কোনো কালার লিখুন (যেমন: গোল্ডেন, মেটালিক গ্রে, রয়্যাল ব্লু)..."
                className="flex-1 px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-white border border-slate-300 rounded-xl focus:border-amber-600 outline-none"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                + কালার যোগ
              </button>
            </div>

            {/* Active Selected Colors List */}
            {colors.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-600">নির্বাচিত কালার:</span>
                {colors.map((c) => {
                  const presetMatch = PRESET_COLORS.find((p) => p.name === c);
                  return (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 border border-amber-200 text-xs font-bold rounded-lg shadow-2xs"
                    >
                      {presetMatch && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: presetMatch.hex }}
                        />
                      )}
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => toggleColor(c)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ কোনো কালার সিলেক্ট করা নেই। প্রয়োজন হলে উপরের কালারগুলোতে ক্লিক করুন অথবা কাস্টম কালার নাম লিখুন।
              </p>
            )}
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              পণ্যের বিবরণ (বাংলা)
            </label>
            <textarea
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              rows={2}
              placeholder="পণ্যের গুণাগুণ ও বিশেষত্ব লিখুন..."
              className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none resize-none"
            />
          </div>

          {/* Flash Sale & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ট্যাগ বা হাইলাইটস (কমা দিয়ে আলাদা করুন)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="যেমন: অরিজিনাল, ডিসকাউন্ট, গরম অফার"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="flashSaleCheck"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="flashSaleCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                ⚡ ফ্ল্যাশ সেল (Flash Sale) হিসেবে শো করুন
              </label>
            </div>
          </div>

          {/* Delivery & Shipping Settings Section */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>ডেলিভারি চার্জ ও শিপিং সেটিংস</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Free shipping toggle */}
              <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="prodFreeShipping"
                  checked={isFreeShipping}
                  onChange={(e) => setIsFreeShipping(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="prodFreeShipping" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  🎁 ফ্রি ডেলিভারি (৳0)
                </label>
              </div>

              {/* Inside Dhaka Shipping */}
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ঢাকার ভিতরে চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={shippingInside !== undefined ? shippingInside : ''}
                  onChange={(e) =>
                    setShippingInside(e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)))
                  }
                  placeholder="যেমন: 60 (ফাঁকা রাখলে ডিফল্ট)"
                  disabled={isFreeShipping}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Outside Dhaka Shipping */}
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ঢাকার বাইরে চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={shippingOutside !== undefined ? shippingOutside : ''}
                  onChange={(e) =>
                    setShippingOutside(e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)))
                  }
                  placeholder="যেমন: 120 (ফাঁকা রাখলে ডিফল্ট)"
                  disabled={isFreeShipping}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Warranty & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                ওয়ারেন্টি পলিসি
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="যেমন: 1 বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                আনুমানিক ডেলিভারি সময়
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="যেমন: 2-3 কার্যদিবস (ঢাকা সিটিতে 24 ঘণ্টা)"
                className="w-full px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {productToEdit && (
                <>
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl">
                      <span className="text-xs text-rose-700 font-bold">
                        {language === 'bn' ? 'মুছে ফেলতে নিশ্চিত?' : 'Sure to delete?'}
                      </span>
                      <button
                        type="button"
                        onClick={handleDeleteCurrentProduct}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{language === 'bn' ? 'হ্যাঁ, ডিলিট' : 'Yes, Delete'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'এই প্রডাক্টটি মুছুন' : 'Delete Product'}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{productToEdit ? 'পরিবর্তন সংরক্ষণ করুন' : 'প্রডাক্ট পাবলিশ করুন'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
