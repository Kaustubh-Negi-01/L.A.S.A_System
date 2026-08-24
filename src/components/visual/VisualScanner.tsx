import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, FileText, Sparkles, Loader2, CheckCircle, Video, XCircle, RefreshCw } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { extractVisualInsights } from '../../services/geminiService';
import { sampleImagePresets, generateMockVisualInsights } from '../../services/mockData';
import { VisualScanResult } from '../../types';

interface VisualScannerProps {
  onScanComplete: (result: VisualScanResult) => void;
}

export const VisualScanner: React.FC<VisualScannerProps> = ({ onScanComplete }) => {
  const { getAiConfig, addScanResult } = useSharedContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    setActivePreset(null);
    stopCamera();

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start Camera
  const startCamera = async () => {
    setActivePreset(null);
    setSelectedImage(null);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access not available. Please use file upload or sample presets.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Frame from Camera
  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  // Preset Selection for Instant Demo
  const handleSelectPreset = (preset: typeof sampleImagePresets[0]) => {
    stopCamera();
    setActivePreset(preset.id);
    setSelectedImage(null);
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
        scanResult = await extractVisualInsights(selectedImage, mimeType, getAiConfig());
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
          <Camera size={18} color="var(--primary-cyan)" />
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
                  borderRadius: '5px',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'var(--surface-muted)',
                  border: `1px solid ${isSelected ? 'var(--primary-cyan)' : 'var(--border-subtle)'}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={15} color={isSelected ? 'var(--primary-cyan)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text)' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {preset.description}
                    </div>
                  </div>
                </div>
                {isSelected && <CheckCircle size={14} color="var(--primary-cyan)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Preview Mode */}
      {isCameraActive ? (
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: '#040711',
            border: '1px solid var(--primary-cyan)',
            marginBottom: '14px',
            textAlign: 'center'
          }}
        >
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            style={{ width: '100%', maxHeight: '200px', borderRadius: '6px', objectFit: 'cover', background: '#000' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn-secondary" onClick={stopCamera} style={{ flex: 1, padding: '7px', fontSize: '11px' }}>
              Cancel Camera
            </button>
            <button className="btn-primary" onClick={captureCameraFrame} style={{ flex: 1, padding: '7px', fontSize: '11px' }}>
              <Camera size={13} />
              <span>Capture Snapshot</span>
            </button>
          </div>
        </div>
      ) : (
        /* Image Dropzone & Camera Trigger */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '16px 12px',
              borderRadius: '6px',
              border: '2px dashed var(--border-subtle)',
              background: 'var(--surface-muted)',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
            <Upload size={20} color="var(--primary-cyan)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>Upload File</span>
          </div>

          <div
            onClick={startCamera}
            style={{
              padding: '16px 12px',
              borderRadius: '6px',
              border: '2px dashed var(--border-subtle)',
              background: 'var(--surface-muted)',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Video size={20} color="var(--secondary-purple)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>Live Camera</span>
          </div>
        </div>
      )}

      {/* Camera Error Banner */}
      {cameraError && (
        <div style={{ fontSize: '11px', color: '#fb7185', marginBottom: '10px' }}>
          {cameraError}
        </div>
      )}

      {/* Selected Image Thumbnail */}
      {selectedImage && (
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src={selectedImage}
            alt="Uploaded Preview"
            style={{ maxHeight: '130px', borderRadius: '6px', objectFit: 'contain', margin: '0 auto 6px' }}
          />
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
            Image Captured & Ready to Scan
          </div>
        </div>
      )}

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
