// src/data/roadmaps.js
// All roadmap content — theory, phases, images, metadata

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
        topics: [
          'Linear Algebra — Vectors, Matrices, Eigenvectors, Eigenvalues',
          'Probability — Bayes Theorem, Conditional Probability, Distributions',
          'Statistics — Hypothesis Testing, Confidence Intervals, ANOVA, Regression',
          'Calculus — Derivatives, Gradients, Chain Rule, Optimization'
        ],
        resources: [
          { name: '3Blue1Brown — Essence of Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
          { name: 'StatQuest — Statistics Fundamentals', url: 'https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUgYUn' }
        ]
      },
      {
        title: 'Phase 2: Python Ecosystem',
        icon: '🐍',
        topics: [
          'Python Fundamentals — Syntax, Functions, OOP, File I/O',
          'NumPy — Arrays, Broadcasting, Vectorization',
          'Pandas — DataFrames, GroupBy, Merge, Time Series',
          'Data Structures — Lists, Dicts, Sets, Tuples, Comprehensions',
          'Algorithms — Sorting, Searching, Big O Notation',
          'Git & GitHub — Version Control, Branching, Pull Requests'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' },
          { name: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }
        ]
      },
      {
        title: 'Phase 3: SQL & Databases',
        icon: '🗄️',
        topics: [
          'SQL Fundamentals — SELECT, WHERE, JOIN, GROUP BY, HAVING',
          'Window Functions — ROW_NUMBER, RANK, LAG, LEAD',
          'CTEs & Subqueries — Recursive CTEs, Nested Queries',
          'Database Design — Normalization, Indexing, Constraints',
          'NoSQL Basics — MongoDB, Redis use cases'
        ],
        resources: [
          { name: 'SQLBolt — Interactive SQL Tutorial', url: 'https://sqlbolt.com/' }
        ]
      },
      {
        title: 'Phase 4: Data Wrangling & EDA',
        icon: '🔍',
        topics: [
          'Data Collection — APIs, Web Scraping, SQL Extraction',
          'Data Cleaning — Missing Values, Outliers, Duplicates',
          'Feature Engineering — Encoding, Scaling, Binning, Interaction Terms',
          'Exploratory Analysis — Univariate, Bivariate, Multivariate',
          'Visualization — Matplotlib, Seaborn, Plotly, Tableau basics'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Machine Learning (Core)',
        icon: '🤖',
        topics: [
          'Supervised Learning — Linear/Logistic Regression, SVM, KNN, Naive Bayes',
          'Tree-Based Methods — Decision Trees, Random Forest, XGBoost, LightGBM',
          'Unsupervised Learning — K-Means, Hierarchical, DBSCAN, PCA',
          'Model Evaluation — Cross-Validation, Precision/Recall, ROC-AUC, F1',
          'Bias-Variance Tradeoff — Overfitting, Underfitting, Regularization'
        ],
        resources: [
          { name: 'ZeroAPI MCQ Generator', url: '/#tools' }
        ]
      },
      {
        title: 'Phase 6: Deep Learning',
        icon: '🧠',
        topics: [
          'Neural Networks — Perceptron, Backpropagation, Activation Functions',
          'CNNs — Convolution, Pooling, Transfer Learning (ResNet, EfficientNet)',
          'RNNs & LSTMs — Sequence Modeling, Time Series Forecasting',
          'Transformers — Attention Mechanism, BERT, GPT Architecture',
          'Frameworks — PyTorch, TensorFlow/Keras basics'
        ],
        resources: []
      },
      {
        title: 'Phase 7: Generative AI & LLMs',
        icon: '✨',
        topics: [
          'Large Language Models — GPT, Claude, Llama architecture',
          'Prompt Engineering — Zero-shot, Few-shot, Chain-of-Thought',
          'RAG Systems — Vector DBs (Chroma, Pinecone), Embedding Models',
          'Fine-Tuning — LoRA, QLoRA, Full Fine-Tuning',
          'AI Agents — Tool Use, Planning, Memory (LangChain, CrewAI)'
        ],
        resources: [
          { name: 'ZeroAPI Ask Author — Prof. Abhishek Singh', url: '/#about' }
        ]
      },
      {
        title: 'Phase 8: MLOps & Deployment',
        icon: '🚀',
        topics: [
          'Experiment Tracking — MLflow, Weights & Biases',
          'Model Versioning — DVC, Git LFS',
          'Containerization — Docker, Kubernetes basics',
          'CI/CD for ML — GitHub Actions, Pre-commit Hooks',
          'Monitoring — Drift Detection, Performance Degradation',
          'Cloud Deployment — AWS SageMaker, GCP Vertex AI, Azure ML'
        ],
        resources: []
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
        topics: [
          'Data Structures & Algorithms — Arrays, Trees, Graphs, Dynamic Programming',
          'System Design Basics — Scalability, Latency, Throughput',
          'Python Advanced — Decorators, Generators, Context Managers, Metaclasses',
          'Testing — Unit Tests, Integration Tests, Pytest, Mocking',
          'Code Quality — Linting, Type Hints, Docstrings, Code Review'
        ],
        resources: []
      },
      {
        title: 'Phase 2: Data Engineering',
        icon: '🔧',
        topics: [
          'ETL Pipelines — Apache Airflow, Prefect, Dagster',
          'Stream Processing — Apache Kafka, Spark Streaming, Flink',
          'Data Warehousing — Snowflake, BigQuery, Redshift',
          'Data Lakes — Delta Lake, Apache Iceberg, Hudi',
          'Feature Stores — Feast, Tecton'
        ],
        resources: []
      },
      {
        title: 'Phase 3: ML Fundamentals',
        icon: '📈',
        topics: [
          'Classical ML — Same as Data Scientist Phase 5',
          'Deep Learning — CNN, RNN, Transformer basics',
          'Reinforcement Learning — Q-Learning, Policy Gradients',
          'Probabilistic ML — Bayesian Methods, Gaussian Processes'
        ],
        resources: []
      },
      {
        title: 'Phase 4: MLOps & Production',
        icon: '🏭',
        topics: [
          'Model Serving — REST APIs, gRPC, Batch vs Real-time',
          'Scaling — Kubernetes, Auto-scaling, Load Balancing',
          'A/B Testing — Experimentation Frameworks, Statistical Power',
          'Feature Pipelines — Online/Offline Consistency',
          'Model Registry — MLflow Model Registry, Databricks'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Advanced Systems',
        icon: '🏗️',
        topics: [
          'Distributed Training — Horovod, DeepSpeed, FSDP',
          'Model Optimization — Quantization, Pruning, Distillation',
          'Edge Deployment — ONNX, TensorRT, Core ML',
          'LLM Serving — vLLM, TGI, OpenAI-compatible APIs',
          'Multi-modal Systems — Vision-Language, Audio Processing'
        ],
        resources: []
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
  }
];

export function getRoadmapBySlug(slug) {
  return ROADMAPS.find(r => r.slug === slug) || null;
}

export function getAllRoadmapSlugs() {
  return ROADMAPS.map(r => r.slug);
}
