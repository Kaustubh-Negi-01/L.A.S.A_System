import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Database, RefreshCw, CheckCircle } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { customApiKey, setCustomApiKey, aiMode, setAiMode, resetToDemoData, tasks, events, studyPlans, quizHistory } = useSharedContext();
  const [inputKey, setInputKey] = useState(customApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setCustomApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isKeyActive = Boolean(customApiKey || import.meta.env.VITE_GEMINI_API_KEY);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="card-header-row" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <Cpu size={18} color="#00f0ff" />
            <span>Assistant Settings & AI Config</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* AI Status Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 14px',
            background: isKeyActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 184, 0, 0.1)',
            borderColor: isKeyActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 184, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {isKeyActive ? (
            <ShieldCheck size={24} color="#34d399" />
          ) : (
            <Cpu size={24} color="#fbbf24" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: isKeyActive ? '#34d399' : '#fbbf24' }}>
              {isKeyActive ? 'Gemini 1.5 Flash Connected' : 'Smart Simulation Failover Engine Active'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isKeyActive
                ? 'Direct calls to Google Generative AI with automatic mock failover.'
                : 'Zero-failure mode enabled for fast offline hackathon evaluation.'}
            </div>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} color="#00f0ff" />
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
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
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
                background: '#040711',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                fontSize: '10px',
                color: '#34d399',
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
