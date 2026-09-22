import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleContentRendererProps {
  content: string[] | string;
  className?: string;
}

export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({
  content,
  className = '',
}) => {
  // Convert array or string to unified markdown
  const markdownText = React.useMemo(() => {
    if (Array.isArray(content)) {
      return content.filter(Boolean).join('\n\n');
    }
    return content || '';
  }, [content]);

  if (!markdownText.trim()) {
    return (
      <p className="text-neutral-400 italic text-sm py-4">
        Belum ada konten tulisan untuk artikel ini.
      </p>
    );
  }

  return (
    <div className={`article-content-body ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 pt-8 pb-3 border-b border-neutral-200 tracking-tight leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 pt-8 pb-3 border-b border-neutral-100 tracking-tight leading-snug mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 pt-6 pb-2 tracking-tight leading-snug mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-neutral-900 pt-4 pb-1 mt-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed mb-6 font-normal">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-neutral-900 pl-5 py-3.5 my-6 italic text-neutral-800 bg-neutral-50/90 rounded-r-2xl shadow-2xs">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2.5 my-5 text-base sm:text-lg text-neutral-700 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2.5 my-5 text-base sm:text-lg text-neutral-700 pl-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
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
              className="text-red-600 hover:text-red-700 underline font-medium transition-colors"
            >
              {children}
            </a>
          ),
          // Tables with responsive card wrapper and neat borders
          table: ({ children }) => (
            <div className="my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left border-collapse">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-900 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-200 bg-white text-sm sm:text-base">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-neutral-50/80 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3.5 sm:px-5 sm:py-4 font-bold text-neutral-100 border-b border-neutral-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3.5 sm:px-5 sm:py-4 text-neutral-800 leading-relaxed align-top">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-900 font-mono text-xs sm:text-sm border border-neutral-200">
              {children}
            </code>
          ),
          hr: () => <hr className="my-8 border-neutral-200" />,
        }}
      >
        {markdownText}
      </Markdown>
    </div>
  );
};
