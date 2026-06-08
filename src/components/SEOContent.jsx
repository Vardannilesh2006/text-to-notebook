import React, { useState, useEffect } from 'react';

export default function SEOContent({ activeTabOverride, onCloseTab }) {
  const [activeTab, setActiveTab] = useState('none');

  // Sync tab status if overridden from parent (e.g. clicking header link)
  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
      setTimeout(() => {
        const element = document.getElementById('seo-content-view');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeTabOverride]);

  const tabs = [
    { id: 'guide', label: '📖 How to Use' },
    { id: 'about', label: 'About Us' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'disclaimer', label: 'Disclaimer' }
  ];

  const handleTabClick = (tabId) => {
    if (activeTab === tabId) {
      setActiveTab('none');
      if (onCloseTab) onCloseTab();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(tabId);
      if (onCloseTab) onCloseTab(tabId);
      setTimeout(() => {
        const element = document.getElementById('seo-content-view');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="seo-sections" id="seo-section-anchor">
      
      {/* Tab Navigation */}
      <div className="seo-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`seo-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-expanded={activeTab === tab.id}
            aria-controls={`seo-tabpanel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab !== 'none' && (
        <div id="seo-content-view" className="seo-content-card glass-card" role="tabpanel">
          
          {/* HOW TO USE GUIDE PANEL */}
          {activeTab === 'guide' && (
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>📖 How to Use Text to Notebook (Complete A-to-Z Manual)</h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '25px' }}>
                Welcome to <strong>Text to Notebook</strong>! This guide provides detailed instructions on how to use every tool, layout option, and customization feature available on our platform to convert typed digital texts into high-fidelity realistic handwritten pages.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* 1. PRODUCT OVERVIEW */}
                <div style={{ background: 'rgba(79, 70, 229, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h2 style={{ color: 'var(--primary)', marginTop: 0, paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>1. What is Text to Notebook?</h2>
                  <p>
                    Text to Notebook is a client-side web application designed to turn digital typed or pasted text into realistic, handwritten paper sheets. 
                    It is perfect for <strong>students, teachers, assignment creators, and note makers</strong>. By introducing human-like slants, 
                    slight vertical letter jitters, pen pressure variations, and customizable ruled papers, the generated pages look completely organic and natural.
                  </p>
                  <p style={{ marginTop: '10px', fontWeight: 600, color: 'var(--success)' }}>
                    🔒 Privacy Guard: All calculations, handwriting simulations, signature drawing, and exports occur 100% locally in your web browser. No text or signature data ever leaves your device.
                  </p>
                </div>

                {/* 2. FEATURE ALIGNMENT MAP */}
                <div>
                  <h2 style={{ color: 'var(--primary)', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>2. Feature Alignment Map (What & Where)</h2>
                  <p style={{ marginBottom: '15px' }}>Here is where all the tools are located in the interface and what they do:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ padding: '15px', background: 'var(--surface-solid)', borderRadius: '6px', borderLeft: '4px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>💻 Central Notebook Workspace (Main Central Pane)</strong>
                      <ul>
                        <li><strong>Direct Text Typing:</strong> Click directly on the ruled lines of the virtual pages to start writing or paste assignments. No separate textbox is required!</li>
                        <li><strong>Active Page Indicator:</strong> The page you are currently writing on is highlighted with a blue border.</li>
                        <li><strong>Page Rules Overrides (Top Right of Page):</strong> Each page has a floating dropdown to change its line template style individually (e.g. Ruled, Blank, Graph, practical).</li>
                        <li><strong>Page Actions (▲ / ▼ / 🗑️):</strong> Move sheets up, down, or delete sheets using the floating buttons on the page margins.</li>
                        <li><strong>➕ Add Page Below:</strong> Click the badge at the bottom of any sheet to insert a new sheet.</li>
                      </ul>
                    </div>

                    <div style={{ padding: '15px', background: 'var(--surface-solid)', borderRadius: '6px', borderLeft: '4px solid var(--secondary)', boxShadow: 'var(--shadow-sm)' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--secondary)', marginBottom: '5px' }}>🛠️ Top Formatting Toolbar (Top of Workspace)</strong>
                      <ul>
                        <li><strong>Default Rule Style (All Pages):</strong> Dropdown to set default page lines across all pages (Single Line, Double Line, College Ruled, Exam, Assignment, Practical, Graph, Blank).</li>
                        <li><strong>✨ Selection Spacing Gaps Tool:</strong> Highlight text and customize letter spacing, word spacing, or line heights:
                          <ul>
                            <li><strong>Line Gap (↕️ + / ↕️ -):</strong> Adjust spacing between selected lines/paragraphs.</li>
                            <li><strong>Word Gap (↔️ + / ↔️ -):</strong> Expand or compress horizontal gaps between highlighted words.</li>
                            <li><strong>Letter Gap (🔤 + / 🔤 -):</strong> Increase or decrease margins between individual characters.</li>
                          </ul>
                        </li>
                        <li><strong>Swatches:</strong> Colored circles to change ink color (Blue, Black, Red, Green, Purple, Orange) of selected text.</li>
                        <li><strong>Bold / Italic / Underline (B / I / U):</strong> Stylize highlighted text. Underline is drawn as an organic, hand-drawn wavy line!</li>
                        <li><strong>Utility Shortcuts:</strong> Stamp Date (📅), Find & Replace (🔍) words across all sheets, and Clear Page (🧹) contents.</li>
                        <li><strong>Export Group:</strong> "📄 Download PDF" generates a high-DPI printable A4 PDF, and "📦 ZIP Pack" exports all pages as individual PNGs in a zip file.</li>
                      </ul>
                    </div>

                    <div style={{ padding: '15px', background: 'var(--surface-solid)', borderRadius: '6px', borderLeft: '4px solid var(--accent)', boxShadow: 'var(--shadow-sm)' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--accent)', marginBottom: '5px' }}>⚙️ Settings Sidebar (Left Panel)</strong>
                      <ul>
                        <li><strong>✍️ Handwriting & Ink:</strong> Switch between 10 hand styles (Student, Neat Student, Teacher, Fast Notes, Cursive, Vintage Cursive, etc.), global color ink, and ink transparency.</li>
                        <li><strong>📖 Paper & Templates:</strong> Choose global lines template and backing paper texture backgrounds (White, Cream, Old Notebook, Legal Yellow, Vintage).</li>
                        <li><strong>⚙️ Spacing & Layout:</strong> Adjust global size, line height, page margins, slanted rotations, and height jitters. Use the <strong>↕️ Vertical Baseline Shift</strong> slider to align text perfectly on ruling lines!</li>
                        <li><strong>📂 Cover & Header Info:</strong> Toggle a school header block (Name, Roll No, Class, Subject, Date) on pages, or generate a formal, high-res notebook cover page.</li>
                        <li><strong>🔏 Extra Elements:</strong> Set page numbering templates, diagonal watermarks, and enable drawing signature blocks.</li>
                      </ul>
                    </div>

                    <div style={{ padding: '15px', background: 'var(--surface-solid)', borderRadius: '6px', borderLeft: '4px solid var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--success)', marginBottom: '5px' }}>🖋️ Interactive Draggable Signature Widget (Last Page)</strong>
                      <ul>
                        <li><strong>Edit/Create Signature:</strong> Draw on the signature modal canvas with custom colors and brush thickness presets, or upload a transparent signature image PNG.</li>
                        <li><strong>Interactive Positioning:</strong> The signature displays on the final page in a dotted blue box. Drag and reposition it anywhere with your mouse or finger.</li>
                        <li><strong>✓ Verify Placement (Blue Button):</strong> Click this button above the signature to verify it. The dotted outline and button disappear, locking it in place for canvas render.</li>
                        <li><strong>🔓 Reposition Signature (Sidebar):</strong> If locked, click this button in the left panel to reopen positioning.</li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* 3. STEP-BY-STEP WORKFLOW GUIDE */}
                <div>
                  <h2 style={{ color: 'var(--primary)', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>3. Step-by-Step A-to-Z Guide</h2>
                  <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li>
                      <strong>Step 1: Set Up Your Layout:</strong> 
                      Choose your default handwriting style and paper texture (e.g. Cream Paper with Student handwriting style) under <em>Handwriting & Ink</em> and <em>Paper & Templates</em> accordions in the left settings panel.
                    </li>
                    <li>
                      <strong>Step 2: Enter Content Directly:</strong> 
                      Click directly on Page 1 and begin typing. If you need a Cover Page, toggle <em>Include Cover Page</em> in the left panel and type your student details in the provided fields. Add new pages by clicking <strong>➕ Add Page Below</strong> at page bottoms.
                    </li>
                    <li>
                      <strong>Step 3: Align Text sits on ruling lines:</strong> 
                      Due to handwriting font offsets, characters might not sit perfectly on the ruled lines. Adjust the <strong>↕️ Vertical Baseline Shift</strong> slider under <em>Spacing & Layout</em> in the left panel to move the text block vertically until it rests perfectly on top of the blue ruling lines.
                    </li>
                    <li>
                      <strong>Step 4: Stylize Key Phrases & Gaps:</strong> 
                      Highlight any text selection to make it Bold, Italic, Underlined, or change its ink color. If a particular sentence needs more spacing, select the words and click <strong>Word Gap</strong> or <strong>Letter Gap</strong> in the top toolbar to adjust spacing.
                    </li>
                    <li>
                      <strong>Step 5: Sign the Notebook:</strong> 
                      Toggle <em>Enable Signature</em> under <em>Extra Elements</em> in the left panel. Click <em>➕ Create Signature</em> to draw your signature or upload an image. Drag the signature block on the last page to your preferred position and click the <strong>✓ Verify Placement</strong> blue tick button to lock it.
                    </li>
                    <li>
                      <strong>Step 6: Export Your Notebook:</strong> 
                      Check the zoom level, verify all pages look perfect, and click <strong>📄 Download PDF</strong> to generate a print-ready A4 PDF file or click <strong>📦 ZIP Pack</strong> to download high-resolution PNG images.
                    </li>
                  </ol>
                </div>

              </div>
            </div>
          )}

          {/* ABOUT PANEL */}
          {activeTab === 'about' && (
            <div>
              <h1>About Text to Notebook</h1>
              <p>
                <strong>Text to Notebook</strong> is a modern, premium online utility designed to turn digital typed text into beautiful, highly realistic notebook handwriting. 
                Whether you are a student preparing college assignments, a teacher creating worksheets, or a content creator seeking a human touch for digital notes, 
                our platform offers the perfect bridge between digital efficiency and handwritten charm.
              </p>
              <h2>Why Choose Text to Notebook?</h2>
              <p>
                Unlike generic font-rendering sites, Text to Notebook employs a custom <strong>handwriting simulation engine</strong>. 
                It introduces natural writing variances such as subtle word slants, height jitters, ink pressure gradients, and variable spacing. 
                This results in a final page that is visually indistinguishable from natural pen writing.
              </p>
              <h2>Key Features</h2>
              <ul>
                <li><strong>Diverse Styles:</strong> Instantly switch between Student, Neat Student, Teacher, Fast Notes, Cursive, and Elegant handwriting.</li>
                <li><strong>Hindi Language Support:</strong> Unicode compatibility with beautiful handwritten Devanagari script renders.</li>
                <li><strong>Notebook Templates:</strong> Choose from single line, double line, college-ruled, graph paper, and blank page settings.</li>
                <li><strong>High Resolution Exports:</strong> Export pages directly as high-DPI PDFs (ready for printing) or zipped PNG image packs.</li>
                <li><strong>Privacy First:</strong> Built entirely client-side. Your text, document details, and signatures never leave your device.</li>
              </ul>
            </div>
          )}

          {/* FAQ PANEL */}
          {activeTab === 'faq' && (
            <div>
              <h1>Frequently Asked Questions (FAQ)</h1>
              
              <div className="faq-item">
                <h3>Q1: Is my data sent to any server?</h3>
                <p>No. Text to Notebook operates 100% in your browser. All text layout calculations, handwriting rendering, and PDF compile processes occur locally on your machine. Your private documents and signatures are completely secure.</p>
              </div>

              <div className="faq-item">
                <h3>Q2: How do I get my homework/assignment onto the notebook?</h3>
                <p>Simply copy your typed text and paste it into the editor textbox. The notebook preview will update in real-time. You can then download it as a PDF and print it out.</p>
              </div>

              <div className="faq-item">
                <h3>Q3: Does this support Hindi text?</h3>
                <p>Yes, absolutely! The handwriting fonts Kalam and Dekko fully support Hindi and Devanagari unicode. You can write entirely in Hindi or mix English and Hindi words together.</p>
              </div>

              <div className="faq-item">
                <h3>Q4: How can I make the handwriting look more natural?</h3>
                <p>Use the sliders under "Spacing & Layout" to customize the "Writing Effects". Increasing the "Angle Slant", "Vertical Jitter", and "Pen Pressure" sliders introduces organic human errors, preventing the text from looking like a repetitive computer font.</p>
              </div>

              <div className="faq-item">
                <h3>Q5: Can I upload my own signature?</h3>
                <p>Yes. In the "Extra Elements" section, toggle "Enable Signature" and click "Create Signature". You can either draw your signature using your mouse/touchscreen, or upload an image file of your physical signature.</p>
              </div>
            </div>
          )}

          {/* CONTACT PANEL */}
          {activeTab === 'contact' && (
            <div>
              <h1>Contact Us</h1>
              <p>Have suggestions, questions, or want to share feedback? We would love to hear from you! Get in touch using the client contact form below.</p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for your message! This is a client-side demonstration, but in production, this would send an email.');
                  e.target.reset();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '450px', marginTop: '15px' }}
              >
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name</label>
                  <input id="contact-name" type="text" className="text-input" required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input id="contact-email" type="email" className="text-input" required placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-msg">Message</label>
                  <textarea 
                    id="contact-msg" 
                    className="text-editor-area" 
                    required 
                    placeholder="Write your message here..."
                    style={{ height: '100px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Send Message</button>
              </form>
            </div>
          )}

          {/* PRIVACY PANEL */}
          {activeTab === 'privacy' && (
            <div>
              <h1>Privacy Policy</h1>
              <p>Last updated: June 6, 2026</p>
              <p>Your privacy is of utmost importance to us. This Privacy Policy outlines our commitment to security and details why we do not collect your personal data.</p>
              <h2>1. 100% Client-Side Processing</h2>
              <p>We do not operate any backend servers. All activities—including text conversion, canvas calculations, signature drawing, PDF bundling, and ZIP exports—occur entirely inside your web browser. Your inputs are never uploaded to our servers, nor are they shared with third-party services.</p>
              <h2>2. Local Storage</h2>
              <p>To provide a convenient experience, Text to Notebook saves your progress (text inputs and editor settings) in your browser's local storage (`localStorage`). This data stays locally on your device, allowing you to restore your configurations upon page refresh. You can clear this data at any time by clearing your browser cache.</p>
              <h2>3. Cookies and Analytics</h2>
              <p>This application does not use tracking cookies, display advertisements, or utilize aggressive marketing scripts. We believe in providing a clean, distraction-free tool that respects your privacy.</p>
            </div>
          )}

          {/* TERMS PANEL */}
          {activeTab === 'terms' && (
            <div>
              <h1>Terms & Conditions</h1>
              <p>Last updated: June 6, 2026</p>
              <p>By accessing and using the <strong>Text to Notebook</strong> web application, you agree to comply with and be bound by the following terms and conditions:</p>
              <h2>1. Permitted Use</h2>
              <p>You may use this tool for personal, educational, and commercial purposes—such as writing assignments, practicing handwriting styles, designing study templates, or generating notes. You are responsible for ensuring that the generated sheets satisfy the requirements of your institution or recipient.</p>
              <h2>2. Intellectual Property</h2>
              <p>The application interface, source code, and design patterns are the intellectual property of Text to Notebook. The handwriting fonts loaded from Google Fonts are distributed under their respective open-source licenses (SIL Open Font License).</p>
              <h2>3. Disclaimer of Warranty</h2>
              <p>This software is provided "as is", without warranty of any kind, express or implied. The authors shall not be liable for any claims, damages, or liabilities arising from the use of the tool, including academic penalties or misrepresentations.</p>
            </div>
          )}

          {/* DISCLAIMER PANEL */}
          {activeTab === 'disclaimer' && (
            <div>
              <h1>Legal Disclaimer</h1>
              <p>Last updated: June 6, 2026</p>
              <p>The information and tools provided by the <strong>Text to Notebook</strong> web application are for educational, personal, and creative purposes only.</p>
              <h2>1. Academic Integrity and Honesty</h2>
              <p>We do not encourage, condone, or support any form of academic dishonesty, cheating, plagiarism, or misrepresentation. While Text to Notebook generates realistic handwritten homework pages, users are solely responsible for ensuring their usage aligns with the academic honesty policies, guidelines, and rules of their respective schools, colleges, universities, or institutions.</p>
              <h2>2. Digital Signatures</h2>
              <p>The draggable signature feature is provided for creative styling and note personalization. It should not be used to replicate legal signatures or sign official, financial, legal, or government documents. The website owners assume no liability for misuse of this feature.</p>
              <h2>3. Accuracy and Reliability</h2>
              <p>While we strive to provide a realistic simulator, the output pages are computer-generated simulations. We make no guarantees regarding their acceptance by grading authorities or examiners. Use the exports at your own discretion.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
