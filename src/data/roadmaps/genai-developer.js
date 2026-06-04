// src/data/roadmaps/genai-developer.js

export const genaiDeveloperRoadmap = {
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
};
