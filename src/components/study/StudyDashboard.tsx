import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  Target,
  RefreshCw,
  Award
} from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { StudyPlanGenerator } from './StudyPlanGenerator';
import { QuizEngine } from './QuizEngine';
import { MistakeAnalysis } from './MistakeAnalysis';
import { QuizResult } from '../../types';

export const StudyDashboard: React.FC = () => {
  const { studyPlans, activeStudyPlanId, setActiveStudyPlan, toggleMilestone, quizHistory } = useSharedContext();
  
  const [viewState, setViewState] = useState<'dashboard' | 'create_plan' | 'quiz' | 'analysis'>('dashboard');
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<string>('');
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  const activePlan = studyPlans.find(p => p.id === activeStudyPlanId) || studyPlans[0];

  const handleStartQuiz = (topic: string) => {
    setSelectedTopicForQuiz(topic);
    setViewState('quiz');
  };

  const handleFinishQuiz = (result: QuizResult) => {
    setLastQuizResult(result);
    setViewState('analysis');
  };

  // 1. Create Plan View
  if (viewState === 'create_plan') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          className="btn-secondary"
          onClick={() => setViewState('dashboard')}
          style={{ width: 'fit-content', fontSize: '11px', padding: '6px 12px' }}
        >
          ← Back to Study Dashboard
        </button>
        <StudyPlanGenerator onPlanCreated={() => setViewState('dashboard')} />
      </div>
    );
  }

  // 2. Active Quiz Engine View
  if (viewState === 'quiz' && activePlan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <QuizEngine
          subject={activePlan.subject}
          topic={selectedTopicForQuiz || activePlan.subject}
          studyPlanId={activePlan.id}
          onFinishQuiz={handleFinishQuiz}
          onCancel={() => setViewState('dashboard')}
        />
      </div>
    );
  }

  // 3. Mistake Analysis View
  if (viewState === 'analysis' && lastQuizResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <MistakeAnalysis
          result={lastQuizResult}
          onViewAdaptedPlan={() => setViewState('dashboard')}
          onClose={() => setViewState('dashboard')}
        />
      </div>
    );
  }

  // 4. Main Study Dashboard View
  const completedMilestonesCount = activePlan ? activePlan.milestones.filter(m => m.completed).length : 0;
  const totalMilestones = activePlan ? activePlan.milestones.length : 1;
  const progressPercent = Math.round((completedMilestonesCount / totalMilestones) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      {/* Top Banner: Adaptive Learning Cycle Indicator */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderColor: 'rgba(0, 240, 255, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-cyan)', letterSpacing: '0.8px' }}>
            ADAPTIVE LEARNING CYCLE
          </span>
          <span className="badge badge-purple">LIVE</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}
        >
          <span style={{ color: '#00f0ff' }}>1. PLAN</span>
          <span>→</span>
          <span style={{ color: '#c084fc' }}>2. LEARN</span>
          <span>→</span>
          <span style={{ color: '#fbbf24' }}>3. TEST</span>
          <span>→</span>
          <span style={{ color: '#fb7185' }}>4. ANALYZE</span>
          <span>→</span>
          <span style={{ color: '#34d399' }}>5. ADAPT</span>
        </div>
      </div>

      {/* Plan Header / Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '75%' }}>
          {studyPlans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setActiveStudyPlan(plan.id)}
              className={plan.id === activePlan?.id ? 'badge badge-cyan' : 'badge badge-purple'}
              style={{
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                opacity: plan.id === activePlan?.id ? 1 : 0.6
              }}
            >
              {plan.subject}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => setViewState('create_plan')}
          style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '10px' }}
        >
          <Plus size={14} />
          <span>New Plan</span>
        </button>
      </div>

      {/* Active Study Plan Overview */}
      {activePlan ? (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div className="card-header-row">
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                {activePlan.subject}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Calendar size={12} color="#c084fc" />
                <span>Exam: {activePlan.examDate}</span>
                <span>•</span>
                <Clock size={12} color="#fbbf24" />
                <span>{activePlan.dailyStudyMinutes} min/day</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => handleStartQuiz(activePlan.subject)}
              style={{ padding: '7px 12px', fontSize: '11px' }}
            >
              <PlayCircle size={14} />
              <span>Take Quiz</span>
            </button>
          </div>

          {/* Goal & Progress Bar */}
          <div style={{ marginTop: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                <Target size={12} color="#34d399" />
                {activePlan.targetGradeOrGoal}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>{progressPercent}% Complete</span>
            </div>

            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #00f0ff 0%, #8b5cf6 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Weak Topics Warning Banner (if any detected) */}
          {activePlan.weakTopicsIdentified && activePlan.weakTopicsIdentified.length > 0 && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fb7185' }}>
                  ADAPTED FOR WEAK TOPICS:
                </div>
                <div style={{ fontSize: '11px', color: '#fecdd3', marginTop: '2px' }}>
                  {activePlan.weakTopicsIdentified.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Milestones Checklist */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              DAILY MILESTONES & DRILLS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activePlan.milestones.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: m.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${m.completed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div
                    onClick={() => toggleMilestone(activePlan.id, m.day)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, cursor: 'pointer' }}
                  >
                    {m.completed ? (
                      <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Circle size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}

                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: m.completed ? '#94a3b8' : '#fff',
                          textDecoration: m.completed ? 'line-through' : 'none'
                        }}
                      >
                        Day {m.day}: {m.topic}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {m.focusArea} ({m.estimatedMinutes}m)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(m.topic)}
                    title="Test this topic"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      background: 'rgba(0, 240, 255, 0.08)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      color: 'var(--primary-cyan)',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <PlayCircle size={12} />
                    Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <GraduationCap size={36} color="#00f0ff" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700 }}>No Active Study Plan</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 16px' }}>
            Generate your first adaptive study roadmap tailored to your upcoming exam.
          </p>
          <button className="btn-primary" onClick={() => setViewState('create_plan')} style={{ margin: '0 auto' }}>
            <Plus size={16} />
            Create Study Plan
          </button>
        </div>
      )}

      {/* Recent Quiz History */}
      {quizHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} color="#fbbf24" />
              RECENT QUIZ ASSESSMENTS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quizHistory.slice(-3).reverse().map((q, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setLastQuizResult(q);
                  setViewState('analysis');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{q.subject}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    Weak in: {q.weakTopics.join(', ') || 'None'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`badge ${q.percentage >= 70 ? 'badge-green' : q.percentage >= 40 ? 'badge-amber' : 'badge-red'}`}>
                    {q.percentage}%
                  </span>
                  <ArrowUpRight size={14} color="var(--text-dim)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
