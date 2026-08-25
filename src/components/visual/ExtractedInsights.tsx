import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  ListTodo,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  ListChecks,
  BookOpenCheck,
  CalendarPlus,
  ClipboardCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VisualFollowUpResponse, VisualScanResult } from '../../types';
import { answerVisualScanFollowUp, generateStudyPlan } from '../../services/geminiService';
import { useSharedContext } from '../../context/SharedContext';

interface ExtractedInsightsProps {
  scan: VisualScanResult;
  onNavigateToStudy: (topic?: string, autoStartQuiz?: boolean) => void;
  onNavigateToProductivity: (taskId?: string) => void;
  onScanAnother: () => void;
}

export const ExtractedInsights: React.FC<ExtractedInsightsProps> = ({
  scan,
  onNavigateToStudy,
  onNavigateToProductivity,
  onScanAnother
}) => {
  const { dispatchScanToApp, tasks, events, studyPlans, addTaskFromScanAction, updateTask, addEvent, addStudyPlan, setActiveStudyPlan, addScanActionsToTasks, getAiConfig } = useSharedContext();
  const [copied, setCopied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<VisualFollowUpResponse | null>(null);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [isCreatingStudyPlan, setIsCreatingStudyPlan] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    dispatched: boolean;
    addedTasks: number;
    addedEvents: number;
    planCreated: boolean;
  }>({ dispatched: false, addedTasks: 0, addedEvents: 0, planCreated: false });

  const handleDispatchAll = () => {
    const res = dispatchScanToApp(scan);
    setDispatchResult({
      dispatched: true,
      addedTasks: res.addedTasks,
      addedEvents: res.addedEvents,
      planCreated: res.planCreated
    });

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const primaryEvent = scan.extractedEvents[0];
  const studyTopic = primaryEvent?.title || scan.title;
  const scanFacts = (scan.keyFacts?.length ? scan.keyFacts : [
    scan.summary,
    primaryEvent?.description,
    ...scan.actionItems.slice(0, 2)
  ]).filter((fact): fact is string => Boolean(fact && fact.trim()));
  const followUpSuggestions = scan.followUpSuggestions?.length ? scan.followUpSuggestions : [
    'What should I do first?',
    'Explain this in simpler words',
    'What do I need to prepare?'
  ];
  const wasAlreadyInSync = dispatchResult.dispatched
    && dispatchResult.addedTasks === 0
    && dispatchResult.addedEvents === 0
    && !dispatchResult.planCreated;
  const scanStatus = scan.source === 'fallback'
    ? { label: 'Review Required', className: 'badge badge-amber' }
    : scan.source === 'simulation'
      ? { label: 'Demo Simulation', className: 'badge badge-cyan' }
      : { label: 'AI Processed', className: 'badge badge-green' };

  const getLinkedTask = (actionIndex: number) => tasks.find(task => task.sourceReferenceId === scan.id
    && (task.sourceActionIndex === actionIndex || task.title === scan.actionItems[actionIndex]));

  const handleActionToggle = (actionIndex: number) => {
    const task = getLinkedTask(actionIndex);
    const taskId = task?.id || addTaskFromScanAction(scan, actionIndex);
    if (!taskId) return;
    updateTask(taskId, { status: task?.status === 'completed' ? 'pending' : 'completed' });
    setActionFeedback(task?.status === 'completed' ? 'Action reopened.' : 'Action marked complete.');
    window.setTimeout(() => setActionFeedback(null), 1800);
  };

  const handleActionFollowUp = (actionIndex: number) => {
    const task = getLinkedTask(actionIndex);
    const taskId = task?.id || addTaskFromScanAction(scan, actionIndex);
    if (!taskId) return;
    setActionFeedback('Added to Productivity tasks.');
    onNavigateToProductivity(taskId);
  };

  const handleAddAllTasks = () => {
    const result = addScanActionsToTasks(scan);
    const firstTaskId = result.taskIds[0];
    setActionFeedback(result.addedTasks > 0 ? `Added ${result.addedTasks} action(s) to Productivity.` : 'All extracted actions are already in Productivity.');
    if (firstTaskId) setTimeout(() => onNavigateToProductivity(firstTaskId), 250);
  };

  const handleAddEvent = () => {
    if (!primaryEvent) {
      setActionFeedback('No calendar event was detected in this scan.');
      return;
    }
    const existing = events.find(event => event.id === primaryEvent.id
      || (event.title === primaryEvent.title && event.date === primaryEvent.date));
    if (existing) {
      setActionFeedback('This event is already in Calendar.');
      return;
    }
    const { id: _eventId, ...eventData } = primaryEvent;
    addEvent(eventData);
    setActionFeedback('Added the detected event to Calendar.');
  };

  const handleCreateStudyPlan = async (autoStartQuiz = false) => {
    const existingPlan = studyPlans.find(plan => plan.subject.trim().toLowerCase() === studyTopic.trim().toLowerCase());
    if (existingPlan) {
      setActiveStudyPlan(existingPlan.id);
      setActionFeedback('Opened the existing study plan for this scan.');
      onNavigateToStudy(studyTopic, autoStartQuiz);
      return;
    }

    setIsCreatingStudyPlan(true);
    try {
      const plan = await generateStudyPlan({
        subject: studyTopic,
        examDate: primaryEvent?.date || scan.extractedDates[0] || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        dailyMinutes: 45,
        goal: 'Prepare confidently from this scanned notice or assignment',
        knownWeaknesses: scan.actionItems.slice(0, 3)
      }, getAiConfig());
      addStudyPlan(plan);
      setActionFeedback('Study plan created and connected to this scan.');
      onNavigateToStudy(studyTopic, autoStartQuiz);
    } catch (error) {
      console.warn('Scan study-plan action failed:', error);
      setActionFeedback('Study plan could not be created yet. Try again or use Demo Simulation.');
    } finally {
      setIsCreatingStudyPlan(false);
    }
  };

  const handleSubmitFollowUp = async (questionOverride?: string) => {
    const question = (questionOverride ?? followUpQuestion).trim();
    if (!question || isFollowUpLoading) return;
    setFollowUpQuestion(question);
    setIsFollowUpLoading(true);
    try {
      const response = await answerVisualScanFollowUp(question, scan, getAiConfig());
      setFollowUpResponse(response);
    } catch (error) {
      console.warn('Scan follow-up action failed:', error);
      setFollowUpResponse({ answer: 'I could not answer that right now. You can still use the managed actions below to turn this scan into tasks, a study plan, or a calendar event.', nextSteps: [], suggestedDestination: 'none' });
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleFollowUpDestination = () => {
    const destination = followUpResponse?.suggestedDestination;
    if (destination === 'tasks') handleAddAllTasks();
    else if (destination === 'study') void handleCreateStudyPlan();
    else if (destination === 'calendar') handleAddEvent();
  };

  const handleShare = async () => {
    const textToShare = `📋 ${scan.title}\n📅 Date: ${scan.extractedDates[0] || 'TBD'}\nSummary: ${scan.summary}\nAction Items:\n${scan.actionItems.map(a => '• ' + a).join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: scan.title,
          text: textToShare
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const getGoogleCalendarUrl = () => {
    if (!primaryEvent) return '#';
    const dateStr = primaryEvent.date.replace(/-/g, '');
    const timeStr = primaryEvent.time ? 'T' + primaryEvent.time.replace(/:/g, '') + '00' : '';
    const startDateTime = `${dateStr}${timeStr}`;
    const text = encodeURIComponent(primaryEvent.title);
    const details = encodeURIComponent(`${scan.summary}\n\nActions:\n${scan.actionItems.join('\n')}`);
    const loc = encodeURIComponent(primaryEvent.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDateTime}/${startDateTime}&details=${details}&location=${loc}`;
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '18px' }}>
      <div className="card-header-row">
        <div className="card-title">
          <Sparkles size={18} color="var(--primary-cyan)" />
          <span>Extracted Document Intelligence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleShare}
            className="icon-btn"
            style={{ width: '28px', height: '28px' }}
            title="Share or Copy Summary"
            aria-label="Share summary"
          >
            {copied ? <Check size={13} color="#34d399" /> : <Share2 size={13} />}
          </button>
          <span className={scanStatus.className}>{scanStatus.label}</span>
        </div>
      </div>

      {scan.source === 'fallback' && (
        <div className="scan-fallback-notice" role="status">
          This image was not confidently read. No events were invented; choose a vision-capable model or try a clearer image.
        </div>
      )}

      {/* Title & Summary */}
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{scan.title}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
          {scan.summary}
        </p>
      </div>

      {/* Immediate Scan Brief */}
      <div className="scan-intelligence-panel" style={{ marginBottom: '14px' }}>
        <div className="scan-intelligence-heading">
          <div>
            <span className="scan-intelligence-kicker">UNDERSTAND / NEXT BEST ACTION</span>
            <strong>Here is what matters</strong>
          </div>
          <CheckCircle size={16} color="var(--accent)" />
        </div>
        <div className="scan-intelligence-facts">
          {scanFacts.slice(0, 4).map((fact, index) => (
            <div key={`${fact}-${index}`} className="scan-intelligence-fact">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Managed Scan Actions */}
      <div className="scan-managed-actions" style={{ marginBottom: '14px' }}>
        <div className="scan-managed-actions-title">MANAGE THIS SCAN</div>
        <div className="scan-managed-actions-grid">
          <button type="button" onClick={handleAddAllTasks} className="scan-managed-action">
            <ListChecks size={15} />
            <span><strong>Add to Tasks</strong><small>Keep every action</small></span>
            <ChevronRight size={13} />
          </button>
          <button type="button" onClick={() => void handleCreateStudyPlan()} className="scan-managed-action" disabled={isCreatingStudyPlan}>
            <BookOpenCheck size={15} />
            <span><strong>{isCreatingStudyPlan ? 'Building plan…' : 'Create Study Plan'}</strong><small>Explain, practise, adapt</small></span>
            <ChevronRight size={13} />
          </button>
          <button type="button" onClick={handleAddEvent} className="scan-managed-action" disabled={!primaryEvent}>
            <CalendarPlus size={15} />
            <span><strong>Add to Calendar</strong><small>{primaryEvent ? 'Save detected date' : 'No event detected'}</small></span>
            <ChevronRight size={13} />
          </button>
          <button type="button" onClick={() => void handleCreateStudyPlan(true)} className="scan-managed-action" disabled={isCreatingStudyPlan}>
            <ClipboardCheck size={15} />
            <span><strong>Generate Quiz</strong><small>Test this scan topic</small></span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Contextual Follow-up */}
      <div className="scan-follow-up-panel" style={{ marginBottom: '14px' }}>
        <div className="scan-intelligence-heading">
          <div>
            <span className="scan-intelligence-kicker">ASK ABOUT THIS SCAN</span>
            <strong>Keep the conversation grounded</strong>
          </div>
          <MessageCircle size={16} color="var(--accent)" />
        </div>
        <div className="scan-follow-up-suggestions">
          {followUpSuggestions.slice(0, 3).map(suggestion => (
            <button key={suggestion} type="button" onClick={() => void handleSubmitFollowUp(suggestion)}>{suggestion}</button>
          ))}
        </div>
        <form className="scan-follow-up-form" onSubmit={(event) => { event.preventDefault(); void handleSubmitFollowUp(); }}>
          <input
            value={followUpQuestion}
            onChange={(event) => setFollowUpQuestion(event.target.value)}
            placeholder="Ask what to do next…"
            aria-label="Ask a follow-up about this scan"
          />
          <button type="submit" aria-label="Send follow-up question" disabled={!followUpQuestion.trim() || isFollowUpLoading}>
            {isFollowUpLoading ? <Sparkles size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
        {isFollowUpLoading && <p className="scan-follow-up-status">L.A.S.A. is checking the scan context…</p>}
        {followUpResponse && (
          <div className="scan-follow-up-response" role="status" aria-live="polite">
            <p>{followUpResponse.answer}</p>
            {followUpResponse.nextSteps.length > 0 && (
              <div className="scan-follow-up-next-steps">
                {followUpResponse.nextSteps.map(step => <span key={step}>{step}</span>)}
              </div>
            )}
            {followUpResponse.suggestedDestination && followUpResponse.suggestedDestination !== 'none' && (
              <button type="button" className="scan-follow-up-destination" onClick={handleFollowUpDestination}>
                Continue in {followUpResponse.suggestedDestination === 'tasks' ? 'Tasks' : followUpResponse.suggestedDestination === 'study' ? 'Study Coach' : 'Calendar'} <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Extracted Event Card */}
      {primaryEvent && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {primaryEvent.title}
            </span>
            <span className="badge badge-purple">{primaryEvent.category}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={12} color="var(--primary-cyan)" />
              <span>{primaryEvent.date}</span>
            </div>
            {primaryEvent.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} color="#fbbf24" />
                <span>{primaryEvent.time}</span>
              </div>
            )}
            {primaryEvent.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: 'span 2' }}>
                <MapPin size={12} color="#fb7185" />
                <span>{primaryEvent.location}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--primary-cyan)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              <span>Add to Google Calendar</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}

      {/* Action Items List */}
      {scan.actionItems.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
            EXTRACTED ACTION ITEMS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scan.actionItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text)'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleActionToggle(idx)}
                  aria-label={getLinkedTask(idx)?.status === 'completed' ? `Reopen action: ${item}` : `Complete action: ${item}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    padding: 0,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    background: 'transparent',
                    color: 'var(--text-muted)'
                  }}
                >
                  {getLinkedTask(idx)?.status === 'completed' ? <CheckCircle size={16} color="#34d399" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-cyan)' }} />}
                </button>
                <span style={{ flex: 1, textDecoration: getLinkedTask(idx)?.status === 'completed' ? 'line-through' : 'none', opacity: getLinkedTask(idx)?.status === 'completed' ? 0.6 : 1 }}>{item}</span>
                <button
                  type="button"
                  onClick={() => handleActionFollowUp(idx)}
                  title="Open this action in Productivity"
                  aria-label={`Follow up on action: ${item}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    background: 'var(--surface-raised)',
                    color: 'var(--primary-cyan)',
                    fontSize: '10px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  <ListTodo size={12} />
                  <span>{getLinkedTask(idx) ? 'Open task' : 'Follow up'}</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {actionFeedback && (
        <div role="status" aria-live="polite" style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', color: '#6ee7b7', fontSize: '11px', fontWeight: 700 }}>
          {actionFeedback}
        </div>
      )}

      {/* Dispatch Feedback Banner */}
      {dispatchResult.dispatched ? (
        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>
            <CheckCircle size={15} />
            <span>{wasAlreadyInSync ? 'Already synced across L.A.S.A.' : 'Successfully synced across L.A.S.A.'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {wasAlreadyInSync ? (
              <>This scan is already connected to your calendar, tasks, and study context.</>
            ) : (
              <>
                • Added {dispatchResult.addedEvents} event(s) to Calendar<br />
                • Created {dispatchResult.addedTasks} new productivity task(s)<br />
                {dispatchResult.planCreated && '• Initialized dynamic Adaptive Study Plan in Study Coach'}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn-primary"
              onClick={() => onNavigateToStudy()}
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px' }}
            >
              <GraduationCap size={13} />
              <span>Go to Study Plan</span>
            </button>
            <button
              className="btn-purple"
              onClick={() => onNavigateToProductivity()}
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px' }}
            >
              <Zap size={13} />
              <span>Go to Tasks</span>
            </button>
          </div>
        </div>
      ) : (
        /* The Golden Cross-Mode Action Button */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          <button
            className="btn-primary"
            onClick={handleDispatchAll}
            style={{ width: '100%', padding: '12px', fontSize: '13px' }}
          >
            <Sparkles size={16} />
            <span>Dispatch to All Modes (Auto-Integrate)</span>
          </button>
        </div>
      )}

      {/* Scan another button */}
      <button
        className="btn-secondary"
        onClick={onScanAnother}
        style={{ width: '100%', fontSize: '11px', padding: '8px' }}
      >
        Scan Another Document
      </button>
    </div>
  );
};
