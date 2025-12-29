import type { BadgeDefinition } from './types';

/**
 * Hot Streak Badge
 * Awarded when a player answers 10 questions correctly in a row
 */
const badge: BadgeDefinition = {
  id: 'streak_10_correct',
  name: 'Hot Streak',
  description: 'Answer 10 questions correctly in a row',
  icon: '🔥',
  checkCondition: (stats) => stats.currentStreak >= 10,
};

export default badge;
