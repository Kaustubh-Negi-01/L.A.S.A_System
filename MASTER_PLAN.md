# MASTER_PLAN.md — Local AI Smartphone Assistant (L.A.S.A.)

**Event**: iQOO Hackathon  
**Target Delivery**: 1-Day Functional Web Prototype  
**Primary Stack**: React + Vite + TypeScript + Vanilla/Modern CSS + Gemini API + LocalStorage + Vercel

---

## 1. Executive Summary & Vision

**Local AI Smartphone Assistant (L.A.S.A.)** is a unified, on-device-inspired intelligent assistant tailored for students and power users. Rather than operating in isolated silos, L.A.S.A. integrates three core workflows through a **Unified Shared Context Engine**:

1. **🎓 AI Study Coach**: Adaptive learning loop (`PLAN` → `LEARN` → `TEST` → `ANALYZE` → `ADAPT`).
2. **👁️ AI Understand & Act**: Multimodal visual parser that scans documents/posters/notes, extracts actionable items (dates, deadlines, tasks), and dispatches them across the assistant.
3. **⚡ AI Productivity Coach**: Smart task management, auto-breakdown into micro-steps, intelligent prioritization, and context-aware next action recommendations.

### The Unified Cross-Mode Flow (The "Golden Demo Flow" for Judges):
```
[User uploads College Exam Schedule / Poster] 
       │ (Understand & Act)
       ▼
[AI Extracts: "Data Structures Mid-term on Friday at 2:00 PM"]
       │
       ├─► Dispatches to Calendar/Tasks ────────► [Productivity Coach: "Prepare Study Materials"]
       │                                                    │
       └─► Dispatches to Study Coach ────────────► [Study Coach: Generates 3-Day Adaptive Plan]
                                                            │
                                                   [Generates Quiz -> Identifies Weakness]
                                                            │
                                                   [Updates Study Plan & Next Task Dynamically]
```

---

## 2. Team Member Responsibilities & Matrix

| Member | Primary Modules | Key Deliverables |
| :--- | :--- | :--- |
| **Kaustubh** *(Team Lead)* | **Study Coach + Shared Context + Integration + Deployment** | • `SharedContext.tsx` & LocalStorage state store<br>• Study Coach (Adaptive cycle: Plan, Quiz, Analysis, Adaptation)<br>• End-to-end integration & verification<br>• Vercel production deployment & CI |
| **Santhosh** | **UI/UX + App Shell + Understand & Act** | • Smartphone UI Shell (iQOO neon/dark glassmorphic frame & bottom nav)<br>• Understand & Act UI (Image upload/camera capture, OCR preview, action cards)<br>• Interactive modal system & notifications |
| **Hamza** | **Gemini AI Services + Productivity Coach** | • `geminiService.ts` with structured prompt engineering & fallback mocks<br>• Productivity Coach UI & logic (Task breakdown, priority matrix, "Next Action" widget) |

---

## 3. Architecture & File Structure

A clean, modular structure that enables parallel work without merge conflicts:

