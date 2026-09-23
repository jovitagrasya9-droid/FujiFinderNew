import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Camera,
  FileText,
  Users,
  CheckCircle,
  SlidersHorizontal,
  Sparkles,
  Search,
  Edit3,
  Eye,
  EyeOff,
  Download,
  Upload,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Globe,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  Database,
  Server,
  HardDrive,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { Article, Author, CameraProduct, CategoryType } from '../types';
import { DEFAULT_AUTHOR } from '../data/mockData';
import { FujiFinderLogo } from './FujiFinderLogo';
import { ArticleRichEditor } from './ArticleRichEditor';
import { ArticleContentRenderer } from './ArticleContentRenderer';
import { formatIDR } from '../utils/formatCurrency';
import { generateSlug, checkSEOReadiness } from '../utils/seoManager';
import {
  generateSitemapXml,
  downloadSitemap,
  CANONICAL_SITE_URL,
  STATIC_PUBLIC_ROUTES,
  formatIsoLastMod,
} from '../utils/sitemapGenerator';
import { SUPABASE_URL, SUPABASE_ANON_KEY, checkSupabaseConnection } from '../lib/supabase';
import {
  SUPABASE_SQL_SCHEMA,
  upsertArticleInSupabase,
  upsertCameraInSupabase,
  getArticlesFromSupabase,
  getCamerasFromSupabase,
  getSubscribersFromSupabase,
} from '../services/supabaseService';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  cameras: CameraProduct[];
  globalAuthor?: Author;
  onUpdateGlobalAuthor?: (author: Author, applyToAll?: boolean) => void;
  onAddArticle: (newArticle: Article) => void;
  onUpdateArticle: (updatedArticle: Article) => void;
  onDeleteArticle: (id: string) => void;
  onAddCamera: (newCamera: CameraProduct) => void;
  onUpdateCamera: (updatedCamera: CameraProduct) => void;
  onDeleteCamera: (id: string) => void;
  onClearAllData: () => void;
  onLoadPresetData: () => void;
  onViewPublicArticle?: (article: Article) => void;
}

