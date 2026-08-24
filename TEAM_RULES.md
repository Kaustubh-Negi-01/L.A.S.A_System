# TEAM_RULES.md — Engineering Standards & Collaboration Protocols

These rules govern all engineering work on **Local AI Smartphone Assistant (L.A.S.A.)** for the iQOO Hackathon.

---

## 1. Security & Credentials
* **Never commit API Keys**: Never hardcode Gemini API keys in Git or client-side public repos.
* Use `.env.local` for local secrets (e.g. `VITE_GEMINI_API_KEY=...`).
* Provide a clean UI settings drawer where judges or evaluators can input their own Gemini API key if desired, or test with the built-in fallback engine.

---

## 2. The "Bulletproof Demo" Principle (Mock Fallback Rule)
* **Zero Failure in Front of Judges**: Every AI function in `geminiService.ts` MUST be wrapped in a failover handler.
* If Gemini API fails (network error, rate limit, quota exhaustion, missing key, invalid JSON output), the system MUST gracefully fall back to realistic, high-fidelity mock generators without throwing an uncaught error.
* The UI should indicate `AI Status: Live (Gemini)` or `AI Status: Simulation Engine (Demo Mode)`.

---

## 3. Contract & State Integrity
* **Never alter interfaces in isolation**: If any interface or contract in `PROJECT_CONTRACT.md` needs adjustment, update `PROJECT_CONTRACT.md` first and inform the team.
* **Single Source of Truth**: All shared state (Tasks, Events, Study Plans, Quiz results) MUST live in `SharedContext.tsx` and sync to `localStorage`. Components must not maintain independent divergent stores for shared items.

---

## 4. Scope Management (One-Day Prototype Constraint)
* **No Premature Complexity**: Do not add backend databases (PostgreSQL, MongoDB), user authentication (OAuth, Firebase Auth), or native Android bridges.
* **Focus on the 3 Connected Modes**: Every feature built must support either:
  1. 🎓 Study Coach (Adaptive loop: Plan -> Quiz -> Mistake Analysis -> Adaptive recommendation)
  2. 👁️ Understand & Act (Visual scanner -> Event extraction -> Action dispatcher)
  3. ⚡ Productivity Coach (Task breakdown -> Prioritization -> Next action)
* **Cross-Mode Integration is Key**: Ensure actions in one mode organically feed into another.

---

## 5. Verification Protocol
* **Do not mark a task complete without verification**:
  1. Code must compile without TypeScript or Vite build errors (`npm run build`).
  2. Component must render in the UI without runtime exceptions.
  3. The user flow must be verified end-to-end.
* **Live Update**: Update `PROJECT_STATE.md` immediately upon verifying a task.

---

## 6. UI & Design Standards (iQOO Smartphone Aesthetics)
* **Mobile-First Experience**: Present an ultra-sleek smartphone viewport on desktop and full responsive screen on mobile devices.
* **Palette & Polish**: Modern futuristic dark theme with cyber cyan/electric blue accents (`#00f0ff`, `#7000ff`, `#0a0e17`), glassmorphism cards (`backdrop-filter: blur(12px)`), subtle neon glows, and micro-animations.
* **Clarity over Clutter**: Keep text legible, buttons prominent, and interactions snappy.
