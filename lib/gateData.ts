export type UserProfile = {
  id: string;
  name: string;
  email: string;
  targetBand: string;
  targetScore: number;
  dailyStudyHours: number;
  currentStreak: number;
  lastErrorDaysAgo: number;
  latestMock: number;
};

export type Subject = {
  id: string;
  name: string;
  marksRange: string;
  priorityTier: string;
  strategyNote: string;
};

export type Chapter = {
  id: string;
  subjectId: string;
  name: string;
  order: number;
};

export type WeeklyRuleEntry = {
  week: number;
  startDate: string;
  endDate: string;
  focus: string;
  classNotesDone: boolean;
  dppQuestionsDone: boolean;
  pyqsDone: boolean;
  mockTestDone: boolean;
  errorLogDone: boolean;
  shortNotesDone: boolean;
};

export type ErrorLogEntry = {
  id: string;
  userId: string;
  date: string;
  subject: string;
  question: string;
  reason: string;
  resolved: boolean;
};

export type ReverseCalendarItem = {
  id: string;
  title: string;
  date: string;
  lock: string;
  reminder: string;
};

export type MockEntry = {
  mock: number;
  date: string;
  aptitude: number;
  core: number;
  total: number;
  leak: string;
};

export const subjects: Subject[] = [
  {
    id: 'engineering-maths',
    name: 'Engineering Mathematics',
    marksRange: '13–15',
    priorityTier: 'Tier 1',
    strategyNote: 'Discrete Maths repeats every year and carries most weight.',
  },
  {
    id: 'discrete-maths',
    name: 'Discrete Mathematics',
    marksRange: '13–15',
    priorityTier: 'Tier 1',
    strategyNote: 'Graph theory, combinatorics, logic, and sets are high yield.',
  },
  {
    id: 'verbal-aptitude',
    name: 'Verbal Aptitude',
    marksRange: '15',
    priorityTier: 'Tier 1',
    strategyNote: 'Daily mixed sets and vocabulary retention.',
  },
  {
    id: 'general-aptitude',
    name: 'General Aptitude',
    marksRange: '15',
    priorityTier: 'Tier 1',
    strategyNote: 'Keep this daily, never push it late.',
  },
  {
    id: 'digital-logic',
    name: 'Digital Logic – Digital Electronics',
    marksRange: '4–6',
    priorityTier: 'Tier 3',
    strategyNote: 'Concepts once, then PYQ-only practice.',
  },
  {
    id: 'c-programming',
    name: 'C Programming',
    marksRange: '9–11',
    priorityTier: 'Tier 1',
    strategyNote: 'Pointers, recursion tracing, arrays, and code-output questions.',
  },
  {
    id: 'data-structures',
    name: 'Data Structures & Programming',
    marksRange: '9–11',
    priorityTier: 'Tier 1',
    strategyNote: 'Recursion, heaps, hashing, trees, and linked lists dominate.',
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    marksRange: '8–10',
    priorityTier: 'Tier 1',
    strategyNote: 'Analyze complexity and recurrence relations deeply.',
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    marksRange: '6–8',
    priorityTier: 'Tier 2',
    strategyNote: 'Normalisation, SQL output, and transactions are frequent.',
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    marksRange: '6–8',
    priorityTier: 'Tier 2',
    strategyNote: 'Regular languages and closure properties are highly repetitive.',
  },
  {
    id: 'os',
    name: 'Operating Systems',
    marksRange: '7–9',
    priorityTier: 'Tier 1',
    strategyNote: 'Synchronization, scheduling, deadlock, and paging are highly testable.',
  },
  {
    id: 'coa',
    name: 'Computer Organization and Architecture',
    marksRange: '7–9',
    priorityTier: 'Tier 1',
    strategyNote: 'Pipelining and cache memory are the highest return topics.',
  },
  {
    id: 'compiler-design',
    name: 'Compiler Design',
    marksRange: '4–6',
    priorityTier: 'Tier 2',
    strategyNote: 'Parsing is predictable; focus on LL(1), SLR, and LR conflicts.',
  },
  {
    id: 'computer-networks',
    name: 'Computer Networks',
    marksRange: '6–8',
    priorityTier: 'Tier 2',
    strategyNote: 'Avoid removed topics; focus on routing, TCP, and subnetting.',
  },
];

