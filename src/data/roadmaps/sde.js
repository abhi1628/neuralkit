// src/data/roadmaps/sde.js

export const sdeRoadmap = {
  slug: 'sde',
  title: 'Software Development Engineer (SDE) Roadmap 2026',
  description: 'Complete path to become a Software Development Engineer. From CS fundamentals and DSA to system design, backend/frontend development, cloud, and career growth. Learn → Code → Build → Ship → Solve Problems → Make Impact.',
  shortDesc: 'Learn, code, build, ship, impact',
  icon: '💻',
  category: 'Career',
  image: '/images/roadmaps/sde.png',
  imageAlt: 'Comprehensive SDE Roadmap from Foundations to Career Growth',
  estimatedHours: 1200,
  difficulty: 'Intermediate',
  phases: [
    {
      title: 'Phase 1: Computer Science Fundamentals',
      icon: '🔌',
      phaseId: 'cs-fundamentals',
      topics: [
        { id: 'how-computers-work', name: 'How Computers Work (High Level)' },
        { id: 'data-representation', name: 'Data Representation (Binary, ASCII, Unicode)' },
        { id: 'operating-systems', name: 'Operating Systems Basics' },
        { id: 'computer-networks', name: 'Computer Networks Basics' },
        { id: 'database-basics', name: 'Database Basics' },
        { id: 'time-space-complexity', name: 'Time & Space Complexity' },
        { id: 'big-o', name: 'Big O Notation' }
      ],
      resources: []
    },
    {
      title: 'Phase 2: Programming Fundamentals',
      icon: '💻',
      phaseId: 'programming-fundamentals',
      topics: [
        { id: 'choose-language', name: 'Choose a Language (C++/Java/Python/Go)' },
        { id: 'syntax-basics', name: 'Syntax & Statements' },
        { id: 'variables-datatypes', name: 'Variables, Data Types' },
        { id: 'control-flow', name: 'Control Flow' },
        { id: 'functions', name: 'Functions' },
        { id: 'arrays-strings', name: 'Arrays, Strings' },
        { id: 'io-operations', name: 'I/O Operations' },
        { id: 'debugging-basics', name: 'Debugging Basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 3: Data Structures & Algorithms',
      icon: '📊',
      phaseId: 'dsa',
      topics: [
        { id: 'arrays-linked-lists', name: 'Arrays & Linked Lists' },
        { id: 'stacks-queues', name: 'Stacks & Queues' },
        { id: 'hashing', name: 'Hashing' },
        { id: 'trees-binary-trees', name: 'Trees & Binary Trees' },
        { id: 'heaps', name: 'Heaps' },
        { id: 'graphs', name: 'Graphs' },
        { id: 'sorting-algorithms', name: 'Sorting Algorithms' },
        { id: 'searching-algorithms', name: 'Searching Algorithms' },
        { id: 'backtracking', name: 'Backtracking' },
        { id: 'time-space-analysis', name: 'Time & Space Analysis' }
      ],
      resources: []
    },
    {
      title: 'Phase 4: Problem Solving (Practice)',
      icon: '🧠',
      phaseId: 'problem-solving',
      topics: [
        { id: 'solve-daily', name: 'Solve Problems Daily' },
        { id: 'pattern-recognition', name: 'Pattern Recognition' },
        { id: 'break-down-problem', name: 'Break Down Problem' },
        { id: 'edge-cases', name: 'Edge Cases' },
        { id: 'dry-run-trace', name: 'Dry Run / Trace' },
        { id: 'use-dsa-effectively', name: 'Use DSA Effectively' },
        { id: 'learn-from-editorials', name: 'Learn From Editorials' }
      ],
      resources: []
    },
    {
      title: 'Phase 5: OOP (Object Oriented Programming)',
      icon: '🏗️',
      phaseId: 'oop',
      topics: [
        { id: 'classes-objects', name: 'Classes & Objects' },
        { id: 'constructors', name: 'Constructors' },
        { id: 'inheritance', name: 'Inheritance' },
        { id: 'polymorphism', name: 'Polymorphism' },
        { id: 'abstraction', name: 'Abstraction' },
        { id: 'encapsulation', name: 'Encapsulation' },
        { id: 'interfaces-abstract-classes', name: 'Interfaces / Abstract Classes' },
        { id: 'design-principles-solid', name: 'Design Principles (SOLID)' }
      ],
      resources: []
    },
    {
      title: 'Phase 6: Basic Development Skills',
      icon: '🛠️',
      phaseId: 'basic-dev-skills',
      topics: [
        { id: 'git-github', name: 'Git & GitHub' },
        { id: 'command-line', name: 'Command Line (CLI)' },
        { id: 'vscode-ide', name: 'VS Code / IDE' },
        { id: 'code-formatting', name: 'Code Formatting' },
        { id: 'documentation', name: 'Documentation' },
        { id: 'unit-testing-basics', name: 'Unit Testing Basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 7: Advanced DSA',
      icon: '🚀',
      phaseId: 'advanced-dsa',
      topics: [
        { id: 'advanced-trees', name: 'Advanced Trees' },
        { id: 'tries', name: 'Tries' },
        { id: 'segment-trees', name: 'Segment Trees' },
        { id: 'disjoint-set', name: 'Disjoint Set (Union Find)' },
        { id: 'dynamic-programming', name: 'Dynamic Programming' },
        { id: 'greedy-algorithms', name: 'Greedy Algorithms' },
        { id: 'sliding-window', name: 'Sliding Window' },
        { id: 'bit-manipulation', name: 'Bit Manipulation' },
        { id: 'advanced-graphs', name: 'Advanced Graphs' }
      ],
      resources: []
    },
    {
      title: 'Phase 8: Databases & SQL',
      icon: '🗄️',
      phaseId: 'databases-sql',
      topics: [
        { id: 'relational-databases', name: 'Relational Databases' },
        { id: 'sql-basics', name: 'SQL Basics' },
        { id: 'joins', name: 'Joins' },
        { id: 'indexes', name: 'Indexes' },
        { id: 'normalisation', name: 'Normalisation' },
        { id: 'transactions-acid', name: 'Transactions (ACID)' },
        { id: 'nosql-basics', name: 'NoSQL Basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 9: System Design Fundamentals',
      icon: '🏛️',
      phaseId: 'system-design-fundamentals',
      topics: [
        { id: 'what-is-system-design', name: 'What is System Design?' },
        { id: 'requirements-gathering', name: 'Requirements Gathering' },
        { id: 'estimation-techniques', name: 'Estimation Techniques' },
        { id: 'high-level-design', name: 'High Level Design' },
        { id: 'low-level-design', name: 'Low Level Design' },
        { id: 'design-concepts', name: 'Design Concepts' },
        { id: 'scalability', name: 'Scalability' },
        { id: 'reliability', name: 'Reliability' },
        { id: 'availability', name: 'Availability' },
        { id: 'consistency', name: 'Consistency' }
      ],
      resources: []
    },
    {
      title: 'Phase 10: Core Development',
      icon: '⚙️',
      phaseId: 'core-development',
      topics: [
        { id: 'dsa-in-depth', name: 'Data Structures in Depth' },
        { id: 'algorithms-in-depth', name: 'Algorithms in Depth' },
        { id: 'exception-handling', name: 'Exception Handling' },
        { id: 'file-io', name: 'File I/O' },
        { id: 'multithreading-concurrency', name: 'Multithreading / Concurrency Basics' },
        { id: 'memory-management', name: 'Memory Management' },
        { id: 'design-patterns-basics', name: 'Design Patterns (Gang of Four)' }
      ],
      resources: []
    },
    {
      title: 'Phase 11: Web Development (Basics)',
      icon: '🌐',
      phaseId: 'web-dev-basics',
      topics: [
        { id: 'html-css-js', name: 'HTML, CSS, JavaScript (Basics)' },
        { id: 'dom-manipulation', name: 'DOM Manipulation' },
        { id: 'http-https', name: 'HTTP/HTTPS' },
        { id: 'rest-apis', name: 'REST APIs' },
        { id: 'json', name: 'JSON' },
        { id: 'authentication-basics', name: 'Authentication Basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 12: Software Engineering Principles',
      icon: '📐',
      phaseId: 'se-principles',
      topics: [
        { id: 'sdlc-stlc', name: 'SDLC & STLC' },
        { id: 'agile-methodology', name: 'Agile Methodology' },
        { id: 'code-reviews', name: 'Code Reviews' },
        { id: 'clean-code', name: 'Clean Code' },
        { id: 'refactoring', name: 'Refactoring' },
        { id: 'testing-strategies', name: 'Testing Strategies' },
        { id: 'cicd-basics', name: 'CI/CD Basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 13: Advanced Topics',
      icon: '🔥',
      phaseId: 'advanced-topics',
      topics: [
        { id: 'design-patterns-deep', name: 'Design Patterns (Deep Dive)' },
        { id: 'object-oriented-design', name: 'Object Oriented Design' },
        { id: 'concurrency-multithreading', name: 'Concurrency & Multi-threading' },
        { id: 'low-level-design', name: 'Low Level Design (LLD)' }
      ],
      resources: []
    },
    {
      title: 'Phase 14: Backend Development (Choose a Stack)',
      icon: '⚡',
      phaseId: 'backend-development',
      topics: [
        { id: 'nodejs-express', name: 'Node.js / Express' },
        { id: 'java-spring-boot', name: 'Java / Spring Boot' },
        { id: 'python-django-fastapi', name: 'Python / Django / FastAPI' },
        { id: 'build-restful-apis', name: 'Build RESTful APIs' },
        { id: 'middleware', name: 'Middleware' },
        { id: 'validation', name: 'Validation' },
        { id: 'error-handling', name: 'Error Handling' },
        { id: 'logging', name: 'Logging' }
      ],
      resources: []
    },
    {
      title: 'Phase 15: Frontend Development (Intermediate)',
      icon: '🎨',
      phaseId: 'frontend-development',
      topics: [
        { id: 'es6-javascript', name: 'ES6+ JavaScript' },
        { id: 'react-angular-vue', name: 'React / Angular / Vue' },
        { id: 'components', name: 'Components' },
        { id: 'state-management', name: 'State Management (Redux / Context-API)' },
        { id: 'routing', name: 'Routing' },
        { id: 'api-integration', name: 'API Integration' }
      ],
      resources: []
    },
    {
      title: 'Phase 16: System Design (Advanced)',
      icon: '🏗️',
      phaseId: 'system-design-advanced',
      topics: [
        { id: 'caching-redis', name: 'Caching (Redis)' },
        { id: 'message-queues', name: 'Message Queues (Kafka, RabbitMQ)' },
        { id: 'load-balancing', name: 'Load Balancing' },
        { id: 'rate-limiting', name: 'Rate Limiting' },
        { id: 'microservices-basics', name: 'Microservices Basics' },
        { id: 'database-sharding', name: 'Database Sharding' },
        { id: 'cdn', name: 'CDN' },
        { id: 'monitoring-logging', name: 'Monitoring & Logging' }
      ],
      resources: []
    },
    {
      title: 'Phase 17: Testing',
      icon: '🧪',
      phaseId: 'testing',
      topics: [
        { id: 'unit-testing', name: 'Unit Testing' },
        { id: 'integration-testing', name: 'Integration Testing' },
        { id: 'system-testing', name: 'System Testing' },
        { id: 'end-to-end-testing', name: 'End to End Testing' },
        { id: 'test-frameworks', name: 'Test Frameworks (Jest, JUnit, PyTest)' }
      ],
      resources: []
    },
    {
      title: 'Phase 18: DevOps Basics',
      icon: '🔧',
      phaseId: 'devops-basics',
      topics: [
        { id: 'linux-basics', name: 'Linux Basics' },
        { id: 'docker', name: 'Docker' },
        { id: 'kubernetes-basics', name: 'Kubernetes Basics' },
        { id: 'cicd-pipelines', name: 'CI/CD Pipelines' },
        { id: 'jenkins-github-actions', name: 'Jenkins / GitHub Actions' },
        { id: 'monitoring-prometheus', name: 'Monitoring (Prometheus, Grafana)' }
      ],
      resources: []
    },
    {
      title: 'Phase 19: Cloud Basics',
      icon: '☁️',
      phaseId: 'cloud-basics',
      topics: [
        { id: 'aws-gcp-azure', name: 'AWS / GCP / Azure (Choose one)' },
        { id: 'compute-services', name: 'Compute Services' },
        { id: 'storage-services', name: 'Storage Services' },
        { id: 'database-services', name: 'Database Services' },
        { id: 'iam-basics', name: 'IAM Basics' },
        { id: 'deploy-applications', name: 'Deploy Applications' }
      ],
      resources: []
    },
    {
      title: 'Phase 20: Real World Projects',
      icon: '🚀',
      phaseId: 'real-world-projects',
      topics: [
        { id: 'build-end-to-end', name: 'Build End-to-End Projects' },
        { id: 'use-database', name: 'Use Database' },
        { id: 'implement-auth', name: 'Implement Authentication' },
        { id: 'deployment', name: 'Deployment' },
        { id: 'write-clean-code', name: 'Write Clean, Scalable Code' },
        { id: 'add-tests', name: 'Add Tests' },
        { id: 'document-project', name: 'Document Your Project' }
      ],
      resources: []
    },
    {
      title: 'Phase 21: Open Source Contribution',
      icon: '🌟',
      phaseId: 'open-source',
      topics: [
        { id: 'understand-open-source', name: 'Understand Open Source' },
        { id: 'contribute-to-projects', name: 'Contribute to Projects' },
        { id: 'improve-github', name: 'Improve Your GitHub' },
        { id: 'build-in-public', name: 'Build in Public' }
      ],
      resources: []
    },
    {
      title: 'Phase 22: Coding Interview Prep',
      icon: '🎯',
      phaseId: 'interview-prep',
      topics: [
        { id: 'dsa-topics-wise', name: 'DSA (Topic Wise)' },
        { id: 'system-design-interview', name: 'System Design' },
        { id: 'behavioral-questions', name: 'Behavioral Questions' },
        { id: 'mock-interviews', name: 'Mock Interviews' },
        { id: 'analyse-improve', name: 'Analyse & Improve' }
      ],
      resources: []
    },
    {
      title: 'Phase 23: Soft Skills',
      icon: '🤝',
      phaseId: 'soft-skills',
      topics: [
        { id: 'communication', name: 'Communication' },
        { id: 'teamwork', name: 'Teamwork' },
        { id: 'time-management', name: 'Time Management' },
        { id: 'problem-solving-approach', name: 'Problem Solving Approach' },
        { id: 'leadership', name: 'Leadership' }
      ],
      resources: []
    },
    {
      title: 'Phase 24: Career & Growth',
      icon: '📈',
      phaseId: 'career-growth',
      topics: [
        { id: 'build-strong-resume', name: 'Build a Strong Resume' },
        { id: 'linkedin-presence', name: 'LinkedIn Presence' },
        { id: 'networking', name: 'Networking' },
        { id: 'apply-interview', name: 'Apply & Interview' },
        { id: 'keep-learning', name: 'Keep Learning' },
        { id: 'mentorship', name: 'Mentorship' }
      ],
      resources: []
    }
  ],
  dependencies: [
    // Foundations → Programming
    { from: 'how-computers-work', to: 'choose-language', label: 'required for' },
    { from: 'data-representation', to: 'variables-datatypes', label: 'required for' },
    // Programming → DSA
    { from: 'control-flow', to: 'arrays-linked-lists', label: 'required for' },
    { from: 'functions', to: 'stacks-queues', label: 'required for' },
    { from: 'arrays-strings', to: 'hashing', label: 'required for' },
    // DSA → Problem Solving
    { from: 'arrays-linked-lists', to: 'solve-daily', label: 'required for' },
    { from: 'trees-binary-trees', to: 'pattern-recognition', label: 'required for' },
    { from: 'graphs', to: 'break-down-problem', label: 'required for' },
    // Programming → OOP
    { from: 'functions', to: 'classes-objects', label: 'required for' },
    // OOP → Basic Dev Skills
    { from: 'encapsulation', to: 'git-github', label: 'required for' },
    // DSA → Advanced DSA
    { from: 'trees-binary-trees', to: 'advanced-trees', label: 'required for' },
    { from: 'graphs', to: 'advanced-graphs', label: 'required for' },
    { from: 'dynamic-programming', to: 'segment-trees', label: 'required for' },
    // DSA → Databases
    { from: 'hashing', to: 'indexes', label: 'required for' },
    // Databases → System Design Fundamentals
    { from: 'normalisation', to: 'high-level-design', label: 'required for' },
    { from: 'transactions-acid', to: 'consistency', label: 'required for' },
    // System Design Fundamentals → Core Development
    { from: 'high-level-design', to: 'dsa-in-depth', label: 'required for' },
    { from: 'low-level-design', to: 'algorithms-in-depth', label: 'required for' },
    // Core Development → Web Dev
    { from: 'file-io', to: 'html-css-js', label: 'required for' },
    { from: 'rest-apis', to: 'dom-manipulation', label: 'required for' },
    // Core Development → SE Principles
    { from: 'exception-handling', to: 'clean-code', label: 'required for' },
    { from: 'multithreading-concurrency', to: 'testing-strategies', label: 'required for' },
    // Advanced DSA → Advanced Topics
    { from: 'dynamic-programming', to: 'design-patterns-deep', label: 'required for' },
    { from: 'advanced-graphs', to: 'object-oriented-design', label: 'required for' },
    // Web Dev → Backend/Frontend
    { from: 'html-css-js', to: 'nodejs-express', label: 'required for' },
    { from: 'rest-apis', to: 'build-restful-apis', label: 'required for' },
    { from: 'dom-manipulation', to: 'react-angular-vue', label: 'required for' },
    // System Design Fundamentals → Advanced System Design
    { from: 'scalability', to: 'caching-redis', label: 'required for' },
    { from: 'reliability', to: 'load-balancing', label: 'required for' },
    // Backend → Testing
    { from: 'build-restful-apis', to: 'unit-testing', label: 'required for' },
    // SE Principles → DevOps
    { from: 'cicd-basics', to: 'docker', label: 'required for' },
    { from: 'testing-strategies', to: 'cicd-pipelines', label: 'required for' },
    // DevOps → Cloud
    { from: 'docker', to: 'aws-gcp-azure', label: 'required for' },
    { from: 'kubernetes-basics', to: 'deploy-applications', label: 'required for' },
    // Backend/Frontend → Real World Projects
    { from: 'build-restful-apis', to: 'build-end-to-end', label: 'required for' },
    { from: 'react-angular-vue', to: 'use-database', label: 'required for' },
    // Projects → Open Source
    { from: 'build-end-to-end', to: 'contribute-to-projects', label: 'required for' },
    // Projects → Interview Prep
    { from: 'build-end-to-end', to: 'dsa-topics-wise', label: 'required for' },
    { from: 'caching-redis', to: 'system-design-interview', label: 'required for' },
    // Interview Prep → Career
    { from: 'mock-interviews', to: 'apply-interview', label: 'required for' },
    // Soft Skills → Career
    { from: 'communication', to: 'networking', label: 'required for' },
    { from: 'leadership', to: 'mentorship', label: 'required for' }
  ],
  assessment: [
    {
      id: 'knows-programming',
      question: 'Have you written code in any language (C++, Java, Python, Go) with functions, loops, and arrays?',
      topicId: 'choose-language',
      phaseId: 'programming-fundamentals',
      skipIfYes: ['how-computers-work', 'data-representation', 'choose-language', 'syntax-basics', 'variables-datatypes', 'control-flow'],
      estimatedHoursSaved: 80
    },
    {
      id: 'knows-dsa',
      question: 'Can you solve medium-level DSA problems on arrays, trees, graphs, and dynamic programming?',
      topicId: 'arrays-linked-lists',
      phaseId: 'dsa',
      skipIfYes: ['arrays-linked-lists', 'stacks-queues', 'hashing', 'trees-binary-trees', 'heaps', 'graphs', 'sorting-algorithms', 'searching-algorithms'],
      estimatedHoursSaved: 120
    },
    {
      id: 'knows-system-design',
      question: 'Have you designed scalable systems with caching, load balancing, and database sharding?',
      topicId: 'what-is-system-design',
      phaseId: 'system-design-fundamentals',
      skipIfYes: ['what-is-system-design', 'requirements-gathering', 'estimation-techniques', 'high-level-design', 'low-level-design', 'scalability', 'reliability', 'availability'],
      estimatedHoursSaved: 100
    },
    {
      id: 'knows-backend',
      question: 'Have you built and deployed REST APIs with authentication, database, and error handling?',
      topicId: 'build-restful-apis',
      phaseId: 'backend-development',
      skipIfYes: ['nodejs-express', 'java-spring-boot', 'python-django-fastapi', 'build-restful-apis', 'middleware', 'validation', 'error-handling', 'logging'],
      estimatedHoursSaved: 150
    },
    {
      id: 'knows-cloud',
      question: 'Have you deployed applications on AWS, GCP, or Azure with CI/CD pipelines?',
      topicId: 'aws-gcp-azure',
      phaseId: 'cloud-basics',
      skipIfYes: ['aws-gcp-azure', 'compute-services', 'storage-services', 'database-services', 'iam-basics', 'deploy-applications', 'docker', 'kubernetes-basics', 'cicd-pipelines'],
      estimatedHoursSaved: 120
    }
  ],
  softSkills: [
    'Be Curious',
    'Prioritize Consistently',
    'Think in Systems',
    'Never Stop Building',
    'Start Shipping',
    'Play If Possible',
    'Help Others',
    'Communication',
    'Teamwork',
    'Time Management',
    'Problem Solving Approach',
    'Leadership'
  ],
  relatedTools: ['codePlayground', 'mcqGenerator', 'codeExplainer'],
  meta: {
    keywords: 'sde roadmap 2026, software development engineer, learn coding, dsa, system design, backend development, full stack developer',
    ogImage: '/images/roadmaps/sde.png'
  }
};
