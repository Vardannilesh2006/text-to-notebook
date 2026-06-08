/* ==========================================
   TEXT TO NOTEBOOK - CANVAS RENDERER ENGINE (RICH HTML PAGE EDITION)
   ========================================== */

// Standard A4 dimensions at 150 DPI
export const A4_WIDTH = 1240;
export const A4_HEIGHT = 1754;

/**
 * Render a single page onto a Canvas element.
 */
export function renderPage({ canvas, pageText, pageData, settings, pageIndex, totalPages, signatureImg, customPaperImgObj }) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Set high resolution canvas dimensions
  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;

  // Clear canvas
  ctx.clearRect(0, 0, A4_WIDTH, A4_HEIGHT);

  // 1. Draw Paper Background Color & Texture or Custom Background Image
  if (customPaperImgObj) {
    ctx.drawImage(customPaperImgObj, 0, 0, A4_WIDTH, A4_HEIGHT);
  } else {
    const currentPaperStyle = pageData.paperStyle || settings.paperStyle || 'white';
    drawPaperBackground(ctx, currentPaperStyle);
  }

  // 2. Draw Page Margins & Lines Templates
  if (!pageData.isCoverPage) {
    drawNotebookTemplate(ctx, settings, pageIndex, pageData);
  }

  // 3. Draw Watermark if enabled
  if (settings.watermark && settings.watermark.enabled && settings.watermark.text) {
    drawWatermark(ctx, settings.watermark.text, settings.watermark.opacity || 0.08);
  }

  // 4. Render Cover Page or Standard Content
  if (pageData.isCoverPage) {
    drawCoverPage(ctx, settings.coverInfo || {});
  } else {
    // A. Draw Assignment Header (on page 1, or all content pages if configured)
    const isFirstContentPage = pageIndex === 0 || (pageIndex === 1 && settings.hasCoverPage);
    let startY = settings.topMargin || 140;
    
    if (settings.headerInfo && settings.headerInfo.enabled && (isFirstContentPage || settings.headerInfo.everyPage)) {
      drawAssignmentHeader(ctx, settings);
      startY += 180; // offset text start position by header height
    }

    // B. Draw Handwritten Rich HTML Text
    if (pageText) {
      // Add vertical baseline offset to align text on ruled lines
      const verticalOffset = Number(settings.verticalOffset || 0);
      drawHandwrittenRichText(ctx, pageText, startY + verticalOffset, settings);
    }

    // C. Draw Signature if it's the last page and signature is enabled
    const isLastPage = pageIndex === totalPages - 1;
    if (isLastPage && settings.signature && settings.signature.enabled && signatureImg) {
      drawSignature(ctx, signatureImg, settings);
    }
  }

  // 5. Draw Page Numbering if enabled
  if (settings.pageNumbering && settings.pageNumbering.enabled) {
    drawPageNumber(ctx, pageIndex + 1, totalPages, settings.pageNumbering.format || 'Page {x} of {y}');
  }
}

/**
 * Draw paper color background and overlay texturing.
 */
function drawPaperBackground(ctx, style) {
  let bgColor = '#FFFFFF';
  let grainColor = 'rgba(0, 0, 0, 0.015)';
  let vignetteColor = null;

  switch (style) {
    case 'cream':
      bgColor = '#FAF5E6';
      grainColor = 'rgba(0, 0, 0, 0.012)';
      break;
    case 'old':
      bgColor = '#EFE6D5';
      grainColor = 'rgba(120, 90, 40, 0.025)';
      vignetteColor = 'rgba(60, 40, 10, 0.04)';
      break;
    case 'yellow':
      bgColor = '#FEF9C3'; // Legal pad yellow
      grainColor = 'rgba(0, 0, 0, 0.01)';
      break;
    case 'vintage':
      bgColor = '#E3D5C1';
      grainColor = 'rgba(90, 60, 20, 0.035)';
      vignetteColor = 'rgba(40, 20, 0, 0.08)';
      break;
    case 'white':
    default:
      bgColor = '#FFFFFF';
      grainColor = 'rgba(0, 0, 0, 0.015)';
      break;
  }

  // Draw solid base
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

  // Draw Vignette if vintage/old paper
  if (vignetteColor) {
    const gradient = ctx.createRadialGradient(
      A4_WIDTH / 2, A4_HEIGHT / 2, A4_WIDTH / 3,
      A4_WIDTH / 2, A4_HEIGHT / 2, A4_HEIGHT / 1.3
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, vignetteColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);
  }

  // Simulate paper grain/texture using a pattern of noise
  ctx.fillStyle = grainColor;
  for (let i = 0; i < 60000; i++) {
    const x = Math.random() * A4_WIDTH;
    const y = Math.random() * A4_HEIGHT;
    const size = Math.random() * 1.5 + 0.5;
    ctx.fillRect(x, y, size, size);
  }
}

