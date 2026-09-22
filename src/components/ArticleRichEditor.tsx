import React, { useState, useRef } from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Table as TableIcon,
  List,
  Quote,
  Sparkles,
  Eye,
  Edit3,
  FileText,
  CheckCircle2,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { convertWordHtmlToMarkdown, cleanPlainTextWordPaste, autoFormatArticleText } from '../utils/wordParser';
import { ArticleContentRenderer } from './ArticleContentRenderer';

interface ArticleRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ArticleRichEditor: React.FC<ArticleRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis atau paste isi artikel dari Word / Docs di sini...',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWordHelp, setShowWordHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Intercept Paste event from Word / Google Docs
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboard = e.clipboardData;
    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    // 1. If clipboard contains HTML from Word or Docs
    if (html && (html.includes('<table') || html.includes('Mso') || html.includes('<p') || html.includes('<h'))) {
      const parsedMarkdown = convertWordHtmlToMarkdown(html);
      if (parsedMarkdown && parsedMarkdown.trim().length > 0) {
        e.preventDefault();
        insertTextAtCursor(parsedMarkdown);
        showToast('✨ Format Word Terdeteksi: Tabel & paragraf berhasil dirapikan secara otomatis!');
        return;
      }
    }

    // 2. If clipboard has tab-separated values (Word/Excel table copied as text) or single linebreaks
    if (text && (text.includes('\t') || text.includes('\r\n'))) {
      const cleaned = cleanPlainTextWordPaste(text);
      if (cleaned !== text) {
        e.preventDefault();
        insertTextAtCursor(cleaned);
        showToast('✨ Teks Word Berhasil Diformat: Paragraf & tabel dipisahkan rapi!');
        return;
      }
    }
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n\n${textToInsert}` : textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;

    const before = previous.substring(0, start);
    const after = previous.substring(end, previous.length);

    // Ensure double newlines if inserting between existing text
    const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';

    const updated = before + prefix + textToInsert + suffix + after;
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = (before + prefix + textToInsert).length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Toolbar Actions
  const handleInsertHeading = (level: 2 | 3) => {
    const prefix = level === 2 ? '## ' : '### ';
    insertTextAtCursor(`${prefix}Judul Bagian Baru`);
  };

  const handleInsertBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      const updated = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
      onChange(updated);
    } else {
      insertTextAtCursor('**teks tebal**');
    }
  };

  const handleInsertItalic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      const updated = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
      onChange(updated);
    } else {
      insertTextAtCursor('*teks miring*');
    }
  };

  const handleInsertList = () => {
    insertTextAtCursor('- Poin pertama\n- Poin kedua\n- Poin ketiga');
  };

  const handleInsertQuote = () => {
    insertTextAtCursor('> Tulis kutipan penting atau catatan khusus editorial di sini...');
  };

  const handleInsertTable = () => {
    const sampleTable = `| Aspek / Fitur | Spesifikasi | Keterangan |
|---|---|---|
| Resolusi Sensor | 40.2 MP X-Trans CMOS | Detail sangat tajam untuk cropping |
| Sistem Autofokus | AI Subject Detection | Cepat mengunci mata, hewan, & kendaraan |
| Stabilisasi Gambar | 7.0 Stops 5-Axis IBIS | Sangat stabil untuk foto low-light |
| Rekaman Video | 6.2K 30fps 10-bit | Kualitas produksi sinematik |`;
    insertTextAtCursor(sampleTable);
    showToast('Tabel format Markdown berhasil disisipkan!');
  };

  const handleAutoFormatAll = () => {
    if (!value.trim()) {
      showToast('Konten masih kosong!');
      return;
    }
    const formatted = autoFormatArticleText(value);
    onChange(formatted);
    showToast('✨ Seluruh paragraf dan tabel berhasil dirapikan secara otomatis!');
  };

  return (
    <div className="rounded-2xl border border-neutral-300 bg-white overflow-hidden shadow-2xs transition-all focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10">
      {/* 1. Header Toolbar */}
      <div className="bg-neutral-50/90 border-b border-neutral-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => handleInsertHeading(2)}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Judul Bagian (H2)"
          >
            <Heading2 className="w-4 h-4" />
            <span className="hidden sm:inline">H2</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertHeading(3)}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Sub-judul (H3)"
          >
            <Heading3 className="w-4 h-4" />
            <span className="hidden sm:inline">H3</span>
          </button>

          <span className="w-px h-5 bg-neutral-300 mx-1" />

          <button
            type="button"
            onClick={handleInsertBold}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors text-xs font-bold"
            title="Tebal (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertItalic}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors text-xs italic"
            title="Miring (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertList}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors text-xs"
            title="Daftar Poin (List)"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertQuote}
            className="p-1.5 rounded-lg hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-950 transition-colors text-xs"
            title="Kutipan (Quote)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-neutral-300 mx-1" />

          {/* Table insertion */}
          <button
            type="button"
            onClick={handleInsertTable}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 transition-colors text-xs font-semibold shadow-2xs"
            title="Sisipkan Tabel Rapi"
          >
            <TableIcon className="w-3.5 h-3.5 text-neutral-700" />
            <span>+ Tabel</span>
          </button>

          {/* Auto Format / Fix Paragraphs */}
          <button
            type="button"
            onClick={handleAutoFormatAll}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors text-xs font-semibold shadow-2xs"
            title="Rapikan Spasi & Paragraf yang Menggumpal"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Rapikan Paragraf</span>
          </button>
        </div>

        {/* Right side: Tabs (Edit vs Preview) & Help */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowWordHelp(!showWordHelp)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
            title="Panduan Copy-Paste dari Word"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="inline-flex rounded-xl bg-neutral-200/80 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Hasil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Word Help Banner */}
      {showWordHelp && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Tips Copy-Paste dari Microsoft Word / Google Docs:</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>Cukup salin (Ctrl+C) teks, tabel, dan judul dari dokumen Word, lalu langsung <strong>Paste (Ctrl+V)</strong> ke dalam editor ini.</li>
              <li>Sistem otomatis mendeteksi struktur tabel, heading (H2/H3), teks tebal, dan memisahkan setiap paragraf secara rapi.</li>
              <li>Jika paragraf masih tampak menggumpal, klik tombol <strong>"Rapikan Paragraf"</strong> di atas.</li>
              <li>Beralih ke tab <strong>"Pratinjau Hasil"</strong> untuk melihat tampilan akhir artikel persis seperti yang tampil di website.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Content Area */}
      {activeTab === 'edit' ? (
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={12}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full text-sm leading-relaxed p-3 rounded-xl border-0 bg-transparent focus:outline-none font-sans text-neutral-900 resize-y min-h-[260px] placeholder:text-neutral-400"
          />
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dukungan otomatis: Salin dari Word (paragraf, tabel, bullet points, & heading tetap rapi).</span>
            </div>
            <div>{value.trim().split(/\s+/).filter(Boolean).length} kata</div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-neutral-50/50 min-h-[260px] max-h-[500px] overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-2 border-b border-neutral-100">
              Pratinjau Tampilan Pembaca Website
            </div>
            <ArticleContentRenderer content={value} />
          </div>
        </div>
      )}
    </div>
  );
};
