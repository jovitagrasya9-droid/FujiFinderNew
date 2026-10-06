import React from 'react';
import { ArrowUp, SlidersHorizontal } from 'lucide-react';
import { CategoryType } from '../types';
import { FujiFinderLogo } from './FujiFinderLogo';

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
            <button
              onClick={() => onNavigate('home')}
              className="text-left cursor-pointer focus:outline-none"
            >
              <FujiFinderLogo variant="dark" size="lg" showTagline={true} />
            </button>

            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              FujiFinder is a dedicated Fujifilm camera and photography platform helping photographers discover, compare, review, and choose Fujifilm X Series and GFX cameras, lenses, and accessories.
            </p>

            <div className="pt-2 text-xs text-neutral-500 font-medium">
              Dedicated Fujifilm camera guides, reviews & community.
            </div>
          </div>

          {/* Nav Col 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Jelajahi
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cameras')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Katalog Kamera Fujifilm
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Ulasan & Review
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guides')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Panduan Membeli
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-neutral-950 transition-colors cursor-pointer">
                  Jurnal Fotografi
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Kategori Gear
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
              Informasi & Standar
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <span className="cursor-default">Metodologi Pengujian</span>
              </li>
              <li>
                <span className="cursor-default">Independensi Editorial</span>
              </li>
              <li>
                <span className="cursor-default">Kebijakan Etika</span>
              </li>
              <li>
                <span className="cursor-default">Keterbukaan Afiliasi</span>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-1"
                >
                  XML Sitemap
                </a>
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
            <strong className="text-neutral-700">Keterbukaan Afiliasi:</strong> FujiFinder adalah platform editorial independen. Saat Anda membeli kamera Fujifilm, lensa, atau aksesori melalui tautan di situs kami, kami dapat memperoleh komisi afiliasi tanpa biaya tambahan bagi Anda. Kami tidak menerima ulasan berbayar yang tidak objektif.
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
