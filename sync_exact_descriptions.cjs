// Scrapes exact unique product titles, rich descriptions, and SKUs from ShopBase BD
// and updates them into Supabase under the white-labeled brand "OneRoof Mart"

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ppwaosjmbdyocrmhnwak.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2Fvc2ptYmR5b2NybWhud2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExOTgsImV4cCI6MjEwNjA2NzE5OH0.8zZnNTMhFZnUWXfkKwUzV07pgGOEnQSCKn7xg5GHLN4';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function parseShopBaseProductDetails(html) {
  if (!html) return null;

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

  // Sanitize: strip out wholesale leaks or reseller mobile numbers if present
  if (desc) {
    desc = desc.split('\n').filter(line => {
      const l = line.toLowerCase();
      return !l.includes('পাইকারি রেট') && 
             !l.includes('হোলসেল') && 
             !l.includes('রিসেলার একাউন্ট') && 
             !l.includes('01929637253');
    }).join('\n').trim();
  }

  return { title, desc };
}

async function run() {
  console.log('Fetching products from Supabase...');
  const { count } = await client.from('products').select('*', { count: 'exact', head: true });
  console.log(`Total products in database: ${count}`);

  const step = 500;
  let from = 0;
  let updatedCount = 0;

  while (true) {
    const { data: rows, error } = await client
      .from('products')
      .select('id, title_bn, title_en, price, original_price, category, subcategory, stock, data')
      .order('id', { ascending: true })
      .range(from, from + step - 1);

    if (error || !rows || rows.length === 0) break;

    console.log(`\nProcessing batch ${from} to ${from + rows.length - 1}...`);

    // Process with concurrency of 25
    const concurrency = 25;
    for (let i = 0; i < rows.length; i += concurrency) {
      const chunk = rows.slice(i, i + concurrency);

      const updatedChunk = await Promise.all(chunk.map(async (row) => {
        const pidMatch = row.id.match(/\d+/);
        if (!pidMatch) return row;
        const pid = pidMatch[0];

        const html = await fetchUrl(`https://shopbasebd.com/store/sample/product/details/${pid}`);
        const parsed = parseShopBaseProductDetails(html);

        const currentData = { ...(row.data || {}) };
        currentData.brand = 'OneRoof Mart';
        currentData.sku = `SBP-${pid}`;
        currentData.warranty = '৭ দিনের সহজ ক্যাশব্যাক বা রিপ্লেসমেন্ট গ্যারান্টি';

        if (parsed && parsed.title) {
          row.title_bn = parsed.title;
          row.title_en = parsed.title;
          currentData.titleBn = parsed.title;
          currentData.titleEn = parsed.title;
        }

        if (parsed && parsed.desc && parsed.desc.length > 10) {
          currentData.descriptionBn = parsed.desc;
          currentData.descriptionEn = parsed.desc;
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
      }));

      // Upsert updated chunk to Supabase
      const { error: upsertErr } = await client.from('products').upsert(updatedChunk);
      if (upsertErr) {
        console.error('Upsert error:', upsertErr.message);
      } else {
        updatedCount += updatedChunk.length;
        process.stdout.write(`Updated ${updatedCount} products...\r`);
      }
    }

    if (rows.length < step) break;
    from += step;
  }

  console.log(`\nAll products updated with exact ShopBase BD descriptions and titles! Total: ${updatedCount}`);
}

run();
