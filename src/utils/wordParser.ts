/**
 * Utility for parsing content copied from Microsoft Word, Google Docs, or Web Pages
 * into clean, beautifully structured Markdown with intact tables, headings, and paragraphs.
 */

/**
 * Converts HTML from Word / Docs clipboard into clean Markdown
 */
export function convertWordHtmlToMarkdown(html: string): string {
  try {
    const parser = new DOMParser();
    // Clean out Mso comment blocks and XML headers first
    const sanitizedHtml = html
      .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
      .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
      .replace(/<\/?w:[^>]*>/gi, '')
      .replace(/<\/?m:[^>]*>/gi, '');

    const doc = parser.parseFromString(sanitizedHtml, 'text/html');
    const body = doc.body;

    const blocks: string[] = [];

    // Helper: clean inline formatting (bold, italic, links)
    const cleanInline = (node: Node): string => {
      let result = '';
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          result += child.textContent || '';
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          const innerText = cleanInline(el);

          if (!innerText.trim() && tagName !== 'br') return;

          switch (tagName) {
            case 'strong':
            case 'b':
              result += ` **${innerText.trim()}** `;
              break;
            case 'em':
            case 'i':
              result += ` *${innerText.trim()}* `;
              break;
            case 'u':
              result += ` _${innerText.trim()}_ `;
              break;
            case 'code':
              result += ` \`${innerText.trim()}\` `;
              break;
            case 'a': {
              const href = el.getAttribute('href');
              result += href ? ` [${innerText.trim()}](${href}) ` : innerText;
              break;
            }
            case 'br':
              result += '\n';
              break;
            default:
              result += innerText;
              break;
          }
        }
      });
      // Normalize multiple spaces
      return result.replace(/[ \t]+/g, ' ');
    };

    // Helper: convert <table> to Markdown table
    const parseTable = (tableEl: HTMLTableElement): string => {
      const rows: string[][] = [];
      const trElements = tableEl.querySelectorAll('tr');

      trElements.forEach((tr) => {
        const rowCells: string[] = [];
        const cells = tr.querySelectorAll('th, td');
        cells.forEach((cell) => {
          // Replace newlines inside cell with <br/> or space so table structure doesn't break
          const text = cleanInline(cell)
            .replace(/\r?\n+/g, ' ')
            .replace(/\|/g, '\\|')
            .trim();
          rowCells.push(text || '-');
        });
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });

      if (rows.length === 0) return '';

      // Determine max columns
      const colCount = Math.max(...rows.map((r) => r.length));
      if (colCount === 0) return '';

      // Pad rows to colCount
      const normalizedRows = rows.map((r) => {
        const padded = [...r];
        while (padded.length < colCount) {
          padded.push('-');
        }
        return padded;
      });

      // Build header row
      const headerRow = normalizedRows[0];
      const headerLine = `| ${headerRow.join(' | ')} |`;
      const dividerLine = `| ${headerRow.map(() => '---').join(' | ')} |`;

      // Build data rows
      const dataLines = normalizedRows.slice(1).map((r) => `| ${r.join(' | ')} |`);

      if (dataLines.length === 0) {
        return `${headerLine}\n${dividerLine}`;
      }

      return `${headerLine}\n${dividerLine}\n${dataLines.join('\n')}`;
    };

    // Process all top-level elements
    const traverseNodes = (container: HTMLElement) => {
      Array.from(container.children).forEach((child) => {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // 1. Table from Word
        if (tag === 'table') {
          const mdTable = parseTable(el as HTMLTableElement);
          if (mdTable) blocks.push(mdTable);
          return;
        }

        // 2. Headings
        if (tag === 'h1' || tag === 'h2') {
          const text = cleanInline(el).trim();
          if (text) blocks.push(`## ${text}`);
          return;
        }

        if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
          const text = cleanInline(el).trim();
          if (text) blocks.push(`### ${text}`);
          return;
        }

        // 3. Lists
        if (tag === 'ul') {
          const items: string[] = [];
          el.querySelectorAll('li').forEach((li) => {
            const itemText = cleanInline(li).trim();
            if (itemText) items.push(`- ${itemText}`);
          });
          if (items.length > 0) blocks.push(items.join('\n'));
          return;
        }

        if (tag === 'ol') {
          const items: string[] = [];
          el.querySelectorAll('li').forEach((li, idx) => {
            const itemText = cleanInline(li).trim();
            if (itemText) items.push(`${idx + 1}. ${itemText}`);
          });
          if (items.length > 0) blocks.push(items.join('\n'));
          return;
        }

        // 4. Blockquote
        if (tag === 'blockquote') {
          const text = cleanInline(el).trim();
          if (text) blocks.push(`> ${text}`);
          return;
        }

        // 5. Paragraphs or Divs
        if (tag === 'p' || tag === 'div') {
          // Check if Word encoded a list paragraph
          const className = el.className || '';
          const text = cleanInline(el).trim();
          if (!text) return;

          if (className.includes('MsoListParagraph') || /^[•·\-\*]\s+/.test(text)) {
            const cleanBullet = text.replace(/^[•·\-\*]\s+/, '').trim();
            blocks.push(`- ${cleanBullet}`);
            return;
          }

          // Check if paragraph is actually a heading style in Word
          if (className.includes('Heading1') || className.includes('Title')) {
            blocks.push(`## ${text}`);
            return;
          }
          if (className.includes('Heading2') || className.includes('Heading3')) {
            blocks.push(`### ${text}`);
            return;
          }

          blocks.push(text);
          return;
        }

        // Nested containers (e.g. section, article)
        if (el.children.length > 0) {
          traverseNodes(el);
        } else {
          const text = cleanInline(el).trim();
          if (text) blocks.push(text);
        }
      });
    };

    traverseNodes(body);

    // If no blocks were created (e.g. fragment was just text or flat elements)
    if (blocks.length === 0 && body.textContent?.trim()) {
      return autoFormatArticleText(body.textContent.trim());
    }

    return blocks.join('\n\n');
  } catch (err) {
    console.warn('Word HTML parser error, falling back to text:', err);
    return '';
  }
}