/**
 * Draw notebook templates (Ruled, College, Grid, Blank, etc.)
 */
function drawNotebookTemplate(ctx, settings, pageIndex, pageData) {
  const templateType = pageData.templateType || settings.templateType || 'ruled';
  const {
    lineHeight = 40,
    leftMargin = 120,
    topMargin = 140,
    bottomMargin = 100,
    hasCoverPage = false
  } = settings;

  if (templateType === 'blank') return;

  if (templateType === 'practical') {
    const contentIndex = hasCoverPage ? pageIndex - 1 : pageIndex;
    // Alternate pages are blank in a practical book (even content index is ruled, odd is blank)
    if (contentIndex % 2 === 1) {
      return;
    }
  }

  // Set line properties
  ctx.lineWidth = 1;

  if (templateType === 'graph') {
    // Draw grid mesh
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)'; // Light cyan grid
    const gridSize = 40;
    
    // Vertical lines
    for (let x = 0; x < A4_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, A4_HEIGHT);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y < A4_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(A4_WIDTH, y);
      ctx.stroke();
    }
    return;
  }

  // Draw Ruled / College / Exam styles
  const lineStrokeColor = 'rgba(79, 70, 229, 0.15)'; // Soft blue/indigo ruled lines
  ctx.strokeStyle = lineStrokeColor;

  const startY = topMargin;
  const endY = A4_HEIGHT - bottomMargin;

  // Draw Ruled Horizontal Lines
  if (settings.showPaperLines !== false) {
    for (let y = startY; y <= endY; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(A4_WIDTH, y);
      ctx.stroke();

      // Double lines template
      if (templateType === 'double') {
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, y + 10);
        ctx.lineTo(A4_WIDTH, y + 10);
        ctx.stroke();
        ctx.strokeStyle = lineStrokeColor; // Restore stroke color
      }
    }
  }

  // Draw Vertical Margin Line
  const drawMarginLine = (xPos, strokeColor, isDouble = false) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, A4_HEIGHT);
    ctx.stroke();

    if (isDouble) {
      ctx.beginPath();
      ctx.moveTo(xPos + 5, 0);
      ctx.lineTo(xPos + 5, A4_HEIGHT);
      ctx.stroke();
    }
  };

  const redMarginColor = 'rgba(239, 68, 68, 0.45)'; // Soft pink/red

  if (settings.showPaperMargins !== false) {
    if (templateType === 'ruled' || templateType === 'college' || templateType === 'assignment' || templateType === 'exam' || templateType === 'practical') {
      drawMarginLine(leftMargin - 15, redMarginColor, templateType === 'college' || templateType === 'assignment');
    }

    // Right vertical border line for Exam sheet
    if (templateType === 'exam') {
      const rightMarginX = A4_WIDTH - settings.rightMargin;
      drawMarginLine(rightMarginX + 10, redMarginColor);
    }

    // Draw college-notebook header box (Date / Page card)
    if (templateType === 'college') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(A4_WIDTH - 250, 40, 180, 60);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.font = '14px "Poppins", sans-serif';
      ctx.fillText('DATE:', A4_WIDTH - 240, 62);
      ctx.fillText('PAGE NO:', A4_WIDTH - 240, 88);

      // Dotted lines inside Date/Page
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.moveTo(A4_WIDTH - 190, 62);
      ctx.lineTo(A4_WIDTH - 80, 62);
      ctx.moveTo(A4_WIDTH - 170, 88);
      ctx.lineTo(A4_WIDTH - 80, 88);
      ctx.stroke();
    }

    // Border boxes for Assignment Sheet
    if (templateType === 'assignment') {
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, A4_WIDTH - 60, A4_HEIGHT - 60);
      ctx.strokeRect(36, 36, A4_WIDTH - 72, A4_HEIGHT - 72);
    }
  }
}