export const chapters: Chapter[] = [
  { id: 'math-probability', subjectId: 'engineering-maths', name: 'Probability & Statistics', order: 1 },
  { id: 'math-calculus', subjectId: 'engineering-maths', name: 'Single Variable Calculus', order: 2 },
  { id: 'math-linear-algebra', subjectId: 'engineering-maths', name: 'Linear Algebra', order: 3 },
  { id: 'discrete-graph', subjectId: 'discrete-maths', name: 'Graph Theory', order: 1 },
  { id: 'discrete-logic', subjectId: 'discrete-maths', name: 'Mathematical Logic', order: 2 },
  { id: 'discrete-set', subjectId: 'discrete-maths', name: 'Set Theory', order: 3 },
  { id: 'discrete-combinatorics', subjectId: 'discrete-maths', name: 'Combinatorics', order: 4 },
  { id: 'verbal-parts', subjectId: 'verbal-aptitude', name: 'Parts of Speech', order: 1 },
  { id: 'verbal-vocab', subjectId: 'verbal-aptitude', name: 'Vocabulary', order: 2 },
  { id: 'verbal-reading', subjectId: 'verbal-aptitude', name: 'Reading Comprehension', order: 3 },
  { id: 'general-quant', subjectId: 'general-aptitude', name: 'Quantitative Aptitude', order: 1 },
  { id: 'general-analytical', subjectId: 'general-aptitude', name: 'Analytical Aptitude', order: 2 },
  { id: 'general-spatial', subjectId: 'general-aptitude', name: 'Spatial Aptitude', order: 3 },
  { id: 'logic-gates', subjectId: 'digital-logic', name: 'Logic Gates', order: 1 },
  { id: 'logic-minimization', subjectId: 'digital-logic', name: 'Minimization (Boolean Algebra, K-Map, Implicants)', order: 2 },
  { id: 'logic-combinational', subjectId: 'digital-logic', name: 'Combinational Circuits', order: 3 },
  { id: 'logic-sequential', subjectId: 'digital-logic', name: 'Sequential Circuits', order: 4 },
  { id: 'logic-number-systems', subjectId: 'digital-logic', name: 'Number System', order: 5 },
  { id: 'c-datatypes', subjectId: 'c-programming', name: 'Data Types and Operators', order: 1 },
  { id: 'c-control-flow', subjectId: 'c-programming', name: 'Control Flow Statements', order: 2 },
  { id: 'c-functions', subjectId: 'c-programming', name: 'Functions & Storage Classes', order: 3 },
  { id: 'c-arrays-pointers', subjectId: 'c-programming', name: 'Arrays and Pointers', order: 4 },
  { id: 'c-strings', subjectId: 'c-programming', name: 'Strings', order: 5 },
  { id: 'c-structures', subjectId: 'c-programming', name: 'Structures and Unions', order: 6 },
  { id: 'c-misc', subjectId: 'c-programming', name: 'Miscellaneous', order: 7 },
  { id: 'ds-intro', subjectId: 'data-structures', name: 'Introduction to Data Structures', order: 1 },
  { id: 'ds-arrays', subjectId: 'data-structures', name: 'Arrays', order: 2 },
  { id: 'ds-linked-list', subjectId: 'data-structures', name: 'Linked List', order: 3 },
  { id: 'ds-stack-queue', subjectId: 'data-structures', name: 'Stack and Queues', order: 4 },
  { id: 'ds-tree', subjectId: 'data-structures', name: 'Tree', order: 5 },
  { id: 'ds-graph', subjectId: 'data-structures', name: 'Graphs', order: 6 },
  { id: 'ds-hashing', subjectId: 'data-structures', name: 'Hashing', order: 7 },
  { id: 'algo-analysis', subjectId: 'algorithms', name: 'Analysis of Algorithm', order: 1 },
  { id: 'algo-design', subjectId: 'algorithms', name: 'Design Strategies', order: 2 },
  { id: 'algo-greedy', subjectId: 'algorithms', name: 'Greedy Method', order: 3 },
  { id: 'algo-dp', subjectId: 'algorithms', name: 'Dynamic Programming', order: 4 },
  { id: 'algo-graphs', subjectId: 'algorithms', name: 'Graph Algorithms', order: 5 },
  { id: 'algo-heap', subjectId: 'algorithms', name: 'Heap Algorithms', order: 6 },
  { id: 'algo-backtracking', subjectId: 'algorithms', name: 'Backtracking & Branch-and-Bound', order: 7 },
  { id: 'db-fd', subjectId: 'dbms', name: 'FDs & Normalization', order: 1 },
  { id: 'db-transaction', subjectId: 'dbms', name: 'Transaction & Concurrency Control', order: 2 },
  { id: 'db-er', subjectId: 'dbms', name: 'ER Model', order: 3 },
  { id: 'db-sql', subjectId: 'dbms', name: 'Query Language (SQL - Relational Algebra)', order: 4 },
  { id: 'db-file', subjectId: 'dbms', name: 'File Organization & Indexing', order: 5 },
  { id: 'toc-fa', subjectId: 'toc', name: 'Finite Automata (DFA, NFA, Regular Expressions, Regular Grammars, Closure Properties)', order: 1 },
  { id: 'toc-pda', subjectId: 'toc', name: 'Push Down Automata (Context-Free Languages / Grammars)', order: 2 },
  { id: 'toc-tm', subjectId: 'toc', name: 'Turing Machine & Recursively Enumerable Languages', order: 3 },
  { id: 'toc-decidability', subjectId: 'toc', name: 'Decidability & Undecidability', order: 4 },
  { id: 'os-intro', subjectId: 'os', name: 'Introduction and Background', order: 1 },
  { id: 'os-process', subjectId: 'os', name: 'Process Management (Concepts, Fork, Scheduling Queues, Context Switching)', order: 2 },
  { id: 'os-cpu', subjectId: 'os', name: 'CPU Scheduling (FCFS, SJF, SRTF, Round Robin, Priority, HRRN)', order: 3 },
  { id: 'os-sync', subjectId: 'os', name: 'Process Synchronization – Coordination', order: 4 },
  { id: 'os-deadlock', subjectId: 'os', name: 'Deadlock', order: 5 },
  { id: 'os-memory', subjectId: 'os', name: 'Memory Management (Paging, Segmentation, Page Replacement, Virtual Memory)', order: 6 },
  { id: 'os-filesystem', subjectId: 'os', name: 'File System and Device Management', order: 7 },
  { id: 'os-system-calls', subjectId: 'os', name: 'System Calls and Threads', order: 8 },
  { id: 'os-revision', subjectId: 'os', name: 'Revision', order: 9 },
  { id: 'coa-intro', subjectId: 'coa', name: 'Introduction of COA', order: 1 },
  { id: 'coa-instruction', subjectId: 'coa', name: 'Machine Instruction & Addressing Modes', order: 2 },
  { id: 'coa-floating-point', subjectId: 'coa', name: 'Floating Point Representation', order: 3 },
  { id: 'coa-alu', subjectId: 'coa', name: 'ALU & Control Unit', order: 4 },
  { id: 'coa-pipeline', subjectId: 'coa', name: 'Instruction Pipelining', order: 5 },
  { id: 'coa-cache', subjectId: 'coa', name: 'Cache Memory', order: 6 },
  { id: 'coa-secondary', subjectId: 'coa', name: 'Secondary Memory & I/O Interface', order: 7 },
  { id: 'compiler-lexical', subjectId: 'compiler-design', name: 'Lexical Analysis & Syntax Analysis', order: 1 },
  { id: 'compiler-sdt', subjectId: 'compiler-design', name: 'Syntax Directed Translation (SDT)', order: 2 },
  { id: 'compiler-optimization', subjectId: 'compiler-design', name: 'Intermediate Code & Code Optimization', order: 3 },
  { id: 'cn-ipv4', subjectId: 'computer-networks', name: 'IPv4 Addressing', order: 1 },
  { id: 'cn-error', subjectId: 'computer-networks', name: 'Error Control', order: 2 },
  { id: 'cn-flow', subjectId: 'computer-networks', name: 'Flow Control', order: 3 },
  { id: 'cn-header', subjectId: 'computer-networks', name: 'IPv4 Header & Fragmentation', order: 4 },
  { id: 'cn-tcp', subjectId: 'computer-networks', name: 'TCP & UDP', order: 5 },
  { id: 'cn-mac', subjectId: 'computer-networks', name: 'Medium Access Control (MAC)', order: 6 },
  { id: 'cn-routing', subjectId: 'computer-networks', name: 'Routing Protocols & Algorithms', order: 7 },
  { id: 'cn-switching', subjectId: 'computer-networks', name: 'Switching', order: 8 },
  { id: 'cn-application', subjectId: 'computer-networks', name: 'Application Layer Protocols', order: 9 },
  { id: 'cn-ip-support', subjectId: 'computer-networks', name: 'IP Support Protocols', order: 10 },
  { id: 'cn-osi', subjectId: 'computer-networks', name: 'OSI and TCP/IP Protocol', order: 11 },
];

