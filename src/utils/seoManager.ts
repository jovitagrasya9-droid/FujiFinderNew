import { Article } from '../types';

export interface SEOConfig {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  articleSection?: string;
  keywords?: string[];
}

const DEFAULT_SITE_NAME = 'FujiFinder';
const DEFAULT_SITE_TITLE = 'FujiFinder — The Art & Science of Modern Cameras';
const DEFAULT_SITE_DESC =
  'The premier discovery publication for photographers and filmmakers. Explore authentic camera reviews, field benchmarks, and visual craftsmanship.';
const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';

/**
 * Sets or updates a <meta> tag in the document head
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or updates canonical <link> tag
 */
function setCanonicalLink(href: string) {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Sets or updates Schema.org JSON-LD structured data script
 */
function setJsonLd(id: string, data: object) {
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('id', id);
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data, null, 2);
}

/**
 * Updates all HTML Head SEO Tags dynamically (Title, Description, Canonical, OG, Twitter, JSON-LD)
 */
export function updateDocumentSEO(config: Partial<SEOConfig>) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentUrl = config.canonicalUrl || (origin ? `${origin}${pathname}` : '');

  const title = config.title ? `${config.title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_TITLE;
  const description = config.description || DEFAULT_SITE_DESC;
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  const ogType = config.ogType || 'website';

  // 1. Primary Page Title
  document.title = title;

  // 2. Standard Meta Description & Robots
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // 3. Canonical URL
  if (currentUrl) {
    setCanonicalLink(currentUrl);
  }

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);
  setMetaTag('property', 'og:title', config.title || DEFAULT_SITE_TITLE);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:image', ogImage);
  if (config.ogImageAlt) {
    setMetaTag('property', 'og:image:alt', config.ogImageAlt);
  }

  // 5. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title || DEFAULT_SITE_TITLE);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', ogImage);

  // 6. JSON-LD Structured Data
  if (ogType === 'article') {
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': currentUrl,
      },
      headline: config.title || DEFAULT_SITE_TITLE,
      description: description,
      image: [ogImage],
      datePublished: config.datePublished || new Date().toISOString(),
      dateModified: config.dateModified || config.datePublished || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: config.authorName || 'FujiFinder Editorial Team',
      },
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/favicon.ico`,
        },
      },
      articleSection: config.articleSection || 'Photography',
      keywords: config.keywords?.join(', '),
    };
    setJsonLd('seo-article-jsonld', articleJsonLd);
  } else {
    // Website Structured Data for homepage & catalog
    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: DEFAULT_SITE_NAME,
      url: origin || 'https://fujifinder.app',
      description: DEFAULT_SITE_DESC,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
    setJsonLd('seo-article-jsonld', websiteJsonLd);
  }
}

/**
 * Convenience helper specifically for Article objects
 */
export function setArticleSEO(article: Article, baseUrl?: string) {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const publicUrl = `${origin}/artikel/${article.slug}`;

  updateDocumentSEO({
    title: article.seoTitle?.trim() || article.title,
    description: article.metaDescription?.trim() || article.summary,
    canonicalUrl: publicUrl,
    ogType: 'article',
    ogImage: article.coverImage,
    ogImageAlt: article.coverImageAlt || article.title,
    datePublished: article.date,
    dateModified: article.dateModified || article.date,
    authorName: article.author?.name || 'FujiFinder Editorial Team',
    articleSection: article.category,
    keywords: article.tags,
  });
}

/**
 * Resets document SEO back to default website homepage metadata
 */
export function resetDefaultSEO(pageTitle?: string, pageDesc?: string) {
  updateDocumentSEO({
    title: pageTitle,
    description: pageDesc,
    ogType: 'website',
  });
}

/**
 * Utility to check whether an article has all critical SEO fields populated
 */
export function checkSEOReadiness(article: Partial<Article>): {
  isReady: boolean;
  score: number;
  missingFields: string[];
} {
  const missing: string[] = [];
  if (!article.title?.trim()) missing.push('Judul Artikel');
  if (!article.slug?.trim()) missing.push('URL Slug');
  if (!article.metaDescription?.trim() && !article.summary?.trim()) missing.push('Meta Description / Ringkasan');
  if (!article.coverImage?.trim()) missing.push('Cover Image');
  if (!article.content || article.content.length === 0) missing.push('Konten Artikel');

  const total = 5;
  const completed = total - missing.length;
  const score = Math.round((completed / total) * 100);

  return {
    isReady: missing.length === 0,
    score,
    missingFields: missing,
  };
}

/**
 * Helper to generate URL-safe slugs from titles
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single hyphens
    .replace(/^-+|-+$/g, ''); // trim leading & trailing hyphens
}
