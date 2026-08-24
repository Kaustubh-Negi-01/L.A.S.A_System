import { useState, type PointerEvent } from 'react';
import { ArrowRight, Check, Eye, GraduationCap, Zap } from 'lucide-react';

export type AppTab = 'visual' | 'study' | 'productivity';

interface ModeSelectionProps {
  onSelectMode: (mode: AppTab) => void;
}

const modes = [
  {
    id: 'study' as const,
    label: 'AI Study Coach',
    supportingText: 'Learn • Practice • Adapt',
    detail: 'Build momentum with focused study plans and adaptive practice.',
    icon: GraduationCap,
    accent: 'violet'
  },
  {
    id: 'visual' as const,
    label: 'AI Understand & Act',
    supportingText: 'Scan • Understand • Act',
    detail: 'Turn documents, notices, and images into clear next steps.',
    icon: Eye,
    accent: 'cyan'
  },
  {
    id: 'productivity' as const,
    label: 'AI Productivity',
    supportingText: 'Plan • Prioritize • Execute',
    detail: 'Keep your priorities, tasks, and schedule moving forward.',
    icon: Zap,
    accent: 'amber'
  }
];

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState<AppTab | null>(null);

  const handleSelectMode = (mode: AppTab) => {
    if (selectedMode) return;
    setSelectedMode(mode);
    window.setTimeout(() => onSelectMode(mode), 220);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const clearPointerPosition = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.removeProperty('--pointer-x');
    event.currentTarget.style.removeProperty('--pointer-y');
  };

  return (
  <section className="mode-selection" aria-labelledby="mode-selection-title">
    <div className="mode-selection-intro">
      <span className="mode-selection-eyebrow">L.A.S.A. / STARTUP</span>
      <h1 id="mode-selection-title">What mode do you want to use?</h1>
      <p>Choose an assistant built around what you want to accomplish right now.</p>
      <span className="mode-selection-status" aria-live="polite">
        {selectedMode ? `Opening ${modes.find(mode => mode.id === selectedMode)?.label ?? 'workspace'}…` : 'Select a mode to continue'}
      </span>
    </div>

    <div className="mode-selection-grid">
      {modes.map(({ id, label, supportingText, detail, icon: Icon, accent }) => (
        <button
          key={id}
          type="button"
          className={`mode-option mode-option-${accent} ${selectedMode === id ? 'is-selected' : ''} ${selectedMode && selectedMode !== id ? 'is-muted' : ''}`}
          onClick={() => handleSelectMode(id)}
          onPointerMove={handlePointerMove}
          onPointerLeave={clearPointerPosition}
          onPointerCancel={clearPointerPosition}
          aria-pressed={selectedMode === id}
        >
          <span className="mode-option-orbit" aria-hidden="true" />
          <span className="mode-option-icon"><Icon size={27} strokeWidth={1.8} /></span>
          <span className="mode-option-label">{label}</span>
          <span className="mode-option-supporting">{supportingText}</span>
          <span className="mode-option-detail">{detail}</span>
          <span className="mode-option-action">
            {selectedMode === id ? <><Check size={13} /> Opening</> : <>Enter mode <ArrowRight size={14} /></>}
          </span>
        </button>
      ))}
    </div>
  </section>
  );
};
