import React, { useState } from 'react';
import { Clock, ArrowRight, Search, Plus, FileText } from 'lucide-react';
import { Article } from '../types';

interface BlogViewProps {
  articles?: Article[];
  onSelectArticle: (article: Article) => void;
  onBackToHome: () => void;
  onOpenCMS?: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  articles = [],
  onSelectArticle,
  onBackToHome,
  onOpenCMS,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [search, setSearch] = useState('');

  const allTags = ['All', 'REVIEWS', 'GUIDES', 'COMPARISONS', 'VLOGGING', 'LENSES'];

  const filtered = articles.filter((a) => {
    const matchTag = selectedTag === 'All' || a.category === selectedTag;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          <button onClick={onBackToHome} className="hover:text-neutral-900 transition-colors cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-neutral-900">Editorial Blog</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
          The FujiFinder Journal
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-2xl">
          Dispatches from the field, technical deep-dives, lens teardowns, and visual storytelling essays.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedTag === t
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Empty State */}
      {articles.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <FileText className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Belum Ada Artikel di Jurnal</h3>
            <p className="text-sm text-neutral-500">
              Semua data dummy telah dibersihkan. Publikasikan artikel baru melalui Admin CMS untuk mengisi The FujiFinder Journal.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel di Admin CMS</span>
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
          <p className="text-sm text-neutral-500">Tidak ada artikel yang cocok dengan pencarian atau kategori ini.</p>
        </div>
      ) : (
        /* Grid of articles */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group rounded-3xl bg-white border border-neutral-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="h-52 w-full overflow-hidden bg-neutral-100 relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
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

                  <h2 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-neutral-600 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-100 mt-4 text-xs font-semibold text-neutral-900">
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <div className="flex items-center gap-2">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-neutral-500 font-normal">{article.author.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
