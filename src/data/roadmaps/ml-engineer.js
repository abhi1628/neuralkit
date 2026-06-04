// src/data/roadmaps/ml-engineer.js

export const mlEngineerRoadmap = {
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
};
