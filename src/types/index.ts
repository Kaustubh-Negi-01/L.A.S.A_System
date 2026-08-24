// L.A.S.A. Shared Type Definitions matching PROJECT_CONTRACT.md

// --- 1. Productivity & Tasks ---
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface TaskStep {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // 'YYYY-MM-DD'
  steps: TaskStep[];
  sourceModule: 'manual' | 'visual_scanner' | 'study_coach';
  sourceReferenceId?: string;
  createdAt: string;
}

// --- 2. Calendar & Visual Insights ---
export interface ExtractedEvent {
  id: string;
  title: string;
  date: string;       // 'YYYY-MM-DD'
  time?: string;      // 'HH:mm'
  location?: string;
  category: 'exam' | 'assignment' | 'workshop' | 'competition' | 'general';
  description?: string;
  actionSuggested: string[]; // e.g. ['Create Study Plan', 'Set Prep Task']
}

export interface VisualScanResult {
  id: string;
  imageUrl?: string;
  title: string;
  summary: string;
  extractedDates: string[];
  extractedEvents: ExtractedEvent[];
  actionItems: string[];
  rawText?: string;
  scannedAt: string;
}

// --- 3. Study Coach ---
export interface StudyMilestone {
  day: number;
  topic: string;
  focusArea: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  totalDaysAvailable: number;
  dailyStudyMinutes: number;
  targetGradeOrGoal: string;
  milestones: StudyMilestone[];
  weakTopicsIdentified: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topicTag: string;
}

export interface QuizResult {
  id: string;
  studyPlanId?: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: { [questionId: string]: number }; // questionId -> selectedOptionIndex
  questions?: QuizQuestion[]; // Preserved questions for in-depth review
  weakTopics: string[];
  strengths: string[];
  adaptiveFeedback: string;
  recommendedNextMilestone?: string;
  completedAt: string;
}

export interface ConceptExplanation {
  topic: string;
  summary: string;
  keyPoints: string[];
  mnemonicOrAnalogy: string;
  commonPitfall: string;
  quickCheckQuestion: {
    question: string;
    answer: string;
  };
}

// --- 4. Global Context Envelope ---
export interface SharedAppState {
  tasks: Task[];
  events: ExtractedEvent[];
  studyPlans: StudyPlan[];
  activeStudyPlanId: string | null;
  quizHistory: QuizResult[];
  scans: VisualScanResult[];
  customApiKey: string;
  aiMode: 'gemini' | 'simulation';
}

// --- 5. AI Service Request & Response Types ---
export interface StudyPlanRequest {
  subject: string;
  examDate: string;
  dailyMinutes: number;
  goal: string;
  knownWeaknesses?: string[];
}

export interface QuizRequest {
  subject: string;
  topic: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizEvaluationRequest {
  subject: string;
  studyPlanId?: string;
  questions: QuizQuestion[];
  userAnswers: { [questionId: string]: number };
}

export interface NextActionRecommendation {
  headline: string;
  reason: string;
  actionType: 'start_quiz' | 'study_milestone' | 'urgent_task' | 'relax';
  referenceId?: string;
  urgency: 'high' | 'medium' | 'low';
}
