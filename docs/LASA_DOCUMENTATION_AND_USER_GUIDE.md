# L.A.S.A. — Documentation and User Guide

**Local AI Smartphone Assistant**  
**Document version:** 1.0  
**Release baseline:** GitHub `main` at commit [`aefa0e9`](https://github.com/Kaustubh-Negi-01/L.A.S.A_System/commit/aefa0e9)  
**Live prototype:** [lasa-smartphone-assistant.vercel.app](https://lasa-smartphone-assistant.vercel.app)

## 1. Purpose and product overview

L.A.S.A. is a browser-based prototype for a local-first smartphone assistant. It groups common assistant behavior into three task-oriented modes rather than presenting one undifferentiated chat surface:

| Mode | Primary purpose | Typical outcome |
|---|---|---|
| **AI Study Coach** | Learn, explain, practice, and adapt | A study plan, flashcards, quiz feedback, and remedial work |
| **AI Understand & Act** | Interpret documents, notices, images, and schedules | Extracted insights, dates, action items, follow-up answers, and cross-mode actions |
| **AI Productivity** | Plan, prioritize, and execute | Recommendations, tasks, sub-steps, completion states, and calendar events |

The prototype is designed to demonstrate a connected assistant loop: information can be understood in one mode, converted into work, and then followed through in another. For example, a scanned exam notice can produce calendar entries and tasks, create or inform a study plan, and become part of the user’s ongoing productivity view.

> **Prototype status:** L.A.S.A. is a demonstration and evaluation build. It uses browser storage, demo data, optional live AI providers, and graceful simulation fallbacks. It is not a hosted multi-user productivity system or a secure secret-management product.

## 2. Quick start for users

Open the canonical deployment at [https://lasa-smartphone-assistant.vercel.app](https://lasa-smartphone-assistant.vercel.app). The startup screen presents the three modes. Select a mode to enter its workspace. The mode cards use distinct visual motifs—paper and sparks for Study, focus and scanning elements for Understand, and organized task layers for Productivity—while maintaining one shared L.A.S.A. visual language.

The top device bar contains global controls. The theme control switches between the available display themes, the reset control restores the demo state, and the settings control opens assistant configuration. The bottom area identifies the active mode and supports navigation between workspaces where the current build exposes those controls.

For a reliable first demonstration, begin in **AI Understand & Act**, choose one of the sample poster presets, run the extraction, review the generated events and action items, dispatch them to the other modes, and then inspect the resulting tasks and study content.

## 3. Core navigation

### 3.1 Selecting and changing modes

Mode selection is available at startup and through **Switch mode** in Assistant Settings. Selecting a card briefly communicates the transition before opening the workspace. The transition is intentionally short and should not be interpreted as an AI processing state.

The prototype also supports keyboard shortcuts when the user is not typing into an input or text area:

| Key | Destination |
|---|---|
| `1` | Understand / visual workspace |
| `2` | Study workspace |
| `3` | Productivity workspace |
| `Escape` | Close Settings when it is open |

The device frame also supports gesture-oriented interaction. Swipe-back moves toward the previous workspace, swipe-forward moves toward the next workspace, and swipe-up returns to the mode selector. Pulling down the device surface opens the system-style notification shade when the gesture is available in the current viewport.

### 3.2 Global overlays

The device frame provides a lock-screen presentation and a notification-shade presentation. These are part of the prototype’s smartphone metaphor rather than operating-system integrations. The notification shade contains quick controls for Wi-Fi, sound, haptics, and display behavior, a focus-timer widget, a next-up shortcut, and routes to Settings or device lock. Overlay actions are local UI actions and do not alter a real device’s operating-system settings.

### 3.3 Motion and feedback

L.A.S.A. uses small interaction cues to communicate selection, press acknowledgement, opening and closing states, completion, and mode transitions. The system avoids making every icon continuously animated. Users who prefer reduced motion receive a less animated presentation through the browser’s `prefers-reduced-motion` setting.

## 4. AI Study Coach

AI Study Coach is the learning workspace. It combines an active study plan with flashcards, milestones, concept explanations, quizzes, and adaptive feedback.

### 4.1 Study dashboard

The dashboard shows the active plan, subject, exam date, daily study allocation, target goal, progress percentage, flashcards, and daily milestones. Milestones can be marked complete. Each milestone can expose two focused actions:

| Action | Function |
|---|---|
| **Explain** | Opens a concept explanation for the selected topic |
| **Quiz** | Opens a topic-focused quiz for the selected milestone |

The dashboard also provides **New Plan**, which opens the adaptive study-plan generator, and **Take Quiz**, which starts a quiz for the active plan.

### 4.2 Creating a study plan

Select **New Plan** and provide a subject or course. The generator accepts an exam date, daily study time, target goal, and optional known weak topics. The prototype includes quick templates for common demonstration scenarios, which populate the form with example subjects and weaknesses.

Choose **Generate Adaptive Plan (AI)** to create the plan. When live AI is unavailable or the application is using Demo Simulation, the prototype uses local mock generation so the interaction remains demonstrable. Use **Back to Study Dashboard** to leave the generator without creating a plan.

### 4.3 Flashcards and quizzes

Flashcards are presented as a compact learning interaction associated with the active plan. Quizzes generate topic-aware multiple-choice questions. A quiz proceeds through answer selection and a **Next** or **Submit & Analyze** action, depending on the current question. After submission, the result view can show correctness, score, analysis, and adaptive feedback.

Quiz results participate in the prototype’s adaptive loop. Weak topics can be added to the study plan, a remedial milestone can be created, and a high-priority reinforcement task can be added to Productivity. This is the central cross-mode learning behavior: assessment does not end at a score; it can create a next action.

### 4.4 Concept explanation and mistake analysis

Use **Explain** on a milestone to open the concept explainer. After a quiz, the mistake-analysis view summarizes the result and provides routes back to the adapted study plan or the dashboard. The exact wording may vary depending on whether the result came from live AI or the simulation dataset.

## 5. AI Understand & Act

Understand is the prototype’s multimodal intake and orchestration workspace. It accepts visual or textual source material, extracts structured information, and turns that information into action.

### 5.1 Starting a scan

Select **New Scan** or the scanner entry point. The scanner supports three intake approaches:

| Input | How it works | Fallback behavior |
|---|---|---|
| **Demo sample poster** | Select a built-in sample such as a notice, exam, or schedule | Always available for demonstrations |
| **Upload File** | Choose an image from the browser file picker | Uses local simulation if live vision is unavailable |
| **Live Camera** | Requests the device camera and captures a frame | Displays a camera error and suggests upload or presets if permission is unavailable |

For live camera use, grant browser camera permission when prompted. If the preview is still initializing, wait briefly before selecting **Capture Snapshot**. Camera tracks are stopped when the preview is cancelled, a frame is captured, or the scanner is unmounted.

### 5.2 Extracting and reviewing insights

After choosing a sample or image, select **Extract & Understand (AI)**. The result view can contain a title, summary, dates, extracted events, action items, suggested actions, and follow-up interaction. When live AI is unavailable, the prototype produces a deterministic demo or fallback result rather than leaving the user with a blank state.

The extracted result supports actions such as adding individual action items as tasks, adding all action items to tasks, adding events to the calendar, opening a Google Calendar template for an event, asking a follow-up question, and moving to a related Study or Productivity view.

### 5.3 Dispatching to all modes

**Dispatch to All Modes** is the main orchestration action. It deduplicates previously linked events and tasks, creates tasks from action items, adds extracted calendar events, and can create a study plan when an exam event is detected and no matching plan exists. The dispatch summary communicates what was added. Repeating dispatch should not continually duplicate the same linked records.

Use **Scan Another Document** to return to scanner intake and process another source. Use the workspace navigation or a cross-mode action to inspect the resulting study plan or task list.

## 6. AI Productivity

Productivity is the execution workspace. It combines a next-action recommendation with task management and a compact calendar.

### 6.1 Next-action recommendation

The recommendation area proposes a useful next action based on current tasks and application state. **Refresh Recommendation** requests a fresh recommendation. **Execute Recommendation** applies the proposed action when it maps to a supported workflow, such as focusing a task or navigating to a relevant mode. Recommendations update when task state changes so that completed or newly added work does not leave stale advice on screen.

### 6.2 Managing tasks

Select **Add Task**, enter a title, and optionally provide a description, priority, and due date. **Save Task** adds the task to the local task state. Tasks can be filtered using **Open**, **All**, and **Done**. The completion control toggles an open task to completed and allows completed work to be reopened. Completing a task provides a small success acknowledgement.

Each task can expose sub-steps. Use the sub-step toggle to expand or collapse them. Individual steps can be completed, and the application can request an AI-generated breakdown through the task’s breakdown action. If live AI is unavailable, the local simulation or existing task steps keep the flow usable.

Tasks created by other modes carry source context where applicable. For example, tasks dispatched from a scan are marked as scanned work, while remedial tasks created from quiz analysis are associated with Study Coach behavior.

### 6.3 Managing calendar events

The calendar panel displays extracted or manually added events. Select the add-event control, enter an event title, choose a date and time, and select **Save**. Saved events appear in the local event list and expose deletion and Google Calendar-template actions.

The Google Calendar action opens a prefilled external template URL. It does not silently create an event in the user’s calendar; the user must review and confirm the external calendar action.

## 7. Settings and AI configuration

Open **Assistant Settings** from the device header or a system overlay. Settings are intended for prototype evaluation and provider experimentation.

### 7.1 Execution modes

| Setting | Behavior |
|---|---|
| **Demo Simulation** | Uses local mock generation and requires no API key |
| **Live Gemini API** | Uses Gemini when a valid key and model configuration are available |
| **OpenAI-compatible gateway** | Uses the application’s thin proxy route for compatible providers and custom base URLs |

The exact provider options depend on the current release build. The settings surface can expose a primary provider, base URL, model identifier, optional secondary fallback provider, and model discovery controls.

### 7.2 Credentials and fallback

API keys are entered in the browser settings surface and persisted as part of local application state. The application can use a secondary provider when the primary live provider fails, if the secondary key and configuration are present. Requests have a bounded timeout, and provider errors are surfaced as readable messages before the application falls back where supported.

> **Security warning:** Do not enter production secrets into this prototype. The UI is designed for local evaluation. Keys are sent from the browser to the selected provider or the configured compatibility proxy and are not a substitute for a production secrets-management system.

### 7.3 Model discovery and connection testing

Where supported, **Discover** requests available models from the selected provider and makes them selectable. **Test connection** sends a minimal connectivity request. These actions require live credentials; Demo Simulation intentionally does not attempt a provider connection.

### 7.4 Resetting demo data

Use **Reset demo data** to restore the initial demonstration state. This removes the current locally persisted application state and reloads the built-in demo records, including the starting tasks, events, study plans, and histories.

## 8. Data model, persistence, and privacy

L.A.S.A. has no conventional application database in the prototype. Shared state is held in a React context and automatically serialized to browser `localStorage` under the application’s local state key. The persisted state includes tasks, task steps, events, study plans, quiz history, scan results, provider settings, and related configuration.

| Data category | Prototype behavior |
|---|---|
| Tasks and steps | Stored locally and updated immediately in the shared context |
| Calendar events | Stored locally; Google Calendar is an optional external handoff |
| Study plans and quiz history | Stored locally and used by the adaptive loop |
| Scan results | Stored locally for the current browser profile |
| AI configuration | Stored locally, including user-entered provider settings |
| Live AI content | Sent to the selected configured provider when live mode is enabled |

Clearing site data, changing browser profiles, using private browsing, or resetting demo data can remove or replace the local state. The prototype does not provide account-based synchronization between devices.

## 9. Troubleshooting

### The screen shows demo content instead of live AI output

Confirm that the application is not set to Demo Simulation, that the provider key is present, and that the selected model and base URL are correct. If a live request fails, use Demo Simulation to continue evaluating the user interface.

### Camera capture does not work

Check browser camera permission and confirm that the page is served from a context where camera access is allowed. If permission is denied or no camera is available, use Upload File or a sample poster preset. The scanner is intentionally designed to remain usable without a camera.

### A task, event, or study plan seems to disappear

Check the active task filter, especially Open versus Done. Confirm that the browser has not cleared site storage and that Reset demo data has not been invoked. Use All in the task filter to distinguish filtering from deletion.

### A provider request times out

Verify the network connection, provider base URL, API key, and model identifier. The prototype applies a bounded request timeout. If a secondary provider is configured, it may be used after primary failure; otherwise the operation should return a visible error or local fallback where that feature supports one.

### Mode switching appears delayed

Mode selection uses a short transition so that the selection state is visible before the workspace changes. Wait for the transition to complete rather than clicking another mode immediately.

## 10. Developer setup

The project is a Vite-powered React 18 TypeScript application. The repository contains the application source under `src/` and the optional serverless compatibility route under `api/ai-proxy.js`.

```bash
git clone https://github.com/Kaustubh-Negi-01/L.A.S.A_System.git
cd L.A.S.A_System
npm install
npm run dev
```

The local Vite development server normally runs at `http://localhost:5173`. The production build can be checked with:

```bash
npm run build
npm run preview
```

The main application composition is in `src/App.tsx`. Shared state and cross-mode orchestration live in `src/context/SharedContext.tsx`. The primary feature areas are organized under `src/components/study/`, `src/components/visual/`, `src/components/productivity/`, `src/components/settings/`, and `src/components/system/`.

### Important implementation boundaries

The prototype’s architecture deliberately keeps most state and interaction logic in the browser. The compatibility route in `api/ai-proxy.js` is a thin forwarding layer for OpenAI-compatible model requests; it is not a general backend, identity system, database, or policy engine. Any production evolution should introduce explicit authentication, server-side secret handling, data validation, persistence, rate limiting, audit logging, and provider governance.

## 11. Verification baseline

The release baseline was exercised with an automated browser suite containing 30 checks. The suite covered the startup selector, global controls, mode transitions, Settings behavior, scanner intake and fallback, dispatch, Productivity recommendations, task and calendar operations, study-plan generation, quizzes, concept explanation, system overlays, keyboard shortcuts, mobile overflow, reduced-motion behavior, and browser error checks.

The final connected-computer run completed with:

```text
RESULT passed=30 failed=0 total=30
```

This result confirms the tested prototype paths at the release baseline; it does not guarantee behavior for every browser, camera, provider, network, or user-generated input.

## 12. Deployment baseline

The canonical production deployment is:

> [https://lasa-smartphone-assistant.vercel.app](https://lasa-smartphone-assistant.vercel.app)

The repository’s synchronized `main` branch contains the documented audit suite at commit [`aefa0e9`](https://github.com/Kaustubh-Negi-01/L.A.S.A_System/commit/aefa0e9). A deployment preview URL may differ between releases, but the canonical alias should remain the primary link for demonstrations and testing.

## 13. Known limitations and responsible next steps

The prototype does not yet provide user accounts, multi-device synchronization, a durable database, production-grade secret storage, guaranteed OCR accuracy, enterprise permissions, background notifications, or a complete audit trail. Camera and live-provider behavior depends on browser permissions, network availability, provider limits, and model compatibility. Demo Simulation is intentionally useful for showcasing flows, but its outputs should not be treated as authoritative real-world analysis.

The recommended next step is controlled user evaluation rather than additional unbounded feature expansion. Preserve the verified release baseline, collect feedback from realistic Study, Understand, and Productivity tasks, and convert only confirmed defects or high-value usability findings into isolated changes.

## 14. Glossary

| Term | Meaning |
|---|---|
| **Active mode** | The workspace currently selected by the user |
| **Demo Simulation** | Local mock behavior that avoids requiring a live AI key |
| **Dispatch** | The Understand action that distributes extracted information to tasks, calendar, and study workflows |
| **Fallback** | A local or secondary-provider path used when the primary operation is unavailable |
| **Local-first** | A design in which the main prototype state is held and persisted in the browser |
| **Scan result** | Structured output produced from a sample, uploaded image, camera frame, or fallback simulation |
| **Source context** | Metadata linking a task or event to the scan or study workflow that created it |

## References

[1]: https://github.com/Kaustubh-Negi-01/L.A.S.A_System "L.A.S.A. System GitHub repository"

[2]: https://github.com/Kaustubh-Negi-01/L.A.S.A_System/commit/aefa0e9 "L.A.S.A. release baseline commit aefa0e9"

[3]: https://lasa-smartphone-assistant.vercel.app "L.A.S.A. production prototype on Vercel"
