import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, ArrowRight, X, SlidersHorizontal, Plus, Camera } from 'lucide-react';
import { CameraProduct, CategoryType } from '../types';
import { formatIDR } from '../utils/formatCurrency';

interface CameraCatalogViewProps {
  cameras?: CameraProduct[];
  initialCategory?: CategoryType | null;
  onSelectCamera: (camera: CameraProduct) => void;
  onCompareWith: (camera: CameraProduct) => void;
  onBackToHome: () => void;
  onOpenCMS?: () => void;
}

export const CameraCatalogView: React.FC<CameraCatalogViewProps> = ({
  cameras = [],
  initialCategory,
  onSelectCamera,
  onCompareWith,
  onBackToHome,
  onOpenCMS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(100000000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');

  const categories = ['All', 'Mirrorless', 'DSLR', 'Compact', 'Action Camera', 'Vlogging', 'Accessories'];
  const brands = ['All', 'Fujifilm', 'Sony', 'Canon', 'Nikon', 'Leica', 'Panasonic', 'GoPro'];

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const matchCat = selectedCategory === 'All' || camera.category === selectedCategory;
      const matchBrand = selectedBrand === 'All' || camera.brand === selectedBrand;
      const matchPrice = camera.price <= maxPrice;
      const matchSearch =
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchBrand && matchPrice && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [cameras, selectedCategory, selectedBrand, maxPrice, searchQuery, sortBy]);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Breadcrumb & Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          <button onClick={onBackToHome} className="hover:text-neutral-900 transition-colors cursor-pointer">
            Beranda
          </button>
          <span>/</span>
          <span className="text-neutral-900">Katalog Kamera & Gear</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
          Katalog & Eksplorasi Kamera
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2 max-w-2xl">
          Telusuri kamera terverifikasi, bandingkan spesifikasi teknis, sensor, dan estimasi harga resmi dalam Rupiah (IDR).
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-6 mb-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tipe kamera atau fitur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Sort By & Price Cap */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span className="font-semibold">Maks: {formatIDR(maxPrice)}</span>
              <input
                type="range"
                min="5000000"
                max="100000000"
                step="1000000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-28 accent-neutral-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 font-semibold text-neutral-800 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer"
              >
                <option value="rating">Rating Tertinggi</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {cameras.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-neutral-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <Camera className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Katalog Kamera Kosong</h3>
            <p className="text-sm text-neutral-500">
              Semua data dummy telah dihapus. Tambahkan kamera baru melalui Admin CMS untuk mengisi katalog FujiFinder.
            </p>
          </div>
          {onOpenCMS && (
            <button
              onClick={onOpenCMS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kamera di Admin CMS</span>
            </button>
          )}
        </div>
      ) : filteredCameras.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
          <p className="text-base font-semibold text-neutral-700">Tidak ada kamera yang cocok dengan kriteria filter.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedBrand('All');
              setMaxPrice(100000000);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-neutral-950 underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <div
              key={camera.id}
              className="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 relative"
            >
              <div>
                {/* Image */}
                <div
                  onClick={() => onSelectCamera(camera)}
                  className="aspect-[4/3] rounded-2xl bg-neutral-50 flex items-center justify-center p-6 mb-4 cursor-pointer overflow-hidden"
                >
                  <img
                    src={camera.image}
                    alt={camera.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-400 uppercase tracking-wider">
                      {camera.brand} • {camera.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{camera.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectCamera(camera)}
                    className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    {camera.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                    {camera.shortDesc}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-6 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 block">Estimasi Harga</span>
                  <span className="text-base sm:text-lg font-black text-neutral-900">
                    {formatIDR(camera.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCompareWith(camera)}
                    className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                    title="Bandingkan dengan kamera lain"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectCamera(camera)}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Detail
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
