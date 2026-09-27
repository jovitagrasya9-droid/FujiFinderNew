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
 * Escapes XML special characters according to XML 1.0 specification
 * Minimal entities handled:
 * & -> &amp;
 * < -> &lt;
 * > -> &gt;
 * " -> &quot;
 * ' -> &apos;
 */
export function escapeXml(str: string): string {
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
export function sanitizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') return '';
  const clean = slug.trim().replace(/^\/+|\/+$/g, '');
  return encodeURIComponent(clean);
}

/**
 * Converts any date string to standard W3C ISO YYYY-MM-DD format
 */
export function formatIsoLastMod(dateVal?: string | Date | number): string {
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

/**
 * Generates official, clean, Google-compliant XML sitemap string
 * Simplified standard format without image extensions for 100% GSC compatibility.
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
      art.status === 'published' &&
      typeof art.slug === 'string' &&
      art.slug.trim().length > 0
  );

  // Deduplicate articles by slug
  const seenSlugs = new Set<string>();
  const uniqueArticles: { slug: string; lastmod: string; priority: string }[] = [];
  for (const art of publishedArticles) {
    const cleanSlug = sanitizeSlug(art.slug);
    if (!cleanSlug || seenSlugs.has(cleanSlug)) continue;
    seenSlugs.add(cleanSlug);

    const lastmod = formatIsoLastMod(art.dateModified || art.date);
    const priority = art.featured ? '0.9' : '0.8';
    uniqueArticles.push({ slug: cleanSlug, lastmod, priority });
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
    const loc = `${domain}/artikel/${art.slug}`;
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${art.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${art.priority}</priority>
  </url>`;
  }).join('\n');

  const allNodes = articleUrlNodes ? `${staticUrlNodes}\n${articleUrlNodes}` : staticUrlNodes;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allNodes}
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
      .select('id, title, slug, status, date, date_modified, updated_at, featured')
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
      coverImage: '',
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
