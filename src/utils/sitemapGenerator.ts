import { Article } from '../types';
import { FUJIFILM_STARTER_ARTICLES } from '../data/mockData';
import { supabase } from '../lib/supabase';

export const CANONICAL_SITE_URL = 'https://www.fujifinder.my.id';

export interface StaticRouteConfig {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  title: string;
}

export const STATIC_PUBLIC_ROUTES: StaticRouteConfig[] = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    title: 'FujiFinder — The Art & Science of Modern Cameras',
  },
  {
    path: '/kamera',
    changefreq: 'daily',
    priority: '0.9',
    title: 'Katalog Kamera Mirrorless & Compact',
  },
  {
    path: '/reviews',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Lab Reviews & Field Tests',
  },
  {
    path: '/guides',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Panduan Fotografi & Resep Film',
  },
  {
    path: '/blog',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Jurnal & Opini Editorial Fotografi',
  },
];

/**
 * Converts any date string to standard W3C ISO YYYY-MM-DD format
 */
export function formatIsoLastMod(dateStr?: string): string {
  const fallbackToday = new Date().toISOString().split('T')[0];

  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return fallbackToday;
  }

  const clean = dateStr.trim();

  // 1. Match YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (year >= 1990 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  // 2. Parse human textual dates (Indonesian & English)
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

  // 3. Fallback standard Date parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return fallbackToday;
}

/**
 * Escapes XML special characters for 100% valid XML
 */
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates official, clean, Google-compliant XML sitemap string
 */
export function generateSitemapXml(
  articles: Article[],
  baseUrl: string = CANONICAL_SITE_URL
): string {
  const domain = baseUrl.replace(/\/+$/, '');
  const todayIso = new Date().toISOString().split('T')[0];

  // Filter only published articles with non-empty slug
  const publishedArticles = (articles || []).filter(
    (art) =>
      art &&
      art.status !== 'draft' &&
      typeof art.slug === 'string' &&
      art.slug.trim().length > 0
  );

  // Deduplicate articles by slug
  const seenSlugs = new Set<string>();
  const uniqueArticles: Article[] = [];
  for (const art of publishedArticles) {
    const cleanSlug = art.slug.trim();
    if (!seenSlugs.has(cleanSlug)) {
      seenSlugs.add(cleanSlug);
      uniqueArticles.push(art);
    }
  }

  // Static routes
  const staticUrlNodes = STATIC_PUBLIC_ROUTES.map((route) => {
    const loc = `${domain}${route.path}`;
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  // Article routes
  const articleUrlNodes = uniqueArticles.map((art) => {
    const loc = `${domain}/artikel/${art.slug.trim()}`;
    const lastmod = formatIsoLastMod(art.dateModified || art.date);
    const priority = art.featured ? '0.9' : '0.8';

    let imageBlock = '';
    if (art.coverImage && art.coverImage.startsWith('http')) {
      imageBlock = `
    <image:image>
      <image:loc>${escapeXml(art.coverImage)}</image:loc>
    </image:image>`;
    }

    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imageBlock}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrlNodes}
${articleUrlNodes}
</urlset>`.trim();
}

/**
 * Fetches published articles live from Supabase database and generates the sitemap XML
 */
export async function buildDynamicSitemapXml(
  baseUrl: string = CANONICAL_SITE_URL
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, status, date, date_modified, cover_image, featured')
      .eq('status', 'published');

    if (error || !data || data.length === 0) {
      return generateSitemapXml(FUJIFILM_STARTER_ARTICLES, baseUrl);
    }

    const articlesFromDb: Article[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status || 'published',
      date: row.date || new Date().toISOString().split('T')[0],
      dateModified: row.date_modified || row.updated_at || undefined,
      coverImage: row.cover_image || '',
      featured: Boolean(row.featured),
      category: 'Editorial',
      readTime: '5 min read',
      summary: '',
      content: [],
      author: {
        id: 'author-default',
        name: 'FujiFinder Editorial Team',
        role: 'Senior Camera Reviewer',
        avatar: '',
        bio: '',
        socials: {},
      },
      tags: [],
    }));

    return generateSitemapXml(articlesFromDb, baseUrl);
  } catch (err) {
    console.warn('Error fetching Supabase articles for sitemap:', err);
    return generateSitemapXml(FUJIFILM_STARTER_ARTICLES, baseUrl);
  }
}

/**
 * Triggers a download of the generated sitemap.xml
 */
export function downloadSitemap(
  articles: Article[],
  filename: string = 'sitemap.xml',
  baseUrl: string = CANONICAL_SITE_URL
): void {
  const xml = generateSitemapXml(articles, baseUrl);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
