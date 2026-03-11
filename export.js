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
    indentedSpaceStep: 1
  };

  function getTranslator(t) {
    if (typeof t === 'function') {
      return t;
    }
    return function (_key, fallback) {
      return fallback || '';
    };
  }

  function getPageWidth(doc) {
    return typeof doc.internal.pageSize.getWidth === 'function'
      ? doc.internal.pageSize.getWidth()
      : doc.internal.pageSize.width || 210;
  }

  function getPageHeight(doc) {
    return typeof doc.internal.pageSize.getHeight === 'function'
      ? doc.internal.pageSize.getHeight()
      : doc.internal.pageSize.height || 297;
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

  function drawLine(doc, lineObj, config) {
    const words = Array.isArray(lineObj.words) ? lineObj.words : [];
    const prefix = lineObj.prefix || '';
    const indentMm = lineObj.indent || 0;
    const xStart = config.marginLeft + indentMm;
    const availableWidth = config.maxWidth - indentMm;
    const textLine = `${prefix}${words.join(' ')}`;
    const textWidth = doc.getTextWidth(textLine);
    const gaps = words.length > 1 ? words.length - 1 : 0;
    const shouldJustify =
      !lineObj.disableJustify &&
      !config.isLastInParagraph &&
      gaps > 0 &&
      textWidth > 0 &&
      textWidth < availableWidth;

    if (!shouldJustify) {
      doc.text(textLine, xStart, config.cursorYRef.value);
      config.cursorYRef.value += config.lineHeight;
      return;
    }

    const extraSpaceTotal = availableWidth - textWidth;
    const baseSpaceWidth = doc.getTextWidth(' ');
    const extraPerGap = extraSpaceTotal / gaps;
    const gapWidth =
      baseSpaceWidth + (isFinite(extraPerGap) ? extraPerGap : 0);

    let x = xStart;

    if (prefix) {
      doc.text(prefix, x, config.cursorYRef.value);
      x += doc.getTextWidth(prefix);
    }

    words.forEach((word, index) => {
      doc.text(word, x, config.cursorYRef.value);
      if (index < gaps) {
        x += doc.getTextWidth(word) + gapWidth;
      }
    });

    config.cursorYRef.value += config.lineHeight;
  }

  function generatePdf(text, data, userOptions) {
    const options = Object.assign({}, DEFAULT_OPTIONS, userOptions || {});
    const t = getTranslator(options.t);

    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.alert(
        t(
          'pdfErrorNoLib',
          'No se ha podido inicializar el generador de PDF. Comprueba tu conexión o vuelve a intentarlo.'
        )
      );
      return false;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = getPageWidth(doc);
    const pageHeight = getPageHeight(doc);
    const maxWidth = pageWidth - options.marginLeft - options.marginRight;
    const cursorYRef = { value: options.marginTop };

    doc.setFont('Helvetica', '');
    doc.setFontSize(11);

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

    function ensurePage() {
      const bottomLimit = pageHeight - options.marginTop;
      if (cursorYRef.value > bottomLimit) {
        doc.addPage();
        cursorYRef.value = options.marginTop;
      }
    }

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

      physicalLines.forEach((lineObj, index) => {
        ensurePage();
        drawLine(doc, lineObj, {
          marginLeft: options.marginLeft,
          maxWidth,
          lineHeight: options.lineHeight,
          cursorYRef,
          isLastInParagraph: index === physicalLines.length - 1
        });
      });

      cursorYRef.value += options.lineHeight;
    });

    const baseName =
      data && data.fullName
        ? data.fullName.trim().replace(/\s+/g, '_').slice(0, 40)
        : 'denunciante';
    const countryCode =
      (data && data.countryCode) || options.currentCountry || 'es';
    const fileName = `denuncia_laboral_${countryCode}_${baseName || 'trabajo'}.pdf`;

    doc.save(fileName);
    return true;
  }

  window.NoEstasSoloExport = Object.assign({}, window.NoEstasSoloExport, {
    generatePdf
  });
})();