# Mode-selection refinement validation

- **Startup selector:** Displays exactly three cards with primary labels `STUDY`, `SEE & UNDERSTAND`, and `PRODUCTIVITY`.
- **Supporting copy:** `Learn • Explain • Adapt`; `Scan • Identify • Explain`; `Plan • Organize • Act`.
- **STUDY route:** Selecting the first card opened the existing Study Coach workspace with adaptive learning cycle, study plan, milestones, and quiz controls.
- **SEE & UNDERSTAND route:** Selecting the second card opened the existing Understand workspace with scan, extracted document intelligence, calendar, action items, and dispatch controls.
- **PRODUCTIVITY route:** Selecting the third card opened the existing Productivity workspace with next-action recommendation, tasks, sub-step breakdowns, and calendar.
- **Selection state:** During the existing 220 ms transition, the selected STUDY card had `is-selected`, the other two had `is-muted`, the action text was `Opening`, and the status read `Opening STUDY…`.
- **Browser console:** No console output or runtime errors after exercising all three routes.
- **Build:** `npm run build` passed; `git diff --check` passed.
