import React, { useState } from 'react';
import { Camera, FileText, ArrowUpRight, History, Sparkles } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { VisualScanner } from './VisualScanner';
import { ExtractedInsights } from './ExtractedInsights';
import { VisualScanResult } from '../../types';

interface VisualHubProps {
  onNavigateToStudy: () => void;
  onNavigateToProductivity: () => void;
}

export const VisualHub: React.FC<VisualHubProps> = ({
  onNavigateToStudy,
  onNavigateToProductivity
}) => {
  const { scans } = useSharedContext();
  const [currentScan, setCurrentScan] = useState<VisualScanResult | null>(scans[0] || null);
  const [isScanningMode, setIsScanningMode] = useState<boolean>(!scans[0]);

  const handleScanComplete = (result: VisualScanResult) => {
    setCurrentScan(result);
    setIsScanningMode(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(208, 138, 103, 0.08) 0%, rgba(166, 178, 123, 0.08) 100%)',
          borderColor: 'rgba(208, 138, 103, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-cyan)', letterSpacing: '0.8px' }}>
            MULTIMODAL UNDERSTAND & ACT
          </span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            One-touch scan converts posters into actionable study plans & tasks.
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsScanningMode(true)}
          style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '5px' }}
        >
          <Camera size={13} />
          <span>New Scan</span>
        </button>
      </div>

      {/* Main Content: Scanner or Active Insights */}
      {isScanningMode || !currentScan ? (
        <VisualScanner onScanComplete={handleScanComplete} />
      ) : (
        <ExtractedInsights
          scan={currentScan}
          onNavigateToStudy={onNavigateToStudy}
          onNavigateToProductivity={onNavigateToProductivity}
          onScanAnother={() => setIsScanningMode(true)}
        />
      )}

      {/* Recent Scans List */}
      {scans.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} color="#d08a67" />
              RECENT VISUAL SCANS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scans.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentScan(s);
                  setIsScanningMode(false);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '5px',
                  background: s.id === currentScan?.id ? 'rgba(208, 138, 103, 0.08)' : 'var(--surface-muted)',
                  border: `1px solid ${s.id === currentScan?.id ? '#d08a67' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={14} color="#d08a67" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{s.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {s.extractedDates[0] ? `Date: ${s.extractedDates[0]}` : 'No date detected'}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={14} color="var(--text-dim)" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
