import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ListTodo,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VisualScanResult } from '../../types';
import { useSharedContext } from '../../context/SharedContext';

interface ExtractedInsightsProps {
  scan: VisualScanResult;
  onNavigateToStudy: () => void;
  onNavigateToProductivity: () => void;
  onScanAnother: () => void;
}

export const ExtractedInsights: React.FC<ExtractedInsightsProps> = ({
  scan,
  onNavigateToStudy,
  onNavigateToProductivity,
  onScanAnother
}) => {
  const { dispatchScanToApp } = useSharedContext();
  const [dispatchResult, setDispatchResult] = useState<{
    dispatched: boolean;
    addedTasks: number;
    addedEvents: number;
    planCreated: boolean;
  }>({ dispatched: false, addedTasks: 0, addedEvents: 0, planCreated: false });

  const handleDispatchAll = () => {
    const res = dispatchScanToApp(scan);
    setDispatchResult({
      dispatched: true,
      addedTasks: res.addedTasks,
      addedEvents: res.addedEvents,
      planCreated: res.planCreated
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const primaryEvent = scan.extractedEvents[0];
  const wasAlreadyInSync = dispatchResult.dispatched
    && dispatchResult.addedTasks === 0
    && dispatchResult.addedEvents === 0
    && !dispatchResult.planCreated;

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Sparkles size={18} color="#d08a67" />
          <span>Extracted Document Intelligence</span>
        </div>
        <span className="badge badge-green">AI Processed</span>
      </div>

      {/* Title & Summary */}
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{scan.title}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
          {scan.summary}
        </p>
      </div>

      {/* Extracted Event Card */}
      {primaryEvent && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '3px',
            background: 'linear-gradient(135deg, rgba(208, 138, 103, 0.08) 0%, rgba(156, 132, 128, 0.08) 100%)',
            border: '1px solid rgba(208, 138, 103, 0.25)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {primaryEvent.title}
            </span>
            <span className="badge badge-purple">{primaryEvent.category}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} color="#d08a67" />
              <span>{primaryEvent.date}</span>
            </div>
            {primaryEvent.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} color="#e3b56d" />
                <span>{primaryEvent.time}</span>
              </div>
            )}
            {primaryEvent.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: 'span 2' }}>
                <MapPin size={12} color="#e39485" />
                <span>{primaryEvent.location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Items List */}
      {scan.actionItems.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
            EXTRACTED ACTION ITEMS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scan.actionItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text)'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d08a67' }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Feedback Banner */}
      {dispatchResult.dispatched ? (
        <div
          style={{
            padding: '12px',
            borderRadius: '3px',
            background: 'rgba(166, 178, 123, 0.1)',
            border: '1px solid rgba(166, 178, 123, 0.3)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a6b27b', fontWeight: 700, fontSize: '12px' }}>
            <CheckCircle size={15} />
            <span>{wasAlreadyInSync ? 'Already synced across L.A.S.A.' : 'Successfully synced across L.A.S.A.'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {wasAlreadyInSync ? (
              <>This scan is already connected to your calendar, tasks, and study context.</>
            ) : (
              <>
                • Added {dispatchResult.addedEvents} event(s) to Calendar<br />
                • Created {dispatchResult.addedTasks} new productivity task(s)<br />
                {dispatchResult.planCreated && '• Initialized dynamic Adaptive Study Plan in Study Coach'}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn-primary"
              onClick={onNavigateToStudy}
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px' }}
            >
              <GraduationCap size={13} />
              <span>Go to Study Plan</span>
            </button>
            <button
              className="btn-purple"
              onClick={onNavigateToProductivity}
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px' }}
            >
              <Zap size={13} />
              <span>Go to Tasks</span>
            </button>
          </div>
        </div>
      ) : (
        /* The Golden Cross-Mode Action Button */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          <button
            className="btn-primary"
            onClick={handleDispatchAll}
            style={{ width: '100%', padding: '12px', fontSize: '13px' }}
          >
            <Sparkles size={16} />
            <span>Dispatch to All Modes (Auto-Integrate)</span>
          </button>
        </div>
      )}

      {/* Scan another button */}
      <button
        className="btn-secondary"
        onClick={onScanAnother}
        style={{ width: '100%', fontSize: '11px', padding: '8px' }}
      >
        Scan Another Document
      </button>
    </div>
  );
};
