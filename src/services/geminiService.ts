import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  VisualScanResult,
  VisualFollowUpResponse,
  StudyPlan,
  StudyPlanRequest,
  QuizQuestion,
  QuizRequest,
  QuizResult,
  QuizEvaluationRequest,
  Flashcard,
  TaskStep,
  SharedAppState,
  NextActionRecommendation,
  AiProvider,
  AiModelOption,
} from '../types';
import {
  generateMockVisualInsights,
  generateMockVisualFollowUp,
  generateMockStudyPlan,
  generateMockQuiz,
  evaluateMockQuiz,
  generateMockFlashcards,
  generateMockConceptExplanation,
  generateMockTaskBreakdown,
  generateMockNextAction
} from './mockData';

// Provider-neutral AI configuration. The browser prototype supports Gemini and
// OpenAI-compatible gateways (including custom base URLs such as OneTap).
export type AiMode = 'gemini' | 'simulation';

export interface AiConfig {
  apiKey: string;
  mode: AiMode;
  provider: AiProvider;
  baseUrl: string;
  model: string;
}

const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
const AI_REQUEST_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out after ${AI_REQUEST_TIMEOUT_MS / 1000}s`)), AI_REQUEST_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  });
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, label: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`${label} timed out after ${AI_REQUEST_TIMEOUT_MS / 1000}s`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function trimBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function getActiveApiKey(customKey?: string, mode: AiMode = 'gemini', provider: AiProvider = 'gemini'): string {
  if (mode === 'simulation') return '';
  if (customKey && customKey.trim().length > 10) return customKey.trim();
  if (provider !== 'gemini') return '';
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return (typeof envKey === 'string' && envKey.trim().length > 10) ? envKey.trim() : '';
}

export function getAiConfig(
  customKey?: string,
  mode: AiMode = 'gemini',
  provider: AiProvider = 'gemini',
  baseUrl: string = DEFAULT_GEMINI_BASE_URL,
  model: string = DEFAULT_GEMINI_MODEL
): AiConfig {
  const apiKey = getActiveApiKey(customKey, mode, provider);
  return {
    apiKey,
    mode,
    provider,
    baseUrl: trimBaseUrl(baseUrl || (provider === 'gemini' ? DEFAULT_GEMINI_BASE_URL : '')),
    model: model.trim() || (provider === 'gemini' ? DEFAULT_GEMINI_MODEL : 'onetap-1')
  };
}

function mapModelOptions(payload: any): AiModelOption[] {
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.models) ? payload.models : [];
  return data
    .map((model: any) => {
      const rawId = String(model?.id || model?.name || '').replace(/^models\//, '').trim();
      if (!rawId) return null;
      return { id: rawId, label: rawId, ownedBy: model?.owned_by || model?.publisher };
    })
    .filter(Boolean) as AiModelOption[];
}

export async function listAvailableModels(config: Omit<AiConfig, 'model' | 'mode'> & { mode?: AiMode }): Promise<AiModelOption[]> {
  if (!config.apiKey || config.mode === 'simulation') return [];
  if (config.provider === 'gemini') {
    const response = await fetch(`${trimBaseUrl(config.baseUrl || DEFAULT_GEMINI_BASE_URL)}/models?key=${encodeURIComponent(config.apiKey)}`);
    if (!response.ok) throw new Error(`Gemini model discovery failed (${response.status})`);
    const payload = await response.json();
    const models = Array.isArray(payload?.models) ? payload.models : [];
    return models
      .filter((model: any) => !Array.isArray(model?.supportedGenerationMethods) || model.supportedGenerationMethods.includes('generateContent'))
      .map((model: any) => ({
        id: String(model?.name || '').replace(/^models\//, '').trim(),
        label: String(model?.displayName || model?.name || '').replace(/^models\//, '').trim(),
        ownedBy: 'Google'
      }))
      .filter((model: AiModelOption) => Boolean(model.id));
  }

  const response = await fetchWithTimeout('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'models', baseUrl: config.baseUrl, apiKey: config.apiKey })
  }, 'Model discovery');
  if (!response.ok) throw new Error(`Model discovery failed (${response.status})`);
  return mapModelOptions(await response.json());
}

function extractChatText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part: any) => part?.text || '').join('');
  return '';
}

type GeminiImagePart = { inlineData: { data: string; mimeType: string } };

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> };

async function generateText(config: AiConfig, prompt: string, imagePart?: GeminiImagePart): Promise<string> {
  if (config.provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.model.replace(/^models\//, '') });
    const result = await withTimeout(model.generateContent(imagePart ? [prompt, imagePart] : prompt), 'Gemini request');
    return result.response.text();
  }

  const userContent = imagePart
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` } }
      ]
    : prompt;
  const response = await fetchWithTimeout('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'chat',
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      payload: { model: config.model, messages: [{ role: 'user', content: userContent } satisfies ChatMessage], temperature: 0.2 }
    })
  }, 'AI request');
  if (!response.ok) throw new Error(`AI request failed (${response.status})`);
  const text = extractChatText(await response.json());
  if (!text) throw new Error('AI provider returned no message content');
  return text;
}

