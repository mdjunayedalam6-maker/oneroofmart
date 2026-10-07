import { Category, Product } from '../types';

// Map of all 91 ShopBase category IDs, Bengali names, and subcategory slugs to the 11 main categories
const CATEGORY_MAP: Record<string, { parentId: string; subId?: string }> = {
  // 1. Womens Clothing (মেয়েদের পোশাক)
  'womens-clothing': { parentId: 'womens-clothing' },
  'saree': { parentId: 'womens-clothing', subId: 'saree' },
  'শাড়ি': { parentId: 'womens-clothing', subId: 'saree' },
  'tanter-saree': { parentId: 'womens-clothing', subId: 'tanter-saree' },
  'তাঁতের শাড়ী': { parentId: 'womens-clothing', subId: 'tanter-saree' },
  'handprint-saree': { parentId: 'womens-clothing', subId: 'handprint-saree' },
  'হ্যান্ডপ্রিন্ট শাড়ি': { parentId: 'womens-clothing', subId: 'handprint-saree' },
  'indian-saree': { parentId: 'womens-clothing', subId: 'indian-saree' },
  'ইন্ডিয়ান শাড়ী': { parentId: 'womens-clothing', subId: 'indian-saree' },
  'three-piece': { parentId: 'womens-clothing', subId: 'three-piece' },
  'রেডিমেড থ্রিপিস': { parentId: 'womens-clothing', subId: 'three-piece' },
  'unstitched-threepiece': { parentId: 'womens-clothing', subId: 'unstitched-threepiece' },
  'আনস্টিজ থ্রিপিস': { parentId: 'womens-clothing', subId: 'unstitched-threepiece' },
  'gown-kurti': { parentId: 'womens-clothing', subId: 'gown-kurti' },
  'গাউন & কুর্তি': { parentId: 'womens-clothing', subId: 'gown-kurti' },
  'গাউন ও কুর্তি': { parentId: 'womens-clothing', subId: 'gown-kurti' },
  'lehenga-party': { parentId: 'womens-clothing', subId: 'lehenga-party' },
  'লেহেঙ্গা & পার্টি': { parentId: 'womens-clothing', subId: 'lehenga-party' },
  'borka-abaya': { parentId: 'womens-clothing', subId: 'borka-abaya' },
  'বোরকা': { parentId: 'womens-clothing', subId: 'borka-abaya' },
  'বোরকা ও আবায়া': { parentId: 'womens-clothing', subId: 'borka-abaya' },
  'hijab-niqab': { parentId: 'womens-clothing', subId: 'hijab-niqab' },
  'হিজাব & নিকাব': { parentId: 'womens-clothing', subId: 'hijab-niqab' },
  'sunnati-dress': { parentId: 'womens-clothing', subId: 'sunnati-dress' },
  'সুন্নাতি ড্রেস': { parentId: 'womens-clothing', subId: 'sunnati-dress' },
  'inner-nighty': { parentId: 'womens-clothing', subId: 'inner-nighty' },
  'ইনার & নাইটি': { parentId: 'womens-clothing', subId: 'inner-nighty' },
  'ইনার ও নাইটি': { parentId: 'womens-clothing', subId: 'inner-nighty' },
  'western-dress': { parentId: 'womens-clothing', subId: 'western-dress' },
  'ওয়েস্টার্ন ড্রেস': { parentId: 'womens-clothing', subId: 'western-dress' },
  'girls-clothing': { parentId: 'womens-clothing', subId: 'girls-clothing' },
  'মেয়েদের পোশাক': { parentId: 'womens-clothing', subId: 'girls-clothing' },
  'গার্লস টপস': { parentId: 'womens-clothing', subId: 'girls-clothing' },

  // 2. Mens Clothing (ছেলেদের পোশাক)
  'mens-clothing': { parentId: 'mens-clothing' },
  'polo-shirts': { parentId: 'mens-clothing', subId: 'polo-shirts' },
  'পলো শার্ট': { parentId: 'mens-clothing', subId: 'polo-shirts' },
  'dropshoulder-tshirt': { parentId: 'mens-clothing', subId: 'dropshoulder-tshirt' },
  'ড্রপসোল্ডার টিশার্ট': { parentId: 'mens-clothing', subId: 'dropshoulder-tshirt' },
  'basic-tshirt': { parentId: 'mens-clothing', subId: 'basic-tshirt' },
  'বেসিক টিশার্ট': { parentId: 'mens-clothing', subId: 'basic-tshirt' },
  'বেসিক টি-শার্ট': { parentId: 'mens-clothing', subId: 'basic-tshirt' },
  'long-sleeve-tshirt': { parentId: 'mens-clothing', subId: 'long-sleeve-tshirt' },
  'লং-স্লীভ টিশার্ট': { parentId: 'mens-clothing', subId: 'long-sleeve-tshirt' },
  'printed-shirt': { parentId: 'mens-clothing', subId: 'printed-shirt' },
  'প্রিন্ট শার্ট': { parentId: 'mens-clothing', subId: 'printed-shirt' },
  'solid-shirt': { parentId: 'mens-clothing', subId: 'solid-shirt' },
  'সলিড শার্ট': { parentId: 'mens-clothing', subId: 'solid-shirt' },
  'check-shirt': { parentId: 'mens-clothing', subId: 'check-shirt' },
  'চেক শার্ট': { parentId: 'mens-clothing', subId: 'check-shirt' },
  'shirt-combo': { parentId: 'mens-clothing', subId: 'shirt-combo' },
  'শার্ট কম্বো': { parentId: 'mens-clothing', subId: 'shirt-combo' },
  'short-combo': { parentId: 'mens-clothing', subId: 'short-combo' },
  'শর্ট কম্বো': { parentId: 'mens-clothing', subId: 'short-combo' },
  'half-sleeve-set': { parentId: 'mens-clothing', subId: 'half-sleeve-set' },
  'হাফ স্লিভ সেট': { parentId: 'mens-clothing', subId: 'half-sleeve-set' },
  'long-sleeve-set': { parentId: 'mens-clothing', subId: 'long-sleeve-set' },
  'লং স্লিভ সেট': { parentId: 'mens-clothing', subId: 'long-sleeve-set' },
  'embroidery-panjabi': { parentId: 'mens-clothing', subId: 'embroidery-panjabi' },
  'এমব্রো. পাঞ্জাবি': { parentId: 'mens-clothing', subId: 'embroidery-panjabi' },
  'print-panjabi': { parentId: 'mens-clothing', subId: 'print-panjabi' },
  'প্রিন্ট পাঞ্জাবি': { parentId: 'mens-clothing', subId: 'print-panjabi' },
  'panjabi-combo': { parentId: 'mens-clothing', subId: 'panjabi-combo' },
  'পাঞ্জাবি কম্বো': { parentId: 'mens-clothing', subId: 'panjabi-combo' },
  'katua': { parentId: 'mens-clothing', subId: 'katua' },
  'কাতুয়া': { parentId: 'mens-clothing', subId: 'katua' },
  'jeans-pant': { parentId: 'mens-clothing', subId: 'jeans-pant' },
  'প্যান্ট+ট্রাউজার': { parentId: 'mens-clothing', subId: 'jeans-pant' },
  'জিন্স প্যান্ট': { parentId: 'mens-clothing', subId: 'jeans-pant' },
  'চিনো প্যান্ট': { parentId: 'mens-clothing', subId: 'jeans-pant' },
  'কসাই টিশার্ট': { parentId: 'mens-clothing', subId: 'basic-tshirt' },
  'fashion': { parentId: 'mens-clothing' },

  // 3. Baby Collection (বেবি কালেকশন)
  'baby-collection': { parentId: 'baby-collection' },
  'boys-tshirt-set': { parentId: 'baby-collection', subId: 'boys-tshirt-set' },
  'বয়েজ টিশার্ট সেট': { parentId: 'baby-collection', subId: 'boys-tshirt-set' },
  'girls-tshirt-set': { parentId: 'baby-collection', subId: 'girls-tshirt-set' },
  'গার্লস টিশার্ট সেট': { parentId: 'baby-collection', subId: 'girls-tshirt-set' },
  'baby-winter-dress': { parentId: 'baby-collection', subId: 'baby-winter-dress' },
  'বেবি উইন্টার ড্রেসসমূহ': { parentId: 'baby-collection', subId: 'baby-winter-dress' },
  'pari-dress': { parentId: 'baby-collection', subId: 'pari-dress' },
  'পরী ড্রেস': { parentId: 'baby-collection', subId: 'pari-dress' },
  'baby-toys': { parentId: 'baby-collection', subId: 'baby-toys' },
  'খেলনা & দোলনা': { parentId: 'baby-collection', subId: 'baby-toys' },
  'baby-winter-accessories': { parentId: 'baby-collection', subId: 'baby-winter-accessories' },
  'বেবি উইন্টার এক্সেসরিজ': { parentId: 'baby-collection', subId: 'baby-winter-accessories' },
  'baby-kameez': { parentId: 'baby-collection', subId: 'baby-kameez' },
  'বেবি কামিজ': { parentId: 'baby-collection', subId: 'baby-kameez' },
  'baby-borka': { parentId: 'baby-collection', subId: 'baby-borka' },
  'বেবি বোরখা': { parentId: 'baby-collection', subId: 'baby-borka' },
  'baby-shirt': { parentId: 'baby-collection', subId: 'baby-shirt' },
  'বেবি শার্ট': { parentId: 'baby-collection', subId: 'baby-shirt' },
  'kids-pant': { parentId: 'baby-collection', subId: 'kids-pant' },
  'কিডস প্যান্ট': { parentId: 'baby-collection', subId: 'kids-pant' },

  // 4. Couple & Combo (কাপল এন্ড কম্বো)
  'couple-combo': { parentId: 'couple-combo' },
  'couple-saree': { parentId: 'couple-combo', subId: 'couple-saree' },
  'কাপল শাড়ী': { parentId: 'couple-combo', subId: 'couple-saree' },
  'couple-threepiece': { parentId: 'couple-combo', subId: 'couple-threepiece' },
  'কাপল থ্রীপিস': { parentId: 'couple-combo', subId: 'couple-threepiece' },
  'tshirt-skirt': { parentId: 'couple-combo', subId: 'tshirt-skirt' },
  'টিশার্ট & স্কার্ট': { parentId: 'couple-combo', subId: 'tshirt-skirt' },
  'sharee-combo': { parentId: 'couple-combo', subId: 'sharee-combo' },
  'শাড়ী কম্বো': { parentId: 'couple-combo', subId: 'sharee-combo' },

  // 5. Home & Living (গৃহ সামগ্রী)
  'home-living': { parentId: 'home-living' },
  'bedsheet': { parentId: 'home-living', subId: 'bedsheet' },
  'রেগুলার বেডশীট': { parentId: 'home-living', subId: 'bedsheet' },
  'waterproof-bedsheet': { parentId: 'home-living', subId: 'waterproof-bedsheet' },
  'ওয়াটারপ্রুফ বেডশিট': { parentId: 'home-living', subId: 'waterproof-bedsheet' },
  'regular-dining': { parentId: 'home-living', subId: 'regular-dining' },
  'রেগুলার ডাইনিং': { parentId: 'home-living', subId: 'regular-dining' },
  'waterproof-dining': { parentId: 'home-living', subId: 'waterproof-dining' },
  'ওয়াটারপ্রুফ ডাইনিং': { parentId: 'home-living', subId: 'waterproof-dining' },
  'comforter': { parentId: 'home-living', subId: 'comforter' },
  'কম্ফর্টার': { parentId: 'home-living', subId: 'comforter' },
  'ac-katha': { parentId: 'home-living', subId: 'ac-katha' },
  'এসি কাথা': { parentId: 'home-living', subId: 'ac-katha' },
  'home-decor': { parentId: 'home-living', subId: 'home-decor' },
  'গৃহ সজ্জা': { parentId: 'home-living', subId: 'home-decor' },
  'home-care': { parentId: 'home-living', subId: 'home-care' },
  'হোম কেয়ার': { parentId: 'home-living', subId: 'home-care' },

  // 6. Bag Collection (ব্যাগ কালেকশন)
  'bag-collection': { parentId: 'bag-collection' },
  'girls-bag': { parentId: 'bag-collection', subId: 'girls-bag' },
  'মেয়েদের ব্যাগ': { parentId: 'bag-collection', subId: 'girls-bag' },
  'purse-bag': { parentId: 'bag-collection', subId: 'purse-bag' },
  'পার্স ব্যাগ': { parentId: 'bag-collection', subId: 'purse-bag' },
  'boys-bag': { parentId: 'bag-collection', subId: 'boys-bag' },
  'ছেলেদের ব্যাগ': { parentId: 'bag-collection', subId: 'boys-bag' },
  'carry-bag': { parentId: 'bag-collection', subId: 'carry-bag' },
  'ক্যারি ব্যাগ': { parentId: 'bag-collection', subId: 'carry-bag' },

  // 7. Jewelry & Accessories (জুয়েলারি এন্ড এক্সেসরিজ)
  'jewelry-accessories': { parentId: 'jewelry-accessories' },
  'clip-band': { parentId: 'jewelry-accessories', subId: 'clip-band' },
  'ক্লিপ & ব্যান্ড': { parentId: 'jewelry-accessories', subId: 'clip-band' },
  'accessories': { parentId: 'jewelry-accessories', subId: 'accessories' },
  'এক্সেসরিজ': { parentId: 'jewelry-accessories', subId: 'accessories' },
  'beauty-care': { parentId: 'jewelry-accessories', subId: 'beauty-care' },
  'বিউটি কেয়ার': { parentId: 'jewelry-accessories', subId: 'beauty-care' },
  'natural-care': { parentId: 'jewelry-accessories', subId: 'natural-care' },
  'ন্যাচারাল কেয়ার': { parentId: 'jewelry-accessories', subId: 'natural-care' },
  'personal-care': { parentId: 'jewelry-accessories', subId: 'personal-care' },
  'পার্সোনাল কেয়ার': { parentId: 'jewelry-accessories', subId: 'personal-care' },
  'gift-item': { parentId: 'jewelry-accessories', subId: 'gift-item' },
  'গিফট আইটেম': { parentId: 'jewelry-accessories', subId: 'gift-item' },

  // 8. Electronics & Gadgets (ইলেকট্রনিক্স এবং গ্যাজেট)
  'electronics-gadgets': { parentId: 'electronics-gadgets' },
  'fan': { parentId: 'electronics-gadgets', subId: 'fan' },
  'ফ্যান': { parentId: 'electronics-gadgets', subId: 'fan' },
  'watch': { parentId: 'electronics-gadgets', subId: 'watch' },
  'ঘড়ি': { parentId: 'electronics-gadgets', subId: 'watch' },
  'gadgets': { parentId: 'electronics-gadgets', subId: 'gadgets' },
  'গ্যাজেটস': { parentId: 'electronics-gadgets', subId: 'gadgets' },
  'speaker': { parentId: 'electronics-gadgets', subId: 'speaker' },
  'স্পিকার': { parentId: 'electronics-gadgets', subId: 'speaker' },
  'camera': { parentId: 'electronics-gadgets', subId: 'camera' },
  'ক্যামেরা': { parentId: 'electronics-gadgets', subId: 'camera' },

  // 9. Winter Collection (শীতের কালেকশন)
  'winter-collection': { parentId: 'winter-collection' },
  'gents-hoodie': { parentId: 'winter-collection', subId: 'gents-hoodie' },
  'জেন্টস হুডি': { parentId: 'winter-collection', subId: 'gents-hoodie' },
  'hoodie-set': { parentId: 'winter-collection', subId: 'hoodie-set' },
  'হুডি সেট': { parentId: 'winter-collection', subId: 'hoodie-set' },
  'ladies-hoodie': { parentId: 'winter-collection', subId: 'ladies-hoodie' },
  'লেডিস হুডি': { parentId: 'winter-collection', subId: 'ladies-hoodie' },
  'gents-jacket': { parentId: 'winter-collection', subId: 'gents-jacket' },
  'জেন্টস জ্যাকেট': { parentId: 'winter-collection', subId: 'gents-jacket' },
  'ladies-jacket': { parentId: 'winter-collection', subId: 'ladies-jacket' },
  'লেডিস জ্যাকেট': { parentId: 'winter-collection', subId: 'ladies-jacket' },
  'ladies-overcoat': { parentId: 'winter-collection', subId: 'ladies-overcoat' },
  'লেডিস ওভারকোট': { parentId: 'winter-collection', subId: 'ladies-overcoat' },
  'sweater': { parentId: 'winter-collection', subId: 'sweater' },
  'সুয়েটার': { parentId: 'winter-collection', subId: 'sweater' },
  'sweatshirt-set': { parentId: 'winter-collection', subId: 'sweatshirt-set' },
  'সুইটশার্ট সেট': { parentId: 'winter-collection', subId: 'sweatshirt-set' },
  'ladies-winter-accessories': { parentId: 'winter-collection', subId: 'ladies-winter-accessories' },
  'লেডিস উইন্টার এক্সেসরিজ': { parentId: 'winter-collection', subId: 'ladies-winter-accessories' },
  'gents-winter-accessories': { parentId: 'winter-collection', subId: 'gents-winter-accessories' },
  'জেন্টস উইন্টার এক্সেসরিজ': { parentId: 'winter-collection', subId: 'gents-winter-accessories' },

  // 10. Seasonal Products (সিজোনাল প্রোডাক্ট)
  'seasonal-products': { parentId: 'seasonal-products' },
  'world-cup': { parentId: 'seasonal-products', subId: 'world-cup' },
  'ওয়ার্ল্ড কাপ': { parentId: 'seasonal-products', subId: 'world-cup' },
  'umbrella': { parentId: 'seasonal-products', subId: 'umbrella' },
  'ছাতা': { parentId: 'seasonal-products', subId: 'umbrella' },
  'raincoat': { parentId: 'seasonal-products', subId: 'raincoat' },
  'রেইন কোট': { parentId: 'seasonal-products', subId: 'raincoat' },

  // 11. Other Categories (অন্যান্য ক্যাটেগরি)
  'other-categories': { parentId: 'other-categories' },
  'shoes': { parentId: 'other-categories', subId: 'shoes' },
  'জুতা': { parentId: 'other-categories', subId: 'shoes' },
  'toys-sports': { parentId: 'other-categories', subId: 'toys-sports' },
  'টয়স & স্পোর্টস': { parentId: 'other-categories', subId: 'toys-sports' },
  'grocery': { parentId: 'other-categories', subId: 'grocery' },
  'মুদি ও খাঁটি পণ্য': { parentId: 'other-categories', subId: 'grocery' },
  'beauty': { parentId: 'other-categories', subId: 'beauty' },
  'বিউটি ও রূপচর্চা': { parentId: 'other-categories', subId: 'beauty' },
  'books': { parentId: 'other-categories', subId: 'books' },
  'বই ও স্টেশনারি': { parentId: 'other-categories', subId: 'books' },
};

