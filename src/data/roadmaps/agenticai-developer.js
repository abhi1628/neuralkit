// src/data/roadmaps/agenticai-developer.js

export const agenticaiDeveloperRoadmap = {
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
};