interface SubscriberItem {
  email: string;
  date: string;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  articles,
  cameras,
  globalAuthor = DEFAULT_AUTHOR,
  onUpdateGlobalAuthor,
  onViewPublicArticle,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddCamera,
  onUpdateCamera,
  onDeleteCamera,
  onClearAllData,
  onLoadPresetData,
}) => {
  // ==========================================
  // AUTHENTICATION & PASSWORD STATE
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('fujifinder_cms_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState(false);

  const getSavedPassword = () => {
    try {
      return localStorage.getItem('fujifinder_cms_password') || 'admin';
    } catch {
      return 'admin';
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = getSavedPassword();
    if (enteredPassword === correctPass) {
      setIsAuthenticated(true);
      setAuthError(null);
      setEnteredPassword('');
      try {
        sessionStorage.setItem('fujifinder_cms_auth', 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError('Kata sandi salah. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowChangePassword(false);
    try {
      sessionStorage.removeItem('fujifinder_cms_auth');
    } catch {
      // ignore
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    try {
      localStorage.setItem('fujifinder_cms_password', newPassword.trim());
      setChangePassSuccess(true);
      setTimeout(() => {
        setChangePassSuccess(false);
        setShowChangePassword(false);
        setNewPassword('');
      }, 1500);
    } catch {
      // ignore
    }
  };

  // ==========================================
  // CMS TABS & GENERAL STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState<'articles' | 'cameras' | 'authors' | 'subscribers' | 'database' | 'sitemap'>('articles');

  // Sitemap Management State
  const [copiedSitemapUrl, setCopiedSitemapUrl] = useState(false);
  const [copiedSitemapXml, setCopiedSitemapXml] = useState(false);
  const [sitemapSearchQuery, setSitemapSearchQuery] = useState('');

  // Supabase Database Connection & Sync State
  const [supabaseStatus, setSupabaseStatus] = useState<'unknown' | 'testing' | 'connected' | 'error'>('unknown');
  const [supabaseMessage, setSupabaseMessage] = useState<string>('Koneksi siap diverifikasi');
  const [isSyncingToSupabase, setIsSyncingToSupabase] = useState(false);
  const [isPullingFromSupabase, setIsPullingFromSupabase] = useState(false);
  const [supabaseSyncMsg, setSupabaseSyncMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Test connection on mount or tab change
  const handleTestConnection = async () => {
    setSupabaseStatus('testing');
    setSupabaseMessage('Menghubungkan ke server Supabase...');
    const result = await checkSupabaseConnection();
    if (result.connected) {
      setSupabaseStatus('connected');
      setSupabaseMessage(result.message || 'Terhubung dengan Supabase Cloud Database');
    } else {
      setSupabaseStatus('error');
      setSupabaseMessage(result.message || 'Gagal terhubung ke Supabase');
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkSupabaseConnection().then((res) => {
        setSupabaseStatus(res.connected ? 'connected' : 'error');
        setSupabaseMessage(res.message || (res.connected ? 'Terhubung' : 'Gagal terhubung'));
      });
    }
  }, [isOpen]);

  const handleSyncAllToSupabase = async () => {
    setIsSyncingToSupabase(true);
    setSupabaseSyncMsg(null);
    try {
      let articleSuccessCount = 0;
      let cameraSuccessCount = 0;

      for (const art of articles) {
        const res = await upsertArticleInSupabase(art);
        if (res.success) articleSuccessCount++;
      }

      for (const cam of cameras) {
        const res = await upsertCameraInSupabase(cam);
        if (res.success) cameraSuccessCount++;
      }

      setSupabaseSyncMsg(`Berhasil sinkronisasi ${articleSuccessCount} artikel & ${cameraSuccessCount} kamera ke Supabase!`);
      setSupabaseStatus('connected');
    } catch (err: any) {
      setSupabaseSyncMsg(`Gagal sinkronisasi: ${err?.message || 'Error tidak diketahui'}`);
    } finally {
      setIsSyncingToSupabase(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsPullingFromSupabase(true);
    setSupabaseSyncMsg(null);
    try {
      const [artRes, camRes] = await Promise.all([
        getArticlesFromSupabase(),
        getCamerasFromSupabase(),
      ]);

      let msg = '';
      if (artRes.data) {
        artRes.data.forEach((a) => onAddArticle(a));
        msg += `${artRes.data.length} artikel ditarik. `;
      }
      if (camRes.data) {
        camRes.data.forEach((c) => onAddCamera(c));
        msg += `${camRes.data.length} kamera ditarik.`;
      }

      setSupabaseSyncMsg(`Sukses! ${msg || 'Tidak ada data baru di Supabase.'}`);
      setSupabaseStatus('connected');
    } catch (err: any) {
      setSupabaseSyncMsg(`Gagal menarik data: ${err?.message || 'Error tidak diketahui'}`);
    } finally {
      setIsPullingFromSupabase(false);
    }
  };

  // ==========================================
  // 1. ARTICLE STATE & FILTERS
  // ==========================================
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [searchArticle, setSearchArticle] = useState('');
  const [filterArticleCategory, setFilterArticleCategory] = useState<string>('ALL');
  const [filterArticleStatus, setFilterArticleStatus] = useState<string>('ALL');
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Article Form Fields
  const [artTitle, setArtTitle] = useState('');
  const [artSlug, setArtSlug] = useState('');
  const [artSeoTitle, setArtSeoTitle] = useState('');
  const [artMetaDesc, setArtMetaDesc] = useState('');
  const [artCoverAlt, setArtCoverAlt] = useState('');
  const [artSlugManuallyEdited, setArtSlugManuallyEdited] = useState(false);
  const [artCategory, setArtCategory] = useState('REVIEWS');
  const [artSummary, setArtSummary] = useState('');
  const [artCover, setArtCover] = useState(
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'
  );
  const [artReadTime, setArtReadTime] = useState('5 min read');
  const [artContent, setArtContent] = useState('');
  const [artStatus, setArtStatus] = useState<'published' | 'draft'>('published');
  
  // Author fields in Article Form
  const [artAuthorName, setArtAuthorName] = useState(globalAuthor.name);
  const [artAuthorRole, setArtAuthorRole] = useState(globalAuthor.role);
  const [artAuthorAvatar, setArtAuthorAvatar] = useState(globalAuthor.avatar);
  const [artAuthorBio, setArtAuthorBio] = useState(globalAuthor.bio);

  const [artSuccess, setArtSuccess] = useState<string | null>(null);
  const [showSitemapModal, setShowSitemapModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const articleFileInputRef = useRef<HTMLInputElement>(null);
  const articleAuthorAvatarInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 2. GLOBAL AUTHOR & EDITOR PROFILE TAB
  // ==========================================
  const [editorName, setEditorName] = useState(globalAuthor.name);
  const [editorRole, setEditorRole] = useState(globalAuthor.role);
  const [editorAvatar, setEditorAvatar] = useState(globalAuthor.avatar);
  const [editorBio, setEditorBio] = useState(globalAuthor.bio);
  const [editorInstagram, setEditorInstagram] = useState(globalAuthor.socials?.instagram || 'https://instagram.com');
  const [editorYoutube, setEditorYoutube] = useState(globalAuthor.socials?.youtube || 'https://youtube.com');
  const [editorTwitter, setEditorTwitter] = useState(globalAuthor.socials?.twitter || 'https://twitter.com');
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);
  const editorAvatarFileInputRef = useRef<HTMLInputElement>(null);

  // Keep state synced when globalAuthor prop changes
  useEffect(() => {
    setEditorName(globalAuthor.name);
    setEditorRole(globalAuthor.role);
    setEditorAvatar(globalAuthor.avatar);
    setEditorBio(globalAuthor.bio);
  }, [globalAuthor]);

  // ==========================================
  // 3. CAMERA STATE & FILTERS
  // ==========================================
  const [showCameraForm, setShowCameraForm] = useState(false);
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);
  const [searchCamera, setSearchCamera] = useState('');
  const [filterCameraBrand, setFilterCameraBrand] = useState<string>('ALL');
  const [filterCameraCategory, setFilterCameraCategory] = useState<string>('ALL');
  const [filterCameraStatus, setFilterCameraStatus] = useState<string>('ALL');

  // Camera Form Fields (Grouped)
  const [camName, setCamName] = useState('');
  const [camBrand, setCamBrand] = useState<CameraProduct['brand']>('Fujifilm');
  const [camCategory, setCamCategory] = useState<CategoryType>('Mirrorless');
  const [camImage, setCamImage] = useState(
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'
  );
  const [camAffiliateUrl, setCamAffiliateUrl] = useState('https://fujifilm.com');
  const [camPrice, setCamPrice] = useState<number>(24999000);
  const [camRating, setCamRating] = useState<number>(4.9);
  const [camResolution, setCamResolution] = useState('40.2 MP');
  const [camSensor, setCamSensor] = useState('APS-C X-Trans CMOS 5 HR');
  const [camVideo, setCamVideo] = useState('6.2K/30p & 4K/60p 10-bit');
  const [camIso, setCamIso] = useState('125 - 12800 (Ext. 64-51200)');
  const [camWeight, setCamWeight] = useState('521g');
  const [camShortDesc, setCamShortDesc] = useState('');
  const [camStatus, setCamStatus] = useState<'published' | 'draft'>('published');
  const [camSuccess, setCamSuccess] = useState<string | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 4. SUBSCRIBERS STATE & FILTERS
  // ==========================================
  const [searchSubscriber, setSearchSubscriber] = useState('');
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>(() => {
    try {
      const raw = localStorage.getItem('FujiFinder_subscribers');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((item: any) => {
        if (typeof item === 'string') {
          return { email: item, date: 'Terdaftar' };
        }
        return {
          email: item.email || '',
          date: item.date || 'Terdaftar',
        };
      });
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // ----------------------------------------------------
  // ARTICLE HANDLERS
  // ----------------------------------------------------
  const handleOpenNewArticleForm = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtSlug('');
    setArtSeoTitle('');
    setArtMetaDesc('');
    setArtCoverAlt('');
    setArtSlugManuallyEdited(false);
    setArtCategory('REVIEWS');
    setArtSummary('');
    setArtCover('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80');
    setArtReadTime('5 min read');
    setArtContent('');
    setArtStatus('published');
    // Default to current global author
    setArtAuthorName(globalAuthor.name);
    setArtAuthorRole(globalAuthor.role);
    setArtAuthorAvatar(globalAuthor.avatar);
    setArtAuthorBio(globalAuthor.bio);
    setShowArticleForm(true);
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtSlug(art.slug || generateSlug(art.title));
    setArtSeoTitle(art.seoTitle || '');
    setArtMetaDesc(art.metaDescription || '');
    setArtCoverAlt(art.coverImageAlt || '');
    setArtSlugManuallyEdited(true);
    setArtCategory(art.category);
    setArtSummary(art.summary);
    setArtCover(art.coverImage);
    setArtReadTime(art.readTime);
    setArtContent(art.content.join('\n\n'));
    setArtStatus(art.status || 'published');
    // Set author info from article
    setArtAuthorName(art.author?.name || globalAuthor.name);
    setArtAuthorRole(art.author?.role || globalAuthor.role);
    setArtAuthorAvatar(art.author?.avatar || globalAuthor.avatar);
    setArtAuthorBio(art.author?.bio || globalAuthor.bio);
    setShowArticleForm(true);
  };

  const handleArticleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setArtCover(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArticleAuthorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setArtAuthorAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseGlobalAuthorForArticle = () => {
    setArtAuthorName(globalAuthor.name);
    setArtAuthorRole(globalAuthor.role);
    setArtAuthorAvatar(globalAuthor.avatar);
    setArtAuthorBio(globalAuthor.bio);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) return;

    // If content is rich HTML (contains tables, paragraphs, headings), preserve whole HTML document
    const contentParagraphs = artContent.trim()
      ? (artContent.includes('<table') || artContent.includes('<p') || artContent.includes('<h') || artContent.includes('<ul')
          ? [artContent.trim()]
          : artContent.split('\n\n').filter((p) => p.trim().length > 0))
      : [artSummary, 'Pengujian teknis dan pengamatan mendalam oleh tim editorial FujiFinder.'];

    const articleAuthor: Author = {
      id: `author-${Date.now()}`,
      name: artAuthorName.trim() || globalAuthor.name,
      role: artAuthorRole.trim() || globalAuthor.role,
      avatar: artAuthorAvatar.trim() || globalAuthor.avatar,
      bio: artAuthorBio.trim() || globalAuthor.bio,
      socials: globalAuthor.socials || {
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
      },
    };

    const finalSlug = (artSlug.trim() ? generateSlug(artSlug) : generateSlug(artTitle)) || `artikel-${Date.now()}`;
    const finalSeoTitle = artSeoTitle.trim() || undefined;
    const finalMetaDesc = artMetaDesc.trim() || undefined;
    const finalCoverAlt = artCoverAlt.trim() || undefined;

    if (editingArticleId) {
      const existing = articles.find((a) => a.id === editingArticleId);
      const updated: Article = {
        ...(existing || {}),
        id: editingArticleId,
        title: artTitle,
        slug: finalSlug,
        seoTitle: finalSeoTitle,
        metaDescription: finalMetaDesc,
        coverImageAlt: finalCoverAlt,
        category: artCategory,
        date: existing?.date || new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        dateModified: new Date().toISOString().split('T')[0],
        readTime: artReadTime,
        coverImage: artCover,
        summary: artSummary,
        content: contentParagraphs,
        author: articleAuthor,
        status: artStatus,
        featured: existing?.featured ?? true,
        tags: [artCategory, 'Editorial'],
      };
      onUpdateArticle(updated);
      setArtSuccess('Artikel dan konfigurasi SEO berhasil diperbarui!');
    } else {
      const newArt: Article = {
        id: `art-${Date.now()}`,
        title: artTitle,
        slug: finalSlug,
        seoTitle: finalSeoTitle,
        metaDescription: finalMetaDesc,
        coverImageAlt: finalCoverAlt,
        category: artCategory,
        date: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        dateModified: new Date().toISOString().split('T')[0],
        readTime: artReadTime,
        coverImage: artCover,
        summary: artSummary,
        content: contentParagraphs,
        author: articleAuthor,
        status: artStatus,
        featured: true,
        tags: [artCategory, 'Editorial'],
      };
      onAddArticle(newArt);
      setArtSuccess('Artikel baru berhasil diterbitkan dengan SEO metadata!');
    }

    setTimeout(() => {
      setArtSuccess(null);
      setShowArticleForm(false);
      setEditingArticleId(null);
    }, 900);
  };

  // ----------------------------------------------------
  // GLOBAL AUTHOR & EDITOR PROFILE HANDLERS
  // ----------------------------------------------------
  const handleEditorAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setEditorAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditorProfile = (applyToAll: boolean = false) => {
    const updatedAuthor: Author = {
      id: globalAuthor.id || 'fujifinder-team',
      name: editorName.trim() || 'FujiFinder Editorial Team',
      role: editorRole.trim() || 'Camera Specialists & Photographers',
      avatar: editorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: editorBio.trim() || 'Independent reviews, field benchmarks, and authentic gear discovery for photographers.',
      socials: {
        instagram: editorInstagram,
        youtube: editorYoutube,
        twitter: editorTwitter,
      },
    };

    if (onUpdateGlobalAuthor) {
      onUpdateGlobalAuthor(updatedAuthor, applyToAll);
    }

    setEditorSuccess(
      applyToAll
        ? 'Profil Editor berhasil disimpan & diterapkan ke SEMUA artikel di database!'
        : 'Profil Editor default berhasil disimpan!'
    );

    setTimeout(() => {
      setEditorSuccess(null);
    }, 2500);
  };

  // ----------------------------------------------------
  // CAMERA HANDLERS
  // ----------------------------------------------------
  const handleOpenNewCameraForm = () => {
    setEditingCameraId(null);
    setCamName('');
    setCamBrand('Fujifilm');
    setCamCategory('Mirrorless');
    setCamPrice(24999000);
    setCamRating(4.9);
    setCamResolution('40.2 MP');
    setCamSensor('APS-C X-Trans CMOS 5 HR');
    setCamVideo('6.2K/30p & 4K/60p 10-bit');
    setCamIso('125 - 12800 (Ext. 64-51200)');
    setCamWeight('521g');
    setCamImage('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80');
    setCamAffiliateUrl('https://fujifilm.com');
    setCamShortDesc('');
    setCamStatus('published');
    setShowCameraForm(true);
  };

  const handleEditCamera = (cam: CameraProduct) => {
    setEditingCameraId(cam.id);
    setCamName(cam.name);
    setCamBrand(cam.brand);
    setCamCategory(cam.category);
    setCamPrice(cam.price);
    setCamRating(cam.rating);
    setCamResolution(cam.specs.resolution || '24.2 MP');
    setCamSensor(cam.specs.sensor || 'CMOS Sensor');
    setCamVideo(cam.specs.video || '4K/60p');
    setCamIso(cam.specs.isoRange || '100-51200');
    setCamWeight(cam.specs.weight || '500g');
    setCamImage(cam.image);
    setCamAffiliateUrl(cam.affiliateUrl || 'https://fujifilm.com');
    setCamShortDesc(cam.shortDesc);
    setCamStatus(cam.status || 'published');
    setShowCameraForm(true);
  };

  const handleCameraImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCamImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!camName.trim()) return;

    if (editingCameraId) {
      const existing = cameras.find((c) => c.id === editingCameraId);
      const updated: CameraProduct = {
        ...(existing || {}),
        id: editingCameraId,
        name: camName,
        brand: camBrand,
        category: camCategory,
        price: Number(camPrice),
        rating: Number(camRating),
        reviewCount: existing?.reviewCount || 1,
        image: camImage,
        shortDesc: camShortDesc || `${camBrand} ${camCategory} camera with pro sensor and optics.`,
        affiliateUrl: camAffiliateUrl || 'https://fujifilm.com',
        status: camStatus,
        specs: {
          sensor: camSensor,
          resolution: camResolution,
          isoRange: camIso,
          autofocus: existing?.specs?.autofocus || 'Hybrid Phase Detect AF',
          video: camVideo,
          burstRate: existing?.specs?.burstRate || '15 fps',
          weight: camWeight,
          batteryLife: existing?.specs?.batteryLife || '500 shots',
        },
        pros: existing?.pros || ['Kualitas sensor sangat tajam', 'Ergonomi kontrol klasik'],
        cons: existing?.cons || ['Ketersediaan unit terbatas'],
        verdict: existing?.verdict || 'Pilihan utama fotografer dan videografer profesional.',
      };
      onUpdateCamera(updated);
      setCamSuccess('Kamera berhasil diperbarui!');
    } else {
      const newCam: CameraProduct = {
        id: `cam-${Date.now()}`,
        name: camName,
        brand: camBrand,
        category: camCategory,
        price: Number(camPrice),
        rating: Number(camRating),
        reviewCount: 1,
        image: camImage,
        shortDesc: camShortDesc || `${camBrand} ${camCategory} camera with pro sensor and optics.`,
        affiliateUrl: camAffiliateUrl || 'https://fujifilm.com',
        status: camStatus,
        specs: {
          sensor: camSensor,
          resolution: camResolution,
          isoRange: camIso,
          autofocus: 'Hybrid Phase Detect AF',
          video: camVideo,
          burstRate: '15 fps',
          weight: camWeight,
          batteryLife: '500 shots',
        },
        pros: ['Ergonomi fisik mantap', 'Dynamic range memukau'],
        cons: ['Buffer continuous standar'],
        verdict: 'Kamera tangguh yang dirancang untuk kebutuhan visual storytelling modern.',
      };
      onAddCamera(newCam);
      setCamSuccess('Kamera baru berhasil ditambahkan!');
    }

    setTimeout(() => {
      setCamSuccess(null);
      setShowCameraForm(false);
      setEditingCameraId(null);
    }, 900);
  };

  // ----------------------------------------------------
  // SUBSCRIBERS HANDLERS & EXPORT CSV
  // ----------------------------------------------------
  const handleDeleteSubscriber = (email: string) => {
    const updated = subscribers.filter((s) => s.email !== email);
    setSubscribers(updated);
    localStorage.setItem('FujiFinder_subscribers', JSON.stringify(updated));
  };

  const handleClearAllSubscribers = () => {
    if (window.confirm('Hapus semua daftar subscriber newsletter?')) {
      localStorage.removeItem('FujiFinder_subscribers');
      setSubscribers([]);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('Tidak ada data subscriber untuk diexport.');
      return;
    }
    const headers = ['Email,Tanggal Subscribe,Status\n'];
    const rows = subscribers.map((s) => `"${s.email}","${s.date}","Aktif"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fujifinder_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // FILTERED LISTS
  // ----------------------------------------------------
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchArticle.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchArticle.toLowerCase()) ||
      (art.author?.name || '').toLowerCase().includes(searchArticle.toLowerCase());
    const matchCat = filterArticleCategory === 'ALL' || art.category === filterArticleCategory;
    const matchStatus =
      filterArticleStatus === 'ALL' ||
      (filterArticleStatus === 'published' ? art.status !== 'draft' : art.status === 'draft');
    return matchSearch && matchCat && matchStatus;
  });

  const filteredCameras = cameras.filter((cam) => {
    const matchSearch =
      cam.name.toLowerCase().includes(searchCamera.toLowerCase()) ||
      cam.brand.toLowerCase().includes(searchCamera.toLowerCase()) ||
      cam.shortDesc.toLowerCase().includes(searchCamera.toLowerCase());
    const matchBrand = filterCameraBrand === 'ALL' || cam.brand === filterCameraBrand;
    const matchCat = filterCameraCategory === 'ALL' || cam.category === filterCameraCategory;
    const matchStatus =
      filterCameraStatus === 'ALL' ||
      (filterCameraStatus === 'published' ? cam.status !== 'draft' : cam.status === 'draft');
    return matchSearch && matchBrand && matchCat && matchStatus;
  });

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchSubscriber.toLowerCase())
  );

  return (
    <div
      id="admin-cms-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="admin-cms-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl my-auto text-neutral-900 border border-neutral-200 flex flex-col max-h-[90vh]"
      >
        {/* ========================================================================= */}
        {/* PASSWORD LOCK SCREEN (IF NOT AUTHENTICATED) */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex flex-col">
            {/* Header Lock */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-900 text-white">
              <div className="flex items-center gap-3">
                <FujiFinderLogo variant="light" size="sm" showTagline={false} />
                <span className="text-neutral-500 font-normal">|</span>
                <div>
                  <h2 className="text-sm font-bold leading-tight text-neutral-200">Editorial CMS</h2>
                  <p className="text-[11px] text-neutral-400">Autentikasi Akses Administrator</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Login Box */}
            <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
              <div className="mb-5">
                <FujiFinderLogo variant="dark" size="lg" layout="stacked" showTagline={true} />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-neutral-900 mb-2">
                Masukkan Kata Sandi CMS
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-6">
                Akses CMS diamankan dengan proteksi sandi untuk mengelola artikel, profil editor, katalog kamera, dan subscribers.
              </p>

              {authError && (
                <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-left animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={enteredPassword}
                    onChange={(e) => {
                      setEnteredPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="w-full text-xs sm:text-sm px-4 py-3 pr-10 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Akses CMS</span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-neutral-200 w-full flex items-center justify-between text-[11px] text-neutral-500">
                <span>Password default: <strong className="text-neutral-800 font-mono">admin</strong></span>
                <span className="text-neutral-400">FujiFinder System</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED CMS DASHBOARD */
          /* ========================================================================= */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <FujiFinderLogo variant="light" size="sm" showTagline={false} />
                <span className="text-neutral-500 font-normal">|</span>
                <div>
                  <h2 className="text-sm font-bold leading-tight flex items-center gap-2">
                    <span className="text-neutral-100">Editorial CMS Studio</span>
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Terproteksi
                    </span>
                  </h2>
                  <p className="text-[11px] text-neutral-400">Manajemen konten artikel, editor, katalog kamera & subscribers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  title="Ganti Password CMS"
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 px-3"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ganti Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Kunci / Logout dari CMS"
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 px-3"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kunci</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Change Password Bar (If toggled) */}
            {showChangePassword && (
              <form
                onSubmit={handleChangePassword}
                className="bg-neutral-800 text-white px-6 py-3 border-b border-neutral-700 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="font-semibold text-neutral-200">Setel Kata Sandi Baru CMS:</span>
                </div>

                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <input
                    type="text"
                    required
                    placeholder="Ketik password baru..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-600 text-white text-xs focus:outline-none focus:border-white w-48"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-white text-neutral-950 font-bold hover:bg-neutral-200 cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="px-2 py-1.5 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {changePassSuccess && (
                  <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Kata sandi berhasil diganti!
                  </span>
                )}
              </form>
            )}

            {/* Global Action Bar */}
            <div className="bg-neutral-100 px-6 py-2.5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <span className="font-semibold text-neutral-600 flex items-center gap-2">
                <span>Database: {articles.length} Artikel, {cameras.length} Kamera, {subscribers.length} Subscribers</span>
                <span className="text-neutral-400">•</span>
                <span className="flex items-center gap-1 text-neutral-700">
                  <img
                    src={globalAuthor.avatar}
                    alt={globalAuthor.name}
                    className="w-4 h-4 rounded-full object-cover inline-block border border-neutral-300"
                  />
                  <strong className="font-bold">{globalAuthor.name}</strong>
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoadPresetData}
                  title="Muat data starter resmi Fujifilm (X-T5, X100VI, X-H2S)"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-medium cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Muat Data Starter Fujifilm</span>
                </button>

                {(articles.length > 0 || cameras.length > 0) && (
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus semua artikel dan kamera dari database?')) {
                        onClearAllData();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-medium cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-200 px-6 bg-neutral-50 shrink-0 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('articles');
                  setShowArticleForm(false);
                }}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'articles'
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Artikel & Jurnal ({articles.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('cameras');
                  setShowCameraForm(false);
                }}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'cameras'
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Katalog Kamera ({cameras.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('authors')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'authors'
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Profil Editor / Redaksi</span>
              </button>

              <button
                onClick={() => setActiveTab('subscribers')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'subscribers'
                    ? 'border-neutral-950 text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Subscribers ({subscribers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-emerald-700'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Supabase Database</span>
                <span className={`w-2 h-2 rounded-full ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : supabaseStatus === 'testing' ? 'bg-amber-500 animate-ping' : 'bg-neutral-400'
                }`} />
              </button>

              <button
                onClick={() => setActiveTab('sitemap')}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'sitemap'
                    ? 'border-neutral-950 text-neutral-950 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-950'
                }`}
              >
                <Globe className="w-4 h-4 text-neutral-800" />
                <span>XML Sitemap & SEO</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 text-neutral-800 rounded-full font-bold">
                  {articles.filter((a) => a.status !== 'draft').length + 5} URLs
                </span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
              {/* ========================================================================= */}
              {/* TAB 1: ARTIKEL & JURNAL */}
              {/* ========================================================================= */}
              {activeTab === 'articles' && (
                <div className="space-y-5">
                  {/* Form Tambah / Edit Artikel */}
                  {showArticleForm ? (
                    <form
                      onSubmit={handleSaveArticle}
                      className="p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-5 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                            {editingArticleId ? 'Edit Artikel' : 'Buat Artikel Baru'}
                          </h3>
                          <p className="text-xs text-neutral-500">Lengkapi informasi konten editorial Anda</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowArticleForm(false);
                            setEditingArticleId(null);
                          }}
                          className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>

                      {artSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{artSuccess}</span>
                        </div>
                      )}

                      {/* Section 1: Info Judul & Kategori */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Judul Artikel</label>
                          <input
                            type="text"
                            required
                            value={artTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setArtTitle(val);
                              if (!artSlugManuallyEdited) {
                                setArtSlug(generateSlug(val));
                              }
                            }}
                            placeholder="Contoh: Fujifilm X-T5 Field Test & Review Lengkap"
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Kategori</label>
                          <select
                            value={artCategory}
                            onChange={(e) => setArtCategory(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="REVIEWS">REVIEWS</option>
                            <option value="GUIDES">GUIDES</option>
                            <option value="COMPARISONS">COMPARISONS</option>
                            <option value="VLOGGING">VLOGGING</option>
                            <option value="LENSES">LENSES</option>
                          </select>
                        </div>
                      </div>

                      {/* Section 2: Upload Cover Image & Alt Text */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Cover Image & Image SEO</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {artCover && (
                            <img
                              src={artCover}
                              alt={artCoverAlt || 'Preview Cover'}
                              className="w-20 h-14 object-cover rounded-xl border border-neutral-200 shrink-0 bg-neutral-100"
                            />
                          )}
                          <div className="flex-grow w-full space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={artCover}
                                onChange={(e) => setArtCover(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                              />
                              <button
                                type="button"
                                onClick={() => articleFileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 shrink-0 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload</span>
                              </button>
                              <input
                                type="file"
                                ref={articleFileInputRef}
                                onChange={handleArticleImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={artCoverAlt}
                                onChange={(e) => setArtCoverAlt(e.target.value)}
                                placeholder="Alt Text Gambar (Penting untuk Google Image SEO, cth: Fujifilm X-T5 Mirrorless)"
                                className="w-full text-[11px] p-2 rounded-xl border border-neutral-200 bg-neutral-100/60 focus:outline-none focus:border-neutral-950 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Summary & Waktu Baca */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3">
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Ringkasan / Sinopsis</label>
                          <textarea
                            rows={2}
                            required
                            value={artSummary}
                            onChange={(e) => setArtSummary(e.target.value)}
                            placeholder="Ringkasan singkat ulasan atau esai fotografi..."
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Waktu Baca</label>
                          <input
                            type="text"
                            value={artReadTime}
                            onChange={(e) => setArtReadTime(e.target.value)}
                            placeholder="5 min read"
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>
                      </div>

                      {/* Section 3.5: TECHNICAL SEO & GOOGLE PREVIEW */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                              <Globe className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                                Optimasi SEO & URL Publik
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                Pastikan artikel mudah di-index Google Search dan terstruktur rapi
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            SEO Ready
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* SEO Title */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-neutral-700">
                                SEO Title Tag
                              </label>
                              <span className={`text-[10px] font-mono ${artSeoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                                {artSeoTitle.length || artTitle.length}/60 karakter
                              </span>
                            </div>
                            <input
                              type="text"
                              value={artSeoTitle}
                              onChange={(e) => setArtSeoTitle(e.target.value)}
                              placeholder={artTitle || 'Fallback ke Judul Artikel...'}
                              className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                            <p className="text-[10px] text-neutral-400 mt-1">
                              Kosongkan jika ingin menggunakan judul artikel asli
                            </p>
                          </div>

                          {/* URL Slug */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-neutral-700">
                                URL Slug Artikel
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const s = generateSlug(artTitle);
                                  setArtSlug(s);
                                  setArtSlugManuallyEdited(false);
                                }}
                                className="text-[10px] text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
                              >
                                Auto-generate
                              </button>
                            </div>
                            <div className="flex items-center rounded-xl border border-neutral-300 bg-neutral-50 overflow-hidden focus-within:border-neutral-950">
                              <span className="text-[11px] text-neutral-500 px-2.5 font-mono bg-neutral-100 py-2 border-r border-neutral-200 select-none">
                                /artikel/
                              </span>
                              <input
                                type="text"
                                value={artSlug}
                                onChange={(e) => {
                                  setArtSlug(generateSlug(e.target.value));
                                  setArtSlugManuallyEdited(true);
                                }}
                                placeholder={generateSlug(artTitle) || 'slug-artikel'}
                                className="w-full text-xs p-2 bg-transparent focus:outline-none font-mono text-neutral-800"
                              />
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-1">
                              URL publik: https://fujifinder.app/artikel/{artSlug || generateSlug(artTitle) || 'judul'}
                            </p>
                          </div>
                        </div>

                        {/* Meta Description */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-neutral-700">
                              Meta Description (Snippet Google)
                            </label>
                            <span className={`text-[10px] font-mono ${artMetaDesc.length > 160 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                              {artMetaDesc.length || artSummary.length}/160 karakter
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={artMetaDesc}
                            onChange={(e) => setArtMetaDesc(e.target.value)}
                            placeholder={artSummary || 'Fallback otomatis menggunakan Ringkasan / Sinopsis di atas...'}
                            className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>

                        {/* Visual Google Search Result Preview */}
                        <div className="pt-3 border-t border-neutral-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                            Google Search Result Snippet Preview
                          </span>
                          <div className="p-3.5 rounded-xl bg-white border border-neutral-200 font-sans shadow-2xs">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#202124] mb-0.5">
                              <span className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[9px] font-bold">
                                F
                              </span>
                              <span className="font-medium">FujiFinder</span>
                              <span className="text-neutral-400">https://fujifinder.app › artikel › {artSlug || generateSlug(artTitle) || 'ulasan'}</span>
                            </div>
                            <h5 className="text-[#1a0dab] text-sm sm:text-base font-medium hover:underline cursor-pointer leading-snug line-clamp-1">
                              {artSeoTitle || artTitle || 'Judul Artikel Kamera & Fotografi'} - FujiFinder
                            </h5>
                            <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2 mt-0.5">
                              {artMetaDesc || artSummary || 'Ulasan mendalam, spesifikasi sensor, dynamic range, dan panduan fotografi dari editorial FujiFinder.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Editor / Penulis Artikel (Image Avatar & Nama) */}
                      <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-neutral-700" />
                            Penulis & Editor Artikel Ini
                          </span>
                          <button
                            type="button"
                            onClick={handleUseGlobalAuthorForArticle}
                            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Gunakan Profil Redaksi Default
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                          {/* Avatar preview */}
                          {artAuthorAvatar ? (
                            <img
                              src={artAuthorAvatar}
                              alt="Avatar Editor"
                              className="w-14 h-14 rounded-full object-cover border-2 border-neutral-300 shrink-0 bg-neutral-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center shrink-0 text-neutral-400">
                              <UserCheck className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex-grow w-full space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-neutral-600 block mb-0.5">Nama Editor / Penulis</label>
                                <input
                                  type="text"
                                  required
                                  value={artAuthorName}
                                  onChange={(e) => setArtAuthorName(e.target.value)}
                                  placeholder="Contoh: FujiFinder Editorial Team"
                                  className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-neutral-600 block mb-0.5">Jabatan / Role</label>
                                <input
                                  type="text"
                                  value={artAuthorRole}
                                  onChange={(e) => setArtAuthorRole(e.target.value)}
                                  placeholder="Contoh: Camera Specialists & Photographers"
                                  className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={artAuthorAvatar}
                                onChange={(e) => setArtAuthorAvatar(e.target.value)}
                                placeholder="URL foto avatar editor..."
                                className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                              />
                              <button
                                type="button"
                                onClick={() => articleAuthorAvatarInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-neutral-800 shrink-0 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Foto</span>
                              </button>
                              <input
                                type="file"
                                ref={articleAuthorAvatarInputRef}
                                onChange={handleArticleAuthorAvatarUpload}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Isi Paragraf Konten dengan Rich Editor & Word Parser */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Konten Lengkap Artikel (Mendukung Copy-Paste dari Word & Docs)
                          </label>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Tabel, Heading, & Paragraf tetap rapi
                          </span>
                        </div>
                        <ArticleRichEditor
                          value={artContent}
                          onChange={setArtContent}
                          placeholder="Salin teks dari Microsoft Word / Google Docs lalu langsung Paste (Ctrl+V) di sini..."
                        />
                      </div>

                      {/* Section 6: Status & Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200 items-center">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Status Publikasi</label>
                          <select
                            value={artStatus}
                            onChange={(e) => setArtStatus(e.target.value as 'published' | 'draft')}
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="published">Published (Tampil di Website)</option>
                            <option value="draft">Draft (Hanya di CMS)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewArticle({
                                id: editingArticleId || 'preview',
                                title: artTitle || 'Judul Contoh Artikel',
                                slug: 'preview',
                                category: artCategory,
                                date: 'Hari ini',
                                readTime: artReadTime,
                                coverImage: artCover,
                                summary: artSummary || 'Ringkasan artikel akan tampil di sini...',
                                content: artContent
                                  ? artContent.split('\n\n')
                                  : ['Ini adalah contoh isi artikel editorial preview.'],
                                author: {
                                  id: 'author-preview',
                                  name: artAuthorName || globalAuthor.name,
                                  role: artAuthorRole || globalAuthor.role,
                                  avatar: artAuthorAvatar || globalAuthor.avatar,
                                  bio: artAuthorBio || globalAuthor.bio,
                                  socials: globalAuthor.socials || {},
                                },
                                tags: [artCategory],
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{editingArticleId ? 'Perbarui Artikel' : 'Simpan & Publikasikan'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Technical SEO & Sitemap Status Bar */}
                      <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                            <Globe className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold">
                                Technical SEO & XML Sitemap Engine
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Realtime Sync
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400">
                              {articles.filter((a) => a.status !== 'draft').length} artikel terdaftar otomatis untuk crawling Google & indexation
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setShowSitemapModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>Lihat XML Sitemap</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadSitemap(articles)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh sitemap.xml</span>
                          </button>
                        </div>
                      </div>

                      {/* Toolbar Artikel */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2 flex-grow">
                          {/* Search */}
                          <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Cari judul atau slug..."
                              value={searchArticle}
                              onChange={(e) => setSearchArticle(e.target.value)}
                              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          {/* Filter Kategori */}
                          <select
                            value={filterArticleCategory}
                            onChange={(e) => setFilterArticleCategory(e.target.value)}
                            className="text-xs py-2 px-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="ALL">Semua Kategori</option>
                            <option value="REVIEWS">Reviews</option>
                            <option value="GUIDES">Guides</option>
                            <option value="COMPARISONS">Comparisons</option>
                            <option value="VLOGGING">Vlogging</option>
                            <option value="LENSES">LENSES</option>
                          </select>

                          {/* Filter Status */}
                          <select
                            value={filterArticleStatus}
                            onChange={(e) => setFilterArticleStatus(e.target.value)}
                            className="text-xs py-2 px-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="ALL">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        <button
                          onClick={handleOpenNewArticleForm}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer shrink-0 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Artikel</span>
                        </button>
                      </div>

                      {/* Tabel Manajemen Artikel */}
                      {filteredArticles.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                          <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                            Tidak ada artikel yang cocok dengan filter atau pencarian Anda.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Cover</th>
                                <th className="py-3 px-4">Judul & URL Slug</th>
                                <th className="py-3 px-4 hidden md:table-cell">Editor</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">SEO Health</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {filteredArticles.map((art) => {
                                const isDraft = art.status === 'draft';
                                const author = art.author || globalAuthor;
                                const isSeoReady = checkSEOReadiness(art);
                                const articleSlug = art.slug || generateSlug(art.title);

                                return (
                                  <tr key={art.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="py-3 px-4">
                                      <img
                                        src={art.coverImage}
                                        alt={art.coverImageAlt || art.title}
                                        className="w-12 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                                      />
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-[10px] text-neutral-500 tracking-wider">
                                          {art.category}
                                        </span>
                                        <span className="text-[10px] text-neutral-400">• {art.date}</span>
                                      </div>
                                      <h4 className="font-bold text-neutral-900 line-clamp-1 max-w-md">{art.title}</h4>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] text-neutral-400 font-mono">
                                          /artikel/{articleSlug}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const url = `${window.location.origin}/artikel/${articleSlug}`;
                                            navigator.clipboard?.writeText(url);
                                            setCopiedSlug(art.id);
                                            setTimeout(() => setCopiedSlug(null), 2000);
                                          }}
                                          title="Salin URL Publik"
                                          className="text-neutral-400 hover:text-neutral-900 p-0.5 cursor-pointer"
                                        >
                                          {copiedSlug === art.id ? (
                                            <Check className="w-3 h-3 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-neutral-600 hidden md:table-cell">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={author.avatar}
                                          alt={author.name}
                                          className="w-6 h-6 rounded-full object-cover border border-neutral-200"
                                        />
                                        <div>
                                          <p className="font-semibold text-neutral-900 leading-tight line-clamp-1">{author.name}</p>
                                          <p className="text-[10px] text-neutral-400 leading-tight">{author.role}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      {isDraft ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                          Draft
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          Published
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      {isSeoReady ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                          <span>SEO Ready</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                          <AlertCircle className="w-3 h-3 text-amber-500" />
                                          <span>Lengkapi SEO</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="inline-flex items-center gap-1">
                                        {onViewPublicArticle && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              onClose();
                                              onViewPublicArticle(art);
                                            }}
                                            title="Buka Halaman Artikel Publik"
                                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span className="hidden lg:inline text-[10px] font-semibold">Publik</span>
                                          </button>
                                        )}
                                        <button
                                          onClick={() => setPreviewArticle(art)}
                                          title="Preview Cepat"
                                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleEditArticle(art)}
                                          title="Edit Konten & SEO"
                                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`Hapus artikel "${art.title}"?`)) {
                                              onDeleteArticle(art.id);
                                            }
                                          }}
                                          title="Hapus Artikel"
                                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: KATALOG KAMERA */}
              {/* ========================================================================= */}
              {activeTab === 'cameras' && (
                <div className="space-y-5">
                  {/* Form Tambah / Edit Kamera (Grouped) */}
                  {showCameraForm ? (
                    <form
                      onSubmit={handleSaveCamera}
                      className="p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-6 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                            {editingCameraId ? 'Edit Data Kamera' : 'Tambah Kamera ke Database'}
                          </h3>
                          <p className="text-xs text-neutral-500">Lengkapi spesifikasi teknis dan rincian produk</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCameraForm(false);
                            setEditingCameraId(null);
                          }}
                          className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>

                      {camSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{camSuccess}</span>
                        </div>
                      )}

                      {/* GROUP 1: INFORMASI KAMERA */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          1. Informasi Kamera
                        </span>

                        {/* Foto Kamera */}
                        <div className="p-3 rounded-xl bg-white border border-neutral-200 space-y-2">
                          <label className="text-xs font-bold text-neutral-700 block">Foto Kamera</label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {camImage && (
                              <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-white p-1 shrink-0 flex items-center justify-center">
                                <img
                                  src={camImage}
                                  alt="Camera Preview"
                                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                                />
                              </div>
                            )}
                            <div className="flex-grow w-full space-y-1.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={camImage}
                                  onChange={(e) => setCamImage(e.target.value)}
                                  placeholder="URL foto kamera..."
                                  className="w-full text-xs p-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                                />
                                <button
                                  type="button"
                                  onClick={() => cameraFileInputRef.current?.click()}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 shrink-0 cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload</span>
                                </button>
                                <input
                                  type="file"
                                  ref={cameraFileInputRef}
                                  onChange={handleCameraImageUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Nama Kamera</label>
                            <input
                              type="text"
                              required
                              value={camName}
                              onChange={(e) => setCamName(e.target.value)}
                              placeholder="Contoh: Fujifilm X100VI"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Brand</label>
                            <select
                              value={camBrand}
                              onChange={(e) => setCamBrand(e.target.value as any)}
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            >
                              <option value="Fujifilm">Fujifilm</option>
                              <option value="Sony">Sony</option>
                              <option value="Canon">Canon</option>
                              <option value="Nikon">Nikon</option>
                              <option value="Leica">Leica</option>
                              <option value="GoPro">GoPro</option>
                              <option value="Panasonic">Panasonic</option>
                              <option value="DJI">DJI</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Tipe Kategori</label>
                            <select
                              value={camCategory}
                              onChange={(e) => setCamCategory(e.target.value as any)}
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            >
                              <option value="Mirrorless">Mirrorless</option>
                              <option value="DSLR">DSLR</option>
                              <option value="Compact">Compact</option>
                              <option value="Action Camera">Action Camera</option>
                              <option value="Vlogging">Vlogging</option>
                              <option value="Accessories">Accessories</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">URL Produk / Toko Resmi</label>
                          <input
                            type="text"
                            value={camAffiliateUrl}
                            onChange={(e) => setCamAffiliateUrl(e.target.value)}
                            placeholder="https://fujifilm.com / https://tokopedia.com/..."
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>
                      </div>

                      {/* GROUP 2: HARGA & RATING */}
                      <div className="space-y-3 pt-2 border-t border-neutral-200">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                          2. Harga & Rating
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Harga Retail Resmi (Rp)</label>
                            <input
                              type="number"
                              step="100000"
                              required
                              value={camPrice}
                              onChange={(e) => setCamPrice(Number(e.target.value))}
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                            <span className="text-[11px] text-neutral-500 mt-1 block">
                              Format: {formatIDR(camPrice)}
                            </span>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Rating Skor (1.0 - 5.0)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={camRating}
                              onChange={(e) => setCamRating(Number(e.target.value))}
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>
                        </div>
                      </div>

                      {/* GROUP 3: SPESIFIKASI TAMBAHAN */}
                      <div className="space-y-3 pt-2 border-t border-neutral-200">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                          3. Spesifikasi Teknis
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Megapixel / Resolusi</label>
                            <input
                              type="text"
                              value={camResolution}
                              onChange={(e) => setCamResolution(e.target.value)}
                              placeholder="40.2 MP"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Tipe Sensor</label>
                            <input
                              type="text"
                              value={camSensor}
                              onChange={(e) => setCamSensor(e.target.value)}
                              placeholder="APS-C X-Trans CMOS 5 HR"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Kemampuan Video</label>
                            <input
                              type="text"
                              value={camVideo}
                              onChange={(e) => setCamVideo(e.target.value)}
                              placeholder="6.2K/30p & 4K/60p 10-bit"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Rentang ISO</label>
                            <input
                              type="text"
                              value={camIso}
                              onChange={(e) => setCamIso(e.target.value)}
                              placeholder="125-12800 (Ext. 64-51200)"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Berat Body</label>
                            <input
                              type="text"
                              value={camWeight}
                              onChange={(e) => setCamWeight(e.target.value)}
                              placeholder="521g (termasuk baterai)"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>
                        </div>
                      </div>

                      {/* GROUP 4: DESKRIPSI */}
                      <div className="space-y-3 pt-2 border-t border-neutral-200">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                          4. Deskripsi
                        </span>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Deskripsi Singkat</label>
                          <textarea
                            rows={2}
                            value={camShortDesc}
                            onChange={(e) => setCamShortDesc(e.target.value)}
                            placeholder="Contoh: Kamera flagship dengan sensor 40.2MP, 6-stop IBIS, dan 20 mode Film Simulation Fujifilm."
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>
                      </div>

                      {/* GROUP 5: STATUS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-200 items-center">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Status Kamera</label>
                          <select
                            value={camStatus}
                            onChange={(e) => setCamStatus(e.target.value as 'published' | 'draft')}
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="published">Published (Tampil di Katalog & Rekomendasi)</option>
                            <option value="draft">Draft (Hanya tersimpan di CMS)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCameraForm(false);
                              setEditingCameraId(null);
                            }}
                            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 cursor-pointer transition-colors"
                          >
                            Batal
                          </button>

                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{editingCameraId ? 'Perbarui Kamera' : 'Simpan Kamera'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Toolbar Kamera */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2 flex-grow">
                          {/* Search */}
                          <div className="relative flex-grow sm:flex-grow-0 sm:w-52">
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Cari kamera..."
                              value={searchCamera}
                              onChange={(e) => setSearchCamera(e.target.value)}
                              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>

                          {/* Filter Brand */}
                          <select
                            value={filterCameraBrand}
                            onChange={(e) => setFilterCameraBrand(e.target.value)}
                            className="text-xs py-2 px-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="ALL">Semua Brand</option>
                            <option value="Fujifilm">Fujifilm</option>
                            <option value="Sony">Sony</option>
                            <option value="Canon">Canon</option>
                            <option value="Nikon">Nikon</option>
                            <option value="Leica">Leica</option>
                            <option value="GoPro">GoPro</option>
                            <option value="Panasonic">Panasonic</option>
                            <option value="DJI">DJI</option>
                          </select>

                          {/* Filter Kategori */}
                          <select
                            value={filterCameraCategory}
                            onChange={(e) => setFilterCameraCategory(e.target.value)}
                            className="text-xs py-2 px-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="ALL">Semua Kategori</option>
                            <option value="Mirrorless">Mirrorless</option>
                            <option value="DSLR">DSLR</option>
                            <option value="Compact">Compact</option>
                            <option value="Action Camera">Action Camera</option>
                            <option value="Vlogging">Vlogging</option>
                            <option value="Accessories">Accessories</option>
                          </select>

                          {/* Filter Status */}
                          <select
                            value={filterCameraStatus}
                            onChange={(e) => setFilterCameraStatus(e.target.value)}
                            className="text-xs py-2 px-3 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          >
                            <option value="ALL">Semua Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        <button
                          onClick={handleOpenNewCameraForm}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer shrink-0 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Kamera</span>
                        </button>
                      </div>

                      {/* Tabel Manajemen Kamera */}
                      {filteredCameras.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                          <Camera className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                            Tidak ada data kamera yang cocok. Klik "Tambah Kamera" atau "Muat Data Starter Fujifilm".
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Foto</th>
                                <th className="py-3 px-4">Nama & Brand</th>
                                <th className="py-3 px-4">Kategori</th>
                                <th className="py-3 px-4">Harga Resmi</th>
                                <th className="py-3 px-4 hidden md:table-cell">Spesifikasi</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {filteredCameras.map((cam) => {
                                const isDraft = cam.status === 'draft';
                                return (
                                  <tr key={cam.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-white p-1 flex items-center justify-center">
                                        <img
                                          src={cam.image}
                                          alt={cam.name}
                                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                                        />
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 mb-0.5">
                                        {cam.brand}
                                      </span>
                                      <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">{cam.name}</h4>
                                      <span className="text-[11px] text-neutral-500">★ {cam.rating}</span>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-neutral-700">{cam.category}</td>
                                    <td className="py-3 px-4 font-bold text-neutral-900">{formatIDR(cam.price)}</td>
                                    <td className="py-3 px-4 text-neutral-500 hidden md:table-cell">
                                      <span className="block">{cam.specs.resolution} • {cam.specs.sensor}</span>
                                      <span className="text-[10px] text-neutral-400">{cam.specs.video}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      {isDraft ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                          Draft
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          Published
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          onClick={() => handleEditCamera(cam)}
                                          title="Edit Kamera"
                                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`Hapus kamera "${cam.name}"?`)) {
                                              onDeleteCamera(cam.id);
                                            }
                                          }}
                                          title="Hapus Kamera"
                                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: PROFIL EDITOR & REDAKSI */}
              {/* ========================================================================= */}
              {activeTab === 'authors' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-neutral-800" />
                          <span>Pengaturan Identitas Editor & Redaksi</span>
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Ubah foto avatar, nama tim/penulis, dan peranan yang tampil di setiap artikel ulasan & berita.
                        </p>
                      </div>
                    </div>

                    {editorSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
                        <span>{editorSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Form Profile Inputs (Left 2 cols) */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Avatar Image Upload & URL */}
                        <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3">
                          <label className="text-xs font-bold text-neutral-700 block">
                            Foto Avatar Editor
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {editorAvatar ? (
                              <img
                                src={editorAvatar}
                                alt="Avatar Preview"
                                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-900 shadow-sm shrink-0 bg-neutral-100"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center shrink-0 text-neutral-400">
                                <UserCheck className="w-7 h-7" />
                              </div>
                            )}

                            <div className="flex-grow w-full space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editorAvatar}
                                  onChange={(e) => setEditorAvatar(e.target.value)}
                                  placeholder="URL foto avatar (https://...)"
                                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                                />
                                <button
                                  type="button"
                                  onClick={() => editorAvatarFileInputRef.current?.click()}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 shrink-0 cursor-pointer shadow-sm transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload</span>
                                </button>
                                <input
                                  type="file"
                                  ref={editorAvatarFileInputRef}
                                  onChange={handleEditorAvatarUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                              </div>
                              <p className="text-[11px] text-neutral-500">
                                Format didukung: JPG, PNG, WEBP. Anda dapat mengunggah file langsung dari perangkat atau menempelkan URL gambar.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Nama Editor & Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">
                              Nama Editor / Redaksi
                            </label>
                            <input
                              type="text"
                              required
                              value={editorName}
                              onChange={(e) => setEditorName(e.target.value)}
                              placeholder="Contoh: FujiFinder Editorial Team"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">
                              Jabatan / Sub-title
                            </label>
                            <input
                              type="text"
                              value={editorRole}
                              onChange={(e) => setEditorRole(e.target.value)}
                              placeholder="Contoh: Camera Specialists & Photographers"
                              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                            />
                          </div>
                        </div>

                        {/* Bio Singkat */}
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">
                            Bio Singkat Editorial
                          </label>
                          <textarea
                            rows={3}
                            value={editorBio}
                            onChange={(e) => setEditorBio(e.target.value)}
                            placeholder="Deskripsi singkat mengenai kepakaran atau visi fotografi redaksi..."
                            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSaveEditorProfile(false)}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-950 text-white hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Simpan Profil Default</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Perbarui nama & avatar editor di SEMUA (${articles.length}) artikel yang ada sekarang?`
                                )
                              ) {
                                handleSaveEditorProfile(true);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Terapkan ke Semua {articles.length} Artikel</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Card Preview (Right col) */}
                      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block pb-2 border-b border-neutral-100">
                          Live Tampilan di Artikel
                        </span>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                            Fujifilm Merevolusi Color Science Digital
                          </h4>

                          {/* Byline Author Block (Exactly matching article detail design) */}
                          <div className="flex items-center gap-3.5 pt-2">
                            <img
                              src={editorAvatar}
                              alt={editorName}
                              className="w-12 h-12 rounded-full object-cover border border-neutral-200 shadow-xs shrink-0"
                            />
                            <div>
                              <h5 className="text-sm font-bold text-neutral-900 leading-tight">{editorName}</h5>
                              <p className="text-xs text-neutral-500 leading-tight">{editorRole}</p>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-600 italic bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 leading-relaxed">
                            "{editorBio}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: SUBSCRIBERS */}
              {/* ========================================================================= */}
              {activeTab === 'subscribers' && (
                <div className="space-y-4">
                  {/* Toolbar Subscribers */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari email subscriber..."
                        value={searchSubscriber}
                        onChange={(e) => setSearchSubscriber(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-neutral-950"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        disabled={subscribers.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Export CSV</span>
                      </button>

                      {subscribers.length > 0 && (
                        <button
                          onClick={handleClearAllSubscribers}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Semua</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabel Subscribers */}
                  {filteredSubscribers.length === 0 ? (
                    <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                      <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                        {subscribers.length === 0
                          ? 'Belum ada subscriber newsletter. Form newsletter di halaman utama akan mencatat email pengunjung di sini.'
                          : 'Tidak ada email subscriber yang cocok dengan pencarian.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Email Subscriber</th>
                            <th className="py-3 px-4">Tanggal Subscribe</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {filteredSubscribers.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-neutral-900">{sub.email}</td>
                              <td className="py-3 px-4 text-neutral-500">{sub.date}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Aktif
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Hapus email "${sub.email}" dari subscriber?`)) {
                                      handleDeleteSubscriber(sub.email);
                                    }
                                  }}
                                  title="Hapus Subscriber"
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: SUPABASE CLOUD DATABASE INTEGRATION */}
              {/* ========================================================================= */}
              {activeTab === 'database' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="p-5 rounded-2xl border bg-gradient-to-br from-emerald-950/90 to-neutral-900 text-white border-emerald-800/80 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Database className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              Supabase Cloud Database
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              supabaseStatus === 'connected'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : supabaseStatus === 'testing'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                supabaseStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                              }`} />
                              {supabaseStatus === 'connected' ? 'Terhubung (Online)' : supabaseStatus === 'testing' ? 'Memverifikasi...' : 'Status Terkonfigurasi'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-1">
                            {supabaseMessage}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleTestConnection}
                        disabled={supabaseStatus === 'testing'}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus === 'testing' ? 'animate-spin' : ''}`} />
                        <span>Test Koneksi</span>
                      </button>
                    </div>
                  </div>

                  {/* Notification sync message */}
                  {supabaseSyncMsg && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{supabaseSyncMsg}</span>
                      </div>
                      <button
                        onClick={() => setSupabaseSyncMsg(null)}
                        className="text-emerald-700 hover:text-emerald-950 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-3">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                        <Server className="w-4 h-4 text-neutral-500" />
                        <span>Project Credentials</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-neutral-100">
                          <span className="text-neutral-500">Project Name:</span>
                          <span className="font-semibold text-neutral-900">jovitagrasya9-droid's Project</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-neutral-100">
                          <span className="text-neutral-500">Project ID:</span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            pytnktxszkcnmgmrlaff
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-neutral-100">
                          <span className="text-neutral-500">REST Endpoint:</span>
                          <span className="font-mono text-neutral-700 truncate max-w-[240px]" title={SUPABASE_URL}>
                            {SUPABASE_URL}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-neutral-500">Public Key:</span>
                          <span className="font-mono text-neutral-700 truncate max-w-[240px]" title={SUPABASE_ANON_KEY}>
                            {SUPABASE_ANON_KEY.substring(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                          <Cloud className="w-4 h-4 text-neutral-500" />
                          <span>Sinkronisasi Data Realtime</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                          Setiap penambahan, edit, dan penghapusan artikel atau kamera di CMS ini langsung otomatis tersinkronisasi ke database Supabase. Anda juga dapat melakukan backup/push manual sewaktu-waktu.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5 pt-2">
                        <button
                          onClick={handleSyncAllToSupabase}
                          disabled={isSyncingToSupabase}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Upload className={`w-3.5 h-3.5 ${isSyncingToSupabase ? 'animate-bounce' : ''}`} />
                          <span>{isSyncingToSupabase ? 'Mengunggah...' : 'Upload Semua ke Supabase'}</span>
                        </button>

                        <button
                          onClick={handlePullFromSupabase}
                          disabled={isPullingFromSupabase}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <Download className={`w-3.5 h-3.5 ${isPullingFromSupabase ? 'animate-bounce' : ''}`} />
                          <span>{isPullingFromSupabase ? 'Menarik...' : 'Tarik Data dari Supabase'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SQL Schema Setup Helper */}
                  <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-neutral-600" />
                          <span>SQL Setup Schema (Jika Tabel Belum Dibuat)</span>
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Jalankan script SQL ini 1x di Supabase SQL Editor untuk membuat tabel articles, cameras, dan subscribers dengan RLS.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                            setCopiedSql(true);
                            setTimeout(() => setCopiedSql(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 cursor-pointer transition-all"
                        >
                          {copiedSql ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin SQL</span>
                            </>
                          )}
                        </button>

                        <a
                          href="https://supabase.com/dashboard/project/pytnktxszkcnmgmrlaff/sql"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-sm"
                        >
                          <span>Buka Supabase SQL Editor</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-neutral-900 text-neutral-200 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-neutral-800">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: XML SITEMAP & GOOGLE SEARCH CONSOLE */}
              {/* ========================================================================= */}
              {activeTab === 'sitemap' && (
                <div className="space-y-6">
                  {/* Top Header Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Globe className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight">
                              XML Sitemap & Google Indexing
                            </h3>
                            <p className="text-xs text-neutral-400 font-mono">
                              {CANONICAL_SITE_URL}/sitemap.xml
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${CANONICAL_SITE_URL}/sitemap.xml`);
                            setCopiedSitemapUrl(true);
                            setTimeout(() => setCopiedSitemapUrl(false), 2000);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer transition-all"
                        >
                          {copiedSitemapUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">URL Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin URL Sitemap</span>
                            </>
                          )}
                        </button>

                        <a
                          href="/sitemap.xml"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-md"
                        >
                          <span>Buka /sitemap.xml</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => downloadSitemap(articles)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-neutral-900 hover:bg-neutral-100 cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh XML</span>
                        </button>

                        <a
                          href="https://search.google.com/search-console/sitemaps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all shadow-md"
                        >
                          <span>Google Search Console</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Stats Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800">
                      <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                        <span className="text-[11px] font-medium text-neutral-400 block">Total Indexable URLs</span>
                        <span className="text-lg sm:text-xl font-black text-white">
                          {STATIC_PUBLIC_ROUTES.length + articles.filter((a) => a.status !== 'draft').length}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                        <span className="text-[11px] font-medium text-neutral-400 block">Artikel Terindeks</span>
                        <span className="text-lg sm:text-xl font-black text-emerald-400">
                          {articles.filter((a) => a.status !== 'draft').length}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                        <span className="text-[11px] font-medium text-neutral-400 block">Draft / Dikecualikan</span>
                        <span className="text-lg sm:text-xl font-black text-amber-400">
                          {articles.filter((a) => a.status === 'draft').length}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                        <span className="text-[11px] font-medium text-neutral-400 block">Protokol Standard</span>
                        <span className="text-xs sm:text-sm font-bold text-neutral-200 mt-1 block">
                          sitemaps.org 0.9
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search & URL Table Section */}
                  <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden space-y-4 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-neutral-600" />
                          <span>Daftar URL yang Terdaftar di Sitemap XML</span>
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Halaman berikut akan otomatis dirayapi (crawled) dan diindeks oleh Googlebot & Bingbot.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          value={sitemapSearchQuery}
                          onChange={(e) => setSitemapSearchQuery(e.target.value)}
                          placeholder="Cari URL / Slug artikel..."
                          className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-neutral-900 transition-all"
                        />
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* URLs Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                            <th className="py-2.5 px-3">Tipe</th>
                            <th className="py-2.5 px-3">Canonical URL</th>
                            <th className="py-2.5 px-3">Lastmod</th>
                            <th className="py-2.5 px-3">Changefreq</th>
                            <th className="py-2.5 px-3">Priority</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                          {/* Static Routes */}
                          {STATIC_PUBLIC_ROUTES.filter((r) =>
                            !sitemapSearchQuery ||
                            r.path.toLowerCase().includes(sitemapSearchQuery.toLowerCase()) ||
                            r.title.toLowerCase().includes(sitemapSearchQuery.toLowerCase())
                          ).map((route) => (
                            <tr key={route.path} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-sans">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                                  Halaman Inti
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-neutral-900 font-semibold break-all">
                                {CANONICAL_SITE_URL}{route.path}
                              </td>
                              <td className="py-2.5 px-3 text-neutral-500 font-sans">
                                {new Date().toISOString().split('T')[0]}
                              </td>
                              <td className="py-2.5 px-3 text-neutral-500 font-sans">{route.changefreq}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                  {route.priority}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-sans">
                                <a
                                  href={route.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-950 font-medium"
                                >
                                  <span>Buka</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}

                          {/* Published Articles */}
                          {articles
                            .filter((a) => a.status !== 'draft')
                            .filter(
                              (a) =>
                                !sitemapSearchQuery ||
                                a.slug.toLowerCase().includes(sitemapSearchQuery.toLowerCase()) ||
                                a.title.toLowerCase().includes(sitemapSearchQuery.toLowerCase())
                            )
                            .map((art) => {
                              const lastmod = formatIsoLastMod(art.dateModified || art.date);
                              const fullUrl = `${CANONICAL_SITE_URL}/artikel/${art.slug}`;
                              return (
                                <tr key={art.id} className="hover:bg-neutral-50/80 transition-colors">
                                  <td className="py-2.5 px-3 font-sans">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                      Artikel {art.featured ? '⭐' : ''}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-neutral-900 break-all">
                                    <div className="font-sans font-bold text-neutral-900 text-xs mb-0.5 line-clamp-1">
                                      {art.title}
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-mono">{fullUrl}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-neutral-600 font-sans">{lastmod}</td>
                                  <td className="py-2.5 px-3 text-neutral-500 font-sans">weekly</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                                      {art.featured ? '0.9' : '0.8'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-sans">
                                    <a
                                      href={`/artikel/${art.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                      <span>Buka</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Raw Live XML Output Viewer */}
                  <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-white">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold font-mono">Live Generated XML (sitemaps.org / Googlebot)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const xml = generateSitemapXml(articles);
                          navigator.clipboard.writeText(xml);
                          setCopiedSitemapXml(true);
                          setTimeout(() => setCopiedSitemapXml(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer transition-all"
                      >
                        {copiedSitemapXml ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">XML Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Semua XML</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-neutral-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed border border-neutral-800 selection:bg-emerald-900">
                      {generateSitemapXml(articles)}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Quick Article Preview Modal inside CMS */}
            {previewArticle && (
              <div
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setPreviewArticle(null)}
              >
                <div
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 text-neutral-900 border border-neutral-200 shadow-2xl relative animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Quick Preview: {previewArticle.category}
                    </span>
                    <button
                      onClick={() => setPreviewArticle(null)}
                      className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <img
                    src={previewArticle.coverImage}
                    alt={previewArticle.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4 bg-neutral-100"
                  />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="font-bold text-neutral-900">{previewArticle.category}</span>
                      <span>•</span>
                      <span>{previewArticle.readTime}</span>
                      <span>•</span>
                      <span>{previewArticle.date}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black leading-tight text-neutral-900">
                      {previewArticle.title}
                    </h2>

                    {/* Author Byline in Preview */}
                    <div className="flex items-center gap-3 py-2 border-y border-neutral-100">
                      <img
                        src={previewArticle.author.avatar}
                        alt={previewArticle.author.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{previewArticle.author.name}</h4>
                        <p className="text-[11px] text-neutral-500">{previewArticle.author.role}</p>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                      {previewArticle.summary}
                    </p>

                    <div className="pt-2">
                      <ArticleContentRenderer content={previewArticle.content} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* XML Sitemap Live Inspector Modal */}
            {showSitemapModal && (
              <div
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowSitemapModal(false)}
              >
                <div
                  className="bg-neutral-900 text-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 border border-neutral-700 shadow-2xl relative animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          Live XML Sitemap (/sitemap.xml)
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Standar protokol sitemaps.org kompatibel penuh dengan Google Search Console
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSitemapModal(false)}
                      className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed border border-neutral-800 selection:bg-emerald-800">
                    <pre className="whitespace-pre-wrap break-all">
                      {generateSitemapXml(articles)}
                    </pre>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-neutral-400">
                      Total Published URLs: <strong className="text-white">{articles.filter(a => a.status !== 'draft').length + 5}</strong> (5 statis + {articles.filter(a => a.status !== 'draft').length} artikel)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const xml = generateSitemapXml(articles);
                          navigator.clipboard?.writeText(xml);
                          alert('XML Sitemap berhasil disalin ke clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer"
                      >
                        Salin XML
                      </button>
                      <button
                        onClick={() => downloadSitemap(articles)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        Unduh File sitemap.xml
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