export const reverseCalendar: ReverseCalendarItem[] = [
  { id: 'reg-close', title: 'GATE 2027 registration closes', date: '2026-09-27', lock: 'Photo, signature, category cert, degree cert/ID, city preferences', reminder: 'Lose the whole attempt if missed.' },
  { id: 'paper-city', title: 'Last chance to change paper/city', date: '2026-10-21', lock: 'Final paper code + 2 city choices', reminder: 'Sit for the wrong paper.' },
  { id: 'syllabus-100', title: 'Syllabus 100% complete', date: '2026-11-30', lock: 'Short notes + formula notebook', reminder: 'No new subject after this.' },
  { id: 'pyq-round-1', title: 'PYQ round 1 finished', date: '2026-12-31', lock: '6 full mocks attempted + error log with 100+ entries', reminder: 'Enter Jan not knowing weak spots.' },
  { id: 'exam-window', title: 'Exam window begins', date: '2027-02-06', lock: 'Admit card printed + route checked + sleep matched', reminder: 'The exam is live.' },
];

export const roadmapMilestones = [
  { month: 'Kickoff', dates: 'Sep 26 – Sep 27, 2026', weekRange: 'Week 1', focus: 'Set up the study routine; begin programming, COA, aptitude, and maths threads.', done: false, detail: 'Two-day opening block before the Monday-start weekly cycle.' },
  { month: 'Foundations', dates: 'Sep 28 – Nov 1, 2026', weekRange: 'Weeks 2–6', focus: 'Programming, COA, aptitude, engineering maths, discrete maths, and algorithm foundations.', done: false, detail: 'Build strong daily practice while closing the highest-priority fundamentals.' },
  { month: 'Core subjects', dates: 'Nov 2 – Dec 13, 2026', weekRange: 'Weeks 7–12', focus: 'OS, DBMS, TOC, Networks, Compiler Design, Digital Logic, and syllabus closure.', done: false, detail: 'Finish first-pass coverage and begin mixed previous-year questions.' },
  { month: 'Practice and revision', dates: 'Dec 14, 2026 – Jan 10, 2027', weekRange: 'Weeks 13–16', focus: 'Full-syllabus PYQs, mock exams, and targeted weak-area repair.', done: false, detail: 'Review each mock and convert recurring mistakes into short revision notes.' },
  { month: 'Final revision', dates: 'Jan 11 – Jan 31, 2027', weekRange: 'Weeks 17–19', focus: 'High-yield revision, timed mocks, and final error-log review.', done: false, detail: 'Complete all preparation, tapering, and revision by January 31.' },
  { month: 'Exam window', dates: 'From Feb 6, 2027', weekRange: 'Exam milestone', focus: '6 February: Exam Window — Final Exam Date / Taper Down & Revision Complete.', done: false, detail: 'Exam window milestone; the scheduled study plan concludes January 31.' },
];