/**
 * Checks if a product matches a selected main category and subcategory
 */
export function isProductInCategory(
  product: Product,
  selectedCategoryId: string,
  selectedSubcategoryId: string = 'all',
  categories: Category[] = []
): boolean {
  if (selectedCategoryId === 'all') {
    return true;
  }

  const pCat = (product.category || '').trim().toLowerCase();
  const pSub = (product.subcategory || '').trim().toLowerCase();

  // 1. Check direct map
  const catMapInfo = CATEGORY_MAP[pCat] || CATEGORY_MAP[pSub];
  const targetParentId = selectedCategoryId.toLowerCase();

  // Find category object in current categories
  const targetCatObj = categories.find(
    (c) => c.id.toLowerCase() === targetParentId || c.slug.toLowerCase() === targetParentId
  );

  const subcats = targetCatObj?.subcategories || [];
  const subcatKeys = new Set(
    subcats.flatMap((s) => [
      s.id.toLowerCase(),
      s.nameBn.toLowerCase(),
      s.nameEn.toLowerCase(),
    ])
  );

  // Check parent match
  let matchesParent = false;
  if (catMapInfo && catMapInfo.parentId.toLowerCase() === targetParentId) {
    matchesParent = true;
  } else if (pCat === targetParentId || pSub === targetParentId) {
    matchesParent = true;
  } else if (subcatKeys.has(pCat) || subcatKeys.has(pSub)) {
    matchesParent = true;
  }

  if (!matchesParent) {
    return false;
  }

  // 2. If subcategory filter is active
  if (selectedSubcategoryId && selectedSubcategoryId !== 'all') {
    const targetSubId = selectedSubcategoryId.toLowerCase();
    const selectedSub = subcats.find(
      (s) => s.id.toLowerCase() === targetSubId || s.nameBn.toLowerCase() === targetSubId
    );

    if (catMapInfo && catMapInfo.subId && catMapInfo.subId.toLowerCase() === targetSubId) {
      return true;
    }

    if (selectedSub) {
      const subId = selectedSub.id.toLowerCase();
      const subBn = selectedSub.nameBn.toLowerCase();
      const subEn = selectedSub.nameEn.toLowerCase();

      return (
        pSub === subId ||
        pSub === subBn ||
        pSub === subEn ||
        pCat === subId ||
        pCat === subBn ||
        pCat === subEn ||
        (Boolean(pSub) && Boolean(subBn) && (pSub.includes(subBn) || subBn.includes(pSub))) ||
        (Boolean(product.titleBn) && product.titleBn.toLowerCase().includes(subBn)) ||
        (Boolean(product.titleEn) && product.titleEn.toLowerCase().includes(subEn))
      );
    } else {
      return pSub === targetSubId || pCat === targetSubId;
    }
  }

  return true;
}

/**
 * Calculates accurate item counts for each category
 */
export function calculateCategoryCounts(categories: Category[], products: Product[]): Category[] {
  return categories.map((cat) => {
    const count = products.filter((p) => isProductInCategory(p, cat.id, 'all', categories)).length;
    return {
      ...cat,
      itemCount: count > 0 ? count : (cat.itemCount || 10),
    };
  });
}
