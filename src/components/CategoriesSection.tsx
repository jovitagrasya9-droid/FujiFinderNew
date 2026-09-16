import React from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';
import { Article, CategoryType } from '../types';

interface CategoriesSectionProps {
  articles?: Article[];
  onSelectCategory: (category: CategoryType) => void;
  onViewAllCategories: () => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  articles = [],
  onSelectCategory,
  onViewAllCategories,
}) => {
  return (
    <section id="explore-by-category-section" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Explore by Category
        </h2>
        <button
          id="view-all-categories-link"
          onClick={onViewAllCategories}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer"
        >
          <span>View all categories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of 6 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {CATEGORIES_DATA.map((cat) => {
          const matchingCount = articles.filter(
            (a) =>
              a.category.toLowerCase().includes(cat.title.toLowerCase()) ||
              a.tags.some((t) => t.toLowerCase() === cat.title.toLowerCase())
          ).length;

          return (
            <div
              key={cat.title}
              id={`category-card-${cat.title.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(cat.title)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4.2] flex flex-col justify-between p-4 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-neutral-900"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-900/30 group-hover:from-neutral-950 group-hover:via-neutral-950/50 transition-colors" />
              </div>

              {/* Top Right Arrow Button */}
              <div className="relative z-10 flex justify-end">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-md group-hover:bg-white group-hover:scale-110 transition-all">
                  <ArrowUpRight className="w-4 h-4 text-neutral-900 group-hover:rotate-45 transition-transform" />
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-snug line-clamp-2">
                  {cat.desc}
                </p>
                <span className="inline-block pt-1 text-[11px] font-medium text-neutral-400">
                  {matchingCount} {matchingCount === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
