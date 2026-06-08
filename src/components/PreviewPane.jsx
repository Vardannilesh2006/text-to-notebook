import React, { useEffect, useRef, useState } from 'react';
import { renderPage } from '../utils/canvasRenderer';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// 1. NESTED DRAGGABLE SIGNATURE WIDGET (FREE HAND POSITIONING)
function DraggableSignature({ signatureImg, zoom, settings, onUpdateSignaturePosition }) {
  const { signature = {} } = settings;
  const scale = signature.scale || 0.6;
  const isVerified = signature.isVerified || false;

  const originalWidth = signatureImg.naturalWidth || signatureImg.width || 200;
  const originalHeight = signatureImg.naturalHeight || signatureImg.height || 100;

  const sigWidth = originalWidth * scale;
  const sigHeight = originalHeight * scale;

  const rightM = settings.rightMargin || 80;
  const bottomM = settings.bottomMargin || 100;

  // Compute default A4 positions if custom dragging is not yet set
  const defaultA4X = 1240 - rightM - sigWidth;
  const defaultA4Y = 1754 - bottomM - 180;

  const a4X = signature.x !== undefined ? signature.x : defaultA4X;
  const a4Y = signature.y !== undefined ? signature.y : defaultA4Y;

  // Convert to scaled visual coordinates in editor
  const [position, setPosition] = useState({ x: a4X * zoom, y: a4Y * zoom });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync state if settings or zoom scale changes
  useEffect(() => {
    setPosition({ x: a4X * zoom, y: a4Y * zoom });
  }, [signature.x, signature.y, zoom, scale]);

  const handlePointerDown = (e) => {
    if (isVerified) return; // locked
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const clientX = e.clientX;
    const clientY = e.clientY;

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.clientX;
    const clientY = e.clientY;

    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;

    // Boundary constraints: Keep signature inside the visual A4 sheet
    newX = Math.max(0, Math.min(1240 * zoom - sigWidth * zoom, newX));
    newY = Math.max(0, Math.min(1754 * zoom - sigHeight * zoom, newY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // Save final coordinates mapped back to high-res A4 dimensions
    const finalA4X = position.x / zoom;
    const finalA4Y = position.y / zoom;
    onUpdateSignaturePosition(finalA4X, finalA4Y);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${sigWidth * zoom}px`,
        height: `${sigHeight * zoom}px`,
        cursor: isVerified ? 'default' : 'move',
        border: isVerified ? 'none' : '1.5px dashed var(--primary)',
        backgroundColor: isVerified ? 'transparent' : 'rgba(79, 70, 229, 0.08)',
        borderRadius: '4px',
        zIndex: 10,
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      <img
        src={signatureImg.src}
        alt="Signature preview"
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      
      {/* Verify Checkmark Button (Blue Tick overlay) */}
      {!isVerified && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSignaturePosition(a4X, a4Y, true); // Lock/Verify
          }}
          style={{
            position: 'absolute',
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2563EB', // Royal blue
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            zIndex: 15
          }}
          title="Verify and Lock Signature Position"
        >
          <span style={{ fontSize: '0.85rem' }}>✓</span> Verify Placement
        </button>
      )}
    </div>
  );
}

// 2. MAIN PREVIEW CARD & RICH EDITOR
export default function PreviewPane({ 
  pages, 
  settings, 
  signatureImg, 
  customPaperImgObj,
  customFonts,
  onUpdatePageText, 
  onAddPage, 
  onDeletePage, 
  onMovePage, 
  onUpdatePageSettings,
  onUpdateCoverInfo,
  onCleanSpacing,
  onFixCapitalization,
  onFormatAssignment,
  onClearPageText,
  onUpdateGlobalSettings,
  onUpdateSignaturePosition
}) {
  const [zoom, setZoom] = useState(0.38); // 38% visual scaling for editor
  const canvasRefs = useRef([]);
  const textareaRefs = useRef([]);
  const [activePageId, setActivePageId] = useState(pages[0]?.id || null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Search & Replace Panel State
  const [showSearch, setShowSearch] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Resize refs arrays
  canvasRefs.current = canvasRefs.current.slice(0, pages.length);
  textareaRefs.current = textareaRefs.current.slice(0, pages.length);

  // Sync editor HTML from state only when elements are NOT focused
  useEffect(() => {
    pages.forEach((page, index) => {
      const el = textareaRefs.current[index];
      if (el && document.activeElement !== el && el.innerHTML !== page.text) {
        el.innerHTML = page.text;
      }
    });
  }, [pages]);

  // Redraw canvases for all pages
  const drawAllCanvases = () => {
    pages.forEach((page, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        renderPage({
          canvas,
          pageText: page.isCoverPage ? '' : page.text,
          pageData: page,
          settings: {
            ...settings,
            templateType: page.templateType || settings.templateType,
            paperStyle: page.paperStyle || settings.paperStyle
          },
          pageIndex: index,
          totalPages: pages.length,
          signatureImg,
          customPaperImgObj
        });
      }
    });
  };

  useEffect(() => {
    drawAllCanvases();
    if (document.fonts) {
      document.fonts.ready.then(drawAllCanvases);
    }
  }, [pages, settings, signatureImg, customPaperImgObj]);

  // Zoom helpers
  const zoomIn = () => setZoom((prev) => Math.min(1.0, prev + 0.05));
  const zoomOut = () => setZoom((prev) => Math.max(0.25, prev - 0.05));
  const resetZoom = () => setZoom(0.45);

  // Input listener for contenteditable
  const handleInput = (id, e) => {
    onUpdatePageText(id, e.currentTarget.innerHTML);
  };

  // Rich text formatting executors
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    
    // Push the modified HTML of the active page to state
    if (activePageId) {
      const pageIndex = pages.findIndex(p => p.id === activePageId);
      if (pageIndex !== -1) {
        const el = textareaRefs.current[pageIndex];
        if (el) {
          onUpdatePageText(activePageId, el.innerHTML);
        }
      }
    }
  };

  // Adjust Paragraph Line Height (Gap between lines) for selected block
  const adjustBlockLineHeight = (change) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let node = selection.anchorNode;
    // Find the enclosing block element (DIV/P/LI) inside the contenteditable
    while (node && node.parentNode) {
      const parentClass = node.parentNode.className;
      if (parentClass && parentClass.includes('page-editor-area')) {
        break; // Stop before exiting the page container
      }
      if (node.nodeType === 1 && (node.tagName === 'DIV' || node.tagName === 'P' || node.tagName === 'LI')) {
        break;
      }
      node = node.parentNode;
    }

    if (node && node.nodeType === 1) {
      const currentLH = parseInt(node.style.lineHeight) || settings.lineHeight;
      const newLH = Math.max(20, currentLH + change);
      node.style.lineHeight = `${newLH}px`;

      // Sync HTML state
      const pageIndex = pages.findIndex(p => p.id === activePageId);
      if (pageIndex !== -1 && textareaRefs.current[pageIndex]) {
        onUpdatePageText(activePageId, textareaRefs.current[pageIndex].innerHTML);
      }
    }
  };

  // Adjust Word Spacing for selected text range
  const adjustSelectedWordSpacing = (change) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    let currentWS = 0;
    if (range.startContainer.parentNode && range.startContainer.parentNode.style) {
      currentWS = parseInt(range.startContainer.parentNode.style.wordSpacing) || 0;
    }

    const newWS = currentWS + change;
    span.style.wordSpacing = `${newWS}px`;

    try {
      range.surroundContents(span);
    } catch (e) {
      // Handle selections crossing boundaries
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }

    // Sync HTML state
    const pageIndex = pages.findIndex(p => p.id === activePageId);
    if (pageIndex !== -1 && textareaRefs.current[pageIndex]) {
      onUpdatePageText(activePageId, textareaRefs.current[pageIndex].innerHTML);
    }
  };

  // Adjust Letter Spacing for selected text range (SELECTION GAP TOOL)
  const adjustSelectedLetterSpacing = (change) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    let currentLS = 0;
    if (range.startContainer.parentNode && range.startContainer.parentNode.style) {
      currentLS = parseInt(range.startContainer.parentNode.style.letterSpacing) || 0;
    }

    const newLS = currentLS + change;
    span.style.letterSpacing = `${newLS}px`;

    try {
      range.surroundContents(span);
    } catch (e) {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }

    // Sync HTML state
    const pageIndex = pages.findIndex(p => p.id === activePageId);
    if (pageIndex !== -1 && textareaRefs.current[pageIndex]) {
      onUpdatePageText(activePageId, textareaRefs.current[pageIndex].innerHTML);
    }
  };

  // Find and Replace logic across all pages
  const handleFindReplace = () => {
    if (!findText) return;
    let replacedCount = 0;
    
    pages.forEach((page) => {
      if (page.isCoverPage) return;
      if (page.text.includes(findText)) {
        const escapedFind = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedFind, 'g');
        const updated = page.text.replace(regex, replaceText);
        
        onUpdatePageText(page.id, updated);
        replacedCount++;
      }
    });

    alert(`Successfully processed. Replaced occurrences on ${replacedCount} page(s).`);
    setShowSearch(false);
  };

  // Stamp current date at selection focus of active page
  const handleStampDate = () => {
    if (!activePageId) return;
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    executeCommand('insertText', today);
  };

  // Compile PDF
  const exportPDF = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pages.length; i++) {
        const canvas = canvasRefs.current[i];
        if (!canvas) continue;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        if (i < pages.length - 1) pdf.addPage();
      }

      pdf.save('Handwritten-Notebook.pdf');
    } catch (e) {
      console.error(e);
      alert('PDF generation failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export ZIP
  const exportZIP = async (format = 'png') => {
    if (pages.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const extension = format === 'jpg' ? 'jpg' : 'png';
      const quality = format === 'jpg' ? 0.92 : undefined;

      const blobPromises = pages.map((_, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return null;
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            zip.file(`page-${index + 1}.${extension}`, blob);
            resolve();
          }, mimeType, quality);
        });
      });

      await Promise.all(blobPromises.filter(Boolean));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Handwritten-Notebook-Pages-${format.toUpperCase()}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (e) {
      console.error(e);
      alert('ZIP packaging failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // Download Single Page as Image
  const downloadPageAsImage = (index, format = 'jpg') => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    try {
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const extension = format === 'jpg' ? 'jpg' : 'png';
      const quality = format === 'jpg' ? 0.92 : undefined;

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image.');
          return;
        }
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `notebook-page-${index + 1}.${extension}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      }, mimeType, quality);
    } catch (e) {
      console.error(e);
      alert(`Failed to download page as ${format.toUpperCase()}.`);
    }
  };

  // Download Active Page Helper
  const handleDownloadActivePage = (format) => {
    let index = pages.findIndex(p => p.id === activePageId);
    if (index === -1) {
      index = pages.findIndex(p => !p.isCoverPage);
      if (index === -1) index = 0;
    }
    downloadPageAsImage(index, format);
  };

  // Rich palette of inline colors for swatches
  const inlineColors = [
    { name: 'Blue', value: '#1D4ED8' },
    { name: 'Black', value: '#1F2937' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Orange', value: '#EA580C' }
  ];

  return (
    <div className="preview-card glass-card">
      
      {/* 1. MAIN RICH TEXT & DOCUMENT TOOLBAR */}
      <div className="preview-toolbar" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Row 1: Document and Export Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginRight: '5px' }}>📒 Notebook Workspace</span>
            
            {/* GLOBAL TEMPLATE RULES DROPDOWN (INTEGRATED INTO WORKSPACE HEADER) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(79, 70, 229, 0.06)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Default Ruling:</span>
              <select
                className="select-input"
                style={{ width: '130px', padding: '2px 4px', fontSize: '0.75rem', border: 'none', background: 'transparent', fontWeight: 600 }}
                value={settings.templateType || 'ruled'}
                onChange={(e) => onUpdateGlobalSettings('templateType', e.target.value)}
              >
                <option value="ruled">Single Line</option>
                <option value="double">Double Line</option>
                <option value="college">College Ruled</option>
                <option value="exam">Exam Sheet</option>
                <option value="assignment">Assignment</option>
                <option value="practical">Practical Book</option>
                <option value="graph">Graph Paper</option>
                <option value="blank">Blank Page</option>
              </select>
            </div>

            {/* Quick Formatting Cleaners */}
            <button className="btn btn-ai" onClick={() => onCleanSpacing(activePageId)} disabled={!activePageId} title="Clean spacing on active page">
              ✨ Clean Spacing
            </button>
            <button className="btn btn-ai" onClick={() => onFixCapitalization(activePageId)} disabled={!activePageId} title="Fix capitals on active page">
              🔠 Fix Capitalization
            </button>
            <button className="btn btn-ai" onClick={() => onFormatAssignment(activePageId)} disabled={!activePageId} title="Format QA headings on active page">
              📝 Format QA
            </button>
          </div>

          <div className="export-group" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => onAddPage(pages.length - 1)}>
              ➕ Add Page
            </button>
            
            {/* Download Dropdown */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                title="Download single page or all pages as images"
              >
                📥 Download Image <span style={{ fontSize: '0.65rem' }}>▼</span>
              </button>
              
              {showExportDropdown && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, cursor: 'default' }}
                    onClick={() => setShowExportDropdown(false)}
                  />
                  <div className="glass-card" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '240px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Single Page ({pages.findIndex(p => p.id === activePageId) !== -1 ? `Page ${pages.findIndex(p => p.id === activePageId) + 1}` : 'Page 1'})
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        handleDownloadActivePage('jpg');
                        setShowExportDropdown(false);
                      }}
                    >
                      🖼️ Save Page as JPG
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        handleDownloadActivePage('png');
                        setShowExportDropdown(false);
                      }}
                    >
                      🖼️ Save Page as PNG
                    </button>
                    
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                    
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      All Pages (ZIP Bundle)
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        exportZIP('jpg');
                        setShowExportDropdown(false);
                      }}
                      disabled={isExporting}
                    >
                      📦 Download All as JPG (ZIP)
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        exportZIP('png');
                        setShowExportDropdown(false);
                      }}
                      disabled={isExporting}
                    >
                      📦 Download All as PNG (ZIP)
                    </button>
                  </div>
                </>
              )}
            </div>

            <button className="btn btn-primary" onClick={exportPDF} disabled={isExporting}>
              {isExporting ? 'Generating...' : '📄 Download PDF'}
            </button>
          </div>
        </div>

        {/* Row 2: Rich Text & Font Formatting controls (FREE HAND CUSTOMIZER) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px', background: 'rgba(79, 70, 229, 0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>✍️ Selection Style & Gaps Tool:</span>
            
            {/* Bold, Italic, Underline */}
            <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-solid)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', minWidth: '32px', fontWeight: 'bold', border: 'none' }}
                onClick={() => executeCommand('bold')}
                title="Bold"
              >
                B
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', minWidth: '32px', fontStyle: 'italic', border: 'none' }}
                onClick={() => executeCommand('italic')}
                title="Italic"
              >
                I
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', minWidth: '32px', textDecoration: 'underline', border: 'none' }}
                onClick={() => executeCommand('underline')}
                title="Underline"
              >
                U
              </button>
            </div>

            {/* Selection Color Swatches */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {inlineColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => executeCommand('foreColor', c.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: c.value,
                    cursor: 'pointer'
                  }}
                  title={`Change text color to ${c.name}`}
                />
              ))}
            </div>

            {/* Line Heights manual controls */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '5px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Line Gap:</span>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustBlockLineHeight(2)} title="Increase line gap">
                ↕️ +
              </button>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustBlockLineHeight(-2)} title="Decrease line gap">
                ↕️ -
              </button>
            </div>

            {/* Word spacing manual controls */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Word Gap:</span>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustSelectedWordSpacing(1)} title="Increase word gap">
                ↔️ +
              </button>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustSelectedWordSpacing(-1)} title="Decrease word gap">
                ↔️ -
              </button>
            </div>

            {/* Selection Letter spacing adjustments (LETTER GAP SELECTION TOOL) */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>Letter Gap:</span>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustSelectedLetterSpacing(1)} title="Increase letter gap">
                🔤 +
              </button>
              <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem' }} onClick={() => adjustSelectedLetterSpacing(-1)} title="Decrease letter gap">
                🔤 -
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={handleStampDate}>
              📅 Stamp Date
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => setShowSearch(!showSearch)}>
              🔍 Find & Replace
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}
              onClick={() => onClearPageText(activePageId)}
              disabled={!activePageId}
            >
              🧹 Clear Page
            </button>
          </div>

          <div className="zoom-controls">
            <button className="zoom-btn" onClick={zoomOut}>-</button>
            <span className="zoom-level" onClick={resetZoom}>{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={zoomIn}>+</button>
          </div>
        </div>

        {/* Search & Replace Panel */}
        {showSearch && (
          <div className="glass-card" style={{ display: 'flex', gap: '10px', padding: '12px', width: '100%', alignItems: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Find text..." 
              className="text-input" 
              style={{ flex: 1, minWidth: '150px' }}
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Replace with..." 
              className="text-input" 
              style={{ flex: 1, minWidth: '150px' }}
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={handleFindReplace}>
              Replace All
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowSearch(false)}>
              Cancel
            </button>
          </div>
        )}

      </div>

      {/* 2. THE EDITABLE NOTEBOOK PAGES LIST */}
      <div className="pages-container" style={{ padding: '30px 10px', background: 'rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '35px' }}>
        
        {pages.map((page, index) => {
          const displayWidth = 1240 * zoom;
          const displayHeight = 1754 * zoom;

          // Page-specific layout metrics
          const leftM = settings.leftMargin || 120;
          const rightM = settings.rightMargin || 80;
          const topM = settings.topMargin || 140;
          const bottomM = settings.bottomMargin || 100;
          const fSize = settings.fontSize || 24;
          const lHeight = settings.lineHeight || 40;
          const lSpacing = settings.letterSpacing || 0;
          const wSpacing = settings.wordSpacing || 0;
          const inkColor = settings.inkColor || '#1D4ED8';
          const fontFamily = settings.fontFamily || 'Kalam';

          // Shift text top padding on page 1 if assignment header is visible
          const isFirstContentPage = index === 0 || (index === 1 && pages[0].isCoverPage);
          const showHeader = settings.headerInfo.enabled && (isFirstContentPage || settings.headerInfo.everyPage);
          
          // Apply vertical baseline alignment offset to align text perfectly on lines
          const verticalOffset = Number(settings.verticalOffset || 0);
          const textTopPadding = showHeader ? (topM + 180 + verticalOffset) : (topM + verticalOffset);

          const isPageActive = activePageId === page.id;
          const isLastPage = index === pages.length - 1;

          return (
            <div 
              key={page.id}
              className="page-wrapper"
              style={{ 
                width: `${displayWidth}px`, 
                height: `${displayHeight}px`,
                border: isPageActive ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: isPageActive ? '0 15px 35px rgba(79, 70, 229, 0.25)' : '0 10px 25px rgba(0, 0, 0, 0.12)'
              }}
              onClick={() => {
                if (!page.isCoverPage) setActivePageId(page.id);
              }}
            >
              {/* Canvas Background drawing margins and rules */}
              <canvas
                ref={(el) => (canvasRefs.current[index] = el)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
              />

              {/* COVER PAGE INPUT FIELD OVERLAY */}
              {page.isCoverPage ? (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    zIndex: 2,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  <div className="page-badge">Cover Page</div>
                  
                  {/* Institution name input */}
                  <input
                    type="text"
                    value={settings.coverInfo.school || ''}
                    onChange={(e) => onUpdateCoverInfo('school', e.target.value)}
                    placeholder="ENTER INSTITUTION / SCHOOL NAME"
                    style={{
                      position: 'absolute',
                      top: `${205 * zoom}px`,
                      left: '10%',
                      width: '80%',
                      textAlign: 'center',
                      fontSize: `${18 * zoom}px`,
                      fontWeight: 'bold',
                      border: 'none',
                      background: 'rgba(79, 70, 229, 0.04)',
                      outline: 'none',
                      padding: '4px',
                      color: '#1E293B',
                      borderRadius: '4px'
                    }}
                  />

                  {/* Title Input */}
                  <input
                    type="text"
                    value={settings.coverInfo.title || ''}
                    onChange={(e) => onUpdateCoverInfo('title', e.target.value)}
                    placeholder="ENTER TITLE"
                    style={{
                      position: 'absolute',
                      top: `${515 * zoom}px`,
                      left: '5%',
                      width: '90%',
                      textAlign: 'center',
                      fontSize: `${32 * zoom}px`,
                      fontWeight: 'bold',
                      border: 'none',
                      background: 'rgba(79, 70, 229, 0.05)',
                      outline: 'none',
                      padding: '8px',
                      color: 'var(--primary)',
                      borderRadius: '4px'
                    }}
                  />

                  {/* Subtitle Input */}
                  <input
                    type="text"
                    value={settings.coverInfo.subtitle || ''}
                    onChange={(e) => onUpdateCoverInfo('subtitle', e.target.value)}
                    placeholder="Enter subtitle..."
                    style={{
                      position: 'absolute',
                      top: `${592 * zoom}px`,
                      left: '10%',
                      width: '80%',
                      textAlign: 'center',
                      fontSize: `${14 * zoom}px`,
                      border: 'none',
                      background: 'rgba(0,0,0,0.03)',
                      outline: 'none',
                      padding: '4px',
                      color: '#64748B',
                      borderRadius: '4px'
                    }}
                  />

                  {/* Student Info Card Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: `${840 * zoom}px`,
                      left: `${(1240 / 2 - 250) * zoom}px`,
                      width: `${500 * zoom}px`,
                      height: `${340 * zoom}px`,
                      padding: `${20 * zoom}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-evenly',
                      fontSize: `${13 * zoom}px`
                    }}
                  >
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '3px', marginBottom: '3px', color: '#334155' }}>
                      SUBMITTED BY:
                    </div>
                    {['name', 'rollNo', 'class', 'subject', 'date'].map((field) => (
                      <div key={field} style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#475569', minWidth: `${75 * zoom}px` }}>
                          {field === 'rollNo' ? 'Roll No' : field.charAt(0).toUpperCase() + field.slice(1)}:
                        </span>
                        <input
                          type="text"
                          value={settings.coverInfo[field] || ''}
                          onChange={(e) => onUpdateCoverInfo(field, e.target.value)}
                          placeholder={`Enter ${field}...`}
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'rgba(0, 0, 0, 0.02)',
                            outline: 'none',
                            padding: '2px 4px',
                            color: '#334155'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                /* RICH CONTENTEDITABLE EDITOR OVERLAY FOR WRITING PAGES */
                <div
                  ref={(el) => (textareaRefs.current[index] = el)}
                  contentEditable={true}
                  onInput={(e) => handleInput(page.id, e)}
                  onFocus={() => setActivePageId(page.id)}
                  className="page-editor-area"
                  style={{
                    position: 'absolute',
                    left: `${leftM * zoom}px`,
                    top: `${textTopPadding * zoom}px`,
                    width: `${(1240 - leftM - rightM) * zoom}px`,
                    height: `${(1754 - textTopPadding - bottomM) * zoom}px`,
                    fontSize: `${fSize * zoom}px`,
                    lineHeight: `${lHeight * zoom}px`,
                    fontFamily: `"${fontFamily}", cursive`,
                    color: 'transparent',
                    caretColor: inkColor,
                    letterSpacing: `${lSpacing * zoom}px`,
                    wordSpacing: `${wSpacing * zoom}px`,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    zIndex: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    padding: 0,
                    margin: 0,
                    textAlign: 'left'
                  }}
                  aria-label={`Notebook Page ${index + 1}`}
                />
              )}

              {/* FREE HAND DRAGGABLE SIGNATURE WIDGET (ONLY ON THE LAST PAGE OVERLAY) */}
              {isLastPage && settings.signature && settings.signature.enabled && signatureImg && (
                <DraggableSignature 
                  signatureImg={signatureImg}
                  zoom={zoom}
                  settings={settings}
                  onUpdateSignaturePosition={onUpdateSignaturePosition}
                />
              )}

              {/* Page Number Badge */}
              {!page.isCoverPage && (
                <div className="page-badge">Page {index + 1}</div>
              )}

              {/* Floating Page Controls */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '5px' }}>
                
                {/* Individual template overrides */}
                {!page.isCoverPage && (
                  <select
                    value={page.templateType || ''}
                    onChange={(e) => onUpdatePageSettings(page.id, 'templateType', e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.65rem',
                      padding: '3px',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    title="Change template for this page only"
                  >
                    <option value="">Default Rules</option>
                    <option value="ruled">Ruled</option>
                    <option value="double">Double</option>
                    <option value="college">College</option>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="graph">Graph</option>
                    <option value="blank">Blank</option>
                  </select>
                )}

                {/* Download Page as JPG */}
                <button
                  className="btn btn-icon"
                  style={{ width: '32px', height: '22px', fontSize: '0.6rem', fontWeight: 'bold', borderRadius: '4px', backgroundColor: 'rgba(37,99,235,0.15)', color: '#2563EB', borderColor: 'rgba(37,99,235,0.3)', cursor: 'pointer' }}
                  onClick={() => downloadPageAsImage(index, 'jpg')}
                  title="Download this page as JPG"
                >
                  JPG
                </button>

                {/* Download Page as PNG */}
                <button
                  className="btn btn-icon"
                  style={{ width: '32px', height: '22px', fontSize: '0.6rem', fontWeight: 'bold', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', borderColor: 'rgba(16,185,129,0.3)', cursor: 'pointer' }}
                  onClick={() => downloadPageAsImage(index, 'png')}
                  title="Download this page as PNG"
                >
                  PNG
                </button>

                {/* Move Up */}
                <button
                  className="btn btn-icon"
                  style={{ width: '22px', height: '22px', fontSize: '0.6rem', borderRadius: '4px' }}
                  onClick={() => onMovePage(index, 'up')}
                  disabled={index === 0}
                  title="Move page up"
                >
                  ▲
                </button>
                
                {/* Move Down */}
                <button
                  className="btn btn-icon"
                  style={{ width: '22px', height: '22px', fontSize: '0.6rem', borderRadius: '4px' }}
                  onClick={() => onMovePage(index, 'down')}
                  disabled={index === pages.length - 1}
                  title="Move page down"
                >
                  ▼
                </button>

                {/* Delete Page */}
                <button
                  className="btn btn-icon"
                  style={{ width: '22px', height: '22px', fontSize: '0.6rem', borderRadius: '4px', backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                  onClick={() => onDeletePage(page.id)}
                  disabled={pages.length === 1}
                  title="Delete this page"
                >
                  🗑️
                </button>
              </div>

              {/* Bottom Quick Page Addition */}
              <button
                className="btn btn-secondary"
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '3px 8px',
                  fontSize: '0.65rem',
                  zIndex: 25,
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPage(index);
                }}
              >
                ➕ Add Page Below
              </button>

            </div>
          );
        })}

      </div>
    </div>
  );
}
