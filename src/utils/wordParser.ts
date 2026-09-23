/**
 * Utility for parsing and cleaning content copied from Microsoft Word, Google Docs,
 * or Excel into clean, semantic visual HTML with intact tables, headings, and paragraphs.
 */

/**
 * Cleans messy Microsoft Word / Google Docs clipboard HTML into clean, beautiful semantic HTML
 * with fully styled tables, clean headings, and proper responsive margins for mobile/Android.
 */
export function cleanWordHtml(rawHtml: string): string {
  try {
    const parser = new DOMParser();
    // Remove Word XML & comment junk
    const sanitized = rawHtml
      .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
      .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
      .replace(/<\/?w:[^>]*>/gi, '')
      .replace(/<\/?m:[^>]*>/gi, '')
      .replace(/<\/?style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<\/?meta[^>]*>/gi, '')
      .replace(/<\/?link[^>]*>/gi, '');

    const doc = parser.parseFromString(sanitized, 'text/html');
    const body = doc.body;

    // 1. Process all tables & wrap in responsive containers
    const tables = Array.from(body.querySelectorAll('table'));
    tables.forEach((table) => {
      // Remove all inline Word width, border, and style attributes that cause overflow on mobile
      table.removeAttribute('width');
      table.removeAttribute('style');
      table.removeAttribute('border');
      table.removeAttribute('cellspacing');
      table.removeAttribute('cellpadding');
      table.className = 'fujifinder-table w-full border-collapse';

      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 0) return;

      // Check first row: make sure it acts as <thead> with <th>
      const firstRow = rows[0];
      const headerCells = Array.from(firstRow.querySelectorAll('th, td'));
      let thead = table.querySelector('thead');

      if (!thead) {
        thead = doc.createElement('thead');
        const theadTr = doc.createElement('tr');
        headerCells.forEach((c) => {
          const th = doc.createElement('th');
          th.innerHTML = cleanCellInnerHtml(c.innerHTML);
          theadTr.appendChild(th);
        });
        thead.appendChild(theadTr);
        firstRow.remove();
        table.insertBefore(thead, table.firstChild);
      }

      // Wrap remaining rows in <tbody>
      let tbody = table.querySelector('tbody');
      if (!tbody) {
        tbody = doc.createElement('tbody');
        const remainingRows = Array.from(table.querySelectorAll('tr')).filter(
          (r) => !thead?.contains(r)
        );
        remainingRows.forEach((r) => {
          const cells = Array.from(r.querySelectorAll('td, th'));
          cells.forEach((td) => {
            td.removeAttribute('style');
            td.removeAttribute('width');
            td.removeAttribute('class');
            td.innerHTML = cleanCellInnerHtml(td.innerHTML);
          });
          tbody?.appendChild(r);
        });
        table.appendChild(tbody);
      }
    });

    // 2. Clean paragraphs, lists, and headings
    const elements = Array.from(body.querySelectorAll('p, div, li, ol, ul, h1, h2, h3, h4, blockquote, span, em, strong, a'));
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';
      const className = el.className || '';

      // Strip dangerous layout and style attributes causing horizontal overflows
      el.removeAttribute('style');
      if (tagName !== 'table') {
        el.removeAttribute('class');
      }

      // Skip completely empty Word spacing paragraphs
      if ((tagName === 'p' || tagName === 'div') && !text && !el.querySelector('img, table')) {
        el.remove();
        return;
      }

      // Convert Word bullet list paragraphs
      if (tagName === 'p' || tagName === 'div') {
        // Bullet list item (• or - or *)
        if (className.includes('MsoListParagraph') && /^[•·\-\*]\s+/.test(text)) {
          const cleanText = text.replace(/^[•·\-\*]\s+/, '').trim();
          const li = doc.createElement('li');
          li.innerHTML = cleanText;
          
          const prev = el.previousElementSibling;
          if (prev && prev.tagName.toLowerCase() === 'ul') {
            prev.appendChild(li);
            el.remove();
          } else {
            const ul = doc.createElement('ul');
            ul.appendChild(li);
            el.parentNode?.insertBefore(ul, el);
            el.remove();
          }
          return;
        }

        // Numbered list item (e.g. "1. ", "2) ", etc.)
        const numMatch = text.match(/^(\d+)[\.\)]\s+(.*)/s);
        if (numMatch) {
          const li = doc.createElement('li');
          // If inner HTML contains formatting, clean the leading number
          const cleanInner = el.innerHTML.replace(/^\s*(?:<[^>]+>)*\s*\d+[\.\)]\s*/, '');
          li.innerHTML = cleanInner || numMatch[2];
          
          const prev = el.previousElementSibling;
          if (prev && prev.tagName.toLowerCase() === 'ol') {
            prev.appendChild(li);
            el.remove();
          } else {
            const ol = doc.createElement('ol');
            ol.appendChild(li);
            el.parentNode?.insertBefore(ol, el);
            el.remove();
          }
          return;
        }

        // Heading styles
        if (className.includes('Heading1') || className.includes('Title')) {
          const h2 = doc.createElement('h2');
          h2.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(h2, el);
        } else if (className.includes('Heading2') || className.includes('Heading3')) {
          const h3 = doc.createElement('h3');
          h3.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(h3, el);
        }
      }
    });

    // 3. Remove useless empty spans from Word
    body.querySelectorAll('span').forEach((span) => {
      if (!span.attributes.length || span.getAttribute('style')?.includes('font-family')) {
        span.removeAttribute('style');
      }
    });

    return body.innerHTML.trim();
  } catch (e) {
    console.warn('Word HTML cleaner error:', e);
    return rawHtml;
  }
}

