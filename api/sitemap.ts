import { createClient } from '@supabase/supabase-js';

const CANONICAL_SITE_URL = 'https://www.fujifinder.my.id';

const STATIC_PUBLIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/kamera', changefreq: 'daily', priority: '0.9' },
  { path: '/reviews', changefreq: 'weekly', priority: '0.8' },
  { path: '/guides', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
];

/**
 * Escapes XML special characters according to XML 1.0 specification
 * & -> &amp;
 * < -> &lt;
 * > -> &gt;
 * " -> &quot;
 * ' -> &apos;
 */
function escapeXml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Safely sanitizes article slug for URL embedding
 */
function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') return '';
  const clean = slug.trim().replace(/^\/+|\/+$/g, '');
  return encodeURIComponent(clean);
}

/**
 * Converts any date value to standard W3C ISO YYYY-MM-DD format
 */
function formatIsoLastMod(dateVal?: string | Date | number): string {
  const fallbackToday = new Date().toISOString().split('T')[0];

  if (!dateVal) return fallbackToday;

  if (dateVal instanceof Date) {
    if (!isNaN(dateVal.getTime())) {
      return dateVal.toISOString().split('T')[0];
    }
    return fallbackToday;
  }

  const clean = String(dateVal).trim();
  if (!clean) return fallbackToday;

  // 1. Direct YYYY-MM-DD match
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (year >= 1990 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  // 2. Standard Date parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    if (y >= 1990 && y <= 2100) {
      return parsed.toISOString().split('T')[0];
    }
  }

  // 3. Human textual dates (Indonesian & English)
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
    jun: '06', jul: '07', agu: '08', aug: '08', sep: '09', okt: '10',
    oct: '10', nov: '11', des: '12', dec: '12',
  };
  const lower = clean.toLowerCase();
  const yearMatch = lower.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : null;

  for (const [mName, mNum] of Object.entries(months)) {
    if (lower.includes(mName)) {
      const dayMatch = lower.match(/\b([0-2]?\d|3[01])\b/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      const finalYear = year || new Date().getFullYear().toString();
      const candidate = `${finalYear}-${mNum}-${day}`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
        return candidate;
      }
    }
  }

  return fallbackToday;
}

export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pytnktxszkcnmgmrlaff.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1pmu2vQ5d8Lotefz-2qQXQ_r6qstVJa';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: articles } = await supabase
      .from('articles')
      .select('title, slug, status, date, date_modified, updated_at, featured')
      .eq('status', 'published');

    const domain = CANONICAL_SITE_URL;
    const todayIso = new Date().toISOString().split('T')[0];

    const staticNodes = STATIC_PUBLIC_ROUTES.map((r) => `  <url>
    <loc>${escapeXml(`${domain}${r.path}`)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

    const published = (articles || []).filter((a: any) => a && a.slug && a.status === 'published');
    const seen = new Set<string>();
    const articleNodes: string[] = [];

    for (const art of published) {
      const cleanSlug = sanitizeSlug(art.slug);
      if (!cleanSlug || seen.has(cleanSlug)) continue;
      seen.add(cleanSlug);

      const loc = `${domain}/artikel/${cleanSlug}`;
      const lastmod = formatIsoLastMod(art.date_modified || art.updated_at || art.date);
      const priority = art.featured ? '0.9' : '0.8';

      articleNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }

    const allNodes = articleNodes.length > 0 ? `${staticNodes}\n${articleNodes.join('\n')}` : staticNodes;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allNodes}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err: any) {
    console.error('Sitemap API error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const today = new Date().toISOString().split('T')[0];
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${CANONICAL_SITE_URL}/kamera</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_SITE_URL}/reviews</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CANONICAL_SITE_URL}/guides</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CANONICAL_SITE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  }
}
