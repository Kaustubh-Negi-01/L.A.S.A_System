import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { NextActionCard } from './NextActionCard';
import { TaskList } from './TaskList';
import { MiniCalendar } from './MiniCalendar';

interface ProductivityHubProps {
  onNavigateToStudy: () => void;
}

export const ProductivityHub: React.FC<ProductivityHubProps> = ({ onNavigateToStudy }) => {
  const handleExecuteAction = (actionType: string, _refId?: string) => {
    if (actionType === 'start_quiz' || actionType === 'study_milestone') {
      onNavigateToStudy();
      return;
    }

    if (actionType === 'urgent_task') {
      document.getElementById('task-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      {/* Main Task List */}
      <TaskList />

      {/* Schedule / Extracted Events */}
      <MiniCalendar />
    </div>
  );
};
