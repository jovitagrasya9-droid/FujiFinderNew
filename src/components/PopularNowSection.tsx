import React from 'react';
import { ArrowRight, Clock, Plus, FileText } from 'lucide-react';
import { Article } from '../types';

interface PopularNowSectionProps {
  articles?: Article[];
  onArticleClick: (article: Article) => void;
  onViewAllArticles: () => void;
  onOpenCMS?: () => void;
}

export const PopularNowSection: React.FC<PopularNowSectionProps> = ({
  articles = [],
  onArticleClick,
  onViewAllArticles,
  onOpenCMS,
}) => {
  const displayArticles = articles.slice(0, 4);

  return (
    <section id="popular-now-section" className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Popular Now
        </h2>
        {articles.length > 0 && (
          <button
            id="view-all-articles-link"
            onClick={onViewAllArticles}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <span>View all articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* If no articles: Clean empty state */}
      {displayArticles.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">Belum Ada Artikel</h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Semua data dummy telah dibersihkan. Anda dapat menambahkan artikel, review kamera, atau panduan baru melalui Admin CMS.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Artikel di Admin CMS</span>
            </button>
          )}
        </div>
      ) : (
        /* 4 Editorial Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayArticles.map((article) => (
            <div
              key={article.id}
              id={`popular-article-${article.id}`}
              onClick={() => onArticleClick(article)}
              className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Category & Date */}
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-3">
                  <span className="text-neutral-900 font-bold">{article.category}</span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-500 font-normal">{article.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug group-hover:text-neutral-600 transition-colors">
                  {article.title}
                </h3>
              </div>

              {/* Read Time footer */}
              <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center text-xs font-medium text-neutral-500 gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{article.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
