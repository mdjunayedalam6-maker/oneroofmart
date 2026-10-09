// Clean up all products in Supabase:
// 1. Enforce 100% white-labeled store brand ("OneRoof Mart")
// 2. Remove all mentions of ShopBase, wholesale prices, reseller accounts
// 3. Keep wholesalePrice and profitMarginPercent internally for admin profit calculations
// 4. Ensure all products have clean customer-facing specifications and descriptions

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ppwaosjmbdyocrmhnwak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2Fvc2ptYmR5b2NybWhud2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExOTgsImV4cCI6MjEwNjA2NzE5OH0.8zZnNTMhFZnUWXfkKwUzV07pgGOEnQSCKn7xg5GHLN4';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

function sanitizeProduct(p) {
  const d = { ...(p.data || {}) };
  d.brand = 'OneRoof Mart';

  // Sanitize tags
  if (Array.isArray(d.tags)) {
    d.tags = d.tags.filter(t => !['shopbase', 'dropshipping', 'wholesale'].includes(String(t).toLowerCase()));
    if (!d.tags.includes('oneroof')) d.tags.push('oneroof');
    if (!d.tags.includes('premium')) d.tags.push('premium');
  } else {
    d.tags = ['oneroof', 'premium'];
  }

  // Sanitize descriptionBn
  let desc = d.descriptionBn || '';
  desc = desc.replace(/ShopBase BD পণ্য/gi, 'OneRoof Mart এক্সক্লুসিভ পণ্য');
  desc = desc.replace(/ShopBase BD/gi, 'OneRoof Mart');
  desc = desc.replace(/ShopBaseBD Official/gi, 'OneRoof Official');
  desc = desc.replace(/ShopBase/gi, 'OneRoof');
  
  // Remove lines mentioning wholesale price or reseller accounts
  desc = desc.split('\n').filter(line => {
    const l = line.toLowerCase();
    return !l.includes('পাইকারি রেট') && 
           !l.includes('পাইকারি মূল্য') && 
           !l.includes('হোলসেল') && 
           !l.includes('রিসেলার একাউন্ট') && 
           !l.includes('01929637253') &&
           !l.includes('আপনার নিট প্রফিট') &&
           !l.includes('আপনার লাভ');
  }).join('\n').trim();

  if (!desc || desc.length < 15) {
    desc = 'প্রিমিয়াম কোয়ালিটি OneRoof Mart এক্সক্লুসিভ পণ্য। এক্সপোর্ট কোয়ালিটি ফিনিশিং ও আধুনিক ডিজাইন।\n\n• ডেলিভারি: ঢাকা সিটিতে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা (ক্যাশ অন ডেলিভারি)\n• এক্সচেঞ্জ পলিসি: ৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট সুবিধা।';
  }
  d.descriptionBn = desc;

  if (d.descriptionEn) {
    d.descriptionEn = d.descriptionEn.replace(/ShopBase BD/gi, 'OneRoof Mart').replace(/ShopBase/gi, 'OneRoof');
  }

  // Clean specifications
  const forbiddenKeys = ['সোর্স', 'উৎস', 'পাইকারি', 'হোলসেল', 'লাভ', 'প্রফিট', 'রিসেলার', 'একাউন্ট'];
  const cleanSpecs = {};
  cleanSpecs['ব্র্যান্ড'] = 'OneRoof Mart';
  cleanSpecs['কোয়ালিটি'] = '১০০% প্রিমিয়াম এক্সপোর্ট স্ট্যান্ডার্ড';
  cleanSpecs['ডেলিভারি'] = 'সারাদেশে ক্যাশ অন ডেলিভারি (২-৪ দিন)';
  cleanSpecs['ওয়ারেন্টি'] = '৭ দিনের রিটার্ন ও রিপ্লেসমেন্ট';

  if (d.specifications && typeof d.specifications === 'object') {
    Object.entries(d.specifications).forEach(([k, v]) => {
      const isForbidden = forbiddenKeys.some(f => k.includes(f));
      if (!isForbidden) {
        let valStr = String(v)
          .replace(/ShopBase BD/gi, 'OneRoof Mart')
          .replace(/ShopBaseBD Official/gi, 'OneRoof Official')
          .replace(/ShopBase/gi, 'OneRoof')
          .replace(/01929637253/g, '');
        if (!valStr.toLowerCase().includes('reseller') && !valStr.toLowerCase().includes('wholesale')) {
          cleanSpecs[k] = valStr;
        }
      }
    });
  }
  d.specifications = cleanSpecs;

  // Wholesale price & Margin calculation
  const wholesale = Number(d.wholesalePrice || p.price || 300);
  const margin = Number(d.profitMarginPercent || 15);
  d.wholesalePrice = wholesale;
  d.profitMarginPercent = margin;
  const retailPrice = Math.round(wholesale * (1 + margin / 100));
  d.price = retailPrice;

  return {
    id: p.id,
    title_bn: p.title_bn,
    title_en: p.title_en,
    price: retailPrice,
    original_price: p.original_price || Math.round(retailPrice * 1.3),
    category: p.category,
    subcategory: p.subcategory,
    stock: p.stock || 50,
    data: d,
    updated_at: new Date().toISOString(),
  };
}

async function runCleanup() {
  console.log('Starting white-label cleanup on Supabase products...');
  const step = 500;
  let from = 0;
  let totalProcessed = 0;

  while (true) {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      console.error('Error fetching batch:', error);
      break;
    }
    if (!data || data.length === 0) break;

    const cleanedBatch = data.map(sanitizeProduct);
    const { error: upsertErr } = await client.from('products').upsert(cleanedBatch);

    if (upsertErr) {
      console.error('Upsert batch error:', upsertErr);
    } else {
      totalProcessed += cleanedBatch.length;
      console.log(`Processed ${totalProcessed} products...`);
    }

    if (data.length < step) break;
    from += step;
  }

  console.log(`White-label cleanup complete! Total processed: ${totalProcessed}`);
}

runCleanup();
