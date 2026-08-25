import { SharedAppState, Task, ExtractedEvent, StudyPlan, QuizResult, VisualScanResult, VisualFollowUpResponse, QuizQuestion, NextActionRecommendation, ConceptExplanation } from '../types';
import { DEFAULT_PRIMARY_OPENAI_MODEL, DEFAULT_SECONDARY_OPENAI_BASE_URL, DEFAULT_SECONDARY_OPENAI_MODEL } from './aiDefaults';

export const initialDemoState: SharedAppState = {
  customApiKey: '',
  aiMode: 'simulation',
  aiProvider: 'openai-compatible',
  aiBaseUrl: '',
  aiModel: DEFAULT_PRIMARY_OPENAI_MODEL,
  availableModels: [],
  secondaryApiKey: '',
  secondaryBaseUrl: DEFAULT_SECONDARY_OPENAI_BASE_URL,
  secondaryModel: DEFAULT_SECONDARY_OPENAI_MODEL,
  tasks: [
    {
      id: 'task-1',
      title: 'Revise Tree Traversals (Inorder, Preorder, Postorder)',
      description: 'Focus on recursion vs iterative stack implementations.',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      sourceModule: 'study_coach',
      createdAt: new Date().toISOString(),
      steps: [
        { id: 's1', title: 'Code recursive DFS traversals', isCompleted: true },
        { id: 's2', title: 'Implement iterative Inorder with Stack', isCompleted: false },
        { id: 's3', title: 'Solve 2 LeetCode Tree problems', isCompleted: false },
      ]
    },
    {
      id: 'task-2',
      title: 'Submit Operating Systems Lab Assignment 3',
      description: 'Dining Philosophers Problem using Semaphores in C.',
      priority: 'medium',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      sourceModule: 'manual',
      createdAt: new Date().toISOString(),
      steps: [
        { id: 's4', title: 'Write C implementation with pthreads', isCompleted: true },
        { id: 's5', title: 'Create test case report with screenshots', isCompleted: false },
        { id: 's6', title: 'Submit PDF to LMS portal', isCompleted: false },
      ]
    }
  ],
  events: [
    {
      id: 'evt-1',
      title: 'Data Structures Mid-term Exam',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '14:00',
      location: 'LH-302 Academic Block',
      category: 'exam',
      description: 'Topics: Trees, BST, Heaps, Graph BFS/DFS, Hashing',
      actionSuggested: ['Create Study Plan', 'Generate Practice Quiz']
    },
    {
      id: 'evt-2',
      title: 'iQOO Hackathon Prototype Submission',
      date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      time: '18:00',
      location: 'Online Portal',
      category: 'competition',
      description: 'Submit GitHub repository link, Live Vercel URL and 2-min demo video.',
      actionSuggested: ['Deploy to Vercel', 'Record Demo Flow']
    }
  ],
  studyPlans: [
    {
      id: 'plan-dsa-1',
      subject: 'Data Structures & Algorithms',
      examDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      totalDaysAvailable: 3,
      dailyStudyMinutes: 75,
      targetGradeOrGoal: 'Master Graphs & Dynamic Programming (Target: 90%+)',
      weakTopicsIdentified: ['Graph Cycle Detection', 'Topological Sort'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: [
        {
          day: 1,
          topic: 'Binary Search Trees & AVL Trees',
          focusArea: 'Rotations, search complexities, Morris traversal',
          estimatedMinutes: 60,
          completed: true
        },
        {
          day: 2,
          topic: 'Graphs: BFS, DFS & Cycle Detection',
          focusArea: 'Disjoint Set Union (DSU), Kahn\'s Algorithm, Directed cycle check',
          estimatedMinutes: 80,
          completed: false
        },
        {
          day: 3,
          topic: 'Dynamic Programming on Trees & Strings',
          focusArea: 'LCS, Knapsack variations, Memoization patterns',
          estimatedMinutes: 90,
          completed: false
        }
      ]
    }
  ],
  activeStudyPlanId: 'plan-dsa-1',
  quizHistory: [
    {
      id: 'quiz-res-1',
      studyPlanId: 'plan-dsa-1',
      subject: 'Data Structures & Algorithms',
      score: 3,
      totalQuestions: 4,
      percentage: 75,
      userAnswers: { 'q1': 0, 'q2': 1, 'q3': 2, 'q4': 0 },
      weakTopics: ['Graph Cycle Detection'],
      strengths: ['Binary Search Trees', 'Tree Traversals'],
      adaptiveFeedback: 'Great accuracy on BST fundamentals! You missed the condition for back-edges in directed graphs. We have adjusted your Day 2 study focus.',
      recommendedNextMilestone: 'Focus drill: Directed Graph Cycle Detection via DFS Recursion Stack',
      completedAt: new Date().toISOString()
    }
  ],
  scans: [
    {
      id: 'scan-sample-1',
      title: 'CS301 Midterm Examination Circular',
      summary: 'Official college notice announcing Data Structures & Algorithms Midterm Exam on LH-302.',
      extractedDates: [new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]],
      extractedEvents: [
        {
          id: 'evt-1',
          title: 'Data Structures Mid-term Exam',
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          time: '14:00',
          location: 'LH-302 Academic Block',
          category: 'exam',
          description: 'Topics: Trees, BST, Heaps, Graph BFS/DFS, Hashing',
          actionSuggested: ['Create Study Plan', 'Generate Practice Quiz']
        }
      ],
      actionItems: [
        'Prepare 3-day adaptive revision schedule',
        'Collect past 3 years mid-term question papers'
      ],
      source: 'simulation',
      scannedAt: new Date().toISOString()
    }
  ]
};