export const highYieldTopics = [
  'Recurrence relations & time complexity',
  'Pipelining (speedup, stalls, hazards)',
  'Cache (hit ratio, mapping, avg. access time)',
  'Process synchronization with semaphores',
  'Page replacement & virtual memory',
  'Normalisation & functional dependencies',
  'SQL query output & relational algebra',
  'Regular languages & closure properties',
  'Graph theory & counting (Discrete Maths)',
  'Probability (conditional, expectation)',
  'Parsing — LL(1), SLR, LR conflicts',
  'TCP congestion control & subnetting',
];

export const traps = [
  'Reading theory instead of solving',
  'Skipping Discrete Mathematics',
  'Treating aptitude as optional',
  'Memorising algorithm code instead of understanding behaviour/complexity',
  'Ignoring MSQ risk (no partial credit)',
  'Doing new question types in the last week',
];

export const syllabusChanges = [
  'Computer Networks — removed: UDP, ARP, DHCP, ICMP, SMTP, FTP, email protocols, flooding, and several application-layer topics.',
  'Computer Organisation — removed: secondary storage & magnetic disk. Added clarity on hardwired/microprogrammed control and instruction-level detail.',
  'Everything else: no change.',
];

export const resources = [
  { label: 'IITians GATE Classes Previous Papers', url: 'https://iitiansgateclasses.com/gate-previous-year-question-papers' },
  { label: 'PDF Utility Studio', url: 'https://pdf-utility-studio.vercel.app/' },
  { label: 'Knowledge Gate - GATE Guidance by Sanchit Sir', url: 'https://www.knowledgegate.ai/courses/GATE-GUIDANCE-BY-SANCHIT-SIR' },
  { label: 'Official GATE Scientific Calculator - TCS iON', url: 'https://tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html' },
];

