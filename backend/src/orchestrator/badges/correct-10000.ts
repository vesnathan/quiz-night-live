import type { BadgeDefinition } from './types';

/**
 * Quiz Legend Badge
 * Awarded when a player answers 10000 questions correctly (lifetime)
 */
const badge: BadgeDefinition = {
  id: 'correct_10000',
  name: 'Quiz Legend',
  description: 'Answer 10000 questions correctly',
  icon: '👑',
  checkCondition: (stats) => stats.totalCorrect >= 10000,
};

export default badge;
