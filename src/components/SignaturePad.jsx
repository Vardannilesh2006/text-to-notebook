import React, { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onSave, onClose, initialSignature }) {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' or 'upload'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState('#1D4ED8'); // Default Blue ink
  const [strokeHistory, setStrokeHistory] = useState([]);
  const [hasSignature, setHasSignature] = useState(false);

  // Brush Thickness Presets
  const brushPresets = [
    { name: 'Thin Pen', value: 2 },
    { name: 'Medium Pen', value: 3 },
    { name: 'Felt Tip', value: 4 },
    { name: 'Marker', value: 6 }
  ];

  // Signature Ink Colors
  const inkColors = [
    { name: 'Blue', value: '#1D4ED8' },
    { name: 'Black', value: '#1F2937' },
    { name: 'Dark Blue', value: '#172554' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Green', value: '#16A34A' }
  ];

  // Set up drawing context
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasSignature(true);
        };
        img.src = initialSignature;
      }
    }
  }, [activeTab]);

  // Sync stroke color and line width in real-time
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
    }
  }, [strokeColor, lineWidth]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, state]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
    setHasSignature(false);
  };

  const undo = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const lastState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    
    setStrokeHistory((prev) => prev.slice(0, prev.length - 1));
    if (strokeHistory.length === 1) {
      setHasSignature(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onSave(event.target.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) return;

      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">Signature Creator</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <div className="signature-tab-container">
          <div 
            className={`signature-tab ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            Draw Signature
          </div>
          <div 
            className={`signature-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Image
          </div>
        </div>

        {activeTab === 'draw' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Draw Colors & Presets Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              {/* Stroke Ink Colors */}
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ink Color:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {inkColors.map((color) => (
                    <button
                      key={color.value}
                      className={`color-circle ${strokeColor === color.value ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: color.value, 
                        width: '20px', 
                        height: '20px',
                        border: strokeColor === color.value ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)'
                      }}
                      onClick={() => setStrokeColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width Presets */}
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Brush:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {brushPresets.map((preset) => (
                    <button
                      key={preset.value}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '3px 8px', 
                        fontSize: '0.7rem',
                        borderColor: lineWidth === preset.value ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: lineWidth === preset.value ? 'rgba(79, 70, 229, 0.08)' : 'var(--surface-solid)'
                      }}
                      onClick={() => setLineWidth(preset.value)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Drawing box */}
            <canvas
              ref={canvasRef}
              width={450}
              height={200}
              className="signature-canvas-area"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <label style={{ margin: 0 }}>Custom Width:</label>
                <div className="range-container">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                  />
                  <span className="range-value">{lineWidth}px</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={undo} disabled={strokeHistory.length === 0}>
                  Undo
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444' }} onClick={clearCanvas}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="signature-upload-area" onClick={() => document.getElementById('sig-upload').click()}>
            <input
              id="sig-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '8px' }}>📤</div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to browse signature image</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>PNG format with transparent background is recommended</p>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {activeTab === 'draw' && (
            <button className="btn btn-primary" onClick={handleSave} disabled={!hasSignature}>
              Apply Signature
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
