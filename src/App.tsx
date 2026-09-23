import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { PopularNowSection } from './components/PopularNowSection';
import { FeaturedGuideAndSidebar } from './components/FeaturedGuideAndSidebar';
import { RecommendedCamerasSection } from './components/RecommendedCamerasSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';

import { ArticleDetailModal } from './components/ArticleDetailModal';
import { CameraDetailModal } from './components/CameraDetailModal';
import { ComparisonModal } from './components/ComparisonModal';
import { SearchModal } from './components/SearchModal';
import { AdminCMSModal } from './components/AdminCMSModal';
import { PublicArticleView } from './components/PublicArticleView';
import { NotFoundView } from './components/NotFoundView';

import { CameraCatalogView } from './components/CameraCatalogView';
import { ReviewsView } from './components/ReviewsView';
import { GuidesView } from './components/GuidesView';
import { BlogView } from './components/BlogView';

import { Article, Author, CameraProduct, CategoryType } from './types';
import { FUJIFILM_STARTER_CAMERAS, FUJIFILM_STARTER_ARTICLES, DEFAULT_AUTHOR } from './data/mockData';
import { trackPageView } from './utils/analytics';
import {
  getArticlesFromSupabase,
  getArticleBySlugFromSupabase,
  upsertArticleInSupabase,
  deleteArticleFromSupabase,
  getCamerasFromSupabase,
  upsertCameraInSupabase,
  deleteCameraFromSupabase,
} from './services/supabaseService';
import { setArticleSEO, resetDefaultSEO } from './utils/seoManager';