// --- Smart Fallback Generators for Offline / Fail-Safe Mode ---

export const sampleImagePresets = [
  {
    id: 'preset-exam',
    name: 'College Exam Timetable Poster',
    description: 'Notice for Computer Science Mid-Semester Exams',
    imagePromptText: 'MID-SEMESTER EXAM NOTICE: Department of Computer Science. Subject: Operating Systems & Algorithms. Date: Next Tuesday 10:00 AM. Room: Auditorium C.',
    previewIcon: 'FileText'
  },
  {
    id: 'preset-hackathon',
    name: 'iQOO AI Hackathon Flyer',
    description: 'Smart Hackathon poster with deadline & task deliverables',
    imagePromptText: 'iQOO HACKATHON 2026: Build on-device smartphone AI assistants. Submission Deadline: 18:00 PM Tomorrow. Submit GitHub, Vercel link & 2min video demo.',
    previewIcon: 'Sparkles'
  },
  {
    id: 'preset-assignment',
    name: 'Machine Learning Project Syllabus',
    description: 'Coursework breakdown and lab assignment timeline',
    imagePromptText: 'COURSEWORK DEADLINE: Neural Network Optimization Project due in 4 days. Submit Jupyter notebook with weights & validation loss graphs.',
    previewIcon: 'BookOpen'
  }
];

export function generateMockVisualFollowUp(question: string, scan: VisualScanResult): VisualFollowUpResponse {
  const normalized = question.toLowerCase();
  const event = scan.extractedEvents[0];

  if (normalized.includes('first') || normalized.includes('priorit')) {
    return {
      answer: `Start with the time-sensitive item: ${scan.actionItems[0] || 'review the notice details'}. Then confirm the deadline${event?.date ? ` on ${event.date}` : ''} and work through the remaining actions in order.`,
      nextSteps: scan.actionItems.slice(0, 3),
      suggestedDestination: 'tasks'
    };
  }

  if (normalized.includes('study') || normalized.includes('prepare') || normalized.includes('exam')) {
    return {
      answer: `This scan points to a study or preparation workflow. Begin by identifying the assessed topic, then split the preparation into concept review, active recall, and a short practice check before the deadline.`,
      nextSteps: ['Create a focused study plan', 'Review the detected topic', 'Take a diagnostic quiz'],
      suggestedDestination: 'study'
    };
  }

  if (normalized.includes('simpl') || normalized.includes('summary') || normalized.includes('mean')) {
    return {
      answer: `${scan.title} is mainly about ${scan.summary.toLowerCase()} The important takeaway is to act on the detected deadline and complete the extracted next steps rather than treating this as a reference-only document.`,
      nextSteps: scan.keyFacts?.slice(0, 3) || [scan.summary],
      suggestedDestination: 'none'
    };
  }

  return {
    answer: `The scan identified ${scan.actionItems.length || 'several'} actionable item(s)${event ? ` and a ${event.category} event${event.date ? ` on ${event.date}` : ''}` : ''}. I can help you turn them into tasks, a study workflow, or a calendar entry.`,
    nextSteps: scan.recommendedActions?.slice(0, 3) || ['Add extracted actions to Tasks', 'Create a study plan', 'Review the calendar details'],
    suggestedDestination: event?.category === 'exam' || event?.category === 'assignment' ? 'study' : 'tasks'
  };
}

