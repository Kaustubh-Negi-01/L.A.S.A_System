import React, { useEffect, useState } from 'react';
import { Bell, CalendarDays, CheckCircle2, ChevronUp, LockKeyhole, Moon, Pause, Play, Settings, Sparkles, Sun, Timer, Volume2, VolumeX, Wifi, X } from 'lucide-react';

export type SystemTab = 'visual' | 'study' | 'productivity';

type Theme = 'dark' | 'light';

interface LockScreenProps {
  currentTime: string;
  onUnlock: () => void;
}

interface NotificationShadeProps {
  activeTab: SystemTab;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  onLock: () => void;
  onOpenSettings: () => void;
  onNavigateToTab: (tab: SystemTab) => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ currentTime, onUnlock }) => (
  <div className="lock-screen" role="dialog" aria-label="L.A.S.A. lock screen">
    <div className="lock-screen-noise" aria-hidden="true" />
    <div className="lock-screen-topline">
      <span><LockKeyhole size={13} /> L.A.S.A. SECURE</span>
      <span>LOCAL</span>
    </div>
    <div className="lock-screen-clock">
      <span className="lock-screen-date">MONDAY · AUGUST 24</span>
      <strong>{currentTime}</strong>
      <span>Good to see you. Your workspace is ready.</span>
    </div>
    <div className="lock-screen-notification">
      <div className="lock-notification-icon"><Bell size={15} /></div>
      <div>
        <strong>Focus reminder</strong>
        <span>Your next high-priority task is waiting.</span>
      </div>
    </div>
    <button className="lock-screen-unlock" type="button" onClick={onUnlock} data-feedback="open">
      <span className="lock-screen-unlock-icon"><ChevronUp size={16} /></span>
      <span>Swipe up or tap to unlock</span>
    </button>
  </div>
);

export const NotificationShade: React.FC<NotificationShadeProps> = ({
  activeTab,
  theme,
  onThemeChange,
  onClose,
  onLock,
  onOpenSettings,
  onNavigateToTab,
}) => {
  const [wifiOn, setWifiOn] = useState(true);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('lasa-sound') !== 'off');
  const [hapticsOn, setHapticsOn] = useState(() => localStorage.getItem('lasa-haptics') !== 'off');
  const [focusActive, setFocusActive] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);

  useEffect(() => {
    if (!focusActive) return;
    const interval = window.setInterval(() => {
      setFocusSeconds(current => {
        if (current <= 1) {
          setFocusActive(false);
          return 25 * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [focusActive]);

  const togglePreference = (key: 'lasa-sound' | 'lasa-haptics', enabled: boolean) => {
    localStorage.setItem(key, enabled ? 'on' : 'off');
    if (key === 'lasa-sound') setSoundOn(enabled);
    if (key === 'lasa-haptics') setHapticsOn(enabled);
    window.dispatchEvent(new CustomEvent('lasa-feedback', { detail: { kind: 'tap', intensity: 'light' } }));
  };

  const formatFocusTime = `${String(Math.floor(focusSeconds / 60)).padStart(2, '0')}:${String(focusSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="notification-shade" role="dialog" aria-label="Notification shade">
      <button className="notification-shade-dismiss" type="button" onClick={onClose} aria-label="Close notification shade" />
      <div className="notification-shade-panel">
        <div className="shade-header">
          <div>
            <span className="shade-eyebrow">L.A.S.A. CONTROL CENTER</span>
            <strong>Quick settings</strong>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close notification shade"><X size={16} /></button>
        </div>

        <div className="quick-toggle-grid">
          <button className={`quick-toggle ${wifiOn ? 'is-on' : ''}`} type="button" onClick={() => setWifiOn(value => !value)} data-feedback="tap" aria-pressed={wifiOn}>
            <Wifi size={16} /><span>{wifiOn ? 'Wi-Fi' : 'Offline'}</span><small>{wifiOn ? 'L.A.S.A. local' : 'Off'}</small>
          </button>
          <button className={`quick-toggle ${soundOn ? 'is-on' : ''}`} type="button" onClick={() => togglePreference('lasa-sound', !soundOn)} data-feedback="tap" aria-pressed={soundOn}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>Sound</span><small>{soundOn ? 'Cues on' : 'Silent'}</small>
          </button>
          <button className={`quick-toggle ${hapticsOn ? 'is-on' : ''}`} type="button" onClick={() => togglePreference('lasa-haptics', !hapticsOn)} data-feedback="tap" aria-pressed={hapticsOn}>
            <Sparkles size={16} /><span>Haptics</span><small>{hapticsOn ? 'Visual on' : 'Off'}</small>
          </button>
          <button className="quick-toggle is-on" type="button" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} data-feedback="tap" aria-pressed="true">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>Display</span><small>{theme === 'dark' ? 'Dark' : 'Light'}</small>
          </button>
        </div>

        <div className="shade-section-label"><Bell size={12} /> Notifications</div>
        <button className="shade-notification" type="button" onClick={() => { onClose(); onNavigateToTab('productivity'); }} data-feedback="open">
          <div className="shade-notification-icon"><CheckCircle2 size={15} /></div>
          <div><strong>One task is still open</strong><span>Submit Operating Systems Lab Assignment 3 · due Aug 28</span></div>
          <ChevronUp size={14} className="shade-notification-chevron" />
        </button>

        <div className="shade-section-label"><Sparkles size={12} /> Live widgets</div>
        <div className="shade-widget-grid">
          <button className={`system-widget focus-widget ${focusActive ? 'is-running' : ''}`} type="button" onClick={() => setFocusActive(value => !value)} data-feedback="confirm">
            <span className="widget-icon"><Timer size={14} /></span>
            <span className="widget-label">Focus session</span>
            <strong>{focusActive ? formatFocusTime : '25:00'}</strong>
            <small>{focusActive ? 'in progress' : 'ready to start'} {focusActive ? <Pause size={11} /> : <Play size={11} />}</small>
          </button>
          <button className="system-widget" type="button" onClick={() => { onClose(); onNavigateToTab(activeTab === 'study' ? 'productivity' : 'study'); }} data-feedback="open">
            <span className="widget-icon"><CalendarDays size={14} /></span>
            <span className="widget-label">Next up</span>
            <strong>{activeTab === 'study' ? 'Lab submission' : 'DSA midterm'}</strong>
            <small>{activeTab === 'study' ? 'Aug 28 · Productivity' : 'Aug 27 · Study Coach'}</small>
          </button>
        </div>

        <div className="shade-footer-actions">
          <button className="btn-secondary" type="button" onClick={onOpenSettings} data-feedback="open"><Settings size={13} /> Settings</button>
          <button className="btn-secondary" type="button" onClick={onLock} data-feedback="confirm"><LockKeyhole size={13} /> Lock device</button>
        </div>
      </div>
    </div>
  );
};
