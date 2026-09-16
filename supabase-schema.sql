-- ==============================================================================
-- FUJIFINDER - COMPLETE SUPABASE SQL SCHEMA SETUP
-- Project ID: pytnktxszkcnmgmrlaff
-- Link: https://supabase.com/dashboard/project/pytnktxszkcnmgmrlaff/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AUTO-UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABLE: ARTICLES (Editorial Posts, Reviews, Guides, & SEO Metadata)
-- ------------------------------------------------------------------------------
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

-- Indexing for fast search & SEO routing
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Trigger for articles updated_at
DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. TABLE: CAMERAS (Product Database, Specs, Ratings & Lab Reviews)
-- ------------------------------------------------------------------------------
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

-- Indexing for fast catalog filtering
CREATE INDEX IF NOT EXISTS idx_cameras_category ON public.cameras(category);
CREATE INDEX IF NOT EXISTS idx_cameras_brand ON public.cameras(brand);
CREATE INDEX IF NOT EXISTS idx_cameras_price ON public.cameras(price);
CREATE INDEX IF NOT EXISTS idx_cameras_rating ON public.cameras(rating DESC);

-- Trigger for cameras updated_at
DROP TRIGGER IF EXISTS trigger_cameras_updated_at ON public.cameras;
CREATE TRIGGER trigger_cameras_updated_at
    BEFORE UPDATE ON public.cameras
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. TABLE: AUTHORS (Editorial Profiles & Global Author Settings)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. TABLE: SUBSCRIBERS (Newsletter Signups)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES (Anon Key Access)
-- ------------------------------------------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Articles Policies
DROP POLICY IF EXISTS "Allow public read on articles" ON public.articles;
CREATE POLICY "Allow public read on articles" ON public.articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on articles" ON public.articles;
CREATE POLICY "Allow public insert on articles" ON public.articles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on articles" ON public.articles;
CREATE POLICY "Allow public update on articles" ON public.articles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on articles" ON public.articles;
CREATE POLICY "Allow public delete on articles" ON public.articles FOR DELETE USING (true);

-- Cameras Policies
DROP POLICY IF EXISTS "Allow public read on cameras" ON public.cameras;
CREATE POLICY "Allow public read on cameras" ON public.cameras FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on cameras" ON public.cameras;
CREATE POLICY "Allow public insert on cameras" ON public.cameras FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on cameras" ON public.cameras;
CREATE POLICY "Allow public update on cameras" ON public.cameras FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on cameras" ON public.cameras;
CREATE POLICY "Allow public delete on cameras" ON public.cameras FOR DELETE USING (true);

-- Authors Policies
DROP POLICY IF EXISTS "Allow public read on authors" ON public.authors;
CREATE POLICY "Allow public read on authors" ON public.authors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on authors" ON public.authors;
CREATE POLICY "Allow public insert on authors" ON public.authors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on authors" ON public.authors;
CREATE POLICY "Allow public update on authors" ON public.authors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on authors" ON public.authors;
CREATE POLICY "Allow public delete on authors" ON public.authors FOR DELETE USING (true);

-- Subscribers Policies
DROP POLICY IF EXISTS "Allow public read on subscribers" ON public.subscribers;
CREATE POLICY "Allow public read on subscribers" ON public.subscribers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert on subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on subscribers" ON public.subscribers;
CREATE POLICY "Allow public delete on subscribers" ON public.subscribers FOR DELETE USING (true);