/**
 * Draw Assignment Header Metadata at page top
 */
function drawAssignmentHeader(ctx, settings) {
  const { headerInfo, leftMargin = 120, topMargin = 140 } = settings;
  const fontName = settings.fontFamily || 'Kalam';
  
  ctx.save();
  ctx.fillStyle = settings.inkColor || '#1E3A8A';
  
  // Custom font styling for header metadata
  ctx.font = `20px "${fontName}"`;
  
  const drawLineY = topMargin + 10;
  
  const labels = [
    `Name: ${headerInfo.name || ''}`,
    `Roll No: ${headerInfo.rollNo || ''}`,
    `Class: ${headerInfo.class || ''}`,
    `Subject: ${headerInfo.subject || ''}`,
    `Date: ${headerInfo.date || ''}`,
    `Teacher: ${headerInfo.teacher || ''}`
  ];

  // Draw 2-column header layout
  const col1X = leftMargin;
  const col2X = A4_WIDTH / 2 + 50;

  ctx.fillText(labels[0], col1X, drawLineY);
  ctx.fillText(labels[1], col2X, drawLineY);
  
  ctx.fillText(labels[2], col1X, drawLineY + 45);
  ctx.fillText(labels[3], col2X, drawLineY + 45);
  
  ctx.fillText(labels[4], col1X, drawLineY + 90);
  ctx.fillText(labels[5], col2X, drawLineY + 90);

  // Draw separator line under header
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftMargin, drawLineY + 130);
  ctx.lineTo(A4_WIDTH - settings.rightMargin, drawLineY + 130);
  ctx.stroke();

  ctx.restore();
}

/**
 * Parse rich HTML markup and render segments onto the A4 Canvas page
 */
