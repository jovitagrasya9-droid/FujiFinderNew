import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL_SITE_URL = 'https://www.fujifinder.my.id';

const STATIC_PUBLIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/kamera', changefreq: 'daily', priority: '0.9' },
  { path: '/reviews', changefreq: 'weekly', priority: '0.8' },
  { path: '/guides', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
];

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchArticles() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pytnktxszkcnmgmrlaff.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1pmu2vQ5d8Lotefz-2qQXQ_r6qstVJa';

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/articles?select=title,slug,status,date,date_modified,cover_image,featured&status=eq.published`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('Could not fetch online articles during build, using defaults:', err.message);
  }

  // Fallback defaults if offline during build
  return [
    {
      title: 'Cara Memindahkan Foto Fujifilm ke HP: Panduan XApp, Camera Remote, dan Card Reader',
      slug: 'cara-memindahkan-foto-fujifilm-ke-hp-panduan-xapp-camera-remote-dan-card-reader',
      date: '2026-09-23',
      featured: true,
      cover_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Resep Film Fujifilm Terbaik untuk Street Photography: Warna Analog Langsung dari Kamera',
      slug: 'resep-film-fujifilm-terbaik-untuk-street-photography-warna-analog-langsung-dari-kamera',
      date: '2026-09-23',
      featured: false,
      cover_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Fujifilm X-T5 vs X-T50: Mana yang Harus Anda Pilih untuk Fotografi Harian?',
      slug: 'fujifilm-x-t5-vs-x-t50-mana-yang-harus-anda-pilih-untuk-fotografi-harian',
      date: '2026-09-23',
      featured: false,
      cover_image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Review Fujifilm X100VI: Apakah Kamera Compact Paling Viral Ini Layak Dibeli?',
      slug: 'review-fujifilm-x100vi-apakah-kamera-compact-paling-viral-ini-layak-dibeli',
      date: '2026-09-23',
      featured: false,
      cover_image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80',
    },
  ];
}

async function run() {
  const articles = await fetchArticles();
  const domain = CANONICAL_SITE_URL;
  const todayIso = new Date().toISOString().split('T')[0];

  const staticNodes = STATIC_PUBLIC_ROUTES.map((r) => `  <url>
    <loc>${escapeXml(`${domain}${r.path}`)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

  const seen = new Set();
  const articleNodes = [];

  for (const art of articles) {
    if (!art || !art.slug) continue;
    const slug = art.slug.trim();
    if (seen.has(slug)) continue;
    seen.add(slug);

    const loc = `${domain}/artikel/${slug}`;
    const lastmod = art.date_modified ? art.date_modified.split('T')[0] : (art.date || todayIso);
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

  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap] Generated public/sitemap.xml with ${STATIC_PUBLIC_ROUTES.length + articleNodes.length} URLs`);

  const distPath = path.resolve(__dirname, '../dist/sitemap.xml');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap] Copied to dist/sitemap.xml`);
  }
}

run().catch(console.error);
