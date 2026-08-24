import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { useSharedContext } from '../../context/SharedContext';
import { Task, TaskPriority } from '../../types';

export const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStep, breakdownTaskWithAI } = useSharedContext();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      status: 'pending',
      dueDate: newDueDate,
      sourceModule: 'manual',
      steps: [
        { id: `step-${Date.now()}-1`, title: 'Define requirement details', isCompleted: false },
        { id: `step-${Date.now()}-2`, title: 'Execute action items', isCompleted: false }
      ]
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddingTask(false);
  };

  const handleTriggerAIBreakdown = async (taskId: string) => {
    setBreakingDownId(taskId);
    try {
      await breakdownTaskWithAI(taskId);
      setExpandedTaskId(taskId);
    } finally {
      setBreakingDownId(null);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} color="#00f0ff" />
          <span>TASKS & SUB-STEP BREAKDOWNS</span>
          <span className="badge badge-cyan">{pendingTasks.length} Pending</span>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsAddingTask(true)}
          style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '10px' }}
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add Task Inline Card */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="glass-panel animate-slide-up"
          style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderColor: 'var(--primary-cyan)' }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#00f0ff' }}>New Task</div>
          <input
            type="text"
            required
            placeholder="Task Title (e.g. Prepare Graph Theory slides)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '12px'
            }}
          />

          <input
            type="text"
            placeholder="Optional Description..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '12px'
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as TaskPriority)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#090e18',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px'
              }}
            >
              <option value="high">🔥 High Priority</option>
              <option value="medium">⚡ Medium Priority</option>
              <option value="low">🌱 Low Priority</option>
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAddingTask(false)}
              style={{ flex: 1, padding: '7px', fontSize: '11px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, padding: '7px', fontSize: '11px' }}
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map(task => {
          const isExpanded = expandedTaskId === task.id;
          const isCompleted = task.status === 'completed';
          const completedStepsCount = task.steps.filter(s => s.isCompleted).length;

          return (
            <div
              key={task.id}
              className="glass-panel"
              style={{
                padding: '12px',
                opacity: isCompleted ? 0.6 : 1,
                borderColor: task.priority === 'high' ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div
                  onClick={() => updateTask(task.id, { status: isCompleted ? 'in-progress' : 'completed' })}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, cursor: 'pointer' }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <Circle size={18} color={task.priority === 'high' ? '#fb7185' : '#64748b'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}

                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isCompleted ? '#94a3b8' : '#fff',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </div>

                    {task.description && (
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {task.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span className={`badge ${task.priority === 'high' ? 'badge-red' : task.priority === 'medium' ? 'badge-amber' : 'badge-green'}`}>
                        {task.priority}
                      </span>

                      {task.sourceModule === 'study_coach' && (
                        <span className="badge badge-purple">🎓 Study Coach</span>
                      )}
                      {task.sourceModule === 'visual_scanner' && (
                        <span className="badge badge-cyan">👁️ Scanned</span>
                      )}

                      {task.dueDate && (
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={10} />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Toggle Sub-steps"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Delete"
                  >
                    <Trash2 size={13} color="#f43f5e" />
                  </button>
                </div>
              </div>

              {/* Sub-steps Expansion Drawer */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      SUB-STEPS ({completedStepsCount}/{task.steps.length})
                    </span>

                    <button
                      onClick={() => handleTriggerAIBreakdown(task.id)}
                      disabled={breakingDownId === task.id}
                      style={{
                        background: 'transparent',
                        color: 'var(--primary-cyan)',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {breakingDownId === task.id ? (
                        <>
                          <Loader2 className="animate-spin" size={11} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} />
                          AI Sub-step Breakdown
                        </>
                      )}
                    </button>
                  </div>

                  {task.steps.map(step => (
                    <div
                      key={step.id}
                      onClick={() => toggleTaskStep(task.id, step.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer'
                      }}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 size={14} color="#34d399" />
                      ) : (
                        <Circle size={14} color="#64748b" />
                      )}
                      <span
                        style={{
                          fontSize: '12px',
                          color: step.isCompleted ? '#64748b' : '#cbd5e1',
                          textDecoration: step.isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