/**
 * Formats plain text paste, handling tab-separated tables from Word/Excel
 * and single-linebreak paragraph separation.
 */
export function cleanPlainTextWordPaste(rawText: string): string {
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const resultBlocks: string[] = [];
  let currentTableRows: string[][] = [];

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const colCount = Math.max(...currentTableRows.map((r) => r.length));
      if (colCount >= 2) {
        const header = currentTableRows[0];
        while (header.length < colCount) header.push('-');
        const headerLine = `| ${header.join(' | ')} |`;
        const dividerLine = `| ${header.map(() => '---').join(' | ')} |`;
        const dataLines = currentTableRows.slice(1).map((r) => {
          while (r.length < colCount) r.push('-');
          return `| ${r.join(' | ')} |`;
        });
        resultBlocks.push([headerLine, dividerLine, ...dataLines].join('\n'));
      } else {
        currentTableRows.forEach((r) => resultBlocks.push(r.join(' ')));
      }
      currentTableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line contains tabs (Word/Excel copied table)
    if (line.includes('\t')) {
      const cells = line.split('\t').map((c) => c.trim()).filter((c) => c.length > 0);
      if (cells.length >= 2) {
        currentTableRows.push(cells);
        continue;
      }
    }

    // Not a table line, flush pending table
    flushTable();

    if (!line) {
      // Empty line is a natural paragraph boundary
      continue;
    }

    resultBlocks.push(line);
  }

  flushTable();

  return autoFormatArticleText(resultBlocks.join('\n\n'));
}

/**
 * Intelligent paragraph & structure cleaner:
 * Ensures paragraphs have clean blank lines (\n\n),
 * fixes collapsed single-line paragraphs, and keeps markdown tables intact.
 */
export function autoFormatArticleText(text: string): string {
  if (!text) return '';

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawSections = normalized.split(/\n{2,}/);

  const cleanSections: string[] = [];

  rawSections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    // If section contains a Markdown table (starts with |), keep its internal lines together!
    if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
      cleanSections.push(trimmed);
      return;
    }

    // Check if section is a list of lines with single newlines
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
      // Check if lines are all list items (starting with - or * or number)
      const isList = lines.every((l) => /^\s*([•·\-\*]|\d+\.)\s+/.test(l));
      if (isList) {
        cleanSections.push(trimmed);
        return;
      }

      // Check if lines look like separate paragraphs that got glued together by single \n
      // (e.g. from Word copy where Word put \r\n instead of double linebreaks)
      let currentParagraph = '';
      lines.forEach((line) => {
        const l = line.trim();
        if (!l) return;

        // If line is a heading or list item, treat as separate block
        if (l.startsWith('#') || /^\s*([•·\-\*]|\d+\.)\s+/.test(l)) {
          if (currentParagraph) {
            cleanSections.push(currentParagraph.trim());
            currentParagraph = '';
          }
          cleanSections.push(l);
          return;
        }

        // If previous line ends with sentence punctuation (. ! ?) and this line starts with capital letter,
        // it's likely a distinct paragraph from Word
        if (currentParagraph) {
          const prevEndsWithPeriod = /[.!?:"']$/.test(currentParagraph.trim());
          const nextStartsWithCapital = /^[A-Z0-9"']/.test(l);

          if (prevEndsWithPeriod && nextStartsWithCapital && currentParagraph.length > 40) {
            cleanSections.push(currentParagraph.trim());
            currentParagraph = l;
            return;
          }
          currentParagraph += ' ' + l;
        } else {
          currentParagraph = l;
        }
      });

      if (currentParagraph) {
        cleanSections.push(currentParagraph.trim());
      }
    } else {
      cleanSections.push(trimmed);
    }
  });

  return cleanSections.join('\n\n');
}