const weeklyFocus = [
  'C Programming (Data Types and Operators, Control Flow Statements); COA (Introduction of COA); General Aptitude (Quantitative Aptitude); Engineering Mathematics (Probability & Statistics)',
  'C Programming (Functions & Storage Classes, Arrays and Pointers, Strings); Digital Logic (Number System); Verbal Aptitude (Parts of Speech, Vocabulary); Engineering Mathematics (Single Variable Calculus)',
  'Data Structures & Programming (Introduction to Data Structures, Arrays, Linked List); COA (Machine Instruction & Addressing Modes, ALU & Control Unit); Discrete Mathematics (Mathematical Logic, Set Theory); General Aptitude (Analytical Aptitude)',
  'Algorithms (Analysis of Algorithm, Design Strategies); Discrete Mathematics (Graph Theory); Engineering Mathematics (Probability & Statistics — PYQs); C Programming (Structures and Unions, Miscellaneous — PYQs)',
  'Algorithms (Greedy Method, Dynamic Programming); Discrete Mathematics (Combinatorics); Data Structures & Programming (Stack and Queues, Tree)',
  'Operating Systems (Introduction and Background, Process Management); Engineering Mathematics (Linear Algebra); Data Structures & Programming (Graphs, Hashing)',
  'Operating Systems (CPU Scheduling, Process Synchronization – Coordination); DBMS (ER Model, FDs & Normalization); Verbal Aptitude (Reading Comprehension); General Aptitude (Spatial Aptitude)',
  'DBMS (Transaction & Concurrency Control, Query Language – SQL/Relational Algebra); Operating Systems (Memory Management); Algorithms (Graph Algorithms, Heap Algorithms)',
  'Theory of Computation (Finite Automata, Push Down Automata); Computer Networks (IPv4 Addressing, IPv4 Header & Fragmentation, TCP & UDP); Compiler Design (Lexical Analysis & Syntax Analysis); COA (Floating Point Representation); Operating Systems (Deadlock); DBMS (File Organization & Indexing)',
  'Digital Logic (Logic Gates, Minimization, Combinational Circuits, Sequential Circuits); Compiler Design (Syntax Directed Translation, Intermediate Code & Code Optimization); TOC (Turing Machine & Recursively Enumerable Languages, Decidability & Undecidability); Computer Networks (Error Control, Flow Control, Medium Access Control, Routing Protocols & Algorithms, Switching, Application Layer Protocols, IP Support Protocols, OSI and TCP/IP Protocol); COA (Instruction Pipelining, Cache Memory, Secondary Memory & I/O Interface); Operating Systems (File System and Device Management, System Calls and Threads, Revision); Algorithms (Backtracking & Branch-and-Bound)',
  'Mixed PYQs — C Programming, COA, Algorithms, Operating Systems, DBMS',
  'First PYQ pass complete; formula & short-note consolidation — Engineering Mathematics, Discrete Mathematics, Digital Logic, Computer Networks, Compiler Design, Theory of Computation',
  'Full-syllabus revision & error repair — Operating Systems (Deadlock, Memory Management), DBMS (Transaction & Concurrency Control, Query Language), Computer Networks (TCP & UDP, Routing Protocols & Algorithms)',
  'Timed PYQ sets, high-yield rotation — Algorithms (Dynamic Programming, Graph Algorithms), COA (Instruction Pipelining, Cache Memory), Theory of Computation (Finite Automata)',
  'Full mocks under exam timing — Data Structures & Programming (Tree, Graphs, Hashing), Discrete Mathematics (Graph Theory, Combinatorics), General Aptitude (Quantitative Aptitude, Analytical Aptitude)',
  'Mock exams, weak-area repair — Operating Systems (CPU Scheduling, Process Synchronization – Coordination), DBMS (FDs & Normalization, ER Model), Computer Networks (IPv4 Addressing, IPv4 Header & Fragmentation)',
  'High-yield revision — Algorithms, Operating Systems, DBMS, COA, Discrete Mathematics',
  'Timed mocks, error-log review — C Programming, Data Structures & Programming, Digital Logic, Compiler Design',
  'Final revision and taper; conclude all scheduled study by 31 January — Engineering Mathematics, General Aptitude, Verbal Aptitude, and a last pass across Algorithms, Operating Systems, COA',
];

