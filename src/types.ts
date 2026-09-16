export type CategoryType = 
  | 'Mirrorless'
  | 'DSLR'
  | 'Compact'
  | 'Action Camera'
  | 'Vlogging'
  | 'Accessories';

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  socials: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface CameraProduct {
  id: string;
  name: string;
  brand: 'Sony' | 'Canon' | 'Fujifilm' | 'Nikon' | 'GoPro' | 'Leica' | 'Panasonic' | 'DJI';
  category: CategoryType;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  shortDesc: string;
  affiliateUrl: string;
  status?: 'published' | 'draft';
  specs: {
    sensor: string;
    resolution: string;
    lensMount?: string;
    isoRange: string;
    autofocus: string;
    video: string;
    burstRate: string;
    weight: string;
    batteryLife: string;
  };
  pros: string[];
  cons: string[];
  verdict: string;
  badge?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  metaDescription?: string;
  coverImageAlt?: string;
  canonicalUrl?: string;
  dateModified?: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  summary: string;
  content: string[];
  author: Author;
  status?: 'published' | 'draft';
  featured?: boolean;
  featuredType?: 'hero' | 'guide' | 'popular' | 'trending';
  tags: string[];
  recommendedCameraId?: string;
}

export interface ComparisonPair {
  id: string;
  title: string;
  cameraA: CameraProduct;
  cameraB: CameraProduct;
  summary: string;
  winner: string;
  reasons: string[];
}
