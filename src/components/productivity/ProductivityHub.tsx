import React, { useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { NextActionCard } from './NextActionCard';
import { TaskList } from './TaskList';
import { MiniCalendar } from './MiniCalendar';

interface ProductivityHubProps {
  onNavigateToStudy: () => void;
  focusTaskId?: string | null;
}

export const ProductivityHub: React.FC<ProductivityHubProps> = ({ onNavigateToStudy, focusTaskId }) => {
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleExecuteAction = (actionType: string, refId?: string) => {
    setActionMessage(null);
    if (actionType === 'start_quiz' || actionType === 'study_milestone') {
      onNavigateToStudy();
      return;
    }

    if (actionType === 'urgent_task') {
      const target = refId ? document.getElementById(`task-${refId}`) : document.getElementById('task-list');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (actionType === 'relax') {
      setActionMessage('You have cleared the urgent queue. Take a short reset before the next action.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(227, 181, 109, 0.08) 0%, rgba(156, 132, 128, 0.08) 100%)',
          borderColor: 'rgba(227, 181, 109, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#e3b56d', letterSpacing: '0.8px' }}>
            ⚡ AI PRODUCTIVITY COACH
          </span>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Context-aware prioritization and atomic sub-step breakdown.
          </div>
        </div>
      </div>

      {/* AI Next Action Card */}
      <NextActionCard onExecuteAction={handleExecuteAction} />

      {actionMessage && (
        <div role="status" aria-live="polite" style={{ padding: '10px 12px', borderRadius: '5px', background: 'rgba(166, 178, 123, 0.08)', border: '1px solid rgba(166, 178, 123, 0.24)', color: 'var(--text-muted)', fontSize: '11px' }}>
          {actionMessage}
        </div>
      )}

      {/* Main Task List */}
      <TaskList focusTaskId={focusTaskId} />

      {/* Schedule / Extracted Events */}
      <MiniCalendar />
    </div>
  );
};