export function generateMockImageSimulation(imageUrl?: string): VisualScanResult {
  return {
    id: `scan-${Date.now()}`,
    imageUrl,
    title: 'Image received — local simulation',
    summary: 'The local core AI received this image, but Demo Simulation does not claim to read pixels. Connect a vision-capable provider for real extraction.',
    extractedDates: [],
    extractedEvents: [],
    actionItems: ['Review the uploaded image manually', 'Connect a vision-capable provider for extraction', 'Scan again after connecting the provider'],
    keyFacts: ['Image captured successfully.', 'No dates, events, or tasks are claimed without live vision processing.'],
    recommendedActions: ['Choose a vision-capable model in Settings', 'Try a clearer image if live extraction fails'],
    followUpSuggestions: ['What should I check in this image?', 'How do I connect a vision model?'],
    source: 'simulation',
    scannedAt: new Date().toISOString()
  };
}

export function generateMockVisualInsights(hintText?: string, source: 'simulation' | 'fallback' = 'simulation', imageUrl?: string): VisualScanResult {
  if (source === 'fallback') {
    return {
      id: `scan-${Date.now()}`,
      imageUrl,
      title: 'Image needs a live vision model',
      summary: 'L.A.S.A. could not reliably extract this image. Review it manually or choose a multimodal model in Settings, then scan again.',
      extractedDates: [],
      extractedEvents: [],
      actionItems: ['Review the uploaded image manually', 'Choose a vision-capable model in Settings', 'Scan the image again'],
      keyFacts: ['No reliable text or events were extracted from this image.'],
      recommendedActions: ['Use a multimodal model', 'Try a clearer image'],
      followUpSuggestions: ['What can I do if the image was not read?', 'How do I choose a vision model?'],
      source: 'fallback',
      scannedAt: new Date().toISOString()
    };
  }

  const normalizedHint = hintText?.toLowerCase() || '';
  const isExamNotice = normalizedHint.includes('mid-semester exam notice') || normalizedHint.includes('operating systems & algorithms');
  const isHackathon = normalizedHint.includes('hackathon');
  const isML = normalizedHint.includes('machine learning') || normalizedHint.includes('neural');

  if (isExamNotice) {
    const eventDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    return {
      id: `scan-${Date.now()}`,
      title: 'Mid-Semester Exam Notice',
      summary: 'Computer Science notice for the Operating Systems & Algorithms mid-semester examination.',
      extractedDates: [eventDate],
      extractedEvents: [
        {
          id: `evt-${Date.now()}`,
          title: 'Operating Systems & Algorithms Mid-term Exam',
          date: eventDate,
          time: '10:00',
          location: 'Auditorium C',
          category: 'exam',
          description: 'Department of Computer Science mid-semester examination notice.',
          actionSuggested: ['Create Study Plan', 'Generate Practice Quiz']
        }
      ],
      actionItems: [
        'Review Operating Systems & Algorithms topics',
        'Prepare a focused revision plan',
        'Take a diagnostic practice quiz'
      ],
      keyFacts: [
        'Department: Computer Science',
        'Subject: Operating Systems & Algorithms',
        'Venue: Auditorium C'
      ],
      recommendedActions: ['Create a focused study plan', 'Add the exam to Calendar', 'Take a diagnostic quiz'],
      followUpSuggestions: ['What topics should I revise first?', 'What do I need to bring?', 'How should I prepare?'],
      source: 'simulation',
      scannedAt: new Date().toISOString()
    };
  }
  
  if (isHackathon) {
    const eventDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return {
      id: `scan-${Date.now()}`,
      title: 'iQOO AI Smartphone Hackathon Announcement',
      summary: 'Hackathon deadline circular detailing prototype submission requirements, GitHub repo link, and live URL.',
      extractedDates: [eventDate],
      extractedEvents: [
        {
          id: `evt-${Date.now()}`,
          title: 'iQOO Hackathon Prototype Submission',
          date: eventDate,
          time: '18:00',
          location: 'Virtual Submission Portal',
          category: 'competition',
          description: 'Deliver working React+Gemini prototype and live URL.',
          actionSuggested: ['Create Delivery Tasks', 'Deploy to Vercel']
        }
      ],
      actionItems: [
        'Deploy project to Vercel production',
        'Verify cross-mode integration on mobile frame',
        'Record 2-minute demo walkthrough'
      ],
      source: 'simulation',
      scannedAt: new Date().toISOString()
    };
  }

  if (isML) {
    const examDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    return {
      id: `scan-${Date.now()}`,
      title: 'Machine Learning Coursework Milestone',
      summary: 'Syllabus and practical lab deadline for Deep Learning & Neural Network tuning.',
      extractedDates: [examDate],
      extractedEvents: [
        {
          id: `evt-${Date.now()}`,
          title: 'Machine Learning Lab Project Due',
          date: examDate,
          time: '23:59',
          location: 'LMS Submission',
          category: 'assignment',
          description: 'Submit weights, loss convergence graphs, and written analysis.',
          actionSuggested: ['Create Study Plan', 'Break into Sub-tasks']
        }
      ],
      actionItems: [
        'Implement Backpropagation & Adam Optimizer',
        'Generate evaluation charts',
        'Format write-up in LaTeX'
      ],
      source: 'simulation',
      scannedAt: new Date().toISOString()
    };
  }

  // Default Exam Notice
  const defaultDate = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
  return {
    id: `scan-${Date.now()}`,
    title: 'University Examination Notification',
    summary: 'Official notification regarding upcoming subject assessments and venue allocation.',
    extractedDates: [defaultDate],
    extractedEvents: [
      {
        id: `evt-${Date.now()}`,
        title: 'Computer Networks & Distributed Systems Exam',
        date: defaultDate,
        time: '10:00',
        location: 'Hall B - Science Block',
        category: 'exam',
        description: 'Comprehensive test covering OSI Model, TCP/IP congestion control, and routing protocols.',
        actionSuggested: ['Create Study Plan', 'Generate Diagnostic Quiz']
      }
    ],
    actionItems: [
      'Revise TCP Congestion Control and 3-Way Handshake',
      'Practice Subnetting calculations',
      'Take diagnostic quiz on routing algorithms'
    ],
    source: 'simulation',
    scannedAt: new Date().toISOString()
  };
}

