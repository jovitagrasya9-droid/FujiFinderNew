import React, { useEffect } from 'react';
import { ArrowLeft, Compass, Camera, Search, FileQuestion, BookOpen } from 'lucide-react';
import { Article, CameraProduct } from '../types';
import { resetDefaultSEO, updateDocumentSEO } from '../utils/seoManager';

interface NotFoundViewProps {
  slug?: string;
  publishedArticles: Article[];
  publishedCameras: CameraProduct[];
  onBackToHome: () => void;
  onSelectArticle: (article: Article) => void;
  onNavigateToCameras: () => void;
  onOpenSearch: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  slug,
  publishedArticles,
  publishedCameras,
  onBackToHome,
  onSelectArticle,
  onNavigateToCameras,
  onOpenSearch,
}) => {
  useEffect(() => {
    updateDocumentSEO({
      title: 'Halaman Tidak Ditemukan (404) | FujiFinder',
      description: 'Halaman atau artikel yang Anda cari tidak ditemukan atau telah dipindahkan.',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      resetDefaultSEO();
    };
  }, []);

  const suggestedArticles = publishedArticles.slice(0, 3);

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-28 pb-20 max-w-4xl mx-auto">
      {/* 404 Visual Icon & Badge */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mb-6 shadow-xs">
        <FileQuestion className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-4">
        404 NOT FOUND
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 text-center tracking-tight mb-4">
        Artikel Tidak Ditemukan
      </h1>

      <p className="text-neutral-600 text-center max-w-lg mb-2 text-sm sm:text-base leading-relaxed">
        {slug ? (
          <>
            Artikel dengan URL slug <code className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 font-mono text-xs">/artikel/{slug}</code> tidak ditemukan atau belum dipublikasikan.
          </>
        ) : (
          'Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.'
        )}
      </p>
      <p className="text-neutral-500 text-center max-w-md text-xs mb-8">
        Pastikan ejaan URL sudah benar, atau temukan ulasan dan panduan menarik lainnya di bawah ini.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
        >
          <Search className="w-4 h-4" />
          <span>Cari Artikel / Kamera</span>
        </button>

        <button
          onClick={onNavigateToCameras}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs"
        >
          <Camera className="w-4 h-4" />
          <span>Katalog Kamera</span>
        </button>
      </div>

      {/* Suggested Articles */}
      {suggestedArticles.length > 0 && (
        <div className="w-full pt-10 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-800" />
              Artikel Populer Pilihan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestedArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group p-4 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-900 transition-all cursor-pointer shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    {art.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-700">
                    {art.title}
                  </h3>
                </div>
                <div className="mt-3 text-[11px] text-neutral-400">
                  {art.readTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
