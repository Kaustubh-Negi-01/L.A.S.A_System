import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  VisualScanResult,
  StudyPlan,
  StudyPlanRequest,
  QuizQuestion,
  QuizRequest,
  QuizResult,
  QuizEvaluationRequest,
  TaskStep,
  SharedAppState,
  NextActionRecommendation,
} from '../types';
import {
  generateMockVisualInsights,
  generateMockStudyPlan,
  generateMockQuiz,
  evaluateMockQuiz,
  generateMockTaskBreakdown,
  generateMockNextAction
} from './mockData';

// Helper to get active API key
export function getActiveApiKey(customKey?: string): string {
  if (customKey && customKey.trim().length > 10) {
    return customKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return (typeof envKey === 'string' && envKey.trim().length > 10) ? envKey.trim() : '';
}

// Clean JSON response from Gemini code blocks
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

// --- 1. Visual Insights Extraction (Multimodal) ---
export async function extractVisualInsights(
  imageBase64: string,
  mimeType: string,
  customApiKey?: string
): Promise<VisualScanResult> {
  const apiKey = getActiveApiKey(customApiKey);
  
  if (!apiKey) {
    console.info('Using Mock Failover for Visual Insights (No API Key)');
    return generateMockVisualInsights();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an on-device Smartphone Visual Assistant (L.A.S.A.).
Analyze this uploaded image (which may be a class notice, exam circular, event poster, syllabus, or handwritten note).
Extract all actionable events, deadlines, titles, dates, and suggested next steps.

Return strictly a valid JSON object matching this TypeScript interface without markdown wrappers:
{
  "title": string, // brief title of what the image is
  "summary": string, // 1-2 sentence concise summary
  "extractedDates": string[], // ISO format YYYY-MM-DD or standard date string
  "extractedEvents": [
    {
      "id": string,
      "title": string,
      "date": string, // YYYY-MM-DD
      "time": string, // e.g. "14:00" or empty
      "location": string, // e.g. "Hall A" or empty
      "category": "exam" | "assignment" | "workshop" | "competition" | "general",
      "description": string,
      "actionSuggested": string[]
    }
  ],
  "actionItems": string[] // list of 2-4 immediate to-do tasks
}`;

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = cleanJsonResponse(result.response.text());
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
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini Visual Scan failed, switching to Smart Mock fallback:', error);
    return generateMockVisualInsights();
  }
}

// --- 2. Adaptive Study Plan Generator ---
export async function generateStudyPlan(
  req: StudyPlanRequest,
  customApiKey?: string
): Promise<StudyPlan> {
  const apiKey = getActiveApiKey(customApiKey);

  if (!apiKey) {
    console.info('Using Mock Failover for Study Plan');
    return generateMockStudyPlan(req.subject, req.examDate, req.dailyMinutes, req.goal, req.knownWeaknesses);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are L.A.S.A. AI Study Coach.
Create an adaptive, high-impact study plan for a student.
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

    const result = await model.generateContent(prompt);
    const responseText = cleanJsonResponse(result.response.text());
    const parsed = JSON.parse(responseText);

    return {
      id: `plan-${Date.now()}`,
      subject: parsed.subject || req.subject,
      examDate: parsed.examDate || req.examDate,
      totalDaysAvailable: parsed.totalDaysAvailable || 3,
      dailyStudyMinutes: parsed.dailyStudyMinutes || req.dailyMinutes,
      targetGradeOrGoal: parsed.targetGradeOrGoal || req.goal,
      weakTopicsIdentified: parsed.weakTopicsIdentified || req.knownWeaknesses || [],
      milestones: (parsed.milestones || []).map((m: any, idx: number) => ({
        day: m.day || idx + 1,
        topic: m.topic || `Day ${idx + 1} Review`,
        focusArea: m.focusArea || 'Core practice and concept reinforcement',
        estimatedMinutes: m.estimatedMinutes || req.dailyMinutes,
        completed: false
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini Study Plan generation failed, falling back to mock:', error);
    return generateMockStudyPlan(req.subject, req.examDate, req.dailyMinutes, req.goal, req.knownWeaknesses);
  }
}

// --- 3. Dynamic Quiz Generator ---
export async function generateQuiz(
  req: QuizRequest,
  customApiKey?: string
): Promise<QuizQuestion[]> {
  const apiKey = getActiveApiKey(customApiKey);

  if (!apiKey) {
    console.info('Using Mock Failover for Quiz Generation');
    return generateMockQuiz(req.subject, req.topic);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are L.A.S.A. AI Exam Evaluator.
Generate ${req.questionCount || 3} challenging multiple-choice questions for:
Subject: "${req.subject}"
Topic: "${req.topic}"
Difficulty: "${req.difficulty || 'medium'}"

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

    const result = await model.generateContent(prompt);
    const responseText = cleanJsonResponse(result.response.text());
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
  customApiKey?: string
): Promise<QuizResult> {
  const apiKey = getActiveApiKey(customApiKey);

  if (!apiKey) {
    console.info('Using Mock Failover for Quiz Evaluation');
    return evaluateMockQuiz(req.subject, req.studyPlanId, req.questions, req.userAnswers);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are L.A.S.A. AI Adaptive Tutor.
Evaluate the student's quiz attempt, diagnose specific conceptual weaknesses, and suggest targeted adaptive recovery recommendations.

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
  "adaptiveFeedback": string, // encouraging, actionable feedback (2-3 sentences)
  "recommendedNextMilestone": string // title of the specific corrective study block to add
}`;

    const result = await model.generateContent(prompt);
    const responseText = cleanJsonResponse(result.response.text());
    const parsed = JSON.parse(responseText);

    return {
      id: `quiz-res-${Date.now()}`,
      studyPlanId: req.studyPlanId,
      subject: req.subject,
      score: parsed.score ?? 0,
      totalQuestions: parsed.totalQuestions ?? req.questions.length,
      percentage: parsed.percentage ?? Math.round(((parsed.score ?? 0) / (req.questions.length || 1)) * 100),
      userAnswers: req.userAnswers,
      weakTopics: parsed.weakTopics || [],
      strengths: parsed.strengths || [],
      adaptiveFeedback: parsed.adaptiveFeedback || 'Good effort! Review weak topics to reinforce concepts.',
      recommendedNextMilestone: parsed.recommendedNextMilestone || 'Targeted Topic Drill',
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini Quiz evaluation failed, falling back to mock:', error);
    return evaluateMockQuiz(req.subject, req.studyPlanId, req.questions, req.userAnswers);
  }
}

// --- 5. AI Task Breakdown ---
export async function breakdownTask(
  taskTitle: string,
  description?: string,
  customApiKey?: string
): Promise<TaskStep[]> {
  const apiKey = getActiveApiKey(customApiKey);

  if (!apiKey) {
    return generateMockTaskBreakdown(taskTitle);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const responseText = cleanJsonResponse(result.response.text());
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
  customApiKey?: string
): Promise<NextActionRecommendation> {
  const apiKey = getActiveApiKey(customApiKey);

  if (!apiKey) {
    return generateMockNextAction(state);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const responseText = cleanJsonResponse(result.response.text());
    const parsed = JSON.parse(responseText);

    return {
      headline: parsed.headline || 'Continue Study Milestones',
      reason: parsed.reason || 'Keep up your daily revision momentum.',
      actionType: parsed.actionType || 'study_milestone',
      urgency: parsed.urgency || 'medium'
    };
  } catch (error) {
    console.warn('Gemini recommendation failed, using fallback:', error);
    return generateMockNextAction(state);
  }
}
