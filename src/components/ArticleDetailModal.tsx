import React, { useState, useEffect } from 'react';
import { X, Clock, Share2, Bookmark, Check, ArrowRight, Camera, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { Article, CameraProduct } from '../types';
import { ArticleContentRenderer } from './ArticleContentRenderer';
import { CAMERAS_DATA } from '../data/mockData';
import { formatIDR } from '../utils/formatCurrency';
import { setArticleSEO, resetDefaultSEO } from '../utils/seoManager';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectCamera: (camera: CameraProduct) => void;
  onOpenPublicPage?: (article: Article) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onSelectCamera,
  onOpenPublicPage,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Set Technical SEO metadata and JSON-LD structured data dynamically
  useEffect(() => {
    if (article) {
      setArticleSEO(article);
    }
    return () => {
      resetDefaultSEO();
    };
  }, [article]);

  if (!article) return null;

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/artikel/${article.slug}`
    : `/artikel/${article.slug}`;

  const handleShare = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedCamera = article.recommendedCameraId
    ? CAMERAS_DATA.find((c) => c.id === article.recommendedCameraId)
    : CAMERAS_DATA[0];

  return (
    <div
      id="article-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-10 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="article-detail-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto text-neutral-900 border border-neutral-200"
      >
        {/* Sticky Close & Action Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <span>{article.category}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPublicPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPublicPage(article);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Buka versi URL Publik SEO"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Halaman SEO Publik</span>
              </button>
            )}

            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
              title="Bookmark article"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Salin Link Publik"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              id="close-article-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer ml-1"
              title="Close article"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-neutral-900">
          <img
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-neutral-900/80 border border-white/20 text-[11px] font-medium text-neutral-200 backdrop-blur-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 md:p-14 max-w-3xl mx-auto">
          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-3.5 pb-8 mb-8 border-b border-neutral-100">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-200"
            />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{article.author.name}</h3>
              <p className="text-xs text-neutral-500">{article.author.role}</p>
            </div>
          </div>

          {/* Summary Lead */}
          <p className="text-lg sm:text-xl font-normal text-neutral-700 leading-relaxed italic border-l-2 border-neutral-900 pl-5 mb-8">
            "{article.summary}"
          </p>

          {/* Content Body */}
          <div className="space-y-6 text-neutral-800 leading-relaxed font-normal">
            <ArticleContentRenderer content={article.content} />
          </div>

          {/* Featured Camera Callout if applicable */}
          {relatedCamera && (
            <div className="my-10 p-6 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 shrink-0 rounded-xl bg-white p-2 border border-neutral-200/60 flex items-center justify-center">
                <img
                  src={relatedCamera.image}
                  alt={relatedCamera.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Featured Gear Mentioned
                </span>
                <h4 className="text-lg font-bold text-neutral-900">{relatedCamera.name}</h4>
                <p className="text-xs text-neutral-600 line-clamp-2">
                  {relatedCamera.shortDesc}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <span className="text-base font-extrabold text-neutral-900">
                    {formatIDR(relatedCamera.price)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-semibold text-neutral-800">{relatedCamera.rating}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onSelectCamera(relatedCamera);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>View Full Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Article Footer Byline */}
          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <span>Published by {article.author.name}</span>
            <button
              onClick={onClose}
              className="text-neutral-900 font-semibold hover:underline cursor-pointer"
            >
              Back to Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
