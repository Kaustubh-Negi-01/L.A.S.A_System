import React from 'react';
import { Award, AlertTriangle, CheckCircle, Sparkles, RefreshCw, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';
import { QuizResult } from '../../types';

interface MistakeAnalysisProps {
  result: QuizResult;
  onViewAdaptedPlan: () => void;
  onClose: () => void;
}

export const MistakeAnalysis: React.FC<MistakeAnalysisProps> = ({
  result,
  onViewAdaptedPlan,
  onClose
}) => {
  const isHighScorer = result.percentage >= 70;
  const isMediumScorer = result.percentage >= 40 && result.percentage < 70;

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '20px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Award size={20} color={isHighScorer ? '#a6b27b' : '#e3b56d'} />
          <span>Diagnostic Mistake Analysis</span>
        </div>
        <span className={`badge ${isHighScorer ? 'badge-green' : isMediumScorer ? 'badge-amber' : 'badge-red'}`}>
          {result.score} / {result.totalQuestions} Correct ({result.percentage}%)
        </span>
      </div>

      {/* Score Hero Card */}
      <div
        style={{
          padding: '16px',
          borderRadius: '6px',
          background: isHighScorer
            ? 'linear-gradient(135deg, rgba(166, 178, 123, 0.15) 0%, rgba(6, 78, 59, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(210, 117, 104, 0.15) 0%, rgba(136, 19, 55, 0.1) 100%)',
          border: `1px solid ${isHighScorer ? 'rgba(166, 178, 123, 0.3)' : 'rgba(210, 117, 104, 0.3)'}`,
          textAlign: 'center',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
          {result.percentage}%
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {isHighScorer ? 'Strong Performance! Minimal conceptual gaps.' : 'Weak concept areas identified for dynamic adaptation.'}
        </div>
      </div>

      {/* Strengths & Weaknesses Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {/* Strengths */}
        <div
          style={{
            padding: '12px',
            background: 'rgba(166, 178, 123, 0.06)',
            borderRadius: '3px',
            border: '1px solid rgba(166, 178, 123, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#a6b27b', marginBottom: '6px' }}>
            <CheckCircle size={13} />
            MASTERED TOPICS
          </div>
          {result.strengths.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {result.strengths.map((s, idx) => (
                <span key={idx} style={{ fontSize: '11px', color: 'var(--text)' }}>• {s}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>None identified</span>
          )}
        </div>

        {/* Weaknesses */}
        <div
          style={{
            padding: '12px',
            background: 'rgba(210, 117, 104, 0.06)',
            borderRadius: '3px',
            border: '1px solid rgba(210, 117, 104, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#e39485', marginBottom: '6px' }}>
            <AlertTriangle size={13} />
            WEAK CONCEPTS
          </div>
          {result.weakTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {result.weakTopics.map((w, idx) => (
                <span key={idx} style={{ fontSize: '11px', color: '#fda4af' }}>• {w}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Zero critical gaps!</span>
          )}
        </div>
      </div>

      {/* AI Adaptive Feedback */}
      <div
        className="glass-panel"
        style={{
          padding: '14px',
          background: 'rgba(156, 132, 128, 0.08)',
          borderColor: 'rgba(156, 132, 128, 0.3)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
          <Sparkles size={14} />
          AI ADAPTIVE RECOMMENDATION
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.45 }}>
          {result.adaptiveFeedback}
        </p>

        {result.recommendedNextMilestone && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 10px',
              borderRadius: '4px',
              background: 'rgba(208, 138, 103, 0.08)',
              border: '1px dashed rgba(208, 138, 103, 0.3)',
              fontSize: '11px',
              color: '#d08a67'
            }}
          >
            <strong>Added to Study Plan:</strong> {result.recommendedNextMilestone}
          </div>
        )}
      </div>

      {/* Adaptive Action Summary Banner */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '5px',
          background: 'rgba(208, 138, 103, 0.05)',
          border: '1px solid rgba(208, 138, 103, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        <ShieldAlert size={16} color="#d08a67" />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          L.A.S.A. dynamically updated your study roadmap & created a remedial task in Productivity Coach!
        </span>
      </div>

      {/* Question-by-Question Deep Dive Review */}
      {result.questions && result.questions.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} color="var(--primary-cyan)" />
            QUESTION-BY-QUESTION REVIEW
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.questions.map((q, qIdx) => {
              const selectedOpt = result.userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctOptionIndex;

              return (
                <div
                  key={q.id || qIdx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)',
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                      Q{qIdx + 1}. {q.question}
                    </span>
                    <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0 }}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options state */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0' }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = selectedOpt === optIdx;
                      const isRealCorrect = q.correctOptionIndex === optIdx;

                      let bg = 'rgba(255, 255, 255, 0.02)';
                      let border = '1px solid var(--border-subtle)';
                      let color = 'var(--text-muted)';

                      if (isRealCorrect) {
                        bg = 'rgba(16, 185, 129, 0.12)';
                        border = '1px solid rgba(16, 185, 129, 0.4)';
                        color = '#34d399';
                      } else if (isUserChoice && !isCorrect) {
                        bg = 'rgba(244, 63, 94, 0.12)';
                        border = '1px solid rgba(244, 63, 94, 0.4)';
                        color = '#fb7185';
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: bg,
                            border,
                            fontSize: '11px',
                            color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {isRealCorrect && <span style={{ fontSize: '9px', fontWeight: 700 }}>✓ Correct</span>}
                          {isUserChoice && !isCorrect && <span style={{ fontSize: '9px', fontWeight: 700 }}>✗ Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: 'rgba(0, 240, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.15)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4
                    }}
                  >
                    <strong style={{ color: 'var(--primary-cyan)' }}>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-secondary"
          onClick={onClose}
          style={{ flex: 1, fontSize: '12px', padding: '9px' }}
        >
          Study Coach Home
        </button>
        <button
          className="btn-primary"
          onClick={onViewAdaptedPlan}
          style={{ flex: 1, fontSize: '12px', padding: '9px' }}
        >
          <BookOpen size={14} />
          <span>View Adapted Plan</span>
        </button>
      </div>
    </div>
  );
};
