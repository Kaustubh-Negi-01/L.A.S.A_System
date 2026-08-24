import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles, Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';

interface SmartphoneFrameProps {
  children: React.ReactNode;
  activeTab: 'visual' | 'study' | 'productivity';
  onOpenSettings: () => void;
}

export const SmartphoneFrame: React.FC<SmartphoneFrameProps> = ({
  children,
  activeTab,
  onOpenSettings
}) => {
  const { customApiKey, resetToDemoData } = useSharedContext();
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasLiveApiKey = Boolean(customApiKey || import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className="app-wrapper">
      <div className="phone-frame">
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="status-time">{currentTime}</span>

          <div className="dynamic-island-notch" title={hasLiveApiKey ? 'Gemini 1.5 Live AI Connected' : 'L.A.S.A. Smart Simulation Engine Active'}>
            <div className="camera-lens" />
            <div className="ai-pulse-dot" />
            <span style={{ fontSize: '10px', color: '#00f0ff', fontWeight: 700 }}>
              {hasLiveApiKey ? 'GEMINI' : 'L.A.S.A.'}
            </span>
          </div>

          <div className="status-icons">
            <Wifi size={14} color="#94a3b8" />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>5G</span>
            <BatteryMedium size={16} color="#34d399" />
          </div>
        </div>

        {/* Top Header */}
        <header className="app-header">
          <div className="brand-badge">
            <div className="brand-logo-glow">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="brand-title">L.A.S.A. AI</div>
              <div className="brand-subtitle">
                {activeTab === 'study' && '🎓 Study Coach'}
                {activeTab === 'visual' && '👁️ Understand & Act'}
                {activeTab === 'productivity' && '⚡ Productivity Coach'}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={resetToDemoData}
              title="Reset Demo Data"
            >
              <RotateCcw size={15} />
            </button>
            <button
              className="icon-btn"
              onClick={onOpenSettings}
              title="Assistant Settings & API Key"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </header>

        {/* Screen Content */}
        <main className="screen-scroll-container">
          {children}
        </main>
      </div>
    </div>
  );
};