export async function testAiConnection(config: AiConfig): Promise<string> {
  if (!config.apiKey || config.mode === 'simulation') throw new Error('Add an API key and choose a live provider first.');
  const response = await generateText(config, 'Reply with exactly OK.');
  return response.trim();
}

// Robust Clean JSON response from Gemini code blocks or conversational wrappers
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/) || cleaned.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1].trim();
  }
  const objectOrArrayMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (objectOrArrayMatch) {
    return objectOrArrayMatch[0].trim();
  }
  return cleaned;
}

// --- 1. Visual Insights Extraction (Multimodal) ---
export async function extractVisualInsights(
  imageBase64: string,
  mimeType: string,
  config?: AiConfig
): Promise<VisualScanResult> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;
  
  if (!apiKey) {
    console.info('Using review-required fallback for Visual Insights (No API Key)');
    return generateMockVisualInsights(undefined, 'fallback');
  }

  try {
    const prompt = `Read this image as L.A.S.A. and extract only information visible in it. Return one valid JSON object, with no markdown or commentary, using this shape:
{"title":"short image title","summary":"1-2 sentence summary","extractedDates":["YYYY-MM-DD"],"extractedEvents":[{"id":"event-1","title":"event","date":"YYYY-MM-DD","time":"","location":"","category":"exam|assignment|workshop|competition|general","description":"","actionSuggested":["..."]}],"actionItems":["..."],"keyFacts":["..."],"recommendedActions":["..."],"followUpSuggestions":["..."]}
Use empty arrays when nothing is visible. Do not guess missing dates, places, or tasks.`;

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt, imagePart));
    const parsed = JSON.parse(responseText);

    return {
      id: `scan-${Date.now()}`,
      imageUrl: imageBase64,
      title: parsed.title || 'Extracted Document',
      summary: parsed.summary || 'Image scanned successfully.',
      extractedDates: parsed.extractedDates || [],
      extractedEvents: (parsed.extractedEvents || []).map((e: any, idx: number) => ({
        id: `evt-${Date.now()}-${idx}`,
        title: e.title || 'Extracted Event',
        date: e.date || new Date().toISOString().split('T')[0],
        time: e.time || '10:00',
        location: e.location || 'Campus',
        category: e.category || 'general',
        description: e.description || '',
        actionSuggested: e.actionSuggested || ['Add to Calendar']
      })),
      actionItems: parsed.actionItems || ['Review document'],
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts.slice(0, 4) : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions.slice(0, 5) : [],
      followUpSuggestions: Array.isArray(parsed.followUpSuggestions) ? parsed.followUpSuggestions.slice(0, 4) : [],
      source: 'live',
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Visual scan failed; showing a review-required fallback:', error);
    return generateMockVisualInsights(undefined, 'fallback');
  }
}

