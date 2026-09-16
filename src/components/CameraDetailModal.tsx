import React from 'react';
import { X, Star, Check, AlertCircle, ArrowRight, ExternalLink, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { CameraProduct } from '../types';
import { formatIDR } from '../utils/formatCurrency';

interface CameraDetailModalProps {
  camera: CameraProduct | null;
  onClose: () => void;
  onCompare: (camera: CameraProduct) => void;
}

export const CameraDetailModal: React.FC<CameraDetailModalProps> = ({
  camera,
  onClose,
  onCompare,
}) => {
  if (!camera) return null;

  return (
    <div
      id="camera-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-10 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="camera-detail-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto text-neutral-900 border border-neutral-200"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-wider">
              {camera.brand}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-600 font-medium">{camera.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto">
          {/* Top section: Product image and key highlights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-neutral-100">
            {/* Image */}
            <div className="md:col-span-5 bg-neutral-50 rounded-2xl p-6 flex items-center justify-center relative aspect-square">
              {camera.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-neutral-950 text-white">
                  {camera.badge}
                </span>
              )}
              <img
                src={camera.image}
                alt={camera.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Title & Pricing */}
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {camera.name}
              </h2>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-neutral-900 text-sm">
                  {camera.rating.toFixed(1)} / 5.0
                </span>
                <span className="text-xs text-neutral-400">
                  ({camera.reviewCount} ulasan & pengujian lab)
                </span>
              </div>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                {camera.shortDesc}
              </p>

              <div className="pt-2 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                  {formatIDR(camera.price)}
                </span>
                {camera.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatIDR(camera.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                  Harga Resmi
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={camera.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  id="camera-modal-check-deal-cta"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
                >
                  <span>Cek Ketersediaan & Toko Resmi</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onCompare(camera);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium border border-neutral-300 hover:bg-neutral-50 text-neutral-800 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Bandingkan Spesifikasi</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Rujukan harga ritel resmi terverifikasi tanpa mark-up.</span>
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-neutral-100">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-3">
                <Check className="w-4 h-4" />
                <span>Kelebihan (Pros)</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-700">
                {camera.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>Kekurangan (Cons)</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-700">
                {camera.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Editorial Verdict */}
          <div className="py-6 border-b border-neutral-100 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Kesimpulan & Verdict Editorial
            </h4>
            <p className="text-sm sm:text-base text-neutral-800 italic leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              "{camera.verdict}"
            </p>
          </div>

          {/* Detailed Technical Specs Matrix */}
          <div className="pt-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Spesifikasi Teknis Lengkap
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Tipe Sensor</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.sensor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Resolusi Efektif</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.resolution}</span>
              </div>
              {camera.specs.lensMount && (
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Lens Mount</span>
                  <span className="font-semibold text-neutral-900 text-right">{camera.specs.lensMount}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Rentang ISO</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.isoRange}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Sistem Autofokus</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.autofocus}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Kemampuan Video</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.video}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Continuous Burst</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.burstRate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Bobot Body</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.weight}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Daya Tahan Baterai</span>
                <span className="font-semibold text-neutral-900 text-right">{camera.specs.batteryLife}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
