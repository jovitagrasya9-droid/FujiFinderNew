import React from 'react';
import { Clock, ArrowRight, BookOpen, Plus } from 'lucide-react';
import { Article } from '../types';

interface GuidesViewProps {
  articles?: Article[];
  onSelectArticle: (article: Article) => void;
  onBackToHome: () => void;
  onOpenCMS?: () => void;
}

export const GuidesView: React.FC<GuidesViewProps> = ({
  articles = [],
  onSelectArticle,
  onBackToHome,
  onOpenCMS,
}) => {
  const guideArticles = articles.filter(
    (a) => a.category.includes('GUIDE') || a.tags.includes('Buyer Guide') || a.tags.includes('Technique')
  );

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb & Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          <button onClick={onBackToHome} className="hover:text-neutral-900 transition-colors cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-neutral-900">Buyer Guides & Tutorials</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
          Camera Buying Guides & Photography Masterclasses
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-2xl">
          Actionable, jargon-free guides to help you navigate sensor formats, prime lenses, exposure triangles, and gear budgets.
        </p>
      </div>

      {/* Grid of Guides */}
      {guideArticles.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Belum Ada Panduan</h3>
            <p className="text-sm text-neutral-500">
              Semua data dummy telah dibersihkan. Publikasikan panduan atau tutorial fotografi pertama melalui Admin CMS.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Panduan di Admin CMS</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group rounded-3xl bg-white border border-neutral-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="h-56 w-full overflow-hidden bg-neutral-100 relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-900/80 text-white text-[11px] font-bold uppercase backdrop-blur-xs tracking-wider">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                    <span>{article.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug group-hover:text-neutral-600 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-100 mt-4 text-xs font-semibold text-neutral-900">
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                  <span>Read Masterclass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-neutral-400 font-normal">By {article.author.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
