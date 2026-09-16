import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Camera, FileText, Tag } from 'lucide-react';
import { Article, CameraProduct } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';
import { formatIDR } from '../utils/formatCurrency';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: Article[];
  cameras?: CameraProduct[];
  onSelectArticle: (article: Article) => void;
  onSelectCamera: (camera: CameraProduct) => void;
  onSelectCategory: (cat: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles = [],
  cameras = [],
  onSelectArticle,
  onSelectCamera,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = query
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.summary.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredCameras = query
    ? cameras.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.brand.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredCategories = query
    ? CATEGORIES_DATA.filter((cat) => cat.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div
      id="global-search-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-12 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="global-search-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto text-neutral-900 border border-neutral-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-neutral-100">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari ulasan kamera, tipe bodi, atau artikel fotografi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base sm:text-lg bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-500 hover:bg-neutral-200 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {!query ? (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Kategori Populer
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_DATA.map((cat) => (
                  <button
                    key={cat.title}
                    onClick={() => {
                      onClose();
                      onSelectCategory(cat.title);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {filteredArticles.length === 0 && filteredCameras.length === 0 && filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  Tidak ada kamera atau artikel yang cocok dengan "{query}".
                </div>
              ) : (
                <>
                  {/* Cameras matches */}
                  {filteredCameras.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera & Produk ({filteredCameras.length})</span>
                      </span>
                      <div className="space-y-2">
                        {filteredCameras.map((camera) => (
                          <div
                            key={camera.id}
                            onClick={() => {
                              onClose();
                              onSelectCamera(camera);
                            }}
                            className="p-3 rounded-xl hover:bg-neutral-50 border border-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={camera.image}
                                alt={camera.name}
                                className="w-10 h-10 object-contain mix-blend-multiply"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-neutral-900">{camera.name}</h4>
                                <span className="text-xs text-neutral-500">{camera.category} • {formatIDR(camera.price)}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles matches */}
                  {filteredArticles.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Artikel & Panduan ({filteredArticles.length})</span>
                      </span>
                      <div className="space-y-2">
                        {filteredArticles.map((article) => (
                          <div
                            key={article.id}
                            onClick={() => {
                              onClose();
                              onSelectArticle(article);
                            }}
                            className="p-3 rounded-xl hover:bg-neutral-50 border border-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-[11px] font-bold text-neutral-500 uppercase">
                                {article.category} • {article.date}
                              </div>
                              <h4 className="text-sm font-semibold text-neutral-900">{article.title}</h4>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 ml-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories matches */}
                  {filteredCategories.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Kategori</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.title}
                            onClick={() => {
                              onClose();
                              onSelectCategory(cat.title);
                            }}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 text-white cursor-pointer"
                          >
                            {cat.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
