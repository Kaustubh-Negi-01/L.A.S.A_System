import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check
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
  const [copied, setCopied] = useState(false);
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

  const handleShare = async () => {
    const textToShare = `📋 ${scan.title}\n📅 Date: ${scan.extractedDates[0] || 'TBD'}\nSummary: ${scan.summary}\nAction Items:\n${scan.actionItems.map(a => '• ' + a).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: scan.title,
          text: textToShare
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const getGoogleCalendarUrl = () => {
    if (!primaryEvent) return '#';
    const dateStr = primaryEvent.date.replace(/-/g, '');
    const timeStr = primaryEvent.time ? 'T' + primaryEvent.time.replace(/:/g, '') + '00' : '';
    const startDateTime = `${dateStr}${timeStr}`;
    const text = encodeURIComponent(primaryEvent.title);
    const details = encodeURIComponent(`${scan.summary}\n\nActions:\n${scan.actionItems.join('\n')}`);
    const loc = encodeURIComponent(primaryEvent.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDateTime}/${startDateTime}&details=${details}&location=${loc}`;
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Sparkles size={18} color="var(--primary-cyan)" />
          <span>Extracted Document Intelligence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleShare}
            className="icon-btn"
            style={{ width: '28px', height: '28px' }}
            title="Share or Copy Summary"
            aria-label="Share summary"
          >
            {copied ? <Check size={13} color="#34d399" /> : <Share2 size={13} />}
          </button>
          <span className="badge badge-green">AI Processed</span>
        </div>
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
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
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
              <Calendar size={12} color="var(--primary-cyan)" />
              <span>{primaryEvent.date}</span>
            </div>
            {primaryEvent.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} color="#fbbf24" />
                <span>{primaryEvent.time}</span>
              </div>
            )}
            {primaryEvent.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: 'span 2' }}>
                <MapPin size={12} color="#fb7185" />
                <span>{primaryEvent.location}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--primary-cyan)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <span>Add to Google Calendar</span>
              <ExternalLink size={11} />
            </a>
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
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-cyan)' }} />
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
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>
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