export function generateMockStudyPlan(
  subject: string,
  examDate: string,
  dailyMinutes: number,
  goal: string,
  weaknesses: string[] = []
): StudyPlan {
  const daysDiff = Math.max(1, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  const sampleTopicsMap: { [k: string]: string[] } = {
    'data structures': ['Arrays & Linked Lists', 'Trees & Binary Search Trees', 'Graphs & Shortest Path', 'Dynamic Programming Patterns', 'Heap & Priority Queues'],
    'operating systems': ['Process Synchronization & Mutex', 'Deadlock Detection & Banker\'s Algo', 'Virtual Memory & Page Faults', 'File Systems & Disk Scheduling', 'CPU Scheduling Algorithms'],
    'computer networks': ['OSI & TCP/IP Stack', 'Routing Algorithms (Dijkstra, Bellman-Ford)', 'Transport Layer (TCP, UDP, Flow Control)', 'DNS, HTTP/HTTPS, WebSockets', 'Network Security & Encryption'],
    'machine learning': ['Linear & Logistic Regression', 'Support Vector Machines & Trees', 'Neural Networks & Backprop', 'Overfitting, Regularization & Tuning', 'Evaluation Metrics (ROC, F1, Loss)']
  };

  let chosenTopics = ['Core Principles & Fundamentals', 'Intermediate Problem Solving', 'Advanced Scenarios & Edge Cases', 'Rapid Comprehensive Revision'];
  const matchedKey = Object.keys(sampleTopicsMap).find(k => subject.toLowerCase().includes(k));
  if (matchedKey) {
    chosenTopics = sampleTopicsMap[matchedKey];
  }

  // Prepend weak topics if provided
  if (weaknesses.length > 0) {
    chosenTopics = [...weaknesses.map(w => `Targeted Remedial: ${w}`), ...chosenTopics];
  }

  const milestones = chosenTopics.slice(0, Math.min(daysDiff, 5)).map((topic, idx) => ({
    day: idx + 1,
    topic,
    focusArea: `Explain ${topic}, build active-recall flashcards, trace a worked example, then complete targeted application MCQs and an edge-case check.`,
    estimatedMinutes: dailyMinutes,
    completed: false
  }));

  return {
    id: `plan-${Date.now()}`,
    subject,
    examDate,
    totalDaysAvailable: daysDiff,
    dailyStudyMinutes: dailyMinutes,
    targetGradeOrGoal: goal || 'Target: Top Mastery',
    weakTopicsIdentified: weaknesses,
    milestones,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

type LocalQuizDraft = {
  question: string;
  answer: string;
  distractors: string[];
  explanation: string;
  tag: string;
};

function buildLocalQuizProfile(subject: string, topic: string): LocalQuizDraft[] {
  const name = topic.trim() || subject.trim() || 'this topic';
  const normalized = `${subject} ${topic}`.toLowerCase();
  const isOdoo = normalized.includes('odoo');
  const isHackathon = normalized.includes('hackathon') || normalized.includes('prototype') || normalized.includes('nmit');
  const isAlgorithms = normalized.includes('algorithm') || normalized.includes('data structure') || normalized.includes('graph') || normalized.includes('tree');
  const isSystems = normalized.includes('operating system') || normalized.includes('network') || normalized.includes('database') || normalized.includes('distributed');

  if (isHackathon) {
    const workflowAnswer = isOdoo
      ? 'Keep data ownership, roles, and status transitions explicit across the Odoo workflow.'
      : 'Prioritize one complete user journey that can be demonstrated from input to outcome.';
    return [
      { question: `For ${name}, what should the first milestone prove?`, answer: 'A narrow user problem can be solved through a working, testable end-to-end flow.', distractors: ['That every planned feature is already complete.', 'That the interface uses the most complex possible architecture.', 'That a long presentation can replace a working demonstration.'], explanation: 'A strong hackathon milestone reduces risk by proving one complete journey before adding breadth.', tag: 'Problem framing' },
      { question: `Which scope decision is strongest when building ${name} under time pressure?`, answer: 'Prioritize one complete user journey before optional features.', distractors: ['Add every requested feature before testing anything.', 'Optimize visual polish while leaving the core flow incomplete.', 'Change the target user whenever an implementation becomes difficult.'], explanation: 'A complete narrow flow creates testable evidence and makes the remaining scope explicit.', tag: 'Scope strategy' },
      { question: isOdoo ? `Which design choice best protects an Odoo-centered solution for ${name}?` : `Which evidence makes a ${name} prototype credible?`, answer: isOdoo ? workflowAnswer : 'A reproducible demo, clear success criteria, and honest limits.', distractors: isOdoo ? ['Duplicate the same record in every module without an owner.', 'Hide failed transitions so the workflow appears shorter.', 'Use a single hard-coded screen with no state changes.'] : ['A list of future features without a runnable path.', 'A polished landing screen with no test data.', 'A claim that every edge case is solved without evidence.'], explanation: isOdoo ? 'Integrated business workflows stay understandable when ownership and state changes are explicit.' : 'Judges can trust a prototype when they can reproduce its result and understand what it does not claim.', tag: isOdoo ? 'Workflow integration' : 'Demo evidence' },
      { question: `A ${name} demo works on the happy path but fails with missing input. What should happen next?`, answer: 'Add a clear validation state, test the failure, and explain the recovery path.', distractors: ['Silently invent a result so the demo never stops.', 'Remove the input so the edge case cannot occur.', 'Treat the failure as irrelevant because the happy path works.'], explanation: 'A visible, recoverable failure is safer and more convincing than silently producing an unsupported result.', tag: 'Edge-case testing' },
      { question: `When comparing two implementation approaches for ${name}, what should guide the choice?`, answer: 'User value, integration risk, testability, and the time required to prove the result.', distractors: ['Only the number of files created.', 'Only the newest library or model name.', 'Only the approach with the longest feature list.'], explanation: 'Hackathon trade-offs should connect the chosen approach to a measurable user outcome and evidence.', tag: 'Trade-offs' },
      { question: `How would you teach the core idea of ${name} to a new teammate?`, answer: 'State the user problem, trace one interaction, show the system response, and name the measurable outcome.', distractors: ['Read the feature list without showing a user journey.', 'Start with internal names and skip the expected behavior.', 'Show only the final screen without the input or decision.'], explanation: 'A short trace from problem to outcome makes the design understandable and testable.', tag: 'Teach-back' }
    ];
  }

  if (isAlgorithms) {
    return [
      { question: `What should you define before implementing ${name}?`, answer: 'The input, output, invariant, constraints, and a condition that proves correctness.', distractors: ['Only the variable names.', 'Only the screen layout.', 'A random test that happens to pass once.'], explanation: `A precise contract turns ${name} from a label into a testable method.`, tag: 'Foundations' },
      { question: `A ${name} solution fails on the smallest valid input. What is the best first check?`, answer: 'Inspect base cases, empty values, boundary conditions, and the first state transition.', distractors: ['Increase the timeout without inspecting the state.', 'Rewrite the entire solution immediately.', 'Remove the smallest input from the test set.'], explanation: 'Small inputs expose missing initialization and boundary assumptions early.', tag: 'Edge cases' },
      { question: `If the input size for ${name} grows substantially, what should you compare?`, answer: 'Time and space growth together with a trace of representative and worst-case inputs.', distractors: ['Only lines of code.', 'Only the average result on one small example.', 'Only whether the output looks visually correct.'], explanation: 'Scalability is a resource question supported by concrete traces.', tag: 'Complexity' },
      { question: `Which comparison is most useful when choosing an approach to ${name}?`, answer: 'Correctness conditions, asymptotic cost, memory use, and failure modes.', distractors: ['Familiarity alone.', 'The shortest function name.', 'The approach with the most comments regardless of behavior.'], explanation: 'A meaningful comparison links the algorithm to the constraints it must satisfy.', tag: 'Trade-offs' },
      { question: `What is the best way to learn ${name} beyond memorizing a definition?`, answer: 'State the invariant, trace a small example, and predict an edge-case result.', distractors: ['Repeat the definition without applying it.', 'Skip the trace and memorize the final output.', 'Study only successful inputs.'], explanation: 'Retrieval plus a worked trace checks whether the mechanism transfers to a new case.', tag: 'Teach-back' },
      { question: `After missing a ${name} question, which recovery step is strongest?`, answer: 'Explain the failed assumption, solve a changed example, and retest the boundary.', distractors: ['Repeat the same answer until it feels familiar.', 'Avoid the topic permanently.', 'Read a longer explanation without solving anything.'], explanation: 'A changed example reveals whether the learner repaired the reasoning rather than memorized an option.', tag: 'Remediation' }
    ];
  }

  const domain = isSystems ? 'system behavior and constraints' : 'the concepts and decisions inside the topic';
  return [
    { question: `What is the most useful starting point for understanding ${name}?`, answer: `Define the inputs, outputs, constraints, and success condition for ${domain}.`, distractors: ['Start with terminology without a concrete goal.', 'Assume the topic has no constraints.', 'Memorize examples without identifying the rule.'], explanation: 'A clear contract makes the topic concrete and gives later answers something testable to reference.', tag: 'Foundations' },
    { question: `A ${name} workflow behaves correctly in normal conditions but fails at a boundary. What should you inspect?`, answer: 'Missing input, state transitions, permissions, limits, and the recovery path.', distractors: ['Only the visual theme.', 'Only the fastest successful run.', 'Whether the documentation uses enough adjectives.'], explanation: 'Boundary behavior is often determined by omitted states and recovery decisions.', tag: 'Edge cases' },
    { question: `How should you apply ${name} to a new scenario?`, answer: 'Map the scenario to the core rule, trace one example, and verify the result against its constraints.', distractors: ['Copy the previous answer unchanged.', 'Ignore constraints until after implementation.', 'Choose the most complicated explanation available.'], explanation: 'Application requires connecting the rule to a new context and checking the result.', tag: 'Application' },
    { question: `Which trade-off matters most when evaluating two approaches to ${name}?`, answer: 'Reliability, cost, speed, maintainability, and the consequences of failure.', distractors: ['Only which option sounds newer.', 'Only which option has fewer words.', 'Only which option was easiest to describe.'], explanation: 'A good decision makes both benefits and failure costs explicit.', tag: 'Trade-offs' },
    { question: `What would make a teach-back explanation of ${name} convincing?`, answer: 'A plain-language model, a worked example, and one limitation or edge case.', distractors: ['A definition with no example.', 'A list of features with no relationship.', 'A confident claim that skips uncertainty.'], explanation: 'The example and limitation show whether the learner understands how the concept behaves.', tag: 'Teach-back' },
    { question: `After getting a ${name} question wrong, what should the next practice cycle include?`, answer: 'A targeted explanation, active recall, a changed example, and a short retest.', distractors: ['The identical question only.', 'More passive reading with no retrieval.', 'A completely unrelated topic.'], explanation: 'A changed example tests transfer and helps distinguish understanding from recognition.', tag: 'Remediation' }
  ];
}

export function generateMockQuiz(subject: string, topic: string): QuizQuestion[] {
  const drafts = buildLocalQuizProfile(subject, topic);
  const seedText = `${subject}|${topic}`;
  const seed = Array.from(seedText).reduce((total, character) => total + character.charCodeAt(0), 0);
  const stamp = Date.now();
  return drafts.map((draft, index) => {
    const options = [draft.answer, ...draft.distractors];
    const correctOptionIndex = (seed + index * 3) % options.length;
    const rotatedOptions = options.map((_, optionIndex) => options[(optionIndex - correctOptionIndex + options.length) % options.length]);
    return {
      id: `q-${stamp}-${index + 1}`,
      question: draft.question,
      options: rotatedOptions,
      correctOptionIndex,
      explanation: draft.explanation,
      topicTag: `${topic.trim() || subject.trim() || 'General'} · ${draft.tag}`
    };
  });
}

export function generateMockFlashcards(subject: string, topics: string[]): { id: string; front: string; back: string; topic: string; difficulty: 'foundation' | 'application' | 'challenge' }[] {
  const topic = topics[0] || subject;
  const secondary = topics[1] || `${subject} fundamentals`;
  return [
    { id: `card-${Date.now()}-1`, front: `What is the core idea behind ${topic}?`, back: `${topic} is the central mechanism to understand before solving problems. Define its invariant, the operations it supports, and the trade-off it introduces.`, topic, difficulty: 'foundation' },
    { id: `card-${Date.now()}-2`, front: `Which invariant must remain true in ${topic}?`, back: `State the rule that must hold after every operation. Use a small example to check the invariant rather than memorizing a definition alone.`, topic, difficulty: 'foundation' },
    { id: `card-${Date.now()}-3`, front: `How would you apply ${topic} to a new problem?`, back: `Identify the input, choose the operation that reduces the problem, trace one concrete example, and verify the result against the expected complexity.`, topic, difficulty: 'application' },
    { id: `card-${Date.now()}-4`, front: `What edge case commonly breaks solutions for ${secondary}?`, back: `Check empty input, boundary values, repeated values, and the worst-case path. Explain which guard or base case prevents the failure.`, topic: secondary, difficulty: 'application' },
    { id: `card-${Date.now()}-5`, front: `Compare the efficient and naive approaches to ${topic}.`, back: `The efficient approach avoids repeated work or preserves a useful invariant; the naive approach repeatedly scans or recomputes state. Explain the difference in time and space costs.`, topic, difficulty: 'challenge' },
    { id: `card-${Date.now()}-6`, front: `Teach ${topic} in two sentences to a classmate.`, back: `Start with the mental model, then name the operation and its trade-off. If you cannot explain the edge case, return to the relevant milestone and practice one worked example.`, topic, difficulty: 'challenge' }
  ];
}

export function evaluateMockQuiz(
  subject: string,
  studyPlanId: string | undefined,
  questions: QuizQuestion[],
  userAnswers: { [questionId: string]: number }
): QuizResult {
  let correctCount = 0;
  const weakTopics: string[] = [];
  const strengths: string[] = [];

  questions.forEach(q => {
    const userSelected = userAnswers[q.id];
    if (userSelected === q.correctOptionIndex) {
      correctCount++;
      if (!strengths.includes(q.topicTag)) {
        strengths.push(q.topicTag);
      }
    } else {
      if (!weakTopics.includes(q.topicTag)) {
        weakTopics.push(q.topicTag);
      }
    }
  });

  const totalQuestions = questions.length || 1;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  let adaptiveFeedback = '';
  let recommendedNextMilestone = '';

  if (percentage >= 80) {
    adaptiveFeedback = `Outstanding mastery in ${subject}! You demonstrated strong conceptual clarity. We recommend advancing to high-difficulty problem sets.`;
    recommendedNextMilestone = `Challenge Round: explain the weak edge cases, complete a flashcard pass, then take a changed-scenario retest in ${subject}`;
  } else if (percentage >= 50) {
    adaptiveFeedback = `Good foundational comprehension (${percentage}%), but you showed uncertainty in ${weakTopics.join(', ') || 'sub-topics'}. Your next cycle starts with an explanation, active-recall flashcards, and a changed application question so the gap is repaired rather than memorized.`;
    recommendedNextMilestone = `Targeted Recovery: explain ${weakTopics[0] || 'Core topics'}, review its flashcards, then retry application questions`;
  } else {
    adaptiveFeedback = `Identified significant knowledge gaps in ${weakTopics.join(', ') || subject} (${percentage}%). Immediate corrective study module added: rebuild the concept with a worked example, retrieve it with flashcards, and prove progress on a focused retest.`;
    recommendedNextMilestone = `Remedial Recovery: 45m explanation + flashcards + worked example, followed by a focused retest on ${weakTopics[0] || 'Fundamental Concepts'}`;
  }

  return {
    id: `quiz-res-${Date.now()}`,
    studyPlanId,
    subject,
    score: correctCount,
    totalQuestions,
    percentage,
    userAnswers,
    questions,
    weakTopics: weakTopics.length ? weakTopics : ['Edge-case analysis'],
    strengths: strengths.length ? strengths : ['Basic concepts'],
    adaptiveFeedback,
    recommendedNextMilestone,
    completedAt: new Date().toISOString()
  };
}

export function generateMockConceptExplanation(topic: string, subject: string = 'General'): ConceptExplanation {
  return {
    topic,
    summary: `${topic} is a core foundational concept in ${subject} designed to optimize efficiency, enforce invariants, and eliminate systemic bottlenecks.`,
    keyPoints: [
      `Structure & Invariants: Guarantees deterministic state transitions under nominal execution.`,
      `Complexity Profile: Operates with optimal amortized time O(1) to logarithmic O(log N) operations.`,
      `Edge Boundary Handling: Requires explicit null checks, overflow guards, and recursion base cases.`
    ],
    mnemonicOrAnalogy: `Mental Model: Think of ${topic} like a high-speed airport conveyor system—items must follow strict indexing rules to prevent collisions and congestion.`,
    commonPitfall: `Common Mistake: Forgetting base termination criteria or failing to account for cyclic references, which causes runaway recursion or memory leaks.`,
    workedExample: `Worked example: start with a small ${topic} input, apply one operation at a time, and pause after each step to name the invariant. Then check the final result against the expected complexity or constraint.`,
    practicePrompt: `Try a new ${topic} scenario without looking back: state the rule, trace the first two operations, and explain which edge case would make your approach fail.`,
    quickCheckQuestion: {
      question: `What is the primary condition required to maintain consistency in ${topic}?`,
      answer: `Ensuring state transitions preserve core structural invariants and prevent cyclic reference deadlocks.`
    }
  };
}

export function generateMockTaskBreakdown(taskTitle: string): { id: string; title: string; isCompleted: boolean }[] {
  return [
    { id: `step-${Date.now()}-1`, title: `Review foundational concepts for "${taskTitle}"`, isCompleted: false },
    { id: `step-${Date.now()}-2`, title: `Draft outline and key deliverables`, isCompleted: false },
    { id: `step-${Date.now()}-3`, title: `Implement core components & test edge cases`, isCompleted: false },
    { id: `step-${Date.now()}-4`, title: `Final review and verification against requirements`, isCompleted: false }
  ];
}

export function generateMockNextAction(state: SharedAppState): NextActionRecommendation {
  // 1. Check if there are urgent uncompleted tasks
  const pendingHighPriorityTask = state.tasks.find(t => t.priority === 'high' && t.status !== 'completed');
  if (pendingHighPriorityTask) {
    return {
      headline: `Execute High-Priority Task: ${pendingHighPriorityTask.title}`,
      reason: `You have an active high-priority task with ${pendingHighPriorityTask.steps.filter(s => !s.isCompleted).length} remaining steps.`,
      actionType: 'urgent_task',
      referenceId: pendingHighPriorityTask.id,
      urgency: 'high'
    };
  }

  // 2. Check if recent quiz has weak topics
  const recentQuiz = state.quizHistory[state.quizHistory.length - 1];
  if (recentQuiz && recentQuiz.weakTopics.length > 0 && recentQuiz.percentage < 80) {
    return {
      headline: `Reinforce Weak Concept: ${recentQuiz.weakTopics[0]}`,
      reason: `In your recent ${recentQuiz.subject} quiz, you scored ${recentQuiz.percentage}%. Reviewing this weak topic now will boost your retention.`,
      actionType: 'start_quiz',
      referenceId: recentQuiz.id,
      urgency: 'high'
    };
  }

  // 3. Check active study plan milestone
  const activePlan = state.studyPlans.find(p => p.id === state.activeStudyPlanId);
  if (activePlan) {
    const nextMilestone = activePlan.milestones.find(m => !m.completed);
    if (nextMilestone) {
      return {
        headline: `Day ${nextMilestone.day} Study Goal: ${nextMilestone.topic}`,
        reason: `Targeted session (${nextMilestone.estimatedMinutes} mins) for ${activePlan.subject} exam on ${activePlan.examDate}.`,
        actionType: 'study_milestone',
        referenceId: activePlan.id,
        urgency: 'medium'
      };
    }
  }

  return {
    headline: 'All Core Milestones On Track!',
    reason: 'Great job! Take a diagnostic quiz or scan a new syllabus document to generate your next adaptive path.',
    actionType: 'relax',
    urgency: 'low'
  };
}
