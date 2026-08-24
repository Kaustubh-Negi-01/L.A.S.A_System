import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Loader2, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizResult } from '../../types';
import { useSharedContext } from '../../context/SharedContext';
import { generateQuiz, evaluateQuizAndAdapt } from '../../services/geminiService';

interface QuizEngineProps {
  subject: string;
  topic: string;
  studyPlanId?: string;
  onFinishQuiz: (result: QuizResult) => void;
  onCancel: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  subject,
  topic,
  studyPlanId,
  onFinishQuiz,
  onCancel
}) => {
  const { customApiKey, aiMode, recordQuizResult } = useSharedContext();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  // Generate Questions on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const fetched = await generateQuiz(
          {
            subject,
            topic,
            questionCount: 3,
            difficulty: 'medium'
          },
          customApiKey,
          aiMode
        );
        if (isMounted) {
          setQuestions(fetched);
        }
      } catch (err) {
        console.error('Quiz generation error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [subject, topic, customApiKey, aiMode]);

  // Timer Countdown
  useEffect(() => {
    if (loading || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitting]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const evaluation = await evaluateQuizAndAdapt(
        {
          subject,
          studyPlanId,
          questions,
          userAnswers: selectedAnswers
        },
        customApiKey,
        aiMode
      );

      // Trigger celebratory confetti if score is high
      if (evaluation.percentage >= 60) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas blocked
        }
      }

      recordQuizResult(evaluation);
      onFinishQuiz(evaluation);
    } catch (err) {
      console.error('Quiz evaluation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '30px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="#d08a67" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 700, fontSize: '15px' }}>AI Generating Adaptive Quiz...</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Crafting diagnostic questions for "{topic}"
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
        <div>No questions generated. Please try again.</div>
        <button className="btn-secondary" onClick={onCancel} style={{ marginTop: '12px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCurrentAnswered = selectedAnswers[currentQ.id] !== undefined;
  const allAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      {/* Header info */}
      <div className="card-header-row">
        <div>
          <span className="badge badge-purple" style={{ marginRight: '6px' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="badge badge-cyan">{currentQ.topicTag}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e3b56d', fontWeight: 700 }}>
          <Clock size={13} />
          <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Question Text */}
      <div style={{ marginTop: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.4, color: 'var(--text)' }}>
          {currentQ.question}
        </h3>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {currentQ.options.map((option, optIdx) => {
          const isSelected = selectedAnswers[currentQ.id] === optIdx;
          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(currentQ.id, optIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '3px',
                background: isSelected ? 'rgba(208, 138, 103, 0.15)' : 'var(--surface-raised)',
                border: `1px solid ${isSelected ? '#d08a67' : 'var(--border-subtle)'}`,
                color: isSelected ? '#fff' : 'var(--text-muted)',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontSize: '13px'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? '#d08a67' : 'var(--surface-raised)',
                  color: isSelected ? '#04060a' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '11px',
                  flexShrink: 0
                }}
              >
                {String.fromCharCode(65 + optIdx)}
              </div>
              <span style={{ flex: 1 }}>{option}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn-secondary"
          onClick={onCancel}
          style={{ fontSize: '12px', padding: '8px 14px' }}
        >
          Quit
        </button>

        {isLastQuestion ? (
          <button
            className="btn-primary"
            disabled={!allAnswered || isSubmitting}
            onClick={handleSubmit}
            style={{ fontSize: '12px', padding: '9px 18px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Analyzing Mistakes...
              </>
            ) : (
              <>
                <Award size={14} />
                Submit & Analyze
              </>
            )}
          </button>
        ) : (
          <button
            className="btn-primary"
            disabled={!isCurrentAnswered}
            onClick={handleNext}
            style={{ fontSize: '12px', padding: '9px 18px' }}
          >
            <span>Next</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
