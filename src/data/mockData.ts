import { Article, Author, CameraProduct, CategoryType } from '../types';

export const DEFAULT_AUTHOR: Author = {
  id: 'fujifinder-team',
  name: 'FujiFinder Editorial Team',
  role: 'Camera Specialists & Photographers',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Independent reviews, field benchmarks, and authentic gear discovery for photographers.',
  socials: {
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com',
  },
};

export const AUTHORS: Record<string, Author> = {
  fujifinder: DEFAULT_AUTHOR,
  sophie: DEFAULT_AUTHOR,
};

export const CATEGORIES_DATA: {
  title: CategoryType;
  desc: string;
  image: string;
}[] = [
  {
    title: 'Mirrorless',
    desc: 'Ringkas, cepat, dan sempurna untuk kreator visual modern.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'DSLR',
    desc: 'Ergonomi mantap, optical viewfinder, dan daya tahan baterai tangguh.',
    image: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Compact',
    desc: 'Kamera saku lensa tetap bertenaga tinggi untuk street dan travel.',
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Action Camera',
    desc: 'Tangguh, tahan air, dan stabilisasi superior untuk aksi ekstrem.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Vlogging',
    desc: 'Layar putar, audio directional, dan preset warna sinematik.',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Accessories',
    desc: 'Lensa prima esensial, tripod karbon, strap, dan tas pelindung.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  },
];

// All dummy data emptied out by default as requested:
export const CAMERAS_DATA: CameraProduct[] = [];
export const ARTICLES_DATA: Article[] = [];
export const POPULAR_NOW_ARTICLES: Article[] = [];
export const POPULAR_SIDEBAR_ARTICLES: Article[] = [];
export const FEATURED_GUIDE_ARTICLE: Article | null = null;
export const HERO_SLIDES: any[] = [];

// Curated authentic Fujifilm starter pack with Indonesian Rupiah pricing:
export const FUJIFILM_STARTER_CAMERAS: CameraProduct[] = [
  {
    id: 'fuji-xt5',
    name: 'Fujifilm X-T5',
    brand: 'Fujifilm',
    category: 'Mirrorless',
    price: 26999000,
    originalPrice: 28499000,
    rating: 4.9,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Sensor 40.2MP X-Trans CMOS 5 HR dengan dial mekanis klasik dan 7-stop IBIS.',
    affiliateUrl: 'https://fujifilm.com',
    specs: {
      sensor: '40.2MP APS-C X-Trans CMOS 5 HR',
      resolution: '7728 x 5152',
      lensMount: 'Fujifilm X Mount',
      isoRange: '125 - 12800 (Exp 64 - 51200)',
      autofocus: 'Intelligent Hybrid AF dengan Deep Learning Subject Detection',
      video: '6.2K 30p, 4K 60p 10-bit 4:2:2 internal',
      burstRate: 'Hingga 15 fps mekanis, 20 fps elektronik',
      weight: '557g (dengan baterai dan kartu memori)',
      batteryLife: 'Kurang lebih 740 frame (Mode Economy)',
    },
    pros: [
      'Resolusi 40MP memukau dengan color science Film Simulation legendaris',
      'Dial fisik mekanis khusus untuk Shutter Speed, ISO, dan Exposure Compensation',
      'Layar LCD tilting 3 arah yang ideal untuk fotografi still',
      'Dual slot kartu memori UHS-II SD',
    ],
    cons: [
      'Tidak ada mode video high-frame-rate 4K 120p',
      'Buffer RAW uncompressed terisi cepat pada continuous shooting',
    ],
    verdict: 'Pengalaman fotografi still paling murni dengan ergonomi analog dan reproduksi warna tak tertandingi.',
    badge: "Pilihan Editor",
  },
  {
    id: 'fuji-x100vi',
    name: 'Fujifilm X100VI',
    brand: 'Fujifilm',
    category: 'Compact',
    price: 27499000,
    originalPrice: 28999000,
    rating: 5.0,
    reviewCount: 68,
    image: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Kamera compact premium legendaris dengan sensor 40MP, lensa 23mm F2, dan 6.0-stop IBIS terintegrasi.',
    affiliateUrl: 'https://fujifilm.com',
    specs: {
      sensor: '40.2MP APS-C X-Trans CMOS 5 HR',
      resolution: '7728 x 5152',
      lensMount: 'Fixed Fujinon 23mm f/2.0 II (ekuivalen 35mm)',
      isoRange: '125 - 12800 (Exp 64 - 51200)',
      autofocus: 'Hybrid Optical/Electronic AF dengan AI tracking',
      video: '6.2K 30p, 4K 60p',
      burstRate: '11 fps mekanis',
      weight: '521g',
      batteryLife: 'Kurang lebih 450 frame',
    },
    pros: [
      'Stabilisasi 6-stop IBIS di dalam body rangefinder ringkas yang ikonik',
      'Hybrid Optical & Electronic Viewfinder (O-EVF) eksklusif',
      'Lensa 23mm f/2 tajam dengan filter ND internal 4-stop',
      '20 mode Film Simulation termasuk REALA ACE terbaru',
    ],
    cons: [
      'Perlu adapter ring dan filter pelindung tambahan untuk weather-sealing penuh',
      'Permintaan pasar global sangat tinggi',
    ],
    verdict: 'Kamera mahakarya modern yang mengubah momen sehari-hari menjadi karya visual artistik.',
    badge: 'Trending',
  },
  {
    id: 'fuji-xh2s',
    name: 'Fujifilm X-H2S',
    brand: 'Fujifilm',
    category: 'Mirrorless',
    price: 38999000,
    rating: 4.8,
    reviewCount: 29,
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Sensor stacked 26.1MP dengan kecepatan burst 40 fps blackout-free dan perekaman internal ProRes.',
    affiliateUrl: 'https://fujifilm.com',
    specs: {
      sensor: '26.1MP APS-C X-Trans CMOS 5 HS (Stacked BSI)',
      resolution: '6240 x 4160',
      lensMount: 'Fujifilm X Mount',
      isoRange: '160 - 12800 (Exp 80 - 51200)',
      autofocus: 'Phase Detection dengan AI Subject Tracking',
      video: '4K 120p, 6.2K 30p Apple ProRes internal',
      burstRate: 'Hingga 40 fps blackout-free elektronik',
      weight: '660g',
      batteryLife: '720 frame',
    },
    pros: [
      'Sensor stacked super cepat tanpa rolling shutter',
      'Perekaman video internal Apple ProRes 422 HQ',
      'Handgrip ergonomis dalam dan layar LCD status atas',
    ],
    cons: [
      'Harga flagship untuk format APS-C',
      'Membutuhkan slot CFexpress Type B untuk kecepatan baca-tulis optimal',
    ],
    verdict: 'Monster kecepatan hybrid untuk kebutuhan olahraga, satwa liar, dan sinematografi komersial.',
    badge: 'Pro Flagship',
  },
];

export const FUJIFILM_STARTER_ARTICLES: Article[] = [
  {
    id: 'art-fuji-color-science',
    title: 'Seni Film Simulation: Bagaimana Fujifilm Merevolusi Color Science Digital',
    slug: 'fujifilm-film-simulations-guide',
    category: 'GUIDES',
    date: 'Sep 2024',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    summary: 'Dari Classic Chrome hingga REALA ACE: Eksplorasi resep custom tone curve, dynamic range, dan estetika JPEG langsung dari kamera.',
    content: [
      'Selama berdekade, Fujifilm memproduksi emulsi film fotografi legendaris seperti Velvia untuk lanskap, Provia untuk warna alami, dan Astia untuk potret halus.',
      'Di era digital, keahlian kimiawi ini diintegrasikan ke dalam Film Simulation digital. Berbeda dari profil warna digital standar, Film Simulation mengatur kurva tonal, struktur grain mikro, dan sensitivitas spektral cahaya.',
      'Dengan mengatur recipe custom in-camera, fotografer dapat menghasilkan visual berkualitas majalah tanpa perlu berjam-jam editing file RAW.',
    ],
    author: DEFAULT_AUTHOR,
    featured: true,
    featuredType: 'hero',
    tags: ['Guides', 'Color Science', 'Fujifilm', 'Featured'],
  },
  {
    id: 'art-fuji-xt5-review',
    title: 'Fujifilm X-T5 Field Test: Kamera Impian Fotografer Purist',
    slug: 'fujifilm-xt5-field-test-review',
    category: 'REVIEWS',
    date: 'Agt 2024',
    readTime: '8 min read',
    coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    summary: 'Uji performa sensor 40.2 megapiksel, dial mekanis fisik, dan stabilisasi 7-stop IBIS di lapangan.',
    content: [
      'Fujifilm X-T5 menghadirkan esensi fotografi sejati. Dengan dial mekanis untuk shutter speed, ISO, dan exposure compensation, tangan berinteraksi langsung dengan kendali fisik.',
      'Dipadukan dengan jajaran lensa prima Fujinon seperti 33mm f/1.4 R LM WR, detail yang dihasilkan luar biasa tajam dengan transisi highlight yang sangat lembut.',
    ],
    author: DEFAULT_AUTHOR,
    featured: true,
    featuredType: 'popular',
    tags: ['Reviews', 'Mirrorless', 'Fujifilm'],
  },
];
