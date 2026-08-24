import React, { useEffect, useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';

const MODAL_EXIT_MS = 180;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSwitchMode }) => {
  const { customApiKey, setCustomApiKey, aiMode, setAiMode, resetToDemoData, tasks, events, studyPlans, quizHistory } = useSharedContext();
  const [inputKey, setInputKey] = useState(customApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('lasa-sound') !== 'off');
    const [hapticsEnabled, setHapticsEnabled] = useState(() => localStorage.getItem('lasa-haptics') !== 'off');
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) return;
    setIsClosing(true);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, MODAL_EXIT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, shouldRender]);

  const closeWithMotion = (afterClose: () => void = onClose) => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      afterClose();
    }, MODAL_EXIT_MS);
  };

  const updatePreference = (key: 'lasa-sound' | 'lasa-haptics', enabled: boolean) => {
    localStorage.setItem(key, enabled ? 'on' : 'off');
    if (key === 'lasa-sound') setSoundEnabled(enabled);
    if (key === 'lasa-haptics') setHapticsEnabled(enabled);
    window.dispatchEvent(new CustomEvent('lasa-feedback', { detail: { kind: 'tap', intensity: 'light' } }));
  };

    if (!shouldRender) return null;

  const handleSave = () => {
    setCustomApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isKeyActive = aiMode === 'gemini' && Boolean(customApiKey || import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className={`modal-backdrop ${isClosing ? 'is-closing' : ''}`} onClick={() => closeWithMotion()}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="card-header-row" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <Cpu size={18} color="#d08a67" />
            <span>Assistant Settings & AI Config</span>
          </div>
                    <button className="icon-btn" onClick={() => closeWithMotion()} aria-label="Close settings">

            <X size={16} />
          </button>
        </div>

        <button className="switch-mode-action" type="button" onClick={() => closeWithMotion(onSwitchMode)}>
          <span>
            <strong>Switch mode</strong>
            <small>Return to the L.A.S.A. mode selector</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>

        {/* AI Status Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 14px',
            background: isKeyActive ? 'rgba(166, 178, 123, 0.1)' : 'rgba(227, 181, 109, 0.1)',
            borderColor: isKeyActive ? 'rgba(166, 178, 123, 0.3)' : 'rgba(227, 181, 109, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {isKeyActive ? (
            <ShieldCheck size={24} color="#a6b27b" />
          ) : (
            <Cpu size={24} color="#e3b56d" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: isKeyActive ? '#a6b27b' : '#e3b56d' }}>
              {isKeyActive
                ? 'Gemini 1.5 Flash Connected'
                : aiMode === 'simulation'
                  ? 'Smart Simulation Engine Active'
                  : 'Gemini mode ready — add an API key'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isKeyActive
                ? 'Live inference is enabled with automatic local fallback.'
                : aiMode === 'simulation'
                  ? 'Fast, private, zero-key mode for offline evaluation.'
                  : 'Add a Gemini API key to enable live inference; local fallback remains available.'}
            </div>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} color="#d08a67" />
            Gemini API Key (Optional Override)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '3px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text)',
                fontSize: '13px'
              }}
            />
            <button className="btn-primary" onClick={handleSave} style={{ padding: '0 16px' }}>
              {savedSuccess ? <CheckCircle size={16} /> : 'Save'}
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Execution Strategy
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setAiMode('gemini')}
              className={aiMode === 'gemini' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 10px', fontSize: '12px' }}
            >
              Live Gemini API
            </button>
            <button
              onClick={() => setAiMode('simulation')}
              className={aiMode === 'simulation' ? 'btn-purple' : 'btn-secondary'}
              style={{ padding: '8px 10px', fontSize: '12px' }}
            >
              Demo Simulation
            </button>
          </div>
        </div>

        <div className="glass-panel feedback-preferences">
          <div>
            <div className="feedback-preferences-title">Interface feedback</div>
            <div className="feedback-preferences-copy">Small sounds and tactile flashes make actions feel physical.</div>
          </div>
          <div className="feedback-preferences-controls">
            <button
              type="button"
              className={`feedback-toggle ${soundEnabled ? 'is-on' : ''}`}
              aria-pressed={soundEnabled}
              onClick={() => updatePreference('lasa-sound', !soundEnabled)}
            >
              <span className="feedback-toggle-dot" aria-hidden="true" />
              Sound cues
            </button>
            <button
              type="button"
              className={`feedback-toggle ${hapticsEnabled ? 'is-on' : ''}`}
              aria-pressed={hapticsEnabled}
              onClick={() => updatePreference('lasa-haptics', !hapticsEnabled)}
            >
              <span className="feedback-toggle-dot" aria-hidden="true" />
              Visual haptics
            </button>
          </div>
        </div>

        {/* Demo State Reset */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Reset Demo Playground</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Reload initial exam notice, DSA study plan, and tasks.
            </div>
          </div>
          <button className="btn-secondary" onClick={resetToDemoData} style={{ fontSize: '11px', padding: '6px 12px' }}>
            <RefreshCw size={13} />
            Reset
          </button>
        </div>

        {/* Inspect Shared Context State */}
        <div>
          <button
            onClick={() => setShowJson(!showJson)}
            style={{
              background: 'transparent',
              color: 'var(--primary-cyan)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Database size={13} />
            {showJson ? 'Hide Live State JSON' : 'Inspect Live Shared Context JSON'}
          </button>

          {showJson && (
            <pre
              style={{
                marginTop: '10px',
                padding: '12px',
                background: 'var(--surface-muted)',
                borderRadius: '3px',
                border: '1px solid var(--border-subtle)',
                fontSize: '10px',
                color: '#a6b27b',
                maxHeight: '160px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {JSON.stringify({ tasksCount: tasks.length, eventsCount: events.length, plansCount: studyPlans.length, quizHistoryCount: quizHistory.length }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