```
L.A.S.A_System/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── MASTER_PLAN.md
├── PROJECT_CONTRACT.md
├── PROJECT_STATE.md
├── TEAM_RULES.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── types/
    │   └── index.ts                 # Shared TypeScript interfaces (PROJECT_CONTRACT)
    ├── context/
    │   └── SharedContext.tsx        # Central State: Tasks, Events, StudyPlans, Logs
    ├── services/
    │   ├── geminiService.ts         # Core Gemini API client & Prompt Pipelines
    │   └── mockData.ts              # Guaranteed offline demo fallbacks
    ├── components/
    │   ├── layout/
    │   │   ├── SmartphoneFrame.tsx  # Sleek mobile frame & header/status bar
    │   │   ├── BottomNav.tsx        # Seamless 3-tab navigation
    │   │   └── QuickActionFAB.tsx   # Floating Action Button for cross-mode capture
    │   ├── study/                   # Kaustubh's Domain
    │   │   ├── StudyDashboard.tsx   # Study plan overview & progress
    │   │   ├── StudyPlanGenerator.tsx
    │   │   ├── QuizEngine.tsx       # Interactive quiz with instant feedback
    │   │   ├── MistakeAnalysis.tsx  # Weak topic breakdown & recommendations
    │   │   └── AdaptiveReview.tsx   # Dynamic adaptation widget
    │   ├── visual/                  # Santhosh's Domain
    │   │   ├── VisualScanner.tsx    # Upload/drag-and-drop/camera simulate
    │   │   ├── ExtractedInsights.tsx# Smart chips (Date, Event, Action Items)
    │   │   └── ActionDispatcher.tsx # "Send to Study Plan", "Add to Tasks"
    │   └── productivity/            # Hamza's Domain
    │       ├── TaskList.tsx         # Task manager with priority tags
    │       ├── TaskBreakdownModal.tsx # AI step-by-step breakdown
    │       ├── NextActionCard.tsx   # Single "What to do right now" AI card
    │       └── MiniCalendar.tsx     # Extracted events calendar view
    └── utils/
        ├── storage.ts               # LocalStorage helpers with auto-sync
        └── helpers.ts               # Date formatters, score calculators
```

---

## 4. Implementation Order & Phased Roadmap

### Phase 1: Foundation & Shared Brain (Immediate)
1. Initialize Vite + React + TypeScript app skeleton.
2. Define TypeScript models in `src/types/index.ts`.
3. Create `SharedContext.tsx` with localStorage persistence and default demo data.
4. Implement `geminiService.ts` with Gemini API client + robust offline mock fallback mechanism.

### Phase 2: Core Feature Modules (Parallel Tracks)
* **Kaustubh**: Build Study Coach (`StudyPlanGenerator`, `QuizEngine`, `MistakeAnalysis`, `AdaptiveReview`).
* **Santhosh**: Build App Shell (`SmartphoneFrame`, `BottomNav`) and Understand & Act (`VisualScanner`, `ActionDispatcher`).
* **Hamza**: Build Productivity Coach (`TaskList`, `TaskBreakdownModal`, `NextActionCard`).

### Phase 3: Integration & Cross-Mode Pipeline
* Connect Visual Scanner outputs directly into SharedContext so "Send to Study Coach" pre-fills subject and exam dates.
* Connect Quiz Weak Topics into Productivity Coach so low-scoring topics spawn priority study tasks.
* Connect "Next Action Recommendation" to synthesize both study deadlines and productivity tasks.

### Phase 4: Polish, Testing & Deployment
* Mobile aesthetic polish (iQOO cyan/blue neon glassmorphism, smooth animations, zero layout jitter).
* Bulletproof fail-safes (if API key runs out or internet hiccups, graceful fallback to smart mock responses).
* Deployment to Vercel with clean public URL.

---

## 5. Integration Strategy

* **Central Store (`SharedContext`)**: A single React Context holding:
  - `events`: Array of calendar events extracted from posters or created manually.
  - `tasks`: Array of productivity items with sub-steps and priority.
  - `studyPlans`: Active study schedules with daily milestones.
  - `quizHistory`: Scores, answered questions, weak topic tags.
  - `recentScans`: Extracted image summaries and suggested actions.
* **Synchronization**: Any change automatically saves to `localStorage('lasa_shared_state')` so page refreshes never lose progress.

---

## 6. Deployment Strategy

* **Platform**: Vercel (Fast, free SSL, instant preview deployments).
* **Environment Variables**:
  - `VITE_GEMINI_API_KEY`: Google Gemini API Key.
* **Offline/Judge Protection**: The app checks if API Key exists and is functional; if missing or rate-limited, it automatically activates high-fidelity mock generators with a subtle indicator, ensuring judges always experience a 100% working demo without errors.
