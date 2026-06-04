// src/data/roadmaps/data-analyst.js

export const dataAnalystRoadmap = {
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
};
