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

export function generateMockVisualInsights(hintText?: string, source: 'simulation' | 'fallback' = 'simulation'): VisualScanResult {
  if (source === 'fallback') {
    return {
      id: `scan-${Date.now()}`,
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

export function generateMockQuiz(subject: string, topic: string): QuizQuestion[] {
  const stamp = Date.now();
  return [
    {
      id: `q-${stamp}-1`,
      question: `Which statement best captures the core mechanism of ${topic}?`,
      options: [
        `It preserves a useful invariant while reducing the remaining work`,
        'It always examines every possible state before returning',
        'It removes the need to define input and output conditions',
        'It trades correctness for a faster average result'
      ],
      correctOptionIndex: 0,
      explanation: `The strongest mental model for ${topic} is the invariant it preserves and how that invariant reduces future work. The other choices confuse exhaustive search, vague specifications, or approximation with the actual mechanism.`,
      topicTag: topic
    },
    {
      id: `q-${stamp}-2`,
      question: `A solution for ${topic} works on normal inputs but fails at a boundary. What should you inspect first?`,
      options: [
        'Whether the interface uses a newer visual theme',
        'Base cases, empty input, and inclusive versus exclusive bounds',
        'Whether the code has enough comments',
        'Whether the variable names are longer than eight characters'
      ],
      correctOptionIndex: 1,
      explanation: 'Boundary failures usually come from an incomplete base case or an off-by-one assumption. Test the smallest valid input, the largest relevant boundary, and an empty case before changing the overall strategy.',
      topicTag: `${topic} Edge Cases`
    },
    {
      id: `q-${stamp}-3`,
      question: `You must apply ${topic} to a dataset twice as large. Which reasoning is most useful before coding?`,
      options: [
        'Choose the shortest implementation regardless of complexity',
        'Estimate time and space growth, then trace one representative example',
        'Assume the average case is always the worst case',
        'Add random retries so failures become less visible'
      ],
      correctOptionIndex: 1,
      explanation: 'Scaling decisions require both a growth estimate and a concrete trace. The trace exposes state transitions, while complexity analysis predicts whether the approach remains practical.',
      topicTag: `${topic} Application`
    },
    {
      id: `q-${stamp}-4`,
      question: `What is the most important trade-off to explain when comparing two approaches to ${topic}?`,
      options: [
        'Only which one uses fewer lines of code',
        'Correctness conditions, runtime growth, memory use, and failure modes',
        'Only which one looks more familiar at first glance',
        'Whether both approaches use the same variable names'
      ],
      correctOptionIndex: 1,
      explanation: 'A meaningful comparison connects correctness to resource use and failure modes. Conciseness or familiarity alone does not show that an approach is appropriate for the constraints.',
      topicTag: `${topic} Trade-offs`
    },
    {
      id: `q-${stamp}-5`,
      question: `Which explanation would teach ${topic} most effectively to someone who keeps memorizing steps without understanding them?`,
      options: [
        'List every API name without an example',
        'Give the invariant, walk through a small example, then test an edge case',
        'Ask them to repeat the definition ten times',
        'Skip the explanation and show only the final output'
      ],
      correctOptionIndex: 1,
      explanation: 'Teaching becomes transferable when the learner sees the invariant operate on a concrete example and then predicts what changes at an edge case. That sequence checks understanding rather than recognition.',
      topicTag: `${topic} Teach-back`
    },
    {
      id: `q-${stamp}-6`,
      question: `After missing a ${topic} question, which next step is most likely to improve retention?`,
      options: [
        'Immediately retake the same question until the option feels familiar',
        'Review the explanation, write a one-sentence rule, and retry a changed scenario',
        'Avoid the topic and spend the session on already-mastered material',
        'Read a longer answer without attempting retrieval'
      ],
      correctOptionIndex: 1,
      explanation: 'Mistake-driven remediation should make the learner retrieve the rule and apply it to a new scenario. Repeating the same option can create recognition without durable understanding.',
      topicTag: `${topic} Remediation`
    }
  ];
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
