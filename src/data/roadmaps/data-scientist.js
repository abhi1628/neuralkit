// src/data/roadmaps/data-scientist.js

export const dataScientistRoadmap = {
  slug: 'data-scientist',
  title: 'Data Scientist Roadmap 2026',
  description: 'Complete learning path from mathematics foundations to production deployment. Covers statistics, Python, machine learning, deep learning, and MLOps.',
  shortDesc: 'From math to production ML',
  icon: '📊',
  category: 'Career',
  image: '/images/roadmaps/data-scientist-roadmap.png',
  imageAlt: 'Comprehensive Data Scientist Roadmap showing phases from Foundations to MLOps',
  estimatedHours: 800,
  difficulty: 'Intermediate',
  phases: [
    {
      title: 'Phase 1: Foundations (Mathematics)',
      icon: '📐',
      phaseId: 'math-foundations',
      topics: [
        { id: 'linear-algebra', name: 'Linear Algebra — Vectors, Matrices, Eigenvectors, Eigenvalues' },
        { id: 'probability', name: 'Probability — Bayes Theorem, Conditional Probability, Distributions' },
        { id: 'statistics', name: 'Statistics — Hypothesis Testing, Confidence Intervals, ANOVA, Regression' },
        { id: 'calculus', name: 'Calculus — Derivatives, Gradients, Chain Rule, Optimization' }
      ],
      resources: [
        { name: '3Blue1Brown — Essence of Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
        { name: 'StatQuest — Statistics Fundamentals', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUgYUn' }
      ]
    },
    {
      title: 'Phase 2: Python Ecosystem',
      icon: '🐍',
      phaseId: 'python-ecosystem',
      topics: [
        { id: 'python-basics', name: 'Python Fundamentals — Syntax, Functions, OOP, File I/O' },
        { id: 'numpy', name: 'NumPy — Arrays, Broadcasting, Vectorization' },
        { id: 'pandas', name: 'Pandas — DataFrames, GroupBy, Merge, Time Series' },
        { id: 'data-structures', name: 'Data Structures — Lists, Dicts, Sets, Tuples, Comprehensions' },
        { id: 'algorithms', name: 'Algorithms — Sorting, Searching, Big O Notation' },
        { id: 'git-github', name: 'Git & GitHub — Version Control, Branching, Pull Requests' }
      ],
      resources: [
        { name: 'ZeroAPI Code Playground', url: '/#playground' },
        { name: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }
      ]
    },
    {
      title: 'Phase 3: SQL & Databases',
      icon: '🗄️',
      phaseId: 'sql-databases',
      topics: [
        { id: 'sql-fundamentals', name: 'SQL Fundamentals — SELECT, WHERE, JOIN, GROUP BY, HAVING' },
        { id: 'window-functions', name: 'Window Functions — ROW_NUMBER, RANK, LAG, LEAD' },
        { id: 'ctes-subqueries', name: 'CTEs & Subqueries — Recursive CTEs, Nested Queries' },
        { id: 'db-design', name: 'Database Design — Normalization, Indexing, Constraints' },
        { id: 'nosql-basics', name: 'NoSQL Basics — MongoDB, Redis use cases' }
      ],
      resources: [
        { name: 'SQLBolt — Interactive SQL Tutorial', url: 'https://sqlbolt.com/' }
      ]
    },
    {
      title: 'Phase 4: Data Wrangling & EDA',
      icon: '🔍',
      phaseId: 'data-wrangling',
      topics: [
        { id: 'data-collection', name: 'Data Collection — APIs, Web Scraping, SQL Extraction' },
        { id: 'data-cleaning', name: 'Data Cleaning — Missing Values, Outliers, Duplicates' },
        { id: 'feature-engineering', name: 'Feature Engineering — Encoding, Scaling, Binning, Interaction Terms' },
        { id: 'exploratory-analysis', name: 'Exploratory Analysis — Univariate, Bivariate, Multivariate' },
        { id: 'visualization', name: 'Visualization — Matplotlib, Seaborn, Plotly, Tableau basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 5: Machine Learning (Core)',
      icon: '🤖',
      phaseId: 'ml-core',
      topics: [
        { id: 'supervised-learning', name: 'Supervised Learning — Linear/Logistic Regression, SVM, KNN, Naive Bayes' },
        { id: 'tree-methods', name: 'Tree-Based Methods — Decision Trees, Random Forest, XGBoost, LightGBM' },
        { id: 'unsupervised-learning', name: 'Unsupervised Learning — K-Means, Hierarchical, DBSCAN, PCA' },
        { id: 'model-evaluation', name: 'Model Evaluation — Cross-Validation, Precision/Recall, ROC-AUC, F1' },
        { id: 'bias-variance', name: 'Bias-Variance Tradeoff — Overfitting, Underfitting, Regularization' }
      ],
      resources: [
        { name: 'ZeroAPI MCQ Generator', url: '/#tools' }
      ]
    },
    {
      title: 'Phase 6: Deep Learning',
      icon: '🧠',
      phaseId: 'deep-learning',
      topics: [
        { id: 'neural-networks', name: 'Neural Networks — Perceptron, Backpropagation, Activation Functions' },
        { id: 'cnns', name: 'CNNs — Convolution, Pooling, Transfer Learning (ResNet, EfficientNet)' },
        { id: 'rnns-lstms', name: 'RNNs & LSTMs — Sequence Modeling, Time Series Forecasting' },
        { id: 'transformers', name: 'Transformers — Attention Mechanism, BERT, GPT Architecture' },
        { id: 'dl-frameworks', name: 'Frameworks — PyTorch, TensorFlow/Keras basics' }
      ],
      resources: []
    },
    {
      title: 'Phase 7: Generative AI & LLMs',
      icon: '✨',
      phaseId: 'genai-llms',
      topics: [
        { id: 'llm-architecture', name: 'Large Language Models — GPT, Claude, Llama architecture' },
        { id: 'prompt-engineering', name: 'Prompt Engineering — Zero-shot, Few-shot, Chain-of-Thought' },
        { id: 'rag-systems', name: 'RAG Systems — Vector DBs (Chroma, Pinecone), Embedding Models' },
        { id: 'fine-tuning', name: 'Fine-Tuning — LoRA, QLoRA, Full Fine-Tuning' },
        { id: 'ai-agents', name: 'AI Agents — Tool Use, Planning, Memory (LangChain, CrewAI)' }
      ],
      resources: [
        { name: 'ZeroAPI Ask Author — Prof. Abhishek Singh', url: '/#about' }
      ]
    },
    {
      title: 'Phase 8: MLOps & Deployment',
      icon: '🚀',
      phaseId: 'mlops',
      topics: [
        { id: 'experiment-tracking', name: 'Experiment Tracking — MLflow, Weights & Biases' },
        { id: 'model-versioning', name: 'Model Versioning — DVC, Git LFS' },
        { id: 'containerization', name: 'Containerization — Docker, Kubernetes basics' },
        { id: 'ci-cd-ml', name: 'CI/CD for ML — GitHub Actions, Pre-commit Hooks' },
        { id: 'monitoring', name: 'Monitoring — Drift Detection, Performance Degradation' },
        { id: 'cloud-deployment', name: 'Cloud Deployment — AWS SageMaker, GCP Vertex AI, Azure ML' }
      ],
      resources: []
    }
  ],
  dependencies: [
    { from: 'linear-algebra', to: 'pca', label: 'required for' },
    { from: 'linear-algebra', to: 'neural-networks', label: 'required for' },
    { from: 'calculus', to: 'neural-networks', label: 'required for' },
    { from: 'probability', to: 'naive-bayes', label: 'required for' },
    { from: 'statistics', to: 'model-evaluation', label: 'required for' },
    { from: 'statistics', to: 'hypothesis-testing', label: 'required for' },
    { from: 'python-basics', to: 'numpy', label: 'required for' },
    { from: 'python-basics', to: 'pandas', label: 'required for' },
    { from: 'numpy', to: 'feature-engineering', label: 'required for' },
    { from: 'pandas', to: 'data-cleaning', label: 'required for' },
    { from: 'pandas', to: 'exploratory-analysis', label: 'required for' },
    { from: 'sql-fundamentals', to: 'data-collection', label: 'required for' },
    { from: 'data-cleaning', to: 'feature-engineering', label: 'required for' },
    { from: 'feature-engineering', to: 'supervised-learning', label: 'required for' },
    { from: 'exploratory-analysis', to: 'supervised-learning', label: 'required for' },
    { from: 'visualization', to: 'model-evaluation', label: 'helps with' },
    { from: 'supervised-learning', to: 'neural-networks', label: 'required for' },
    { from: 'model-evaluation', to: 'neural-networks', label: 'required for' },
    { from: 'neural-networks', to: 'cnns', label: 'required for' },
    { from: 'neural-networks', to: 'rnns-lstms', label: 'required for' },
    { from: 'neural-networks', to: 'transformers', label: 'required for' },
    { from: 'linear-algebra', to: 'transformers', label: 'required for' },
    { from: 'transformers', to: 'llm-architecture', label: 'required for' },
    { from: 'transformers', to: 'prompt-engineering', label: 'required for' },
    { from: 'dl-frameworks', to: 'fine-tuning', label: 'required for' },
    { from: 'rag-systems', to: 'ai-agents', label: 'required for' },
    { from: 'model-evaluation', to: 'monitoring', label: 'required for' },
    { from: 'git-github', to: 'ci-cd-ml', label: 'required for' },
    { from: 'containerization', to: 'cloud-deployment', label: 'required for' }
  ],
  assessment: [
    {
      id: 'knows-python',
      question: 'Have you written Python code before (functions, loops, basic libraries)?',
      topicId: 'python-basics',
      phaseId: 'python-ecosystem',
      skipIfYes: ['python-basics', 'data-structures'],
      estimatedHoursSaved: 80
    },
    {
      id: 'knows-math',
      question: 'Are you comfortable with matrices, derivatives, and probability distributions?',
      topicId: 'linear-algebra',
      phaseId: 'math-foundations',
      skipIfYes: ['linear-algebra', 'calculus', 'probability'],
      estimatedHoursSaved: 100
    },
    {
      id: 'knows-sql',
      question: 'Can you write JOIN, GROUP BY, and subqueries in SQL?',
      topicId: 'sql-fundamentals',
      phaseId: 'sql-databases',
      skipIfYes: ['sql-fundamentals'],
      estimatedHoursSaved: 40
    },
    {
      id: 'knows-ml-basics',
      question: 'Have you built and evaluated ML models (regression, classification, clustering)?',
      topicId: 'supervised-learning',
      phaseId: 'ml-core',
      skipIfYes: ['supervised-learning', 'unsupervised-learning', 'model-evaluation'],
      estimatedHoursSaved: 120
    },
    {
      id: 'knows-deep-learning',
      question: 'Have you trained neural networks using PyTorch or TensorFlow?',
      topicId: 'neural-networks',
      phaseId: 'deep-learning',
      skipIfYes: ['neural-networks', 'dl-frameworks'],
      estimatedHoursSaved: 100
    }
  ],
  softSkills: [
    'Curiosity & Problem Solving',
    'Communication & Storytelling',
    'Business Acumen',
    'Experimentation Mindset',
    'Ethics & Responsible AI',
    'Lifelong Learning'
  ],
  relatedTools: ['codePlayground', 'mcqGenerator', 'documentSummarizer'],
  meta: {
    keywords: 'data scientist roadmap 2026, learn data science, python data science, ml engineer path, data science career',
    ogImage: '/images/roadmaps/data-scientist-roadmap.png'
  }
};
