// src/data/roadmaps/python-developer.js

export const pythonDeveloperRoadmap = {
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
};
