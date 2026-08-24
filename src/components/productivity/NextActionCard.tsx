import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Flame, Loader2, RefreshCw } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { recommendNextAction } from '../../services/geminiService';
import { NextActionRecommendation } from '../../types';

interface NextActionCardProps {
  onExecuteAction: (type: string, refId?: string) => void;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({ onExecuteAction }) => {
  const state = useSharedContext();
  const [recommendation, setRecommendation] = useState<NextActionRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const rec = await recommendNextAction(state, state.getAiConfig());
      setRecommendation(rec);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [
    state.tasks,
    state.events,
    state.studyPlans,
    state.quizHistory,
    state.activeStudyPlanId,
    state.customApiKey,
    state.aiMode,
    state.aiProvider,
    state.aiBaseUrl,
    state.aiModel
  ]);

  if (loading) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(227, 181, 109, 0.08) 0%, rgba(210, 117, 104, 0.08) 100%)',
          borderColor: 'rgba(227, 181, 109, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Loader2 className="animate-spin" size={20} color="#e3b56d" />
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          AI synthesizing context to recommend next action...
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  const isHighUrgency = recommendation.urgency === 'high';

  return (
    <div
      className="glass-panel animate-slide-up"
      style={{
        padding: '16px',
        background: isHighUrgency
          ? 'linear-gradient(135deg, rgba(210, 117, 104, 0.12) 0%, rgba(227, 181, 109, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(208, 138, 103, 0.1) 0%, rgba(156, 132, 128, 0.1) 100%)',
        borderColor: isHighUrgency ? 'rgba(210, 117, 104, 0.4)' : 'rgba(208, 138, 103, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="card-header-row" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color={isHighUrgency ? '#e39485' : '#d08a67'} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: isHighUrgency ? '#e39485' : '#d08a67', letterSpacing: '0.6px' }}>
            RECOMMENDED NEXT ACTION
          </span>
        </div>

        <button
          onClick={fetchRecommendation}
          className="icon-btn"
          style={{ width: '26px', height: '26px', padding: 0 }}
          title="Refresh Recommendation"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
        {recommendation.headline}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
        {recommendation.reason}
      </div>

      <button
        className={isHighUrgency ? 'btn-primary' : 'btn-purple'}
        onClick={() => onExecuteAction(recommendation.actionType, recommendation.referenceId)}
        style={{ width: '100%', padding: '9px 14px', fontSize: '12px' }}
      >
        <span>Execute Recommendation</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
};
