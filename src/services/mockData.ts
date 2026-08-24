import { SharedAppState, Task, ExtractedEvent, StudyPlan, QuizResult, VisualScanResult, QuizQuestion, NextActionRecommendation } from '../types';

export const initialDemoState: SharedAppState = {
  customApiKey: '',
  aiMode: 'gemini',
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

export function generateMockVisualInsights(hintText?: string): VisualScanResult {
  const isHackathon = hintText?.toLowerCase().includes('hackathon');
  const isML = hintText?.toLowerCase().includes('machine learning') || hintText?.toLowerCase().includes('neural');
  
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
    focusArea: `Key concept mastery, practice MCQs, and real-world edge case drills for ${topic}.`,
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
  return [
    {
      id: `q-${Date.now()}-1`,
      question: `In ${topic}, which approach ensures optimal time complexity under average conditions?`,
      options: [
        'Divide and Conquer with memoized state caching',
        'Brute-force iterative search across all permutations',
        'Greedy selection without local heuristics',
        'Randomized permutation sampling'
      ],
      correctOptionIndex: 0,
      explanation: 'Divide and conquer combined with memoization avoids redundant sub-problem calculations, guaranteeing optimal polynomial time.',
      topicTag: topic
    },
    {
      id: `q-${Date.now()}-2`,
      question: `What is a critical edge-case vulnerability or pitfall when managing ${topic}?`,
      options: [
        'Excessive memory locality causing cache thrashing',
        'Unbounded recursive depth causing Stack Overflow',
        'Integer underflow on 64-bit platforms',
        'Strictly monotonic pointer convergence'
      ],
      correctOptionIndex: 1,
      explanation: 'Unbounded recursion without tail-call optimization or base-case bounds risks overflowing the execution stack.',
      topicTag: `${topic} Safety`
    },
    {
      id: `q-${Date.now()}-3`,
      question: `When evaluating system performance in ${topic}, which metric indicates highest efficiency?`,
      options: [
        'O(N^2) quadratic space allocation',
        'Amortized O(1) or logarithmic O(log N) operations',
        'Linear scan with O(N!) factorial worst-case',
        'Arbitrary busy-waiting spinlocks'
      ],
      correctOptionIndex: 1,
      explanation: 'Amortized constant time O(1) or logarithmic O(log N) represents high scalability and low latency.',
      topicTag: `${topic} Complexity`
    }
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
    recommendedNextMilestone = `Challenge Round: Advanced synthesis & speed drills in ${subject}`;
  } else if (percentage >= 50) {
    adaptiveFeedback = `Good foundational comprehension (${percentage}%), but you showed uncertainty in ${weakTopics.join(', ') || 'sub-topics'}. We adjusted your daily focus to reinforce these concepts.`;
    recommendedNextMilestone = `Targeted Drill: Concept reinforcement on ${weakTopics[0] || 'Core topics'}`;
  } else {
    adaptiveFeedback = `Identified significant knowledge gaps in ${weakTopics.join(', ') || subject} (${percentage}%). Immediate corrective study module added to your plan.`;
    recommendedNextMilestone = `Remedial Recovery Session: 45m deep dive into ${weakTopics[0] || 'Fundamental Concepts'}`;
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

export function generateMockConceptExplanation(topic: string, subject: string = 'General'): {
  topic: string;
  summary: string;
  keyPoints: string[];
  mnemonicOrAnalogy: string;
  commonPitfall: string;
  quickCheckQuestion: { question: string; answer: string };
} {
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
