import React, { useState } from 'react';
import { Star, Check, SlidersHorizontal, Plus, Camera } from 'lucide-react';
import { Article, CameraProduct } from '../types';
import { formatIDR } from '../utils/formatCurrency';

interface ReviewsViewProps {
  articles: Article[];
  cameras?: CameraProduct[];
  onSelectArticle: (article: Article) => void;
  onSelectCamera: (camera: CameraProduct) => void;
  onCompareWith: (camera: CameraProduct) => void;
  onBackToHome: () => void;
  onOpenCMS?: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  articles,
  cameras = [],
  onSelectArticle,
  onSelectCamera,
  onCompareWith,
  onBackToHome,
  onOpenCMS,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const brands = ['All', 'Fujifilm', 'Sony', 'Canon', 'Nikon', 'Leica', 'GoPro'];

  const filteredCameras = selectedBrand === 'All' 
    ? cameras 
    : cameras.filter((c) => c.brand === selectedBrand);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb & Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          <button onClick={onBackToHome} className="hover:text-neutral-900 transition-colors cursor-pointer">
            Beranda
          </button>
          <span>/</span>
          <span className="text-neutral-900">Ulasan Kamera & Benchmark</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
          Ulasan Kamera Independen & Pengujian Lapangan
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-2xl">
          Tanpa rating bayaran. Kami menguji dynamic range, noise high-ISO, akurasi autofocus, dan reproduksi warna di skenario pemotretan nyata.
        </p>
      </div>

      {/* Brand Filters */}
      <div className="flex items-center gap-2 pb-6 overflow-x-auto">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">
          Filter Brand:
        </span>
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedBrand === brand
                ? 'bg-neutral-950 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* In-Depth Camera Score Cards */}
      {cameras.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <Camera className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Belum Ada Ulasan Kamera</h3>
            <p className="text-sm text-neutral-500">
              Semua data dummy telah dihapus. Tambahkan review kamera baru melalui Admin CMS untuk melihat lab benchmarks di sini.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kamera & Review di Admin CMS</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCameras.map((camera) => (
            <div
              key={camera.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Camera Photo */}
              <div
                onClick={() => onSelectCamera(camera)}
                className="lg:col-span-3 aspect-square rounded-2xl bg-neutral-50 flex items-center justify-center p-6 cursor-pointer"
              >
                <img
                  src={camera.image}
                  alt={camera.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Core Review Details */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    {camera.brand}
                  </span>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs font-medium text-neutral-600">{camera.category}</span>
                  {camera.badge && (
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                      {camera.badge}
                    </span>
                  )}
                </div>

                <h2
                  onClick={() => onSelectCamera(camera)}
                  className="text-xl sm:text-2xl font-extrabold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer"
                >
                  {camera.name} Lab Test & In-Depth Review
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {camera.shortDesc}
                </p>

                <div className="space-y-1 pt-1">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Keunggulan Utama:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {camera.pros.slice(0, 2).map((pro, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{pro}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score & Verdict Box */}
              <div className="lg:col-span-3 bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 flex flex-col justify-between h-full space-y-4 text-center lg:text-left">
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Skor Editorial
                  </span>
                  <div className="flex items-baseline justify-center lg:justify-start gap-2 mt-1">
                    <span className="text-3xl font-black text-neutral-950">{camera.rating}</span>
                    <span className="text-xs text-neutral-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-amber-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/60">
                  <span className="text-xs text-neutral-500 block mb-1">Estimasi Harga Resmi:</span>
                  <span className="text-base sm:text-lg font-extrabold text-neutral-950">
                    {formatIDR(camera.price)}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onSelectCamera(camera)}
                    className="w-full py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Ulasan & Spesifikasi
                  </button>
                  <button
                    onClick={() => onCompareWith(camera)}
                    className="w-full py-2 rounded-full text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Komparasi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