// Sample presets in the prototype contain representative OCR text rather than a binary image.
// Route that text through the selected provider so live mode still exercises the AI pipeline.
export async function extractVisualInsightsFromText(sourceText: string, config?: AiConfig): Promise<VisualScanResult> {
  const activeConfig = config ?? getAiConfig();
  if (!activeConfig.apiKey) return generateMockVisualInsights(sourceText);

  try {
    const prompt = `You are L.A.S.A. Understand & Act.
Interpret the following OCR text from a notice, poster, timetable, or syllabus and return only valid JSON matching this schema:
{
  "title": string,
  "summary": string,
  "extractedDates": string[],
  "extractedEvents": [{ "id": string, "title": string, "date": string, "time": string, "location": string, "category": "exam" | "assignment" | "workshop" | "competition" | "general", "description": string, "actionSuggested": string[] }],
  "actionItems": string[],
  "keyFacts": string[],
  "recommendedActions": string[],
  "followUpSuggestions": string[]
}

OCR text:
${sourceText}`;
    const parsed = JSON.parse(cleanJsonResponse(await generateText(activeConfig, prompt)));
    return {
      id: `scan-${Date.now()}`,
      title: parsed.title || 'Extracted Document',
      summary: parsed.summary || 'Text interpreted successfully.',
      extractedDates: Array.isArray(parsed.extractedDates) ? parsed.extractedDates : [],
      extractedEvents: (Array.isArray(parsed.extractedEvents) ? parsed.extractedEvents : []).map((event: any, idx: number) => ({
        id: `evt-${Date.now()}-${idx}`,
        title: event.title || 'Extracted Event',
        date: event.date || new Date().toISOString().split('T')[0],
        time: event.time || '',
        location: event.location || '',
        category: event.category || 'general',
        description: event.description || '',
        actionSuggested: Array.isArray(event.actionSuggested) ? event.actionSuggested : ['Add to Calendar']
      })),
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ['Review document'],
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts.slice(0, 4) : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions.slice(0, 5) : [],
      followUpSuggestions: Array.isArray(parsed.followUpSuggestions) ? parsed.followUpSuggestions.slice(0, 4) : [],
      source: 'live',
      rawText: sourceText,
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Live preset extraction failed; showing a review-required fallback:', error);
    return generateMockVisualInsights(undefined, 'fallback');
  }
}

export async function answerVisualScanFollowUp(
  question: string,
  scan: VisualScanResult,
  config?: AiConfig
): Promise<VisualFollowUpResponse> {
  const activeConfig = config ?? getAiConfig();
  if (!activeConfig.apiKey) return generateMockVisualFollowUp(question, scan);

  try {
    const prompt = `You are L.A.S.A. Understand & Act, answering a follow-up about one scanned document. Stay grounded only in the scan context. Be concise but useful. If the user asks for an action, explain the first safe step and name the relevant destination.
Return only valid JSON:
{
  "answer": string,
  "nextSteps": string[],
  "suggestedDestination": "tasks" | "study" | "calendar" | "none"
}

USER QUESTION:
${question}

SCAN CONTEXT:
${JSON.stringify({ title: scan.title, summary: scan.summary, keyFacts: scan.keyFacts, dates: scan.extractedDates, events: scan.extractedEvents, actionItems: scan.actionItems, recommendedActions: scan.recommendedActions })}`;
    const parsed = JSON.parse(cleanJsonResponse(await generateText(activeConfig, prompt)));
    const destination = ['tasks', 'study', 'calendar', 'none'].includes(parsed.suggestedDestination) ? parsed.suggestedDestination : 'none';
    return {
      answer: typeof parsed.answer === 'string' && parsed.answer.trim() ? parsed.answer.trim() : 'I can help you turn this scan into a managed next step.',
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.filter((step: unknown): step is string => typeof step === 'string').slice(0, 4) : [],
      suggestedDestination: destination
    };
  } catch (error) {
    console.warn('Visual follow-up failed, switching to Smart Mock fallback:', error);
    return generateMockVisualFollowUp(question, scan);
  }
}

// --- 2. Adaptive Study Plan Generator ---
export async function generateStudyPlan(
  req: StudyPlanRequest,
  config?: AiConfig
): Promise<StudyPlan> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    console.info('Using Mock Failover for Study Plan');
    return generateMockStudyPlan(req.subject, req.examDate, req.dailyMinutes, req.goal, req.knownWeaknesses);
  }

  try {
    const prompt = `You are L.A.S.A. AI Study Coach.
Create an adaptive, high-impact study plan for a student. This must be a real learning loop, not a list of topics: each milestone should combine concept explanation, active-recall flashcards, a worked example, targeted application practice, and a short self-check.
Subject: "${req.subject}"
Exam Date: "${req.examDate}"
Daily Study Time: ${req.dailyMinutes} minutes
Goal/Target: "${req.goal}"
Identified Weak Topics to Prioritize: ${req.knownWeaknesses?.join(', ') || 'None specified'}

Return strictly a valid JSON object matching this structure:
{
  "subject": "${req.subject}",
  "examDate": "${req.examDate}",
  "totalDaysAvailable": number,
  "dailyStudyMinutes": ${req.dailyMinutes},
  "targetGradeOrGoal": "${req.goal}",
  "weakTopicsIdentified": string[],
  "milestones": [
    {
      "day": number,
      "topic": string,
      "focusArea": string,
      "estimatedMinutes": number,
      "completed": false
    }
  ]
}`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    const fallbackPlan = generateMockStudyPlan(req.subject, req.examDate, req.dailyMinutes, req.goal, req.knownWeaknesses);
    const parsedMilestones = Array.isArray(parsed.milestones) ? parsed.milestones : [];
    const normalizedMilestones = parsedMilestones.length > 0
      ? parsedMilestones.map((m: any, idx: number) => ({
          day: m.day || idx + 1,
          topic: m.topic || `Day ${idx + 1} Review`,
          focusArea: m.focusArea || `Explain the concept, make flashcards, solve a worked example, then complete a short diagnostic quiz for ${m.topic || 'this topic'}.`,
          estimatedMinutes: m.estimatedMinutes || req.dailyMinutes,
          completed: Boolean(m.completed)
        }))
      : fallbackPlan.milestones;

    return {
      id: `plan-${Date.now()}`,
      subject: parsed.subject || req.subject,
      examDate: parsed.examDate || req.examDate,
      totalDaysAvailable: parsed.totalDaysAvailable || normalizedMilestones.length || 3,
      dailyStudyMinutes: parsed.dailyStudyMinutes || req.dailyMinutes,
      targetGradeOrGoal: parsed.targetGradeOrGoal || req.goal,
      weakTopicsIdentified: Array.isArray(parsed.weakTopicsIdentified) ? parsed.weakTopicsIdentified : (req.knownWeaknesses || []),
      milestones: normalizedMilestones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini Study Plan generation failed, falling back to mock:', error);
    return generateMockStudyPlan(req.subject, req.examDate, req.dailyMinutes, req.goal, req.knownWeaknesses);
  }
}

