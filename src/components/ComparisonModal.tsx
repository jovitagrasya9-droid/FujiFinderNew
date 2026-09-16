import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, ExternalLink, Camera } from 'lucide-react';
import { CameraProduct } from '../types';
import { formatIDR } from '../utils/formatCurrency';

interface ComparisonModalProps {
  cameras?: CameraProduct[];
  initialCameraA?: CameraProduct | null;
  initialCameraB?: CameraProduct | null;
  onClose: () => void;
  onSelectCamera: (camera: CameraProduct) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  cameras = [],
  initialCameraA,
  initialCameraB,
  onClose,
  onSelectCamera,
}) => {
  const [cameraAId, setCameraAId] = useState<string>(
    initialCameraA?.id || cameras[0]?.id || ''
  );
  const [cameraBId, setCameraBId] = useState<string>(
    initialCameraB?.id || cameras[1]?.id || cameras[0]?.id || ''
  );

  const cameraA = cameras.find((c) => c.id === cameraAId) || cameras[0];
  const cameraB = cameras.find((c) => c.id === cameraBId) || cameras[1] || cameras[0];

  const specsList = [
    { label: 'Sensor', key: 'sensor' as const },
    { label: 'Max Resolution', key: 'resolution' as const },
    { label: 'Lens Mount', key: 'lensMount' as const },
    { label: 'ISO Range', key: 'isoRange' as const },
    { label: 'Autofocus System', key: 'autofocus' as const },
    { label: 'Video Capabilities', key: 'video' as const },
    { label: 'Continuous Shooting', key: 'burstRate' as const },
    { label: 'Weight', key: 'weight' as const },
    { label: 'Battery Life', key: 'batteryLife' as const },
  ];

  return (
    <div
      id="comparison-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 md:p-10 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="comparison-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto text-neutral-900 border border-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-neutral-800" />
            <h2 className="text-lg font-bold text-neutral-900">Komparasi Kamera FujiFinder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If fewer than 2 cameras */}
        {cameras.length < 2 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              {cameras.length === 0 ? 'Belum Ada Kamera di Database' : 'Dibutuhkan Minimal 2 Kamera untuk Komparasi'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Semua data dummy telah dibersihkan. Tambahkan kamera melalui Admin CMS untuk melakukan perbandingan teknis side-by-side.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white"
            >
              Tutup
            </button>
          </div>
        ) : (
          /* Content table */
          <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
            {/* Top selection row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-neutral-200">
              {/* Camera A */}
              {cameraA && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Kamera 1:
                    </label>
                    <select
                      value={cameraAId}
                      onChange={(e) => setCameraAId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-neutral-50 focus:outline-none focus:border-neutral-900"
                    >
                      {cameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({formatIDR(c.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="h-44 bg-neutral-50 rounded-2xl p-4 flex items-center justify-center">
                    <img
                      src={cameraA.image}
                      alt={cameraA.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-neutral-900">{cameraA.name}</h3>
                    <div className="text-lg sm:text-xl font-bold text-neutral-950 mt-1">
                      {formatIDR(cameraA.price)}
                    </div>
                    <div className="pt-3">
                      <a
                        href={cameraA.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800"
                      >
                        <span>Cek Toko Resmi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera B */}
              {cameraB && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Kamera 2:
                    </label>
                    <select
                      value={cameraBId}
                      onChange={(e) => setCameraBId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-neutral-300 text-sm font-semibold bg-neutral-50 focus:outline-none focus:border-neutral-900"
                    >
                      {cameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({formatIDR(c.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="h-44 bg-neutral-50 rounded-2xl p-4 flex items-center justify-center">
                    <img
                      src={cameraB.image}
                      alt={cameraB.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-neutral-900">{cameraB.name}</h3>
                    <div className="text-lg sm:text-xl font-bold text-neutral-950 mt-1">
                      {formatIDR(cameraB.price)}
                    </div>
                    <div className="pt-3">
                      <a
                        href={cameraB.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800"
                      >
                        <span>Cek Toko Resmi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specs comparison */}
            {cameraA && cameraB && (
              <>
                <div className="py-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
                    Matriks Spesifikasi Teknis
                  </h4>

                  <div className="space-y-3">
                    {specsList.map((spec) => (
                      <div
                        key={spec.key}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b border-neutral-100 text-xs sm:text-sm items-center hover:bg-neutral-50/70 px-2 rounded-lg"
                      >
                        <div className="md:col-span-4 font-bold text-neutral-500">{spec.label}</div>
                        <div className="md:col-span-4 font-medium text-neutral-900">
                          {cameraA.specs[spec.key] || '—'}
                        </div>
                        <div className="md:col-span-4 font-medium text-neutral-900">
                          {cameraB.specs[spec.key] || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h5 className="font-bold text-xs uppercase text-neutral-700 mb-2">
                      Keunggulan {cameraA.name}:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {cameraA.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h5 className="font-bold text-xs uppercase text-neutral-700 mb-2">
                      Keunggulan {cameraB.name}:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {cameraB.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
