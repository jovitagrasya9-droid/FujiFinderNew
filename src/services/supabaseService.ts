import { supabase } from '../lib/supabase';
import { Article, CameraProduct, Author } from '../types';

export interface SubscriberRecord {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

// ----------------------------------------------------
// SQL SETUP SCHEMA FOR SUPABASE SQL EDITOR
// ----------------------------------------------------
export const SUPABASE_SQL_SCHEMA = `-- FujiFinder Supabase Database Setup Schema
-- Run this SQL in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/pytnktxszkcnmgmrlaff/sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Table: Articles
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    cover_image_alt TEXT,
    canonical_url TEXT,
    date_modified TEXT,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    summary TEXT,
    content JSONB DEFAULT '[]'::jsonb,
    author JSONB NOT NULL,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    featured BOOLEAN DEFAULT false,
    featured_type TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    recommended_camera_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. Table: Cameras
CREATE TABLE IF NOT EXISTS public.cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    short_desc TEXT,
    affiliate_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    specs JSONB DEFAULT '{}'::jsonb,
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    verdict TEXT,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cameras_category ON public.cameras(category);
CREATE INDEX IF NOT EXISTS idx_cameras_brand ON public.cameras(brand);

DROP TRIGGER IF EXISTS trigger_cameras_updated_at ON public.cameras;
CREATE TRIGGER trigger_cameras_updated_at
    BEFORE UPDATE ON public.cameras
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Table: Authors
CREATE TABLE IF NOT EXISTS public.authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT NOT NULL,
    bio TEXT,
    socials JSONB DEFAULT '{}'::jsonb,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table: Subscribers
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- 5. Row Level Security & Policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on articles" ON public.articles;
CREATE POLICY "Allow public read on articles" ON public.articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on articles" ON public.articles;
CREATE POLICY "Allow public insert on articles" ON public.articles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on articles" ON public.articles;
CREATE POLICY "Allow public update on articles" ON public.articles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on articles" ON public.articles;
CREATE POLICY "Allow public delete on articles" ON public.articles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on cameras" ON public.cameras;
CREATE POLICY "Allow public read on cameras" ON public.cameras FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on cameras" ON public.cameras;
CREATE POLICY "Allow public insert on cameras" ON public.cameras FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on cameras" ON public.cameras;
CREATE POLICY "Allow public update on cameras" ON public.cameras FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on cameras" ON public.cameras;
CREATE POLICY "Allow public delete on cameras" ON public.cameras FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on authors" ON public.authors;
CREATE POLICY "Allow public read on authors" ON public.authors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on authors" ON public.authors;
CREATE POLICY "Allow public insert on authors" ON public.authors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on authors" ON public.authors;
CREATE POLICY "Allow public update on authors" ON public.authors FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on authors" ON public.authors;
CREATE POLICY "Allow public delete on authors" ON public.authors FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on subscribers" ON public.subscribers;
CREATE POLICY "Allow public read on subscribers" ON public.subscribers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert on subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete on subscribers" ON public.subscribers;
CREATE POLICY "Allow public delete on subscribers" ON public.subscribers FOR DELETE USING (true);
`;

// Helper: Transform DB row to Article
function mapRowToArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    seoTitle: row.seo_title || undefined,
    metaDescription: row.meta_description || undefined,
    coverImageAlt: row.cover_image_alt || undefined,
    canonicalUrl: row.canonical_url || undefined,
    dateModified: row.date_modified || undefined,
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    coverImage: row.cover_image,
    summary: row.summary || '',
    content: Array.isArray(row.content) ? row.content : [],
    author: typeof row.author === 'object' && row.author ? row.author : {
      id: 'author-default',
      name: 'Editorial Team',
      role: 'Staff Writer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'FujiFinder editorial writer',
      socials: {},
    },
    status: row.status || 'published',
    featured: Boolean(row.featured),
    featuredType: row.featured_type || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    recommendedCameraId: row.recommended_camera_id || undefined,
  };
}

// Helper: Transform Article to DB row
function mapArticleToRow(article: Article) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    seo_title: article.seoTitle || null,
    meta_description: article.metaDescription || null,
    cover_image_alt: article.coverImageAlt || null,
    canonical_url: article.canonicalUrl || null,
    date_modified: article.dateModified || null,
    category: article.category,
    date: article.date,
    read_time: article.readTime,
    cover_image: article.coverImage,
    summary: article.summary,
    content: article.content || [],
    author: article.author,
    status: article.status || 'published',
    featured: Boolean(article.featured),
    featured_type: article.featuredType || null,
    tags: article.tags || [],
    recommended_camera_id: article.recommendedCameraId || null,
    updated_at: new Date().toISOString(),
  };
}

// Helper: Transform DB row to CameraProduct
function mapRowToCamera(row: any): CameraProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count || 0),
    image: row.image,
    shortDesc: row.short_desc || '',
    affiliateUrl: row.affiliate_url || '#',
    status: row.status || 'published',
    specs: typeof row.specs === 'object' && row.specs ? row.specs : {
      sensor: 'APS-C',
      resolution: '26 MP',
      isoRange: '160-12800',
      autofocus: 'Hybrid AF',
      video: '4K',
      burstRate: '15 fps',
      weight: '450g',
      batteryLife: '400 shots',
    },
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    verdict: row.verdict || '',
    badge: row.badge || undefined,
  };
}

// Helper: Transform CameraProduct to DB row
function mapCameraToRow(cam: CameraProduct) {
  return {
    id: cam.id,
    name: cam.name,
    brand: cam.brand,
    category: cam.category,
    price: cam.price,
    original_price: cam.originalPrice || null,
    rating: cam.rating,
    review_count: cam.reviewCount,
    image: cam.image,
    short_desc: cam.shortDesc,
    affiliate_url: cam.affiliateUrl,
    status: cam.status || 'published',
    specs: cam.specs || {},
    pros: cam.pros || [],
    cons: cam.cons || [],
    verdict: cam.verdict || '',
    badge: cam.badge || null,
    updated_at: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// ARTICLES API
// ----------------------------------------------------
export async function getArticlesFromSupabase(): Promise<{ data: Article[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };
    return { data: (data || []).map(mapRowToArticle), error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function upsertArticleInSupabase(article: Article): Promise<{ success: boolean; error: any }> {
  try {
    const row = mapArticleToRow(article);
    const { error } = await supabase
      .from('articles')
      .upsert(row, { onConflict: 'id' });

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function deleteArticleFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

// ----------------------------------------------------
// CAMERAS API
// ----------------------------------------------------
export async function getCamerasFromSupabase(): Promise<{ data: CameraProduct[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };
    return { data: (data || []).map(mapRowToCamera), error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function upsertCameraInSupabase(camera: CameraProduct): Promise<{ success: boolean; error: any }> {
  try {
    const row = mapCameraToRow(camera);
    const { error } = await supabase
      .from('cameras')
      .upsert(row, { onConflict: 'id' });

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function deleteCameraFromSupabase(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

// ----------------------------------------------------
// SUBSCRIBERS API
// ----------------------------------------------------
export async function getSubscribersFromSupabase(): Promise<{ data: SubscriberRecord[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };
    return { data: data as SubscriberRecord[], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function addSubscriberToSupabase(email: string, name?: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: email.trim().toLowerCase(), name: name?.trim() || null }]);

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}
