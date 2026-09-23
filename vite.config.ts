import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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

function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/sitemap.xml' || req.url === '/sitemap') {
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

            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=14400');
            res.statusCode = 200;
            res.end(xml);
            return;
          } catch (e) {
            console.error('Error generating dev sitemap:', e);
            next();
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemapPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
});