// --- 3. Flashcard Review Deck ---
export async function generateFlashcards(
  subject: string,
  topics: string[],
  config?: AiConfig
): Promise<Flashcard[]> {
  const activeConfig = config ?? getAiConfig();
  if (!activeConfig.apiKey) return generateMockFlashcards(subject, topics);

  try {
    const prompt = `You are L.A.S.A. AI Study Buddy.
Create a six-card active-recall deck for a student studying ${subject}.
Focus topics: ${topics.join(', ') || subject}

The cards must progress from foundation to application to challenge. Include definitions, invariants or mechanisms, one worked-example prompt, one edge-case prompt, one comparison prompt, and one teach-back prompt. Do not make the backs one-line trivia; give a concise but useful explanation with the reasoning and a study cue.

Return only valid JSON:
[
  { "front": "question or prompt", "back": "answer with reasoning", "topic": "topic", "difficulty": "foundation" | "application" | "challenge" }
]`;
    const parsed = JSON.parse(cleanJsonResponse(await generateText(activeConfig, prompt)));
    if (!Array.isArray(parsed) || parsed.length === 0) return generateMockFlashcards(subject, topics);
    return parsed.slice(0, 8).map((card: any, idx: number) => ({
      id: `card-${Date.now()}-${idx}`,
      front: typeof card.front === 'string' ? card.front : `Explain ${topics[idx % Math.max(topics.length, 1)] || subject}`,
      back: typeof card.back === 'string' ? card.back : 'Explain the mechanism, trade-off, and edge case in your own words.',
      topic: typeof card.topic === 'string' ? card.topic : topics[idx % Math.max(topics.length, 1)] || subject,
      difficulty: card.difficulty === 'challenge' || card.difficulty === 'application' ? card.difficulty : 'foundation'
    }));
  } catch (error) {
    console.warn('Flashcard generation failed, falling back to mock:', error);
    return generateMockFlashcards(subject, topics);
  }
}

