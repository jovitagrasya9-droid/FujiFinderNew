import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  Share2,
  Check,
  ArrowLeft,
  Bookmark,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Camera,
  Star,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Article, CameraProduct } from '../types';
import { ArticleContentRenderer } from './ArticleContentRenderer';
import { setArticleSEO, resetDefaultSEO } from '../utils/seoManager';
import { formatIDR } from '../utils/formatCurrency';

interface PublicArticleViewProps {
  article: Article;
  allPublishedArticles: Article[];
  allCameras: CameraProduct[];
  onBackToHome: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectCamera: (camera: CameraProduct) => void;
}

export const PublicArticleView: React.FC<PublicArticleViewProps> = ({
  article,
  allPublishedArticles,
  allCameras,
  onBackToHome,
  onSelectArticle,
  onSelectCamera,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Set Technical SEO metadata & JSON-LD dynamically when page loads
  useEffect(() => {
    setArticleSEO(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      resetDefaultSEO();
    };
  }, [article]);

  const handleShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/artikel/${article.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const relatedCamera = article.recommendedCameraId
    ? allCameras.find((c) => c.id === article.recommendedCameraId)
    : undefined;

  // Simple Related Articles (excluding current article)
  const relatedArticles = allPublishedArticles
    .filter((a) => a.id !== article.id && a.status !== 'draft')
    .slice(0, 3);

  const publicCanonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/artikel/${article.slug}`
    : `/artikel/${article.slug}`;

  return (
    <article
      id={`article-page-${article.slug}`}
      itemScope
      itemType="https://schema.org/Article"
      className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* 1. SEO Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <li>
            <button
              onClick={onBackToHome}
              className="hover:text-neutral-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Home</span>
            </button>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </li>
          <li>
            <span className="text-neutral-500 hover:text-neutral-900 cursor-pointer" onClick={onBackToHome}>
              Artikel
            </span>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </li>
          <li>
            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-bold">
              {article.category}
            </span>
          </li>
          <li className="hidden sm:inline-flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 line-clamp-1 max-w-xs font-medium">
              {article.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Jurnal</span>
        </button>
      </div>

      {/* 2. Article Header & H1 */}
      <header className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          {article.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Editorial Spotlight</span>
            </span>
          )}
        </div>

        <h1
          itemProp="headline"
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]"
        >
          {article.title}
        </h1>

        {article.summary && (
          <p
            itemProp="description"
            className="text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal"
          >
            {article.summary}
          </p>
        )}

        {/* Byline and Metadata Bar */}
        <div className="pt-4 border-t border-b border-neutral-100 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Author */}
          <div
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
            className="flex items-center gap-3"
          >
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-neutral-200"
            />
            <div>
              <span
                itemProp="name"
                className="block text-sm font-bold text-neutral-900"
              >
                {article.author.name}
              </span>
              <span className="block text-xs text-neutral-500">
                {article.author.role}
              </span>
            </div>
          </div>

          {/* Date, ReadTime, Actions */}
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time itemProp="datePublished" dateTime={article.date}>
                {article.date}
              </time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Bagikan Tautan Publik Artikel Ini"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Bagikan URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Cover Image with SEO Alt Text */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 mb-10 shadow-sm">
        <img
          itemProp="image"
          src={article.coverImage}
          alt={article.coverImageAlt || article.title}
          className="w-full h-auto max-h-[520px] object-cover object-center"
          loading="eager"
        />
        {article.coverImageAlt && (
          <div className="px-4 py-2 bg-neutral-950/80 backdrop-blur-xs text-neutral-300 text-xs italic">
            Foto: {article.coverImageAlt}
          </div>
        )}
      </div>

      {/* 4. Article Body Content */}
      <div itemProp="articleBody" className="space-y-6 text-neutral-800 leading-relaxed">
        <ArticleContentRenderer content={article.content} />
      </div>

      {/* 5. Recommended Camera Highlight Box (if available) */}
      {relatedCamera && (
        <aside className="my-10 p-6 sm:p-8 rounded-3xl bg-neutral-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Camera className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Peralatan Kamera yang Diulas / Direkomendasikan</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
              <img
                src={relatedCamera.image}
                alt={relatedCamera.name}
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-2xl bg-white/10 p-2"
              />

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                    {relatedCamera.brand}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{relatedCamera.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold">{relatedCamera.name}</h3>
                <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2">
                  {relatedCamera.shortDesc}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="text-lg font-extrabold text-white">
                    {formatIDR(relatedCamera.price)}
                  </span>
                  <button
                    onClick={() => onSelectCamera(relatedCamera)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <span>Lihat Spesifikasi Lengkap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 6. Tags & SEO Metadata Info Footer */}
      <footer className="mt-12 pt-8 border-t border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Topik:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Canonical: {article.slug}</span>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="mt-8 p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-16 h-16 rounded-full object-cover border border-neutral-300"
          />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-neutral-900">
              Ditulis oleh {article.author.name}
            </h4>
            <p className="text-xs text-neutral-500 font-medium">{article.author.role}</p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
              {article.author.bio}
            </p>
          </div>
        </div>
      </footer>

      {/* 7. Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 pt-10 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              Artikel Terkait Lainnya
            </h3>
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Lihat Semua Jurnal →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel)}
                className="group rounded-2xl bg-white border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 w-full overflow-hidden bg-neutral-100 relative">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-neutral-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      {rel.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                      <span>{rel.date}</span>
                      <span>•</span>
                      <span>{rel.readTime}</span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                </div>

                <div className="p-4 pt-0 text-xs font-semibold text-neutral-900 group-hover:translate-x-1 transition-transform">
                  Baca Artikel →
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
