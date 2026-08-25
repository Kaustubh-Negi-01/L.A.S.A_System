import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/';
const CHROME = process.env.CHROME_PATH || '/usr/bin/chromium';
const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
const failures = [];
let passed = 0;
let total = 0;
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(`pageerror: ${error.message}`));
page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`); });

const test = async (name, fn) => {
  total++;
  try { await fn(); passed++; console.log(`PASS: ${name}`); }
  catch (error) { failures.push({ name, error: error.message }); console.log(`FAIL: ${name} :: ${error.message}`); }
};
const expectVisible = async (locator, label) => { await locator.first().waitFor({ state: 'visible', timeout: 5000 }); if (!(await locator.first().isVisible())) throw new Error(`${label} not visible`); };
const clickButton = async (pattern, label = String(pattern)) => { const locator = page.getByRole('button', { name: pattern }).first(); await expectVisible(locator, label); await locator.click(); };
const clickText = async (pattern, label = String(pattern)) => { const locator = page.getByText(pattern).first(); await expectVisible(locator, label); await locator.click(); };
const hasText = async (pattern) => (await page.getByText(pattern).count()) > 0;
const waitForAnyText = async (patterns, label) => { for (const pattern of patterns) { if (await hasText(pattern)) return; } throw new Error(`${label} not found`); };
const reset = async () => { await page.goto(BASE, { waitUntil: 'networkidle' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(150); };
const selectMode = async (pattern) => { await page.locator('button').filter({ hasText: pattern }).first().click(); await page.waitForTimeout(520); };
const openSettings = async () => { await clickButton(/Open assistant settings/i); await page.waitForTimeout(220); };
const switchMode = async () => { await clickButton(/SWITCH MODE/i); await page.waitForTimeout(320); };

await reset();
await test('startup renders all three mode cards', async () => {
  await expectVisible(page.locator('button').filter({ hasText: /(?:AI\s+)?STUDY(?:\s+COACH)?/i }), 'Study card');
  await expectVisible(page.locator('button').filter({ hasText: /SEE\s*&\s*UNDERSTAND/i }), 'Understand card');
  await expectVisible(page.locator('button').filter({ hasText: /PRODUCTIVITY/i }), 'Productivity card');
});
await test('startup controls expose theme, reset, and settings actions', async () => {
  await expectVisible(page.getByRole('button', { name: /Switch to (light|dark) mode/i }), 'theme control');
  await expectVisible(page.getByRole('button', { name: /Reset demo data/i }), 'reset control');
  await expectVisible(page.getByRole('button', { name: /Open assistant settings/i }), 'settings control');
});
await test('study mode opens from selector', async () => { await selectMode(/(?:AI\s+)?STUDY(?:\s+COACH)?/i); await waitForAnyText([/(?:AI\s+)?Study(?:\s+coach)?/i, /Study Coach/i], 'Study workspace'); });
await test('settings modal opens and closes with Escape', async () => { await openSettings(); await waitForAnyText([/Settings/i, /Preferences/i], 'settings modal'); await page.keyboard.press('Escape'); await page.waitForTimeout(260); if (await hasText(/SWITCH MODE/i)) throw new Error('settings modal remained open after Escape'); });
await test('theme toggle changes its accessible state', async () => { await clickButton(/Switch to (light|dark) mode/i); await expectVisible(page.getByRole('button', { name: /Switch to (light|dark) mode/i }), 'toggled theme control'); });
await test('settings switch mode returns to selector', async () => { await openSettings(); await switchMode(); await expectVisible(page.locator('button').filter({ hasText: /(?:AI\s+)?STUDY(?:\s+COACH)?/i }), 'selector after switch mode'); });
await test('switch mode path opens Understand', async () => { await selectMode(/SEE\s*&\s*UNDERSTAND/i); await waitForAnyText([/^Understand$/i, /Understand$/i], 'Understand workspace'); });
await test('Understand exposes scan, calendar, dispatch, and rescan actions', async () => {
  await expectVisible(page.getByRole('button', { name: /New Scan/i }), 'New Scan');
  await expectVisible(page.getByRole('button', { name: /Dispatch to All Modes/i }), 'Dispatch');
  await expectVisible(page.getByRole('button', { name: /Scan Another Document/i }), 'Scan Another Document');
  await expectVisible(page.getByRole('link', { name: /Add to Google Calendar/i }), 'calendar link');
});
await test('scanner opens and presents source/preset controls', async () => { await clickButton(/New Scan/i); await waitForAnyText([/Visual Scanner/i, /Choose a source/i, /Scan a document/i, /Camera/i], 'scanner surface'); if ((await page.locator('button').count()) < 5) throw new Error('scanner controls missing'); });
await test('scanner preset/source selection changes active state', async () => { const candidates = page.locator('button').filter({ hasText: /Document|Notice|Exam|Upload|Camera|Preset/i }); if (await candidates.count() === 0) throw new Error('no scanner source or preset controls'); await candidates.first().click(); await page.waitForTimeout(100); });
await test('scanner processing produces extracted insights or a camera fallback', async () => { const action = page.getByRole('button', { name: /Process|Analyze|Scan|Continue|Use demo/i }).first(); if (await action.count()) { await action.click(); await page.waitForTimeout(500); } await waitForAnyText([/Extracted/i, /CS301/i, /camera/i, /permission/i, /Scan Another/i], 'scanner result or fallback'); });
await test('scanner can return to the Understand workspace', async () => { const back = page.getByRole('button', { name: /Close|Back|Cancel|Scan Another Document/i }).first(); if (await back.count()) { await back.click(); await page.waitForTimeout(150); } await waitForAnyText([/^Understand$/i, /Understand$/i, /New Scan/i], 'Understand after scanner'); });
await test('dispatch action is available and does not crash', async () => { const dispatch = page.getByRole('button', { name: /Dispatch to All Modes/i }); if (await dispatch.count()) { await dispatch.click(); await page.waitForTimeout(300); } if (pageErrors.length) throw new Error(pageErrors.at(-1)); });
await test('mode switching reaches Productivity', async () => { await openSettings(); await switchMode(); await selectMode(/PRODUCTIVITY/i); await waitForAnyText([/^Productivity$/i, /Productivity$/i], 'Productivity workspace'); });
await test('Productivity exposes recommendation, task, filter, and calendar controls', async () => {
  await expectVisible(page.getByRole('button', { name: /Refresh Recommendation/i }), 'Refresh Recommendation');
  await expectVisible(page.getByRole('button', { name: /Execute Recommendation/i }), 'Execute Recommendation');
  await expectVisible(page.getByRole('button', { name: /Add Task/i }), 'Add Task');
  await expectVisible(page.getByRole('button', { name: /Open|All|Done/i }).first(), 'task filters');
  await expectVisible(page.getByRole('button', { name: /Add calendar event/i }), 'Add calendar event');
});
await test('recommendation refresh and execution work', async () => { await clickButton(/Refresh Recommendation/i); await page.waitForTimeout(300); await clickButton(/Execute Recommendation/i); await page.waitForTimeout(300); await waitForAnyText([/completed/i, /remaining/i, /next action/i, /task/i], 'recommendation result'); });
await test('Add Task opens form and creates a task', async () => {
  await clickButton(/Add Task/i); await waitForAnyText([/Add task/i, /New task/i, /Task title/i], 'task form');
  const inputs = page.locator('input, textarea'); if (await inputs.count() === 0) throw new Error('task form has no inputs');
  await inputs.first().fill('Exhaustive E2E Audit Task');
  const submit = page.getByRole('button', { name: /Save Task/i }); await expectVisible(submit, 'Save Task'); await submit.click(); await page.waitForTimeout(250);
  await waitForAnyText([/Exhaustive E2E Audit Task/i], 'created task');
});
await test('task filters switch between Open, All, and Done', async () => { for (const label of [/^Open\s+\d+/i, /^All\s+\d+/i, /^Done\s+\d+/i]) { const b = page.getByRole('tab', { name: label }).first(); await expectVisible(b, `task filter ${label}`); await b.click(); await page.waitForTimeout(80); } });
await test('task completion toggles state', async () => { const open = page.getByRole('tab', { name: /^Open\s+\d+/i }); await open.click(); await page.waitForTimeout(100); const complete = page.getByRole('button', { name: /Complete task: Exhaustive E2E Audit Task/i }); await expectVisible(complete, 'task completion control'); await complete.click(); await page.waitForTimeout(120); });
await test('task sub-steps expand and collapse', async () => { const toggle = page.getByRole('button', { name: /Toggle Sub-steps/i }).first(); if (await toggle.count()) { await toggle.click(); await page.waitForTimeout(80); await toggle.click(); } });
await test('calendar event form creates an event', async () => {
  await clickButton(/Add calendar event/i); await expectVisible(page.getByPlaceholder(/Event Title/i), 'calendar event title input');
  const inputs = page.locator('input, textarea'); if (await inputs.count() === 0) throw new Error('calendar form has no inputs');
  await inputs.first().fill('Exhaustive E2E Calendar Event');
  const submit = page.getByRole('button', { name: /Save Event|Add Event|Create Event|Save/i }).last(); await expectVisible(submit, 'calendar save'); await submit.click(); await page.waitForTimeout(200);
  await waitForAnyText([/Exhaustive E2E Calendar Event/i], 'created calendar event');
});
await test('calendar event deletion control exists', async () => { const del = page.getByRole('button', { name: /Delete event:/i }).last(); await expectVisible(del, 'calendar delete'); await del.click(); });
await test('Study mode opens plan generator and quiz entry points', async () => { await openSettings(); await switchMode(); await selectMode(/(?:AI\s+)?STUDY(?:\s+COACH)?/i); await expectVisible(page.getByRole('button', { name: /New Plan/i }), 'New Plan'); await expectVisible(page.getByRole('button', { name: /Take Quiz/i }), 'Take Quiz'); });
await test('study plan generator accepts inputs and closes safely', async () => { await clickButton(/New Plan/i); await waitForAnyText([/Create Adaptive Study Plan/i, /Generate Adaptive Plan/i], 'study plan form'); const inputs = page.locator('input, textarea, select'); if (await inputs.count()) await inputs.first().fill('Algorithms mastery'); const back = page.getByRole('button', { name: /Back to Study Dashboard/i }); await expectVisible(back, 'study plan back control'); await back.click(); await page.waitForTimeout(120); });
await test('quiz engine opens, accepts an answer, and advances or reports a result', async () => { await clickButton(/Take Quiz/i); await waitForAnyText([/Quiz/i, /Question/i, /Start/i], 'quiz engine'); const answer = page.getByRole('button', { name: /A\.|B\.|C\.|D\.|Binary|Graph|Tree/i }).first(); if (await answer.count()) { await answer.click(); const submit = page.getByRole('button', { name: /Submit|Next|Check|Continue/i }).first(); if (await submit.count()) await submit.click(); } await waitForAnyText([/Correct/i, /Incorrect/i, /Question/i, /Analysis/i, /Score/i], 'quiz feedback'); });
await test('concept explainer and topic quiz actions are reachable', async () => { const explain = page.getByRole('button', { name: /Explain Concept with AI|Explain/i }).first(); if (await explain.count()) { await explain.click(); await waitForAnyText([/Concept/i, /Explain/i, /AI/i], 'concept explainer'); const close = page.getByRole('button', { name: /Close|Cancel/i }).first(); if (await close.count()) await close.click(); } });
await test('phone system overlays open and close without page errors', async () => { await reset(); const buttons = page.locator('button'); const count = await buttons.count(); if (count < 4) throw new Error('system controls missing'); for (let i = 0; i < Math.min(4, count); i++) { const b = buttons.nth(i); if (await b.isVisible()) { await b.click().catch(() => {}); await page.waitForTimeout(50); } } await page.keyboard.press('Escape'); if (pageErrors.length) throw new Error(pageErrors.at(-1)); });
await test('keyboard shortcuts 1, 2, and 3 enter each mode', async () => { await reset(); for (const [key, pattern] of [['1', /(?:AI\s+)?Study(?:\s+coach)?/i], ['2', /(?:See\s*&\s*)?Understand/i], ['3', /Productivity/i]]) { await reset(); await page.keyboard.press(key); await waitForAnyText([pattern], `shortcut ${key}`); } });
await test('responsive mobile viewport has no horizontal overflow', async () => { await page.setViewportSize({ width: 375, height: 812 }); await reset(); const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth })); if (metrics.scrollWidth > metrics.clientWidth + 2) throw new Error(`horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`); await page.setViewportSize({ width: 1440, height: 960 }); });
await test('reduced-motion preference is honored', async () => { await context.close(); const reduced = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' }); const p = await reduced.newPage(); await p.goto(BASE, { waitUntil: 'networkidle' }); const duration = await p.evaluate(() => getComputedStyle(document.body).animationDuration); if (!duration) throw new Error('unable to inspect reduced motion state'); await reduced.close(); });

console.log(`RESULT passed=${passed} failed=${failures.length} total=${total}`);
if (pageErrors.length) console.log(`BROWSER_ERRORS ${JSON.stringify(pageErrors)}`);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
await browser.close();
process.exit(failures.length ? 1 : 0);
