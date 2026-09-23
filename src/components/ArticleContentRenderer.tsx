import React, { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cleanWordHtml } from '../utils/wordParser';

interface ArticleContentRendererProps {
  content: string[] | string;
  className?: string;
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  className = '',
}) => {
  const fullText = useMemo(() => {
    if (Array.isArray(content)) {
      return content.filter(Boolean).join('\n\n');
    }
    return content || '';
  }, [content]);

  if (!fullText.trim()) {
    return (
      <p className="text-neutral-400 italic text-sm py-4">
        Belum ada konten tulisan untuk artikel ini.
      </p>
    );
  }

  // Detect if content is Rich HTML (from Visual Editor / Word Paste)
  const isHtml = /<(table|p|h1|h2|h3|h4|ul|ol|blockquote|div)[\s>]/i.test(fullText);

  if (isHtml) {
    const sanitizedHtml = cleanWordHtml(fullText);

    return (
      <div
        className={`fujifinder-article-prose break-words max-w-full overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Otherwise fallback to Markdown with GFM table support
  return (
    <div className={`article-content-body fujifinder-article-prose break-words max-w-full overflow-hidden ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 pt-6 pb-2 border-b border-neutral-200 tracking-tight leading-tight break-words max-w-full">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 pt-6 pb-2 border-b border-neutral-100 tracking-tight leading-snug mt-6 break-words max-w-full">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 pt-4 pb-1 tracking-tight leading-snug mt-3 break-words max-w-full">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base sm:text-lg text-neutral-800 leading-relaxed mb-5 font-normal break-words max-w-full">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-neutral-900 pl-4 py-2.5 my-5 italic text-neutral-800 bg-neutral-50 rounded-r-xl max-w-full break-words">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-2 my-4 text-base sm:text-lg text-neutral-800 break-words max-w-full">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-2 my-4 text-base sm:text-lg text-neutral-800 break-words max-w-full">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed break-words max-w-full pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-neutral-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-800">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 underline font-medium transition-colors break-all"
            >
              {children}
            </a>
          ),
          // Tables with responsive card wrapper and neat borders
          table: ({ children }) => (
            <div className="my-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs max-w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse fujifinder-table text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-200 bg-white text-xs sm:text-sm">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-neutral-50/80 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 sm:px-4 sm:py-3 font-bold text-neutral-100 border-b border-neutral-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-neutral-800 leading-relaxed align-top">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-900 font-mono text-xs border border-neutral-200 break-all">
              {children}
            </code>
          ),
          hr: () => <hr className="my-6 border-neutral-200" />,
        }}
      >
        {fullText}
      </Markdown>
    </div>
  );
};