function cleanCellInnerHtml(html: string): string {
  // Strip Word font and mso styles inside cell, normalize text
  return html
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .trim() || '-';
}

/**
 * Converts tab-separated text (Word or Excel table copied as plain text)
 * into a clean visual HTML table.
 */
export function convertTabsToHtmlTable(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const tableRows: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.includes('\t')) {
      const cells = line.split('\t').map((c) => c.trim());
      tableRows.push(cells);
    }
  }

  if (tableRows.length < 2) return '';

  const colCount = Math.max(...tableRows.map((r) => r.length));
  if (colCount < 2) return '';

  const headerRow = tableRows[0];
  while (headerRow.length < colCount) headerRow.push('-');

  const headerHtml = `<thead><tr>${headerRow.map((c) => `<th>${c || '-'}</th>`).join('')}</tr></thead>`;
  const bodyRowsHtml = tableRows
    .slice(1)
    .map((row) => {
      while (row.length < colCount) row.push('-');
      return `<tr>${row.map((c) => `<td>${c || '-'}</td>`).join('')}</tr>`;
    })
    .join('');

  return `<table class="fujifinder-table">${headerHtml}<tbody>${bodyRowsHtml}</tbody></table>`;
}

/**
 * Converts Markdown tables and text into clean semantic HTML so they render
 * visually in the WYSIWYG editor without raw pipes or syntax.
 */
export function convertMarkdownOrTextToVisualHtml(content: string | string[]): string {
  const rawText = Array.isArray(content) ? content.filter(Boolean).join('\n\n') : content || '';
  if (!rawText.trim()) return '';

  // If content already contains HTML tags (like <table, <p, <h2), clean and return
  if (/<(table|p|h1|h2|h3|ul|ol|blockquote|div)[\s>]/i.test(rawText)) {
    return cleanWordHtml(rawText);
  }

  // Parse Markdown syntax into HTML
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let inTable = false;
  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length >= 2) {
      // Parse markdown table
      const rows: string[][] = [];
      for (const line of currentTableLines) {
        if (/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(line)) {
          // divider line
          continue;
        }
        const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
        const cells = trimmed.split('|').map((c) => c.trim());
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (rows.length > 0) {
        const maxCols = Math.max(...rows.map((r) => r.length));
        const header = rows[0];
        while (header.length < maxCols) header.push('-');

        const thead = `<thead><tr>${header.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;
        const tbodyRows = rows.slice(1).map((r) => {
          while (r.length < maxCols) r.push('-');
          return `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`;
        });
        const tbody = `<tbody>${tbodyRows.join('')}</tbody>`;

        htmlParts.push(`<table class="fujifinder-table">${thead}${tbody}</table>`);
      }
      currentTableLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is part of a markdown table (| ... |)
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      currentTableLines.push(line);
      continue;
    }

    if (inTable) {
      flushTable();
      inTable = false;
    }

    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      htmlParts.push(`<h3>${formatInlineStyles(line.replace('### ', ''))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      htmlParts.push(`<h2>${formatInlineStyles(line.replace('## ', ''))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      htmlParts.push(`<h1>${formatInlineStyles(line.replace('# ', ''))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      htmlParts.push(`<blockquote>${formatInlineStyles(line.replace('> ', ''))}</blockquote>`);
      continue;
    }

    // Numbered List
    if (/^\d+[\.\)]\s+/.test(line)) {
      const item = line.replace(/^\d+[\.\)]\s+/, '');
      htmlParts.push(`<ol><li>${formatInlineStyles(item)}</li></ol>`);
      continue;
    }

    // Bullet List
    if (/^[•·\-\*]\s+/.test(line)) {
      const item = line.replace(/^[•·\-\*]\s+/, '');
      htmlParts.push(`<ul><li>${formatInlineStyles(item)}</li></ul>`);
      continue;
    }

    // Paragraph
    htmlParts.push(`<p>${formatInlineStyles(line)}</p>`);
  }

  if (inTable) {
    flushTable();
  }

  // Merge consecutive <ul> and <ol> into clean single lists
  const mergedHtml = htmlParts
    .join('\n')
    .replace(/<\/ul>\s*<ul>/gi, '')
    .replace(/<\/ol>\s*<ol>/gi, '');
  return mergedHtml;
}

function formatInlineStyles(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

