// src/data/roadmaps/devops-engineer.js

export const devopsEngineerRoadmap = {
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
};
