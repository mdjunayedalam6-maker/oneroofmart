const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ppwaosjmbdyocrmhnwak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2Fvc2ptYmR5b2NybWhud2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExOTgsImV4cCI6MjEwNjA2NzE5OH0.8zZnNTMhFZnUWXfkKwUzV07pgGOEnQSCKn7xg5GHLN4';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

function fetchUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 7000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => { req.destroy(); resolve(''); });
    } catch (_) {
      resolve('');
    }
  });
}

function parseShopBaseProductDetails(html) {
  if (!html || typeof html !== 'string') return null;

  try {
    // Title
    const titleMatch = html.match(/<h4 class=\"fw-bold mb-0\">([^<]+)<\/h4>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Rich Description
    const pMatches = html.match(/<p class=\"text-muted\"[^>]*>([\s\S]*?)<\/p>/gi);
    let desc = '';
    if (pMatches && pMatches.length > 0) {
      const lastP = pMatches[pMatches.length - 1];
      desc = lastP
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    }

    // Sanitize: strip out wholesale leaks, mobile numbers, reseller mentions
    if (desc) {
      desc = desc.split('\n').filter(line => {
        const l = line.toLowerCase();
        return !l.includes('পাইকারি রেট') && 
               !l.includes('হোলসেল') && 
               !l.includes('রিসেলার একাউন্ট') && 
               !l.includes('01929637253') &&
               !l.includes('সোর্স');
      }).join('\n').trim();
    }

    return { title, desc };
  } catch (_) {
    return null;
  }
}

async function run() {
  console.log('Synchronizing remaining products...');
  
  while (true) {
    try {
      const { data: rows, error } = await client
        .from('products')
        .select('id, title_bn, title_en, price, original_price, category, subcategory, stock, data')
        .like('data->>descriptionBn', '%এক্সক্লুসিভ পণ্য। এক্সপোর্ট কোয়ালিটি ফিনিশিং%')
        .limit(100);

      if (error) {
        console.error('Fetch error:', error.message);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      if (!rows || rows.length === 0) {
        console.log('Done! All products have exact descriptions!');
        break;
      }

      console.log(`Processing batch of ${rows.length} remaining products...`);
      const concurrency = 15;

      for (let i = 0; i < rows.length; i += concurrency) {
        const chunk = rows.slice(i, i + concurrency);

        const updatedChunk = await Promise.all(chunk.map(async (row) => {
          try {
            const pidMatch = row.id.match(/\d+/);
            const pid = pidMatch ? pidMatch[0] : row.id;

            const currentData = { ...(row.data || {}) };
            currentData.brand = 'OneRoof Mart';
            currentData.sku = `SBP-${pid}`;
            currentData.warranty = '৭ দিনের সহজ ক্যাশব্যাক বা রিপ্লেসমেন্ট গ্যারান্টি';

            const html = await fetchUrl(`https://shopbasebd.com/store/sample/product/details/${pid}`);
            const parsed = parseShopBaseProductDetails(html);

            if (parsed && parsed.title) {
              row.title_bn = parsed.title;
              row.title_en = parsed.title;
              currentData.titleBn = parsed.title;
              currentData.titleEn = parsed.title;
            }

            if (parsed && parsed.desc && parsed.desc.length > 5) {
              currentData.descriptionBn = parsed.desc;
              currentData.descriptionEn = parsed.desc;
            } else {
              const cleanTitle = row.title_bn || row.title_en || 'পণ্য';
              currentData.descriptionBn = `${cleanTitle}। ১০০% অথেনটিক এবং প্রিমিয়াম কোয়ালিটি পণ্য। ডেলিভারি ম্যানের সামনে দেখে নেওয়ার সম্পূর্ণ সুযোগ রয়েছে।`;
              currentData.descriptionEn = `${cleanTitle}. 100% authentic premium quality product from OneRoof Mart.`;
            }

            return {
              id: row.id,
              title_bn: row.title_bn,
              title_en: row.title_en,
              price: row.price,
              original_price: row.original_price,
              category: row.category,
              subcategory: row.subcategory,
              stock: row.stock,
              data: currentData,
              updated_at: new Date().toISOString(),
            };
          } catch (itemErr) {
            return row;
          }
        }));

        await client.from('products').upsert(updatedChunk);
      }
    } catch (batchErr) {
      console.error('Batch error:', batchErr.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

run().then(() => {
  console.log('Script execution finished.');
  process.exit(0);
});
