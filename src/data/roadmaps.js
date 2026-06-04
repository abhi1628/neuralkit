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
        topics: [
          'Mathematics & Statistics — Basic Math, Descriptive Stats, Probability Basics',
          'Excel Fundamentals — Formulas, Data Formatting, Charts, Pivot Tables',
          'Excel Advanced — VLOOKUP/XLOOKUP, Power Query, What-If Analysis'
        ],
        resources: []
      },
      {
        title: 'Phase 2: Data & Tools',
        icon: '🛠️',
        topics: [
          'SQL Fundamentals — SELECT, WHERE, JOIN, GROUP BY, Aggregations',
          'SQL Advanced — Window Functions, CTEs, Subqueries, Performance Tips',
          'Python for Analysts — Pandas, NumPy, Jupyter Notebook'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: Data Handling & Preparation',
        icon: '🧹',
        topics: [
          'Data Collection — APIs, CSV, Web Scraping',
          'Data Cleaning — Missing Values, Duplicates, Outliers',
          'Data Transformation — Types, Formats, Merge & Append',
          'Data Quality Checks'
        ],
        resources: []
      },
      {
        title: 'Phase 4: Exploratory Data Analysis (EDA)',
        icon: '🔍',
        topics: [
          'Univariate Analysis — Distributions, Central Tendency',
          'Bivariate Analysis — Correlation, Cross-tabs',
          'Trend Analysis — Time Series Patterns',
          'Outlier Detection — Statistical Methods'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Data Visualization',
        icon: '📊',
        topics: [
          'Visualization Principles — Choosing the Right Chart',
          'Dashboards & Reports — Interactive Elements',
          'Storytelling with Data — Narrative Structure',
          'Tools: Excel, Power BI, Tableau'
        ],
        resources: []
      },
      {
        title: 'Phase 6: Business Analysis & Insights',
        icon: '💼',
        topics: [
          'KPIs & Metrics — Defining Success',
          'Business Intelligence Basics — OLAP, Data Warehousing',
          'Problem Framing — Root Cause Analysis',
          'A/B Testing Basics — Experiment Design',
          'Data-Driven Decision Making'
        ],
        resources: []
      },
      {
        title: 'Phase 7: Advanced Topics',
        icon: '🚀',
        topics: [
          'Data Modelling — Star Schema, Fact/Dimension Tables',
          'Domain Knowledge — Finance, Sales, Marketing, Healthcare',
          'Reporting & Dashboards — Professional Delivery',
          'Communication — Stakeholder Management, Presenting Insights'
        ],
        resources: []
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
        topics: [
          'OS & Networking — Linux Fundamentals, Shell Scripting, TCP/IP, DNS, HTTP/HTTPS',
          'Computer Science Basics — Data Structures, Algorithms, How the Internet Works'
        ],
        resources: []
      },
      {
        title: 'Phase 2: System Administration',
        icon: '🖥️',
        topics: [
          'Linux Administration — User Management, Process Management, Logs',
          'Package Management — apt, yum, brew',
          'Monitoring Basics — top, htop, vmstat, iostat'
        ],
        resources: []
      },
      {
        title: 'Phase 3: Development & Scripting',
        icon: '💻',
        topics: [
          'Python / Bash Scripting — Automation, Regex',
          'Git Essentials — Branching, Merging, Pull Requests, Code Review'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 4: Version Control & CI Basics',
        icon: '🔀',
        topics: [
          'Git Advanced — Rebase, Cherry-pick, Stash, Submodules',
          'CI/CD Basics — Jenkins, GitHub Actions, GitLab CI'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Infrastructure as Code',
        icon: '🏗️',
        topics: [
          'IaC Tools — Terraform, Ansible, Packer',
          'Key Concepts — Idempotency, State Management, Modules'
        ],
        resources: []
      },
      {
        title: 'Phase 6: Containers & Virtualization',
        icon: '🐳',
        topics: [
          'Docker — Dockerfile, Compose, Multi-stage Builds',
          'Container Concepts — Images, Volumes, Networks, Registry'
        ],
        resources: []
      },
      {
        title: 'Phase 7: Orchestration',
        icon: '☸️',
        topics: [
          'Kubernetes — Architecture, Pods, Deployments, Services',
          'Helm — Charts, Package Management',
          'Service Mesh — Istio Basics'
        ],
        resources: []
      },
      {
        title: 'Phase 8: Cloud Platforms',
        icon: '☁️',
        topics: [
          'AWS Core — EC2, S3, IAM, VPC, RDS, Route53',
          'Azure / GCP Basics — Core Services, IAM, Networking'
        ],
        resources: []
      },
      {
        title: 'Phase 9: Monitoring & Security',
        icon: '🔒',
        topics: [
          'Monitoring — Prometheus, Grafana, Alertmanager',
          'Logging — ELK Stack, Loki',
          'Security — IAM Best Practices, Secrets Management, Container Security'
        ],
        resources: []
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
        topics: [
          'Python Basics — Syntax, Variables, Data Types, Operators',
          'Control Flow — Conditionals, Loops, Functions',
          'Input/Output, Type Conversion, Scope & Namespace'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 2: Core Python',
        icon: '🎯',
        topics: [
          'Strings, Lists, Tuples, Sets, Dictionaries',
          'List Comprehensions, Enumerate, Zip, Map, Filter, Lambda',
          'Modules & Packages, Standard Library (os, sys, datetime, random, collections)'
        ],
        resources: []
      },
      {
        title: 'Phase 3: OOP in Python',
        icon: '🏗️',
        topics: [
          'Classes & Objects, Constructor (__init__), Inheritance',
          'Polymorphism, Encapsulation, Abstraction',
          'Magic Methods, Properties & Decorators'
        ],
        resources: []
      },
      {
        title: 'Phase 4: Advanced Python',
        icon: '⚡',
        topics: [
          'Decorators, Generators, Iterators, Context Managers',
          'Exception Handling, File Handling, Regular Expressions',
          'Typing (Type Hints), Advanced Modules & Packages'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Data Structures & Algorithms',
        icon: '🧮',
        topics: [
          'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs',
          'Searching & Sorting Algorithms, Time & Space Complexity',
          'Practice: LeetCode, HackerRank, Codeforces'
        ],
        resources: [
          { name: 'ZeroAPI MCQ Generator', url: '/#tools' }
        ]
      },
      {
        title: 'Phase 6: Web Development with Python',
        icon: '🌐',
        topics: [
          'Web Fundamentals — HTTP, HTML, CSS, JavaScript Basics',
          'Django Framework — MVC, ORM, REST API, Authentication',
          'APIs Development — DRF, Serializers, ViewSets, Postman'
        ],
        resources: []
      },
      {
        title: 'Phase 7: Databases & Deployment',
        icon: '🗄️',
        topics: [
          'SQL Basics — SQLite, PostgreSQL, MySQL',
          'CRUD, Joins, Relationships, Migrations, Indexing',
          'Deployment — Docker, Nginx, Gunicorn, AWS/Heroku/Render'
        ],
        resources: []
      },
      {
        title: 'Phase 8: Professional Development',
        icon: '⭐',
        topics: [
          'Version Control — Git, GitHub, GitLab',
          'Code Quality — PEP 8, Linters, Formatters, Type Hints',
          'Testing — Unit Testing, pytest, Code Coverage',
          'Soft Skills — Problem Solving, Communication, Team Collaboration'
        ],
        resources: []
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
        topics: [
          'Mathematics — Linear Algebra, Probability, Calculus, Information Theory',
          'Programming — Python Fundamentals, Data Structures, Algorithms, Git & GitHub',
          'Core CS — Operating Systems, Computer Networks'
        ],
        resources: []
      },
      {
        title: 'Phase 2: Python & Data Skills',
        icon: '🐍',
        topics: [
          'Advanced Python — OOP, Decorators, Generators, Virtual Environments',
          'Data Handling — NumPy, Pandas, Data Cleaning, EDA, SQL Basics',
          'Useful Libraries — typing, dataclasses, pathlib'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: Machine Learning Foundation',
        icon: '🤖',
        topics: [
          'Supervised & Unsupervised Learning',
          'Feature Engineering, Model Evaluation, Cross Validation',
          'Scikit-learn Workflow',
          'Why: Strong ML basics help you understand LLMs and build better apps'
        ],
        resources: []
      },
      {
        title: 'Phase 4: Deep Learning Fundamentals',
        icon: '🧠',
        topics: [
          'Neural Networks (DNN), CNNs, RNNs / LSTMs',
          'Backpropagation, Optimization (Adam, SGD), Regularization',
          'Frameworks: PyTorch / TensorFlow'
        ],
        resources: []
      },
      {
        title: 'Phase 5: LLM Fundamentals',
        icon: '💬',
        topics: [
          'What is an LLM?, Tokenization, Embeddings',
          'Attention Mechanism, Transformers Architecture',
          'Positional Encoding, Pre-training vs Fine-tuning, Inference'
        ],
        resources: []
      },
      {
        title: 'Phase 6: Prompt Engineering',
        icon: '🎯',
        topics: [
          'Prompting Basics, Zero-shot, One-shot, Few-shot',
          'Chain-of-Thought (CoT), Role Prompting, Prompt Templates',
          'Prompt Evaluation, Advanced Techniques (Self-consistency, ReAct)'
        ],
        resources: []
      },
      {
        title: 'Phase 7: RAG (Retrieval Augmented Generation)',
        icon: '🔍',
        topics: [
          'Why RAG?, Embeddings & Vector Representations',
          'Vector Databases (FAISS, Chroma, Pinecone, Weaviate)',
          'Similarity Search, Building RAG Pipeline, Reranking',
          'Evaluation (RAGAS, TruLens)'
        ],
        resources: []
      },
      {
        title: 'Phase 8: Fine-Tuning & Adaptation',
        icon: '⚙️',
        topics: [
          'Full Fine-tuning, Parameter-Efficient Fine-tuning (PEFT) — LoRA, QLoRA',
          'Adapters, Instruction Tuning, Domain Adaptation',
          'Data Preparation, Evaluation'
        ],
        resources: []
      },
      {
        title: 'Phase 9: Agents & Tool Use',
        icon: '🤖',
        topics: [
          'What are AI Agents?, ReAct Framework',
          'Tool Use / Function Calling, Planning & Reasoning',
          'Memory in Agents, Multi-step Workflows, AutoGPT / BabyAGI Concepts'
        ],
        resources: []
      },
      {
        title: 'Phase 10: Generative AI Applications',
        icon: '🚀',
        topics: [
          'Text Generation, Summarization, Question Answering, Code Generation',
          'Image Generation (Diffusion Models Basics)',
          'Multimodal Models (Text + Image + Audio)'
        ],
        resources: []
      },
      {
        title: 'Phase 11: Deployment & MLOps for LLMs',
        icon: '🏭',
        topics: [
          'Model Serving (APIs), FastAPI / Flask',
          'vLLM / TGI / Hugging Face, LangChain Deploy',
          'Monitoring & Logging, Tracing (LangSmith, OpenTelemetry)',
          'Cost Optimization'
        ],
        resources: []
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
        topics: [
          'Math & CS Basics — Linear Algebra, Probability, Discrete Math, Algorithms',
          'Programming Essentials — Python Advanced, Data Structures, OOP, Async, Decorators',
          'Typing, Pydantic, Git & GitHub'
        ],
        resources: []
      },
      {
        title: 'Phase 2: Python & Data Engineering Basics',
        icon: '🐍',
        topics: [
          'Python for AI — NumPy, Pandas, Polars, APIs & JSON, AsyncIO',
          'Data Engineering Basics — ETL, Data Cleaning, SQL Advanced, Vector Databases Intro'
        ],
        resources: [
          { name: 'ZeroAPI Code Playground', url: '/#playground' }
        ]
      },
      {
        title: 'Phase 3: LLM & Gen AI Fundamentals',
        icon: '💬',
        topics: [
          'How LLMs Work?, Tokenization, Embeddings, Attention (High-level)',
          'Fine-tuning vs Prompting, Model Evaluation Basics',
          'OpenAI / Claude / Gemini APIs'
        ],
        resources: []
      },
      {
        title: 'Phase 4: Prompt Engineering Mastery',
        icon: '🎯',
        topics: [
          'Prompt Design Principles, Zero-shot, Few-shot, CoT, ReAct',
          'Structured Output, Prompt Templates, Guardrails in Prompts',
          'Prompt Evaluation & Optimization'
        ],
        resources: []
      },
      {
        title: 'Phase 5: Agentic AI Core Concepts',
        icon: '🤖',
        topics: [
          'What is an AI Agent?, Agent Types & Architectures',
          'Autonomy, Memory, Tools, Planning, Reasoning, Reflection',
          'Multi-agent Systems, Human-in-the-Loop'
        ],
        resources: []
      },
      {
        title: 'Phase 6: Tools & Function Calling',
        icon: '🔧',
        topics: [
          'Function Calling / Tool Calling, JSON Schema',
          'API Integrations, Third-party Tools, Code Interpreter',
          'Sandboxes & Safety'
        ],
        resources: []
      },
      {
        title: 'Phase 7: Memory Systems',
        icon: '🧠',
        topics: [
          'Types of Memory — Short-term, Long-term, Episodic, Semantic',
          'Conversation Memory, Vector Store Memory, RAG + Memory',
          'Memory Management Strategies'
        ],
        resources: []
      },
      {
        title: 'Phase 8: Knowledge & RAG',
        icon: '🔍',
        topics: [
          'RAG Architecture, Chunking Strategies, Embeddings Models',
          'Vector DBs (Pinecone, Weaviate, Qdrant, Chroma), Hybrid Search, Re-ranking'
        ],
        resources: []
      },
      {
        title: 'Phase 9: Planning & Reasoning',
        icon: '📋',
        topics: [
          'Task Decomposition, Planning Algorithms (ReAct, Plan-and-Execute)',
          'Tree of Thoughts, Self-Reflection, Critic / Evaluator Models'
        ],
        resources: []
      },
      {
        title: 'Phase 10: Agent Frameworks',
        icon: '🏗️',
        topics: [
          'LangChain, LlamaIndex, CrewAI, AutoGen, Semantic Kernel, LangGraph, Haystack Agents'
        ],
        resources: []
      },
      {
        title: 'Phase 11: Multi-Agent Systems',
        icon: '👥',
        topics: [
          'Agent Communication Patterns, Supervisor / Worker',
          'Debate / Collaboration, Swarm / Marketplace, Coordination & Orchestration'
        ],
        resources: []
      },
      {
        title: 'Phase 12: Evaluation & Guardrails',
        icon: '🛡️',
        topics: [
          'Agent Evaluation Metrics, Hallucination Detection',
          'Safety & Alignment, Content Moderation, PII Redaction',
          'Guardrails with RAGs / Guardrails AI'
        ],
        resources: []
      },
      {
        title: 'Phase 13: Build, Deploy & Operate',
        icon: '🚀',
        topics: [
          'Building Agents — Create, Add Tools, Memory, RAG, Planning, Guardrails',
          'Deployment — API with FastAPI, Dockerize, Cloud Deploy (AWS/GCP/Azure)',
          'Monitoring & Observability, Security & Compliance, Scaling Agents'
        ],
        resources: []
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