const weeklyCompletionKeys = [
  'classNotesDone',
  'dppQuestionsDone',
  'pyqsDone',
  'mockTestDone',
  'errorLogDone',
  'shortNotesDone',
] as const;

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const weeklyRules: WeeklyRuleEntry[] = Array.from({ length: 19 }, (_, index) => {
  const start = index === 0
    ? new Date(Date.UTC(2026, 8, 26))
    : new Date(Date.UTC(2026, 8, 28 + (index - 1) * 7));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + (index === 0 ? 1 : 6));
  return {
    week: index + 1,
    startDate: dateKey(start),
    endDate: dateKey(end),
    focus: weeklyFocus[index],
    classNotesDone: false,
    dppQuestionsDone: false,
    pyqsDone: false,
    mockTestDone: false,
    errorLogDone: false,
    shortNotesDone: false,
  };
});

export function getCurrentStudyWeek(date = new Date()) {
  const today = localDateKey(date);
  return weeklyRules.find((entry) => entry.startDate <= today && entry.endDate >= today) ?? null;
}

export const USER_DATA_UPDATED_EVENT = 'gate-user-data-updated';

export function notifyUserDataUpdated(userId: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_DATA_UPDATED_EVENT, { detail: { userId } }));
  }
}

export function getStoredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('gate-users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('gate-users', JSON.stringify(users));
  window.dispatchEvent(new CustomEvent(USER_DATA_UPDATED_EVENT));
}

export function createUserRecord(name: string): UserProfile {
  const trimmed = name.trim();
  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: userId,
    name: trimmed,
    email: `${trimmed.toLowerCase().replace(/\s+/g, '.')}@gate.local`,
    targetBand: 'Just qualify',
    targetScore: 60,
    dailyStudyHours: 5,
    currentStreak: 0,
    lastErrorDaysAgo: 0,
    latestMock: 0,
  };
}

export function getMockLogsForUser(userId: string): MockEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`gate-mocks-${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMockLogsForUser(userId: string, logs: MockEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`gate-mocks-${userId}`, JSON.stringify(logs));
  notifyUserDataUpdated(userId);
}

export function getErrorLogsForUser(userId: string): ErrorLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`gate-errors-${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveErrorLogsForUser(userId: string, logs: ErrorLogEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`gate-errors-${userId}`, JSON.stringify(logs));
  notifyUserDataUpdated(userId);
}

