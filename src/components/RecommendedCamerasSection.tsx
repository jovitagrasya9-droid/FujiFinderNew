import React from 'react';
import { ArrowRight, Star, Plus, Camera } from 'lucide-react';
import { CameraProduct } from '../types';
import { formatIDR } from '../utils/formatCurrency';

interface RecommendedCamerasSectionProps {
  cameras?: CameraProduct[];
  onSelectCamera: (camera: CameraProduct) => void;
  onViewAllCameras: () => void;
  onCompareWith?: (camera: CameraProduct) => void;
  onOpenCMS?: () => void;
}

export const RecommendedCamerasSection: React.FC<RecommendedCamerasSectionProps> = ({
  cameras = [],
  onSelectCamera,
  onViewAllCameras,
  onCompareWith,
  onOpenCMS,
}) => {
  const displayCameras = cameras.slice(0, 6);

  return (
    <section id="recommended-cameras-section" className="py-8 md:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Kamera Rekomendasi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Diuji secara independen dan dipilih langsung oleh kurator fotografi FujiFinder.
          </p>
        </div>

        {cameras.length > 0 && (
          <button
            id="view-all-cameras-link"
            onClick={onViewAllCameras}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-neutral-950 transition-colors cursor-pointer"
          >
            <span>Lihat semua kamera</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Empty State when no cameras exist */}
      {displayCameras.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <Camera className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">Belum Ada Kamera di Katalog</h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Semua data dummy telah dibersihkan. Anda dapat menambahkan kamera pertama melalui Admin CMS.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kamera di Admin CMS</span>
            </button>
          )}
        </div>
      ) : (
        /* Grid of Cameras */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {displayCameras.map((camera) => (
            <div
              key={camera.id}
              id={`camera-card-${camera.id}`}
              className="group flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Top badge if available */}
              {camera.badge && (
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-neutral-900 text-white shadow-xs">
                  {camera.badge}
                </span>
              )}

              {/* Product Image */}
              <div
                onClick={() => onSelectCamera(camera)}
                className="relative aspect-square w-full rounded-xl bg-neutral-50 flex items-center justify-center p-3 mb-3 cursor-pointer overflow-hidden"
              >
                <img
                  src={camera.image}
                  alt={camera.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-1.5 flex-1">
                <h3
                  onClick={() => onSelectCamera(camera)}
                  className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight group-hover:text-neutral-700 transition-colors cursor-pointer line-clamp-1"
                >
                  {camera.name}
                </h3>

                {/* Star Rating */}
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="font-semibold text-neutral-800 text-xs">
                    {camera.rating.toFixed(1)}
                  </span>
                  <span className="text-neutral-400 text-[10px]">
                    ({camera.reviewCount})
                  </span>
                </div>

                {/* Price in Rupiah */}
                <div className="pt-1">
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-900 block">
                    {formatIDR(camera.price)}
                  </span>
                  {camera.originalPrice && (
                    <span className="text-[11px] text-neutral-400 line-through block">
                      {formatIDR(camera.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-3 mt-2">
                <button
                  id={`check-price-${camera.id}`}
                  onClick={() => onSelectCamera(camera)}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 hover:shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Cek Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
