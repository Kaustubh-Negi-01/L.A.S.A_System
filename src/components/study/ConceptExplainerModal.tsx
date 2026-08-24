import React, { useState, useEffect } from 'react';
import { Lightbulb, X, Sparkles, BookOpen, AlertTriangle, Brain, HelpCircle, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { explainConcept } from '../../services/geminiService';
import { ConceptExplanation } from '../../types';

interface ConceptExplainerModalProps {
  topic: string;
  subject: string;
  isOpen: boolean;
  onClose: () => void;
  onLaunchQuiz: (topic: string) => void;
}

export const ConceptExplainerModal: React.FC<ConceptExplainerModalProps> = ({
  topic,
  subject,
  isOpen,
  onClose,
  onLaunchQuiz
}) => {
  const { customApiKey, aiMode } = useSharedContext();
  const [data, setData] = useState<ConceptExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAnswer, setShowQuickAnswer] = useState(false);

  useEffect(() => {
    if (!isOpen || !topic) return;

    let isMounted = true;
    const fetchExplanation = async () => {
      setLoading(true);
      setShowQuickAnswer(false);
      try {
        const result = await explainConcept(topic, subject, customApiKey, aiMode);
        if (isMounted) setData(result);
      } catch (err) {
        console.error('Failed to explain concept:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplanation();
    return () => {
      isMounted = false;
    };
  }, [topic, subject, isOpen, customApiKey, aiMode]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="modal-handle" />

        <div className="card-header-row" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <Lightbulb size={18} color="#00f0ff" />
            <span>AI Concept Explainer</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="#00f0ff" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700 }}>AI Tutor Synthesizing Concept...</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Deconstructing "{topic}" into intuitive mental models
            </div>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header / Subject */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{data.topic}</span>
                <span className="badge badge-cyan">{subject}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.45 }}>
                {data.summary}
              </p>
            </div>

            {/* Key Mechanics */}
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#00f0ff', marginBottom: '8px' }}>
                <BookOpen size={13} />
                CORE MECHANICS & PROPERTIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.keyPoints.map((pt, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text)' }}>
                    <span style={{ color: '#00f0ff', fontWeight: 700 }}>•</span>
                    <span style={{ flex: 1 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analogy / Mental Model */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                <Brain size={13} />
                INTUITIVE MENTAL MODEL
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.45 }}>
                {data.mnemonicOrAnalogy}
              </p>
            </div>

            {/* Pitfall Warning */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#fb7185', marginBottom: '6px' }}>
                <AlertTriangle size={13} />
                COMMON PITFALL & EXAM TRAP
              </div>
              <p style={{ fontSize: '12px', color: '#fecdd3', lineHeight: 1.45 }}>
                {data.commonPitfall}
              </p>
            </div>

            {/* Quick Check Question */}
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
                  <HelpCircle size={13} />
                  QUICK COMPREHENSION CHECK
                </span>
                <button
                  onClick={() => setShowQuickAnswer(!showQuickAnswer)}
                  style={{ background: 'transparent', color: 'var(--primary-cyan)', fontSize: '11px', fontWeight: 700 }}
                >
                  {showQuickAnswer ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>
                {data.quickCheckQuestion.question}
              </div>
              {showQuickAnswer && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '11px',
                    color: '#34d399',
                    lineHeight: 1.4
                  }}
                >
                  <strong>Answer:</strong> {data.quickCheckQuestion.answer}
                </div>
              )}
            </div>

            {/* Action Button: Test with Quiz */}
            <button
              className="btn-primary"
              onClick={() => {
                onClose();
                onLaunchQuiz(topic);
              }}
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              <PlayCircle size={16} />
              <span>Launch Practice Quiz for "{topic}"</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
