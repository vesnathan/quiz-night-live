import type { BadgeDefinition } from './types';

/**
 * Century Badge
 * Awarded when a player answers 100 questions correctly (lifetime)
 */
const badge: BadgeDefinition = {
  id: 'correct_100',
  name: 'Century',
  description: 'Answer 100 questions correctly',
  icon: '💯',
  checkCondition: (stats) => stats.totalCorrect >= 100,
};

export default badge;