// --- 4. Dynamic Quiz Generator ---
export async function generateQuiz(
  req: QuizRequest,
  config?: AiConfig
): Promise<QuizQuestion[]> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    console.info('Using Mock Failover for Quiz Generation');
    return generateMockQuiz(req.subject, req.topic);
  }

  try {
    const prompt = `You are L.A.S.A. AI Exam Evaluator and Study Buddy.
Generate ${req.questionCount || 6} diagnostic multiple-choice questions for:
Subject: "${req.subject}"
Topic: "${req.topic}"
Difficulty: "${req.difficulty || 'medium'}"
Depth: "${req.depth || 'deep'}"

The quiz must test more than recall. Include a balanced mix of foundational understanding, mechanism or invariant reasoning, application to a new scenario, edge-case diagnosis, complexity or trade-off analysis, and one teach-back style question. Each explanation must state why the correct answer is right and why the most tempting distractor is wrong. Vary the correct answer position across the set.

Return strictly a valid JSON array of question objects without markdown tags:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0, // 0-indexed integer
    "explanation": "Clear explanation why this option is correct.",
    "topicTag": "${req.topic}"
  }
]`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q: any, idx: number) => ({
        id: `q-${Date.now()}-${idx}`,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        explanation: q.explanation || 'Correct conceptual explanation.',
        topicTag: q.topicTag || req.topic
      }));
    }
    return generateMockQuiz(req.subject, req.topic);
  } catch (error) {
    console.warn('Gemini Quiz generation failed, falling back to mock:', error);
    return generateMockQuiz(req.subject, req.topic);
  }
}

// --- 4. Quiz Evaluation & Mistake Analysis with Dynamic Adaptation ---
export async function evaluateQuizAndAdapt(
  req: QuizEvaluationRequest,
  config?: AiConfig
): Promise<QuizResult> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    console.info('Using Mock Failover for Quiz Evaluation');
    return evaluateMockQuiz(req.subject, req.studyPlanId, req.questions, req.userAnswers);
  }

  try {
    const prompt = `You are L.A.S.A. AI Adaptive Tutor.
Evaluate the student's quiz attempt, diagnose specific conceptual weaknesses, and suggest targeted adaptive recovery recommendations. The recovery recommendation must explicitly sequence: explain the weak concept, review active-recall flashcards, solve a worked example, and retest with a changed scenario.

Subject: "${req.subject}"
Questions & Student Answers:
${JSON.stringify(req.questions.map(q => ({
  question: q.question,
  options: q.options,
  correctOptionIndex: q.correctOptionIndex,
  studentSelectedIndex: req.userAnswers[q.id],
  topicTag: q.topicTag
})), null, 2)}

Return strictly a JSON object matching this schema:
{
  "score": number, // count of correct answers
  "totalQuestions": number,
  "percentage": number,
  "weakTopics": string[], // topics student struggled with
  "strengths": string[], // topics student mastered
  "adaptiveFeedback": string, // encouraging, actionable feedback that names the weak topic and the next learning actions (2-3 sentences)
  "recommendedNextMilestone": string // title of a specific corrective block including explanation, flashcards, worked example, and retest
}`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    return {
      id: `quiz-res-${Date.now()}`,
      studyPlanId: req.studyPlanId,
      subject: req.subject,
      score: parsed.score ?? 0,
      totalQuestions: parsed.totalQuestions ?? req.questions.length,
      percentage: parsed.percentage ?? Math.round(((parsed.score ?? 0) / (req.questions.length || 1)) * 100),
      userAnswers: req.userAnswers,
      questions: req.questions,
      weakTopics: parsed.weakTopics || [],
      strengths: parsed.strengths || [],
      adaptiveFeedback: parsed.adaptiveFeedback || 'Good effort. Rebuild the weak concept with a worked example, retrieve it with flashcards, and retry a changed application scenario.',
      recommendedNextMilestone: parsed.recommendedNextMilestone || 'Targeted Recovery: explanation + flashcards + worked example + retest',
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini Quiz evaluation failed, falling back to mock:', error);
    return evaluateMockQuiz(req.subject, req.studyPlanId, req.questions, req.userAnswers);
  }
}

