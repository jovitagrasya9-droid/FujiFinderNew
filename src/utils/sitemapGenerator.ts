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
 * Normalizes any date string (ISO, timestamp, or Indonesian/English text) to standard YYYY-MM-DD
 */
export function formatIsoLastMod(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    return new Date().toISOString().split('T')[0];
  }

  // Already standard YYYY-MM-DD or ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  // Try standard Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Handle formats like "22 Sep 2026" or "Sep 2026"
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
    jun: '06', jul: '07', agu: '08', aug: '08', sep: '09', okt: '10',
    oct: '10', nov: '11', des: '12', dec: '12',
  };

  const lower = dateStr.toLowerCase();
  const yearMatch = lower.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  for (const [mName, mNum] of Object.entries(months)) {
    if (lower.includes(mName)) {
      const dayMatch = lower.match(/\b([0-2]?\d|3[01])\b/);
      const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return `${year}-${mNum}-${day}`;
    }
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Escapes special XML characters to ensure 100% valid XML output
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
 * Generates official XML sitemap string from published articles and static pages
 */
export function generateSitemapXml(
  articles: Article[],
  baseUrl: string = CANONICAL_SITE_URL
): string {
  const domain = baseUrl.replace(/\/+$/, '');
  const todayIso = new Date().toISOString().split('T')[0];

  // 1. Filter only published articles with valid slug (exclude drafts, deleted, invalid)
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

  // 2. Build XML blocks
  const staticUrlNodes = STATIC_PUBLIC_ROUTES.map((route) => {
    const loc = `${domain}${route.path}`;
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  const articleUrlNodes = uniqueArticles.map((art) => {
    const loc = `${domain}/artikel/${art.slug.trim()}`;
    const lastmod = formatIsoLastMod(art.dateModified || art.date);
    const priority = art.featured ? '0.9' : '0.8';

    // Optional Google Image Sitemap extension for richer discovery
    let imageXml = '';
    if (art.coverImage && art.coverImage.startsWith('http')) {
      imageXml = `
    <image:image>
      <image:loc>${escapeXml(art.coverImage)}</image:loc>
      <image:title>${escapeXml(art.title)}</image:title>
    </image:image>`;
    }

    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imageXml}
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
 * Fetches published articles live from Supabase database and generates the fresh sitemap XML
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
      // Fallback to starter articles if database is offline or empty
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
 * Triggers a browser download of the generated sitemap.xml file
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