export function getUserProgressForUser(userId: string) {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(`gate-${userId}-progress`) ?? '{}') as Record<string, { status: string; pyqDone: boolean }>;
  } catch {
    return {};
  }
}

export function saveUserProgressForUser(userId: string, progress: Record<string, { status: string; pyqDone: boolean }>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`gate-${userId}-progress`, JSON.stringify(progress));
  notifyUserDataUpdated(userId);
}

export function getWeeklyProgressForUser(userId: string): WeeklyRuleEntry[] {
  if (typeof window === 'undefined') return weeklyRules;
  try {
    const raw = window.localStorage.getItem(`gate-weekly-${userId}`);
    const saved = raw ? JSON.parse(raw) as Partial<WeeklyRuleEntry>[] : [];
    const savedByWeek = new Map(saved.map((entry) => [entry.week, entry]));
    return weeklyRules.map((entry) => {
      const savedEntry = savedByWeek.get(entry.week);
      return {
        ...entry,
        ...Object.fromEntries(weeklyCompletionKeys.map((key) => [key, savedEntry?.[key] ?? false])),
      };
    });
  } catch {
    return weeklyRules;
  }
}

export function saveWeeklyProgressForUser(userId: string, entries: WeeklyRuleEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`gate-weekly-${userId}`, JSON.stringify(entries));
  notifyUserDataUpdated(userId);
}

export function getMilestoneProgressForUser(userId: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(`gate-milestones-${userId}`) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function saveMilestoneProgressForUser(userId: string, milestones: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`gate-milestones-${userId}`, JSON.stringify(milestones));
  notifyUserDataUpdated(userId);
}

export function deleteUserData(userId: string) {
  if (typeof window === 'undefined') return;
  const keys = [
    `gate-${userId}-progress`,
    `gate-profile-${userId}`,
    `gate-weekly-${userId}`,
    `gate-milestones-${userId}`,
    `gate-resources-${userId}`,
    `gate-mocks-${userId}`,
    `gate-errors-${userId}`,
  ];
  keys.forEach((key) => window.localStorage.removeItem(key));
  notifyUserDataUpdated(userId);
}

export function getUserProgressSummary(userId: string) {
  if (typeof window === 'undefined') return { progress: 0, streak: 0, latestMock: 0, lastErrorDaysAgo: null as number | null };

  const state = getUserProgressForUser(userId);
  const total = chapters.length;
  const done = chapters.filter((chapter) => state[chapter.id]?.status === 'done').length;
  const logs = getMockLogsForUser(userId);
  const latestMock = logs.at(-1)?.total ?? 0;
  const weekly = getWeeklyProgressForUser(userId);
  const streak = getWeeklyStreak(weekly);
  const errors = getErrorLogsForUser(userId);
  const lastError = errors.reduce<string | null>((latest, entry) => !latest || entry.date > latest ? entry.date : latest, null);
  const lastErrorDaysAgo = lastError
    ? Math.max(0, Math.floor((Date.now() - new Date(`${lastError}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    progress: Math.round((done / total) * 100),
    streak,
    latestMock,
    lastErrorDaysAgo,
  };
}

export function getDaysLeft(targetDate: string) {
  const today = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getWeeklyStreak(entries: WeeklyRuleEntry[]) {
  const savedByWeek = new Map(entries.map((entry) => [entry.week, entry]));
  const alignedEntries = weeklyRules.map((entry) => {
    const savedEntry = savedByWeek.get(entry.week);
    return {
      ...entry,
      ...Object.fromEntries(weeklyCompletionKeys.map((key) => [key, savedEntry?.[key] ?? false])),
    };
  });
  const today = localDateKey(new Date());
  const currentWeekIndex = alignedEntries.findIndex((entry) => entry.startDate <= today && entry.endDate >= today);
  const eligibleEntries = currentWeekIndex >= 0
    ? alignedEntries.slice(0, currentWeekIndex + 1)
    : today < alignedEntries[0]?.startDate
      ? []
      : alignedEntries;
  let streak = 0;
  for (let i = eligibleEntries.length - 1; i >= 0; i -= 1) {
    const item = eligibleEntries[i];
    if (weeklyCompletionKeys.every((key) => item[key])) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
