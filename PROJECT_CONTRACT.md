# PROJECT_CONTRACT.md — Interfaces, Schemas & API Specifications

This document defines the strict data contracts between all components, modules, and AI services in L.A.S.A. Every team member MUST adhere to these types and signatures.

---

## 1. Data Models & TypeScript Interfaces

### A. Core Shared State Types

```typescript
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
  dueDate?: string; // ISO string 'YYYY-MM-DD'
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
  actionSuggested: string[]; // e.g., ['Create Study Plan', 'Add Reminder Task']
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
  userAnswers: { [questionId: string]: number }; // questionId -> selectedIndex
  weakTopics: string[];
  strengths: string[];
  adaptiveFeedback: string;
  recommendedNextMilestone?: string;
  completedAt: string;
}

// --- 4. Global Context Envelope ---
export interface SharedAppState {
  tasks: Task[];
  events: ExtractedEvent[];
  studyPlans: StudyPlan[];
  activeStudyPlanId: string | null;
  quizHistory: QuizResult[];
  scans: VisualScanResult[];
  aiQuotaExceeded: boolean;
}
```

---

## 2. AI Service Function Contracts (`geminiService.ts`)

### Contract 1: `extractVisualInsights`
* **Owner**: Hamza / Santhosh
* **Description**: Receives an image base64 string, extracts structured event information, dates, summaries, and action suggestions.
* **Function Signature**:
  ```typescript
  async function extractVisualInsights(
    imageBase64: string, 
    mimeType: string
  ): Promise<VisualScanResult>
  ```
* **Input Schema**:
  - `imageBase64`: Base64 encoded string of image data.
  - `mimeType`: e.g. `'image/png'`, `'image/jpeg'`.
* **Output Schema (JSON structure expected from Gemini)**:
  ```json
  {
    "title": "Data Structures Midterm Announcement",
    "summary": "Poster announcing the midterm exam schedule and venue.",
    "extractedDates": ["2026-09-02"],
    "extractedEvents": [
      {
        "title": "Data Structures Midterm Exam",
        "date": "2026-09-02",
        "time": "14:00",
        "location": "Auditorium Hall B",
        "category": "exam",
        "description": "Covers Trees, Graphs, and Dynamic Programming",
        "actionSuggested": ["Create Study Plan", "Set Prep Task"]
      }
    ],
    "actionItems": [
      "Revise Trees & Graphs",
      "Bring Student ID Card"
    ]
  }
  ```
* **Error Behavior**: If API fails, returns formatted fallback mock scan result for demo.

---

### Contract 2: `generateStudyPlan`
* **Owner**: Kaustubh (Lead) / Hamza
* **Description**: Builds an adaptive multi-day schedule broken down by topic and daily minutes.
* **Function Signature**:
  ```typescript
  export interface StudyPlanRequest {
    subject: string;
    examDate: string;
    dailyMinutes: number;
    goal: string;
    knownWeaknesses?: string[];
  }

  async function generateStudyPlan(
    req: StudyPlanRequest
  ): Promise<StudyPlan>
  ```
* **Output Schema**:
  ```json
  {
    "subject": "Operating Systems",
    "examDate": "2026-09-10",
    "totalDaysAvailable": 5,
    "dailyStudyMinutes": 90,
    "targetGradeOrGoal": "Score 90%+ / Grade A",
    "weakTopicsIdentified": ["Virtual Memory", "Deadlocks"],
    "milestones": [
      {
        "day": 1,
        "topic": "Process Synchronization & Semaphores",
        "focusArea": "Mutex, Semaphores, Classical IPC problems",
        "estimatedMinutes": 90,
        "completed": false
      }
    ]
  }
  ```

---

### Contract 3: `generateQuiz`
* **Owner**: Kaustubh (Lead)
* **Description**: Generates 3-5 multiple-choice questions for a specific topic to test comprehension.
* **Function Signature**:
  ```typescript
  export interface QuizRequest {
    subject: string;
    topic: string;
    questionCount?: number; // default: 4
    difficulty?: 'easy' | 'medium' | 'hard';
  }

  async function generateQuiz(
    req: QuizRequest
  ): Promise<QuizQuestion[]>
  ```
* **Output Schema**:
  ```json
  [
    {
      "id": "q1",
      "question": "Which scheduling algorithm may lead to starvation?",
      "options": ["Round Robin", "Shortest Job First (SJF)", "First-Come-First-Served (FCFS)", "FIFO"],
      "correctOptionIndex": 1,
      "explanation": "SJF can starve longer processes if shorter processes keep arriving.",
      "topicTag": "CPU Scheduling"
    }
  ]
  ```

---

### Contract 4: `evaluateQuizAndAdapt`
* **Owner**: Kaustubh (Lead)
* **Description**: Takes user answers, calculates score, isolates weak concepts, and generates an adaptive recovery plan.
* **Function Signature**:
  ```typescript
  export interface QuizEvaluationRequest {
    subject: string;
    studyPlanId?: string;
    questions: QuizQuestion[];
    userAnswers: { [questionId: string]: number };
  }

  async function evaluateQuizAndAdapt(
    req: QuizEvaluationRequest
  ): Promise<QuizResult>
  ```
* **Output Schema**:
  ```json
  {
    "subject": "Operating Systems",
    "score": 1,
    "totalQuestions": 3,
    "percentage": 33.3,
    "weakTopics": ["Page Replacement Algorithms", "Banker's Algorithm"],
    "strengths": ["Process States"],
    "adaptiveFeedback": "You struggled with memory page faults. We recommend spending an extra 30 mins on LRU & FIFO simulations before moving forward.",
    "recommendedNextMilestone": "Dedicated Remedial: Virtual Memory & Page Faults"
  }
  ```

---

### Contract 5: `breakdownTask`
* **Owner**: Hamza
* **Description**: Breaks a complex task into 3-5 bite-sized, actionable sub-steps.
* **Function Signature**:
  ```typescript
  async function breakdownTask(
    taskTitle: string, 
    description?: string
  ): Promise<TaskStep[]>
  ```
* **Output Schema**:
  ```json
  [
    {"id": "step-1", "title": "Gather class notes on Graph Theory", "isCompleted": false},
    {"id": "step-2", "title": "Implement Dijkstra's Algorithm in Code", "isCompleted": false},
    {"id": "step-3", "title": "Solve 3 practice questions on LeetCode", "isCompleted": false}
  ]
  ```

---

### Contract 6: `recommendNextAction`
* **Owner**: Hamza
* **Description**: Synthesizes tasks, upcoming exam dates, and recent quiz weaknesses to produce a single prominent "Smart Next Action".
* **Function Signature**:
  ```typescript
  export interface NextActionRecommendation {
    headline: string;
    reason: string;
    actionType: 'start_quiz' | 'study_milestone' | 'urgent_task' | 'relax';
    referenceId?: string;
    urgency: 'high' | 'medium' | 'low';
  }

  async function recommendNextAction(
    state: SharedAppState
  ): Promise<NextActionRecommendation>
  ```

---

## 3. Storage Key Contracts

* **Primary Key**: `'lasa_shared_state'`
* **API Key Override**: `'lasa_gemini_api_key'` (Allows user to paste custom key in UI settings if needed).
