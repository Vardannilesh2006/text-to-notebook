import React, { useState, useEffect } from 'react';
import SidebarControls from './components/SidebarControls';
import PreviewPane from './components/PreviewPane';
import SignaturePad from './components/SignaturePad';
import SEOContent from './components/SEOContent';
import './App.css';

// Default initial text explaining the direct page typing feature in HTML
const DEFAULT_PAGE_HTML = `<div>Dear Student,</div>
<div><br></div>
<div>Welcome to your new <b>interactive rich text handwriting notebook</b>!</div>
<div><br></div>
<div>You can now style text and manage page structures directly on these sheets:</div>
<ul>
  <li>Select any text to apply <span style="color: #dc2626"><b>Bold</b></span>, <i>Italics</i>, or <u>Underline</u>.</li>
  <li>Change ink colors for specific words (like <span style="color: #ea580c">orange</span>, <span style="color: #16a34a">green</span>, or <span style="color: #7c3aed">purple</span>).</li>
  <li>Adjust <b>Line Gaps</b> (↕️+ / ↕️-) to set custom spacing for specific lines.</li>
  <li>Adjust <b>Word Gaps</b> (↔️+ / ↔️-) to manually change spacing between selected words.</li>
  <li>Align your text vertically to sit perfectly on the ruled lines using the <b>Vertical Baseline Shift</b> slider in the sidebar!</li>
</ul>
<div><br></div>
<div>यह हिंदी भाषा का भी पूरा समर्थन करता है। Kalam या Dekko फॉन्ट चुनें और सीधे पेज पर लिखना शुरू करें!</div>
<div><br></div>
<div>Have fun making beautiful assignments!</div>
<div><br></div>
<div>Regards,</div>
<div>Text to Notebook Team</div>`;

// Default Settings
const DEFAULT_SETTINGS = {
  fontFamily: 'Kalam',
  fontSize: 23,
  lineHeight: 40,
  verticalOffset: 0,
  leftMargin: 120,
  rightMargin: 80,
  topMargin: 140,
  bottomMargin: 100,
  wordSpacing: 1,
  letterSpacing: 0,
  slant: 3,
  yJitter: 3,
  inkVar: 3,
  inkColor: '#1D4ED8', // Dark blue ink
  inkOpacity: 0.95,
  paperStyle: 'white',
  templateType: 'ruled',
  hasCoverPage: false,
  coverInfo: {
    school: 'DELHI PUBLIC SCHOOL',
    title: 'SCIENCE RESEARCH JOURNAL',
    subtitle: 'An Analysis of Green Chemistry Principles',
    name: 'Rahul Sharma',
    rollNo: '24',
    class: 'Class XII-C',
    subject: 'Chemistry Project',
    date: '06-07-2026'
  },
  headerInfo: {
    enabled: false,
    name: 'Rahul Sharma',
    rollNo: '24',
    class: 'Class XII-C',
    subject: 'Chemistry',
    date: '06-07-2026',
    teacher: 'Dr. K. S. Sen',
    everyPage: false
  },
  signature: {
    enabled: false,
    alignment: 'right',
    scale: 0.6
  },
  watermark: {
    enabled: false,
    text: 'DRAFT COPY',
    opacity: 0.08
  },
  pageNumbering: {
    enabled: true,
    format: 'Page {x} of {y}'
  },
  effects: {
    inkVariation: true,
    penPressure: true,
    naturalRandomness: true
  },
  showPaperMargins: true,
  showPaperLines: true,
  customPaperImage: null
};

