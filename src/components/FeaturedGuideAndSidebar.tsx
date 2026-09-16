import React from 'react';
import { ArrowRight, Clock, Plus, Compass } from 'lucide-react';
import { Article } from '../types';

interface FeaturedGuideAndSidebarProps {
  articles?: Article[];
  onArticleClick: (article: Article) => void;
  onOpenCMS?: () => void;
  onExploreCameras?: () => void;
}

export const FeaturedGuideAndSidebar: React.FC<FeaturedGuideAndSidebarProps> = ({
  articles = [],
  onArticleClick,
  onOpenCMS,
  onExploreCameras,
}) => {
  const featuredArticle = articles.find((a) => a.featured || a.category.includes('GUIDE')) || articles[0];

  return (
    <section id="featured-guide-section" className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {featuredArticle ? (
        <div
          id="main-featured-guide-card"
          onClick={() => onArticleClick(featuredArticle)}
          className="group relative rounded-3xl overflow-hidden min-h-[460px] md:min-h-[520px] flex flex-col justify-end p-6 sm:p-10 md:p-14 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-neutral-950"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/50 to-neutral-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/30 to-transparent w-full md:w-3/4" />
          </div>

          {/* Card Content */}
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-white/20 backdrop-blur-md text-xs font-semibold text-white tracking-wider uppercase">
              <span>{featuredArticle.category}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-400" />
              <span className="text-neutral-300 text-[11px] font-normal">{featuredArticle.date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {featuredArticle.title}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-neutral-300 leading-relaxed line-clamp-3 font-normal">
              {featuredArticle.summary}
            </p>

            <div className="pt-3 flex items-center gap-4">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white text-neutral-950 group-hover:bg-neutral-100 transition-colors shadow-sm">
                <span>Baca Panduan Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </span>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-300 font-medium">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{featuredArticle.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Featured Guide Banner */
        <div className="relative rounded-3xl overflow-hidden min-h-[420px] md:min-h-[480px] flex flex-col justify-end p-6 sm:p-10 md:p-14 bg-neutral-950 shadow-md">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
              alt="FujiFinder Camera Publication"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-white tracking-wider uppercase">
              <span>FUJIFINDER EDITORIAL</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Authentic Camera Benchmarks & Field Notes
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Belum ada artikel panduan unggulan. Publikasikan artikel pertama Anda melalui Admin CMS untuk menampilkan ulasan kamera dan panduan visual di area sorotan ini.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {onOpenCMS && (
                <button
                  onClick={onOpenCMS}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tulis Artikel di Admin CMS</span>
                </button>
              )}
              {onExploreCameras && (
                <button
                  onClick={onExploreCameras}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Jelajahi Kamera</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
