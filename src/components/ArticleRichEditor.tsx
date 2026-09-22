import React, { useState, useRef, useEffect } from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Wand2,
  Quote,
  Code,
  Eye,
} from 'lucide-react';
import {
  cleanWordHtml,
  convertTabsToHtmlTable,
  convertMarkdownOrTextToVisualHtml,
} from '../utils/wordParser';

interface ArticleRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ArticleRichEditor: React.FC<ArticleRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Salin (Ctrl+C) teks dan tabel dari Microsoft Word / Google Docs, lalu tempel (Ctrl+V) di sini...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWordHelp, setShowWordHelp] = useState(false);
  const [activeInTable, setActiveInTable] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [stats, setStats] = useState({ words: 0, tables: 0 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Convert incoming value (markdown or HTML) to visual HTML on load or external change
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const targetHtml = convertMarkdownOrTextToVisualHtml(value);

    // Only update DOM if drastically different to avoid cursor jumps
    if (targetHtml !== currentHtml && (currentHtml === '' || targetHtml === '')) {
      editorRef.current.innerHTML = targetHtml;
      updateStats();
    } else if (
      targetHtml &&
      !currentHtml.includes('<table') &&
      targetHtml.includes('<table')
    ) {
      // If target contains tables and current DOM doesn't have it, hydrate
      editorRef.current.innerHTML = targetHtml;
      updateStats();
    }
  }, [value]);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const tables = editorRef.current.querySelectorAll('table').length;
    setStats({ words, tables });
  };

  // Detect if cursor is inside a table
  const checkCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveInTable(false);
      return;
    }
    let node: Node | null = selection.anchorNode;
    let foundTable = false;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TABLE') {
        foundTable = true;
        break;
      }
      node = node.parentNode;
    }
    setActiveInTable(foundTable);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateStats();
    checkCursorPosition();
  };

  // Intercept Paste: The Magic Sauce for Microsoft Word & Google Docs
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboard = e.clipboardData;
    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    // 1. If clipboard contains rich HTML from Word / Docs
    if (html && (html.includes('<table') || html.includes('Mso') || html.includes('<p') || html.includes('<tr'))) {
      e.preventDefault();
      const cleanedHtml = cleanWordHtml(html);
      document.execCommand('insertHTML', false, cleanedHtml);
      handleInput();
      showToast('✨ Sukses! Tabel & isi dari Word berhasil ditempel persis sesuai aslinya.');
      return;
    }

    // 2. If plain text has tab characters (Word or Excel table copied as plain text)
    if (text && text.includes('\t') && text.includes('\n')) {
      const tableHtml = convertTabsToHtmlTable(text);
      if (tableHtml) {
        e.preventDefault();
        document.execCommand('insertHTML', false, tableHtml);
        handleInput();
        showToast('✨ Format Tabel Terdeteksi: Tabel berhasil dibuat dan ditempel secara visual!');
        return;
      }
    }

    // 3. Normal text paste
    showToast('Teks berhasil ditempel ke dalam editor.');
  };

  // Formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  // Insert a fresh visual 3x3 table directly into editor
  const handleInsertTable = () => {
    const tableTemplate = `
      <table class="fujifinder-table">
        <thead>
          <tr>
            <th>Fitur / Aspek</th>
            <th>Spesifikasi</th>
            <th>Keterangan / Pengujian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sensor & Resolusi</td>
            <td>Contoh: 40.2 MP X-Trans CMOS</td>
            <td>Detail tajam dan responsif</td>
          </tr>
          <tr>
            <td>Autofokus & Tracking</td>
            <td>AI Subject Detection</td>
            <td>Kunci fokus mata & wajah cepat</td>
          </tr>
          <tr>
            <td>Stabilisasi IBIS</td>
            <td>7.0 Stops 5-Axis</td>
            <td>Sangat stabil untuk kondisi low-light</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    executeCommand('insertHTML', tableTemplate);
    showToast('Tabel visual berhasil disisipkan. Anda bisa langsung mengedit isi selnya.');
  };

  // Table manipulation functions
  const getCurrentTable = (): HTMLTableElement | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TABLE') {
        return node as HTMLTableElement;
      }
      node = node.parentNode;
    }
    return null;
  };

  const handleAddRow = () => {
    const table = getCurrentTable();
    if (!table) return;

    const colCount = table.rows[0]?.cells.length || 3;
    const tbody = table.querySelector('tbody') || table;
    const newRow = document.createElement('tr');

    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.innerHTML = 'Data baru...';
      newRow.appendChild(td);
    }
    tbody.appendChild(newRow);
    handleInput();
    showToast('Baris baru berhasil ditambahkan ke tabel.');
  };

  const handleAddColumn = () => {
    const table = getCurrentTable();
    if (!table) return;

    Array.from(table.rows).forEach((row, idx) => {
      if (idx === 0 && row.parentElement?.tagName.toLowerCase() === 'thead') {
        const th = document.createElement('th');
        th.innerHTML = 'Kolom Baru';
        row.appendChild(th);
      } else {
        const td = document.createElement('td');
        td.innerHTML = '-';
        row.appendChild(td);
      }
    });
    handleInput();
    showToast('Kolom baru berhasil ditambahkan ke tabel.');
  };

  const handleDeleteRow = () => {
    const table = getCurrentTable();
    if (!table) return;
    const selection = window.getSelection();
    let node: Node | null = selection?.anchorNode || null;
    while (node && node !== table) {
      if (node.nodeName === 'TR') {
        (node as HTMLTableRowElement).remove();
        handleInput();
        showToast('Baris tabel berhasil dihapus.');
        return;
      }
      node = node.parentNode;
    }
  };

  const handleDeleteTable = () => {
    const table = getCurrentTable();
    if (table) {
      table.remove();
      handleInput();
      setActiveInTable(false);
      showToast('Tabel berhasil dihapus.');
    }
  };

  // Auto clean formatting across editor
  const handleAutoFormat = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const cleaned = cleanWordHtml(currentHtml);
    editorRef.current.innerHTML = cleaned;
    handleInput();
    showToast('✨ Format dokumen & tabel berhasil dirapikan secara menyeluruh!');
  };

  return (
    <div className="w-full flex flex-col rounded-2xl border border-neutral-300 bg-white overflow-hidden shadow-xs">
      {/* Top Banner Notice for User */}
      <div className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">
            Visual Word & Docs Editor: Salin teks & tabel di Word (Ctrl+C), lalu langsung Paste (Ctrl+V) di sini.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowWordHelp(!showWordHelp)}
          className="text-neutral-300 hover:text-white flex items-center gap-1 underline cursor-pointer text-[11px]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showWordHelp ? 'Tutup Panduan' : 'Lihat Panduan'}
        </button>
      </div>

      {/* Expandable Help Box */}
      {showWordHelp && (
        <div className="bg-amber-50/90 border-b border-amber-200 p-4 text-xs text-amber-950 animate-fadeIn">
          <h4 className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Cara Menempelkan Tabel dari Microsoft Word agar Persis & Rapi:
          </h4>
          <ol className="list-decimal ml-5 space-y-1 text-amber-900">
            <li>Buka dokumen Microsoft Word atau Google Docs Anda.</li>
            <li>Sorot (blok) tulisan beserta tabel yang ingin Anda pindahkan, lalu tekan <b>Ctrl + C</b> (Copy).</li>
            <li>Klik di dalam kotak putih editor di bawah ini, lalu tekan <b>Ctrl + V</b> (Paste).</li>
            <li>
              Tabel Word akan langsung muncul <b>sebagai tabel visual nyata</b> dengan garis kolom dan baris yang rapi!
            </li>
            <li>Anda dapat langsung mengklik di dalam sel tabel untuk mengubah tulisan atau menambahkan baris baru.</li>
          </ol>
        </div>
      )}

      {/* Main Interactive Toolbar */}
      <div className="bg-neutral-100/90 border-b border-neutral-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <div className="flex items-center bg-white rounded-lg border border-neutral-200 shadow-2xs p-0.5">
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', 'h2')}
              title="Heading 2 (Judul Bagian)"
              className="px-2.5 py-1 text-xs font-bold rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer flex items-center gap-1"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', 'h3')}
              title="Heading 3 (Sub-Judul)"
              className="px-2.5 py-1 text-xs font-bold rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer flex items-center gap-1"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>H3</span>
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', 'p')}
              title="Paragraf Normal"
              className="px-2 py-1 text-xs font-medium rounded-md hover:bg-neutral-100 text-neutral-700 cursor-pointer"
            >
              Teks
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-300 mx-0.5" />

          {/* Text Styling */}
          <div className="flex items-center bg-white rounded-lg border border-neutral-200 shadow-2xs p-0.5">
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              title="Tebal (Bold)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              title="Miring (Italic)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              title="Garis Bawah (Underline)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-300 mx-0.5" />

          {/* Lists & Quotes */}
          <div className="flex items-center bg-white rounded-lg border border-neutral-200 shadow-2xs p-0.5">
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Daftar Poin (Bullet List)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              title="Daftar Angka (Numbered List)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', 'blockquote')}
              title="Kutipan (Quote)"
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-800 cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-300 mx-0.5" />

          {/* Insert Table Button */}
          <button
            type="button"
            onClick={handleInsertTable}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs cursor-pointer transition-colors"
            title="Sisipkan Tabel Visual Baru"
          >
            <TableIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Sisipkan Tabel</span>
          </button>

          {/* Auto Format / Clean Word button */}
          <button
            type="button"
            onClick={handleAutoFormat}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 cursor-pointer shadow-2xs"
            title="Rapikan spasi, baris, dan format tabel secara otomatis"
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rapikan Format</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white rounded-lg border border-neutral-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              viewMode === 'visual'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
              viewMode === 'code'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Contextual Table Tools (Visible when cursor or click is inside a table) */}
      {activeInTable && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 flex flex-wrap items-center justify-between text-xs text-emerald-950 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <TableIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Alat Pengedit Tabel Aktif:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddRow}
              className="px-2 py-0.5 bg-white border border-emerald-300 hover:bg-emerald-100 rounded text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Rows className="w-3 h-3" />
              + Baris
            </button>
            <button
              type="button"
              onClick={handleAddColumn}
              className="px-2 py-0.5 bg-white border border-emerald-300 hover:bg-emerald-100 rounded text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Columns className="w-3 h-3" />
              + Kolom
            </button>
            <button
              type="button"
              onClick={handleDeleteRow}
              className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Baris
            </button>
            <button
              type="button"
              onClick={handleDeleteTable}
              className="px-2 py-0.5 bg-rose-600 text-white hover:bg-rose-700 rounded flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Seluruh Tabel
            </button>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Visual ContentEditable Area */}
      {viewMode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyUp={checkCursorPosition}
          onClick={checkCursorPosition}
          data-placeholder={placeholder}
          className="fujifinder-visual-editor min-h-[380px] max-h-[600px] overflow-y-auto p-5 sm:p-7 bg-white text-neutral-800 text-base leading-relaxed focus:outline-none cursor-text relative"
        />
      ) : (
        /* Raw HTML inspection mode if needed */
        <textarea
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[380px] p-4 text-xs font-mono bg-neutral-900 text-neutral-100 focus:outline-none"
        />
      )}

      {/* Footer Info & Stats */}
      <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 flex flex-wrap items-center justify-between text-[11px] text-neutral-500">
        <div className="flex items-center gap-4">
          <span>{stats.words} kata</span>
          <span>•</span>
          <span className={stats.tables > 0 ? 'text-emerald-700 font-bold' : ''}>
            {stats.tables} tabel terpasang
          </span>
        </div>
        <div className="text-neutral-400">
          Format tersimpan otomatis sesuai dokumen Word & Docs Anda
        </div>
      </div>
    </div>
  );
};
