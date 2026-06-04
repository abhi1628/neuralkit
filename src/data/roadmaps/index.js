// src/data/roadmaps/index.js

import { dataScientistRoadmap } from './data-scientist';
import { mlEngineerRoadmap } from './ml-engineer';
import { dataAnalystRoadmap } from './data-analyst';
import { devopsEngineerRoadmap } from './devops-engineer';
import { pythonDeveloperRoadmap } from './python-developer';
import { genaiDeveloperRoadmap } from './genai-developer';
import { agenticaiDeveloperRoadmap } from './agenticai-developer';

export const ROADMAPS = [
  dataScientistRoadmap,
  mlEngineerRoadmap,
  dataAnalystRoadmap,
  devopsEngineerRoadmap,
  pythonDeveloperRoadmap,
  genaiDeveloperRoadmap,
  agenticaiDeveloperRoadmap,
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