export default function App() {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [signatureImg, setSignatureImg] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [customFonts, setCustomFonts] = useState([]);
  const [customPaperImgObj, setCustomPaperImgObj] = useState(null);

  // Load custom paper background image if defined
  useEffect(() => {
    if (settings.customPaperImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCustomPaperImgObj(img);
      img.src = settings.customPaperImage;
    } else {
      setCustomPaperImgObj(null);
    }
  }, [settings.customPaperImage]);

  // 1. Initial Load: Sync from LocalStorage or use defaults
  useEffect(() => {
    const savedPages = localStorage.getItem('t2n_pages_list');
    const savedSettings = localStorage.getItem('t2n_settings');
    const savedSignature = localStorage.getItem('t2n_signature');
    const savedDarkMode = localStorage.getItem('t2n_darkmode');

    if (savedPages !== null) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        setPages([{ id: '1', text: DEFAULT_PAGE_HTML }]);
      }
    } else {
      setPages([{ id: '1', text: DEFAULT_PAGE_HTML }]);
    }

    if (savedSettings !== null) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    if (savedSignature !== null) {
      setSignatureDataUrl(savedSignature);
    }

    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  // 2. Auto Save: Sync to localStorage
  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem('t2n_pages_list', JSON.stringify(pages));
    }
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('t2n_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (signatureDataUrl) {
      localStorage.setItem('t2n_signature', signatureDataUrl);
    } else {
      localStorage.removeItem('t2n_signature');
    }
  }, [signatureDataUrl]);

  // Load signature image
  useEffect(() => {
    if (signatureDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setSignatureImg(img);
      img.src = signatureDataUrl;
    } else {
      setSignatureImg(null);
    }
  }, [signatureDataUrl]);

  // 3. Toggle Cover Page in Pages list
  useEffect(() => {
    if (pages.length === 0) return;
    
    const hasCover = pages[0].isCoverPage;
    if (settings.hasCoverPage && !hasCover) {
      // Prepend cover page
      setPages(prev => [
        { id: 'cover-' + Date.now(), isCoverPage: true, text: '' },
        ...prev
      ]);
    } else if (!settings.hasCoverPage && hasCover) {
      // Remove cover page
      setPages(prev => prev.filter(p => !p.isCoverPage));
    }
  }, [settings.hasCoverPage]);

  // 4. Page Mutation Callbacks
  const handleUpdatePageText = (id, newText) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, text: newText } : p));
  };

  const handleAddPage = (index) => {
    const newPage = {
      id: 'page-' + Date.now(),
      text: '',
      templateType: '', // inherits global setting
      paperStyle: '' // inherits global setting
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, newPage);
    setPages(updated);
  };

  const handleDeletePage = (id) => {
    if (pages.length === 1) {
      alert("Cannot delete the only page!");
      return;
    }
    
    // If we delete a cover page, turn off the settings checkbox
    const targetPage = pages.find(p => p.id === id);
    if (targetPage && targetPage.isCoverPage) {
      setSettings(prev => ({ ...prev, hasCoverPage: false }));
    }

    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleMovePage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const updated = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setPages(updated);
  };

  const handleUpdatePageSettings = (id, key, value) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const handleUpdateCoverInfo = (key, value) => {
    setSettings(prev => ({
      ...prev,
      coverInfo: {
        ...prev.coverInfo,
        [key]: value
      }
    }));
  };

  // 5. Active Page Formatting Helpers
  const handleCleanSpacing = (pageId) => {
    if (!pageId) return;
    const page = pages.find(p => p.id === pageId);
    if (!page || page.isCoverPage) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(page.text, 'text/html');
    
    // Clean up text node values directly
    const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
      node.nodeValue = node.nodeValue
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*\.\s*/g, '. ')
        .replace(/\s*\?\s*/g, '? ')
        .replace(/\s*!\s*/g, '! ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')');
    }

    handleUpdatePageText(pageId, doc.body.innerHTML);
  };

  const handleFixCapitalization = (pageId) => {
    if (!pageId) return;
    const page = pages.find(p => p.id === pageId);
    if (!page || page.isCoverPage) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(page.text, 'text/html');
    
    const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
      node.nodeValue = node.nodeValue
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
        .replace(/\bi\b/g, 'I');
    }

    handleUpdatePageText(pageId, doc.body.innerHTML);
  };

  const handleFormatAssignment = (pageId) => {
    if (!pageId) return;
    const page = pages.find(p => p.id === pageId);
    if (!page || page.isCoverPage) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(page.text, 'text/html');
    
    const qRegex = /^(q(uestion)?\.?\s*\d*[:.-]?\s*)/i;
    const aRegex = /^(a(nswer)?\.?\s*\d*[:.-]?\s*)/i;

    // Traverse and format block-level elements
    const blocks = doc.body.querySelectorAll('div, p, li');
    if (blocks.length > 0) {
      blocks.forEach(block => {
        let text = block.textContent.trim();
        if (qRegex.test(text)) {
          const match = text.match(qRegex)[0];
          const numMatch = match.match(/\d+/);
          const replacement = numMatch ? `Question ${numMatch[0]}: ` : `Question: `;
          block.innerHTML = block.innerHTML.replace(qRegex, `<b>${replacement}</b>`);
        } else if (aRegex.test(text)) {
          block.innerHTML = block.innerHTML.replace(aRegex, `<b>Ans: </b>`);
        }
      });
    } else {
      // Fallback: format directly if it's flat HTML
      let html = doc.body.innerHTML;
      html = html.replace(qRegex, `<b>Question: </b>`);
      html = html.replace(aRegex, `<b>Ans: </b>`);
      doc.body.innerHTML = html;
    }

    handleUpdatePageText(pageId, doc.body.innerHTML);
  };

  const handleClearPageText = (pageId) => {
    if (!pageId) return;
    if (window.confirm("Are you sure you want to clear this page's text?")) {
      handleUpdatePageText(pageId, '');
    }
  };

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('t2n_darkmode', String(nextDark));
    if (nextDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  };

  // Total word counts
  const totalWords = pages.reduce((acc, p) => {
    if (p.isCoverPage) return acc;
    return acc + (p.text ? p.text.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const totalChars = pages.reduce((acc, p) => {
    if (p.isCoverPage) return acc;
    return acc + (p.text ? p.text.length : 0);
  }, 0);

  const [seoTabOverride, setSeoTabOverride] = useState('none');

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header className="app-header glass-card">
        <div className="brand-section">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => { setSeoTabOverride('none'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span>🖋️</span>
            <span>Text to Notebook</span>
          </div>
          <span className="brand-tagline">Turn Digital Text Into Beautiful Notebook Pages</span>
        </div>

        {/* TOP NAVBAR FOR GUIDE & INFO PAGES */}
        <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 600, color: seoTabOverride === 'none' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => { setSeoTabOverride('none'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            ✏️ Workspace
          </button>
          <button 
            style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 600, color: seoTabOverride === 'guide' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setSeoTabOverride('guide')}
          >
            📖 How to Use
          </button>
          <button 
            style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 600, color: seoTabOverride === 'faq' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setSeoTabOverride('faq')}
          >
            ❓ FAQ
          </button>
          <button 
            style={{ background: 'none', border: 'none', font: 'inherit', fontWeight: 600, color: seoTabOverride === 'about' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setSeoTabOverride('about')}
          >
            ℹ️ About
          </button>
        </nav>

        <div className="header-actions">
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>Words: {totalWords}</span>
            <span>Pages: {pages.length}</span>
          </div>
          
          <button 
            className="btn btn-icon" 
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* DASHBOARD WORKSPACE OR FULL HELP PAGE */}
      {seoTabOverride === 'none' ? (
        <main className="dashboard-grid">
          
          {/* SIDEBAR CUSTOMIZATIONS (LEFT COLUMN) */}
          <aside>
            <SidebarControls
              settings={settings}
              onChange={setSettings}
              onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
              hasSignature={!!signatureDataUrl}
              customFonts={customFonts}
              setCustomFonts={setCustomFonts}
            />
          </aside>

          {/* WORKSPACE CENTRAL (LIVE PAGE EDITOR STACK - RIGHT COLUMN) */}
          <section className="workspace-wrapper">
            <PreviewPane
              pages={pages}
              settings={settings}
              signatureImg={signatureImg}
              customPaperImgObj={customPaperImgObj}
              customFonts={customFonts}
              onUpdatePageText={handleUpdatePageText}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
              onMovePage={handleMovePage}
              onUpdatePageSettings={handleUpdatePageSettings}
              onUpdateCoverInfo={handleUpdateCoverInfo}
              onCleanSpacing={handleCleanSpacing}
              onFixCapitalization={handleFixCapitalization}
              onFormatAssignment={handleFormatAssignment}
              onClearPageText={handleClearPageText}
              onUpdateGlobalSettings={(key, val) => setSettings(prev => ({ ...prev, [key]: val }))}
              onUpdateSignaturePosition={(x, y, isVerified) => setSettings(prev => ({ 
                ...prev, 
                signature: { 
                  ...prev.signature, 
                  x, 
                  y, 
                  isVerified: isVerified !== undefined ? isVerified : prev.signature.isVerified 
                } 
              }))}
            />
          </section>

        </main>
      ) : (
        <main style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className="btn btn-primary"
              onClick={() => { setSeoTabOverride('none'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              ✏️ Back to Notebook Workspace
            </button>
          </div>
          <SEOContent activeTabOverride={seoTabOverride} onCloseTab={() => setSeoTabOverride('none')} />
        </main>
      )}

      {/* SIGNATURE PAD MODAL */}
      {isSignatureModalOpen && (
        <SignaturePad
          onSave={(dataUrl) => {
            setSignatureDataUrl(dataUrl);
            // Reset position lock state on drawing a new signature so it can be repositioned
            setSettings(prev => ({
              ...prev,
              signature: {
                ...prev.signature,
                x: undefined,
                y: undefined,
                isVerified: false
              }
            }));
          }}
          onClose={() => setIsSignatureModalOpen(false)}
          initialSignature={signatureDataUrl}
        />
      )}

      {/* SEO & STATIC PAGES FOOTER TABS (ONLY SHOWN IN WORKSPACE MODE) */}
      {seoTabOverride === 'none' && (
        <SEOContent activeTabOverride={seoTabOverride} onCloseTab={() => setSeoTabOverride('none')} />
      )}

      {/* FOOTER */}
      <footer className="app-footer" style={{ borderTop: '1px solid var(--border)', padding: '30px 20px', marginTop: '4px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '15px', fontSize: '0.85rem' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>About Us</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>How to Use</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>FAQ</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Contact Us</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Privacy Policy</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Terms & Conditions</button>
          <span style={{ color: 'var(--text-light)' }}>•</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }} onClick={() => { setSeoTabOverride('disclaimer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Disclaimer</button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
          © 2026 <a href="/" onClick={(e) => { e.preventDefault(); setSeoTabOverride('none'); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Text to Notebook</a>. Built entirely client-side. Your data is 100% secure.
        </p>
      </footer>

    </div>
  );
}