// --- 4b. AI Concept Explainer ---
export async function explainConcept(
  topic: string,
  subject: string = 'General',
  config?: AiConfig
): Promise<{
  topic: string;
  summary: string;
  keyPoints: string[];
  mnemonicOrAnalogy: string;
  commonPitfall: string;
  workedExample?: string;
  practicePrompt?: string;
  quickCheckQuestion: { question: string; answer: string };
}> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    return generateMockConceptExplanation(topic, subject);
  }

  try {
    const prompt = `You are L.A.S.A. AI Tutor.
Provide a crystal-clear, intuitive explanation for this topic:
Topic: "${topic}"
Subject Context: "${subject}"

Return strictly a JSON object matching this schema:
{
  "topic": "${topic}",
  "summary": string, // 1-2 crisp sentences defining the concept
  "keyPoints": string[], // 3 atomic bullet points detailing mechanics or properties
  "mnemonicOrAnalogy": string, // A vivid real-world analogy or mnemonic to remember it easily
  "commonPitfall": string, // A frequent student misconception or trap to avoid
  "workedExample": string, // A small step-by-step example that makes the mechanism concrete
  "practicePrompt": string, // A new scenario for the student to solve without looking at the answer
  "quickCheckQuestion": {
    "question": string,
    "answer": string
  }
}`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    return {
      topic: parsed.topic || topic,
      summary: parsed.summary || `${topic} is an essential topic in ${subject}.`,
      keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length ? parsed.keyPoints : [
        'Core conceptual structure and rules',
        'State transitions and computational properties',
        'Edge case handling and invariants'
      ],
      mnemonicOrAnalogy: parsed.mnemonicOrAnalogy || `Think of ${topic} as a structured pipeline maintaining strict order.`,
      commonPitfall: parsed.commonPitfall || `Watch out for boundary conditions and off-by-one errors.`,
      workedExample: parsed.workedExample || `Start with a small input for ${topic}, apply one operation at a time, and name the invariant after each step.`,
      practicePrompt: parsed.practicePrompt || `Solve a new ${topic} example and explain which rule makes your answer correct.`,
      quickCheckQuestion: parsed.quickCheckQuestion || {
        question: `Why is ${topic} important?`,
        answer: `It provides guaranteed invariants and optimized execution.`
      }
    };
  } catch (error) {
    console.warn('Gemini concept explanation failed, using fallback:', error);
    return generateMockConceptExplanation(topic, subject);
  }
}

// --- 5. AI Task Breakdown ---
export async function breakdownTask(
  taskTitle: string,
  description?: string,
  config?: AiConfig
): Promise<TaskStep[]> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    return generateMockTaskBreakdown(taskTitle);
  }

  try {
    const prompt = `You are L.A.S.A. Productivity Coach.
Break this task into 3-4 bite-sized, actionable, atomic sub-steps.
Task Title: "${taskTitle}"
Description: "${description || ''}"

Return strictly a JSON array of step titles:
[
  "Step 1 action",
  "Step 2 action",
  "Step 3 action"
]`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    if (Array.isArray(parsed)) {
      return parsed.map((title: string, idx: number) => ({
        id: `step-${Date.now()}-${idx}`,
        title: typeof title === 'string' ? title : `Sub-task ${idx + 1}`,
        isCompleted: false
      }));
    }
    return generateMockTaskBreakdown(taskTitle);
  } catch (error) {
    console.warn('Gemini task breakdown failed, using mock fallback:', error);
    return generateMockTaskBreakdown(taskTitle);
  }
}

// --- 6. Next Action Recommendation ---
export async function recommendNextAction(
  state: SharedAppState,
  config?: AiConfig
): Promise<NextActionRecommendation> {
  const activeConfig = config ?? getAiConfig();
  const apiKey = activeConfig.apiKey;

  if (!apiKey) {
    return generateMockNextAction(state);
  }

  try {
    const prompt = `You are L.A.S.A. Smartphone Assistant.
Given the user's current context (tasks, upcoming events, recent quiz scores, active study plans), recommend the SINGLE most important next action they should take right now.

Context:
- Pending Tasks: ${JSON.stringify(state.tasks.filter(t => t.status !== 'completed').slice(0, 3))}
- Upcoming Events: ${JSON.stringify(state.events.slice(0, 2))}
- Recent Quiz Result: ${JSON.stringify(state.quizHistory.slice(-1))}
- Active Study Plan: ${JSON.stringify(state.studyPlans.find(p => p.id === state.activeStudyPlanId))}

Return strictly a JSON object:
{
  "headline": string, // crisp call to action e.g. "Review Graph Cycle Detection"
  "reason": string, // why this matters now (1 sentence)
  "actionType": "start_quiz" | "study_milestone" | "urgent_task" | "relax",
  "urgency": "high" | "medium" | "low"
}`;

    const responseText = cleanJsonResponse(await generateText(activeConfig, prompt));
    const parsed = JSON.parse(responseText);

    return {
      headline: parsed.headline || 'Continue Study Milestones',
      reason: parsed.reason || 'Keep up your daily revision momentum.',
      actionType: parsed.actionType || 'study_milestone',
      referenceId: typeof parsed.referenceId === 'string' ? parsed.referenceId : undefined,
      urgency: parsed.urgency || 'medium'
    };
  } catch (error) {
    console.warn('Gemini recommendation failed, using fallback:', error);
    return generateMockNextAction(state);
  }
}
