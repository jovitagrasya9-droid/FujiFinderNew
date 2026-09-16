import { Article } from '../types';

/**
 * Generates valid XML Sitemap string for all published articles & key routes
 */
export function generateSitemapXml(articles: Article[], customBaseUrl?: string): string {
  const origin =
    customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://fujifinder.app');
  const currentDate = new Date().toISOString().split('T')[0];

  // Static key pages
  const staticPages = [
    { loc: `${origin}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${origin}/kamera`, priority: '0.9', changefreq: 'daily' },
    { loc: `${origin}/ulasan`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${origin}/panduan`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${origin}/jurnal`, priority: '0.8', changefreq: 'daily' },
  ];

  // Published articles only
  const publishedArticles = articles.filter((a) => a.status !== 'draft');

  const articleEntries = publishedArticles.map((article) => {
    const loc = `${origin}/artikel/${article.slug}`;
    const lastmod = article.dateModified || article.date || currentDate;
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const staticEntries = staticPages.map((page) => {
    return `  <url>
    <loc>${escapeXml(page.loc)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join('\n')}
${articleEntries.join('\n')}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Downloads the current sitemap.xml as a file or copies it to clipboard
 */
export function downloadSitemap(articles: Article[]) {
  const xml = generateSitemapXml(articles);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
