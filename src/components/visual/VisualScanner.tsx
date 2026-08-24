import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Sparkles, Loader2, Image as ImageIcon, CheckCircle, ArrowRight } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { extractVisualInsights } from '../../services/geminiService';
import { sampleImagePresets, generateMockVisualInsights } from '../../services/mockData';
import { VisualScanResult } from '../../types';

interface VisualScannerProps {
  onScanComplete: (result: VisualScanResult) => void;
}

export const VisualScanner: React.FC<VisualScannerProps> = ({ onScanComplete }) => {
  const { customApiKey, addScanResult } = useSharedContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    setActivePreset(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Preset Selection for Instant Demo
  const handleSelectPreset = (preset: typeof sampleImagePresets[0]) => {
    setActivePreset(preset.id);
    setSelectedImage(null); // Simulated image card
  };

  // Scan / Process Action
  const handleProcessScan = async () => {
    setIsScanning(true);
    try {
      let scanResult: VisualScanResult;

      if (activePreset) {
        const presetObj = sampleImagePresets.find(p => p.id === activePreset);
        scanResult = generateMockVisualInsights(presetObj?.imagePromptText);
      } else if (selectedImage) {
        scanResult = await extractVisualInsights(selectedImage, mimeType, customApiKey);
      } else {
        scanResult = generateMockVisualInsights();
      }

      addScanResult(scanResult);
      onScanComplete(scanResult);
    } catch (err) {
      console.error('Visual scanner error:', err);
      const fallback = generateMockVisualInsights();
      addScanResult(fallback);
      onScanComplete(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Camera size={18} color="#00f0ff" />
          <span>Understand & Act (Multimodal Vision)</span>
        </div>
        <span className="badge badge-cyan">Visual Parser</span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Snap or upload any event poster, exam schedule, timetable, or syllabus to automatically extract dates, tasks, and study roadmaps.
      </p>

      {/* Quick Demo Poster Presets */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
          TRY DEMO SAMPLE POSTERS:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sampleImagePresets.map(preset => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? '#00f0ff' : 'var(--border-subtle)'}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={15} color={isSelected ? '#00f0ff' : '#94a3b8'} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#fff' : '#cbd5e1' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {preset.description}
                    </div>
                  </div>
                </div>
                {isSelected && <CheckCircle size={14} color="#00f0ff" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Box / Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '2px dashed var(--border-glow)',
          background: 'rgba(0, 240, 255, 0.03)',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '14px',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {selectedImage ? (
          <div>
            <img
              src={selectedImage}
              alt="Uploaded Preview"
              style={{ maxHeight: '140px', borderRadius: '8px', objectFit: 'contain', margin: '0 auto 8px' }}
            />
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              Image Loaded — Click Scan below
            </div>
          </div>
        ) : (
          <div>
            <Upload size={24} color="#00f0ff" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              Upload Custom Image / Poster
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Supports JPG, PNG, Screenshots & Circulars
            </div>
          </div>
        )}
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessScan}
        disabled={isScanning || (!selectedImage && !activePreset)}
        className="btn-primary"
        style={{ width: '100%' }}
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Analyzing Document with AI Vision...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Extract & Understand (AI)
          </>
        )}
      </button>
    </div>
  );
};
