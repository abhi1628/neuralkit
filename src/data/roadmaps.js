// src/data/roadmaps.js
// All roadmap content — theory, phases, images, metadata, dependencies, assessments

export const ROADMAPS = [
  {
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
    // Knowledge Graph Dependencies
    dependencies: [
      // Math → ML
      { from: 'linear-algebra', to: 'pca', label: 'required for' },
      { from: 'linear-algebra', to: 'neural-networks', label: 'required for' },
      { from: 'calculus', to: 'neural-networks', label: 'required for' },
      { from: 'probability', to: 'naive-bayes', label: 'required for' },
      { from: 'statistics', to: 'model-evaluation', label: 'required for' },
      { from: 'statistics', to: 'hypothesis-testing', label: 'required for' },
      // Python → Data/ML
      { from: 'python-basics', to: 'numpy', label: 'required for' },
      { from: 'python-basics', to: 'pandas', label: 'required for' },
      { from: 'numpy', to: 'feature-engineering', label: 'required for' },
      { from: 'pandas', to: 'data-cleaning', label: 'required for' },
      { from: 'pandas', to: 'exploratory-analysis', label: 'required for' },
      // SQL → Data Wrangling
      { from: 'sql-fundamentals', to: 'data-collection', label: 'required for' },
      // Data Wrangling → ML
      { from: 'data-cleaning', to: 'feature-engineering', label: 'required for' },
      { from: 'feature-engineering', to: 'supervised-learning', label: 'required for' },
      { from: 'exploratory-analysis', to: 'supervised-learning', label: 'required for' },
      { from: 'visualization', to: 'model-evaluation', label: 'helps with' },
      // ML → Deep Learning
      { from: 'supervised-learning', to: 'neural-networks', label: 'required for' },
      { from: 'model-evaluation', to: 'neural-networks', label: 'required for' },
      { from: 'neural-networks', to: 'cnns', label: 'required for' },
      { from: 'neural-networks', to: 'rnns-lstms', label: 'required for' },
      { from: 'neural-networks', to: 'transformers', label: 'required for' },
      { from: 'linear-algebra', to: 'transformers', label: 'required for' },
      // Deep Learning → GenAI
      { from: 'transformers', to: 'llm-architecture', label: 'required for' },
      { from: 'transformers', to: 'prompt-engineering', label: 'required for' },
      { from: 'dl-frameworks', to: 'fine-tuning', label: 'required for' },
      { from: 'rag-systems', to: 'ai-agents', label: 'required for' },
      // ML → MLOps
      { from: 'model-evaluation', to: 'monitoring', label: 'required for' },
      { from: 'git-github', to: 'ci-cd-ml', label: 'required for' },
      { from: 'containerization', to: 'cloud-deployment', label: 'required for' }
    ],
    // Skip Assessment Questions
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
  },
  {
    slug: 'ml-engineer',
    title: 'ML Engineer Roadmap 2026',
    description: 'Engineering-focused path for building production machine learning systems. Emphasizes software engineering, MLOps, and scalable deployment.',
    shortDesc: 'Build production ML systems',
    icon: '⚙️',
    category: 'Career',
    image: '/images/roadmaps/ml-engineer-roadmap.png',
    imageAlt: 'ML Engineer Roadmap showing software engineering to production deployment',
    estimatedHours: 900,
    difficulty: 'Advanced',
    phases: [
      {
        title: 'Phase 1: Software Engineering Foundations',
        icon: '💻',
        phaseId: 'se-foundations',
        topics: [
          { id: 'dsa', name: 'Data Structures & Algorithms — Arrays, Trees, Graphs, Dynamic Programming' },
          { id: 'system-design-basics', name: 'System Design Basics — Scalability, Latency, Throughput' },
          { id: 'python-advanced', name: 'Python Advanced — Decorators, Generators, Context Managers, Metaclasses' },
          { id: 'testing', name: 'Testing — Unit Tests, Integration Tests, Pytest, Mocking' },
          { id: 'code-quality', name: 'Code Quality — Linting, Type Hints, Docstrings, Code Review' }
        ],
        resources: []
      },
      {
        title: 'Phase 2: Data Engineering',
        icon: '🔧',
        phaseId: 'data-engineering',
        topics: [
          { id: 'etl-pipelines', name: 'ETL Pipelines — Apache Airflow, Prefect, Dagster' },
          { id: 'stream-processing', name: 'Stream Processing — Apache Kafka, Spark Streaming, Flink' },
          { id: 'data-warehousing', name: 'Data Warehousing — Snowflake, BigQuery, Redshift' },
          { id: 'data-lakes', name: 'Data Lakes — Delta Lake, Apache Iceberg, Hudi' },
          { id: 'feature-stores', name: 'Feature Stores — Feast, Tecton' }
        ],
        resources: []
      },
      {
        title: 'Phase 3: ML Fundamentals',
        icon: '📈',
        phaseId: 'ml-fundamentals',
        topics: [
          { id: 'classical-ml', name: 'Classical ML — Same as Data Scientist Phase 5' },
          { id: 'dl-basics', name: 'Deep Learning — CNN, RNN, Transformer basics' },
          { id: 'reinforcement-learning', name: 'Reinforcement Learning — Q-Learning, Policy Gradients' },
          { id: 'probabilistic-ml', name: 'Probabilistic ML — Bayesian Methods, Gaussian Processes' }
        ],
        resources: []
      },
      {
        title: 'Phase 4: MLOps & Production',
        icon: '🏭',
        phaseId: 'mlops-production',
        topics: [
          { id: 'model-serving', name: 'Model Serving — REST APIs, gRPC, Batch vs Real-time' },
          { id: 'scaling', name: 'Scaling — Kubernetes, Auto-scaling, Load Balancing' },
          { id: 'ab-testing', name: 'A/B Testing — Experimentation Frameworks, Statistical Power' },
          { id: 'feature-pipelines', name: 'Feature Pipelines — Online/Offline Consistency' },
          { id: 'model-registry', name: 'Model Registry — MLflow Model Registry, Databricks' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: Advanced Systems',
        icon: '🏗️',
        phaseId: 'advanced-systems',
        topics: [
          { id: 'distributed-training', name: 'Distributed Training — Horovod, DeepSpeed, FSDP' },
          { id: 'model-optimization', name: 'Model Optimization — Quantization, Pruning, Distillation' },
          { id: 'edge-deployment', name: 'Edge Deployment — ONNX, TensorRT, Core ML' },
          { id: 'llm-serving', name: 'LLM Serving — vLLM, TGI, OpenAI-compatible APIs' },
          { id: 'multimodal-systems', name: 'Multi-modal Systems — Vision-Language, Audio Processing' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'dsa', to: 'system-design-basics', label: 'required for' },
      { from: 'python-advanced', to: 'etl-pipelines', label: 'required for' },
      { from: 'testing', to: 'model-serving', label: 'required for' },
      { from: 'code-quality', to: 'model-registry', label: 'required for' },
      { from: 'etl-pipelines', to: 'feature-pipelines', label: 'required for' },
      { from: 'stream-processing', to: 'feature-pipelines', label: 'required for' },
      { from: 'data-warehousing', to: 'feature-stores', label: 'required for' },
      { from: 'classical-ml', to: 'model-serving', label: 'required for' },
      { from: 'dl-basics', to: 'distributed-training', label: 'required for' },
      { from: 'dl-basics', to: 'model-optimization', label: 'required for' },
      { from: 'reinforcement-learning', to: 'multimodal-systems', label: 'helps with' },
      { from: 'model-serving', to: 'scaling', label: 'required for' },
      { from: 'scaling', to: 'llm-serving', label: 'required for' },
      { from: 'feature-pipelines', to: 'model-registry', label: 'required for' },
      { from: 'model-optimization', to: 'edge-deployment', label: 'required for' },
      { from: 'distributed-training', to: 'llm-serving', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-python-advanced',
        question: 'Have you used Python decorators, generators, and context managers in production?',
        topicId: 'python-advanced',
        phaseId: 'se-foundations',
        skipIfYes: ['python-advanced', 'code-quality'],
        estimatedHoursSaved: 60
      },
      {
        id: 'knows-system-design',
        question: 'Can you design a system handling 10K+ requests/sec with caching and load balancing?',
        topicId: 'system-design-basics',
        phaseId: 'se-foundations',
        skipIfYes: ['system-design-basics', 'dsa'],
        estimatedHoursSaved: 100
      },
      {
        id: 'knows-ml-production',
        question: 'Have you deployed ML models to production with monitoring and versioning?',
        topicId: 'model-serving',
        phaseId: 'mlops-production',
        skipIfYes: ['model-serving', 'model-registry', 'feature-pipelines'],
        estimatedHoursSaved: 150
      },
      {
        id: 'knows-kubernetes',
        question: 'Have you used Kubernetes for container orchestration in production?',
        topicId: 'scaling',
        phaseId: 'mlops-production',
        skipIfYes: ['scaling'],
        estimatedHoursSaved: 80
      }
    ],
    softSkills: [
      'System Thinking',
      'Cross-functional Collaboration',
      'Technical Writing',
      'Performance Optimization',
      'Security & Privacy Awareness'
    ],
    relatedTools: ['codePlayground', 'codeExplainer', 'documentSummarizer'],
    meta: {
      keywords: 'ml engineer roadmap 2026, machine learning engineer, mlops career, production ml',
      ogImage: '/images/roadmaps/ml-engineer-roadmap.png'
    }
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst Roadmap 2026',
    description: 'Master data analysis from Excel to business intelligence. Learn to clean, analyze, visualize data, and communicate insights that drive decisions.',
    shortDesc: 'Excel to BI to insights',
    icon: '📈',
    category: 'Career',
    image: '/images/roadmaps/data-analyst-roadmap.png',
    imageAlt: 'Comprehensive Data Analyst Roadmap from Foundations to Business Impact',
    estimatedHours: 600,
    difficulty: 'Beginner',
    phases: [
      {
        title: 'Phase 1: Foundations',
        icon: '📐',
        phaseId: 'foundations',
        topics: [
          { id: 'basic-math', name: 'Mathematics & Statistics — Basic Math, Descriptive Stats, Probability Basics' },
          { id: 'excel-fundamentals', name: 'Excel Fundamentals — Formulas, Data Formatting, Charts, Pivot Tables' },
          { id: 'excel-advanced', name: 'Excel Advanced — VLOOKUP/XLOOKUP, Power Query, What-If Analysis' }
        ],
        resources: []
      },
      {
        title: 'Phase 2: Data & Tools',
        icon: '🛠️',
        phaseId: 'data-tools',
        topics: [
          { id: 'sql-fundamentals', name: 'SQL Fundamentals — SELECT, WHERE, JOIN, GROUP BY, Aggregations' },
          { id: 'sql-advanced', name: 'SQL Advanced — Window Functions, CTEs, Subqueries, Performance Tips' },
          { id: 'python-analysts', name: 'Python for Analysts — Pandas, NumPy, Jupyter Notebook' }
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: Data Handling & Preparation',
        icon: '🧹',
        phaseId: 'data-handling',
        topics: [
          { id: 'data-collection', name: 'Data Collection — APIs, CSV, Web Scraping' },
          { id: 'data-cleaning', name: 'Data Cleaning — Missing Values, Duplicates, Outliers' },
          { id: 'data-transformation', name: 'Data Transformation — Types, Formats, Merge & Append' },
          { id: 'data-quality', name: 'Data Quality Checks' }
        ],
        resources: []
      },
      {
        title: 'Phase 4: Exploratory Data Analysis (EDA)',
        icon: '🔍',
        phaseId: 'eda',
        topics: [
          { id: 'univariate', name: 'Univariate Analysis — Distributions, Central Tendency' },
          { id: 'bivariate', name: 'Bivariate Analysis — Correlation, Cross-tabs' },
          { id: 'trend-analysis', name: 'Trend Analysis — Time Series Patterns' },
          { id: 'outlier-detection', name: 'Outlier Detection — Statistical Methods' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: Data Visualization',
        icon: '📊',
        phaseId: 'visualization',
        topics: [
          { id: 'viz-principles', name: 'Visualization Principles — Choosing the Right Chart' },
          { id: 'dashboards', name: 'Dashboards & Reports — Interactive Elements' },
          { id: 'storytelling', name: 'Storytelling with Data — Narrative Structure' },
          { id: 'viz-tools', name: 'Tools: Excel, Power BI, Tableau' }
        ],
        resources: []
      },
      {
        title: 'Phase 6: Business Analysis & Insights',
        icon: '💼',
        phaseId: 'business-analysis',
        topics: [
          { id: 'kpis', name: 'KPIs & Metrics — Defining Success' },
          { id: 'bi-basics', name: 'Business Intelligence Basics — OLAP, Data Warehousing' },
          { id: 'problem-framing', name: 'Problem Framing — Root Cause Analysis' },
          { id: 'ab-testing-basics', name: 'A/B Testing Basics — Experiment Design' },
          { id: 'data-driven', name: 'Data-Driven Decision Making' }
        ],
        resources: []
      },
      {
        title: 'Phase 7: Advanced Topics',
        icon: '🚀',
        phaseId: 'advanced',
        topics: [
          { id: 'data-modelling', name: 'Data Modelling — Star Schema, Fact/Dimension Tables' },
          { id: 'domain-knowledge', name: 'Domain Knowledge — Finance, Sales, Marketing, Healthcare' },
          { id: 'reporting', name: 'Reporting & Dashboards — Professional Delivery' },
          { id: 'communication', name: 'Communication — Stakeholder Management, Presenting Insights' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'basic-math', to: 'univariate', label: 'required for' },
      { from: 'excel-fundamentals', to: 'excel-advanced', label: 'required for' },
      { from: 'excel-advanced', to: 'viz-tools', label: 'required for' },
      { from: 'sql-fundamentals', to: 'sql-advanced', label: 'required for' },
      { from: 'sql-fundamentals', to: 'data-collection', label: 'required for' },
      { from: 'python-analysts', to: 'data-cleaning', label: 'required for' },
      { from: 'data-cleaning', to: 'data-transformation', label: 'required for' },
      { from: 'data-transformation', to: 'univariate', label: 'required for' },
      { from: 'univariate', to: 'bivariate', label: 'required for' },
      { from: 'bivariate', to: 'trend-analysis', label: 'required for' },
      { from: 'trend-analysis', to: 'outlier-detection', label: 'required for' },
      { from: 'viz-principles', to: 'dashboards', label: 'required for' },
      { from: 'dashboards', to: 'storytelling', label: 'required for' },
      { from: 'storytelling', to: 'reporting', label: 'required for' },
      { from: 'kpis', to: 'data-driven', label: 'required for' },
      { from: 'problem-framing', to: 'ab-testing-basics', label: 'required for' },
      { from: 'data-modelling', to: 'bi-basics', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-excel',
        question: 'Can you create pivot tables, VLOOKUP, and basic charts in Excel?',
        topicId: 'excel-fundamentals',
        phaseId: 'foundations',
        skipIfYes: ['excel-fundamentals', 'excel-advanced'],
        estimatedHoursSaved: 60
      },
      {
        id: 'knows-sql',
        question: 'Can you write JOIN, GROUP BY, and aggregate functions in SQL?',
        topicId: 'sql-fundamentals',
        phaseId: 'data-tools',
        skipIfYes: ['sql-fundamentals'],
        estimatedHoursSaved: 50
      },
      {
        id: 'knows-viz',
        question: 'Have you created dashboards in Power BI, Tableau, or similar tools?',
        topicId: 'viz-tools',
        phaseId: 'visualization',
        skipIfYes: ['viz-principles', 'viz-tools', 'dashboards'],
        estimatedHoursSaved: 80
      }
    ],
    softSkills: [
      'Curiosity & Problem Solving',
      'Attention to Detail',
      'Business Acumen',
      'Data Ethics',
      'Growth Mindset',
      'Ownership'
    ],
    relatedTools: ['codePlayground', 'documentSummarizer'],
    meta: {
      keywords: 'data analyst roadmap 2026, excel to power bi, learn data analysis, sql for analysts',
      ogImage: '/images/roadmaps/data-analyst-roadmap.png'
    }
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer Roadmap 2026',
    description: 'End-to-end path for DevOps: Linux, CI/CD, containers, Kubernetes, cloud, monitoring, and infrastructure automation.',
    shortDesc: 'Code, build, deploy, automate',
    icon: '⚙️',
    category: 'Career',
    image: '/images/roadmaps/devops-engineer-roadmap.png',
    imageAlt: 'Comprehensive DevOps Engineer Roadmap from OS Basics to Cloud Architecture',
    estimatedHours: 1000,
    difficulty: 'Advanced',
    phases: [
      {
        title: 'Phase 1: Foundations',
        icon: '📐',
        phaseId: 'foundations',
        topics: [
          { id: 'os-networking', name: 'OS & Networking — Linux Fundamentals, Shell Scripting, TCP/IP, DNS, HTTP/HTTPS' },
          { id: 'cs-basics', name: 'Computer Science Basics — Data Structures, Algorithms, How the Internet Works' }
        ],
        resources: []
      },
      {
        title: 'Phase 2: System Administration',
        icon: '🖥️',
        phaseId: 'sysadmin',
        topics: [
          { id: 'linux-admin', name: 'Linux Administration — User Management, Process Management, Logs' },
          { id: 'package-mgmt', name: 'Package Management — apt, yum, brew' },
          { id: 'monitoring-basics', name: 'Monitoring Basics — top, htop, vmstat, iostat' }
        ],
        resources: []
      },
      {
        title: 'Phase 3: Development & Scripting',
        icon: '💻',
        phaseId: 'scripting',
        topics: [
          { id: 'python-bash', name: 'Python / Bash Scripting — Automation, Regex' },
          { id: 'git-essentials', name: 'Git Essentials — Branching, Merging, Pull Requests, Code Review' }
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 4: Version Control & CI Basics',
        icon: '🔀',
        phaseId: 'vcs-ci',
        topics: [
          { id: 'git-advanced', name: 'Git Advanced — Rebase, Cherry-pick, Stash, Submodules' },
          { id: 'ci-basics', name: 'CI/CD Basics — Jenkins, GitHub Actions, GitLab CI' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: Infrastructure as Code',
        icon: '🏗️',
        phaseId: 'iac',
        topics: [
          { id: 'iac-tools', name: 'IaC Tools — Terraform, Ansible, Packer' },
          { id: 'iac-concepts', name: 'Key Concepts — Idempotency, State Management, Modules' }
        ],
        resources: []
      },
      {
        title: 'Phase 6: Containers & Virtualization',
        icon: '🐳',
        phaseId: 'containers',
        topics: [
          { id: 'docker', name: 'Docker — Dockerfile, Compose, Multi-stage Builds' },
          { id: 'container-concepts', name: 'Container Concepts — Images, Volumes, Networks, Registry' }
        ],
        resources: []
      },
      {
        title: 'Phase 7: Orchestration',
        icon: '☸️',
        phaseId: 'orchestration',
        topics: [
          { id: 'kubernetes', name: 'Kubernetes — Architecture, Pods, Deployments, Services' },
          { id: 'helm', name: 'Helm — Charts, Package Management' },
          { id: 'service-mesh', name: 'Service Mesh — Istio Basics' }
        ],
        resources: []
      },
      {
        title: 'Phase 8: Cloud Platforms',
        icon: '☁️',
        phaseId: 'cloud',
        topics: [
          { id: 'aws-core', name: 'AWS Core — EC2, S3, IAM, VPC, RDS, Route53' },
          { id: 'azure-gcp', name: 'Azure / GCP Basics — Core Services, IAM, Networking' }
        ],
        resources: []
      },
      {
        title: 'Phase 9: Monitoring & Security',
        icon: '🔒',
        phaseId: 'monitoring-security',
        topics: [
          { id: 'monitoring-tools', name: 'Monitoring — Prometheus, Grafana, Alertmanager' },
          { id: 'logging', name: 'Logging — ELK Stack, Loki' },
          { id: 'security', name: 'Security — IAM Best Practices, Secrets Management, Container Security' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'os-networking', to: 'linux-admin', label: 'required for' },
      { from: 'linux-admin', to: 'python-bash', label: 'required for' },
      { from: 'cs-basics', to: 'git-essentials', label: 'required for' },
      { from: 'git-essentials', to: 'git-advanced', label: 'required for' },
      { from: 'git-advanced', to: 'ci-basics', label: 'required for' },
      { from: 'python-bash', to: 'iac-tools', label: 'required for' },
      { from: 'ci-basics', to: 'iac-concepts', label: 'required for' },
      { from: 'docker', to: 'kubernetes', label: 'required for' },
      { from: 'container-concepts', to: 'helm', label: 'required for' },
      { from: 'kubernetes', to: 'service-mesh', label: 'required for' },
      { from: 'kubernetes', to: 'aws-core', label: 'required for' },
      { from: 'aws-core', to: 'azure-gcp', label: 'helps with' },
      { from: 'monitoring-basics', to: 'monitoring-tools', label: 'required for' },
      { from: 'monitoring-tools', to: 'logging', label: 'required for' },
      { from: 'security', to: 'container-concepts', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-linux',
        question: 'Are you comfortable with Linux command line, file permissions, and process management?',
        topicId: 'linux-admin',
        phaseId: 'sysadmin',
        skipIfYes: ['os-networking', 'linux-admin', 'monitoring-basics'],
        estimatedHoursSaved: 80
      },
      {
        id: 'knows-git',
        question: 'Can you handle merge conflicts, rebase, and CI/CD pipelines with Git?',
        topicId: 'git-advanced',
        phaseId: 'vcs-ci',
        skipIfYes: ['git-essentials', 'git-advanced', 'ci-basics'],
        estimatedHoursSaved: 60
      },
      {
        id: 'knows-docker',
        question: 'Have you built and deployed multi-container applications with Docker?',
        topicId: 'docker',
        phaseId: 'containers',
        skipIfYes: ['docker', 'container-concepts'],
        estimatedHoursSaved: 50
      },
      {
        id: 'knows-k8s',
        question: 'Have you deployed and managed applications on Kubernetes?',
        topicId: 'kubernetes',
        phaseId: 'orchestration',
        skipIfYes: ['kubernetes', 'helm'],
        estimatedHoursSaved: 100
      }
    ],
    softSkills: [
      'Automate Everything',
      'Collaborate & Communicate',
      'Measure & Improve',
      'Think Reliability & Security',
      'Continuous Learning'
    ],
    relatedTools: ['codePlayground', 'codeExplainer'],
    meta: {
      keywords: 'devops engineer roadmap 2026, learn devops, kubernetes, docker, terraform, aws',
      ogImage: '/images/roadmaps/devops-engineer-roadmap.png'
    }
  },
  {
    slug: 'python-developer',
    title: 'Python Developer Roadmap 2026',
    description: 'Complete Python journey from basics to professional development. Covers core Python, web frameworks, databases, deployment, and best practices.',
    shortDesc: 'Code, build, deploy with Python',
    icon: '🐍',
    category: 'Career',
    image: '/images/roadmaps/python-developer-roadmap.png',
    imageAlt: 'Comprehensive Python Developer Roadmap from Basics to Professional Deployment',
    estimatedHours: 700,
    difficulty: 'Beginner',
    phases: [
      {
        title: 'Phase 1: Foundations',
        icon: '📚',
        phaseId: 'foundations',
        topics: [
          { id: 'python-basics', name: 'Python Basics — Syntax, Variables, Data Types, Operators' },
          { id: 'control-flow', name: 'Control Flow — Conditionals, Loops, Functions' },
          { id: 'io-scope', name: 'Input/Output, Type Conversion, Scope & Namespace' }
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 2: Core Python',
        icon: '🎯',
        phaseId: 'core-python',
        topics: [
          { id: 'data-structures', name: 'Strings, Lists, Tuples, Sets, Dictionaries' },
          { id: 'comprehensions', name: 'List Comprehensions, Enumerate, Zip, Map, Filter, Lambda' },
          { id: 'modules-stdlib', name: 'Modules & Packages, Standard Library (os, sys, datetime, random, collections)' }
        ],
        resources: []
      },
      {
        title: 'Phase 3: OOP in Python',
        icon: '🏗️',
        phaseId: 'oop',
        topics: [
          { id: 'classes-objects', name: 'Classes & Objects, Constructor (__init__), Inheritance' },
          { id: 'polymorphism', name: 'Polymorphism, Encapsulation, Abstraction' },
          { id: 'magic-methods', name: 'Magic Methods, Properties & Decorators' }
        ],
        resources: []
      },
      {
        title: 'Phase 4: Advanced Python',
        icon: '⚡',
        phaseId: 'advanced-python',
        topics: [
          { id: 'decorators-generators', name: 'Decorators, Generators, Iterators, Context Managers' },
          { id: 'exception-handling', name: 'Exception Handling, File Handling, Regular Expressions' },
          { id: 'typing', name: 'Typing (Type Hints), Advanced Modules & Packages' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: Data Structures & Algorithms',
        icon: '🧮',
        phaseId: 'dsa',
        topics: [
          { id: 'ds-arrays', name: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs' },
          { id: 'algorithms', name: 'Searching & Sorting Algorithms, Time & Space Complexity' },
          { id: 'practice', name: 'Practice: LeetCode, HackerRank, Codeforces' }
        ],
        resources: [
          { name: 'ZeroAPI MCQ Generator', url: '/#tools' }
        ]
      },
      {
        title: 'Phase 6: Web Development with Python',
        icon: '🌐',
        phaseId: 'web-dev',
        topics: [
          { id: 'web-fundamentals', name: 'Web Fundamentals — HTTP, HTML, CSS, JavaScript Basics' },
          { id: 'django', name: 'Django Framework — MVC, ORM, REST API, Authentication' },
          { id: 'api-dev', name: 'APIs Development — DRF, Serializers, ViewSets, Postman' }
        ],
        resources: []
      },
      {
        title: 'Phase 7: Databases & Deployment',
        icon: '🗄️',
        phaseId: 'databases-deployment',
        topics: [
          { id: 'sql-basics', name: 'SQL Basics — SQLite, PostgreSQL, MySQL' },
          { id: 'crud-joins', name: 'CRUD, Joins, Relationships, Migrations, Indexing' },
          { id: 'deployment', name: 'Deployment — Docker, Nginx, Gunicorn, AWS/Heroku/Render' }
        ],
        resources: []
      },
      {
        title: 'Phase 8: Professional Development',
        icon: '⭐',
        phaseId: 'professional',
        topics: [
          { id: 'version-control', name: 'Version Control — Git, GitHub, GitLab' },
          { id: 'code-quality', name: 'Code Quality — PEP 8, Linters, Formatters, Type Hints' },
          { id: 'testing', name: 'Testing — Unit Testing, pytest, Code Coverage' },
          { id: 'soft-skills', name: 'Soft Skills — Problem Solving, Communication, Team Collaboration' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'python-basics', to: 'control-flow', label: 'required for' },
      { from: 'control-flow', to: 'data-structures', label: 'required for' },
      { from: 'data-structures', to: 'comprehensions', label: 'required for' },
      { from: 'comprehensions', to: 'modules-stdlib', label: 'required for' },
      { from: 'modules-stdlib', to: 'classes-objects', label: 'required for' },
      { from: 'classes-objects', to: 'polymorphism', label: 'required for' },
      { from: 'polymorphism', to: 'magic-methods', label: 'required for' },
      { from: 'magic-methods', to: 'decorators-generators', label: 'required for' },
      { from: 'decorators-generators', to: 'exception-handling', label: 'required for' },
      { from: 'exception-handling', to: 'typing', label: 'required for' },
      { from: 'data-structures', to: 'ds-arrays', label: 'required for' },
      { from: 'ds-arrays', to: 'algorithms', label: 'required for' },
      { from: 'algorithms', to: 'practice', label: 'required for' },
      { from: 'web-fundamentals', to: 'django', label: 'required for' },
      { from: 'django', to: 'api-dev', label: 'required for' },
      { from: 'sql-basics', to: 'crud-joins', label: 'required for' },
      { from: 'crud-joins', to: 'deployment', label: 'required for' },
      { from: 'version-control', to: 'code-quality', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-python-basics',
        question: 'Have you written Python scripts with functions, loops, and basic data structures?',
        topicId: 'python-basics',
        phaseId: 'foundations',
        skipIfYes: ['python-basics', 'control-flow', 'io-scope'],
        estimatedHoursSaved: 60
      },
      {
        id: 'knows-oop',
        question: 'Have you built classes with inheritance and used decorators in Python?',
        topicId: 'classes-objects',
        phaseId: 'oop',
        skipIfYes: ['classes-objects', 'polymorphism', 'magic-methods'],
        estimatedHoursSaved: 50
      },
      {
        id: 'knows-web-dev',
        question: 'Have you built a web application with Django or Flask?',
        topicId: 'django',
        phaseId: 'web-dev',
        skipIfYes: ['web-fundamentals', 'django', 'api-dev'],
        estimatedHoursSaved: 100
      },
      {
        id: 'knows-databases',
        question: 'Have you designed database schemas and written complex SQL queries?',
        topicId: 'sql-basics',
        phaseId: 'databases-deployment',
        skipIfYes: ['sql-basics', 'crud-joins'],
        estimatedHoursSaved: 60
      }
    ],
    softSkills: [
      'Problem Solving',
      'Communication',
      'Team Collaboration',
      'Technical Writing',
      'Time Management',
      'Continuous Learning'
    ],
    relatedTools: ['codePlayground', 'mcqGenerator', 'codeExplainer'],
    meta: {
      keywords: 'python developer roadmap 2026, learn python, django, web development, python career',
      ogImage: '/images/roadmaps/python-developer-roadmap.png'
    }
  },
  {
    slug: 'genai-developer',
    title: 'Generative AI Engineer Roadmap 2026',
    description: 'Master the Gen AI stack: LLMs, fine-tuning, RAG, agents, and production deployment. From transformer theory to building real-world AI applications.',
    shortDesc: 'Build with LLMs, RAG, and agents',
    icon: '✨',
    category: 'Career',
    image: '/images/roadmaps/genai-developer.png',
    imageAlt: 'Comprehensive Generative AI Engineer Roadmap from Foundations to Production Deployment',
    estimatedHours: 900,
    difficulty: 'Advanced',
    phases: [
      {
        title: 'Phase 1: Foundations',
        icon: '📐',
        phaseId: 'foundations',
        topics: [
          { id: 'math-foundations', name: 'Mathematics — Linear Algebra, Probability, Calculus, Information Theory' },
          { id: 'programming', name: 'Programming — Python Fundamentals, Data Structures, Algorithms, Git & GitHub' },
          { id: 'core-cs', name: 'Core CS — Operating Systems, Computer Networks' }
        ],
        resources: []
      },
      {
        title: 'Phase 2: Python & Data Skills',
        icon: '🐍',
        phaseId: 'python-data',
        topics: [
          { id: 'advanced-python', name: 'Advanced Python — OOP, Decorators, Generators, Virtual Environments' },
          { id: 'data-handling', name: 'Data Handling — NumPy, Pandas, Data Cleaning, EDA, SQL Basics' },
          { id: 'useful-libs', name: 'Useful Libraries — typing, dataclasses, pathlib' }
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: Machine Learning Foundation',
        icon: '🤖',
        phaseId: 'ml-foundation',
        topics: [
          { id: 'supervised-unsupervised', name: 'Supervised & Unsupervised Learning' },
          { id: 'feature-eng', name: 'Feature Engineering, Model Evaluation, Cross Validation' },
          { id: 'sklearn', name: 'Scikit-learn Workflow' }
        ],
        resources: []
      },
      {
        title: 'Phase 4: Deep Learning Fundamentals',
        icon: '🧠',
        phaseId: 'dl-fundamentals',
        topics: [
          { id: 'neural-networks', name: 'Neural Networks (DNN), CNNs, RNNs / LSTMs' },
          { id: 'backprop-optimization', name: 'Backpropagation, Optimization (Adam, SGD), Regularization' },
          { id: 'dl-frameworks', name: 'Frameworks: PyTorch / TensorFlow' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: LLM Fundamentals',
        icon: '💬',
        phaseId: 'llm-fundamentals',
        topics: [
          { id: 'what-is-llm', name: 'What is an LLM?, Tokenization, Embeddings' },
          { id: 'attention', name: 'Attention Mechanism, Transformers Architecture' },
          { id: 'positional-encoding', name: 'Positional Encoding, Pre-training vs Fine-tuning, Inference' }
        ],
        resources: []
      },
      {
        title: 'Phase 6: Prompt Engineering',
        icon: '🎯',
        phaseId: 'prompt-engineering',
        topics: [
          { id: 'prompting-basics', name: 'Prompting Basics, Zero-shot, One-shot, Few-shot' },
          { id: 'cot', name: 'Chain-of-Thought (CoT), Role Prompting, Prompt Templates' },
          { id: 'prompt-evaluation', name: 'Prompt Evaluation, Advanced Techniques (Self-consistency, ReAct)' }
        ],
        resources: []
      },
      {
        title: 'Phase 7: RAG (Retrieval Augmented Generation)',
        icon: '🔍',
        phaseId: 'rag',
        topics: [
          { id: 'why-rag', name: 'Why RAG?, Embeddings & Vector Representations' },
          { id: 'vector-dbs', name: 'Vector Databases (FAISS, Chroma, Pinecone, Weaviate)' },
          { id: 'similarity-search', name: 'Similarity Search, Building RAG Pipeline, Reranking' },
          { id: 'rag-evaluation', name: 'Evaluation (RAGAS, TruLens)' }
        ],
        resources: []
      },
      {
        title: 'Phase 8: Fine-Tuning & Adaptation',
        icon: '⚙️',
        phaseId: 'fine-tuning',
        topics: [
          { id: 'full-finetuning', name: 'Full Fine-tuning, Parameter-Efficient Fine-tuning (PEFT) — LoRA, QLoRA' },
          { id: 'adapters', name: 'Adapters, Instruction Tuning, Domain Adaptation' },
          { id: 'data-prep', name: 'Data Preparation, Evaluation' }
        ],
        resources: []
      },
      {
        title: 'Phase 9: Agents & Tool Use',
        icon: '🤖',
        phaseId: 'agents',
        topics: [
          { id: 'what-are-agents', name: 'What are AI Agents?, ReAct Framework' },
          { id: 'tool-use', name: 'Tool Use / Function Calling, Planning & Reasoning' },
          { id: 'memory-agents', name: 'Memory in Agents, Multi-step Workflows, AutoGPT / BabyAGI Concepts' }
        ],
        resources: []
      },
      {
        title: 'Phase 10: Generative AI Applications',
        icon: '🚀',
        phaseId: 'genai-apps',
        topics: [
          { id: 'text-gen', name: 'Text Generation, Summarization, Question Answering, Code Generation' },
          { id: 'image-gen', name: 'Image Generation (Diffusion Models Basics)' },
          { id: 'multimodal', name: 'Multimodal Models (Text + Image + Audio)' }
        ],
        resources: []
      },
      {
        title: 'Phase 11: Deployment & MLOps for LLMs',
        icon: '🏭',
        phaseId: 'deployment-mlops',
        topics: [
          { id: 'model-serving', name: 'Model Serving (APIs), FastAPI / Flask' },
          { id: 'vllm-tgi', name: 'vLLM / TGI / Hugging Face, LangChain Deploy' },
          { id: 'monitoring-llm', name: 'Monitoring & Logging, Tracing (LangSmith, OpenTelemetry)' },
          { id: 'cost-optimization', name: 'Cost Optimization' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'math-foundations', to: 'neural-networks', label: 'required for' },
      { from: 'programming', to: 'advanced-python', label: 'required for' },
      { from: 'advanced-python', to: 'data-handling', label: 'required for' },
      { from: 'data-handling', to: 'supervised-unsupervised', label: 'required for' },
      { from: 'supervised-unsupervised', to: 'neural-networks', label: 'required for' },
      { from: 'neural-networks', to: 'backprop-optimization', label: 'required for' },
      { from: 'backprop-optimization', to: 'dl-frameworks', label: 'required for' },
      { from: 'dl-frameworks', to: 'what-is-llm', label: 'required for' },
      { from: 'what-is-llm', to: 'attention', label: 'required for' },
      { from: 'attention', to: 'positional-encoding', label: 'required for' },
      { from: 'positional-encoding', to: 'prompting-basics', label: 'required for' },
      { from: 'prompting-basics', to: 'cot', label: 'required for' },
      { from: 'cot', to: 'why-rag', label: 'required for' },
      { from: 'why-rag', to: 'vector-dbs', label: 'required for' },
      { from: 'vector-dbs', to: 'similarity-search', label: 'required for' },
      { from: 'similarity-search', to: 'full-finetuning', label: 'required for' },
      { from: 'full-finetuning', to: 'adapters', label: 'required for' },
      { from: 'adapters', to: 'what-are-agents', label: 'required for' },
      { from: 'what-are-agents', to: 'tool-use', label: 'required for' },
      { from: 'tool-use', to: 'text-gen', label: 'required for' },
      { from: 'text-gen', to: 'image-gen', label: 'required for' },
      { from: 'image-gen', to: 'multimodal', label: 'required for' },
      { from: 'model-serving', to: 'vllm-tgi', label: 'required for' },
      { from: 'vllm-tgi', to: 'monitoring-llm', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-python',
        question: 'Have you built Python applications with OOP and used virtual environments?',
        topicId: 'advanced-python',
        phaseId: 'python-data',
        skipIfYes: ['programming', 'advanced-python', 'useful-libs'],
        estimatedHoursSaved: 80
      },
      {
        id: 'knows-ml',
        question: 'Have you trained and evaluated ML models using scikit-learn?',
        topicId: 'supervised-unsupervised',
        phaseId: 'ml-foundation',
        skipIfYes: ['supervised-unsupervised', 'feature-eng', 'sklearn'],
        estimatedHoursSaved: 100
      },
      {
        id: 'knows-deep-learning',
        question: 'Have you built and trained neural networks with PyTorch or TensorFlow?',
        topicId: 'neural-networks',
        phaseId: 'dl-fundamentals',
        skipIfYes: ['neural-networks', 'backprop-optimization', 'dl-frameworks'],
        estimatedHoursSaved: 120
      },
      {
        id: 'knows-llms',
        question: 'Have you worked with LLM APIs (OpenAI, Claude, etc.) and built RAG systems?',
        topicId: 'why-rag',
        phaseId: 'rag',
        skipIfYes: ['what-is-llm', 'attention', 'positional-encoding', 'prompting-basics', 'cot', 'why-rag', 'vector-dbs'],
        estimatedHoursSaved: 150
      }
    ],
    softSkills: [
      'Stay Curious',
      'Experiment Consistently',
      'Build in Public',
      'Learn from Community',
      'Focus on Real Problems',
      'Iterate & Improve'
    ],
    relatedTools: ['codePlayground', 'codeExplainer', 'documentSummarizer', 'askAuthor'],
    meta: {
      keywords: 'generative ai engineer roadmap 2026, gen ai, llm engineer, rag, fine-tuning, ai applications',
      ogImage: '/images/roadmaps/genai-developer.png'
    }
  },
  {
    slug: 'agenticai-developer',
    title: 'Agentic AI Developer Roadmap 2026',
    description: 'Build autonomous AI agents that plan, reason, and act. Covers agent architectures, memory, tool use, multi-agent systems, and production orchestration.',
    shortDesc: 'Build autonomous AI agents',
    icon: '🤖',
    category: 'Career',
    image: '/images/roadmaps/agenticai-developer.png',
    imageAlt: 'Comprehensive Agentic AI Developer Roadmap from Foundations to Scaling Agents',
    estimatedHours: 850,
    difficulty: 'Advanced',
    phases: [
      {
        title: 'Phase 1: Foundations',
        icon: '📐',
        phaseId: 'foundations',
        topics: [
          { id: 'math-cs', name: 'Math & CS Basics — Linear Algebra, Probability, Discrete Math, Algorithms' },
          { id: 'programming', name: 'Programming Essentials — Python Advanced, Data Structures, OOP, Async, Decorators' },
          { id: 'typing-git', name: 'Typing, Pydantic, Git & GitHub' }
        ],
        resources: []
      },
      {
        title: 'Phase 2: Python & Data Engineering Basics',
        icon: '🐍',
        phaseId: 'python-data-eng',
        topics: [
          { id: 'python-ai', name: 'Python for AI — NumPy, Pandas, Polars, APIs & JSON, AsyncIO' },
          { id: 'data-eng-basics', name: 'Data Engineering Basics — ETL, Data Cleaning, SQL Advanced, Vector Databases Intro' }
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: LLM & Gen AI Fundamentals',
        icon: '💬',
        phaseId: 'llm-genai',
        topics: [
          { id: 'how-llms-work', name: 'How LLMs Work?, Tokenization, Embeddings, Attention (High-level)' },
          { id: 'finetuning-vs-prompting', name: 'Fine-tuning vs Prompting, Model Evaluation Basics' },
          { id: 'openai-apis', name: 'OpenAI / Claude / Gemini APIs' }
        ],
        resources: []
      },
      {
        title: 'Phase 4: Prompt Engineering Mastery',
        icon: '🎯',
        phaseId: 'prompt-mastery',
        topics: [
          { id: 'prompt-design', name: 'Prompt Design Principles, Zero-shot, Few-shot, CoT, ReAct' },
          { id: 'structured-output', name: 'Structured Output, Prompt Templates, Guardrails in Prompts' },
          { id: 'prompt-eval', name: 'Prompt Evaluation & Optimization' }
        ],
        resources: []
      },
      {
        title: 'Phase 5: Agentic AI Core Concepts',
        icon: '🤖',
        phaseId: 'agentic-core',
        topics: [
          { id: 'what-is-agent', name: 'What is an AI Agent?, Agent Types & Architectures' },
          { id: 'agent-components', name: 'Autonomy, Memory, Tools, Planning, Reasoning, Reflection' },
          { id: 'multi-agent-intro', name: 'Multi-agent Systems, Human-in-the-Loop' }
        ],
        resources: []
      },
      {
        title: 'Phase 6: Tools & Function Calling',
        icon: '🔧',
        phaseId: 'tools-function',
        topics: [
          { id: 'function-calling', name: 'Function Calling / Tool Calling, JSON Schema' },
          { id: 'api-integrations', name: 'API Integrations, Third-party Tools, Code Interpreter' },
          { id: 'sandboxes', name: 'Sandboxes & Safety' }
        ],
        resources: []
      },
      {
        title: 'Phase 7: Memory Systems',
        icon: '🧠',
        phaseId: 'memory',
        topics: [
          { id: 'memory-types', name: 'Types of Memory — Short-term, Long-term, Episodic, Semantic' },
          { id: 'conversation-memory', name: 'Conversation Memory, Vector Store Memory, RAG + Memory' },
          { id: 'memory-mgmt', name: 'Memory Management Strategies' }
        ],
        resources: []
      },
      {
        title: 'Phase 8: Knowledge & RAG',
        icon: '🔍',
        phaseId: 'knowledge-rag',
        topics: [
          { id: 'rag-architecture', name: 'RAG Architecture, Chunking Strategies, Embeddings Models' },
          { id: 'vector-dbs', name: 'Vector DBs (Pinecone, Weaviate, Qdrant, Chroma), Hybrid Search, Re-ranking' }
        ],
        resources: []
      },
      {
        title: 'Phase 9: Planning & Reasoning',
        icon: '📋',
        phaseId: 'planning',
        topics: [
          { id: 'task-decomposition', name: 'Task Decomposition, Planning Algorithms (ReAct, Plan-and-Execute)' },
          { id: 'tree-of-thoughts', name: 'Tree of Thoughts, Self-Reflection, Critic / Evaluator Models' }
        ],
        resources: []
      },
      {
        title: 'Phase 10: Agent Frameworks',
        icon: '🏗️',
        phaseId: 'frameworks',
        topics: [
          { id: 'langchain', name: 'LangChain, LlamaIndex, CrewAI, AutoGen, Semantic Kernel, LangGraph, Haystack Agents' }
        ],
        resources: []
      },
      {
        title: 'Phase 11: Multi-Agent Systems',
        icon: '👥',
        phaseId: 'multi-agent',
        topics: [
          { id: 'agent-communication', name: 'Agent Communication Patterns, Supervisor / Worker' },
          { id: 'debate-collaboration', name: 'Debate / Collaboration, Swarm / Marketplace, Coordination & Orchestration' }
        ],
        resources: []
      },
      {
        title: 'Phase 12: Evaluation & Guardrails',
        icon: '🛡️',
        phaseId: 'evaluation',
        topics: [
          { id: 'agent-eval', name: 'Agent Evaluation Metrics, Hallucination Detection' },
          { id: 'safety-alignment', name: 'Safety & Alignment, Content Moderation, PII Redaction' },
          { id: 'guardrails', name: 'Guardrails with RAGs / Guardrails AI' }
        ],
        resources: []
      },
      {
        title: 'Phase 13: Build, Deploy & Operate',
        icon: '🚀',
        phaseId: 'deploy-operate',
        topics: [
          { id: 'building-agents', name: 'Building Agents — Create, Add Tools, Memory, RAG, Planning, Guardrails' },
          { id: 'deployment-api', name: 'Deployment — API with FastAPI, Dockerize, Cloud Deploy (AWS/GCP/Azure)' },
          { id: 'monitoring-observability', name: 'Monitoring & Observability, Security & Compliance, Scaling Agents' }
        ],
        resources: []
      }
    ],
    dependencies: [
      { from: 'math-cs', to: 'python-ai', label: 'required for' },
      { from: 'programming', to: 'python-ai', label: 'required for' },
      { from: 'python-ai', to: 'data-eng-basics', label: 'required for' },
      { from: 'data-eng-basics', to: 'how-llms-work', label: 'required for' },
      { from: 'how-llms-work', to: 'finetuning-vs-prompting', label: 'required for' },
      { from: 'finetuning-vs-prompting', to: 'openai-apis', label: 'required for' },
      { from: 'openai-apis', to: 'prompt-design', label: 'required for' },
      { from: 'prompt-design', to: 'structured-output', label: 'required for' },
      { from: 'structured-output', to: 'what-is-agent', label: 'required for' },
      { from: 'what-is-agent', to: 'agent-components', label: 'required for' },
      { from: 'agent-components', to: 'function-calling', label: 'required for' },
      { from: 'function-calling', to: 'api-integrations', label: 'required for' },
      { from: 'api-integrations', to: 'memory-types', label: 'required for' },
      { from: 'memory-types', to: 'conversation-memory', label: 'required for' },
      { from: 'conversation-memory', to: 'rag-architecture', label: 'required for' },
      { from: 'rag-architecture', to: 'vector-dbs', label: 'required for' },
      { from: 'vector-dbs', to: 'task-decomposition', label: 'required for' },
      { from: 'task-decomposition', to: 'tree-of-thoughts', label: 'required for' },
      { from: 'tree-of-thoughts', to: 'langchain', label: 'required for' },
      { from: 'langchain', to: 'agent-communication', label: 'required for' },
      { from: 'agent-communication', to: 'debate-collaboration', label: 'required for' },
      { from: 'debate-collaboration', to: 'agent-eval', label: 'required for' },
      { from: 'agent-eval', to: 'safety-alignment', label: 'required for' },
      { from: 'safety-alignment', to: 'building-agents', label: 'required for' },
      { from: 'building-agents', to: 'deployment-api', label: 'required for' },
      { from: 'deployment-api', to: 'monitoring-observability', label: 'required for' }
    ],
    assessment: [
      {
        id: 'knows-python-advanced',
        question: 'Have you built async Python applications with APIs and data processing?',
        topicId: 'python-ai',
        phaseId: 'python-data-eng',
        skipIfYes: ['programming', 'typing-git', 'python-ai'],
        estimatedHoursSaved: 80
      },
      {
        id: 'knows-llms',
        question: 'Have you integrated LLM APIs and built prompt-based applications?',
        topicId: 'openai-apis',
        phaseId: 'llm-genai',
        skipIfYes: ['how-llms-work', 'finetuning-vs-prompting', 'openai-apis', 'prompt-design', 'structured-output'],
        estimatedHoursSaved: 120
      },
      {
        id: 'knows-rag',
        question: 'Have you built RAG systems with vector databases and embeddings?',
        topicId: 'rag-architecture',
        phaseId: 'knowledge-rag',
        skipIfYes: ['rag-architecture', 'vector-dbs'],
        estimatedHoursSaved: 80
      },
      {
        id: 'knows-agents',
        question: 'Have you built AI agents with tool use and memory using LangChain or similar?',
        topicId: 'what-is-agent',
        phaseId: 'agentic-core',
        skipIfYes: ['what-is-agent', 'agent-components', 'function-calling', 'api-integrations', 'memory-types'],
        estimatedHoursSaved: 150
      }
    ],
    softSkills: [
      'Stay Curious',
      'Experiment Continuously',
      'Think in Systems',
      'Build in Public',
      'Focus on Impact',
      'Collaborate & Community',
      'Ethical & Responsible AI'
    ],
    relatedTools: ['codePlayground', 'codeExplainer', 'documentSummarizer', 'askAuthor'],
    meta: {
      keywords: 'agentic ai developer roadmap 2026, ai agents, autonomous agents, langchain, crewai, multi-agent systems',
      ogImage: '/images/roadmaps/agenticai-developer.png'
    }
  }
];

export function getRoadmapBySlug(slug) {
  return ROADMAPS.find(r => r.slug === slug) || null;
}

export function getAllRoadmapSlugs() {
  return ROADMAPS.map(r => r.slug);
}

export function getTopicById(roadmap, topicId) {
  for (const phase of roadmap.phases) {
    const topic = phase.topics.find(t => t.id === topicId);
    if (topic) return { ...topic, phaseId: phase.phaseId, phaseTitle: phase.title, phaseIcon: phase.icon };
  }
  return null;
}

export function getAllTopicIds(roadmap) {
  const ids = [];
  for (const phase of roadmap.phases) {
    for (const topic of phase.topics) {
      ids.push(topic.id);
    }
  }
  return ids;
}
