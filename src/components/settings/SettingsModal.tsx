import React, { useEffect, useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Database, RefreshCw, CheckCircle, ArrowUpRight, Radio, RotateCcw, Search, PlugZap } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { listAvailableModels, testAiConnection } from '../../services/geminiService';
import { AiProvider } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: () => void;
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const providerLabels: Record<AiProvider, string> = {
  gemini: 'Google Gemini',
  'openai-compatible': 'OpenAI-compatible gateway'
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSwitchMode }) => {
  const {
    customApiKey,
    setCustomApiKey,
    aiMode,
    setAiMode,
    aiProvider,
    aiBaseUrl,
    aiModel,
    availableModels,
    setAiProvider,
    setAiBaseUrl,
    setAiModel,
    setAvailableModels,
    resetToDemoData,
    tasks,
    events,
    studyPlans,
    quizHistory
  } = useSharedContext();

  const [inputKey, setInputKey] = useState(customApiKey);
  const [inputProvider, setInputProvider] = useState<AiProvider>(aiProvider);
  const [inputBaseUrl, setInputBaseUrl] = useState(aiBaseUrl);
  const [inputModel, setInputModel] = useState(aiModel);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('lasa-sound') !== 'off');
  const [hapticsEnabled, setHapticsEnabled] = useState(() => localStorage.getItem('lasa-haptics') !== 'off');
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setInputKey(customApiKey);
    setInputProvider(aiProvider);
    setInputBaseUrl(aiBaseUrl || (aiProvider === 'gemini' ? GEMINI_BASE_URL : ''));
    setInputModel(aiModel || (aiProvider === 'gemini' ? 'gemini-1.5-flash' : 'onetap-1'));
    setConnectionState('idle');
    setConnectionMessage('');
  }, [isOpen, customApiKey, aiProvider, aiBaseUrl, aiModel]);

  const updatePreference = (key: 'lasa-sound' | 'lasa-haptics', enabled: boolean) => {
    localStorage.setItem(key, enabled ? 'on' : 'off');
    if (key === 'lasa-sound') setSoundEnabled(enabled);
    if (key === 'lasa-haptics') setHapticsEnabled(enabled);
    window.dispatchEvent(new CustomEvent('lasa-feedback', { detail: { kind: 'tap', intensity: 'light' } }));
  };

  const selectableModels = (() => {
    const current = inputModel.trim();
    if (current && !availableModels.some(model => model.id === current)) {
      return [{ id: current, label: current }, ...availableModels];
    }
    return availableModels;
  })();

  if (!isOpen) return null;

  const activeCredential = Boolean(inputKey.trim() || (inputProvider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY));
  const providerLabel = providerLabels[inputProvider];
  const statusTitle = aiMode === 'simulation'
    ? 'Demo Simulation Engine active'
    : activeCredential
      ? `${providerLabel} · ${inputModel || 'model not selected'}`
      : 'Live provider ready — add an API key';
  const statusCopy = aiMode === 'simulation'
    ? 'Fast, private, zero-key mode for offline evaluation.'
    : activeCredential
      ? 'Selected provider and model will be used across scanner, study, quiz, and productivity actions.'
      : 'Add a provider key, discover models, and select one to enable live inference.';

  const handleProviderChange = (provider: AiProvider) => {
    setInputProvider(provider);
    setConnectionState('idle');
    setConnectionMessage('');
    if (provider === 'gemini') {
      setInputBaseUrl(GEMINI_BASE_URL);
      setInputModel('gemini-1.5-flash');
    } else {
      setInputBaseUrl('');
      setInputModel('');
    }
  };

  const buildConfig = () => ({
    apiKey: inputKey.trim() || (inputProvider === 'gemini' ? String(import.meta.env.VITE_GEMINI_API_KEY || '') : ''),
    mode: 'gemini' as const,
    provider: inputProvider,
    baseUrl: inputBaseUrl.trim(),
    model: inputModel.trim()
  });

  const handleDiscoverModels = async () => {
    setConnectionState('loading');
    setConnectionMessage('Discovering available models...');
    try {
      const models = await listAvailableModels(buildConfig());
      setAvailableModels(models);
      const discoveredModel = models.length > 0 && !models.some(model => model.id === inputModel)
        ? models[0].id
        : inputModel.trim();
      if (models.length > 0) {
        setInputModel(discoveredModel);
        setCustomApiKey(inputKey.trim());
        setAiProvider(inputProvider);
        setAiBaseUrl(inputBaseUrl.trim());
        setAiModel(discoveredModel);
        setAiMode('gemini');
      }
      setConnectionState('success');
      setConnectionMessage(models.length ? `${models.length} model${models.length === 1 ? '' : 's'} found.` : 'No models returned by this provider.');
    } catch (error) {
      setConnectionState('error');
      setConnectionMessage(error instanceof Error ? error.message : 'Model discovery failed. Check the key and base URL.');
    }
  };

  const persistConnectionConfig = () => {
    const trimmedKey = inputKey.trim();
    setCustomApiKey(trimmedKey);
    setAiProvider(inputProvider);
    setAiBaseUrl(inputBaseUrl.trim());
    setAiModel(inputModel.trim());
    if (trimmedKey || (inputProvider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY)) {
      setAiMode('gemini');
    }
  };

  const handleSave = () => {
    persistConnectionConfig();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    setConnectionState('loading');
    setConnectionMessage('Testing the selected model...');
    try {
      const response = await testAiConnection(buildConfig());
      persistConnectionConfig();
      setAiMode('gemini');
      setConnectionState('success');
      setConnectionMessage(`Connected${response ? ` · ${response.trim().slice(0, 40)}` : ''}`);
    } catch (error) {
      setConnectionState('error');
      setConnectionMessage(error instanceof Error ? error.message : 'Connection test failed.');
    }
  };

  const handleSwitchMode = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.setTimeout(onSwitchMode, 160);
  };

  return (
    <div className={`modal-backdrop settings-backdrop ${isLeaving ? 'is-leaving' : ''}`} onClick={onClose}>
      <div className={`modal-sheet settings-sheet ${isLeaving ? 'is-leaving' : ''}`} onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-handle" />

        <header className="settings-header">
          <div className="settings-heading-group">
            <span className="settings-eyebrow"><Radio size={11} /> SYSTEM / CONFIGURATION</span>
            <div className="settings-title-row">
              <span className="settings-title-icon"><Cpu size={17} /></span>
              <div><h2 id="settings-title">Assistant settings</h2><p>Choose how L.A.S.A. responds and feels.</p></div>
            </div>
          </div>
          <button className="icon-btn settings-close" type="button" onClick={onClose} aria-label="Close settings"><X size={16} /></button>
        </header>

        <button className="switch-mode-action settings-switch-mode" type="button" onClick={handleSwitchMode} data-feedback="open" disabled={isLeaving}>
          <span className="settings-switch-copy"><span className="settings-action-kicker">CORE NAVIGATION</span><strong>Switch mode</strong><small>Return to the L.A.S.A. mode selector</small></span>
          <span className="settings-switch-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
        </button>

        <div className="settings-section settings-status-section">
          <div className="settings-section-label"><span>ENGINE STATUS</span><span className="settings-live-mark"><span /> {aiMode === 'simulation' ? 'LOCAL READY' : activeCredential ? 'CONNECTED' : 'NEEDS KEY'}</span></div>
          <div className={`settings-status-panel ${aiMode !== 'simulation' && activeCredential ? 'is-live' : ''}`}>
            <span className="settings-status-icon">{aiMode !== 'simulation' && activeCredential ? <ShieldCheck size={20} /> : <Cpu size={20} />}</span>
            <div><strong>{statusTitle}</strong><p>{statusCopy}</p></div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label"><span>PROVIDER CONNECTION</span><PlugZap size={12} /></div>
          <label className="settings-field-label" htmlFor="settings-provider">Provider type</label>
          <select id="settings-provider" className="settings-provider-select" value={inputProvider} onChange={event => handleProviderChange(event.target.value as AiProvider)}>
            <option value="gemini">Google Gemini</option>
            <option value="openai-compatible">OpenAI-compatible gateway</option>
          </select>
          <span className="settings-field-hint">OpenAI-compatible includes gateways such as OneTap, OpenRouter, Groq, DeepSeek, and custom compatible endpoints.</span>

          {inputProvider === 'openai-compatible' && <>
            <label className="settings-field-label" htmlFor="settings-base-url">Base URL</label>
            <input id="settings-base-url" type="url" placeholder="https://your-provider.example/v1" value={inputBaseUrl} onChange={event => setInputBaseUrl(event.target.value)} />
          </>}

          <label className="settings-field-label" htmlFor="settings-api-key">API key</label>
          <div className="settings-key-row">
            <div className="settings-input-wrap"><Key size={13} /><input id="settings-api-key" type="password" placeholder={inputProvider === 'gemini' ? 'AIzaSy...' : 'Bearer key'} value={inputKey} onChange={event => setInputKey(event.target.value)} /></div>
            <button className="btn-primary settings-save-button" type="button" onClick={handleSave} data-feedback="confirm">{savedSuccess ? <><CheckCircle size={15} /> Saved</> : 'Save'}</button>
          </div>
          <span className="settings-field-hint">Stored locally in this prototype. Keys are sent directly from this browser to the selected provider; never use a production secret here.</span>
        </div>

        <div className="settings-section">
          <div className="settings-section-label"><span>MODEL DISCOVERY</span><span className="settings-section-index">01</span></div>
          <div className="settings-model-row">
            <select id="settings-model" className="settings-provider-select" value={inputModel} onChange={event => setInputModel(event.target.value)} aria-label="Select model">
              {selectableModels.length === 0 ? <option value={inputModel}>{inputModel || 'Discover models first'}</option> : selectableModels.map(model => <option value={model.id} key={model.id}>{model.label}</option>)}
            </select>
            <button className="btn-secondary settings-discover-button" type="button" onClick={handleDiscoverModels} disabled={connectionState === 'loading'}><Search size={13} /> Discover</button>
          </div>
          <div className="settings-model-actions"><button className="btn-secondary settings-test-button" type="button" onClick={handleTestConnection} disabled={connectionState === 'loading' || !inputKey.trim() && !(inputProvider === 'gemini' && import.meta.env.VITE_GEMINI_API_KEY)}><PlugZap size={13} /> Test connection</button>{connectionMessage && <span className={`settings-connection-message ${connectionState}`}>{connectionMessage}</span>}</div>
          <span className="settings-field-hint">The selected model is used across visual understanding, study planning, quizzes, explanations, task breakdown, and next-action recommendations. For image uploads, choose a model that advertises vision or multimodal support; text-only models use a safe extraction fallback.</span>
        </div>

        <div className="settings-section">
          <div className="settings-section-label"><span>EXECUTION STRATEGY</span><span className="settings-section-index">02</span></div>
          <div className="settings-strategy-grid">
            <button type="button" onClick={() => setAiMode('gemini')} className={`settings-strategy ${aiMode !== 'simulation' ? 'is-active is-live' : ''}`} aria-pressed={aiMode !== 'simulation'} data-feedback="tap"><span className="settings-strategy-dot" /><span><strong>Live provider API</strong><small>{providerLabel} · {inputModel || 'choose a model'}</small></span></button>
            <button type="button" onClick={() => setAiMode('simulation')} className={`settings-strategy ${aiMode === 'simulation' ? 'is-active' : ''}`} aria-pressed={aiMode === 'simulation'} data-feedback="tap"><span className="settings-strategy-dot" /><span><strong>Demo Simulation</strong><small>Private local engine</small></span></button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label"><span>INTERFACE FEEDBACK</span><span className="settings-section-index">03</span></div>
          <div className="settings-preference-list">
            <div className="settings-preference-row"><div><strong>Sound cues</strong><small>Short audio accents for meaningful actions.</small></div><button type="button" className={`settings-toggle ${soundEnabled ? 'is-on' : ''}`} aria-pressed={soundEnabled} onClick={() => updatePreference('lasa-sound', !soundEnabled)} data-feedback="tap"><span />{soundEnabled ? 'ON' : 'OFF'}</button></div>
            <div className="settings-preference-row"><div><strong>Visual haptics</strong><small>Subtle tactile flashes on important actions.</small></div><button type="button" className={`settings-toggle ${hapticsEnabled ? 'is-on' : ''}`} aria-pressed={hapticsEnabled} onClick={() => updatePreference('lasa-haptics', !hapticsEnabled)} data-feedback="tap"><span />{hapticsEnabled ? 'ON' : 'OFF'}</button></div>
          </div>
        </div>

        <div className="settings-section settings-reset-section">
          <div className="settings-section-label"><span>DEMO PLAYGROUND</span><span className="settings-section-index">04</span></div>
          <div className="settings-reset-row"><div><strong>Reset demo data</strong><small>Reload the initial exam notice, study plan, and tasks.</small></div><button className="btn-secondary settings-reset-button" type="button" onClick={resetToDemoData} data-feedback="confirm"><RefreshCw size={13} /> Reset</button></div>
        </div>

        <div className="settings-inspector">
          <button className="settings-inspector-trigger" type="button" onClick={() => setShowJson(current => !current)} aria-expanded={showJson} data-feedback="tap"><Database size={13} /><span>{showJson ? 'Hide live shared context' : 'Inspect live shared context'}</span><span className="settings-inspector-chevron">{showJson ? '−' : '+'}</span></button>
          {showJson && <pre className="settings-json">{JSON.stringify({ tasksCount: tasks.length, eventsCount: events.length, plansCount: studyPlans.length, quizHistoryCount: quizHistory.length, provider: aiProvider, model: aiModel }, null, 2)}</pre>}
        </div>

        <footer className="settings-footer"><RotateCcw size={11} /> L.A.S.A. local assistant · configuration stays on this device</footer>
      </div>
    </div>
  );
};
