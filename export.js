(function () {
  'use strict';

  const DEFAULT_OPTIONS = {
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    lineHeight: 6,
    firstLineIndent: 10,
    numberedFirstLineIndent: 14,
    numberedContinuationIndent: 20,
    bulletFirstLineIndent: 12,
    bulletContinuationIndent: 16,
    indentedFirstLineIndent: 18,
    indentedContinuationIndent: 22,
    indentedSpaceStep: 1,
    fontSizePt: 11
  };

  const PDF_PAGE_WIDTH_MM = 210;
  const PDF_PAGE_HEIGHT_MM = 297;
  const MM_TO_PT = 72 / 25.4;

  const WIN_ANSI_MAP = {
    8364: 128,
    8218: 130,
    402: 131,
    8222: 132,
    8230: 133,
    8224: 134,
    8225: 135,
    710: 136,
    8240: 137,
    352: 138,
    8249: 139,
    338: 140,
    381: 142,
    8216: 145,
    8217: 146,
    8220: 147,
    8221: 148,
    8226: 149,
    8211: 150,
    8212: 151,
    732: 152,
    8482: 153,
    353: 154,
    8250: 155,
    339: 156,
    382: 158,
    376: 159
  };

  function getTranslator(t) {
    if (typeof t === 'function') {
      return t;
    }
    return function (_key, fallback) {
      return fallback || '';
    };
  }

  function mmToPt(mm) {
    return mm * MM_TO_PT;
  }

  function formatNumber(value) {
    const fixed = Number(value || 0).toFixed(2);
    return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }

  function getCharWidthFactor(char) {
    if (!char) return 0;
    if (char === ' ') return 0.278;
    if (char === '\t') return 0.278 * 4;
    if (/[ilI\.,'`:;!\|]/.test(char)) return 0.278;
    if (/[fjrtJ]/.test(char)) return 0.333;
    if (/[mw]/.test(char)) return 0.778;
    if (/[MW@#%&]/.test(char)) return 0.944;
    if (/[A-ZÁÉÍÓÚÄËÏÖÜÀÈÌÒÙÂÊÎÔÛÑÇ]/.test(char)) return 0.667;
    if (/[0-9]/.test(char)) return 0.556;
    if (/[-_]/.test(char)) return 0.333;
    if (/[\(\)\[\]\{\}]/.test(char)) return 0.333;
    return 0.556;
  }

  function getApproxTextWidthMm(text, fontSizePt) {
    let widthFactor = 0;
    const safeText = String(text || '');

    for (const char of safeText) {
      widthFactor += getCharWidthFactor(char);
    }

    return (widthFactor * fontSizePt) / MM_TO_PT;
  }

  function getLineMeta(rawLine, doc, options) {
    const line = String(rawLine || '').replace(/\s+$/, '');
    const leadingSpaces = (line.match(/^\s*/) || [''])[0].length;
    const trimmed = line.trim();

    if (!trimmed) {
      return null;
    }

    const numberedMatch = trimmed.match(/^(\d+\.\-\s+)(.*)$/);
    if (numberedMatch) {
      const prefix = numberedMatch[1];
      const content = numberedMatch[2] || '';
      const prefixWidth = doc.getTextWidth(prefix);
      return {
        kind: 'numbered',
        prefix,
        content,
        firstIndent: options.numberedFirstLineIndent,
        continuationIndent: Math.max(
          options.numberedContinuationIndent,
          options.numberedFirstLineIndent + prefixWidth + 1.5
        ),
        disableJustify: true
      };
    }

    const bulletMatch = trimmed.match(/^(\-\s+)(.*)$/);
    if (bulletMatch) {
      const prefix = bulletMatch[1];
      const content = bulletMatch[2] || '';
      const prefixWidth = doc.getTextWidth(prefix);
      return {
        kind: 'bullet',
        prefix,
        content,
        firstIndent: options.bulletFirstLineIndent,
        continuationIndent: Math.max(
          options.bulletContinuationIndent,
          options.bulletFirstLineIndent + prefixWidth + 1.5
        ),
        disableJustify: true
      };
    }

    if (leadingSpaces > 0) {
      const extraIndent = leadingSpaces * options.indentedSpaceStep;
      return {
        kind: 'indented',
        prefix: '',
        content: trimmed,
        firstIndent: options.indentedFirstLineIndent + extraIndent,
        continuationIndent: options.indentedContinuationIndent + extraIndent,
        disableJustify: true
      };
    }

    return {
      kind: 'paragraph',
      prefix: '',
      content: trimmed,
      firstIndent: options.firstLineIndent,
      continuationIndent: 0,
      disableJustify: false
    };
  }

  function wrapLogicalLine(doc, lineMeta, maxWidth) {
    const words = String(lineMeta.content || '')
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      if (!lineMeta.prefix) {
        return [];
      }
      return [
        {
          prefix: lineMeta.prefix,
          words: [],
          indent: lineMeta.firstIndent,
          disableJustify: lineMeta.disableJustify
        }
      ];
    }

    const lines = [];
    let currentWords = [];
    let isFirstPhysical = true;

    function currentIndent() {
      return isFirstPhysical
        ? lineMeta.firstIndent
        : lineMeta.continuationIndent;
    }

    function currentPrefix() {
      return isFirstPhysical ? lineMeta.prefix : '';
    }

    function pushCurrentLine() {
      if (!currentWords.length) return;
      lines.push({
        prefix: currentPrefix(),
        words: currentWords.slice(),
        indent: currentIndent(),
        disableJustify: lineMeta.disableJustify
      });
      currentWords = [];
      isFirstPhysical = false;
    }

    words.forEach((word) => {
      const prefix = currentPrefix();
      const candidateWords = currentWords.length
        ? currentWords.concat(word)
        : [word];
      const candidateText = `${prefix}${candidateWords.join(' ')}`;
      const availableWidth = maxWidth - currentIndent();
      const candidateWidth = doc.getTextWidth(candidateText);

      if (!currentWords.length || candidateWidth <= availableWidth) {
        currentWords = candidateWords;
        return;
      }

      pushCurrentLine();
      currentWords = [word];
    });

    pushCurrentLine();

    return lines;
  }

  function splitParagraphs(text) {
    const safeText = String(text || '').replace(/\r\n/g, '\n');
    const rawLines = safeText.split('\n');
    const paragraphs = [];
    let currentParagraph = [];

    rawLines.forEach((rawLine) => {
      if (!String(rawLine || '').trim()) {
        if (currentParagraph.length) {
          paragraphs.push(currentParagraph);
          currentParagraph = [];
        }
        return;
      }
      currentParagraph.push(rawLine);
    });

    if (currentParagraph.length) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs;
  }

  function layoutTextToPages(text, userOptions) {
    const options = Object.assign({}, DEFAULT_OPTIONS, userOptions || {});
    const doc = {
      getTextWidth(value) {
        return getApproxTextWidthMm(value, options.fontSizePt);
      }
    };

    const maxWidth = PDF_PAGE_WIDTH_MM - options.marginLeft - options.marginRight;
    const pages = [[]];
    const cursorYRef = { value: options.marginTop };

    function ensurePage() {
      const bottomLimit = PDF_PAGE_HEIGHT_MM - options.marginTop;
      if (cursorYRef.value > bottomLimit) {
        pages.push([]);
        cursorYRef.value = options.marginTop;
      }
    }

    const paragraphs = splitParagraphs(text);

    paragraphs.forEach((paragraphLines) => {
      if (!Array.isArray(paragraphLines) || !paragraphLines.length) {
        return;
      }

      const physicalLines = [];

      paragraphLines.forEach((rawLine) => {
        const lineMeta = getLineMeta(rawLine, doc, options);
        if (!lineMeta) {
          return;
        }
        const wrappedLines = wrapLogicalLine(doc, lineMeta, maxWidth);
        wrappedLines.forEach((wrappedLine) => {
          physicalLines.push(wrappedLine);
        });
      });

      physicalLines.forEach((lineObj) => {
        ensurePage();
        pages[pages.length - 1].push({
          xMm: options.marginLeft + (lineObj.indent || 0),
          yMm: cursorYRef.value,
          text: `${lineObj.prefix || ''}${
            Array.isArray(lineObj.words) ? lineObj.words.join(' ') : ''
          }`
        });
        cursorYRef.value += options.lineHeight;
      });

      cursorYRef.value += options.lineHeight;
    });

    return pages.filter((page, index, list) => page.length > 0 || list.length === 1);
  }

  function normalizePdfText(text) {
    return String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/[‐‑‒–—]/g, '-')
      .replace(/[“”«»]/g, '"')
      .replace(/[‘’‚]/g, "'")
      .replace(/…/g, '...');
  }

  function appendWinAnsiHex(text, out) {
    const normalized = normalizePdfText(text);

    for (const char of normalized) {
      const codePoint = char.codePointAt(0);

      if (Object.prototype.hasOwnProperty.call(WIN_ANSI_MAP, codePoint)) {
        out.push(WIN_ANSI_MAP[codePoint].toString(16).toUpperCase().padStart(2, '0'));
        continue;
      }

      if (codePoint <= 255) {
        out.push(codePoint.toString(16).toUpperCase().padStart(2, '0'));
        continue;
      }

      const fallback = char
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '');

      if (fallback && fallback !== char) {
        appendWinAnsiHex(fallback, out);
        continue;
      }

      out.push('3F');
    }
  }

  function toWinAnsiHex(text) {
    const out = [];
    appendWinAnsiHex(text, out);
    return out.join('');
  }

  function buildPageContentStream(pageLines, options) {
    const commands = [];

    pageLines.forEach((line) => {
      const hexText = toWinAnsiHex(line.text);
      const xPt = mmToPt(line.xMm);
      const yPt = mmToPt(PDF_PAGE_HEIGHT_MM - line.yMm);
      commands.push(
        `BT /F1 ${formatNumber(options.fontSizePt)} Tf 1 0 0 1 ${formatNumber(
          xPt
        )} ${formatNumber(yPt)} Tm <${hexText}> Tj ET`
      );
    });

    return commands.join('\n');
  }

  function buildPdfString(pages, options) {
    const pageWidthPt = mmToPt(PDF_PAGE_WIDTH_MM);
    const pageHeightPt = mmToPt(PDF_PAGE_HEIGHT_MM);
    const contentStreams = pages.map((pageLines) =>
      buildPageContentStream(pageLines, options)
    );

    const objects = {};
    const pageIds = [];
    const contentIds = [];
    let nextId = 4;

    contentStreams.forEach((_content, index) => {
      contentIds[index] = nextId++;
      pageIds[index] = nextId++;
    });

    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = `<< /Type /Pages /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(' ')}] /Count ${pageIds.length} >>`;
    objects[3] =
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

    contentStreams.forEach((content, index) => {
      const contentId = contentIds[index];
      const pageId = pageIds[index];

      objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatNumber(
        pageWidthPt
      )} ${formatNumber(
        pageHeightPt
      )}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    });

    const maxObjectId = nextId - 1;
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    for (let id = 1; id <= maxObjectId; id += 1) {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${maxObjectId + 1}\n`;
    pdf += '0000000000 65535 f \n';

    for (let id = 1; id <= maxObjectId; id += 1) {
      pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return pdf;
  }

  function sanitizeFileNamePart(value, fallback) {
    const safeValue = String(value || '')
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);

    return safeValue || fallback;
  }

  function downloadPdfString(pdfString, fileName) {
    const blob = new Blob([pdfString], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      anchor.remove();
    }, 0);
  }

  function generatePdf(text, data, userOptions) {
    const options = Object.assign({}, DEFAULT_OPTIONS, userOptions || {});
    const t = getTranslator(options.t);

    try {
      const safeText = String(text || '').replace(/\r\n/g, '\n');
      const pages = layoutTextToPages(safeText, options);
      const pdfString = buildPdfString(
        pages.length ? pages : [[]],
        options
      );

      const baseName = sanitizeFileNamePart(
        data && data.fullName,
        'denunciante'
      );
      const countryCode = sanitizeFileNamePart(
        (data && data.countryCode) || options.currentCountry || 'es',
        'es'
      );
      const fileName = `denuncia_laboral_${countryCode}_${baseName}.pdf`;

      downloadPdfString(pdfString, fileName);
      return true;
    } catch (err) {
      console.error('[NoEstásSol@] Error al generar el PDF offline', err);
      window.alert(
        t(
          'pdfErrorNoLib',
          'No se ha podido generar el PDF en este dispositivo. Inténtalo de nuevo.'
        )
      );
      return false;
    }
  }

  window.NoEstasSoloExport = Object.assign({}, window.NoEstasSoloExport, {
    generatePdf
  });
})();