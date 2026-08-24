import React, { useEffect, useRef, useState } from 'react';
import { Wifi, BatteryMedium, Sparkles, Settings as SettingsIcon, RotateCcw, CircleCheck, Sun, Moon } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';

type Theme = 'dark' | 'light';

interface SmartphoneFrameProps {
  children: React.ReactNode;
  activeTab: 'visual' | 'study' | 'productivity';
  isModeSelection?: boolean;
  onOpenSettings: () => void;
  bottomNav: React.ReactNode;
}

const sectionCopy = {
  visual: {
    eyebrow: 'UNDERSTAND',
    title: 'Understand',
    description: 'Scan a notice or document and turn it into next steps.'
  },
  study: {
    eyebrow: 'STUDY COACH',
    title: 'Study coach',
    description: 'Plan focused sessions and practice what needs attention.'
  },
  productivity: {
    eyebrow: 'PRODUCTIVITY',
    title: 'Productivity',
    description: 'Keep important tasks and dates moving forward.'
  }
} as const;

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('lasa-theme');
  return savedTheme === 'light' ? 'light' : 'dark';
};

export const SmartphoneFrame: React.FC<SmartphoneFrameProps> = ({
  children,
  activeTab,
  isModeSelection = false,
  onOpenSettings,
  bottomNav
}) => {
  const { customApiKey, aiMode, resetToDemoData } = useSharedContext();
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isResetting, setIsResetting] = useState(false);
  const [isHaptic, setIsHaptic] = useState(false);
  const [feedbackPoint, setFeedbackPoint] = useState<{ x: number; y: number; key: number } | null>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const copy = sectionCopy[activeTab];
  const isLive = aiMode === 'gemini' && Boolean(customApiKey || import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lasa-theme', theme);
  }, [theme]);

  const handleReset = () => {
    setIsResetting(true);
    resetToDemoData();
    window.setTimeout(() => setIsResetting(false), 700);
  };

  useEffect(() => {
    const onFeedback = (event: Event) => {
      if (localStorage.getItem('lasa-haptics') === 'off') return;
      const detail = (event as CustomEvent<{ clientX?: number; clientY?: number }>).detail;
      const rect = phoneRef.current?.getBoundingClientRect();
      if (rect && typeof detail?.clientX === 'number' && typeof detail?.clientY === 'number') {
        setFeedbackPoint({ x: detail.clientX - rect.left, y: detail.clientY - rect.top, key: Date.now() });
      }
      setIsHaptic(true);
      window.setTimeout(() => setIsHaptic(false), 180);
      window.setTimeout(() => setFeedbackPoint(null), 520);
    };
    window.addEventListener('lasa-feedback', onFeedback);
    return () => window.removeEventListener('lasa-feedback', onFeedback);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-wrapper">
      <div className={`phone-frame ${isHaptic ? 'is-haptic' : ''}`} ref={phoneRef}>
        {feedbackPoint && <span key={feedbackPoint.key} className="feedback-ripple" style={{ left: feedbackPoint.x, top: feedbackPoint.y }} aria-hidden="true" />}
        <div className="phone-status-bar">
          <span className="status-time">{currentTime}</span>
          <div className="dynamic-island-notch" title={isLive ? 'Gemini connected' : 'Local simulation engine'}>
            <div className="camera-lens" />
            <div className="ai-pulse-dot" />
            <span className="notch-label">{isLive ? 'GEMINI' : 'LOCAL'}</span>
          </div>
          <div className="status-icons" aria-label="Network and battery status">
            <Wifi size={13} />
            <span>5G</span>
            <BatteryMedium size={15} className="battery-icon" />
          </div>
        </div>

        <header className="app-header">
          <div className="brand-badge">
            <div className="brand-logo-glow" aria-hidden="true"><Sparkles size={16} /></div>
            <div>
              <div className="brand-title">L.A.S.A.</div>
              <div className="brand-subtitle">LOCAL ASSISTANT</div>
            </div>
          </div>
          <div className="header-actions">
            <span className={`connection-status ${isLive ? 'is-live' : ''}`}>
              <CircleCheck size={11} />
              {isLive ? 'Live' : 'Local'}
            </span>
            <button
              className="icon-btn theme-toggle"
              onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className={`icon-btn reset-button ${isResetting ? 'is-resetting' : ''}`} onClick={handleReset} title="Reset demo data" aria-label="Reset demo data" aria-busy={isResetting}>
              <RotateCcw size={14} />
            </button>
            {isResetting && <span className="reset-feedback" role="status" aria-live="polite">Demo reset</span>}
            <button className="icon-btn" onClick={onOpenSettings} title="Open assistant settings" aria-label="Open assistant settings">
              <SettingsIcon size={15} />
            </button>
          </div>
        </header>

        {!isModeSelection && (
          <div className="section-intro">
            <div>
              <div className="section-eyebrow">{copy.eyebrow}</div>
              <h1>{copy.title}</h1>
              <p>{copy.description}</p>
            </div>
          </div>
        )}

        <main className="screen-scroll-container" aria-label={`${copy.title} workspace`}>
          {children}
        </main>
        {!isModeSelection && bottomNav}
      </div>
    </div>
  );
};
