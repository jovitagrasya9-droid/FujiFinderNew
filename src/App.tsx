import React, { useState, useEffect } from 'react';
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

import { CameraCatalogView } from './components/CameraCatalogView';
import { ReviewsView } from './components/ReviewsView';
import { GuidesView } from './components/GuidesView';
import { BlogView } from './components/BlogView';

import { Article, Author, CameraProduct, CategoryType } from './types';
import { FUJIFILM_STARTER_CAMERAS, FUJIFILM_STARTER_ARTICLES, DEFAULT_AUTHOR } from './data/mockData';
import {
  getArticlesFromSupabase,
  upsertArticleInSupabase,
  deleteArticleFromSupabase,
  getCamerasFromSupabase,
  upsertCameraInSupabase,
  deleteCameraFromSupabase,
} from './services/supabaseService';

export default function App() {
  // Navigation & view states
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | null>(null);
  const [publicArticle, setPublicArticle] = useState<Article | null>(null);

  // Dynamic content states (starts with local cache or empty, then syncs with Supabase)
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('fujifinder_articles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cameras, setCameras] = useState<CameraProduct[]>(() => {
    try {
      const saved = localStorage.getItem('fujifinder_cameras');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

  // Handle URL Routing for /artikel/:slug or query/hash
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      let slug = '';
      if (path.startsWith('/artikel/')) {
        slug = decodeURIComponent(path.replace('/artikel/', '').split('/')[0]);
      } else if (hash.startsWith('#/artikel/')) {
        slug = decodeURIComponent(hash.replace('#/artikel/', ''));
      }

      if (slug && articles.length > 0) {
        const found = articles.find((a) => a.slug === slug || a.id === slug);
        if (found) {
          setPublicArticle(found);
          setCurrentView('public-article');
          return;
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [articles]);

  // Modal states
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activeCamera, setActiveCamera] = useState<CameraProduct | null>(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [compareTargetA, setCompareTargetA] = useState<CameraProduct | null>(null);
  const [compareTargetB, setCompareTargetB] = useState<CameraProduct | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cmsModalOpen, setCmsModalOpen] = useState(false);

  // Handlers
  const handleNavigate = (view: string, filter?: string) => {
    if (view === 'comparisons') {
      setCurrentView('cameras');
      setSelectedCategoryFilter(null);
      setPublicArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView(view);
    setPublicArticle(null);
    if (filter) {
      setSelectedCategoryFilter(filter as CategoryType);
    } else {
      setSelectedCategoryFilter(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: CategoryType) => {
    setSelectedCategoryFilter(category);
    setCurrentView('cameras');
    setPublicArticle(null);
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
    // Update browser URL history gracefully
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', `/artikel/${article.slug}`);
    }
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

  // CMS Handlers with Supabase Sync
  const handleAddArticle = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev]);
    upsertArticleInSupabase(newArticle).catch((err) => {
      console.warn('Background Supabase article insert notice:', err);
    });
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    setArticles((prev) => prev.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)));
    upsertArticleInSupabase(updatedArticle).catch((err) => {
      console.warn('Background Supabase article update notice:', err);
    });
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
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
        {currentView === 'public-article' && publicArticle && (
          <PublicArticleView
            article={publicArticle}
            allPublishedArticles={publishedArticles}
            allCameras={publishedCameras}
            onSelectArticle={(art) => handleOpenPublicArticle(art)}
            onSelectCamera={(camera) => setActiveCamera(camera)}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'home' && (
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

        {currentView === 'cameras' && (
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

        {currentView === 'reviews' && (
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

        {currentView === 'guides' && (
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

        {currentView === 'blog' && (
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
