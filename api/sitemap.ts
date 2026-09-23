import { createClient } from '@supabase/supabase-js';

const CANONICAL_SITE_URL = 'https://www.fujifinder.my.id';

const STATIC_PUBLIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/kamera', changefreq: 'daily', priority: '0.9' },
  { path: '/reviews', changefreq: 'weekly', priority: '0.8' },
  { path: '/guides', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
];

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatIsoLastMod(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    return new Date().toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pytnktxszkcnmgmrlaff.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1pmu2vQ5d8Lotefz-2qQXQ_r6qstVJa';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: articles } = await supabase
      .from('articles')
      .select('title, slug, status, date, date_modified, cover_image, featured')
      .eq('status', 'published');

    const domain = CANONICAL_SITE_URL;
    const todayIso = new Date().toISOString().split('T')[0];

    const staticNodes = STATIC_PUBLIC_ROUTES.map((r) => `  <url>
    <loc>${escapeXml(`${domain}${r.path}`)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

    const published = (articles || []).filter((a: any) => a && a.slug && a.status !== 'draft');
    const seen = new Set<string>();
    const articleNodes: string[] = [];

    for (const art of published) {
      const slug = art.slug.trim();
      if (seen.has(slug)) continue;
      seen.add(slug);

      const loc = `${domain}/artikel/${slug}`;
      const lastmod = formatIsoLastMod(art.date_modified || art.date);
      const priority = art.featured ? '0.9' : '0.8';

      let imgTag = '';
      if (art.cover_image && art.cover_image.startsWith('http')) {
        imgTag = `\n    <image:image>\n      <image:loc>${escapeXml(art.cover_image)}</image:loc>\n      <image:title>${escapeXml(art.title || '')}</image:title>\n    </image:image>`;
      }

      articleNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imgTag}
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticNodes}
${articleNodes.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err: any) {
    console.error('Sitemap API error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  }
}
