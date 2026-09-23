import React, { useState } from 'react';
import { Article } from '../types';
import { generateSitemapXml, downloadSitemap, CANONICAL_SITE_URL } from '../utils/sitemapGenerator';
import { FileCode, Copy, Check, Download, ArrowLeft, ExternalLink } from 'lucide-react';

interface SitemapXmlViewProps {
  articles: Article[];
  onBackToHome: () => void;
}

export const SitemapXmlView: React.FC<SitemapXmlViewProps> = ({ articles, onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const xmlContent = generateSitemapXml(articles);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-neutral-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h1 className="text-base sm:text-lg font-bold text-white font-mono">
                  {CANONICAL_SITE_URL}/sitemap.xml
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  application/xml
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Protokol Standar XML Sitemap untuk Google Search Console, Bing, dan Search Crawlers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin XML</span>
                </>
              )}
            </button>

            <button
              onClick={() => downloadSitemap(articles)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .xml</span>
            </button>
          </div>
        </div>

        {/* XML Code Container */}
        <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
          <pre className="font-mono text-xs sm:text-[13px] text-emerald-300 leading-relaxed overflow-x-auto selection:bg-emerald-800 whitespace-pre-wrap break-all">
            {xmlContent}
          </pre>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 pt-2 border-t border-neutral-800/60 font-mono">
          <span>Robots reference: {CANONICAL_SITE_URL}/robots.txt</span>
          <a
            href="https://search.google.com/search-console/sitemaps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
          >
            <span>Buka Google Search Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
