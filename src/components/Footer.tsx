import React from 'react';
import { Camera, ArrowUp, SlidersHorizontal } from 'lucide-react';
import { CategoryType } from '../types';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
  onSelectCategory: (category: CategoryType) => void;
  onOpenCMS?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectCategory,
  onOpenCMS,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cameraTypes: CategoryType[] = [
    'Mirrorless',
    'DSLR',
    'Compact',
    'Action Camera',
    'Vlogging',
    'Accessories',
  ];

  return (
    <footer id="main-editorial-footer" className="bg-white border-t border-neutral-200/80 pt-16 pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-neutral-200/80">
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-neutral-950">
                Fuji<span className="font-normal text-neutral-500">Finder</span>
              </span>
            </div>

            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              An independent camera media journal and gear discovery platform. We deliver rigorous lab testing, field reviews, and practical guides for photographers and filmmakers.
            </p>

            <div className="pt-2 text-xs text-neutral-400">
              Lab tested in Vancouver, Tokyo & London.
            </div>
          </div>

          {/* Nav Col 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cameras')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Camera Database
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  In-Depth Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guides')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Buyer Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cameras')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Camera Database
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Editorial Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Camera Types
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              {cameraTypes.map((type) => (
                <li key={type}>
                  <button
                    onClick={() => onSelectCategory(type)}
                    className="hover:text-neutral-950 transition-colors cursor-pointer"
                  >
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Col 3: Editorial Standards & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Publication
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <span className="cursor-default">Testing Methodology</span>
              </li>
              <li>
                <span className="cursor-default">Editorial Independence</span>
              </li>
              <li>
                <span className="cursor-default">Ethics Policy</span>
              </li>
              <li>
                <span className="cursor-default">Affiliate Disclosure</span>
              </li>
              <li>
                <span className="cursor-default">Contact the Editors</span>
              </li>
              {onOpenCMS && (
                <li>
                  <button
                    onClick={onOpenCMS}
                    className="inline-flex items-center gap-1.5 text-neutral-900 font-semibold hover:text-black transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Admin CMS</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-neutral-500">
          <p className="max-w-2xl leading-relaxed">
            <strong className="text-neutral-700">Affiliate Disclosure:</strong> FujiFinder is an independently owned publication. When you purchase cameras, lenses, or accessories through links on our site, we may earn an affiliate commission at no additional cost to you. We never accept paid positive reviews.
          </p>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenCMS && (
              <button
                id="footer-admin-cms-btn"
                onClick={onOpenCMS}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-300 bg-neutral-50 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 hover:border-neutral-400 text-[11px] font-medium transition-all cursor-pointer"
                title="Buka Admin Editorial CMS"
              >
                <SlidersHorizontal className="w-3 h-3 text-neutral-500" />
                <span>Admin CMS</span>
              </button>
            )}
            <span>© {new Date().getFullYear()} FujiFinder Media.</span>
            <button
              onClick={scrollToTop}
              id="scroll-to-top-btn"
              className="p-2 rounded-full border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
