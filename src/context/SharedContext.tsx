import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  SharedAppState,
  Task,
  ExtractedEvent,
  StudyPlan,
  QuizResult,
  VisualScanResult,
  TaskPriority,
  StudyMilestone
} from '../types';
import { loadAppState, saveAppState } from '../utils/storage';
import { initialDemoState } from '../services/mockData';
import { breakdownTask, getAiConfig, type AiConfig } from '../services/geminiService';

interface SharedContextValue extends SharedAppState {
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStep: (taskId: string, stepId: string) => void;
  breakdownTaskWithAI: (taskId: string) => Promise<void>;

  // Event Actions
  addEvent: (event: Omit<ExtractedEvent, 'id'>) => string;
  deleteEvent: (id: string) => void;

  // Study Plan Actions
  addStudyPlan: (plan: StudyPlan) => void;
  updateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  setActiveStudyPlan: (id: string) => void;
  toggleMilestone: (planId: string, day: number) => void;
  adaptStudyPlanFromQuiz: (quizResult: QuizResult) => void;

  // Quiz & Scans
  recordQuizResult: (result: QuizResult) => void;
  addScanResult: (scan: VisualScanResult) => void;
  dispatchScanToApp: (scan: VisualScanResult) => { addedTasks: number; addedEvents: number; planCreated: boolean };

  // Settings & Reset
  setCustomApiKey: (key: string) => void;
  setAiMode: (mode: 'gemini' | 'simulation') => void;
  setAiProvider: (provider: SharedAppState['aiProvider']) => void;
  setAiBaseUrl: (url: string) => void;
  setAiModel: (model: string) => void;
  setAvailableModels: (models: SharedAppState['availableModels']) => void;
  getAiConfig: () => AiConfig;
  resetToDemoData: () => void;
}

const SharedContext = createContext<SharedContextValue | undefined>(undefined);

