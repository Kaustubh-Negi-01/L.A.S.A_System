# L.A.S.A. Release Checklist and Demo Runbook

**Prototype:** Local AI Smartphone Assistant  
**Canonical URL:** [lasa-smartphone-assistant.vercel.app](https://lasa-smartphone-assistant.vercel.app)  
**Verified baseline:** GitHub `main`, commit [`9b8f524`](https://github.com/Kaustubh-Negi-01/L.A.S.A_System/commit/9b8f524)  
**Automated baseline:** 30/30 end-to-end checks passed

## 1. Five-minute release-readiness check

| Check | Expected result | Status |
|---|---|---|
| Open the Vercel URL | Startup selector renders with three mode cards | ☐ |
| Check global controls | Theme, reset, and Settings controls are visible | ☐ |
| Enter Study | Study dashboard, plan, flashcards, milestones, and quiz entry point render | ☐ |
| Enter Understand | Scanner, sample presets, upload, camera, and extraction action render | ☐ |
| Enter Productivity | Recommendation, tasks, filters, and calendar render | ☐ |
| Open Settings | Modal opens, closes with Escape, and Switch mode returns to selector | ☐ |
| Test persistence | Add a task, refresh the page, and confirm the task remains | ☐ |
| Test reset | Reset demo data restores the starting demonstration state | ☐ |
| Check mobile view | No horizontal overflow at a narrow viewport | ☐ |
| Check reduced motion | Browser reduced-motion preference suppresses non-essential motion | ☐ |

The release should be considered ready for demonstration when the startup screen, all three workspaces, Settings, persistence, reset behavior, and the primary cross-mode loop are working. The checklist is intentionally smaller than the full automated suite; it is intended for a quick human smoke test before sharing the link.

## 2. Recommended seven-minute live demo

### Opening: establish the product idea

Begin at the startup selector and say: “L.A.S.A. is organized around what I want to accomplish—learning, understanding information, or taking action.” Briefly point out the three cards and choose **AI Understand & Act**.

### Step 1: understand an input

In the Understand workspace, choose a demo sample poster. This avoids camera permissions and makes the demonstration deterministic. Select **Extract & Understand (AI)**. Explain that the prototype turns a source image or notice into structured information rather than leaving it as an unprocessed attachment.

Review the extracted summary, dates, and action items. If the result presents events or tasks, point out that the information is now actionable. Ask a follow-up question if the result view exposes the follow-up interaction.

### Step 2: dispatch information across the assistant

Select **Dispatch to All Modes**. Highlight the resulting synchronization summary. Explain that one understanding event can create calendar entries, tasks, and—when an exam is detected—a study plan. This is the product’s strongest demonstration moment because it connects the three modes.

### Step 3: execute the work

Open Productivity. Show the newly created work alongside the recommendation area. Select **Refresh Recommendation** if needed, then explain how the recommended next action changes when task state changes. Open a task’s sub-steps, complete the task, and show the completion acknowledgement.

Open the calendar section, add a short event, and save it. Explain that events are stored in the prototype and can be handed off to a Google Calendar template for user review; the prototype does not silently create external calendar events.

### Step 4: learn and adapt

Switch to Study using the mode selector or Settings. Show the active plan, flashcards, milestones, and **Take Quiz**. Start a quiz, select an answer, and submit or advance. Explain that quiz analysis can identify weak topics and generate remedial study work that flows back into Productivity.

### Closing: state the prototype boundary clearly

End with: “This prototype demonstrates the local-first interaction model and the cross-mode assistant loop. It supports simulation without an API key and optional live providers, but it is not yet a multi-user production system.” This framing sets accurate expectations while keeping the demonstration focused on the experience.

## 3. Backup paths during a demo

| If this happens | Use this recovery path |
|---|---|
| Camera permission is denied | Use a built-in sample poster or Upload File |
| Live AI request fails | Switch to Demo Simulation in Settings |
| A task is not visible | Check the Open, All, and Done filters |
| Demo state looks unfamiliar | Use Reset demo data, then reload the page |
| A transition appears delayed | Wait for the short selection animation to finish |
| A provider asks for configuration | Avoid live setup during the demo and use simulation |
| A calendar handoff opens externally | Return to the prototype after reviewing the template |

## 4. Do-not-break release rules

The verified baseline should remain frozen during demos. Do not add credentials to the repository, do not use real personal or confidential documents for an unreviewed live-provider demonstration, and do not present simulated output as authoritative analysis. Do not force users to grant camera permission; the sample-poster path is the preferred fallback.

For future development, make changes in a branch, rerun the full audit suite, verify the production build, and deploy only after the smoke checklist passes. Keep the canonical Vercel alias unchanged so existing demo links remain valid.

## 5. Feedback capture template

After a tester completes the demo, ask these questions:

1. Which mode did you understand most quickly, and which label or action was unclear?
2. Did the scan-to-task/calendar/study flow feel coherent or surprising?
3. Where did you expect the application to do more automatically?
4. Which action felt most valuable: explanation, extraction, recommendation, task breakdown, or adaptive quiz feedback?
5. Did any transition, permission request, or fallback interrupt your confidence?
6. What single improvement would make you use this assistant again tomorrow?

Record observations as user behavior and quotations, not as assumptions. Preserve the current verified release while collecting feedback, and prioritize only confirmed friction or high-value opportunities for the next iteration.

## 6. Release facts

| Item | Current baseline |
|---|---|
| Frontend | React 18 with Vite and TypeScript |
| State model | Shared React context with browser `localStorage` persistence |
| AI paths | Demo Simulation, Gemini, and OpenAI-compatible gateway support where configured |
| External handoff | Google Calendar template links for event review |
| Browser verification | 30 automated checks passed |
| Production URL | [lasa-smartphone-assistant.vercel.app](https://lasa-smartphone-assistant.vercel.app) |
| Source repository | [github.com/Kaustubh-Negi-01/L.A.S.A_System](https://github.com/Kaustubh-Negi-01/L.A.S.A_System) |
