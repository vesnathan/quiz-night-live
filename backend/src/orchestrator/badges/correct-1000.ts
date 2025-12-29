import type { BadgeDefinition } from './types';

/**
 * Knowledge Master Badge
 * Awarded when a player answers 1000 questions correctly (lifetime)
 */
const badge: BadgeDefinition = {
  id: 'correct_1000',
  name: 'Knowledge Master',
  description: 'Answer 1000 questions correctly',
  icon: '🎓',
  checkCondition: (stats) => stats.totalCorrect >= 1000,
};

export default badge;
