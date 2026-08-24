import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Target, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { generateStudyPlan } from '../../services/geminiService';

interface StudyPlanGeneratorProps {
  onPlanCreated: () => void;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ onPlanCreated }) => {
  const { addStudyPlan, getAiConfig } = useSharedContext();
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 4);
    return d.toISOString().split('T')[0];
  });
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [goal, setGoal] = useState('Score 90%+ / Grade A');
  const [weakTopicsInput, setWeakTopicsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Preset buttons for judges to test instantly
  const handleApplyPreset = (subj: string, goalText: string, weak: string) => {
    setSubject(subj);
    setGoal(goalText);
    setWeakTopicsInput(weak);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsLoading(true);
    try {
      const weaknesses = weakTopicsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newPlan = await generateStudyPlan(
        {
          subject: subject.trim(),
          examDate,
          dailyMinutes: Number(dailyMinutes) || 60,
          goal: goal.trim(),
          knownWeaknesses: weaknesses
        },
        getAiConfig()
      );

      addStudyPlan(newPlan);
      onPlanCreated();
    } catch (err) {
      console.error('Failed to create study plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <BookOpen size={18} color="#d08a67" />
          <span>Create Adaptive Study Plan</span>
        </div>
        <span className="badge badge-cyan">AI Powered</span>
      </div>

      {/* Quick Demo Presets */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
          QUICK TEMPLATES:
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            className="badge badge-purple"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleApplyPreset('Operating Systems', 'Master Semaphores & Paging', 'Deadlocks, Page Faults')}
          >
            OS Midterm
          </button>
          <button
            type="button"
            className="badge badge-cyan"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleApplyPreset('Computer Networks', 'Crack TCP/IP & Routing', 'Subnetting, Dijkstra')}
          >
            Networks Exam
          </button>
          <button
            type="button"
            className="badge badge-amber"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleApplyPreset('Machine Learning', 'Grade A in Deep Learning', 'Backpropagation, Overfitting')}
          >
            ML Coursework
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Subject Input */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <BookOpen size={13} color="#d08a67" />
            Subject or Course
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Data Structures, Operating Systems..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '5px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Date & Daily Time Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Calendar size={13} color="#c084fc" />
              Exam Date
            </label>
            <input
              type="date"
              required
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 10px',
                borderRadius: '5px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text)',
                fontSize: '12px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Clock size={13} color="#e3b56d" />
              Daily Study Time
            </label>
            <select
              value={dailyMinutes}
              onChange={e => setDailyMinutes(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 10px',
                borderRadius: '5px',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text)',
                fontSize: '12px'
              }}
            >
              <option value={30}>30 mins / day</option>
              <option value={45}>45 mins / day</option>
              <option value={60}>60 mins / day</option>
              <option value={90}>90 mins / day</option>
              <option value={120}>2 hours / day</option>
            </select>
          </div>
        </div>

        {/* Goal / Target */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Target size={13} color="#a6b27b" />
            Target Goal / Grade
          </label>
          <input
            type="text"
            placeholder="e.g. Master weak topics & score Grade A"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '5px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text)',
              fontSize: '12px'
            }}
          />
        </div>

        {/* Known Weak Areas */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <PlusCircle size={13} color="#e39485" />
            Known Weak Topics (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Recursion, Pointer arithmetic (comma separated)"
            value={weakTopicsInput}
            onChange={e => setWeakTopicsInput(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '5px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text)',
              fontSize: '12px'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !subject.trim()}
          className="btn-primary"
          style={{ width: '100%', marginTop: '6px' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating Adaptive Plan...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Adaptive Plan (AI)
            </>
          )}
        </button>
      </form>
    </div>
  );
};