function drawHandwrittenRichText(ctx, pageHtml, startY, settings) {
  const {
    fontFamily = 'Kalam',
    fontSize = 24,
    leftMargin = 120,
    rightMargin = 80,
    bottomMargin = 100,
    lineHeight: globalLineHeight = 40,
    inkColor = '#1D4ED8',
    inkOpacity = 0.95,
    wordSpacing: globalWordSpacing = 0,
    letterSpacing = 0,
    effects = { inkVariation: true, penPressure: true, naturalRandomness: true }
  } = settings;

  const slantFactor = Number(settings.slant !== undefined ? settings.slant : 3) / 10;
  const jitterYFactor = Number(settings.yJitter !== undefined ? settings.yJitter : 3) / 10;
  const inkVarFactor = Number(settings.inkVar !== undefined ? settings.inkVar : 3) / 10;

  // Use the DOM parser to tokenize the HTML structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(pageHtml, 'text/html');
  const body = doc.body;

  // Build a flat linear list of text runs and breaks
  const segments = [];
  
  const collectSegments = (node, currentStyle) => {
    if (node.nodeType === 3) {
      // Text Node
      if (node.nodeValue) {
        segments.push({
          type: 'text',
          text: node.nodeValue,
          style: { ...currentStyle }
        });
      }
    } else if (node.nodeType === 1) {
      // Element Node
      const tagName = node.tagName;
      const localStyle = { ...currentStyle };

      // Tag styling hooks
      if (tagName === 'B' || tagName === 'STRONG') localStyle.bold = true;
      if (tagName === 'I' || tagName === 'EM') localStyle.italic = true;
      if (tagName === 'U') localStyle.underline = true;

      // Extract inline CSS (colors, line spacing overrides, word spacing overrides)
      if (node.style) {
        if (node.style.color) localStyle.color = node.style.color;
        if (node.style.lineHeight) {
          // Parse values like "50px" or "1.5"
          const lh = node.style.lineHeight;
          localStyle.lineHeight = lh.includes('px') ? parseInt(lh) : parseFloat(lh) * globalLineHeight;
        }
        if (node.style.wordSpacing) {
          localStyle.wordSpacing = parseInt(node.style.wordSpacing);
        }
        if (node.style.letterSpacing) {
          localStyle.letterSpacing = parseInt(node.style.letterSpacing);
        }
      }

      if (tagName === 'BR') {
        segments.push({ type: 'break', style: { ...localStyle } });
      } else if (tagName === 'DIV' || tagName === 'P' || tagName === 'LI' || tagName === 'UL' || tagName === 'OL') {
        segments.push({ type: 'break', style: { ...localStyle } });
        for (let i = 0; i < node.childNodes.length; i++) {
          collectSegments(node.childNodes[i], localStyle);
        }
        segments.push({ type: 'break', style: { ...localStyle } });
      } else {
        // Inline tags (span, font, etc)
        for (let i = 0; i < node.childNodes.length; i++) {
          collectSegments(node.childNodes[i], localStyle);
        }
      }
    }
  };

  // Run the segment compiler starting with global defaults
  collectSegments(body, {
    bold: false,
    italic: false,
    underline: false,
    color: inkColor,
    lineHeight: globalLineHeight,
    wordSpacing: globalWordSpacing,
    letterSpacing: letterSpacing
  });

  // Group text segments into paragraphs by splits
  const paragraphs = [];
  let currentParagraph = [];

  segments.forEach((seg) => {
    if (seg.type === 'break') {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(seg);
    }
  });
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }

  // Draw paragraph lines starting at baseline height inside the first line box to align with contentEditable baseline
  let currentY = startY + (globalLineHeight - fontSize) / 2 + fontSize * 0.82;
  const usableWidth = A4_WIDTH - leftMargin - rightMargin;

  for (let p = 0; p < paragraphs.length; p++) {
    const paraSegments = paragraphs[p];
    
    // Default spacing parameters derived from the paragraph container style
    const paraLineHeight = paraSegments[0]?.style?.lineHeight || globalLineHeight;
    const paraWordSpacing = paraSegments[0]?.style?.wordSpacing || globalWordSpacing;

    if (currentY + fontSize > A4_HEIGHT - bottomMargin) break;

    // Convert paragraph segments into stylized word segments
    const wordTokens = [];
    paraSegments.forEach((seg) => {
      // Split by spaces but preserve spaces in array
      const tokens = seg.text.split(/(\s+)/);
      tokens.forEach((tok) => {
        if (tok === '') return;
        wordTokens.push({
          text: tok,
          isSpace: /^\s+$/.test(tok),
          style: seg.style
        });
      });
    });

    let currentLineTokens = [];
    
    // Layout word-wrapping pass on word tokens
    for (let w = 0; w < wordTokens.length; w++) {
      const tok = wordTokens[w];
      
      // Determine font metrics for measurement
      ctx.font = `${tok.style.bold ? 'bold ' : ''}${tok.style.italic ? 'italic ' : ''}${fontSize}px "${fontFamily}"`;
      ctx.letterSpacing = `${letterSpacing}px`;
      
      const testLine = [...currentLineTokens, tok];
      
      // Calculate test line width
      let testLineWidth = 0;
      testLine.forEach((t) => {
        ctx.font = `${t.style.bold ? 'bold ' : ''}${t.style.italic ? 'italic ' : ''}${fontSize}px "${fontFamily}"`;
        const tokLetterSpacing = t.style.letterSpacing !== undefined ? t.style.letterSpacing : letterSpacing;
        ctx.letterSpacing = `${tokLetterSpacing}px`;
        const tokW = ctx.measureText(t.text).width;
        testLineWidth += tokW;
        if (t.isSpace) {
          testLineWidth += Number(t.style.wordSpacing || paraWordSpacing);
        }
      });

      if (testLineWidth > usableWidth && currentLineTokens.length > 0) {
        // Draw current wrapped line
        drawStyledLine(ctx, currentLineTokens, currentY, leftMargin, fontSize, fontFamily, letterSpacing, paraWordSpacing, effects, slantFactor, jitterYFactor, inkVarFactor);
        currentY += paraLineHeight;

        if (currentY + fontSize > A4_HEIGHT - bottomMargin) break;

        // Skip leading space on wrapped lines
        currentLineTokens = tok.isSpace ? [] : [tok];
      } else {
        currentLineTokens = testLine;
      }
    }

    // Draw remaining line tokens
    if (currentLineTokens.length > 0 && currentY + fontSize <= A4_HEIGHT - bottomMargin) {
      drawStyledLine(ctx, currentLineTokens, currentY, leftMargin, fontSize, fontFamily, letterSpacing, paraWordSpacing, effects, slantFactor, jitterYFactor, inkVarFactor);
      currentY += paraLineHeight;
    }
  }

  // Restore defaults
  ctx.globalAlpha = 1.0;
}

