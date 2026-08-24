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
      const rec = await recommendNextAction(state, state.customApiKey);
      setRecommendation(rec);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [state.tasks.length, state.quizHistory.length, state.studyPlans.length]);

  if (loading) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)',
          borderColor: 'rgba(255, 184, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Loader2 className="animate-spin" size={20} color="#fbbf24" />
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
          ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(255, 184, 0, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        borderColor: isHighUrgency ? 'rgba(244, 63, 94, 0.4)' : 'rgba(0, 240, 255, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="card-header-row" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color={isHighUrgency ? '#fb7185' : '#00f0ff'} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: isHighUrgency ? '#fb7185' : '#00f0ff', letterSpacing: '0.6px' }}>
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

      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
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
