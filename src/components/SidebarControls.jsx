import React, { useRef } from 'react';

export default function SidebarControls({ 
  settings, 
  onChange, 
  onOpenSignatureModal, 
  hasSignature,
  customFonts = [],
  setCustomFonts
}) {
  const fontFileInputRef = useRef(null);
  const paperFileInputRef = useRef(null);

  const handleSettingChange = (key, value) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    onChange({
      ...settings,
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value
      }
    });
  };

  // Predefined Ink Colors
  const inkColors = [
    { name: 'Blue Ink', value: '#1D4ED8' },
    { name: 'Black Ink', value: '#1F2937' },
    { name: 'Dark Blue Ink', value: '#172554' },
    { name: 'Red Ink', value: '#DC2626' },
    { name: 'Green Ink', value: '#16A34A' }
  ];

  // Predefined Paper Styles
  const paperStyles = [
    { id: 'white', name: 'White' },
    { id: 'cream', name: 'Cream' },
    { id: 'old', name: 'Old Notes' },
    { id: 'yellow', name: 'Yellow Pad' },
    { id: 'vintage', name: 'Vintage' }
  ];

  // Handwriting Styles mapped to Google Fonts
  const handwritingStyles = [
    { id: 'Kalam', name: 'Student Style' },
    { id: 'Patrick Hand', name: 'Neat Student' },
    { id: 'Caveat', name: 'Teacher Style' },
    { id: 'Nothing You Could Do', name: 'Fast Notes' },
    { id: 'Indie Flower', name: 'Exam Writing' },
    { id: 'Amita', name: 'Elegant Writing' },
    { id: 'Dancing Script', name: 'Cursive Style' },
    { id: 'Homemade Apple', name: 'Vintage Cursive' },
    { id: 'Yatra One', name: 'Devanagari Bold' },
    { id: 'Dekko', name: 'Rounded Hand' }
  ];

  // Combined font list including custom uploaded fonts
  const allFonts = [...handwritingStyles, ...customFonts];

  // Handle custom handwriting font upload
  const handleFontUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fontName = 'UploadedFont_' + file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const fontFace = new FontFace(fontName, event.target.result);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);

        // Register custom font
        const newFont = { id: fontName, name: `${file.name.split('.')[0]} (Custom)` };
        setCustomFonts(prev => [...prev, newFont]);

        // Auto select newly uploaded font
        handleSettingChange('fontFamily', fontName);
      } catch (err) {
        alert('Failed to load font. Please ensure it is a valid TTF, OTF, or WOFF file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle custom paper background upload
  const handlePaperUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleSettingChange('customPaperImage', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sidebar-controls" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* CARD 1: HANDWRITING OPTIONS */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">✍️ Handwriting Options</h3>
        
        <div className="form-group">
          <label htmlFor="fontFamily">Handwriting Font</label>
          <select 
            id="fontFamily"
            className="select-input"
            value={settings.fontFamily || 'Kalam'}
            onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
          >
            {allFonts.map((style) => (
              <option key={style.id} value={style.id}>{style.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Upload custom handwriting font <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>(Beta)</span></label>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
            onClick={() => fontFileInputRef.current.click()}
          >
            📂 Choose font file (.ttf/.otf/.woff)
          </button>
          <input
            ref={fontFileInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            style={{ display: 'none' }}
            onChange={handleFontUpload}
          />
        </div>
      </div>

      {/* CARD 2: PAGE & TEXT OPTIONS */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">📝 Page & Text Options</h3>
        
        <div className="form-group">
          <label htmlFor="fontSize">Font Size</label>
          <div className="range-container">
            <input
              id="fontSize"
              type="range"
              min="16"
              max="36"
              value={settings.fontSize || 24}
              onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
            />
            <span className="range-value">{settings.fontSize || 24}px</span>
          </div>
        </div>

        <div className="form-group">
          <label>Ink Color</label>
          <div className="color-grid" style={{ marginTop: '5px' }}>
            {inkColors.map((color) => (
              <button
                key={color.value}
                className={`color-circle ${settings.inkColor === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value, width: '24px', height: '24px' }}
                onClick={() => handleSettingChange('inkColor', color.value)}
                title={color.name}
                aria-label={`Select ink color ${color.name}`}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="inkOpacity">Ink Opacity</label>
          <div className="range-container">
            <input
              id="inkOpacity"
              type="range"
              min="0.4"
              max="1.0"
              step="0.05"
              value={settings.inkOpacity || 0.95}
              onChange={(e) => handleSettingChange('inkOpacity', Number(e.target.value))}
            />
            <span className="range-value">{Math.round((settings.inkOpacity || 0.95) * 100)}%</span>
          </div>
        </div>

        <div className="form-group">
          <label>Paper Style Texture</label>
          <div className="paper-grid" style={{ marginTop: '5px' }}>
            {paperStyles.map((paper) => (
              <div
                key={paper.id}
                className={`paper-option ${settings.paperStyle === paper.id ? 'active' : ''}`}
                onClick={() => handleSettingChange('paperStyle', paper.id)}
              >
                {paper.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 3: SPACING OPTIONS */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">↕️ Spacing Options</h3>

        <div className="form-group">
          <label htmlFor="verticalOffset">↕️ Vertical Baseline Shift (sitting on lines)</label>
          <div className="range-container">
            <input
              id="verticalOffset"
              type="range"
              min="-30"
              max="30"
              value={settings.verticalOffset || 0}
              onChange={(e) => handleSettingChange('verticalOffset', Number(e.target.value))}
            />
            <span className="range-value">{settings.verticalOffset || 0}px</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="wordSpacing">Word Spacing</label>
            <div className="range-container">
              <input
                id="wordSpacing"
                type="range"
                min="-4"
                max="15"
                value={settings.wordSpacing || 0}
                onChange={(e) => handleSettingChange('wordSpacing', Number(e.target.value))}
              />
              <span className="range-value">{settings.wordSpacing || 0}px</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="letterSpacing">Letter Spacing</label>
            <div className="range-container">
              <input
                id="letterSpacing"
                type="range"
                min="-2"
                max="8"
                value={settings.letterSpacing || 0}
                onChange={(e) => handleSettingChange('letterSpacing', Number(e.target.value))}
              />
              <span className="range-value">{settings.letterSpacing || 0}px</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lineHeight">Line Height</label>
            <div className="range-container">
              <input
                id="lineHeight"
                type="range"
                min="30"
                max="65"
                value={settings.lineHeight || 40}
                onChange={(e) => handleSettingChange('lineHeight', Number(e.target.value))}
              />
              <span className="range-value">{settings.lineHeight || 40}px</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="slant">Slant Angle</label>
            <div className="range-container">
              <input
                id="slant"
                type="range"
                min="0"
                max="10"
                value={settings.slant !== undefined ? settings.slant : 3}
                onChange={(e) => handleSettingChange('slant', Number(e.target.value))}
              />
              <span className="range-value">{settings.slant !== undefined ? settings.slant : 3}</span>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="yJitter">Vertical Jitter</label>
            <div className="range-container">
              <input
                id="yJitter"
                type="range"
                min="0"
                max="10"
                value={settings.yJitter !== undefined ? settings.yJitter : 3}
                onChange={(e) => handleSettingChange('yJitter', Number(e.target.value))}
              />
              <span className="range-value">{settings.yJitter !== undefined ? settings.yJitter : 3}</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inkVar">Pen Pressure Jitter</label>
            <div className="range-container">
              <input
                id="inkVar"
                type="range"
                min="0"
                max="10"
                value={settings.inkVar !== undefined ? settings.inkVar : 3}
                onChange={(e) => handleSettingChange('inkVar', Number(e.target.value))}
              />
              <span className="range-value">{settings.inkVar !== undefined ? settings.inkVar : 3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: MARGIN & LINE OPTIONS */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">📏 Margin & Line Options</h3>

        <div className="switch-group">
          <span className="switch-label">Paper Margins (Show red double-lines)</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.showPaperMargins !== false}
              onChange={(e) => handleSettingChange('showPaperMargins', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="switch-group">
          <span className="switch-label">Paper Lines (Show horizontal lines)</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.showPaperLines !== false}
              onChange={(e) => handleSettingChange('showPaperLines', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="form-group" style={{ marginTop: '5px' }}>
          <label>Upload custom paper image background</label>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
            onClick={() => paperFileInputRef.current.click()}
          >
            📂 Choose background image
          </button>
          <input
            ref={paperFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePaperUpload}
          />
          {settings.customPaperImage && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', padding: '6px', color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)', marginTop: '5px' }}
              onClick={() => handleSettingChange('customPaperImage', null)}
            >
              🗑️ Reset to Default Rules
            </button>
          )}
        </div>
      </div>

      {/* CARD 5: COVER & HEADER INFO */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">📂 Cover & Header Info</h3>
        
        <div className="switch-group">
          <span className="switch-label">Include Cover Page</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.hasCoverPage || false}
              onChange={(e) => handleSettingChange('hasCoverPage', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {settings.hasCoverPage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Cover Fields</span>
            <input
              type="text"
              placeholder="School / College Name"
              className="text-input"
              value={settings.coverInfo.school || ''}
              onChange={(e) => handleNestedSettingChange('coverInfo', 'school', e.target.value)}
            />
            <input
              type="text"
              placeholder="Cover Title (e.g. Physics Assignment)"
              className="text-input"
              value={settings.coverInfo.title || ''}
              onChange={(e) => handleNestedSettingChange('coverInfo', 'title', e.target.value)}
            />
            <input
              type="text"
              placeholder="Cover Subtitle"
              className="text-input"
              value={settings.coverInfo.subtitle || ''}
              onChange={(e) => handleNestedSettingChange('coverInfo', 'subtitle', e.target.value)}
            />
            <div className="form-row">
              <input
                type="text"
                placeholder="Student Name"
                className="text-input"
                value={settings.coverInfo.name || ''}
                onChange={(e) => handleNestedSettingChange('coverInfo', 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Roll No"
                className="text-input"
                value={settings.coverInfo.rollNo || ''}
                onChange={(e) => handleNestedSettingChange('coverInfo', 'rollNo', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="switch-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', marginTop: '5px' }}>
          <span className="switch-label">Include Page Header Info</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.headerInfo.enabled || false}
              onChange={(e) => handleNestedSettingChange('headerInfo', 'enabled', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {settings.headerInfo.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Header Fields</span>
            <div className="form-row">
              <input
                type="text"
                placeholder="Name"
                className="text-input"
                value={settings.headerInfo.name || ''}
                onChange={(e) => handleNestedSettingChange('headerInfo', 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Roll No"
                className="text-input"
                value={settings.headerInfo.rollNo || ''}
                onChange={(e) => handleNestedSettingChange('headerInfo', 'rollNo', e.target.value)}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Class"
                className="text-input"
                value={settings.headerInfo.class || ''}
                onChange={(e) => handleNestedSettingChange('headerInfo', 'class', e.target.value)}
              />
              <input
                type="text"
                placeholder="Subject"
                className="text-input"
                value={settings.headerInfo.subject || ''}
                onChange={(e) => handleNestedSettingChange('headerInfo', 'subject', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* CARD 6: EXTRA SETTINGS (SIGNATURE, WATERMARK, PAGE NUMBER) */}
      <div className="customizer-card glass-card">
        <h3 className="customizer-card-title">🔏 Extra Elements</h3>
        
        <div className="switch-group">
          <span className="switch-label">Enable Draggable Signature</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.signature.enabled || false}
              onChange={(e) => handleNestedSettingChange('signature', 'enabled', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {settings.signature.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={onOpenSignatureModal}
            >
              {hasSignature ? '📝 Edit Signature Pad' : '➕ Create Signature'}
            </button>

            {hasSignature && settings.signature && settings.signature.isVerified && (
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}
                onClick={() => handleNestedSettingChange('signature', 'isVerified', false)}
              >
                🔓 Reposition Signature
              </button>
            )}
            
            <div className="form-group">
              <label htmlFor="sigScale">Signature Scale</label>
              <div className="range-container">
                <input
                  id="sigScale"
                  type="range"
                  min="0.3"
                  max="1.2"
                  step="0.05"
                  value={settings.signature.scale || 0.6}
                  onChange={(e) => handleNestedSettingChange('signature', 'scale', Number(e.target.value))}
                />
                <span className="range-value">{Math.round((settings.signature.scale || 0.6) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="switch-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', marginTop: '5px' }}>
          <span className="switch-label">Enable Watermark</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.watermark.enabled || false}
              onChange={(e) => handleNestedSettingChange('watermark', 'enabled', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {settings.watermark.enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="Watermark Text"
              className="text-input"
              value={settings.watermark.text || ''}
              onChange={(e) => handleNestedSettingChange('watermark', 'text', e.target.value)}
            />
            <div className="form-group">
              <label htmlFor="wmOpacity">Watermark Opacity</label>
              <div className="range-container">
                <input
                  id="wmOpacity"
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.01"
                  value={settings.watermark.opacity || 0.08}
                  onChange={(e) => handleNestedSettingChange('watermark', 'opacity', Number(e.target.value))}
                />
                <span className="range-value">{Math.round((settings.watermark.opacity || 0.08) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="switch-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', marginTop: '5px' }}>
          <span className="switch-label">Page Numbering</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.pageNumbering.enabled || false}
              onChange={(e) => handleNestedSettingChange('pageNumbering', 'enabled', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