export const SharedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SharedAppState>(() => loadAppState());

  // Auto-persist state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // --- Task Methods ---
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): string => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const toggleTaskStep = (taskId: string, stepId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSteps = t.steps.map(s =>
          s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        const allCompleted = updatedSteps.length > 0 && updatedSteps.every(s => s.isCompleted);
        return {
          ...t,
          steps: updatedSteps,
          status: allCompleted ? 'completed' : t.status === 'completed' ? 'in-progress' : t.status
        };
      })
    }));
  };

  const breakdownTaskWithAI = async (taskId: string) => {
    const targetTask = state.tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    try {
      const generatedSteps = await breakdownTask(
        targetTask.title,
        targetTask.description,
        getAiConfig(state.customApiKey, state.aiMode, state.aiProvider, state.aiBaseUrl, state.aiModel)
      );
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t.id === taskId ? { ...t, steps: generatedSteps } : t))
      }));
    } catch (err) {
      console.error('Failed to breakdown task:', err);
    }
  };

  // --- Event Methods ---
  const addEvent = (eventData: Omit<ExtractedEvent, 'id'>): string => {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newEvent: ExtractedEvent = { ...eventData, id };
    setState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events]
    }));
    return id;
  };

  const deleteEvent = (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // --- Study Plan Methods ---
  const addStudyPlan = (plan: StudyPlan) => {
    setState(prev => ({
      ...prev,
      studyPlans: [plan, ...prev.studyPlans.filter(p => p.id !== plan.id)],
      activeStudyPlanId: plan.id
    }));
  };

  const updateStudyPlan = (id: string, updates: Partial<StudyPlan>) => {
    setState(prev => ({
      ...prev,
      studyPlans: prev.studyPlans.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    }));
  };

  const setActiveStudyPlan = (id: string) => {
    setState(prev => ({ ...prev, activeStudyPlanId: id }));
  };

  const toggleMilestone = (planId: string, day: number) => {
    setState(prev => ({
      ...prev,
      studyPlans: prev.studyPlans.map(p => {
        if (p.id !== planId) return p;
        const updatedMilestones = p.milestones.map(m =>
          m.day === day ? { ...m, completed: !m.completed } : m
        );
        return { ...p, milestones: updatedMilestones, updatedAt: new Date().toISOString() };
      })
    }));
  };

  // Dynamic Adaptive Loop: Quiz Result modifies Study Plan and spawns remedial tasks
  const adaptStudyPlanFromQuiz = (quizResult: QuizResult) => {
    setState(prev => {
      // 1. Update active study plan with weak topics & remedial milestone
      const targetPlan = prev.studyPlans.find(p => p.id === (quizResult.studyPlanId || prev.activeStudyPlanId));
      let updatedStudyPlans = prev.studyPlans;

      if (targetPlan && quizResult.weakTopics.length > 0) {
        const existingWeak = new Set(targetPlan.weakTopicsIdentified);
        quizResult.weakTopics.forEach(w => existingWeak.add(w));

        const remedialMilestone: StudyMilestone = {
          day: targetPlan.milestones.length + 1,
          topic: `Adaptive Recovery: ${quizResult.weakTopics[0]}`,
          focusArea: `Targeted revision and error correction based on Quiz score (${quizResult.percentage}%).`,
          estimatedMinutes: 45,
          completed: false
        };

        updatedStudyPlans = prev.studyPlans.map(p => {
          if (p.id !== targetPlan.id) return p;
          return {
            ...p,
            weakTopicsIdentified: Array.from(existingWeak),
            milestones: [...p.milestones, remedialMilestone],
            updatedAt: new Date().toISOString()
          };
        });
      }

      // 2. Also automatically spawn a High-Priority Task for the weak topic in Productivity Coach
      const newRemedialTask: Task = {
        id: `task-adaptive-${Date.now()}`,
        title: `Reinforce: ${quizResult.weakTopics[0] || quizResult.subject}`,
        description: `Generated by Study Coach analysis (${quizResult.percentage}% accuracy). ${quizResult.adaptiveFeedback}`,
        priority: 'high' as TaskPriority,
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        sourceModule: 'study_coach',
        sourceReferenceId: quizResult.id,
        createdAt: new Date().toISOString(),
        steps: [
          { id: `step-${Date.now()}-1`, title: `Review mistakes in ${quizResult.weakTopics[0] || 'concepts'}`, isCompleted: false },
          { id: `step-${Date.now()}-2`, title: 'Solve 3 targeted practice questions', isCompleted: false },
          { id: `step-${Date.now()}-3`, title: 'Retake adaptive diagnostic quiz', isCompleted: false }
        ]
      };

      return {
        ...prev,
        studyPlans: updatedStudyPlans,
        tasks: [newRemedialTask, ...prev.tasks]
      };
    });
  };

  // --- Quiz & Scan History ---
  const recordQuizResult = (result: QuizResult) => {
    setState(prev => ({
      ...prev,
      quizHistory: [...prev.quizHistory, result]
    }));
    // Trigger adaptive loop
    adaptStudyPlanFromQuiz(result);
  };

  const addScanResult = (scan: VisualScanResult) => {
    setState(prev => ({
      ...prev,
      scans: [scan, ...prev.scans]
    }));
  };

  // --- Cross-Mode Dispatcher (Understand & Act -> Calendar & Tasks & Study Plan) ---
  const dispatchScanToApp = (scan: VisualScanResult) => {
    const alreadyDispatched = state.tasks.some(task => task.sourceReferenceId === scan.id)
      || state.events.some(event => scan.extractedEvents.some(extracted => extracted.id === event.id));

    if (alreadyDispatched) {
      return { addedTasks: 0, addedEvents: 0, planCreated: false };
    }

    let addedTasks = 0;
    let addedEvents = 0;
    let planCreated = false;

    // 1. Add extracted events to calendar
    const newEvents: ExtractedEvent[] = scan.extractedEvents.map(e => ({
      ...e,
      id: e.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    }));
    addedEvents = newEvents.length;

    // 2. Add action items as productivity tasks
    const newTasks: Task[] = scan.actionItems.map((item, idx) => ({
      id: `task-scan-${Date.now()}-${idx}`,
      title: item,
      description: `Extracted from: ${scan.title}`,
      priority: idx === 0 ? 'high' : 'medium',
      status: 'pending',
      dueDate: scan.extractedDates[0] || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      sourceModule: 'visual_scanner',
      sourceReferenceId: scan.id,
      createdAt: new Date().toISOString(),
      steps: [
        { id: `s-1`, title: 'Read notice details', isCompleted: true },
        { id: `s-2`, title: 'Prepare required materials', isCompleted: false },
        { id: `s-3`, title: 'Confirm completion', isCompleted: false }
      ]
    }));
    addedTasks = newTasks.length;

    // 3. If an exam is detected, auto-create a study plan if none exists for this subject
    const examEvent = newEvents.find(e => e.category === 'exam');
    let newPlan: StudyPlan | null = null;
    if (examEvent) {
      const subject = examEvent.title.replace(/exam|midterm|mid-term|test|assessment/gi, '').trim() || 'Core Subject';
      const hasExistingPlan = state.studyPlans.some(plan =>
        plan.subject.trim().toLowerCase() === subject.trim().toLowerCase()
      );

      if (!hasExistingPlan) {
        newPlan = {
        id: `plan-scan-${Date.now()}`,
        subject: subject,
        examDate: examEvent.date,
        totalDaysAvailable: 4,
        dailyStudyMinutes: 60,
        targetGradeOrGoal: 'Ace the upcoming exam',
        weakTopicsIdentified: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [
          { day: 1, topic: `${subject} Fundamentals`, focusArea: 'Core concepts and formulas', estimatedMinutes: 60, completed: false },
          { day: 2, topic: `${subject} Problem Solving`, focusArea: 'Past papers and MCQ drills', estimatedMinutes: 60, completed: false },
          { day: 3, topic: `${subject} Mock Exam & Review`, focusArea: 'Full speed assessment and doubt clearance', estimatedMinutes: 60, completed: false }
        ]
        };
        planCreated = true;
      }
    }

    setState(prev => ({
      ...prev,
      events: [...newEvents, ...prev.events],
      tasks: [...newTasks, ...prev.tasks],
      studyPlans: newPlan ? [newPlan, ...prev.studyPlans] : prev.studyPlans,
      activeStudyPlanId: newPlan ? newPlan.id : prev.activeStudyPlanId,
      scans: [scan, ...prev.scans.filter(s => s.id !== scan.id)]
    }));

    return { addedTasks, addedEvents, planCreated };
  };

  const setCustomApiKey = (key: string) => {
    setState(prev => ({ ...prev, customApiKey: key }));
  };

  const setAiMode = (mode: 'gemini' | 'simulation') => {
    setState(prev => ({ ...prev, aiMode: mode }));
  };

  const setAiProvider = (provider: SharedAppState['aiProvider']) => {
    setState(prev => ({ ...prev, aiProvider: provider }));
  };

  const setAiBaseUrl = (url: string) => {
    setState(prev => ({ ...prev, aiBaseUrl: url }));
  };

  const setAiModel = (model: string) => {
    setState(prev => ({ ...prev, aiModel: model }));
  };

  const setAvailableModels = (models: SharedAppState['availableModels']) => {
    setState(prev => ({ ...prev, availableModels: models }));
  };

  const getCurrentAiConfig = useCallback(() => getAiConfig(
    state.customApiKey,
    state.aiMode,
    state.aiProvider,
    state.aiBaseUrl,
    state.aiModel
  ), [state.customApiKey, state.aiMode, state.aiProvider, state.aiBaseUrl, state.aiModel]);

  const resetToDemoData = () => {
    setState(initialDemoState);
  };

  return (
    <SharedContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStep,
        breakdownTaskWithAI,
        addEvent,
        deleteEvent,
        addStudyPlan,
        updateStudyPlan,
        setActiveStudyPlan,
        toggleMilestone,
        adaptStudyPlanFromQuiz,
        recordQuizResult,
        addScanResult,
        dispatchScanToApp,
        setCustomApiKey,
        setAiMode,
        setAiProvider,
        setAiBaseUrl,
        setAiModel,
        setAvailableModels,
        getAiConfig: getCurrentAiConfig,
        resetToDemoData
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = (): SharedContextValue => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error('useSharedContext must be used within a SharedProvider');
  }
  return context;
};