export default function App() {
  // Navigation & view states
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | null>(null);
  const [publicArticle, setPublicArticle] = useState<Article | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeNotFoundSlug, setRouteNotFoundSlug] = useState<string | null>(null);

  // Dynamic content states (starts with local cache or fallback starter articles, then syncs with Supabase)
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('fujifinder_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return FUJIFILM_STARTER_ARTICLES;
  });

  const [cameras, setCameras] = useState<CameraProduct[]>(() => {
    try {
      const saved = localStorage.getItem('fujifinder_cameras');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return FUJIFILM_STARTER_CAMERAS;
  });

  const [globalAuthor, setGlobalAuthor] = useState<Author>(() => {
    try {
      const saved = localStorage.getItem('fujifinder_global_author');
      return saved ? JSON.parse(saved) : DEFAULT_AUTHOR;
    } catch {
      return DEFAULT_AUTHOR;
    }
  });

  // Initial fetch from Supabase cloud database
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      try {
        const [articlesRes, camerasRes] = await Promise.all([
          getArticlesFromSupabase(),
          getCamerasFromSupabase(),
        ]);

        if (isMounted) {
          if (articlesRes.data && articlesRes.data.length > 0) {
            setArticles(articlesRes.data);
          }
          if (camerasRes.data && camerasRes.data.length > 0) {
            setCameras(camerasRes.data);
          }
        }
      } catch (err) {
        console.warn('Supabase fetch notice:', err);
      }
    }

    loadFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('fujifinder_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('fujifinder_cameras', JSON.stringify(cameras));
  }, [cameras]);

  useEffect(() => {
    localStorage.setItem('fujifinder_global_author', JSON.stringify(globalAuthor));
  }, [globalAuthor]);

  // Helper: Extract view and slug from current URL
  const parseCurrentUrl = useCallback((): { view: string; slug?: string } => {
    if (typeof window === 'undefined') return { view: 'home' };
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    // Check pathname first (standard /artikel/:slug)
    if (pathname.startsWith('/artikel/')) {
      const rawSlug = pathname.replace('/artikel/', '').split('/')[0].split('?')[0];
      const slug = decodeURIComponent(rawSlug).trim();
      if (slug) return { view: 'public-article', slug };
    }

    // Check hash fallback (#/artikel/:slug)
    if (hash.startsWith('#/artikel/')) {
      const rawSlug = hash.replace('#/artikel/', '').split('/')[0].split('?')[0];
      const slug = decodeURIComponent(rawSlug).trim();
      if (slug) return { view: 'public-article', slug };
    }

    if (pathname === '/kamera' || pathname === '/cameras') {
      return { view: 'cameras' };
    }
    if (pathname === '/reviews') {
      return { view: 'reviews' };
    }
    if (pathname === '/guides') {
      return { view: 'guides' };
    }
    if (pathname === '/blog') {
      return { view: 'blog' };
    }

    return { view: 'home' };
  }, []);

  // Robust URL Route Resolver for direct links, browser refresh, incognito, WhatsApp, & search engines
  useEffect(() => {
    let isCancelled = false;

    async function resolveRoute() {
      const route = parseCurrentUrl();

      if (route.view === 'public-article' && route.slug) {
        const targetSlug = route.slug;

        // 1. Check in loaded articles memory state
        let found = articles.find(
          (a) => a.slug === targetSlug || a.id === targetSlug
        );

        // 2. Check in starter articles
        if (!found) {
          found = FUJIFILM_STARTER_ARTICLES.find(
            (a) => a.slug === targetSlug || a.id === targetSlug
          );
        }

        if (found) {
          if (!isCancelled) {
            setPublicArticle(found);
            setCurrentView('public-article');
            setRouteNotFoundSlug(null);
            setIsLoadingRoute(false);
          }
          return;
        }

        // 3. If not in memory yet (e.g. freshly published article on another device), query Supabase directly
        setIsLoadingRoute(true);
        try {
          const { data: dbArticle } = await getArticleBySlugFromSupabase(targetSlug);

          if (isCancelled) return;

          if (dbArticle) {
            setPublicArticle(dbArticle);
            setCurrentView('public-article');
            setRouteNotFoundSlug(null);
            // Merge into articles cache
            setArticles((prev) => {
              if (prev.some((a) => a.id === dbArticle.id || a.slug === dbArticle.slug)) {
                return prev;
              }
              return [dbArticle, ...prev];
            });
          } else {
            // Slug does not exist -> Show standard 404 page
            setPublicArticle(null);
            setCurrentView('not-found');
            setRouteNotFoundSlug(targetSlug);
          }
        } catch (err) {
          console.error('Failed to fetch article by slug from Supabase:', err);
          if (!isCancelled) {
            setPublicArticle(null);
            setCurrentView('not-found');
            setRouteNotFoundSlug(targetSlug);
          }
        } finally {
          if (!isCancelled) {
            setIsLoadingRoute(false);
          }
        }
      } else if (route.view === 'cameras') {
        setCurrentView('cameras');
        setPublicArticle(null);
        setRouteNotFoundSlug(null);
        setIsLoadingRoute(false);
      } else if (route.view === 'reviews') {
        setCurrentView('reviews');
        setPublicArticle(null);
        setRouteNotFoundSlug(null);
        setIsLoadingRoute(false);
      } else if (route.view === 'guides') {
        setCurrentView('guides');
        setPublicArticle(null);
        setRouteNotFoundSlug(null);
        setIsLoadingRoute(false);
      } else if (route.view === 'blog') {
        setCurrentView('blog');
        setPublicArticle(null);
        setRouteNotFoundSlug(null);
        setIsLoadingRoute(false);
      } else {
        setCurrentView('home');
        setPublicArticle(null);
        setRouteNotFoundSlug(null);
        setIsLoadingRoute(false);
      }
    }

    resolveRoute();

    const handlePopState = () => {
      resolveRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      isCancelled = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [articles, parseCurrentUrl]);

  // Track SPA pageviews in Google Analytics
  useEffect(() => {
    let path = '/';
    let title = 'FujiFinder — The Art & Science of Modern Cameras';

    if (currentView === 'public-article' && publicArticle) {
      path = `/artikel/${publicArticle.slug}`;
      title = `${publicArticle.title} — FujiFinder`;
    } else if (currentView === 'not-found') {
      path = routeNotFoundSlug ? `/artikel/${routeNotFoundSlug}` : '/404';
      title = 'Halaman Tidak Ditemukan — FujiFinder';
    } else if (currentView === 'cameras') {
      path = selectedCategoryFilter ? `/kamera?kategori=${selectedCategoryFilter}` : '/kamera';
      title = selectedCategoryFilter ? `Katalog Kamera ${selectedCategoryFilter} — FujiFinder` : 'Katalog Kamera — FujiFinder';
    } else if (currentView === 'reviews') {
      path = '/reviews';
      title = 'Lab Reviews & Field Tests — FujiFinder';
    } else if (currentView === 'guides') {
      path = '/guides';
      title = 'Panduan Fotografi & Resep Film — FujiFinder';
    } else if (currentView === 'blog') {
      path = '/blog';
      title = 'Jurnal & Opini Fotografi — FujiFinder';
    }

    trackPageView(path, title);
  }, [currentView, selectedCategoryFilter, publicArticle, routeNotFoundSlug]);

  // Modal states
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activeCamera, setActiveCamera] = useState<CameraProduct | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [compareTargetA, setCompareTargetA] = useState<CameraProduct | null>(null);
  const [compareTargetB, setCompareTargetB] = useState<CameraProduct | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cmsModalOpen, setCmsModalOpen] = useState(false);

  // Navigation handlers with standard clean URL updates
  const handleNavigate = (view: string, filter?: string) => {
    if (view === 'comparisons') {
      setCurrentView('cameras');
      setSelectedCategoryFilter(null);
      setPublicArticle(null);
      setRouteNotFoundSlug(null);
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/kamera');
      }
      resetDefaultSEO();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    setPublicArticle(null);
    setRouteNotFoundSlug(null);

    if (filter) {
      setSelectedCategoryFilter(filter as CategoryType);
    } else {
      setSelectedCategoryFilter(null);
    }

    if (typeof window !== 'undefined' && window.history) {
      let targetPath = '/';
      if (view === 'cameras') targetPath = filter ? `/kamera?kategori=${filter}` : '/kamera';
      else if (view === 'reviews') targetPath = '/reviews';
      else if (view === 'guides') targetPath = '/guides';
      else if (view === 'blog') targetPath = '/blog';
      window.history.pushState({}, '', targetPath);
    }

    resetDefaultSEO();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: CategoryType) => {
    setSelectedCategoryFilter(category);
    setCurrentView('cameras');
    setPublicArticle(null);
    setRouteNotFoundSlug(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/kamera?kategori=${category}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadHeroStory = (slug: string) => {
    const found = publishedArticles.find((a) => a.slug === slug) || publishedArticles[0];
    if (found) {
      handleOpenPublicArticle(found);
    }
  };

  const handleOpenPublicArticle = (article: Article) => {
    setPublicArticle(article);
    setCurrentView('public-article');
    setRouteNotFoundSlug(null);
    // Update browser URL history gracefully with clean /artikel/[slug]
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/artikel/${article.slug}`);
    }
    setArticleSEO(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComparison = (cameraA: CameraProduct, cameraB?: CameraProduct) => {
    if (publishedCameras.length < 2) return;
    setCompareTargetA(cameraA);
    if (cameraB) {
      setCompareTargetB(cameraB);
    } else {
      const alternate = publishedCameras.find((c) => c.id !== cameraA.id) || publishedCameras[0] || cameraA;
      setCompareTargetB(alternate);
    }
    setComparisonModalOpen(true);
  };

  // CMS Handlers with Supabase Cloud Sync
  const handleAddArticle = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev]);
    upsertArticleInSupabase(newArticle).catch((err) => {
      console.warn('Background Supabase article insert notice:', err);
    });
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    setArticles((prev) => prev.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)));
    if (publicArticle && publicArticle.id === updatedArticle.id) {
      setPublicArticle(updatedArticle);
      setArticleSEO(updatedArticle);
    }
    upsertArticleInSupabase(updatedArticle).catch((err) => {
      console.warn('Background Supabase article update notice:', err);
    });
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    if (publicArticle && publicArticle.id === id) {
      handleNavigate('home');
    }
    deleteArticleFromSupabase(id).catch((err) => {
      console.warn('Background Supabase article delete notice:', err);
    });
  };

  const handleAddCamera = (newCamera: CameraProduct) => {
    setCameras((prev) => [newCamera, ...prev]);
    upsertCameraInSupabase(newCamera).catch((err) => {
      console.warn('Background Supabase camera insert notice:', err);
    });
  };

  const handleUpdateCamera = (updatedCamera: CameraProduct) => {
    setCameras((prev) => prev.map((c) => (c.id === updatedCamera.id ? updatedCamera : c)));
    upsertCameraInSupabase(updatedCamera).catch((err) => {
      console.warn('Background Supabase camera update notice:', err);
    });
  };

  const handleDeleteCamera = (id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
    deleteCameraFromSupabase(id).catch((err) => {
      console.warn('Background Supabase camera delete notice:', err);
    });
  };

  const handleClearAllData = () => {
    localStorage.removeItem('fujifinder_articles');
    localStorage.removeItem('fujifinder_cameras');
    setArticles([]);
    setCameras([]);
  };

  const handleLoadPresetData = () => {
    setArticles(FUJIFILM_STARTER_ARTICLES);
    setCameras(FUJIFILM_STARTER_CAMERAS);
    // Also sync starter pack to Supabase
    FUJIFILM_STARTER_ARTICLES.forEach((a) => upsertArticleInSupabase(a));
    FUJIFILM_STARTER_CAMERAS.forEach((c) => upsertCameraInSupabase(c));
  };

  const handleUpdateGlobalAuthor = (newAuthor: Author, applyToAll: boolean = false) => {
    setGlobalAuthor(newAuthor);
    localStorage.setItem('fujifinder_global_author', JSON.stringify(newAuthor));
    if (applyToAll) {
      setArticles((prev) =>
        prev.map((art) => ({
          ...art,
          author: newAuthor,
        }))
      );
    }
  };

  // Published-only filter for public site views
  const publishedArticles = articles.filter((a) => a.status !== 'draft');
  const publishedCameras = cameras.filter((c) => c.status !== 'draft');

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenCMS={() => setCmsModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-grow">
        {/* Sleek Loading State for Direct URL Resolving */}
        {isLoadingRoute && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20">
            <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Memuat Artikel...
            </p>
          </div>
        )}

        {/* 404 Not Found Page */}
        {!isLoadingRoute && currentView === 'not-found' && (
          <NotFoundView
            slug={routeNotFoundSlug || undefined}
            publishedArticles={publishedArticles}
            publishedCameras={publishedCameras}
            onBackToHome={() => handleNavigate('home')}
            onSelectArticle={(art) => handleOpenPublicArticle(art)}
            onNavigateToCameras={() => handleNavigate('cameras')}
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        )}

        {/* Public Article Detail View */}
        {!isLoadingRoute && currentView === 'public-article' && publicArticle && (
          <PublicArticleView
            article={publicArticle}
            allPublishedArticles={publishedArticles}
            allCameras={publishedCameras}
            onSelectArticle={(art) => handleOpenPublicArticle(art)}
            onSelectCamera={(camera) => setActiveCamera(camera)}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* Homepage */}
        {!isLoadingRoute && currentView === 'home' && (
          <>
            {/* 1. Cinematic Hero Section */}
            <HeroSection
              articles={publishedArticles}
              onReadStory={handleReadHeroStory}
              onExploreCameras={() => handleNavigate('cameras')}
            />

            {/* 2. Explore by Category Section */}
            <CategoriesSection
              articles={publishedArticles}
              onSelectCategory={handleSelectCategory}
              onViewAllCategories={() => handleNavigate('cameras')}
            />

            {/* 3. Popular Now Section */}
            <PopularNowSection
              articles={publishedArticles}
              onArticleClick={(article) => handleOpenPublicArticle(article)}
              onViewAllArticles={() => handleNavigate('blog')}
              onOpenCMS={() => setCmsModalOpen(true)}
            />

            {/* 4. Featured Guide & Author Sidebar Discovery */}
            <FeaturedGuideAndSidebar
              articles={publishedArticles}
              onArticleClick={(article) => handleOpenPublicArticle(article)}
              onOpenCMS={() => setCmsModalOpen(true)}
              onExploreCameras={() => handleNavigate('cameras')}
            />

            {/* 5. Recommended Cameras Section */}
            <RecommendedCamerasSection
              cameras={publishedCameras}
              onSelectCamera={(camera) => setActiveCamera(camera)}
              onViewAllCameras={() => handleNavigate('cameras')}
              onCompareWith={(camera) => handleOpenComparison(camera)}
              onOpenCMS={() => setCmsModalOpen(true)}
            />

            {/* 6. Dark Newsletter Section */}
            <NewsletterSection />
          </>
        )}

        {/* Cameras Catalog */}
        {!isLoadingRoute && currentView === 'cameras' && (
          <>
            <CameraCatalogView
              cameras={publishedCameras}
              initialCategory={selectedCategoryFilter}
              onSelectCamera={(camera) => setActiveCamera(camera)}
              onCompareWith={(camera) => handleOpenComparison(camera)}
              onBackToHome={() => handleNavigate('home')}
              onOpenCMS={() => setCmsModalOpen(true)}
            />
            <NewsletterSection />
          </>
        )}

        {/* Reviews */}
        {!isLoadingRoute && currentView === 'reviews' && (
          <>
            <ReviewsView
              articles={publishedArticles}
              cameras={publishedCameras}
              onSelectArticle={(article) => handleOpenPublicArticle(article)}
              onSelectCamera={(camera) => setActiveCamera(camera)}
              onCompareWith={(camera) => handleOpenComparison(camera)}
              onBackToHome={() => handleNavigate('home')}
              onOpenCMS={() => setCmsModalOpen(true)}
            />
            <NewsletterSection />
          </>
        )}

        {/* Guides */}
        {!isLoadingRoute && currentView === 'guides' && (
          <>
            <GuidesView
              articles={publishedArticles}
              onSelectArticle={(article) => handleOpenPublicArticle(article)}
              onBackToHome={() => handleNavigate('home')}
              onOpenCMS={() => setCmsModalOpen(true)}
            />
            <NewsletterSection />
          </>
        )}

        {/* Blog */}
        {!isLoadingRoute && currentView === 'blog' && (
          <>
            <BlogView
              articles={publishedArticles}
              onSelectArticle={(article) => handleOpenPublicArticle(article)}
              onBackToHome={() => handleNavigate('home')}
              onOpenCMS={() => setCmsModalOpen(true)}
            />
            <NewsletterSection />
          </>
        )}
      </main>

      {/* Global Minimalist Editorial Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onOpenCMS={() => setCmsModalOpen(true)}
      />

      {/* Modals & Drawers */}
      <ArticleDetailModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onSelectCamera={(camera) => setActiveCamera(camera)}
        onOpenPublicPage={(art) => handleOpenPublicArticle(art)}
      />

      <CameraDetailModal
        camera={activeCamera}
        onClose={() => setActiveCamera(null)}
        onCompare={(camera) => handleOpenComparison(camera)}
      />

      {comparisonModalOpen && (
        <ComparisonModal
          cameras={publishedCameras}
          initialCameraA={compareTargetA}
          initialCameraB={compareTargetB}
          onClose={() => setComparisonModalOpen(false)}
          onSelectCamera={(camera) => setActiveCamera(camera)}
        />
      )}

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        articles={publishedArticles}
        cameras={publishedCameras}
        onSelectArticle={(article) => handleOpenPublicArticle(article)}
        onSelectCamera={(camera) => setActiveCamera(camera)}
        onSelectCategory={(cat) => handleSelectCategory(cat as CategoryType)}
      />

      <AdminCMSModal
        isOpen={cmsModalOpen}
        onClose={() => setCmsModalOpen(false)}
        articles={articles}
        cameras={cameras}
        globalAuthor={globalAuthor}
        onUpdateGlobalAuthor={handleUpdateGlobalAuthor}
        onViewPublicArticle={(art) => handleOpenPublicArticle(art)}
        onAddArticle={handleAddArticle}
        onUpdateArticle={handleUpdateArticle}
        onDeleteArticle={handleDeleteArticle}
        onAddCamera={handleAddCamera}
        onUpdateCamera={handleUpdateCamera}
        onDeleteCamera={handleDeleteCamera}
        onClearAllData={handleClearAllData}
        onLoadPresetData={handleLoadPresetData}
      />
    </div>
  );
}