/**
 * Draw a single wrapped line composed of stylized tokens
 */
function drawStyledLine(ctx, tokens, yPos, leftMargin, fontSize, fontFamily, letterSpacing, defaultWordSpacing, effects, slantFactor, jitterYFactor, inkVarFactor) {
  let currentX = leftMargin;
  
  let lineSlant = 0;
  if (effects.naturalRandomness) {
    lineSlant = (Math.random() - 0.5) * 0.01 * slantFactor;
  }

  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    
    // Set text style parameters
    ctx.font = `${tok.style.bold ? 'bold ' : ''}${tok.style.italic ? 'italic ' : ''}${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = tok.style.color;
    const tokLetterSpacing = tok.style.letterSpacing !== undefined ? tok.style.letterSpacing : letterSpacing;
    ctx.letterSpacing = `${tokLetterSpacing}px`;

    const tokenWidth = ctx.measureText(tok.text).width;

    if (tok.isSpace) {
      // Space Token: just advance cursor (including space styles)
      const spaceOffset = Number(tok.style.wordSpacing !== undefined ? tok.style.wordSpacing : defaultWordSpacing);
      currentX += tokenWidth + spaceOffset;
      continue;
    }

    // Word Token: Draw text with effects
    ctx.save();
    
    let wordX = currentX;
    let wordY = yPos;

    if (effects.naturalRandomness) {
      const jitterY = (Math.random() - 0.5) * 6 * jitterYFactor;
      wordY += jitterY;

      const jitterX = (Math.random() - 0.5) * 4 * jitterYFactor;
      wordX += jitterX;
    }

    if (effects.inkVariation) {
      const opacityJitter = (Math.random() - 0.5) * 0.15 * inkVarFactor;
      ctx.globalAlpha = Math.max(0.65, Math.min(1.0, ctx.globalAlpha + opacityJitter));
    }

    if (effects.penPressure) {
      const sizeShift = (Math.random() - 0.5) * 1.8 * jitterYFactor;
      ctx.font = `${tok.style.bold ? 'bold ' : ''}${tok.style.italic ? 'italic ' : ''}${fontSize + sizeShift}px "${fontFamily}"`;
    }

    ctx.translate(wordX, wordY);

    let wordSlant = lineSlant;
    if (effects.naturalRandomness) {
      wordSlant += (Math.random() - 0.5) * 0.04 * slantFactor;
    }
    ctx.rotate(wordSlant);

    // Render word text
    ctx.fillText(tok.text, 0, 0);

    // Draw custom hand underline if marked
    if (tok.style.underline) {
      ctx.save();
      ctx.strokeStyle = tok.style.color;
      ctx.lineWidth = Math.max(1, fontSize * 0.05); // proportional line thickness
      
      ctx.beginPath();
      // Draw wavy underline slightly below baseline
      ctx.moveTo(0, 5);
      ctx.lineTo(tokenWidth, 5);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    currentX = wordX + tokenWidth;
  }
}

/**
 * Draw Signature at page end
 */
function drawSignature(ctx, signatureImg, settings) {
  const { signature = {} } = settings;
  const scale = signature.scale || 0.6;

  const originalWidth = signatureImg.naturalWidth || signatureImg.width || 200;
  const originalHeight = signatureImg.naturalHeight || signatureImg.height || 100;

  const sigWidth = originalWidth * scale;
  const sigHeight = originalHeight * scale;

  let signatureX, signatureY;

  // Use custom dragged coordinates if defined
  if (signature.x !== undefined && signature.y !== undefined) {
    signatureX = signature.x;
    signatureY = signature.y;
  } else {
    // Default fallback alignment
    const alignment = signature.alignment || 'right';
    const bottomBoundary = A4_HEIGHT - settings.bottomMargin - 180;
    signatureY = bottomBoundary;

    signatureX = A4_WIDTH - settings.rightMargin - sigWidth;
    if (alignment === 'left') {
      signatureX = settings.leftMargin;
    } else if (alignment === 'center') {
      signatureX = (A4_WIDTH - sigWidth) / 2;
    }
  }

  ctx.save();
  ctx.globalAlpha = settings.inkOpacity || 0.95;
  ctx.drawImage(signatureImg, signatureX, signatureY, sigWidth, sigHeight);
  ctx.restore();
}

/**
 * Draw Watermark diagonally across page center
 */
function drawWatermark(ctx, text, opacity) {
  ctx.save();
  ctx.font = '80px "Poppins", sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.translate(A4_WIDTH / 2, A4_HEIGHT / 2);
  ctx.rotate(-Math.PI / 4);

  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/**
 * Draw Page Number at page bottom
 */
function drawPageNumber(ctx, current, total, format) {
  ctx.save();
  ctx.font = '14px "Poppins", sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.textAlign = 'right';

  const text = format.replace('{x}', current).replace('{y}', total);
  ctx.fillText(text, A4_WIDTH - 80, A4_HEIGHT - 50);
  ctx.restore();
}

/**
 * Draw Cover Page design
 */
function drawCoverPage(ctx, info) {
  const title = info.title || 'ASSIGNMENT';
  const subtitle = info.subtitle || 'Text to Notebook Project';
  const name = info.name || '';
  const rollNo = info.rollNo || '';
  const className = info.class || '';
  const subject = info.subject || '';
  const school = info.school || '';
  const date = info.date || '';

  ctx.save();
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, A4_WIDTH - 100, A4_HEIGHT - 100);

  ctx.strokeStyle = 'rgba(79, 70, 229, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, A4_WIDTH - 120, A4_HEIGHT - 120);

  const drawCornerDecoration = (x, y, dx, dy) => {
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx, y);
    ctx.stroke();
  };

  drawCornerDecoration(80, 80, 60, 60);
  drawCornerDecoration(A4_WIDTH - 80, 80, -60, 60);
  drawCornerDecoration(80, A4_HEIGHT - 80, 60, -60);
  drawCornerDecoration(A4_WIDTH - 80, A4_HEIGHT - 80, -60, -60);

  ctx.fillStyle = '#1E293B';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Poppins", sans-serif';
  ctx.fillText(school.toUpperCase(), A4_WIDTH / 2, 220);

  ctx.strokeStyle = 'rgba(79, 70, 229, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(A4_WIDTH / 2 - 200, 250);
  ctx.lineTo(A4_WIDTH / 2 + 200, 250);
  ctx.stroke();

  ctx.fillStyle = '#4F46E5';
  ctx.font = 'bold 58px "Poppins", sans-serif';
  ctx.fillText(title, A4_WIDTH / 2, 550);

  ctx.fillStyle = '#64748B';
  ctx.font = '24px "Poppins", sans-serif';
  ctx.fillText(subtitle, A4_WIDTH / 2, 610);

  const cardX = A4_WIDTH / 2 - 250;
  const cardY = 850;
  const cardW = 500;
  const cardH = 340;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  
  ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = '#334155';
  ctx.textAlign = 'left';
  ctx.font = '600 20px "Poppins", sans-serif';

  const gap = 48;
  const textStartX = cardX + 50;
  const textStartY = cardY + 65;

  ctx.fillText(`SUBMITTED BY:`, textStartX, textStartY - 25);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(textStartX, textStartY - 15);
  ctx.lineTo(cardX + cardW - 50, textStartY - 15);
  ctx.stroke();

  ctx.font = '500 18px "Poppins", sans-serif';
  ctx.fillText(`Name: ${name}`, textStartX, textStartY + 20);
  ctx.fillText(`Roll No: ${rollNo}`, textStartX, textStartY + 20 + gap);
  ctx.fillText(`Class / Sec: ${className}`, textStartX, textStartY + 20 + gap * 2);
  ctx.fillText(`Subject: ${subject}`, textStartX, textStartY + 20 + gap * 3);
  ctx.fillText(`Date: ${date}`, textStartX, textStartY + 20 + gap * 4);

  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.font = '14px "Poppins", sans-serif';
  ctx.fillText(`© Academic Session 2025-2026`, A4_WIDTH / 2, A4_HEIGHT - 120);

  ctx.restore();
}
