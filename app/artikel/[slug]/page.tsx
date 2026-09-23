import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

// 1. Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi.');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// 2. Definisi Tipe Data Artikel
interface ArticleAuthor {
  id?: string;
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
}

interface ArticleRecord {
  id: string;
  title: string;
  slug: string;
  seo_title?: string;
  meta_description?: string;
  cover_image_alt?: string;
  category?: string;
  date?: string;
  read_time?: string;
  cover_image?: string;
  summary?: string;
  content?: string[] | string;
  author?: ArticleAuthor;
  status?: string;
  tags?: string[];
  created_at?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 3. Helper Pengambilan Data Artikel dari Supabase berdasarkan Slug
async function getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
  if (!slug) return null;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error(`[Supabase Fetch Notice] Artikel dengan slug '${slug}' tidak ditemukan:`, error?.message);
      return null;
    }

    return data as ArticleRecord;
  } catch (err) {
    console.error(`[Supabase Fetch Error] Terjadi kendala saat memuat artikel '${slug}':`, err);
    return null;
  }
}

// 4. Generate Metadata Dinamis untuk SEO & Social Media Share
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan | FujiFinder',
      description: 'Halaman artikel yang Anda cari tidak ditemukan atau telah dipindahkan.',
    };
  }

  const title = article.seo_title || `${article.title} — FujiFinder`;
  const description = article.meta_description || article.summary || 'Baca ulasan mendalam dan panduan kamera terkini di FujiFinder.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: article.cover_image
        ? [{ url: article.cover_image, alt: article.cover_image_alt || article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

// 5. Komponen Utama Halaman Artikel (Next.js 15 App Router)
export default async function ArticleDetailPage({ params }: PageProps) {
  // Await params sesuai standar Next.js 15
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // Jika data tidak ditemukan di Supabase, render halaman 404
  if (!article) {
    notFound();
  }

  // Normalisasi data Author
  const author = {
    name: article.author?.name || 'Tim Redaksi FujiFinder',
    role: article.author?.role || 'Spesialis Kamera & Fotografi',
    avatar: article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  };

  // Normalisasi Konten Artikel (Array, HTML, atau Plain Text)
  const isHtmlContent = typeof article.content === 'string' && /<(table|p|h1|h2|h3|ul|ol|div)[\s>]/i.test(article.content);
  const contentParagraphs = Array.isArray(article.content)
    ? article.content
    : typeof article.content === 'string' && !isHtmlContent
    ? article.content.split('\n\n').filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-neutral-900 py-8 sm:py-14">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigasi Kembali / Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          <Link
            href="/"
            className="hover:text-neutral-950 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Kembali ke Beranda</span>
          </Link>
          <span>/</span>
          <span className="uppercase tracking-wider font-semibold text-neutral-800">
            {article.category || 'Artikel'}
          </span>
        </nav>

        {/* Header Artikel */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white">
              {article.category || 'Editorial'}
            </span>
            {article.date && (
              <span className="text-xs text-neutral-500 font-medium">
                {article.date}
              </span>
            )}
            {article.read_time && (
              <>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-neutral-500 font-medium">
                  {article.read_time}
                </span>
              </>
            )}
          </div>

          {/* Judul Artikel */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">
            {article.title}
          </h1>

          {/* Byline Penulis */}
          <div className="flex items-center gap-3.5 pt-4 pb-2 border-b border-neutral-200/80">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover border border-neutral-300 bg-neutral-100"
            />
            <div>
              <div className="text-sm font-bold text-neutral-900">{author.name}</div>
              <div className="text-xs text-neutral-500">{author.role}</div>
            </div>
          </div>
        </header>

        {/* Gambar Sampul (Cover Image) */}
        {article.cover_image && (
          <figure className="mb-10 rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-sm relative">
            <img
              src={article.cover_image}
              alt={article.cover_image_alt || article.title}
              className="w-full h-auto max-h-[520px] object-cover object-center"
            />
            {article.cover_image_alt && (
              <figcaption className="p-3 bg-neutral-950/90 text-neutral-300 text-xs italic text-center">
                {article.cover_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Ringkasan Utama (Lead Summary) */}
        {article.summary && (
          <div className="p-6 mb-8 rounded-2xl bg-neutral-100 border-l-4 border-neutral-950 text-neutral-800 text-lg sm:text-xl font-medium leading-relaxed italic">
            &ldquo;{article.summary}&rdquo;
          </div>
        )}

        {/* Isi Lengkap Konten Artikel */}
        <section className="article-body space-y-6 text-base sm:text-lg text-neutral-800 leading-relaxed font-normal">
          {/* Format Rich HTML (WYSIWYG & Word Tables) */}
          {isHtmlContent ? (
            <div
              className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-950 prose-p:mb-5 prose-table:w-full prose-table:border-collapse prose-th:bg-neutral-900 prose-th:text-white prose-th:p-3 prose-td:border prose-td:p-3"
              dangerouslySetInnerHTML={{ __html: article.content as string }}
            />
          ) : contentParagraphs.length > 0 ? (
            /* Format Array / Paragraf Plain Text */
            contentParagraphs.map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2
                    key={index}
                    className="text-2xl sm:text-3xl font-bold text-neutral-950 pt-6 pb-2 border-b border-neutral-200 mt-6"
                  >
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={index}
                    className="text-xl sm:text-2xl font-bold text-neutral-900 pt-4 pb-1 mt-4"
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote
                    key={index}
                    className="border-l-4 border-neutral-900 pl-4 py-2 my-4 italic text-neutral-800 bg-neutral-50 rounded-r-xl"
                  >
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-neutral-500 italic">Belum ada konten tulisan untuk artikel ini.</p>
          )}
        </section>

        {/* Footer Topik / Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-12 pt-6 border-t border-neutral-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-2">Topik Terkait:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-200/70 text-neutral-800 hover:bg-neutral-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </footer>
        )}
      </article>
    </main>
  );
}
